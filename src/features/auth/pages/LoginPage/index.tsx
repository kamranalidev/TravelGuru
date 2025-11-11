import "./index.css";
import theme from "../../../../theme";
import { useState } from "react";
import {
  CustomTextField,
  ButtonComponent,
  PasswordField,
} from "../../../../components";
import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import logo from "../../../../assets/Logo-02.png";
export const LoginPage = () => {
  const navigate = useNavigate();
  const [popupMsg, setPopupMsg] = useState("");

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const userData: { email: string; password: string } = {
      email: formdata.get("email") as string,
      password: formdata.get("password") as string,
    };
    console.log(userData);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      console.error("Error Signing in:", error.message);
      setPopupMsg("Invalid email or password"); // show popup
      // Hide popup after 3 seconds
    } else {
      setPopupMsg("Login successful! Redirecting...");
      setTimeout(() => setPopupMsg(""), 3000);
      if (data.session) {
        localStorage.setItem("supabase_session", JSON.stringify(data.session));
        handleNavigate("/");
      }
    }
  }
  return (
    <div className="main">
      {popupMsg && (
        <Box
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            backgroundColor: popupMsg.includes("success")
              ? theme.palette.success.main
              : theme.palette.error.main,
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {popupMsg}
        </Box>
      )}
      <Box className="loginContainer">
        <Box className="headlineLogin">
          <img
            src={logo}
            alt="Travel Guru Logo"
            style={{
              height: "70px",
              width: "70px",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontSize: "2.5rem",
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

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
            alignItems: "center",
            marginTop: "2rem",
          }}
          onSubmit={signInWithEmail}
        >
          <CustomTextField
            placeholder="Email"
            name="email"
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <PasswordField
            placeholder="Password"
            name="password"
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <Box style={{ minWidth: "350px" }}>
            <ButtonComponent title="Login" width="100%" type="submit" />
          </Box>
        </form>
        <Box className="forgotSection">
          <Typography
            onClick={() => handleNavigate("/forgot-password")}
            sx={{
              color: theme.palette.primary.main,
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            onClick={() => handleNavigate("/signup")}
            sx={{
              color: theme.palette.primary.main,
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign Up
          </Typography>
        </Box>
      </Box>
    </div>
  );
};
