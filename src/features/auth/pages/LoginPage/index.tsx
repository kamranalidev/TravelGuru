import "./index.css"
import theme from "../../../../theme";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../../../supabaseClient'
export const LoginPage = () => {
  const navigate = useNavigate();
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const userData: {  email: string, password: string } = {
      email: formdata.get('email') as string,
      password: formdata.get('password') as string,
    }
    console.log(userData);
    const { data, error } = await supabase.auth.signInWithPassword({ email: userData.email, password: userData.password });

    if (error) {
      console.error('Error signing up:', error.message);
    } else {
      if (data.session) {
        localStorage.setItem("supabase_session", JSON.stringify(data.session))
        handleNavigate('/');
      }
    }
  }
  return (
    <div className="main">

      <div className="loginContainer">
        <div className="headlineLogin">
          <img style={{ height: "60px" }} src="/assets/travelguru.jpeg" /><p style={{ color: theme.palette.secondary.main, fontSize: "3rem" }}>Travel Guroo</p>
        </div>

       <form style={{
          display: "flex", flexDirection: "column", gap: "20px", width: "100%", alignItems: "center"
        }} onSubmit={signInWithEmail}>
          <CustomTextField placeholder='Email'name="email" />
          <CustomTextField placeholder='Password' name="password"/>
          <div style={{ minWidth: "350px" }}>
            <ButtonComponent title="login" width="100%" type="submit"/>
          </div>
        </form>
        <div className="forgotSection">
          <Typography sx={{ color: theme.palette.secondary.main, fontSize: "1.2rem", cursor: "pointer" }} >
            Forgot Password
          </Typography>
          <Typography
            onClick={() => handleNavigate("/signup")}
            sx={{ color: theme.palette.secondary.main, fontSize: "1.2rem", cursor: "pointer" }}>
            Signup
          </Typography>

        </div>
      </div>

    </div>
  );
};
