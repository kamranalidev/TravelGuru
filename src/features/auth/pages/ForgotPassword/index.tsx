import "./index.css";
import { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { supabase } from "../../../../supabaseClient";
import theme from "../../../../theme";
import logo from "../../../../assets/Logo-02.png";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setStatus({
        type: "success",
        message: "Check your inbox for a reset link. The link will open this app to set a new password.",
      });
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message || "We couldn't send a reset email right now. Please try again later.",
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
          Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
        </Typography>

        {status && (
          <Alert
            severity={status.type}
            onClose={() => setStatus(null)}
            sx={{ width: "100%", mt: 2,
              fontFamily: "Inter, sans-serif"
            }}
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
          <CustomTextField
            placeholder="Email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <Box style={{ minWidth: "350px" }}>
            <ButtonComponent title={loading ? "Sending..." : "Send reset link"} width="100%" type="submit" />
          </Box>
        </form>
      </Box>
    </div>
  );
};
