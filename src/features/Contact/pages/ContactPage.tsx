import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
} from "@mui/material";
import { Header, Footer } from "../../../components";
import "./index.css";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitStatus({
        type: "success",
        message: "Thank you for contacting us! We'll get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Header />

      <Box className="contact-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" className="contact-hero-title">
            Contact Us
          </Typography>
          <Typography variant="h6" className="contact-hero-subtitle">
            Get in touch with our team - we're here to help make your Dubai experience unforgettable
          </Typography>
        </Container>
      </Box>

      <Box className="contact-content">
        <Container maxWidth="lg">
          <Typography variant="body1" className="contact-main-description">
            We are committed to processing the information in order to contact you and talk about your project.
          </Typography>

          <Box className="contact-main-card">
            <form onSubmit={handleSubmit} className="contact-form-section">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box className="form-field-wrapper">
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      className="contact-form-field"
                    />
                    <span className="required-asterisk">*</span>
                  </Box>
                  <Box className="form-field-wrapper">
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      className="contact-form-field"
                    />
                    <span className="required-asterisk">*</span>
                  </Box>
                  <Box className="form-field-wrapper">
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      className="contact-form-field"
                    />
                    <span className="required-asterisk">*</span>
                  </Box>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={6}
                    variant="outlined"
                    className="contact-form-field"
                  />
                </Box>
                <Box>
                  {submitStatus.type && (
                    <Box
                      className={`submit-message ${
                        submitStatus.type === "success"
                          ? "success"
                          : "error"
                      }`}
                    >
                      <Typography variant="body2">
                        {submitStatus.message}
                      </Typography>
                    </Box>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="contact-submit-button"
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                </Box>
              </Box>
            </form>
          </Box>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default ContactPage;

