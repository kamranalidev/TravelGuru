import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Header,
  ButtonComponent,
  Footer,
  ScrollAnimation,
} from "../../../components";
import { Box, Typography, Card, CardContent } from "@mui/material";
import "./index.css";
import { supabase } from "../../../supabaseClient";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ServiceImageGallery = ({ service }: { service: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const serviceImages = getServiceImages(service);
    setImages(serviceImages);
    setCurrentImageIndex(0);
  }, [service]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/assets/desertSafari.jpg";
  };

  return (
    <div className="serviceImageWrapper">
      <div className="imageContainer">
        <img
          src={images[currentImageIndex]}
          alt={service.service_name || "Dubai service"}
          className="serviceImage"
          onError={handleImageError}
        />
        {images.length > 1 && (
          <>
            <button
              className="imageNavButton prevButton"
              onClick={prevImage}
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              className="imageNavButton nextButton"
              onClick={nextImage}
              aria-label="Next image"
            >
              &#8250;
            </button>
            <div className="imageIndicators">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const getServiceImages = (service: any): string[] => {
  try {
    let images: string[] = [];

    if (service?.service_image && typeof service.service_image === "string") {
      const parsedImages = JSON.parse(service.service_image);
      if (Array.isArray(parsedImages)) {
        images = parsedImages.filter(
          (img: any) => typeof img === "string" && img.trim() !== ""
        );
      }
    } else if (
      service?.service_image &&
      Array.isArray(service.service_image.url)
    ) {
      images = service.service_image.url.filter(
        (img: any) => typeof img === "string" && img.trim() !== ""
      );
    } else if (Array.isArray(service?.service_image)) {
      images = service.service_image.filter(
        (img: any) => typeof img === "string" && img.trim() !== ""
      );
    }

    return images.length > 0 ? images : ["/assets/desertSafari.jpg"];
  } catch (imgError) {
    console.warn("Error parsing service images:", imgError);
    return ["/assets/desertSafari.jpg"];
  }
};

export const Homepage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(true);
  const navigate = useNavigate();

  const dubaiImages = [
    "/assets/DhowCruise.jpg",
    "/assets/AbuDhabi.jpg",
    "/assets/Safari.avif",
    "/assets/AirPort.avif",
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            "id, service_name, service_description, location, service_image, default_price"
          )
          .order("created_at", { ascending: true });
        console.log("Fetched services data:", data, error);

        if (error) {
          console.error("Error fetching services:", error);
          setError("Unable to load services at the moment.");
          setServices([]);
        } else {
          const validServices = Array.isArray(data)
            ? data.filter((service) => service && service.id)
            : [];
          setServices(validServices);
          setError("");
        }
      } catch (error) {
        console.error("Unexpected error fetching services:", error);
        setError("Unexpected error fetching services. Please try again later.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false);
      setTimeout(() => {
        setCurrentHeroImageIndex(
          (prevIndex) => (prevIndex + 1) % dubaiImages.length
        );
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, [dubaiImages.length]);

  useEffect(() => {
    dubaiImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [dubaiImages]);

  const handleServiceClick = (service: any) => {
    if (!service?.id) return;
    const servicePayload = {
      ...service,
      description:
        service?.service_description ??
        service?.description ??
        "Premium experience curated by Travel Guroo.",
    };
    navigate(`/bookings/${service.id}`, { state: servicePayload });
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || isNaN(Number(price))) {
      return "Contact for pricing";
    }
    return `From AED ${Number(price).toLocaleString()}`;
  };

  const scrollToServices = () => {
    const servicesSection = document.querySelector(".featuredDestinations");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <Header />
      <Box className="heroSection">
        <div className="heroBackground">
          <img
            className="heroBackgroundImage"
            src={dubaiImages[currentHeroImageIndex]}
            alt="Dubai"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = dubaiImages[0];
              setImageLoaded(true);
            }}
            style={{
              transition: "opacity 0.8s ease-in-out",
              opacity: imageLoaded ? 1 : 0.7,
            }}
          />
          <div className="heroOverlay"></div>
        </div>
        <div className="heroContent">
          <div className="heroText">
            <div className="heroBadge">
              <span>✨ Premium Dubai Tours</span>
            </div>
            <h1 className="heroTitle">
              Discover Dubai's
              <br />
              <span className="heroTitleHighlight">Hidden Gems</span>
            </h1>
            <p className="heroSubtitle">
              Experience luxury, adventure, and culture with our curated tours.
              From desert safaris to city explorations, we make your Dubai
              dreams come true.
            </p>
            <div className="heroStats">
              <div className="heroStatItem">
                <strong>100k+</strong>
                <span>Happy Travelers</span>
              </div>
              <div className="heroStatItem">
                <strong>500+</strong>
                <span>Tours Completed</span>
              </div>
              <div className="heroStatItem">
                <strong>4.9</strong>
                <span>Average Rating</span>
              </div>
            </div>
            <div className="heroActions">
              <ButtonComponent
                title="Explore Tours"
                onClick={scrollToServices}
                style={{ padding: "14px 32px", fontSize: "1.1rem" }}
              />
              <button
                className="heroSecondaryButton"
                onClick={() => navigate("/faq")}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
        <div className="heroImageIndicators">
          {dubaiImages.map((_, index) => (
            <div
              key={index}
              className={`indicator ${
                index === currentHeroImageIndex ? "active" : ""
              }`}
              onClick={() => {
                setImageLoaded(false);
                setTimeout(() => {
                  setCurrentHeroImageIndex(index);
                }, 200);
              }}
            />
          ))}
        </div>
      </Box>

      <Box id="premium-services" className="featuredDestinations">
        <div className="sectionContainer">
          <ScrollAnimation animationType="fadeIn">
            <Typography className="sectionTitle">
              Popular{" "}
              <span className="sectionTitleHighlight">Destinations</span>
            </Typography>
            <Typography className="sectionSubtitle">
              Explore our most loved destinations in Dubai
            </Typography>
          </ScrollAnimation>

          <div className="servicesGrid">
            {loading ? (
              <div className="servicesPlaceholder">Loading services...</div>
            ) : error ? (
              <div className="servicesPlaceholder">{error}</div>
            ) : services.length === 0 ? (
              <div className="servicesPlaceholder">
                No services available right now. Please check back later.
              </div>
            ) : (
              services.map((service, index) => (
                <ScrollAnimation
                  key={service.id}
                  animationType="slideUp"
                  delay={index * 100}
                >
                  <div
                    className="serviceCard"
                    onClick={() => handleServiceClick(service)}
                  >
                    <ServiceImageGallery service={service} />
                    <div className="serviceInfo">
                      <h3 className="serviceTitle">
                        {service.service_name || "Untitled Service"}
                      </h3>
                      <p className="serviceLocation">
                        {service.location ? `📍 ${service.location}` : "Dubai"}
                      </p>
                      <p className="serviceDescription">
                        {service.service_description ||
                          "Premium Dubai experience."}
                      </p>
                      <div className="serviceMeta">
                        <span className="servicePrice">
                          {formatPrice(service.default_price)}
                        </span>
                        <ButtonComponent
                          title="View Details"
                          width="auto"
                          style={{ padding: "10px 20px", fontSize: "0.95rem" }}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))
            )}
          </div>
        </div>
      </Box>

      <Box className="whyChooseUs">
        <div className="sectionContainer">
          <ScrollAnimation animationType="fadeIn">
            <Typography className="sectionTitle">
              Why Choose{" "}
              <span className="sectionTitleHighlight">Travel Guroo</span>
            </Typography>
            <Typography className="sectionSubtitle">
              We're committed to making your Dubai experience unforgettable
            </Typography>
          </ScrollAnimation>
          <Box
            className="featuresGrid"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 4,
            }}
          >
            <Box>
              <ScrollAnimation animationType="slideUp" delay={0}>
                <div className="featureCard">
                  <div className="featureIcon">
                    <VerifiedUserIcon sx={{ fontSize: 40 }} />
                  </div>
                  <Typography className="featureTitle">
                    Trusted & Verified
                  </Typography>
                  <Typography className="featureDescription">
                    All our tours are verified and trusted by thousands of
                    travelers
                  </Typography>
                </div>
              </ScrollAnimation>
            </Box>
            <Box>
              <ScrollAnimation animationType="slideUp" delay={100}>
                <div className="featureCard">
                  <div className="featureIcon">
                    <SupportAgentIcon sx={{ fontSize: 40 }} />
                  </div>
                  <Typography className="featureTitle">24/7 Support</Typography>
                  <Typography className="featureDescription">
                    Our team is always available to assist you throughout your
                    journey
                  </Typography>
                </div>
              </ScrollAnimation>
            </Box>
            <Box>
              <ScrollAnimation animationType="slideUp" delay={200}>
                <div className="featureCard">
                  <div className="featureIcon">
                    <LocalOfferIcon sx={{ fontSize: 40 }} />
                  </div>
                  <Typography className="featureTitle">Best Prices</Typography>
                  <Typography className="featureDescription">
                    Competitive pricing with no hidden fees or surprises
                  </Typography>
                </div>
              </ScrollAnimation>
            </Box>
            <Box>
              <ScrollAnimation animationType="slideUp" delay={300}>
                <div className="featureCard">
                  <div className="featureIcon">
                    <AccessTimeIcon sx={{ fontSize: 40 }} />
                  </div>
                  <Typography className="featureTitle">
                    Flexible Booking
                  </Typography>
                  <Typography className="featureDescription">
                    Easy cancellation and rescheduling options available
                  </Typography>
                </div>
              </ScrollAnimation>
            </Box>
          </Box>
        </div>
      </Box>

      <Box className="testimonialsSection">
        <div className="sectionContainer">
          <ScrollAnimation animationType="fadeIn">
            <Typography className="sectionTitle">
              What Our{" "}
              <span className="sectionTitleHighlight">Travelers Say</span>
            </Typography>
            <Typography className="sectionSubtitle">
              Don't just take our word for it - hear from our satisfied
              customers
            </Typography>
          </ScrollAnimation>
          <Box
            className="testimonialsGrid"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            <Box>
              <ScrollAnimation animationType="slideUp" delay={0}>
                <Card className="testimonialCard">
                  <CardContent>
                    <div className="testimonialRating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon
                          key={i}
                          sx={{ color: "#FFD700", fontSize: 20 }}
                        />
                      ))}
                    </div>
                    <Typography className="testimonialText">
                      "Amazing experience! The desert safari was absolutely
                      incredible. The guides were knowledgeable and the whole
                      trip was well organized."
                    </Typography>
                    <div className="testimonialAuthor">
                      <div className="testimonialAvatar"></div>
                      <div>
                        <Typography className="testimonialName">
                          Sarah Johnson
                        </Typography>
                        <Typography className="testimonialLocation">
                          United States
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            </Box>
            <Box>
              <ScrollAnimation animationType="slideUp" delay={100}>
                <Card className="testimonialCard">
                  <CardContent>
                    <div className="testimonialRating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon
                          key={i}
                          sx={{ color: "#FFD700", fontSize: 20 }}
                        />
                      ))}
                    </div>
                    <Typography className="testimonialText">
                      "Best tour company in Dubai! Professional service, great
                      prices, and unforgettable memories. Highly recommend to
                      everyone!"
                    </Typography>
                    <div className="testimonialAuthor">
                      <div className="testimonialAvatar"></div>
                      <div>
                        <Typography className="testimonialName">
                          Michael Chen
                        </Typography>
                        <Typography className="testimonialLocation">
                          Singapore
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            </Box>
            <Box>
              <ScrollAnimation animationType="slideUp" delay={200}>
                <Card className="testimonialCard">
                  <CardContent>
                    <div className="testimonialRating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <StarIcon
                          key={i}
                          sx={{ color: "#FFD700", fontSize: 20 }}
                        />
                      ))}
                    </div>
                    <Typography className="testimonialText">
                      "Exceeded all expectations! The city tour was fantastic
                      and the booking process was so easy. Will definitely book
                      again!"
                    </Typography>
                    <div className="testimonialAuthor">
                      <div className="testimonialAvatar"></div>
                      <div>
                        <Typography className="testimonialName">
                          Emma Williams
                        </Typography>
                        <Typography className="testimonialLocation">
                          United Kingdom
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            </Box>
          </Box>
        </div>
      </Box>
      <Box className="subscribe">
        <ScrollAnimation animationType="scale">
          <div className="subscribeContent">
            <Typography className="subscribeHeader">
              Subscribe and get exclusive
              <br />
              deal & offers
            </Typography>
            <div className="subscribeInput">
              <input
                placeholder="Enter your email"
                className="subscribeField"
                type="email"
              />
              <ButtonComponent title="Subscribe" width="auto" />
            </div>
          </div>
        </ScrollAnimation>
      </Box>
      <Footer />
    </div>
  );
};
