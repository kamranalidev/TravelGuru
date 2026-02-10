import { useState } from "react";
import { Box, Typography, TextField, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, } from "@mui/material";
import { Rating } from "react-simple-star-rating";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
interface ReviewSubmissionProps {
    bookingId: number;
    serviceName?: string;
    onReviewSubmitted?: () => void;
}
export const ReviewSubmission = ({ bookingId, serviceName, onReviewSubmitted, }: ReviewSubmissionProps) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [hasExistingReview, setHasExistingReview] = useState(false);
    const { session } = useAuth();
    const handleOpen = async () => {
        setOpen(true);
        setFeedback(null);
        
        if (session?.user?.id) {
            const { data, error } = await supabase
                .from("reviews")
                .select("id")
                .eq("booking_id", bookingId)
                .eq("user_id", session.user.id)
                .limit(1);
            if (error) {
                return;
            }
            if (data && data.length > 0) {
                setHasExistingReview(true);
                setFeedback({
                    type: "error",
                    message: "You have already submitted a review for this booking.",
                });
            }
        }
    };
    const handleClose = () => {
        setOpen(false);
        setRating(0);
        setReviewText("");
        setFeedback(null);
        setHasExistingReview(false);
    };
    const handleSubmit = async () => {
        if (!session?.user?.id) {
            setFeedback({
                type: "error",
                message: "You must be logged in to submit a review.",
            });
            return;
        }
        if (rating === 0) {
            setFeedback({
                type: "error",
                message: "Please provide a rating.",
            });
            return;
        }
        if (!reviewText.trim()) {
            setFeedback({
                type: "error",
                message: "Please write a review.",
            });
            return;
        }
        if (reviewText.trim().length < 10) {
            setFeedback({
                type: "error",
                message: "Review must be at least 10 characters long.",
            });
            return;
        }
        setSubmitting(true);
        setFeedback(null);
        try {
            const { data: existing, error: existsError } = await supabase
                .from("reviews")
                .select("id")
                .eq("booking_id", bookingId)
                .eq("user_id", session.user.id)
                .limit(1);
            if (existsError)
                throw existsError;
            if (existing && existing.length > 0) {
                setHasExistingReview(true);
                setFeedback({
                    type: "error",
                    message: "You have already submitted a review for this booking.",
                });
                return;
            }
            const { error } = await supabase
                .from("reviews")
                .insert({
                booking_id: bookingId,
                user_id: session.user.id,
                review: reviewText.trim(),
                rating: rating,
            })
                .select()
                .single();
            if (error) {
                if (String((error as any).code) === "23505") {
                    setHasExistingReview(true);
                    setFeedback({
                        type: "error",
                        message: "You have already submitted a review for this booking.",
                    });
                    return;
                }
                throw error;
            }
            setHasExistingReview(true);
            setFeedback({
                type: "success",
                message: "Thank you for your review! It has been submitted successfully.",
            });
            
            setRating(0);
            setReviewText("");
            
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
            
            setTimeout(() => {
                handleClose();
            }, 2000);
        }
        catch (error) {
            setFeedback({
                type: "error",
                message: "Failed to submit review. Please try again.",
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<>
      <Button variant="contained" onClick={handleOpen} sx={{
            background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
            color: "white",
            fontWeight: 600,
            borderRadius: "12px",
            textTransform: "none",
            px: 3,
            py: 1.5,
            "&:hover": {
                background: "linear-gradient(135deg, #E5541B, #E67B44)",
            },
        }}>
        Write a Review
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{
            sx: {
                borderRadius: "16px",
            },
        }}>
        <DialogTitle sx={{
            background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
            color: "white",
            fontWeight: 600,
        }}>
          Share Your Experience
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {serviceName && (<Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              How was your experience with <strong>{serviceName}</strong>?
            </Typography>)}

          {feedback && (<Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
              {feedback.message}
            </Alert>)}

          {!hasExistingReview && (<>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Your Rating *
                </Typography>
                <Rating onClick={(rate) => setRating(rate)} initialValue={rating} size={32} fillColor="#FF621F" emptyColor="#ddd" transition/>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Your Review *
                </Typography>
                <TextField multiline rows={6} fullWidth placeholder="Share details about your experience, what you enjoyed, and any suggestions for improvement..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} disabled={submitting} sx={{
                "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                        borderColor: "#FF621F",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#FF621F",
                    },
                },
            }}/>
                <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#666" }}>
                  {reviewText.length} characters (minimum 10)
                </Typography>
              </Box>
            </>)}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" disabled={submitting} sx={{
            borderColor: "#ddd",
            color: "#666",
            textTransform: "none",
            "&:hover": {
                borderColor: "#ccc",
                backgroundColor: "#f5f5f5",
            },
        }}>
            Cancel
          </Button>
          {!hasExistingReview && (<Button onClick={handleSubmit} variant="contained" disabled={submitting || rating === 0 || !reviewText.trim()} sx={{
                background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
                color: "white",
                textTransform: "none",
                minWidth: "120px",
                "&:hover": {
                    background: "linear-gradient(135deg, #E5541B, #E67B44)",
                },
                "&:disabled": {
                    background: "#ccc",
                },
            }}>
              {submitting ? (<CircularProgress size={24} sx={{ color: "white" }}/>) : ("Submit Review")}
            </Button>)}
        </DialogActions>
      </Dialog>
    </>);
};
