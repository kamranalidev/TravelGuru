import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Skeleton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ExploreIcon from "@mui/icons-material/Explore";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import "./index.css";

// FAQ Categories
const categories = [
  { id: "all", label: "All Questions", icon: <HelpOutlineIcon /> },
  { id: "booking", label: "Booking", icon: <EventIcon /> },
  { id: "payment", label: "Payment", icon: <PaymentIcon /> },
  { id: "experiences", label: "Experiences", icon: <ExploreIcon /> },
  { id: "policies", label: "Policies", icon: <LocalOfferIcon /> },
  { id: "support", label: "Support", icon: <SupportAgentIcon /> },
];

// General FAQs (not service-specific)
const generalFaqData = [
  {
    id: 1,
    category: "booking",
    question: "How do I make a booking?",
    answer:
      "Making a booking is simple! Browse our services, select your preferred experience and package, choose your dates, and click 'Book Now'. You'll need to create an account or log in, provide your details, and complete the secure payment process. You'll receive instant confirmation via email.",
  },
  {
    id: 2,
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We currently accept secure payments through Stripe, which supports all major credit and debit cards including Visa, MasterCard, and American Express. All transactions are encrypted and processed securely to protect your financial information.",
  },
  {
    id: 3,
    category: "experiences",
    question: "What makes Travel Guroo different from other tour operators?",
    answer:
      "At Travel Guroo, we treat every guest like family and every tour like a once-in-a-lifetime event. Our guides are local storytellers who know the hidden gems of the UAE. We offer transparent pricing with no hidden fees, modern fully-insured vehicles with certified drivers, and tailored experiences from private VIP tours to group adventures.",
  },
  {
    id: 4,
    category: "experiences",
    question: "Are your guides experienced and knowledgeable?",
    answer:
      "Absolutely! Our guides are passionate local experts and storytellers who bring the UAE's history, culture, and hidden gems to life. They are certified professionals with deep knowledge of Arabian heritage and modern attractions, ensuring you get an authentic and enriching experience.",
  },
  {
    id: 5,
    category: "booking",
    question: "Do you provide hotel pickup for tours?",
    answer:
      "Yes! Most of our tours include complimentary hotel pickup and drop-off from major Dubai hotels and locations. Our punctual, professional chauffeurs will pick you up from your hotel and return you safely after your experience. Pickup times will be confirmed 24 hours before your tour.",
  },
  {
    id: 6,
    category: "booking",
    question: "Can I customize my tour experience?",
    answer:
      "Yes! We specialize in tailored experiences. Whether you want a private VIP tour, specific stops added to your itinerary, or special arrangements for celebrations, we adapt to your pace and preferences. Contact us to discuss your requirements and we'll create a personalized experience.",
  },
  {
    id: 7,
    category: "payment",
    question: "Do you offer group discounts?",
    answer:
      "Yes, we offer attractive discounts for group bookings. The discount varies depending on the group size and selected experience. Contact our team directly for customized group pricing and special packages for corporate events or large families.",
  },
  {
    id: 8,
    category: "policies",
    question: "What is your cancellation policy?",
    answer:
      "Our cancellation policy varies by service. Generally, free cancellation is available up to 24-48 hours before your experience. Cancellations within this period may incur charges. Specific cancellation terms are provided during booking and in your confirmation email.",
  },
  {
    id: 9,
    category: "payment",
    question: "Are your prices transparent? Any hidden fees?",
    answer:
      "At Travel Guroo, we believe in transparent pricing with no hidden fees or 'tourist traps'. The price you see is the price you pay. All inclusions, exclusions, and any optional add-ons are clearly listed for each experience. Just honest value for incredible memories.",
  },
  {
    id: 10,
    category: "policies",
    question: "What happens in case of bad weather?",
    answer:
      "While the UAE enjoys excellent weather year-round, in rare cases of extreme weather conditions affecting safety, we may need to reschedule your experience. We'll contact you immediately and offer alternative dates or a full refund if you cannot reschedule.",
  },
  {
    id: 11,
    category: "support",
    question: "Can you accommodate special dietary requirements?",
    answer:
      "Yes! We can accommodate various dietary requirements including vegetarian, vegan, halal, and gluten-free options. Please inform us of any dietary restrictions or allergies at the time of booking, and we'll make the necessary arrangements.",
  },
  {
    id: 12,
    category: "support",
    question: "What languages do your guides speak?",
    answer:
      "Our guides are multilingual and typically speak English, Arabic, Hindi, and Urdu. For other language requirements, please let us know in advance and we'll do our best to arrange a guide who speaks your preferred language.",
  },
  {
    id: 13,
    category: "support",
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team through the contact form on our website, via email at info@travelguroo.com, or via WhatsApp. We're here to assist you before, during, and after your UAE experience. Our team is dedicated to making your journey seamless and unforgettable.",
  },
];

// Generate dynamic FAQs from live services data
interface ServiceRow {
  id: number;
  service_name: string;
  service_description?: string;
  location?: string;
  default_price?: number;
  duration?: number;
}

