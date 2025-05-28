"use strict";
const BiometricRepository = require("../repository/biomatric-repository");
const UserRepository = require("../repository/user-repository");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const { RP_ID, RP_NAME, ORIGIN } = require("../config/serverConfig");
const { AuthFactor } = require("../utils/constants");
const base64url = require("base64url");
const { Buffer } = require("buffer");

class BiometricService {
  constructor() {
    this.bioRepo = new BiometricRepository();
    this.userRepo = new UserRepository();
  }

  async startEnrollment(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const user = await this.userRepo.getByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const existingCredentials =
        (await this.bioRepo.getByUserId(user.id)) || [];

      // Validate credentials before processing
      const validCredentials = existingCredentials.filter((cred) => {
        if (!cred.credentialID) return false;
        if (!cred.credentialID.match(/^[a-zA-Z0-9_-]+$/)) {
          console.warn("Invalid credentialID format:", cred.credentialID);
          return false;
        }
        return true;
      });

      // Convert credentialIDs to Buffers for excludeCredentials - SIMPLIFIED APPROACH
      const excludeCredentials = validCredentials
        .map((cred) => {
          try {
            // Skip any credentials with invalid IDs
            if (!cred.credentialID || typeof cred.credentialID !== "string") {
              console.warn("Invalid credentialID:", cred.credentialID);
              return null;
            }

            // Create a simple object with the credential ID as a string
            return {
              id: cred.credentialID,
              type: "public-key",
              transports: cred.transports || ["internal"],
            };
          } catch (error) {
            console.error("Error processing credential:", error);
            return null;
          }
        })
        .filter(Boolean);

      // Generate registration options
      const options = await generateRegistrationOptions({
        rpName: RP_NAME || "My WebAuthn App",
        rpID: RP_ID || window.location.hostname,
        userID: Buffer.from(user.id.toString()),
        userName: user.email,
        userDisplayName: user.email,
        attestationType: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          residentKey: "preferred",
          userVerification: "required",
        },
        pubKeyCredParams: [
          {
            alg: -7,
            type: "public-key",
          },
          {
            alg: -257,
            type: "public-key",
          },
        ],
        timeout: 60000,
      });

      // Transform the options to include rp object
      const transformedOptions = {
        ...options,
        rp: {
          name: RP_NAME || "My WebAuthn App",
          id: RP_ID || window.location.hostname,
        },
        user: {
          id: options.user.id,
          name: user.email,
          displayName: user.email,
        },
      };

      // Store the challenge for later verification
      await this.bioRepo.saveChallenge(user.id, options.challenge);

