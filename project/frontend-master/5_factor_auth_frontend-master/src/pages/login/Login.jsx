import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BiometricLogin from "../../components/biometric/BiometricLogin";
import { toast } from "react-toastify";
import GesturePattern from "../../components/registration/Gasturepattern";
import Color from "../../components/Color";

const Login = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    pin: "",
    colorSelection: [],
    gesturePattern: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorSelect = (colors) => {
    console.log("Selected colors:", colors);
    handleChange("colorSelection", colors);
  };

  const handleGesturePattern = (pattern) => {
    console.log("Pattern drawn:", pattern);
    // Ensure pattern is an array
    if (Array.isArray(pattern)) {
      handleChange("gesturePattern", pattern);
    } else {
      console.error("Gesture pattern is not an array:", pattern);
      toast.error("Invalid gesture pattern format");
    }
  };

  const verifyStep = async (stepNumber) => {
    setIsLoading(true);
    setError("");

    try {
      let response;

      switch (stepNumber) {
        case 1:
          response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}//users/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                factorType: "password",
                factorValue: formData.password,
              }),
            }
          );
          break;

        case 2: // PIN verification
          response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}//users/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                factorType: "pin",
                factorValue: formData.pin,
              }),
            }
          );
          break;

        case 3: // Color verification
          response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}//users/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                factorType: "color",
                factorValue: formData.colorSelection,
              }),
            }
          );
          break;

        case 4: // Pattern verification
          response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}//users/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: formData.email,
                factorType: "gesture",
                factorValue: formData.gesturePattern,
              }),
            }
          );

          localStorage.setItem("lastLoggedInEmail", formData.email);

          break;

        default:
          return false;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      return true;
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.message || "Verification failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 5) {
      const isVerified = await verifyStep(step);
      if (isVerified) {
        setStep(step + 1);
        toast.success(`Step ${step} verified successfully!`);
      } else {
        toast.error(`Verification failed for step ${step}`);
      }
    }
  };

  const handleBiometricSuccess = () => {
    toast.success("Login successful!");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
      padding: "20px",
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "auto",
    },
    card: {
      width: "100%",
      maxWidth: "500px",
      margin: "20px auto",
      position: "relative",
      zIndex: 1,
    },
    cardInner: {
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      width: "100%",
    },
    header: {
      backgroundColor: "#4f46e5",
      padding: "20px",
      width: "100%",
    },
    headerTitle: {
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "bold",
      color: "white",
      margin: 0,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    content: {
      padding: "40px",
      width: "100%",
      boxSizing: "border-box",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      width: "100%",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    },
    label: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#374151",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "16px",
      transition: "all 0.15s ease-in-out",
      outline: "none",
      boxSizing: "border-box",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "white",
      color: "#1a1a1a",
    },
    inputFocus: {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: "24px",
      width: "100%",
      gap: "20px",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      fontWeight: "500",
      color: "white",
      backgroundColor: "#4f46e5",
      cursor: "pointer",
      transition: "all 0.15s ease-in-out",
      flex: 1,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      outline: "none",
    },
    buttonHover: {
      backgroundColor: "#4338ca",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "500",
      color: "#111827",
      textAlign: "center",
      marginBottom: "16px",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    errorMessage: {
      color: "#dc2626",
      backgroundColor: "#fee2e2",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardInner}>
          <div style={styles.header}>
            <h2 style={styles.headerTitle}>Login ({step}/5)</h2>
          </div>

          <div style={styles.content}>
            <form style={styles.form} onSubmit={handleSubmit}>
              {/* Step 1: Email and Password */}
              {step === 1 && (
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={styles.input}
                    placeholder="Enter your email"
                  />
                  <label style={styles.label} htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    style={styles.input}
                    placeholder="Enter your password"
                  />
                </div>
              )}

              {/* Step 2: PIN */}
              {step === 2 && (
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="pin">
                    PIN
                  </label>
                  <input
                    id="pin"
                    type="number"
                    required
                    value={formData.pin}
                    onChange={(e) => handleChange("pin", e.target.value)}
                    style={styles.input}
                    placeholder="Enter your PIN"
                  />
                </div>
              )}

              {/* Step 3: Color Selection */}
              {step === 3 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select your Colors</label>
                  <Color onColorSelect={handleColorSelect} />
                </div>
              )}

              {/* Step 4: Pattern */}
              {step === 4 && (
                <div style={styles.formGroup}>
                  <GesturePattern onPatternChange={handleGesturePattern} />
                </div>
              )}

              {/* Step 5: Biometric */}
              {step === 5 && (
                <div style={styles.formGroup}>
                  <h3 style={styles.sectionTitle}>Biometric Verification</h3>
                  <BiometricLogin
                    email={formData.email}
                    onSuccess={handleBiometricSuccess}
                    view={false}
                    
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={styles.buttonContainer}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    style={styles.button}
                  >
                    Previous
                  </button>
                )}
                {step < 5 && (
                  <button
                    type="submit"
                    style={styles.button}
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Next"}
                  </button>
                )}
              </div>

              {/* If not registed register  */}
              <div>
                <p
                  style={{
                    height: "10px",
                    widows: "100%",
                    display: "flex",
                    justifyContent: "center",
                    color: "#000000",
                  }}
                >
                  {"Not yet register?"}
                </p>
                <button style={{
                  width: '100%',
                  marginTop: '5px'
                }} onClick={() => navigate("/register")}>
                  {"Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
