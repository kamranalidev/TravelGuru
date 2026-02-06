import React, { useEffect, useRef, useState } from "react";
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
import ScheduleIcon from "@mui/icons-material/Schedule";

// Helper functions for formatting service details
const formatTime = (t: string | null | undefined) => {
  if (!t) return null;
  const d = new Date(`1970-01-01T${t}`);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleTimeString("en-AE", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (hours: number | string | null | undefined) => {
  const v = Number(hours);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v === 1 ? "1 hr" : `${v} hrs`;
};

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
    <>
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
    </>
  );
};

const getServiceImages = (service: any): string[] => {
  try {
    let images: string[] = [];
    const imgVal = service?.service_image;

    if (imgVal) {
      // Handle JSON string format from database
      if (typeof imgVal === "string") {
        const parsedImages = JSON.parse(imgVal);
        if (Array.isArray(parsedImages)) {
          images = parsedImages
            .map((x: any) => (typeof x === "string" ? x : x?.url))
            .filter((u: any) => typeof u === "string" && u.trim() !== "");
        }
      }
      // Handle direct array (may contain strings or { url, path } objects)
      else if (Array.isArray(imgVal)) {
        images = imgVal
          .map((x: any) => (typeof x === "string" ? x : x?.url))
          .filter((u: any) => typeof u === "string" && u.trim() !== "");
      }
      // Handle object with url array
      else if (Array.isArray(imgVal?.url)) {
        images = imgVal.url.filter(
          (img: any) => typeof img === "string" && img.trim() !== "",
        );
      }
      // Handle single object: { url: string }
      else if (typeof imgVal?.url === "string" && imgVal.url.trim() !== "") {
        images = [imgVal.url];
      }
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
  const [testimonials, setTestimonials] = useState<
    {
      id: number;
      text: string;
      name: string;
      location: string;
    }[]
  >([]);
  const [testimonialsError, setTestimonialsError] = useState("");
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(true);
  const navigate = useNavigate();
  const servicesCarouselRef = useRef<HTMLDivElement | null>(null);
  const testimonialsCarouselRef = useRef<HTMLDivElement | null>(null);

  const dubaiImages = [
    "/assets/DhowCruise.jpg",
    "/assets/AbuDhabi.jpg",
    "/assets/Safari.avif",
    "/assets/AirPort.avif",
  ];

  const testimonialsCount = testimonials.length;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select(
            "id, service_name, service_description, location, service_image, default_price, service_type, daily_slots, start_time, end_time, duration, days",
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
    const fetchTestimonials = async () => {
      if (!services.length) {
        setTestimonials([]);
        setTestimonialsError("");
        return;
      }

      setTestimonialsError("");
      const serviceIds = services.map((service) => service.id).filter(Boolean);
      if (serviceIds.length === 0) {
        setTestimonials([]);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id,
          review,
          rating,
          booking_id,
          user_profiles (
            full_name
          ),
          bookings!inner (
            service_id,
            services (
              service_name,
              location
            )
          )
        `,
        )
        .eq("rating", 5)
        .in("bookings.service_id", serviceIds)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonialsError("Unable to load reviews right now.");
        setTestimonials([]);
        return;
      }

      const mapped = new Map<number, any>();
      for (const row of data ?? []) {
        const booking = Array.isArray(row.bookings)
          ? row.bookings[0]
          : row.bookings;
        const serviceId = booking?.service_id
          ? Number(booking.service_id)
          : null;
        if (!serviceId || mapped.has(serviceId)) continue;

        const serviceData =
          booking?.services && Array.isArray(booking.services)
            ? booking.services[0]
            : booking?.services;

        const userProfile = Array.isArray(row.user_profiles)
          ? row.user_profiles[0]
          : row.user_profiles;

        mapped.set(serviceId, {
          id: row.id,
          text: row.review ? `"${row.review}"` : `"Wonderful experience!"`,
          name:
            userProfile?.full_name?.trim() ||
            (serviceData as any)?.service_name ||
            "Guest",
          location: (serviceData as any)?.location || "Traveler",
        });
      }

      setTestimonials(Array.from(mapped.values()));
    };

    void fetchTestimonials();
  }, [services]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false);
      setTimeout(() => {
        setCurrentHeroImageIndex(
          (prevIndex) => (prevIndex + 1) % dubaiImages.length,
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

  const scrollCarousel = (
    ref: { current: HTMLDivElement | null },
    direction: "prev" | "next",
  ) => {
    const el = ref.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.9;
    const delta = direction === "next" ? scrollAmount : -scrollAmount;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const isServicesCarousel = services.length > 3;
  const isTestimonialsCarousel = testimonialsCount > 3;

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

          {isServicesCarousel && (
            <div className="carouselControls">
              <button
                className="carouselButton"
                onClick={() => scrollCarousel(servicesCarouselRef, "prev")}
                aria-label="Previous services"
              >
                &#8249;
              </button>
              <button
                className="carouselButton"
                onClick={() => scrollCarousel(servicesCarouselRef, "next")}
                aria-label="Next services"
              >
                &#8250;
              </button>
            </div>
          )}

          <div
            className={`servicesGrid ${
              isServicesCarousel ? "servicesCarousel" : ""
            }`}
            ref={servicesCarouselRef}
          >
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
                    <div className="serviceImageWrapper">
                      {service.service_type && (
                        <span
                          className={`serviceTypeBadge ${service.service_type}`}
                        >
                          {service.service_type}
                        </span>
                      )}
                      <ServiceImageGallery service={service} />
                    </div>
                    <div className="serviceInfo">
                      <h3 className="serviceTitle">
                        {service.service_name || "Untitled Service"}
                      </h3>
                      <p className="serviceLocation">
                        📍 {service.location || "Dubai"}
                      </p>
                      <p className="serviceDescription">
                        {service.service_description ||
                          "Premium Dubai experience."}
                      </p>

                      {/* Service Details */}
                      <div className="serviceDetails">
                        {service.start_time &&
                          service.end_time &&
                          formatTime(service.start_time) &&
                          formatTime(service.end_time) && (
                            <span className="serviceDetailItem">
                              <ScheduleIcon sx={{ fontSize: 14 }} />
                              {formatTime(service.start_time)} –{" "}
                              {formatTime(service.end_time)}
                            </span>
                          )}
                        {service.duration &&
                          formatDuration(service.duration) && (
                            <span className="serviceDetailItem">
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              {formatDuration(service.duration)}
                            </span>
                          )}
                      </div>

                      <div className="serviceMeta">
                        <div className="servicePriceWrapper">
                          <span className="servicePriceLabel">From</span>
                          <span
                            className={`servicePrice ${
                              !service.default_price ? "contact" : ""
                            }`}
                          >
                            {formatPrice(service.default_price)}
                          </span>
                        </div>
                        <ButtonComponent
                          title="Book Now"
                          width="auto"
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
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
          {isTestimonialsCarousel && (
            <div className="carouselControls">
              <button
                className="carouselButton"
                onClick={() => scrollCarousel(testimonialsCarouselRef, "prev")}
                aria-label="Previous reviews"
              >
                &#8249;
              </button>
              <button
                className="carouselButton"
                onClick={() => scrollCarousel(testimonialsCarouselRef, "next")}
                aria-label="Next reviews"
              >
                &#8250;
              </button>
            </div>
          )}

          {testimonialsError ? (
            <div className="servicesPlaceholder">{testimonialsError}</div>
          ) : testimonials.length === 0 ? (
            <div className="servicesPlaceholder">
              No 5-star reviews yet. Be the first to share your experience!
            </div>
          ) : (
            <div
              className={`testimonialsGrid ${
                isTestimonialsCarousel ? "testimonialsCarousel" : ""
              }`}
              ref={testimonialsCarouselRef}
            >
              {testimonials.map((testimonial, index) => (
                <ScrollAnimation
                  key={`${testimonial.id}-${index}`}
                  animationType="slideUp"
                  delay={index * 100}
                >
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
                        {testimonial.text}
                      </Typography>
                      <div className="testimonialAuthor">
                        <div className="testimonialAvatar"></div>
                        <div>
                          <Typography className="testimonialName">
                            {testimonial.name}
                          </Typography>
                          <Typography className="testimonialLocation">
                            {testimonial.location}
                          </Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          )}
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
