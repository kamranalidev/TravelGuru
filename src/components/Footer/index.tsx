import { Box, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import theme from "../../theme";
import logo from "../../assets/Logo-02.png";
import "./index.css";

const informationLinks = [
  "About Us",
  "More Search",
  "Blog",
  "Testimonials",
  "Events",
];
const helpfulLinks = [
  "Services",
  "Supports",
  "Terms & Conditions",
  "Privacy Policy",
];
const serviceLinks = [
  "Brands list",
  "Order",
  "Return & Exchange",
  "Fashion list",
  "Blog",
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box className="footer">
      <Box className="footerContent">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="Travel Guru Logo" />
              <div>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  <span style={{ color: theme.palette.primary.main }}>
                    Travel
                  </span>{" "}
                  <span style={{ color: "#333333" }}>Guru</span>
                </Typography>
                <Typography className="footer-tagline">
                  Explore the world with seamless journeys and curated
                  experiences.
                </Typography>
              </div>
            </div>
            <div className="footer-subscribe">
              <Typography className="footer-subscribe-title">
                Subscribe Now
              </Typography>
              <div className="footer-input">
                <MailOutlineIcon fontSize="small" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
              </div>
              <button type="button" className="footer-subscribe-button">
                Subscribe
              </button>
            </div>
          </div>

          <div className="footer-column">
            <Typography className="footer-column-title">Information</Typography>
            {informationLinks.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </div>

          <div className="footer-column">
            <Typography className="footer-column-title">
              Helpful Links
            </Typography>
            {helpfulLinks.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </div>

          <div className="footer-column">
            <Typography className="footer-column-title">
              Our Services
            </Typography>
            {serviceLinks.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </div>

          <div className="footer-column footer-contact">
            <Typography className="footer-column-title">Contact Us</Typography>
            <div className="contact-item">
              <PhoneIcon fontSize="small" />
              <Typography component="span">+91 9999 999 999</Typography>
            </div>
            <div className="contact-item">
              <MailOutlineIcon fontSize="small" />
              <Typography component="span">hello@travelguru.com</Typography>
            </div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <Typography component="span">
            © {currentYear} TravelGuru. All rights reserved.
          </Typography>
          <div className="footer-bottom-links">
            <a href="#">FAQ</a>
            <a href="#">Privacy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </Box>
    </Box>
  );
};
