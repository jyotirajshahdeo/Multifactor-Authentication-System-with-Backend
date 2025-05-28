import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getPasskey, hasPasskey } from "../../utils/passkeyStorage";
import { base64url } from "../../utils/base64url";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Authcontext";

const BiometricLogin = ({ onSuccess, view = true }) => {
  const { authenticate } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStoredPasskey, setHasStoredPasskey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStoredPasskeys = async () => {
      try {
        const storedEmail = localStorage.getItem("lastLoggedInEmail");
        if (storedEmail) {
          const hasKey = await hasPasskey(storedEmail);
          if (hasKey) {
            setEmail(storedEmail);
            setHasStoredPasskey(true);
          }
        }
      } catch (err) {
        console.error("Error checking stored passkeys:", err);
      }
    };
    checkStoredPasskeys();
  }, []);

  const containerStyle = {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: isLoading ? "#a5b4fc" : "#4f46e5",
    color: "white",
    fontWeight: "bold",
    cursor: isLoading ? "not-allowed" : "pointer",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedPasskey = await getPasskey(email);
      if (!storedPasskey) {
        throw new Error(
          "No passkey found for this email. Please register first."
        );
      }

      const startResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/biometric/verify/start`,
        {
          email,
        }
      );

      if (!startResponse.data.success) {
        throw new Error(
          startResponse.data.message || "Failed to start authentication"
        );
      }

      const options = startResponse.data.data;

      const formattedOptions = {
        challenge: base64url.decode(options.challenge),
        rpId: options.rpId || window.location.hostname,
        allowCredentials: [
          {
            id: base64url.decode(storedPasskey.credentialData.rawId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        timeout: 60000,
        userVerification: "discouraged",
      };

      const credential = await navigator.credentials.get({
        publicKey: formattedOptions,
      });

      if (!credential) {
        throw new Error("Failed to get credential from authenticator");
      }

      // Prepare the authentication response
      const authenticationResponse = {
        id: credential.id,
        rawId: base64url.encode(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: base64url.encode(
            credential.response.authenticatorData
          ),
          clientDataJSON: base64url.encode(credential.response.clientDataJSON),
          signature: base64url.encode(credential.response.signature),
        },
      };

      // Send the authentication response to the server
      const finishResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/biometric/verify/finish`,
        {
          email,
          authenticationResponse,
        }
      );

      if (finishResponse.status !== 200) {
        throw new Error(finishResponse.data.message || "Authentication failed");
      }
      // Store the email for future use
      onSuccess();
      localStorage.setItem("lastLoggedInEmail", email);

      authenticate();

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Biometric Login
      </h2>

      <button onClick={handleLogin} disabled={isLoading} style={buttonStyle}>
        {isLoading ? "Authenticating..." : "Login with Biometric"}
      </button>

      {view && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "#4f46e5",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Register New Device
          </button>
        </div>
      )}
    </div>
  );
};

export default BiometricLogin;
