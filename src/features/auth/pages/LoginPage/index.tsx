import "./index.css"
import theme from "../../../../theme";
import { CustomTextField, ButtonComponent } from "../../../../components";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
export const LoginPage = () => {
  const navigate = useNavigate();
  const handleNavigate = (route:string) => {
    navigate(route);
  };
  return (
    <div className="main">

      <div className="loginContainer">
        <div className="headlineLogin">
          <img style={{ height: "60px" }} src="/assets/travelguru.jpeg" /><p style={{ color: theme.palette.secondary.main, fontSize: "3rem" }}>Travel Guroo</p>
        </div>
        <CustomTextField placeholder='Name' />
        <CustomTextField placeholder='Email' />
        <CustomTextField placeholder='Password' />
        <div style={{ minWidth: "350px" }}>
          <ButtonComponent title="Login" width="100%" />
        </div>
        <div className="forgotSection">
          <Typography sx={{ color: theme.palette.secondary.main, fontSize: "1.2rem", cursor: "pointer" }} >
            Forgot Password
          </Typography>
          <Typography
          onClick={()=>handleNavigate("/signup")}
          sx={{ color: theme.palette.secondary.main, fontSize: "1.2rem", cursor: "pointer" }}>
            Signup
          </Typography>

        </div>
      </div>

    </div>
  );
};
