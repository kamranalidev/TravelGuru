import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import { Header, Footer } from "../../../../components";
import { supabase } from "../../../../supabaseClient";
import { useAuth } from "../../../../hooks/useAuth";
import theme from "../../../../theme";
import dayjs from "dayjs";
import "./index.css";

interface Booking {
  id: number;
  created_at: string;
  service_id: number;
  package_id: number | null;
  user_id: string;
  booking_date: string;
  departure_arrival_time: string | null;
  services: {
    service_name: string;
    location: string;
    service_image: any;
  } | null;
  packages: {
    name: string;
    price: number;
  } | null;
}

export const MyBookings = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [session]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:service_id (
            service_name,
            location,
            service_image
          ),
          packages:package_id (
            name,
            price
          )
        `
        )
        .eq("user_id", session?.user?.id)
        .order("booking_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getServiceImage = (service: any): string => {
    try {
      if (!service?.service_image) return "/assets/burjKhalifa.jpg";

      if (typeof service.service_image === "string") {
        const parsed = JSON.parse(service.service_image);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } else if (Array.isArray(service.service_image)) {
        if (service.service_image.length > 0) {
          return service.service_image[0];
        }
      } else if (service.service_image?.url && Array.isArray(service.service_image.url)) {
        if (service.service_image.url.length > 0) {
          return service.service_image.url[0];
        }
      }

      return "/assets/burjKhalifa.jpg";
    } catch {
      return "/assets/burjKhalifa.jpg";
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("DD MMM YYYY");
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    return dayjs(timeString, "HH:mm").format("h:mm A");
  };

  const getStatusColor = (bookingDate: string) => {
    const today = dayjs();
    const booking = dayjs(bookingDate);
    
    if (booking.isBefore(today, "day")) {
      return "default"; // Past booking
    } else if (booking.isSame(today, "day")) {
      return "warning"; // Today
    } else {
      return "success"; // Upcoming
    }
  };

  const getStatusLabel = (bookingDate: string) => {
    const today = dayjs();
    const booking = dayjs(bookingDate);
    
    if (booking.isBefore(today, "day")) {
      return "Completed";
    } else if (booking.isSame(today, "day")) {
      return "Today";
    } else {
      return "Upcoming";
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress sx={{ color: theme.palette.secondary.main }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Header />
      <Box className="my-bookings-container">
        <Box className="my-bookings-header">
          <Typography variant="h3" className="my-bookings-title">
            My Bookings
          </Typography>
          <Typography variant="body1" className="my-bookings-subtitle">
            View and manage all your travel bookings
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: "1200px", mx: "auto" }}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Box className="no-bookings">
            <Typography variant="h5" sx={{ mb: 2, color: "#666" }}>
              No bookings found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "#999" }}>
              You haven't made any bookings yet. Start exploring our services!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: "#E5541B",
                },
              }}
            >
              Browse Services
            </Button>
          </Box>
        ) : (
          <Box className="bookings-grid">
            {bookings.map((booking) => (
              <Card key={booking.id} className="booking-card">
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "200px",
                    overflow: "hidden",
                    borderRadius: "12px 12px 0 0",
                  }}
                >
                  <img
                    src={getServiceImage(booking.services)}
                    alt={booking.services?.service_name || "Service"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/burjKhalifa.jpg";
                    }}
                  />
                  <Chip
                    label={getStatusLabel(booking.booking_date)}
                    color={getStatusColor(booking.booking_date)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    {booking.services?.service_name || "Service"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                    📍 {booking.services?.location || "Dubai, UAE"}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
                      <strong>Booking Date:</strong> 📅 {formatDate(booking.booking_date)}
                    </Typography>
                    {booking.departure_arrival_time && (
                      <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
                        <strong>Time:</strong> 🕐 {formatTime(booking.departure_arrival_time)}
                      </Typography>
                    )}
                    {booking.packages && (
                      <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
                        <strong>Package:</strong> 📦 {booking.packages.name}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      <strong>Booking ID:</strong> #{booking.id}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pt: 2,
                      borderTop: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.secondary.main,
                      }}
                    >
                      {booking.packages
                        ? `AED ${Number(booking.packages.price).toLocaleString()}`
                        : "Contact for pricing"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

