"use strict";
const { Biometric } = require("../models/index");
const {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");
const base64url = require("base64url");
const { RP_ID, ORIGIN } = require("../config/serverConfig");
const { Op } = require("sequelize");

class BiometricRepository {

  async create(data) {
    try {
      const biometric = await Biometric.create(data);
      return biometric;
    } catch (error) {
      console.log("Something wrong at biometric repository layer");
      throw error;
    }
  }

  async getByUserId(userId) {
    try {
      const biometrics = await Biometric.findAll({
        where: {
          userId,
          credentialID: {
            [Op.ne]: null,
          },
        },
        attributes: ["credentialID", "transports"],
      });
  
      return biometrics.length ? biometrics : [];
    } catch (error) {
      console.error("Error fetching biometric credentials:", error);
      return [];
    }
  }
  

  async getCredential(credentialID) {
    try {
      
      // No need to convert to string since it's already stored as TEXT
      const credential = await Biometric.findOne({
        where: { credentialID },
      });
      
      if (credential) {
        console.log("Found credential:", {
          id: credential.id,
          credentialID: credential.credentialID ? credential.credentialID.slice(0, 10) + '...' : null,
          credentialIDLength: credential.credentialID ? credential.credentialID.length : 0,
          publicKeyLength: credential.credentialPublicKey ? credential.credentialPublicKey.length : 0,
          counter: credential.counter,
          counterType: typeof credential.counter
        });
        
        // Map the credentialPublicKey field to publicKey for compatibility with the service
        const mappedCredential = credential.toJSON();
        mappedCredential.publicKey = mappedCredential.credentialPublicKey;
        
        // Ensure counter is a number
        if (mappedCredential.counter === null || mappedCredential.counter === undefined) {
          mappedCredential.counter = 0;
        } else if (typeof mappedCredential.counter !== 'number') {
          mappedCredential.counter = parseInt(mappedCredential.counter, 10);
          if (isNaN(mappedCredential.counter)) {
            mappedCredential.counter = 0;
          }
        }
        
        return mappedCredential;
      } else {
        console.log("No credential found with ID:", credentialID.slice(0, 10) + '...');
      }
      
      return credential;
    } catch (error) {
      console.error("Error in getCredential:", error);
      throw error;
    }
  }

  async saveChallenge2(userId, challenge) {
    try {
      await Biometric.update(
        { challenge },
        { where: { userId } }
      );
    } catch (error) {
      console.log("Something wrong at biometric repository layer");
      throw error;
    }
  }

  async saveChallenge(userId, challenge) {

    console.log("userId, challenge", userId, challenge)
    try {
      // Use upsert to either create or update the challenge
      const [biometric, created] = await Biometric.upsert(
        {
          userId,
          challenge,
          // Include required fields with defaults
          biometricType: "webauthn",
          counter: 0,
          credentialID: null, // Will be set during finishEnrollment
          credentialPublicKey: null,
          transports: ["internal"],
        },
        {
          returning: true,
        }
      );

      return biometric;
    } catch (error) {
      console.error("Error saving challenge:", error);
      throw new Error(`Failed to save challenge: ${error.message}`);
    }
  }

  async getChallenge(userId) {
    try {
      const biometric = await Biometric.findOne({
        where: {
          userId,
          challenge: { [Op.not]: null },
        },
        order: [['createdAt', 'DESC']],
      });
  
      if (!biometric) {
        throw new Error('No pending challenge found');
      }
  
      return biometric.challenge;
    } catch (error) {
      console.error('Error in getChallenge:', error);
      throw error;
    }
  }
  

  async clearChallenge(userId) {
    try {
      await Biometric.update({ challenge: null }, { where: { userId } });
    } catch (error) {
      console.log("Something wrong at biometric repository layer");
      throw error;
    }
  }

  async cleanupExpiredChallenges(userId) {
    // Clean up any temporary records older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    await Biometric.destroy({
        where: {
            userId,
            credentialID: 'temp',
            createdAt: { [Op.lt]: fiveMinutesAgo }
        }
    });
}

  async updateCredentialCounter(id, counter) {
    try {
      await Biometric.update(
        { counter, lastUsedAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      console.log("Something wrong at biometric repository layer");
      throw error;
    }
  }

  async verify(userId, authenticationResponse, expectedChallenge) {
    try {
      const biometrics = await this.getByUserId(userId);
      if (!biometrics || biometrics.length === 0) {
        throw new Error("No biometrics enrolled");
      }

      const expectedOrigin = ORIGIN;
      const expectedRPID = RP_ID;

      let verified = false;

      for (const bio of biometrics) {
        try {
          // Convert credentialID and credentialPublicKey to Buffer only when needed for verification
          const verification = await verifyAuthenticationResponse({
            response: authenticationResponse,
            expectedChallenge,
            expectedOrigin,
            expectedRPID,
            requireUserVerification: false,
            authenticator: {
              credentialID: Buffer.from(bio.credentialID, 'base64url'),
              credentialPublicKey: Buffer.from(bio.credentialPublicKey, 'base64url'),
              counter: bio.counter,
              transports: bio.transports || [],
            },
          });

          if (verification.verified) {
            await this.updateCredentialCounter(
              bio.id,
              verification.authenticationInfo.newCounter
            );
            verified = true;
            break;
          }
        } catch (err) {
          console.error("Verification error for a credential:", err.message);
          continue;
        }
      }

      return verified;
    } catch (error) {
      console.error("Biometric verification failed:", error.message);
      throw error;
    }
  }

  async delete(biometricId) {
    try {
      await Biometric.destroy({
        where: { id: biometricId },
      });
      return true;
    } catch (error) {
      console.log("Something wrong at biometric repository layer");
      throw error;
    }
  }

  async saveCredential(credential) {
    try {
      console.log("Saving credential:", {
        userId: credential.userId,
        credentialID: credential.credentialID ? credential.credentialID.slice(0, 10) + '...' : null,
        credentialIDLength: credential.credentialID ? credential.credentialID.length : 0,
        publicKey: credential.publicKey ? credential.publicKey.slice(0, 10) + '...' : null,
        publicKeyLength: credential.publicKey ? credential.publicKey.length : 0,
        counter: credential.counter
      });

      // Find the existing record for this user that was created during the start phase
      const existingBiometric = await Biometric.findOne({
        where: { 
          userId: credential.userId,
          challenge: { [Op.not]: null } // Find the record with a challenge (created during enrollment)
        },
        order: [['createdAt', 'DESC']] // Get the most recent one
      });

      if (existingBiometric) {
        // Update the existing record with credential information
        await existingBiometric.update({
          credentialID: credential.credentialID,
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          challenge: null, // Clear the challenge as enrollment is complete
          lastUsedAt: new Date(),
          deviceInfo: credential.deviceInfo || null,
          transports: credential.transports || ["internal"]
        });
        
        return existingBiometric;
      } else {
        // Fallback to creating a new record if no existing record found
        const biometric = await Biometric.create({
          userId: credential.userId,
          credentialID: credential.credentialID,
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          biometricType: "webauthn",
          transports: credential.transports || ["internal"],
          deviceInfo: credential.deviceInfo || null
        });

        return biometric;
      }
    } catch (error) {
      console.error("Error saving credential:", error);
      throw new Error(`Failed to save credential: ${error.message}`);
    }
  }
}

module.exports = BiometricRepository;