function generateServiceFaqs(services: ServiceRow[]): typeof generalFaqData {
  if (!services || services.length === 0) return [];

  const faqs: typeof generalFaqData = [];
  let faqId = 100;

  // Dynamic "What services do you offer?" FAQ
  const serviceNames = services.map((s) => s.service_name).join(", ");
  faqs.push({
    id: faqId++,
    category: "experiences",
    question: "What services does Travel Guroo offer?",
    answer: `Travel Guroo currently offers ${services.length} exciting experiences: ${serviceNames}. Each service comes with multiple packages to suit your preferences and budget. Browse our services page to explore all available options!`,
  });

  // Generate individual service FAQs
  services.forEach((service) => {
    faqs.push({
      id: faqId++,
      category: "experiences",
      question: `What can I expect from the ${service.service_name}?`,
      answer: `${service.service_description || `The ${service.service_name} is one of our premium experiences.`}${service.location ? ` Located in ${service.location}.` : ""}${service.default_price ? ` Starting from AED ${service.default_price} per person.` : ""}${service.duration ? ` Duration: approximately ${service.duration} hours.` : ""} Book now to secure your spot!`,
    });
  });

  // Pricing FAQ with real data
  if (services.some((s) => s.default_price)) {
    const pricingLines = services
      .filter((s) => s.default_price)
      .map((s) => `${s.service_name}: from AED ${s.default_price}`)
      .join("; ");
    faqs.push({
      id: faqId++,
      category: "payment",
      question: "What are your current prices?",
      answer: `Our current pricing (per person): ${pricingLines}. Prices may vary based on the package you choose. Child and group discounts are available. Check each service page for detailed package pricing.`,
    });
  }

  return faqs;
}

const FAQPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from database on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            "id, service_name, service_description, location, default_price, duration",
          );

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error("Failed to fetch services for FAQ:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);

  // Combine general FAQs with dynamically generated service FAQs
  const allFaqs = useMemo(() => {
    const dynamicFaqs = generateServiceFaqs(services);
    return [...dynamicFaqs, ...generalFaqData];
  }, [services]);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, allFaqs]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allFaqs.length };
    allFaqs.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, [allFaqs]);

  return (
    <div className="faq-page">
      <Header />

      {/* Hero Section */}
      <Box className="faq-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" className="faq-title">
            How Can We Help?
          </Typography>
          <Typography variant="h6" className="faq-subtitle">
            Find answers to common questions about Travel Guroo's UAE
            experiences
          </Typography>

          {/* Search Bar */}
          <Box className="faq-search-container">
            <TextField
              fullWidth
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 600,
                mx: "auto",
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputBase-input": {
                  py: 2,
                  fontSize: "1.1rem",
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box className="faq-content">
        <Container maxWidth="lg">
          {/* Category Filters */}
          <Box className="faq-categories">
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              useFlexGap
              sx={{ gap: 1 }}
            >
              {categories.map((cat) => (
                <Chip
                  key={cat.id}
                  icon={cat.icon}
                  label={`${cat.label} (${categoryCounts[cat.id] || 0})`}
                  onClick={() => setSelectedCategory(cat.id)}
                  variant={selectedCategory === cat.id ? "filled" : "outlined"}
                  sx={{
                    px: 1,
                    py: 2.5,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    borderRadius: 3,
                    bgcolor:
                      selectedCategory === cat.id ? "#FF621F" : "transparent",
                    color: selectedCategory === cat.id ? "white" : "#4a5568",
                    borderColor:
                      selectedCategory === cat.id ? "#FF621F" : "#e2e8f0",
                    "&:hover": {
                      bgcolor:
                        selectedCategory === cat.id ? "#e55519" : "#f7fafc",
                      borderColor: "#FF621F",
                    },
                    "& .MuiChip-icon": {
                      color: selectedCategory === cat.id ? "white" : "#FF621F",
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Results Count */}
          {searchQuery && (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", mb: 3, color: "#666" }}
            >
              Found {filteredFaqs.length} result
              {filteredFaqs.length !== 1 ? "s" : ""} for "{searchQuery}"
            </Typography>
          )}

          {/* FAQ Accordions */}
          <Box className="faq-accordions">
            {loadingServices ? (
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={64}
                    sx={{ borderRadius: 3 }}
                  />
                ))}
              </Stack>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <Accordion
                  key={faq.id}
                  expanded={expanded === `panel${faq.id}`}
                  onChange={handleChange(`panel${faq.id}`)}
                  className="faq-accordion"
                  sx={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="faq-accordion-summary"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Typography className="faq-question">
                        {faq.question}
                      </Typography>
                      <Chip
                        label={faq.category}
                        size="small"
                        sx={{
                          ml: "auto",
                          mr: 2,
                          bgcolor:
                            expanded === `panel${faq.id}`
                              ? "rgba(255,255,255,0.25)"
                              : "#f0f4ff",
                          color:
                            expanded === `panel${faq.id}` ? "white" : "#4f46e5",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          display: { xs: "none", sm: "flex" },
                          transition: "all 0.3s ease",
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails className="faq-accordion-details">
                    <Typography className="faq-answer">{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "#f9fafb",
                }}
              >
                <HelpOutlineIcon
                  sx={{ fontSize: 60, color: "#d1d5db", mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: "#6b7280", mb: 1 }}>
                  No results found
                </Typography>
                <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                  Try adjusting your search or browse by category
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Contact Section */}
          <Paper className="faq-contact-section" elevation={0}>
            <Box className="faq-contact-content">
              <Box className="faq-contact-icon">
                <SupportAgentIcon sx={{ fontSize: 40, color: "#FF621F" }} />
              </Box>
              <Box>
                <Typography variant="h5" className="contact-title">
                  Still have questions?
                </Typography>
                <Typography variant="body1" className="contact-text">
                  Can't find what you're looking for? Our friendly customer
                  support team is available 24/7 to help!
                </Typography>
              </Box>
              <Box className="contact-actions">
                <a
                  href="mailto:info@travelguroo.com"
                  className="contact-link primary"
                >
                  📧 Email Support
                </a>
                <a
                  href="https://wa.me/971501234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link secondary"
                >
                  💬 WhatsApp
                </a>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default FAQPage;
