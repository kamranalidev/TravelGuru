import { useState } from "react";
import { Box, Typography, Card } from "@mui/material";
import {
  CustomTextField,
  ButtonComponent,
  PasswordField,
} from "../../../../components";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import "../../shared.css";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [popupMsg, setPopupMsg] = useState("");
  const [popupType, setPopupType] = useState<"success" | "error">("error");
  const [isLoading, setIsLoading] = useState(false);

  const showPopup = (message: string, type: "success" | "error" = "error") => {
    setPopupMsg(message);
    setPopupType(type);
    setTimeout(() => setPopupMsg(""), 3000);
  };

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formdata = new FormData(e.currentTarget);
    const userData: { email: string; password: string } = {
      email: formdata.get("email") as string,
      password: formdata.get("password") as string,
    };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error("Error Signing in:", error.message);
        showPopup("Invalid email or password");
        setIsLoading(false);
      } else {
        showPopup("Login successful! Redirecting...", "success");
        if (data.session) {
          localStorage.setItem(
            "supabase_session",
            JSON.stringify(data.session),
          );
          const redirectState = (location.state as any) || {};
          const redirectTo = redirectState.redirectTo || "/";
          const servicePayload = redirectState.servicePayload;
          setTimeout(() => {
            navigate(
              redirectTo,
              servicePayload ? { state: servicePayload } : undefined,
            );
          }, 1000);
        }
      }
    } catch (error) {
      showPopup("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Box className="auth-main">
      {isLoading && (
        <Box className="auth-loader-overlay">
          <span className="loader"></span>
        </Box>
      )}
      <Box className="auth-background">
        <img
          src="/assets/burjKhalifa.jpg"
          alt="Dubai Background"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box className="auth-overlay" />
      </Box>

      {popupMsg && <Box className={`auth-popup ${popupType}`}>{popupMsg}</Box>}

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
            Welcome Back
          </Typography>
        </Box>

        <form onSubmit={signInWithEmail} className="auth-form">
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
            title={isLoading ? "Logging in..." : "Login"}
            width="100%"
            type="submit"
            disabled={isLoading}
          />
        </form>

        <Box className="auth-links">
          <Typography
            onClick={() => navigate("/password-reset")}
            className="auth-link"
          >
            Forgot Password?
          </Typography>
          <Typography onClick={() => navigate("/signup")} className="auth-link">
            Create Account
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};
