import { useState, useEffect } from "react";
import { supabase } from "../../../../supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ButtonComponent } from "../../../../components";
import { CustomTextField } from "../../../../components";
import theme from "../../../../theme";
import { Box, Typography, Alert } from "@mui/material";
import "../LoginPage/index.css";

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
    <div className="main">
      <div className="loginContainer">
        <div className="headlineLogin">
          <img
            style={{ height: "60px", width: "auto" }}
            src="/assets/Logo-02.png"
            alt="TravelGuru Logo"
          />
          <p style={{ color: theme.palette.secondary.main, fontSize: "3rem" }}>
            Update Password
          </p>
        </div>

        <Box sx={{ width: "100%", maxWidth: "400px", mb: 2 }}>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mb: 2, color: "#666" }}
          >
            Enter your new password below.
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
          onSubmit={handleUpdatePassword}
        >
          <CustomTextField
            placeholder="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <CustomTextField
            placeholder="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div style={{ minWidth: "350px" }}>
            <ButtonComponent
              title={loading ? "Updating..." : "Update Password"}
              width="100%"
              type="submit"
            />
          </div>
        </form>
      </div>

      <div className="sideImg">
        <img src="/assets/beardGuy.png" alt="Travel" />
      </div>
    </div>
  );
};
