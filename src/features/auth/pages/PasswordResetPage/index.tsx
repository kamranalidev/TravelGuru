import { useState } from "react";
import { Box, Typography, Card, Alert } from "@mui/material";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import "../../shared.css";

export const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

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
      setLoading(false);
    }
  };

  return (
    <Box className="auth-main">
      <Box className="auth-background">
        <img
          src="/assets/yachtdubai.jpg"
          alt="Dubai Marina"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box className="auth-overlay" />
      </Box>

      <Card className="auth-card">
        <Box className="auth-header">
          <img
            src="/assets/Logo-02.png"
            alt="TravelGuru Logo"
            className="auth-logo"
          />
          <Typography variant="h4" className="auth-title">
            Travel Guroo
          </Typography>
          <Typography variant="h5" className="auth-subtitle">
            Reset Password
          </Typography>
        </Box>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handlePasswordReset} className="auth-form">
          <CustomTextField
            placeholder="Enter your email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <ButtonComponent
            title={loading ? "Sending..." : "Send Reset Email"}
            width="100%"
            type="submit"
            disabled={loading}
          />
        </form>

        <Box className="auth-links">
          <Typography onClick={() => navigate("/login")} className="auth-link">
            Back to Login
          </Typography>
          <Typography onClick={() => navigate("/signup")} className="auth-link">
            Create Account
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
