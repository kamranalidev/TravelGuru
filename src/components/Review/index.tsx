import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { supabase } from "../../supabaseClient";
import "./index.css";

interface Review {
  id: number;
  created_at: string;
  user_id: string | null;
  review: string | null;
  booking_id: number | null;
  user_profiles?: {
    full_name: string | null;
    profile_picture: string | null;
    email: string | null;
  } | null;
}

interface ReviewComponentProps {
  serviceId?: number;
  bookingId?: number;
  limit?: number;
}

export const ReviewComponent = ({
  serviceId,
  bookingId,
  limit = 10,
}: ReviewComponentProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          user_profiles (
            full_name,
            profile_picture,
            email
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      // Filter by booking_id if provided
      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }
      // Filter by service_id through bookings if provided
      else if (serviceId) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("id")
          .eq("service_id", serviceId);

        if (bookingsError) throw bookingsError;

        const bookingIds = bookingsData?.map((b) => b.id) || [];
        if (bookingIds.length > 0) {
          query = query.in("booking_id", bookingIds);
        } else {
          // No bookings for this service, so no reviews
          setReviews([]);
          setLoading(false);
          return;
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Supabase query error:", fetchError);
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedReviews = (data || []).map((review: any) => {
        // Handle both array and object responses from Supabase
        let userProfile = review.user_profiles;
        if (Array.isArray(userProfile)) {
          userProfile = userProfile[0] || null;
        }

        return {
          id: review.id,
          created_at: review.created_at,
          user_id: review.user_id,
          review: review.review,
          booking_id: review.booking_id,
          user_profiles: userProfile
            ? {
                full_name: userProfile.full_name,
                profile_picture: userProfile.profile_picture,
                email: userProfile.email,
              }
            : null,
        };
      });

      setReviews(transformedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [serviceId, bookingId, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress sx={{ color: "#FF621F" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
          No reviews yet
        </Typography>
        <Typography variant="body2" sx={{ color: "#999" }}>
          Be the first to share your experience!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: "#333",
        }}
      >
        Guest Reviews ({reviews.length})
      </Typography>

      {reviews.map((review) => (
        <Box
          key={review.id}
          sx={{
            backgroundColor: "#F0F0F0",
            margin: "20px 0",
            borderRadius: "20px",
            padding: "20px",
            width: { xs: "100%", md: "80%" },
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              mb: 2,
            }}
          >
            <Avatar
              src={review.user_profiles?.profile_picture || undefined}
              alt={review.user_profiles?.full_name || "User"}
              sx={{
                width: 50,
                height: 50,
                bgcolor: "#FF621F",
                color: "#fff",
              }}
            >
              {(() => {
                const profile = review.user_profiles;
                if (profile?.full_name) {
                  const initials = profile.full_name
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return initials || "U";
                }
                if (profile?.email) {
                  return profile.email.charAt(0).toUpperCase();
                }
                return "U";
              })()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                {review.user_profiles?.full_name || "Anonymous"}
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "0.875rem" }}>
                {formatDate(review.created_at)}
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              lineHeight: 1.6,
              color: "#444",
              whiteSpace: "pre-wrap",
              mt: 1,
            }}
          >
            {review.review || "No review text provided."}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
