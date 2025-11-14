import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, ButtonComponent, Footer } from "../../../components";
import { Box, Typography } from "@mui/material";
import "./index.css";
import theme from "../../../theme";
import { supabase } from "../../../supabaseClient";

// Service Image Gallery Component
const ServiceImageGallery = ({ service }: { service: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const serviceImages = getServiceImages(service);
    setImages(serviceImages);
    setCurrentImageIndex(0);
  }, [service]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering service click
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering service click
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

// Helper function to extract images from service data
const getServiceImages = (service: any): string[] => {
  try {
    let images: string[] = [];

    // Check if service_image is a string (JSON) that needs parsing
    if (service?.service_image && typeof service.service_image === "string") {
      const parsedImages = JSON.parse(service.service_image);
      if (Array.isArray(parsedImages)) {
        images = parsedImages.filter(
          (img: any) => typeof img === "string" && img.trim() !== ""
        );
      }
    }
    // Check if service_image is already an object with url array
    else if (
      service?.service_image &&
      Array.isArray(service.service_image.url)
    ) {
      images = service.service_image.url.filter(
        (img: any) => typeof img === "string" && img.trim() !== ""
      );
    }
    // Check if service_image is already an array
    else if (Array.isArray(service?.service_image)) {
      images = service.service_image.filter(
        (img: any) => typeof img === "string" && img.trim() !== ""
      );
    }

    // Return array of valid images or fallback
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services") // table name
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
          // Ensure data is an array and contains valid entries
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

  const handleServiceClick = (service: any) => {
    if (!service?.id) return;
    const servicePayload = {
      ...service,
      description:
        service?.service_description ??
        service?.description ??
        "Premium experience curated by Travel Guru.",
    };
    navigate(`/bookings/${service.id}`, { state: servicePayload });
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || isNaN(Number(price))) {
      return "Contact for pricing";
    }
    return `From AED ${Number(price).toLocaleString()}`;
  };

  return (
    <div>
      <Header />
      {/* Hero Section */}
      <Box className="heroSection">
        <div className="heroContent">
          <div className="heroText">
            <h1 className="heroTitle">
              Dubai Tours &<br />
              Adventures
            </h1>
            <p className="heroSubtitle">
              Experience the best of Dubai with our premium services
            </p>
            <ButtonComponent title="BOOK NOW" />
          </div>
          <div className="heroImageContainer">
            <img
              className="heroImage"
              src="/assets/burjKhalifa.jpg"
              alt="Dubai"
            />
            <div className="heroImageBadge">
              <span className="badgeText">Dubai</span>
            </div>
            <div className="heroTravelers">
              <div className="travelerAvatars">
                <div className="avatar avatar1"></div>
                <div className="avatar avatar2"></div>
                <div className="avatar avatar3"></div>
              </div>
              <div className="travelerText">
                <strong>100k</strong>
                <br />
                <span>Travelers</span>
              </div>
            </div>
          </div>
        </div>
      </Box>
      {/* Featured Services */}
      <Box sx={{ backgroundColor: "#fff", padding: "60px 0" }}>
        <p className="servicesHeader">
          Our Premium{" "}
          <Typography
            sx={{ color: theme.palette.secondary.main, fontSize: "2.5rem" }}
            component="span"
          >
            Dubai Services
          </Typography>
        </p>
        <p className="servicesSubtitle">
          Explore Dubai with our exclusive selection of premium tours and
          services.
        </p>

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
            services.map((service) => (
              <div
                className="serviceCard"
                key={service.id}
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
                    {service.service_description || "Premium Dubai experience."}
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
            ))
          )}
        </div>
      </Box>

      {/* Subscribe  and get exclusive offers */}
      <Box className="subscribe">
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
      </Box>
      {/* Footer */}
      <Footer />
    </div>
  );
};
