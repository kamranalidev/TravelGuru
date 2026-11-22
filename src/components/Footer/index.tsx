import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import "./index.css";

export const Footer = () => <footer className="site-footer">
  <div className="footer-inner">
    <div className="footer-brand"><Link to="/" className="brand"><img src="/Travel-Guru-Logo-Final.png" alt="" /><span>travel<span>guroo</span></span></Link><p>Find the experiences that make the trip.<br />Tours, activities, and multi-day packages.</p></div>
    <div className="footer-link-group"><h2>Travel Guroo</h2><Link to="/about">About us</Link><Link to="/services">Explore experiences</Link><Link to="/contact">Contact us</Link></div>
    <div className="footer-link-group"><h2>Booking information</h2><Link to="/faq">Help centre</Link><Link to="/terms">Terms & conditions</Link><Link to="/cancellation-policy">Cancellation policy</Link><Link to="/privacy">Privacy policy</Link></div>
    <div className="footer-link-group"><h2>Talk to our team</h2><a href="mailto:info@travelguroo.com"><Mail size={15} />info@travelguroo.com</a><a href="tel:+971586257508"><Phone size={15} />+971 58 625 7508</a><a href="https://wa.me/971586257508" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></div>
  </div>
  <div className="footer-bottom-line"><span>© {new Date().getFullYear()} Travel Guroo. All rights reserved.</span><span>Prices shown in AED</span></div>
</footer>;
