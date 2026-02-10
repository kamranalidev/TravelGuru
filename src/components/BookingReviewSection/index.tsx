import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { ReviewsList } from "../ReviewsList";
import { useAuth } from "../../hooks/useAuth";

interface BookingReviewSectionProps {
  bookingId: number;
  serviceName: string;
  bookingStatus: "pending" | "confirmed" | "completed" | "cancelled";
  userId: string;
}


export const BookingReviewSection = ({
  bookingId,
  serviceName,
  bookingStatus,
  userId,
}: BookingReviewSectionProps) => {
  const { session } = useAuth();

  
  const canSubmitReview =
    bookingStatus === "completed" && session?.user?.id === userId;

  return (
    <Card
      sx={{
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        mt: 3,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your Experience
          </Typography>
          {bookingStatus === "completed" && (
            <Chip
              label="Completed"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        {bookingStatus !== "completed" && (
          <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
            You can write a review once your booking is completed.
          </Typography>
        )}

        <ReviewsList
          bookingId={bookingId}
          serviceName={serviceName}
          showSubmitButton={canSubmitReview}
          allowSubmission={canSubmitReview}
          limit={5}
        />
      </CardContent>
    </Card>
  );
};
