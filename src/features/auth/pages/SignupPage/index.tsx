import "./index.css";
import theme from "../../../../theme";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { supabase } from "../../../../supabaseClient";
export const SignupPage = () => {
  const navigate = useNavigate();
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  async function signUpWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const userData: { name: string; email: string; password: string } = {
      name: formdata.get("name") as string,
      email: formdata.get("email") as string,
      password: formdata.get("password") as string,
    };
    console.log(userData);
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      console.error("Error signing up:", error.message);
    } else {
      console.log("User signed up successfully:", data);
      alert(
        "Signup successful! Please check your email to confirm your account."
      );
      navigate("/login");
    }
  }

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
          onSubmit={signUpWithEmail}
        >
          <CustomTextField placeholder="Name" name="name" />
          <CustomTextField placeholder="Email" name="email" />
          <CustomTextField placeholder="Password" name="password" />
          <div style={{ minWidth: "350px" }}>
            <ButtonComponent title="Sign Up" width="100%" type="submit" />
          </div>
        </form>

        <Typography
          onClick={() => handleNavigate("/login")}
          sx={{
            color: theme.palette.secondary.main,
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          Already have an account? login
        </Typography>
      </div>
    </div>
  );
};
