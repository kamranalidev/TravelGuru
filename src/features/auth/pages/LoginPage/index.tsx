import "./index.css";
import theme from "../../../../theme";
import { useState } from "react";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
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
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            backgroundColor: "#f44336",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {popupMsg}
        </div>
      )}
      <div className="loginContainer">
        <div className="headlineLogin">
          <img
            style={{ height: "60px", width: "auto" }}
            src="/assets/Logo-02.png"
            alt="TravelGuru Logo"
          />
          <p style={{ color: theme.palette.secondary.main, fontSize: "3rem" }}>
            Travel Guroo
          </p>
        </div>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            alignItems: "center",
          }}
          onSubmit={signInWithEmail}
        >
          <CustomTextField placeholder="Email" name="email" />
          <CustomTextField placeholder="Password" name="password" />
          <div style={{ minWidth: "350px" }}>
            <ButtonComponent title="login" width="100%" type="submit" />
          </div>
        </form>
        <div className="forgotSection">
          <Typography
            onClick={() => handleNavigate("/password-reset")}
            sx={{
              color: theme.palette.secondary.main,
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            onClick={() => handleNavigate("/signup")}
            sx={{
              color: theme.palette.secondary.main,
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            Signup
          </Typography>
        </div>
      </div>
    </div>
  );
};
