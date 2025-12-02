import { useState } from "react";
import { Box, Typography, Card, Alert, LinearProgress } from "@mui/material";
import {
  CustomTextField,
  ButtonComponent,
  PasswordField,
} from "../../../../components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import { validatePassword, getPasswordStrengthColor } from "../../../../utils/passwordValidation";
import "../../shared.css";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  };

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

    // Validate password strength
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join('. '));
      setLoading(false);
      return;
    }

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
          "Signup successful! Please check your email to confirm your account."
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
            src="/assets/Logo-02.png"
            alt="TravelGuru Logo"
            className="auth-logo"
          />
          <Typography variant="h4" className="auth-title">
            Travel Guroo
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
          <Box sx={{ width: "100%" }}>
            <PasswordField
              placeholder="Password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
              fullWidth
              helperText={
                passwordValidation
                  ? passwordValidation.errors.length > 0
                    ? passwordValidation.errors[0]
                    : `Password strength: ${passwordValidation.strength}`
                  : "Must be at least 8 characters with uppercase, lowercase, number, and special character"
              }
              error={passwordValidation ? !passwordValidation.isValid : false}
            />
            {password && passwordValidation && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={
                    passwordValidation.strength === 'weak'
                      ? 33
                      : passwordValidation.strength === 'medium'
                      ? 66
                      : 100
                  }
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getPasswordStrengthColor(passwordValidation.strength),
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: getPasswordStrengthColor(passwordValidation.strength),
                    fontSize: '0.75rem',
                    mt: 0.5,
                    display: 'block',
                  }}
                >
                  {passwordValidation.strength.charAt(0).toUpperCase() +
                    passwordValidation.strength.slice(1)}{' '}
                  password
                </Typography>
              </Box>
            )}
          </Box>

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
