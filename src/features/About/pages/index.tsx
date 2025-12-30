import React from "react";
import { Box, Typography, Container, Card, CardContent } from "@mui/material";
import { Header, Footer } from "../../../components";
import "./index.css";
import ExploreIcon from "@mui/icons-material/Explore";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <GroupsIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Local Expertise",
      description:
        "Our guides are storytellers who know the hidden gems of the UAE. We don't just show you places—we share the soul of Arabia.",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Safety First",
      description:
        "All our vehicles are modern, fully insured, and driven by certified professionals. Your safety is our top priority.",
    },
    {
      icon: <ExploreIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Tailored Experience",
      description:
        "From private VIP tours to group adventures, we adapt to your pace. Every journey is customized to your preferences.",
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Transparent Pricing",
      description:
        "No hidden fees or 'tourist traps'—just honest value for incredible memories. What you see is what you get.",
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Personalized Service",
      description:
        "We treat every guest like family and every tour like a once-in-a-lifetime event. Your satisfaction is our success.",
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 48, color: "#FF621F" }} />,
      title: "Unforgettable Moments",
      description:
        "We curate experiences that linger in your memory long after the sand has been brushed off your shoes.",
    },
  ];

  return (
    <div className="about-page">
      <Header />

      {/* Hero Section */}
      <Box className="about-hero">
        <Container maxWidth="lg">
          <Typography variant="h2" className="about-title">
            Welcome to Travel Guroo
          </Typography>
          <Typography variant="h6" className="about-subtitle">
            Your Gateway to the Arabian Dream
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box className="about-mission-section">
        <Container maxWidth="lg">
          <Box className="about-grid">
            <Box className="about-grid-item">
              <img
                src="/assets/Safari.avif"
                alt="Desert Safari Experience"
                className="about-mission-image"
              />
            </Box>
            <Box className="about-grid-item">
              <Typography variant="h3" className="about-section-title">
                Who We Are
              </Typography>
              <Typography className="about-text">
                At Travel Guroo, we don't just offer tours; we curate
                experiences that linger in your memory long after the sand has
                been brushed off your shoes. Based in the heart of the UAE, we
                are a team of passionate explorers and local experts dedicated
                to showing you the true essence of Arabian hospitality.
              </Typography>
              <Typography className="about-text">
                Whether you are a thrill-seeker looking to conquer the dunes or
                a soul searcher wanting to glide along the creek under a moonlit
                sky, we are here to make your journey seamless, authentic, and
                unforgettable.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mission Statement */}
      <Box className="about-vision-section">
        <Container maxWidth="lg">
          <Box className="about-grid about-grid-reverse">
            <Box className="about-grid-item">
              <Typography variant="h3" className="about-section-title">
                Our Mission
              </Typography>
              <Typography className="about-text">
                To be the most trusted travel partner in the UAE by delivering
                high-quality, personalized service that turns first-time
                visitors into lifelong friends of the Emirates.
              </Typography>
              <Typography
                className="about-text"
                sx={{ fontStyle: "italic", fontWeight: 600, color: "#FF621F" }}
              >
                "At Travel Guroo, our philosophy is simple: We treat every guest
                like family and every tour like a once-in-a-lifetime event."
              </Typography>
            </Box>
            <Box className="about-grid-item">
              <img
                src="/assets/DhowCruise.jpg"
                alt="Dhow Cruise Experience"
                className="about-vision-image"
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Values Section */}
      <Box className="about-values-section">
        <Container maxWidth="lg">
          <Typography variant="h3" className="about-section-title-center">
            Why Choose Travel Guroo?
          </Typography>
          <Typography className="about-values-subtitle">
            Our commitment to excellence in every journey
          </Typography>
          <Box className="about-values-grid">
            {values.map((value, index) => (
              <Card className="about-value-card" key={index}>
                <CardContent className="about-value-content">
                  <Box className="about-value-icon">{value.icon}</Box>
                  <Typography variant="h5" className="about-value-title">
                    {value.title}
                  </Typography>
                  <Typography className="about-value-description">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box className="about-why-section">
        <Container maxWidth="lg">
          <Typography variant="h3" className="about-section-title-center">
            What We Do Best
          </Typography>
          <Typography className="about-values-subtitle">
            The "Big Four" experiences that define a visit to the Emirates
          </Typography>
          <Box className="about-features-grid">
            <Box className="about-feature">
              <Typography variant="h5" className="about-feature-title">
                �️ Desert Safari
              </Typography>
              <Typography className="about-feature-text">
                Experience the raw beauty of the Arabian desert with
                heart-pounding dune bashing, camel treks, and traditional
                Bedouin-style dinners under the stars. Feel the adrenaline rush
                as you conquer the golden dunes.
              </Typography>
            </Box>
            <Box className="about-feature">
              <Typography variant="h5" className="about-feature-title">
                ⛵ Dhow Cruise
              </Typography>
              <Typography className="about-feature-text">
                Drift through history on a traditional wooden Dhow. Enjoy a
                5-star buffet and live entertainment as you witness the
                glittering skyline of Dubai Marina or the historic Creek under
                the moonlit sky.
              </Typography>
            </Box>
            <Box className="about-feature">
              <Typography variant="h5" className="about-feature-title">
                🕌 Abu Dhabi City Tour
              </Typography>
              <Typography className="about-feature-text">
                Explore the capital's grandeur, from the breathtaking Sheikh
                Zayed Grand Mosque to the futuristic sights of Yas Island.
                Discover the perfect blend of tradition and modernity.
              </Typography>
            </Box>
            <Box className="about-feature">
              <Typography variant="h5" className="about-feature-title">
                ✈️ Airport Pickup & Drop-off
              </Typography>
              <Typography className="about-feature-text">
                Start and end your trip with zero stress. Our punctual,
                professional chauffeurs ensure you move between the airport and
                your destination in total comfort and safety.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="about-cta-section">
        <Container maxWidth="lg">
          <Typography variant="h3" className="about-cta-title">
            Ready to Start Your Adventure?
          </Typography>
          <Typography className="about-cta-text">
            Let Travel Guroo be your guide to the extraordinary. Experience the
            true essence of Arabian hospitality and create memories that last a
            lifetime.
          </Typography>
          <Box className="about-cta-buttons">
            <a href="/services" className="about-cta-button primary">
              Explore Our Services
            </a>
            <a href="/contact" className="about-cta-button secondary">
              Get in Touch
            </a>
          </Box>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};

export default AboutPage;
