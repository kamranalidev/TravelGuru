import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import { Header, Footer } from "../../../components";
import "./index.css";
import ExploreIcon from "@mui/icons-material/Explore";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";
import { supabase } from "../../../supabaseClient";

interface ServiceRow {
  id: number;
  service_name: string;
  service_description?: string;
  location?: string;
  default_price?: number;
}

const AboutPage: React.FC = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            "id, service_name, service_description, location, default_price",
          );

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error("Failed to fetch services for About page:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);
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

      {/* Services Section — Dynamic from database */}
      <Box className="about-why-section">
        <Container maxWidth="lg">
          <Typography variant="h3" className="about-section-title-center">
            What We Do Best
          </Typography>
          <Typography className="about-values-subtitle">
            {loadingServices
              ? "Loading our experiences..."
              : `Discover our ${services.length} curated experiences across the UAE`}
          </Typography>
          <Box className="about-features-grid">
            {loadingServices ? (
              [1, 2, 3, 4].map((i) => (
                <Box className="about-feature" key={i}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={36}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              ))
            ) : services.length > 0 ? (
              services.map((service) => (
                <Box className="about-feature" key={service.id}>
                  <Typography variant="h5" className="about-feature-title">
                    ✨ {service.service_name}
                  </Typography>
                  <Typography className="about-feature-text">
                    {service.service_description ||
                      `Experience the best of ${service.service_name} with Travel Guroo.`}
                  </Typography>
                  {service.default_price && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontWeight: 600,
                        color: "#FF621F",
                        fontSize: "0.95rem",
                      }}
                    >
                      Starting from AED {service.default_price}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#666",
                  gridColumn: "1 / -1",
                }}
              >
                Our experiences are being updated. Check back soon!
              </Typography>
            )}
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
