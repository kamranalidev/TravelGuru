import { Box, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useNavigate } from "react-router-dom";
import "./index.css";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box className="footer" component="footer">
      <Box className="footerContent">
        <Box
          className="footer-grid"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 4,
          }}
        >
          <Box className="footer-column">
            <Box className="footer-logo-section">
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
                  src="/Travel-Guru-Logo-Final.png"
                  alt="Travel Guru Logo"
                  className="footer-logo"
                />
                <Typography className="footer-logo-text">
                  Travel Guru
                </Typography>
              </Box>
              <Typography className="footer-tagline">
                Your trusted partner for unforgettable Dubai experiences.
              </Typography>
            </Box>
          </Box>

          <Box className="footer-column">
            <Typography className="footer-column-title">Business</Typography>
            <Box className="footer-links-column">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
                className="footer-link"
              >
                About us
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="footer-link"
              >
                Partner with us
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="footer-link"
              >
                Become an affiliate
              </a>
            </Box>
          </Box>

          <Box className="footer-column">
            <Typography className="footer-column-title">
              Get Help 24/7
            </Typography>
            <Box className="footer-contact-info">
              <Box className="contact-info-item">
                <EmailIcon className="contact-icon" />
                <a href="mailto:info@travelguroo.com" className="contact-link">
                  info@travelguroo.com
                </a>
              </Box>
              <Box className="contact-info-item">
                <PhoneIcon className="contact-icon" />
                <a href="tel:+971586257508" className="contact-link">
                  +971 58 625 7508
                </a>
              </Box>
              <Box className="contact-info-item">
                <WhatsAppIcon className="contact-icon" />
                <a
                  href="https://wa.me/971586257508"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  +971 58 625 7508
                </a>
              </Box>
            </Box>

            <Box className="footer-social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61579936145705"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-icon-link"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/travelguroo_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon-link"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.tiktok.com/@travelguroo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="social-icon-link tiktok-icon"
              >
                <svg
                  width="20"
                  height="20"
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
            © {new Date().getFullYear()} Travel Guroo. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
