import "./index.css";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { ButtonComponent, PasswordField } from "../../../../components";
import { supabase } from "../../../../supabaseClient";
import theme from "../../../../theme";
import logo from "../../../../assets/Logo-02.png";
import { useNavigate } from "react-router-dom";

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const redirectTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current !== null) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password || password.length < 8) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      setStatus({
        type: "success",
        message:
          "Your password has been updated. Redirecting you to the login page...",
      });
      setPassword("");
      setConfirmPassword("");
      if (redirectTimeout.current !== null) {
        window.clearTimeout(redirectTimeout.current);
      }
      redirectTimeout.current = window.setTimeout(
        () => navigate("/login"),
        2000
      );
    } catch (err: any) {
      setStatus({
        type: "error",
        message:
          err?.message || "We couldn't update your password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <Box className="loginContainer">
        <Box className="headlineLogin">
          <img
            src={logo}
            alt="Travel Guru Logo"
            style={{ height: "70px", width: "70px", objectFit: "contain" }}
          />
          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontSize: "2.2rem",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: theme.palette.primary.main }}>Travel</span>
            <span style={{ color: "#333333" }}>Guru</span>
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            color: "#666666",
            textAlign: "center",
            maxWidth: "360px",
          }}
        >
          Create a strong password to secure your account.
        </Typography>

        {status && (
          <Alert
            severity={status.type}
            onClose={() => setStatus(null)}
            sx={{ width: "100%", mt: 2, fontFamily: "Inter, sans-serif" }}
          >
            {status.message}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
            alignItems: "center",
            marginTop: "2rem",
          }}
        >
          <PasswordField
            placeholder="New password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <PasswordField
            placeholder="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <Box style={{ minWidth: "350px" }}>
            <ButtonComponent
              title={loading ? "Updating..." : "Update password"}
              width="100%"
              type="submit"
            />
          </Box>
        </form>
      </Box>
    </div>
  );
};
