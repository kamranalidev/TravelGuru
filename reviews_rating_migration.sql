-- Add rating column to reviews table
-- This column stores the star rating (1-5) given by the user

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS rating INTEGER;

-- Add constraint to ensure rating is between 1 and 5
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);

-- Add comment to explain the column
COMMENT ON COLUMN public.reviews.rating IS 'Star rating from 1 to 5 stars';
