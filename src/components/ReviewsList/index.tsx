import { Box, Typography } from "@mui/material";
import { ReviewComponent } from "../Review";
import { ReviewSubmission } from "../ReviewSubmission";
import { useState } from "react";

interface ReviewsListProps {
  serviceId?: number;
  bookingId?: number;
  serviceName?: string;
  limit?: number;
  showSubmitButton?: boolean;
  allowSubmission?: boolean;
}

export const ReviewsList = ({
  serviceId,
  bookingId,
  serviceName,
  limit = 10,
  showSubmitButton = false,
  allowSubmission = false,
}: ReviewsListProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewSubmitted = () => {
    // Force refresh the reviews list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#333",
          }}
        >
          Reviews
        </Typography>

        {showSubmitButton && allowSubmission && bookingId && (
          <ReviewSubmission
            bookingId={bookingId}
            serviceName={serviceName}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </Box>

      <ReviewComponent
        key={refreshKey}
        serviceId={serviceId}
        bookingId={bookingId}
        limit={limit}
      />
    </Box>
  );
};
