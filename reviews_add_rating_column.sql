-- Add rating column to reviews table
-- This migration adds a rating column to store user ratings (1-5 stars)

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add comment to explain the column
COMMENT ON COLUMN public.reviews.rating IS 'User rating from 1 to 5 stars';

-- Create an index on rating for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Update existing reviews to have a default rating (optional - remove if not needed)
-- UPDATE public.reviews SET rating = 5 WHERE rating IS NULL;
