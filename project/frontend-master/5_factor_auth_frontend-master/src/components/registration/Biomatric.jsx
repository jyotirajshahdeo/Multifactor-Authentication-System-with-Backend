import React, { useState, useRef, useEffect } from "react";
import { storePasskey } from "../../utils/passkeyStorage";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const decodeBase64URLToBuffer = (base64urlStr) => {
  const padding = "=".repeat((4 - (base64urlStr.length % 4)) % 4);
  const base64 = (base64urlStr + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
};

const base64url = {
  encode: (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  },
  decode: (base64url) => {
    const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
    const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
};

const formatOptions = (options) => {
  console.log("Raw options from server:", options);

  const formattedOptions = {
    challenge: decodeBase64URLToBuffer(options.challenge),
    rp: {
      name: options.rp?.name || "My WebAuthn App",
      id: options.rp?.id || window.location.hostname
    },
    user: {
      id: decodeBase64URLToBuffer(options.user.id),
      name: options.user.name || options.user.email || "user",
      displayName: options.user.displayName || options.user.email || "user"
    },
    pubKeyCredParams: [
      {
        alg: -7,
        type: "public-key",
      },
      {
        alg: -257,
        type: "public-key",
      }
    ],
    timeout: 60000,
    attestation: "direct",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: false,
      residentKey: "preferred",
      userVerification: "required"
    }
  };

  console.log("Formatted options:", formattedOptions);
  return formattedOptions;
};

const Biometric = ({ onSuccess, userEmail, formData }) => {
  // const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [biometricData, setBiometricData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [webauthnOptions, setWebauthnOptions] = useState(null);
  // const videoRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const getCameraPermission = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: {
  //           facingMode: "user",
  //           width: { ideal: 1280 },
  //           height: { ideal: 720 },
  //         },
  //       });
  //       setHasCameraPermission(true);
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //       }
  //     } catch (err) {
  //       console.error("Camera error:", err);
  //       setHasCameraPermission(false);
  //       setError("Camera access denied. Please enable camera permissions.");
  //     }
  //   };

  //   getCameraPermission();

  //   return () => {
  //     videoRef.current?.srcObject
  //       ?.getTracks()
  //       ?.forEach((track) => track.stop());
  //   };
  // }, []);

  const startWebAuthnEnrollment = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/biometric/enroll/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const json = await response.json();
      if (!response.ok)
        throw new Error(json.message || "Failed to start WebAuthn enrollment");

      setWebauthnOptions(json.data);
      return json.data;
    } catch (err) {
      console.error("Start enrollment error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollBiometric = async () => {
    // if (!hasCameraPermission) {
    //   setError("Camera access is required for visual verification.");
    //   return;
    // }

    if (typeof PublicKeyCredential === "undefined") {
      setError("WebAuthn is not supported in this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Start enrollment
      const options = await startWebAuthnEnrollment(userEmail);
      if (!options) {
        throw new Error("Failed to get enrollment options");
      }

      // Step 2: Format options
      const formattedOptions = formatOptions(options);
      if (!formattedOptions) {
        throw new Error("Failed to format enrollment options");
      }

      // Step 3: Create credential
      console.log("Creating credential...");
      let credential;
      try {
        credential = await navigator.credentials.create({
          publicKey: formattedOptions,
        });

      } catch (err) {
        console.error("Credential creation error:", err);
        if (err.name === "NotAllowedError") {
          throw new Error("Registration cancelled by user.");
        } else if (err.name === "InvalidStateError") {
          throw new Error("Authenticator already registered.");
        } else {
          throw new Error(`Credential creation failed: ${err.message}`);
        }
      }


      if (!credential) {
        throw new Error("Failed to create credential");
      }

      // Step 4: Prepare attestation response
      const attestationResponse = {
        id: credential.id,
        rawId: base64url.encode(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: base64url.encode(credential.response.attestationObject),
          clientDataJSON: base64url.encode(credential.response.clientDataJSON),
        },
        transports: credential.response.getTransports?.() || ["internal"],
      };

      // Step 5: Call finish enrollment API
      const result = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/biometric/enroll/finish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            attestationResponse,
          }),
        }
      );

      const resultJson = await result.json();

      if (!result.ok) {
        throw new Error(resultJson.message || "Biometric enrollment failed");
      }
      await storePasskey(userEmail, credential);

      setBiometricData(resultJson.data);
      onSuccess?.(resultJson.data);
      
      // Show success toast and navigate to login page
      toast.success("Biomatric Registration completed successfully!");
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      
    } catch (err) {
      let message = err.message;

      if (err.name === "NotAllowedError")
        message = "Registration cancelled by user.";
      if (err.name === "InvalidStateError")
        message = "Authenticator already registered.";

      setError(message || "Failed to complete biometric enrollment.");
      toast.error(message || "Failed to complete biometric enrollment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>

      {/* <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          margin: "0 auto 20px",
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        <video
          ref={videoRef}
          width="100%"
          height="auto"
          style={{ display: "block" }}
          autoPlay
          muted
          playsInline
        />

        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            Processing...
          </div>
        )}
      </div> */}

      {error && (
        <div
          style={{
            padding: 10,
            marginBottom: 20,
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleEnrollBiometric}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          backgroundColor: loading ? "#ccc" : "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Enrolling..." : "Enroll Biometric"}
      </button>
    </div>
  );
};

export default Biometric;
