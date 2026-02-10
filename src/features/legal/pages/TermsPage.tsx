import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import GavelIcon from "@mui/icons-material/Gavel";

const DEFAULT_TERMS = `Terms and Conditions

1. BOOKING & PAYMENT
All bookings are subject to availability. Payment is required at the time of booking. Prices are listed in AED and include applicable taxes unless otherwise stated.

2. CANCELLATION POLICY
Cancellation policies vary by service. Please refer to the specific service details for cancellation terms.

3. MODIFICATIONS
Booking modifications are subject to availability and may incur additional charges.

4. LIABILITY
Travel Guru acts as an intermediary between customers and service providers.

5. REFUNDS
Approved refunds will be processed within 7-14 business days to the original payment method.

6. USER ACCOUNTS
Users are responsible for maintaining the confidentiality of their account credentials.

7. PRIVACY
Your personal information is handled in accordance with our Privacy Policy.

8. CONTACT
For questions about these terms, contact us at support@travelguru.ae`;

export default function TermsPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("terms_and_conditions")
          .eq("id", 1)
          .maybeSingle();
        setContent(data?.terms_and_conditions || DEFAULT_TERMS);
      } catch {
        setContent(DEFAULT_TERMS);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
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
          <GavelIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            Terms &amp; Conditions
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: "1.1rem" }}>
            Please read these terms carefully before using our services
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
                "& strong, & b": { color: "#1a1a1a" },
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
