import { useState } from "react";
import { Box, Typography, Card, Divider } from "@mui/material";
import { CustomTextField, ButtonComponent, PasswordField, } from "../../../../components";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabaseClient";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
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
        const userData: {
            email: string;
            password: string;
        } = {
            email: formdata.get("email") as string,
            password: formdata.get("password") as string,
        };
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: userData.password,
            });
            if (error) {
                showPopup("Invalid email or password");
                setIsLoading(false);
            }
            else {
                showPopup("Login successful! Redirecting...", "success");
                if (data.session) {
                    localStorage.setItem("supabase_session", JSON.stringify(data.session));
                    const redirectState = (location.state as any) || {};
                    const redirectTo = redirectState.redirectTo || "/";
                    const servicePayload = redirectState.servicePayload;
                    setTimeout(() => {
                        navigate(redirectTo, servicePayload ? { state: servicePayload } : undefined);
                    }, 1000);
                }
            }
        }
        catch (error) {
            showPopup("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    }
    return (<Box className="auth-main">
      {isLoading && (<Box className="auth-loader-overlay">
          <span className="loader"></span>
        </Box>)}
      <Box className="auth-background">
        <img src="/assets/burjKhalifa.jpg" alt="Dubai Background" style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
        }}/>
        <Box className="auth-overlay"/>
      </Box>

      {popupMsg && <Box className={`auth-popup ${popupType}`}>{popupMsg}</Box>}

      <Box className="auth-split-container">
        {/* Left branding panel */}
        <Box className="auth-branding-panel">
          <Box className="auth-branding-content">
            <img src="/Travel-Guru-Logo-Final.png" alt="Travel Guru Logo" className="auth-branding-logo"/>
            <Typography className="auth-branding-title">
              Welcome Back to Travel Guru
            </Typography>
            <Typography className="auth-branding-subtitle">
              Your gateway to unforgettable Dubai experiences
            </Typography>

            <Box className="auth-branding-features">
              <Box className="auth-feature-item">
                <TravelExploreIcon className="auth-feature-icon"/>
                <Box>
                  <Typography className="auth-feature-title">
                    50+ Curated Experiences
                  </Typography>
                  <Typography className="auth-feature-desc">
                    Desert safaris, city tours, cruises & more
                  </Typography>
                </Box>
              </Box>
              <Box className="auth-feature-item">
                <VerifiedUserIcon className="auth-feature-icon"/>
                <Box>
                  <Typography className="auth-feature-title">
                    Secure Payments
                  </Typography>
                  <Typography className="auth-feature-desc">
                    256-bit SSL encrypted transactions
                  </Typography>
                </Box>
              </Box>
              <Box className="auth-feature-item">
                <SupportAgentIcon className="auth-feature-icon"/>
                <Box>
                  <Typography className="auth-feature-title">
                    24/7 Support
                  </Typography>
                  <Typography className="auth-feature-desc">
                    Dedicated team at your service
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right form panel */}
        <Card className="auth-card">
          <Box className="auth-header">
            <Box className="auth-icon-circle">
              <LockOutlinedIcon sx={{ fontSize: 28, color: "#FF621F" }}/>
            </Box>
            <Typography variant="h4" className="auth-title">
              Sign In
            </Typography>
            <Typography className="auth-description">
              Enter your credentials to access your account
            </Typography>
          </Box>

          <form onSubmit={signInWithEmail} className="auth-form">
            <Box className="auth-input-group">
              <Typography className="auth-input-label">
                <EmailOutlinedIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}/>
                Email Address
              </Typography>
              <CustomTextField placeholder="you@example.com" name="email" type="email" required fullWidth/>
            </Box>
            <Box className="auth-input-group">
              <Typography className="auth-input-label">
                <LockOutlinedIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}/>
                Password
              </Typography>
              <PasswordField placeholder="Enter your password" name="password" required fullWidth/>
            </Box>

            <ButtonComponent title={isLoading ? "Signing in..." : "Sign In"} width="100%" type="submit" disabled={isLoading}/>
          </form>

          <Divider sx={{ my: 2, color: "#d1d5db", fontSize: "0.8rem" }}>
            or
          </Divider>

          <Box className="auth-links">
            <Typography onClick={() => navigate("/password-reset")} className="auth-link">
              Forgot Password?
            </Typography>
            <Typography onClick={() => navigate("/signup")} className="auth-link">
              Create Account
            </Typography>
          </Box>

          <Typography className="auth-footer-text">
            By signing in, you agree to our{" "}
            <Box component="a" href="/terms" className="auth-footer-link">
              Terms
            </Box>{" "}
            and{" "}
            <Box component="a" href="/privacy" className="auth-footer-link">
              Privacy Policy
            </Box>
          </Typography>
        </Card>
      </Box>
    </Box>);
};
