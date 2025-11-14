import { useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { CustomTextField, ButtonComponent } from "../../../../components";
import theme from "../../../../theme";
import { Link } from "react-router-dom";
import "../LoginPage/index.css";

export const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset email sent! Please check your inbox.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="loginContainer">
        <div className="headlineLogin">
          <img
            style={{ height: "60px", width: "auto" }}
            src="/assets/Logo-02.png"
            alt="TravelGuru Logo"
          />
          <p style={{ color: theme.palette.secondary.main, fontSize: "3rem" }}>
            Reset Password
          </p>
        </div>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            alignItems: "center",
          }}
          onSubmit={handlePasswordReset}
        >
          <CustomTextField
            placeholder="Enter your email address"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div
              style={{
                color: "#d32f2f",
                fontSize: "14px",
                textAlign: "center",
                padding: "8px",
                backgroundColor: "#ffebee",
                borderRadius: "4px",
                width: "100%",
                maxWidth: "350px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                color: "#2e7d32",
                fontSize: "14px",
                textAlign: "center",
                padding: "8px",
                backgroundColor: "#e8f5e8",
                borderRadius: "4px",
                width: "100%",
                maxWidth: "350px",
              }}
            >
              {message}
            </div>
          )}
          <div style={{ minWidth: "350px" }}>
            <ButtonComponent
              title={isLoading ? "Sending..." : "Send Reset Email"}
              width="100%"
              type="submit"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link
              to="/login"
              style={{
                color: theme.palette.secondary.main,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      <div className="sideImg">
        <img src="/assets/beardGuy.png" alt="Travel" />
      </div>
    </div>
  );
};
