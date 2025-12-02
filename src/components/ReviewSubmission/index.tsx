import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { ButtonComponent } from "../Button";
import theme from "../../theme";

interface ReviewSubmissionProps {
  bookingId: number;
  serviceName?: string;
  onReviewSubmitted?: () => void;
}

export const ReviewSubmission = ({
  bookingId,
  serviceName,
  onReviewSubmitted,
}: ReviewSubmissionProps) => {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(false);
    setReviewText("");
  };

  const handleClose = () => {
    if (!submitting) {
      setOpen(false);
      setReviewText("");
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError("Please log in to submit a review");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review before submitting");
      return;
    }

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Check if user already reviewed this booking
      const { data: existingReview, error: checkError } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("user_id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned (expected if no review exists)
        throw checkError;
      }

      if (existingReview) {
        setError("You have already submitted a review for this booking");
        setSubmitting(false);
        return;
      }

      // Insert the review
      const { error: insertError } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        user_id: session.user.id,
        review: reviewText.trim(),
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setReviewText("");

      // Call the callback to refresh reviews
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
          setOpen(false);
          setSuccess(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(
        err.message || "Failed to submit review. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ButtonComponent
        title="Write a Review"
        onClick={handleOpen}
        width="auto"
        bgColor={theme.palette.secondary.main}
        style={{ padding: "10px 20px" }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: { xs: "16px", md: "24px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Write a Review
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            sx={{ color: "#666" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {serviceName && (
            <Typography
              variant="body2"
              sx={{ color: "#666", mb: 2, fontWeight: 600 }}
            >
              Reviewing: {serviceName}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Review submitted successfully!
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Your Review"
            placeholder="Share your experience with this service..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            disabled={submitting || success}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            helperText={`${reviewText.length} characters (minimum 10)`}
            error={reviewText.length > 0 && reviewText.length < 10}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{
              color: "#666",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <ButtonComponent
            title={submitting ? "Submitting..." : "Submit Review"}
            onClick={handleSubmit}
            disabled={submitting || success || !reviewText.trim() || reviewText.trim().length < 10}
            width="auto"
            bgColor={theme.palette.secondary.main}
            style={{ padding: "10px 24px" }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
