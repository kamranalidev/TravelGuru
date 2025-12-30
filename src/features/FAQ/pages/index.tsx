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
      "Travel Guroo specializes in the 'Big Four' experiences that define a visit to the Emirates: Desert Safari with dune bashing and Bedouin dinners, Dhow Cruise on Dubai Marina or Creek, Abu Dhabi City Tour featuring Sheikh Zayed Grand Mosque, and Airport Pickup & Drop-off services for stress-free transfers.",
  },
  {
    id: 2,
    question: "How do I make a booking?",
    answer:
      "Making a booking is simple! Browse our services, select your preferred experience and package, choose your dates, and click 'Book Now'. You'll need to create an account or log in, provide your details, and complete the secure payment process. You'll receive instant confirmation via email.",
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer:
      "We currently accept secure payments through Stripe, which supports all major credit and debit cards including Visa, MasterCard, and American Express. All transactions are encrypted and processed securely to protect your financial information.",
  },
  {
    id: 4,
    question: "What makes Travel Guroo different from other tour operators?",
    answer:
      "At Travel Guroo, we treat every guest like family and every tour like a once-in-a-lifetime event. Our guides are local storytellers who know the hidden gems of the UAE. We offer transparent pricing with no hidden fees, modern fully-insured vehicles with certified drivers, and tailored experiences from private VIP tours to group adventures.",
  },
  {
    id: 5,
    question: "Are your guides experienced and knowledgeable?",
    answer:
      "Absolutely! Our guides are passionate local experts and storytellers who bring the UAE's history, culture, and hidden gems to life. They are certified professionals with deep knowledge of Arabian heritage and modern attractions, ensuring you get an authentic and enriching experience.",
  },
  {
    id: 6,
    question: "Do you provide hotel pickup for tours?",
    answer:
      "Yes! Most of our tours include complimentary hotel pickup and drop-off from major Dubai hotels and locations. Our punctual, professional chauffeurs will pick you up from your hotel and return you safely after your experience. Pickup times will be confirmed 24 hours before your tour.",
  },
  {
    id: 7,
    question: "What should I wear for a Desert Safari?",
    answer:
      "For desert safaris, we recommend comfortable, loose-fitting clothes suitable for the desert climate, closed shoes, sunglasses, and a hat or scarf. Avoid white clothing as sand shows easily. We provide traditional Arabian costumes for photos at the desert camp to enhance your Bedouin experience.",
  },
  {
    id: 8,
    question: "Is the Desert Safari safe?",
    answer:
      "Safety is our top priority. All our vehicles are modern, fully insured, and maintained to the highest standards. They are driven by certified professional drivers with extensive dune bashing experience. We follow strict safety protocols and provide all necessary safety equipment.",
  },
  {
    id: 9,
    question: "What is included in the Dhow Cruise?",
    answer:
      "Our Dhow Cruise includes a scenic cruise on a traditional wooden Dhow boat, a delicious 5-star international buffet dinner, live entertainment (music and traditional dance performances), unlimited soft drinks, and stunning views of Dubai Marina or the historic Creek skyline under the stars.",
  },
  {
    id: 10,
    question: "How long does the Abu Dhabi City Tour take?",
    answer:
      "The Abu Dhabi City Tour typically lasts 8-9 hours, including travel time from Dubai. You'll visit iconic landmarks including the magnificent Sheikh Zayed Grand Mosque, the Heritage Village, Corniche, Emirates Palace, and the futuristic Yas Island. Lunch and breaks are included.",
  },
  {
    id: 11,
    question: "Can I customize my tour experience?",
    answer:
      "Yes! We specialize in tailored experiences. Whether you want a private VIP tour, specific stops added to your itinerary, or special arrangements for celebrations, we adapt to your pace and preferences. Contact us to discuss your requirements and we'll create a personalized experience.",
  },
  {
    id: 12,
    question: "Do you offer group discounts?",
    answer:
      "Yes, we offer attractive discounts for group bookings. The discount varies depending on the group size and selected experience. Contact our team directly for customized group pricing and special packages for corporate events or large families.",
  },
  {
    id: 13,
    question: "What is your cancellation policy?",
    answer:
      "Our cancellation policy varies by service. Generally, free cancellation is available up to 24-48 hours before your experience. Cancellations within this period may incur charges. Specific cancellation terms are provided during booking and in your confirmation email.",
  },
  {
    id: 14,
    question: "Are your prices transparent? Any hidden fees?",
    answer:
      "At Travel Guroo, we believe in transparent pricing with no hidden fees or 'tourist traps'. The price you see is the price you pay. All inclusions, exclusions, and any optional add-ons are clearly listed for each experience. Just honest value for incredible memories.",
  },
  {
    id: 15,
    question: "What happens in case of bad weather?",
    answer:
      "While the UAE enjoys excellent weather year-round, in rare cases of extreme weather conditions affecting safety, we may need to reschedule your experience. We'll contact you immediately and offer alternative dates or a full refund if you cannot reschedule.",
  },
  {
    id: 16,
    question: "How reliable is your Airport Pickup & Drop-off service?",
    answer:
      "Our airport transfer service is 100% reliable. We monitor flight schedules in real-time to adjust for any delays or early arrivals. Our professional chauffeurs are punctual, courteous, and ensure you move between the airport and your destination in total comfort and safety.",
  },
  {
    id: 17,
    question: "Are meals included in your tours?",
    answer:
      "Meal inclusions vary by experience. Desert Safari includes a traditional Bedouin-style dinner, Dhow Cruise includes a 5-star buffet, and Abu Dhabi City Tour includes lunch. Specific meal details and any dietary accommodation options are listed on each service page.",
  },
  {
    id: 18,
    question: "Can you accommodate special dietary requirements?",
    answer:
      "Yes! We can accommodate various dietary requirements including vegetarian, vegan, halal, and gluten-free options. Please inform us of any dietary restrictions or allergies at the time of booking, and we'll make the necessary arrangements.",
  },
  {
    id: 19,
    question: "What languages do your guides speak?",
    answer:
      "Our guides are multilingual and typically speak English, Arabic, Hindi, and Urdu. For other language requirements, please let us know in advance and we'll do our best to arrange a guide who speaks your preferred language.",
  },
  {
    id: 20,
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team through the contact form on our website, via email, or by phone. We're here to assist you before, during, and after your UAE experience. Our team is dedicated to making your journey seamless and unforgettable.",
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
            Find answers to common questions about Travel Guroo's UAE
            experiences
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
