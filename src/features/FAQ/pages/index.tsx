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
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway to ensure your financial information is protected.",
  },
  {
    id: 4,
    question: "Can I cancel or modify my booking?",
    answer:
      "Yes, you can cancel or modify your booking depending on our cancellation policy. Free cancellation is available up to 24-48 hours before your experience (varies by service). Modifications are subject to availability and may incur additional charges.",
  },
  {
    id: 5,
    question: "Are your tours suitable for children?",
    answer:
      "Many of our tours are family-friendly and suitable for children. However, some activities like skydiving or extreme desert adventures have age restrictions. Each service listing includes age requirements and family suitability information.",
  },
  {
    id: 6,
    question: "Do you provide hotel pickup?",
    answer:
      "Yes, most of our tours include complimentary hotel pickup and drop-off from major Dubai hotels and locations. Pickup times vary depending on your location and the selected tour. We'll confirm your pickup time 24 hours before your experience.",
  },
  {
    id: 7,
    question: "What should I wear for desert safaris?",
    answer:
      "For desert safaris, we recommend comfortable, loose-fitting clothes, closed shoes, sunglasses, and a hat. Avoid white clothing as it shows sand easily. We provide traditional Arabian costumes for photos at the desert camp.",
  },
  {
    id: 8,
    question: "Are your guides licensed and experienced?",
    answer:
      "Absolutely! All our guides are licensed professionals with extensive knowledge of Dubai's history, culture, and attractions. They speak multiple languages and are trained to provide safe, informative, and entertaining experiences.",
  },
  {
    id: 9,
    question: "What happens in case of bad weather?",
    answer:
      "Dubai has excellent weather year-round, but in rare cases of extreme weather, we may need to reschedule or modify activities for safety reasons. We'll contact you immediately and offer alternative dates or full refunds if needed.",
  },
  {
    id: 10,
    question: "Do you offer group discounts?",
    answer:
      "Yes, we offer attractive group discounts for bookings of 6 or more people. Corporate packages and special rates for large groups are also available. Contact our team for customized group pricing and packages.",
  },
  {
    id: 11,
    question: "Is travel insurance included?",
    answer:
      "Basic travel insurance is included in most of our premium packages. However, we recommend purchasing comprehensive travel insurance for additional coverage including medical expenses, trip cancellation, and personal belongings.",
  },
  {
    id: 12,
    question: "Can you help with visa requirements?",
    answer:
      "While we don't process visas directly, our team can provide guidance on Dubai visa requirements and connect you with trusted visa service providers. Many nationalities can obtain visas on arrival or through online applications.",
  },
  {
    id: 13,
    question: "What's included in your packages?",
    answer:
      "Package inclusions vary by service but typically include transportation, professional guide, entrance fees, refreshments, and specified activities. Detailed inclusions and exclusions are listed on each service page.",
  },
  {
    id: 14,
    question: "What safety measures do you have in place?",
    answer:
      "Safety is our top priority. All our vehicles are regularly maintained, our guides are trained professionals, and we follow strict safety protocols. We provide safety equipment where needed and maintain comprehensive insurance coverage.",
  },
  {
    id: 15,
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
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default FAQPage;