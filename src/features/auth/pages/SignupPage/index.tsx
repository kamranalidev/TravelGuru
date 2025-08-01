import "./index.css"
import theme from "../../../../theme";
import { CustomTextField , ButtonComponent} from "../../../../components";
import { useNavigate } from "react-router-dom";
export const SignupPage = () => {
  const navigate = useNavigate();
  const handleNavigate = (route:string) => {
    navigate(route);
  };
  return (
    <div className="main">
        
      <div className="loginContainer">
        <div className="headlineLogin">
         <img style={{height:"60px"}} src="/assets/travelguru.jpeg"/><p style={{color:theme.palette.secondary.main,fontSize:"3rem"}}>Travel Guroo</p> 
        </div>
        <CustomTextField placeholder='Name' />
        <CustomTextField  placeholder='Email'/>
        <CustomTextField placeholder='Password'/>
        <div style={{minWidth:"350px"}}>
        <ButtonComponent title="Sign Up" width="100%" />
        </div>
        <p 
        onClick={()=>handleNavigate("/login")} style={{color: theme.palette.secondary.main, cursor: 'pointer'}}>
          Already have an account? login
        </p>
      </div>
     
    </div>
  );
};
