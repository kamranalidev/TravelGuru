import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Card, CardMedia, CardContent, Typography, Chip, Grid } from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";

type Service = {
  id: string;
  service_name: string;
  service_description: string;
  location: string;
  service_image: any;
  default_price: number;
};

const getServiceImages = (service: Service): string[] => {
  try {
    if (typeof service.service_image === "string") {
      const parsed = JSON.parse(service.service_image);
      if (Array.isArray(parsed)) {
        return parsed.filter((img) => typeof img === "string" && img.trim() !== "");
      }
    }
    if (Array.isArray(service.service_image?.url)) {
      return service.service_image.url.filter((img: string) => typeof img === "string" && img.trim() !== "");
    }
    if (Array.isArray(service.service_image)) {
      return service.service_image.filter((img: string) => typeof img === "string" && img.trim() !== "");
    }
  } catch (_e) {}
  return ["/assets/burjKhalifa.jpg"];
};

export const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setServices((data || []).filter((service) => service && service.id));
      } catch (e) {
        console.error("Error fetching services:", e);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service: Service) => {
    if (!service?.id) return;
    const servicePayload = {
      ...service,
      description:
        service.service_description ||
        "Premium experience curated by Travel Guroo.",
      name: service.service_name,
      price: service.default_price,
    };

    navigate(`/bookings/${service.id}`, { state: servicePayload });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#111827" }}
          >
            All Services
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#6B7280", maxWidth: 640 }}
          >
            Discover curated Dubai experiences by Travel Guroo. Choose one of our
            premium tours to see details, inclusions, and secure your spot.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {loading
            ? Array.from(new Array(4)).map((_, index) => (
                <Grid xs={12} sm={6} lg={3} key={index}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      bgcolor: "white",
                    }}
                  />
                </Grid>
              ))
                : services.map((service) => {
                const images = getServiceImages(service);

                return (
                  <Grid xs={12} sm={6} lg={3} key={service.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        cursor: "pointer",
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.16)",
                        },
                      }}
                      onClick={() => handleServiceClick(service)}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="220"
                          image={images[0]}
                          alt={service.service_name}
                          sx={{ objectFit: "cover" }}
                        />
                        <Chip
                          label="Travel Guroo choice"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "#FF621F",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#6B7280", mb: 0.5 }}
                        >
                          {service.location || "Dubai"}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            mb: 1,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {service.service_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6B7280",
                            mb: 2,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {service.service_description ||
                            "Experience Dubai with a carefully planned itinerary."}
                        </Typography>
                        <Box
                          sx={{
                            mt: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            pt: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6B7280", display: "block" }}
                            >
                              From
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#FF621F" }}
                            >
                              AED{" "}
                              {Number(service.default_price || 0).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
};

export default ServicesPage;


