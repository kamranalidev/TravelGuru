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
import { Header, Footer, ScrollAnimation } from "../../../components";
import "./index.css";

const faqData = [
  {
    id: 1,
    question: "What services does Travel Guroo offer?",
    answer:
      "Travel Guroo offers a comprehensive range of Dubai travel services including desert safaris, city tours, yacht charters, skydiving experiences, cultural tours, luxury hotel bookings, and customized travel packages. We specialize in creating unforgettable Dubai experiences for all types of travelers.",
  },
  {
    id: 2,
    question: "How do I make a booking?",
    answer:
      "Making a booking is simple! Browse our services on the homepage, select your preferred package, choose your dates, and click 'Book Now'. You'll need to create an account or log in, provide your details, and complete the payment process. You'll receive instant confirmation via email.",
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment gateway. All payments are processed securely to ensure your financial information is protected.",
  },
  {
    id: 4,
    question: "Can I cancel or modify my booking?",
    answer:
      "Yes, you can cancel or modify your booking depending on our cancellation policy. Free cancellation is available up to 24-48 hours before your experience (varies by service). Modifications are subject to availability and may incur additional charges.",
  },
  {
    id: 5,
    question: "Do you provide hotel pickup?",
    answer:
      "Yes, most of our tours include complimentary hotel pickup and drop-off from major Dubai hotels and locations. Pickup times vary depending on your location and the selected tour. We'll confirm your pickup time 24 hours before your experience.",
  },
  {
    id: 6,
    question: "Are your guides licensed and experienced?",
    answer:
      "Absolutely! All our guides are licensed professionals with extensive knowledge of Dubai's history, culture, and attractions. They speak multiple languages and are trained to provide safe, informative, and entertaining experiences.",
  },
  {
    id: 7,
    question: "What happens in case of bad weather?",
    answer:
      "Dubai has excellent weather year-round, but in rare cases of extreme weather, we may need to reschedule or modify activities for safety reasons. We'll contact you immediately and offer alternative dates or full refunds if needed.",
  },
  {
    id: 8,
    question: "How can I contact customer support?",
    answer:
      "Our customer support team is available 24/7. You can reach us through the contact form on our website, email us directly, or call our helpline. We're here to assist you before, during, and after your Dubai experience.",
  },
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
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" className="faq-subtitle">
            Find answers to common questions about our Dubai travel services
          </Typography>
        </Container>
      </Box>

      <Box className="faq-content">
        <Container maxWidth="lg">
          <Box className="faq-accordions">
            {faqData.map((faq, index) => (
              <ScrollAnimation
                key={faq.id}
                animationType="slideUp"
                delay={index * 50}
              >
                <Accordion
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
              </ScrollAnimation>
            ))}
          </Box>

          <ScrollAnimation animationType="fadeIn" delay={400}>
            <Box className="faq-contact">
              <Typography variant="h4" className="contact-title">
                Still have questions?
              </Typography>
              <Typography variant="body1" className="contact-subtitle">
                Can't find the answer you're looking for? Our friendly customer
                support team is here to help!
              </Typography>
              <Box className="contact-actions">
                <a href="mailto:support@travelguru.com" className="contact-link">
                  Email Support
                </a>
                <a href="tel:+971-50-123-4567" className="contact-link">
                  Call Us
                </a>
              </Box>
            </Box>
          </ScrollAnimation>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default FAQPage;
