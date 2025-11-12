import { Box } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
export const Footer = () => {
  return (
    <>
      <Box className="footer">
        <Box className="footerContent">
          <div className="footer-top">
            <div className="footer-brand">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src="/assets/Logo-02.png"
                  alt="TravelGuru Logo"
                  style={{ height: "40px", width: "auto", marginRight: "10px" }}
                />
                <h2 className="logo">Travel Guru</h2>
              </div>
              <p style={{ color: "#666666" }}>
                Book your trip in minute, get full <br /> Control for much
                longer.
              </p>
              <div className="social-icons">
                <a href="#">
                  <FacebookIcon />
                </a>
                <a href="#">
                  <TwitterIcon />
                </a>
                <a href="#">
                  {" "}
                  <InstagramIcon />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div>
                <h4>Company</h4>
                <ul>
                  <li>
                    <a href="#">About</a>
                  </li>
                  <li>
                    <a href="#">Careers</a>
                  </li>
                  <li>
                    <a href="#">Logistic</a>
                  </li>
                  <li>
                    <a href="#">Privacy & Policy</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Contact</h4>
                <ul>
                  <li>
                    <a href="#">Help/FAQ</a>
                  </li>
                  <li>
                    <a href="#">Press</a>
                  </li>
                  <li>
                    <a href="#">Affilates</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4>More</h4>
                <ul>
                  <li>
                    <a href="#">Press Centre</a>
                  </li>
                  <li>
                    <a href="#">Our Blog</a>
                  </li>
                  <li>
                    <a href="#">Low fare tips</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <hr
            style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}
          />
          <div className="footer-bottom">
            <p>Copyright, TravelGuroo 2022. All rights reserved .</p>
            <a href="#">Terms & Conditions</a>
          </div>
        </Box>
      </Box>
    </>
  );
};
