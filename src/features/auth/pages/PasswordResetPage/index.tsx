import { useState } from "react";
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ButtonComponent } from "../../../../components";
import { CustomTextField } from "../../../../components";
import theme from "../../../../theme";
import { Box, Typography, Alert } from "@mui/material";
import "../LoginPage/index.css";

export const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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

        <Box sx={{ width: "100%", maxWidth: "400px", mb: 2 }}>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mb: 2, color: "#666" }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
          </Typography>
        </Box>

        {message && (
          <Alert
            severity="success"
            sx={{ width: "100%", maxWidth: "400px", mb: 2 }}
          >
            {message}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", maxWidth: "400px", mb: 2 }}
          >
            {error}
          </Alert>
        )}

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
            placeholder="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ minWidth: "350px" }}>
            <ButtonComponent
              title={loading ? "Sending..." : "Send Reset Email"}
              width="100%"
              type="submit"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Typography variant="body2">
              Remember your password?{" "}
              <span
                style={{
                  color: theme.palette.secondary.main,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </Typography>
          </div>
        </form>
      </div>

      <div className="sideImg">
        <img src="/assets/beardGuy.png" alt="Travel" />
      </div>
    </div>
  );
};
