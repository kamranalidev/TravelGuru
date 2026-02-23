import { useState } from "react";
import { Box, Typography, Card, Alert, Divider } from "@mui/material";
import {
  CustomTextField,
  ButtonComponent,
  PasswordField,
} from "../../../../components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FlashOnIcon from "@mui/icons-material/FlashOn";
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

      <Box className="auth-split-container">
        {/* Branding Panel */}
        <Box className="auth-branding-panel">
          <Box className="auth-branding-content">
            <img
              src="/Travel-Guru-Logo-Final.png"
              alt="Travel Guru Logo"
              className="auth-branding-logo"
            />
            <Typography className="auth-branding-title">
              Join Travel Guroo Today
            </Typography>
            <Typography className="auth-branding-subtitle">
              Create an account and start exploring Dubai
            </Typography>

            <Box className="auth-branding-features">
              <Box className="auth-feature-item">
                <TravelExploreIcon className="auth-feature-icon" />
                <Box>
                  <Typography className="auth-feature-title">
                    Explore Dubai
                  </Typography>
                  <Typography className="auth-feature-desc">
                    Access to 50+ curated experiences
                  </Typography>
                </Box>
              </Box>
              <Box className="auth-feature-item">
                <LocalOfferIcon className="auth-feature-icon" />
                <Box>
                  <Typography className="auth-feature-title">
                    Exclusive Deals
                  </Typography>
                  <Typography className="auth-feature-desc">
                    Member-only prices & early access
                  </Typography>
                </Box>
              </Box>
              <Box className="auth-feature-item">
                <FlashOnIcon className="auth-feature-icon" />
                <Box>
                  <Typography className="auth-feature-title">
                    Instant Booking
                  </Typography>
                  <Typography className="auth-feature-desc">
                    Book in seconds, no waiting
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Signup Form Card */}
        <Card className="auth-card">
          <Box className="auth-header">
            <Box className="auth-icon-circle">
              <PersonAddOutlinedIcon sx={{ fontSize: 28, color: "#FF621F" }} />
            </Box>
            <Typography variant="h4" className="auth-title">
              Create Account
            </Typography>
            <Typography className="auth-description">
              Sign up to start booking amazing experiences
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={signUpWithEmail} className="auth-form">
            <Box className="auth-input-group">
              <Typography className="auth-input-label">
                <PersonOutlineIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                />
                Full Name
              </Typography>
              <CustomTextField
                placeholder="John Doe"
                name="name"
                required
                fullWidth
              />
            </Box>
            <Box className="auth-input-group">
              <Typography className="auth-input-label">
                <EmailOutlinedIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                />
                Email Address
              </Typography>
              <CustomTextField
                placeholder="you@example.com"
                name="email"
                type="email"
                required
                fullWidth
              />
            </Box>
            <Box className="auth-input-group">
              <Typography className="auth-input-label">
                <LockOutlinedIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
                />
                Password
              </Typography>
              <PasswordField
                placeholder="Create a strong password"
                name="password"
                required
                fullWidth
              />
            </Box>

            <ButtonComponent
              title={loading ? "Creating Account..." : "Create Account"}
              width="100%"
              type="submit"
              disabled={loading}
            />
          </form>

          <Divider sx={{ my: 2, color: "#d1d5db", fontSize: "0.8rem" }}>
            or
          </Divider>

          <Box className="auth-links">
            <Typography
              onClick={() => navigate("/login")}
              className="auth-link"
              style={{ margin: "0 auto" }}
            >
              Already have an account? Sign In
            </Typography>
          </Box>

          <Typography className="auth-footer-text">
            By creating an account, you agree to our{" "}
            <Box component="a" href="/terms" className="auth-footer-link">
              Terms
            </Box>{" "}
            and{" "}
            <Box component="a" href="/privacy" className="auth-footer-link">
              Privacy Policy
            </Box>
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};
