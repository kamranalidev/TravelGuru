import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import EventBusyIcon from "@mui/icons-material/EventBusy";

const DEFAULT_CANCELLATION = `Cancellation Policy

STANDARD SERVICES
- Free cancellation up to 48 hours before the activity
- 50% refund for cancellations 24-48 hours before
- No refund for cancellations less than 24 hours before

PREMIUM & COMBO PACKAGES
- Free cancellation up to 72 hours before the activity
- 50% refund for cancellations 48-72 hours before
- No refund for cancellations less than 48 hours before

AIRPORT TRANSFERS
- Free cancellation up to 24 hours before pickup time
- No refund for cancellations less than 24 hours before

WEATHER-RELATED CANCELLATIONS
- Full refund provided for cancellations due to adverse weather conditions
- Rescheduling available at no extra cost

REFUND PROCESSING
- Approved refunds are processed within 7-14 business days
- Refunds are issued to the original payment method`;

export default function CancellationPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("cancellation_policy")
          .eq("id", 1)
          .maybeSingle();
        setContent(data?.cancellation_policy || DEFAULT_CANCELLATION);
      } catch {
        setContent(DEFAULT_CANCELLATION);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#f8f9fb", minHeight: "100vh" }}>
      <Header />
      {/* Hero Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#fff",
          py: { xs: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <EventBusyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            Cancellation Policy
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: "1.1rem" }}>
            Understand our cancellation and refund terms
          </Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              p: { xs: 3, md: 5 },
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            <Typography
              component="div"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                color: "#374151",
                fontSize: "0.95rem",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {content}
            </Typography>
            <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid #e5e7eb" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
