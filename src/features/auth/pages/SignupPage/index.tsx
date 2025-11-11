import "./index.css"
import theme from "../../../../theme";
import { CustomTextField, ButtonComponent, PasswordField } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { supabase } from '../../../../supabaseClient'
import logo from '../../../../assets/Logo-02.png';
export const SignupPage = () => {

  const navigate = useNavigate();
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  async function signUpWithEmail(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    const formdata = new FormData(e.currentTarget);
    const userData: { name: string, email: string, password: string } = {
      name: formdata.get('name') as string,
      email: formdata.get('email') as string,
      password: formdata.get('password') as string,
    }
    console.log(userData);
    const { data, error } = await supabase.auth.signUp({ email: userData.email, password: userData.password });

    if (error) {
      console.error('Error signing up:', error.message);
    } else {
      console.log('User signed up successfully:', data);
      alert("Signup successful! Please check your email to confirm your account.");
      navigate('/login');
    }
  }

  return (
    <div className="main">
      <Box className="loginContainer">
        <Box className="headlineLogin">
          <img 
            src={logo} 
            alt="Travel Guru Logo" 
            style={{ 
              height: "70px", 
              width: "70px",
              objectFit: "contain"
            }} 
          />
          <Typography 
            sx={{ 
              color: theme.palette.primary.main, 
              fontSize: "2.5rem",
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: theme.palette.primary.main }}>Travel</span>
            <span style={{ color: '#333333' }}>Guru</span>
          </Typography>
        </Box>
        <form style={{
          display: "flex", 
          flexDirection: "column", 
          gap: "24px", 
          width: "100%", 
          alignItems: "center",
          marginTop: "2rem"
        }} onSubmit={signUpWithEmail}>
          <CustomTextField 
            placeholder='Name' 
            name="name"
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <CustomTextField 
            placeholder='Email'
            name="email"
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <PasswordField placeholder='Password' name="password"
            labelcolor={theme.palette.text.secondary}
            labelfocusedcolor={theme.palette.primary.main}
            bordercolor="#E0E0E0"
            borderhovercolor={theme.palette.primary.light}
            borderfocusedcolor={theme.palette.primary.main}
          />
          <Box style={{ minWidth: "350px" }}>
            <ButtonComponent title="Sign Up" width="100%" type="submit"/>
          </Box>
        </form>

        <Typography
          onClick={() => handleNavigate("/login")} 
          sx={{ 
            color: theme.palette.primary.main, 
            cursor: 'pointer', 
            fontSize: "1rem",
            fontWeight: 500,
            marginTop: "1rem",
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
        >
          Already have an account? Login
        </Typography>
      </Box>
    </div>
  );
};