      return transformedOptions;
    } catch (error) {
      console.error("Error in startEnrollment:", error);
      throw new Error(`Failed to start enrollment: ${error.message}`);
    }
  }

  async finishEnrollment(email, attestationResponse) {
    try {
      const user = await this.userRepo.getByEmail(email);
      if (!user) throw new Error("User not found");

      const expectedChallenge = await this.bioRepo.getChallenge(user.id);
      if (!expectedChallenge) throw new Error("No pending challenge found");

      // 3. Validate attestation response
      if (!attestationResponse || !attestationResponse.response) {
        throw new Error("Invalid attestation response format");
      }

      // 4. Prepare the WebAuthn response - UPDATED FOR BROWSER FORMAT
      const webAuthnResponse = {
        id: attestationResponse.id,
        rawId: attestationResponse.rawId, // Already base64url-encoded from client
        type: attestationResponse.type,
        response: {
          attestationObject: attestationResponse.response.attestationObject,
          clientDataJSON: attestationResponse.response.clientDataJSON,
        },
        transports: attestationResponse.transports || ["internal"],
      };

      // 6. Verify registration
      const verification = await verifyRegistrationResponse({
        response: webAuthnResponse,
        expectedChallenge,
        expectedOrigin:
          typeof ORIGIN === "string"
            ? ORIGIN.endsWith("/")
              ? ORIGIN.slice(0, -1)
              : ORIGIN
            : "http://localhost:5173",
        expectedRPID: RP_ID,
        requireUserVerification: false,
      });

      if (!verification.verified) {
        throw new Error("Registration verification failed");
      }

      // 8. Store the credential - UPDATED FOR BROWSER FORMAT
      // The credential ID is now nested inside registrationInfo.credential
      const credentialID = verification.registrationInfo.credential.id;

      const credentialPublicKey =
        verification.registrationInfo.credential.publicKey;
      const counter = verification.registrationInfo.credential.counter;

      // Add null checks for credentialID
      if (!credentialID) {
        throw new Error("Credential ID is missing from verification result");
      }

      // 9. Create the biometric record - UPDATED FOR BROWSER FORMAT
      // The credentialID from verification is already a Buffer, we need to convert it to base64url
      const credentialIDString = base64url.encode(credentialID); // Convert the Buffer to base64url
      const credentialPublicKeyString = base64url.encode(credentialPublicKey);

      // 10. Save the credential using saveCredential method instead of create
      const credential = {
        userId: user.id,
        credentialID: credentialIDString,
        publicKey: credentialPublicKeyString,
        counter: counter,
        deviceInfo: {
          type: verification.registrationInfo.credentialDeviceType,
          backedUp: verification.registrationInfo.credentialBackedUp,
          transports: attestationResponse.response.transports,
          // Add more detailed device information
          browser: attestationResponse.response.clientDataJSON
            ? JSON.parse(
                Buffer.from(
                  attestationResponse.response.clientDataJSON,
                  "base64url"
                ).toString()
              ).platform
            : "unknown",
          isResidentKey: true, // Mark as a resident key (stored in browser)
        },
        transports: attestationResponse.response.transports || ["internal"],
      };

      await this.bioRepo.saveCredential(credential);

      await this.bioRepo.clearChallenge(user.id);

      return { verified: true };
    } catch (error) {
      console.error("Verification failed:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async startVerification(email) {
    const user = await this.userRepo.getByEmail(email);
    if (!user) throw new Error("User not found");

    const credentials = await this.bioRepo.getByUserId(user?.id);
    if (credentials.length === 0) {
      throw new Error("No biometric credentials found");
    }

    // Make sure we're using the credential IDs correctly
    const allowCredentials = credentials.map((cred) => {
      // Log the credential ID for debugging

      // Return the credential in the format expected by generateAuthenticationOptions
      return {
        id: cred.credentialID, // Use the credential ID directly
        type: "public-key",
        transports: cred.transports || ["internal"],
      };
    });

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials,
      userVerification: "discouraged",
      origin: ORIGIN.endsWith("/") ? ORIGIN.slice(0, -1) : ORIGIN,
      requireResidentKey: true,
    });

    await this.userRepo.storeWebAuthnChallenge(
      user?.id,
      options.challenge
    );
    return options;
  }

  async finishVerification(email, assertionResponse) {
    try {
        // 1. Validate inputs
        if (!email || !assertionResponse) {
            throw new Error("Email and assertion response are required");
        }

        // 2. Get user and expected challenge
        const user = await this.userRepo.getByEmail(email);
        if (!user) throw new Error("User not found");

        const expectedChallenge = await this.userRepo.getWebAuthnChallenge(user.id);
        if (!expectedChallenge) throw new Error("No pending challenge found");

        // 3. Get the credential from database
        const credentialId = base64url.encode(assertionResponse.rawId);
        const credential = await this.bioRepo.getCredential(credentialId);
        
        if (!credential) {
            throw new Error("Unknown credential");
        }

        // 4. Validate credential data
        if (!credential.credentialID || !credential.publicKey) {
            throw new Error("Invalid credential data");
        }

        if (
          !assertionResponse?.response ||
          !assertionResponse.response.authenticatorData ||
          !assertionResponse.response.clientDataJSON ||
          !assertionResponse.response.signature
        ) {
          throw new Error("Invalid assertion response structure");
        }
        
        // 6. Verify the authentication response
        const verification = await verifyAuthenticationResponse({
          response: {
            id: assertionResponse.id,
            rawId: assertionResponse.rawId,
            type: assertionResponse.type,
            response: {
              authenticatorData: assertionResponse.response.authenticatorData,
              clientDataJSON: assertionResponse.response.clientDataJSON,
              signature: assertionResponse.response.signature
            }
          },
          expectedChallenge,
          expectedOrigin: ORIGIN,
          expectedRPID: RP_ID,
           
          credential: {
            id: Buffer.from(credential.credentialID, "base64url"),
            publicKey: Buffer.from(credential.publicKey, "base64url"),
            counter: credential.counter || 0
          },
        });

        if (!verification.verified) {
            throw new Error("Authentication failed");
        }

        // 7. Update credential counter
        await this.bioRepo.updateCredentialCounter(
            credential.id,
            verification.authenticationInfo.newCounter
        );

        // 8. Clean up
        await this.userRepo.clearWebAuthnChallenge(user.id);

        return {
            verified: true,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    } catch (error) {
        console.error("Verification failed:", {
            error: error.message,
            stack: error.stack,
            assertionResponse: assertionResponse ? {
                id: assertionResponse.id,
                type: assertionResponse.type,
                rawId: assertionResponse.rawId?.toString(),
            } : null
        });
        throw new Error(`Authentication verification failed: ${error.message}`);
    }
}

  async listBiometrics(userId) {
    return this.bioRepo.getByUserId(userId);
  }

  async revoke(biometricId) {
    return this.bioRepo.delete(biometricId);
  }

  async verifyEnrollment(email, attestationResponse) {
    try {
      if (!email || !attestationResponse) {
        throw new Error("Email and attestation response are required");
      }

      const user = await this.userRepo.getByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const challenge = await this.bioRepo.getChallenge(user.id);
      if (!challenge) {
        throw new Error("No challenge found for user");
      }

      // Log the attestation response for debugging
      console.log("Attestation response:", {
        id: attestationResponse?.id || "undefined",
        rawId: attestationResponse?.rawId || "undefined",
        type: attestationResponse?.type || "undefined",
      });

      // Verify the attestation response
      const verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: challenge,
        expectedOrigin:
          typeof ORIGIN === "string"
            ? ORIGIN.endsWith("/")
              ? ORIGIN.slice(0, -1)
              : ORIGIN
            : "http://localhost:5173",
        expectedRPID: "localhost",
      });

      if (!verification.verified) {
        throw new Error("Attestation verification failed");
      }

      if (
        !verification.registrationInfo ||
        !verification.registrationInfo.credentialID ||
        !verification.registrationInfo.credentialPublicKey
      ) {
        throw new Error("Invalid registration info received from verification");
      }

      if (verification.authenticationInfo.newCounter <= credential.counter) {
        throw new Error("Invalid authenticator counter");
      }

      // Save the credential - ensure proper encoding
      const credential = {
        userId: user.id,
        credentialID: attestationResponse.id, // Use the original ID from the browser
        publicKey: base64url.encode(
          verification.registrationInfo.credentialPublicKey
        ),
        counter: verification.registrationInfo.counter,
        deviceInfo: {
          type: verification.registrationInfo.credentialDeviceType,
          backedUp: verification.registrationInfo.credentialBackedUp,
          isResidentKey: true, // Mark as a resident key (stored in browser)
        },
      };

      if (credential.userId !== user.id) {
        throw new Error("Credential does not belong to user");
      }

      await this.bioRepo.saveCredential(credential);

      // Clear the challenge
      await this.bioRepo.clearChallenge(user.id);

      return { verified: true };
    } catch (error) {
      console.error("Error in verifyEnrollment:", error);
      throw new Error(`Failed to verify enrollment: ${error.message}`);
    } finally {
      await this.userRepo.clearWebAuthnChallenge(user.id);
    }
  }

  async checkBrowserCredentials(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const user = await this.userRepo.getByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const credentials = await this.bioRepo.getByUserId(user.id);

      // Generate authentication options to check if credentials are stored in browser
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: credentials.map((cred) => ({
          id: cred.credentialID,
          type: "public-key",
          transports: cred.transports || ["internal"],
        })),
        userVerification: "discouraged",
        origin: ORIGIN.endsWith("/") ? ORIGIN.slice(0, -1) : ORIGIN,
        requireResidentKey: true,
      });

      return {
        hasCredentials: credentials.length > 0,
        credentialCount: credentials.length,
        credentials: credentials.map((cred) => ({
          id: cred.credentialID
            ? cred.credentialID.substring(0, 10) + "..."
            : null,
          type: cred.biometricType || "webauthn",
          isResidentKey: cred.deviceInfo?.isResidentKey || false,
          browser: cred.deviceInfo?.browser || "unknown",
        })),
      };
    } catch (error) {
      console.error("Error checking browser credentials:", error);
      throw new Error(`Failed to check browser credentials: ${error.message}`);
    }
  }
}

module.exports = BiometricService;
