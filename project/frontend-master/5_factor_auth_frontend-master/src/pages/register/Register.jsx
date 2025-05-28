import { useState } from "react";
import GesturePattern from "../../components/registration/Gasturepattern";
import Biometric from "../../components/registration/Biomatric";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Color from "../../components/Color";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    pin: "",
    colorSelection: [],
    gesturePattern: [],
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorSelect = (colors) => {
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

  const registerUser = async () => {
    try {
      // Ensure all required fields are present and properly formatted
      const userData = {
        ...formData,
        authMethod: "biometric", // We'll set this to biometric since we're using biometric auth
        // Ensure gesturePattern is an array of numbers
        gesturePattern: Array.isArray(formData.gesturePattern) 
          ? formData.gesturePattern.map(num => Number(num)) 
          : [],
        // Ensure colorSelection is an array
        colorSelection: Array.isArray(formData.colorSelection) ? formData.colorSelection : []
      };

      // Validate gesture pattern format
      if (!Array.isArray(userData.gesturePattern) || 
          !userData.gesturePattern.every(num => typeof num === 'number')) {
        toast.error("Invalid gesture pattern format");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        
        // Handle specific validation errors
        if (data.message && data.message.includes("Validation error")) {
          // Extract the specific validation error message
          const errorMessage = data.message.split(":")[1]?.trim() || data.message;
          toast.error(errorMessage);
          return null; // Return null to indicate failure without throwing
        } else if (data.err) {
          toast.error(`Server error: ${data.err}`);
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Failed to register user");
        }
        return null; // Return null to indicate failure without throwing
      }

      toast.success("User registered successfully!");
      setIsRegistered(true);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register user");
      return null; // Return null to indicate failure without throwing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 5) {
      // After gesture pattern, register the user with all data except biometric
      try {
        // Validate required fields before registration
        if (!formData.email || !formData.password || !formData.pin) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        if (!Array.isArray(formData.colorSelection) || formData.colorSelection.length === 0) {
          toast.error("Please select at least one color");
          return;
        }
        
        if (!Array.isArray(formData.gesturePattern) || formData.gesturePattern.length < 4) {
          toast.error("Please draw a valid gesture pattern with at least 4 points");
          return;
        }
        
        // Log the data being sent        
        const result = await registerUser();
        // Only proceed to next step if registration was successful
        if (result) {
          setStep(step + 1);
        }
      } catch (error) {
        // Stay on current step if registration fails
        console.error("Registration failed:", error);
      }
    } else if (step === 6) {
      // This is the biometric step, which is handled by the Biometric component
      // The Biometric component will handle the navigation to login after successful enrollment
      console.log("Biometric step - no action needed here");
    } else {
      // For all other steps, just move to the next step
      setStep(step + 1);
    }
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "white",
      color: "#1a1a1a",
    },
    inputFocus: {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "16px",
      backgroundColor: "white",
      cursor: "pointer",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: "#1a1a1a",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardInner}>
          <div style={styles.header}>
            <h2 style={styles.headerTitle}>Registration ({step}/6)</h2>
          </div>

          <div style={styles.content}>
            <form style={styles.form} onSubmit={handleSubmit}>
              {/* Step 1: Email */}
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
                </div>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <div style={styles.formGroup}>
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

              {/* Step 3: PIN */}
              {step === 3 && (
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

              {/* Step 4: Color Selection */}
              {step === 4 && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Select up to 3 Colors
                  </label>
                  <Color onColorSelect={handleColorSelect} />
                </div>
              )}

              {/* Step 5: Gesture Pattern */}
              {step === 5 && (
                <div style={styles.formGroup}>
                  <GesturePattern 
                    onPatternChange={handleGesturePattern}
                  />
                </div>
              )}

              {/* Step 6: Biometric */}
              {step === 6 && (
                <div style={styles.formGroup}>
                  <h3 style={styles.sectionTitle}>Biometric Registration</h3>
                  <Biometric
                    userEmail={formData.email}
                    onSuccess={(data) => {
                      console.log("Enrolled biometric data:", data);
                      // The Biometric component will handle navigation to login
                    }}
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
                <button
                  type="submit"
                  style={styles.button}
                >
                  {step === 6 ? "Complete" : "Next"}
                </button>
              </div>

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
                  {"Already Registed?"}
                </p>
                <button style={{
                  width: '100%',
                  marginTop: '5px'
                }} onClick={() => navigate("/login")}>
                  {"Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
