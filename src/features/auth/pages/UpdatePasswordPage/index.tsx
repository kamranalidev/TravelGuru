import { useState, useEffect } from "react";
import { Box, Typography, Card, Alert } from "@mui/material";
import { PasswordField, ButtonComponent } from "../../../../components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import "../../shared.css";

export const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the proper tokens from the email link
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-main">
      <Box className="auth-background">
        <img
          src="/assets/desertSafari.jpg"
          alt="Dubai Desert"
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
            alt="Travel Guroo Logo"
            className="auth-logo"
          />
          <Typography variant="h4" className="auth-title">
            Travel Guroo
          </Typography>
          <Typography variant="h5" className="auth-subtitle">
            Update Password
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

        <form onSubmit={handleUpdatePassword} className="auth-form">
          <PasswordField
            placeholder="New Password"
            name="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
            fullWidth
          />
          <PasswordField
            placeholder="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            required
            fullWidth
          />

          <ButtonComponent
            title={loading ? "Updating..." : "Update Password"}
            width="100%"
            type="submit"
            disabled={loading}
          />
        </form>

        <Box className="auth-links">
          <Typography
            onClick={() => navigate("/login")}
            className="auth-link"
            style={{ margin: "0 auto" }}
          >
            Back to Login
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
