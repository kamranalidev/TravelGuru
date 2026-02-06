import { useState } from "react";
import { Box, Typography, Card, Alert } from "@mui/material";
import {
  CustomTextField,
  ButtonComponent,
  PasswordField,
} from "../../../../components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import "../../shared.css";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function signUpWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formdata = new FormData(e.currentTarget);
    const userData: { name: string; email: string; password: string } = {
      name: formdata.get("name") as string,
      email: formdata.get("email") as string,
      password: formdata.get("password") as string,
    };

    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Signup successful! Please check your email to confirm your account.",
        );
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="auth-main">
      {loading && (
        <Box className="auth-loader-overlay">
          <span className="loader"></span>
        </Box>
      )}
      <Box className="auth-background">
        <img
          src="/assets/desert1.jpg"
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
            src="/Travel-Guru-Logo-Final.png"
            alt="Travel Guru Logo"
            className="auth-logo"
          />
          <Typography variant="h4" className="auth-title">
            Travel Guru
          </Typography>
          <Typography variant="h5" className="auth-subtitle">
            Create Account
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

        <form onSubmit={signUpWithEmail} className="auth-form">
          <CustomTextField
            placeholder="Full Name"
            name="name"
            required
            fullWidth
          />
          <CustomTextField
            placeholder="Email"
            name="email"
            type="email"
            required
            fullWidth
          />
          <PasswordField
            placeholder="Password"
            name="password"
            required
            fullWidth
          />

          <ButtonComponent
            title={loading ? "Creating Account..." : "Sign Up"}
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
            Already have an account? Login
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
