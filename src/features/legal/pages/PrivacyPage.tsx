import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { Header, Footer } from "../../../components";
import { supabase } from "../../../supabaseClient";
import ShieldIcon from "@mui/icons-material/Shield";

const DEFAULT_PRIVACY = `Privacy Policy

1. INFORMATION WE COLLECT
We collect personal information you provide during registration and booking, including name, email, phone number, and payment details.

2. HOW WE USE YOUR INFORMATION
Your information is used to process bookings, send confirmations, improve our services, and communicate important updates.

3. DATA SECURITY
We use industry-standard encryption and security measures to protect your personal data.

4. COOKIES
Our website uses cookies to enhance your browsing experience and analyze site traffic.

5. THIRD-PARTY SHARING
We do not sell your personal information. Data may be shared with service providers solely for booking fulfillment.

6. YOUR RIGHTS
You may request access to, correction of, or deletion of your personal data by contacting our support team.

7. CONTACT
For privacy-related inquiries, contact privacy@travelguru.ae`;

export default function PrivacyPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("privacy_policy")
          .eq("id", 1)
          .maybeSingle();
        setContent(data?.privacy_policy || DEFAULT_PRIVACY);
      } catch {
        setContent(DEFAULT_PRIVACY);
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacy();
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
          <ShieldIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            Privacy Policy
          </Typography>
          <Typography sx={{ opacity: 0.8, fontSize: "1.1rem" }}>
            How we collect, use, and protect your personal information
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
