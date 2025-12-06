import { Box, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box className="footer">
      <Box className="footerContent">
        <Box className="footer-main">
          <Box className="footer-brand">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <img
                src="/assets/Logo-02.png"
                alt="TravelGuru Logo"
                style={{ height: "36px", width: "auto", marginRight: "12px" }}
              />
              <Typography className="logo">Travel Guru</Typography>
            </Box>
            <Typography className="footer-tagline">
              Your trusted partner for unforgettable Dubai experiences.
            </Typography>
            <Box className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61579936145705"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/travelguroo_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.tiktok.com/@travelguroo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="tiktok-icon"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </Box>
          </Box>
        </Box>

        <Box className="footer-bottom">
          <Typography className="copyright">
            © {new Date().getFullYear()} TravelGuru. All rights reserved.
          </Typography>
          <Box className="footer-links-minimal">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/faq"); }}>
              FAQ
            </a>
            <span className="separator">•</span>
            <a href="#">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#">Terms & Conditions</a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
