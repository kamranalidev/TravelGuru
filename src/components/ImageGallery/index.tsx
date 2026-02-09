import React, { useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Modal,
  Fade,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CollectionsIcon from "@mui/icons-material/Collections";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import "./index.css";

interface ImageItem {
  url: string;
  path?: string;
}

interface ImageGalleryProps {
  images: (string | ImageItem)[];
  serviceName?: string;
  showThumbnails?: boolean;
  maxVisible?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [],
  serviceName = "Gallery",
  showThumbnails = true,
  maxVisible = 4,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Normalize images to array of URLs
  const normalizedImages = images.map((img) =>
    typeof img === "string" ? img : img.url,
  );

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === 0 ? normalizedImages.length - 1 : prev - 1,
    );
  }, [normalizedImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === normalizedImages.length - 1 ? 0 : prev + 1,
    );
  }, [normalizedImages.length]);

  const handleLightboxPrevious = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === 0 ? normalizedImages.length - 1 : prev - 1,
    );
  }, [normalizedImages.length]);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === normalizedImages.length - 1 ? 0 : prev + 1,
    );
  }, [normalizedImages.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleLightboxPrevious();
      if (e.key === "ArrowRight") handleLightboxNext();
      if (e.key === "Escape") setLightboxOpen(false);
    },
    [handleLightboxPrevious, handleLightboxNext],
  );

  if (normalizedImages.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 300,
          bgcolor: "#f5f5f5",
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">No images available</Typography>
      </Box>
    );
  }

  // Single image layout
  if (normalizedImages.length === 1) {
    return (
      <Box
        className="image-gallery-single"
        sx={{
          position: "relative",
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
          "&:hover .zoom-overlay": { opacity: 1 },
        }}
        onClick={() => openLightbox(0)}
      >
        <img
          src={normalizedImages[0]}
          alt={serviceName}
          style={{
            width: "100%",
            height: isMobile ? 250 : 400,
            objectFit: "cover",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/desertSafari.jpg";
          }}
        />
        <Box
          className="zoom-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s",
          }}
        >
          <ZoomInIcon sx={{ fontSize: 48, color: "white" }} />
        </Box>
      </Box>
    );
  }

  const visibleCount = Math.min(maxVisible, normalizedImages.length);
  const remainingCount = normalizedImages.length - visibleCount;

  return (
    <>
      {/* Main Gallery Grid */}
      <Box className="image-gallery-container" sx={{ position: "relative" }}>
        {/* Desktop: Grid Layout */}
        {!isMobile && normalizedImages.length >= 2 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                normalizedImages.length === 2 ? "1fr 1fr" : "2fr 1fr",
              gridTemplateRows:
                normalizedImages.length > 2 ? "1fr 1fr" : "auto",
              gap: 1,
              borderRadius: 3,
              overflow: "hidden",
              height: 400,
            }}
          >
            {/* Main large image */}
            <Box
              sx={{
                gridRow: normalizedImages.length > 2 ? "1 / 3" : "1",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
                "&:hover img": { transform: "scale(1.05)" },
                "&:hover .zoom-overlay": { opacity: 1 },
              }}
              onClick={() => openLightbox(0)}
            >
              <img
                src={normalizedImages[0]}
                alt={`${serviceName} - Main`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/desertSafari.jpg";
                }}
              />
              <Box
                className="zoom-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
              >
                <ZoomInIcon sx={{ fontSize: 48, color: "white" }} />
              </Box>
            </Box>

            {/* Secondary images */}
            {normalizedImages.slice(1, visibleCount).map((img, idx) => (
              <Box
                key={idx + 1}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  "&:hover img": { transform: "scale(1.05)" },
                  "&:hover .zoom-overlay": { opacity: 1 },
                }}
                onClick={() => openLightbox(idx + 1)}
              >
                <img
                  src={img}
                  alt={`${serviceName} - ${idx + 2}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/assets/desertSafari.jpg";
                  }}
                />
                <Box
                  className="zoom-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  {idx === visibleCount - 2 && remainingCount > 0 ? (
                    <Stack alignItems="center" sx={{ color: "white" }}>
                      <CollectionsIcon sx={{ fontSize: 36 }} />
                      <Typography fontWeight={700}>
                        +{remainingCount} more
                      </Typography>
                    </Stack>
                  ) : (
                    <ZoomInIcon sx={{ fontSize: 36, color: "white" }} />
                  )}
                </Box>
                {/* Show "+X more" overlay on last visible image if there are more */}
                {idx === visibleCount - 2 && remainingCount > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Stack alignItems="center" sx={{ color: "white" }}>
                      <CollectionsIcon sx={{ fontSize: 36 }} />
                      <Typography fontWeight={700} fontSize={18}>
                        +{remainingCount} more
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Mobile: Carousel Layout */}
        {isMobile && (
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                width: "100%",
                height: 250,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={normalizedImages[selectedIndex]}
                alt={`${serviceName} - ${selectedIndex + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onClick={() => openLightbox(selectedIndex)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/desertSafari.jpg";
                }}
              />

              {/* Navigation arrows */}
              {normalizedImages.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevious}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255,255,255,0.9)",
                      "&:hover": { bgcolor: "white" },
                    }}
                    size="small"
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255,255,255,0.9)",
                      "&:hover": { bgcolor: "white" },
                    }}
                    size="small"
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}

              {/* Image counter */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {selectedIndex + 1} / {normalizedImages.length}
              </Box>
            </Box>

            {/* Thumbnail dots */}
            {showThumbnails && normalizedImages.length > 1 && (
              <Stack
                direction="row"
                spacing={0.5}
                justifyContent="center"
                sx={{ mt: 1.5 }}
              >
                {normalizedImages.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    sx={{
                      width: idx === selectedIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor:
                        idx === selectedIndex ? "#FF621F" : "rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* View all button for desktop */}
        {!isMobile && normalizedImages.length > 1 && (
          <Box
            onClick={() => openLightbox(0)}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              bgcolor: "white",
              px: 2,
              py: 1,
              borderRadius: 2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
            }}
          >
            <CollectionsIcon sx={{ fontSize: 20 }} />
            <Typography fontWeight={600} fontSize={14}>
              View all {normalizedImages.length} photos
            </Typography>
          </Box>
        )}
      </Box>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        closeAfterTransition
      >
        <Fade in={lightboxOpen}>
          <Box
            onKeyDown={handleKeyDown}
            tabIndex={0}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.95)",
              display: "flex",
              flexDirection: "column",
              outline: "none",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                color: "white",
              }}
            >
              <Typography fontWeight={600}>
                {lightboxIndex + 1} / {normalizedImages.length}
              </Typography>
              <IconButton
                onClick={() => setLightboxOpen(false)}
                sx={{ color: "white" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Image container */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                px: { xs: 2, md: 8 },
              }}
            >
              {/* Previous button */}
              <IconButton
                onClick={handleLightboxPrevious}
                sx={{
                  position: "absolute",
                  left: { xs: 8, md: 24 },
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 32 }} />
              </IconButton>

              {/* Current image */}
              <img
                src={normalizedImages[lightboxIndex]}
                alt={`${serviceName} - ${lightboxIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 180px)",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/desertSafari.jpg";
                }}
              />

              {/* Next button */}
              <IconButton
                onClick={handleLightboxNext}
                sx={{
                  position: "absolute",
                  right: { xs: 8, md: 24 },
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>

            {/* Thumbnails */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "center",
                gap: 1,
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  borderRadius: 2,
                },
              }}
            >
              {normalizedImages.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  sx={{
                    width: 60,
                    height: 45,
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    opacity: idx === lightboxIndex ? 1 : 0.5,
                    border:
                      idx === lightboxIndex
                        ? "2px solid #FF621F"
                        : "2px solid transparent",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/desertSafari.jpg";
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};
