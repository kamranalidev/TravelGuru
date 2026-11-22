import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Header, Footer } from "../../../components";
import "./index.css";

const faqData = [
  { id: 1, question: "How do I book an experience?", answer: "Choose a destination and an experience, review the packages, and select your travel date. Add the package to your cart, check the participant details, and continue to payment. You’ll need to sign in to complete your booking." },
  { id: 2, question: "How do multi-day packages work?", answer: "Each package has a fixed number of days. Choose your start date and the end date is calculated for you. For example, a five-day trip starting on 10 June ends on 14 June. Check the package itinerary to see the activities planned for each day." },
  { id: 3, question: "Is the package price per day or for the whole trip?", answer: "Package prices cover the complete trip per participant. Prices are shown in AED. Review the inclusions and exclusions for any items that are not covered." },
  { id: 4, question: "Can I book for children or infants?", answer: "Participant options and prices depend on the package. Where available, you can adjust the number of adults, children, and infants in your cart before checkout." },
  { id: 5, question: "Where can I find my booking and voucher?", answer: "Sign in and open My bookings from your account menu to view your booking details and voucher. Keep your booking reference available when contacting our team." },
  { id: 6, question: "Can I cancel or change a booking?", answer: "Cancellation and change terms vary by package. Read the cancellation policy in the package details before booking. For questions about an existing booking, contact our team with your booking reference." },
  { id: 7, question: "Are flights, accommodation, and transfers included?", answer: "These are included only when they are listed in your package’s inclusions. Read the itinerary and exclusions, and contact us if you need clarification before booking." },
  { id: 8, question: "How can I get help?", answer: "Email info@travelguroo.com, call +971 58 625 7508, or use the contact page. Include your package name, travel dates, and booking reference if you already have a booking." },
];

const FAQPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div className="faq-page">
      <Header />

      <Box className="faq-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" className="faq-title">
            Help centre
          </Typography>
          <Typography variant="h6" className="faq-subtitle">
            Answers about packages, trip dates, payments, and your booking.
          </Typography>
        </Container>
      </Box>

      <Box className="faq-content">
        <Container maxWidth="lg">
          <Box className="faq-accordions">
            {faqData.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === `panel${faq.id}`}
                onChange={handleChange(`panel${faq.id}`)}
                className="faq-accordion"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="faq-accordion-summary"
                >
                  <Typography className="faq-question">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="faq-accordion-details">
                  <Typography className="faq-answer">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Box className="faq-contact">
            <Typography variant="h4" className="contact-title">
              Still have questions?
            </Typography>
            <Typography variant="body1" className="contact-subtitle">
              Contact us with your package name or booking reference.
            </Typography>
            <Box className="contact-actions">
              <a href="mailto:info@travelguroo.com" className="contact-link">
                Email Support
              </a>
              <a href="tel:+971586257508" className="contact-link">
                Call Us
              </a>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default FAQPage;
