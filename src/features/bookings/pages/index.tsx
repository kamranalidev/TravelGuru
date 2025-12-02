import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ButtonComponent,
  Header,
  ReviewComponent,
  ProfileModal,
  Footer,
} from "../../../components";
import {
  Alert,
  Box,
  Typography,
  Button,
  styled,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useAuth } from "../../../hooks/useAuth";
import "./index.css";

import dayjs from "dayjs";
function StandardImageList(props: any) {
  const images =
    props?.Images?.map((imgUrl: string, index: number, arr: string[]) => ({
      src: imgUrl,
      rows: arr.length % 2 !== 0 && index === arr.length - 1 ? 3 : 2,
      cols: arr.length % 2 !== 0 && index === arr.length - 1 ? 2 : 1,
    })) || [];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/assets/desertSafari.jpg";
  };

  return (
    <ImageList
      sx={{
        borderRadius: "20px",
        width: "100%",
        height: 450,
        // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
        transform: "translateZ(0)",
      }}
      rowHeight={200}
      gap={1}
    >
      {images.map((item: any, idx: any) => (
        <ImageListItem
          key={idx}
          cols={item.cols || 1}
          rows={item.rows || 1}
          onClick={() => props.handleClick(item.src)}
        >
          <img
            src={item.src}
            alt={`Service image ${idx + 1}`}
            loading="lazy"
            onError={handleImageError}
            style={{
              cursor: "pointer",
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
const SubscriptionBox = styled(Box)(({ theme }) => ({
  borderRadius: "28px",
  background:
    "linear-gradient(135deg, rgba(255, 112, 67, 1) 0%, rgba(255, 152, 0, 1) 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "28px 24px",
  gap: "16px",
  color: "#ffffff",
  boxShadow: "0 18px 36px rgba(255, 130, 70, 0.25)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  position: "relative",
  border: "1px solid rgba(255, 255, 255, 0.35)",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 22px 44px rgba(255, 130, 70, 0.3)",
  },
  "&.selected": {
    boxShadow: "0 24px 50px rgba(255, 130, 70, 0.35)",
    borderColor: "#ffffff",
  },
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const BookingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isViewDatePicker] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [date, setDate] = useState(dayjs()); // today's date
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [departureArrivalTime, setDepartureArrivalTime] = useState<dayjs.Dayjs | null>(null);
  const navigate = useNavigate();
  const { session, profile, refreshProfile } = useAuth();
  const [bookingFeedback, setBookingFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isBooking] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [userBookingId, setUserBookingId] = useState<number | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [pageData, setPageData] = useState({
    Image: [] as string[],
    description: "",
    id: 0,
    location: "",
    service_name: "",
    updated_at: "",
    default_price: 0,
  });

  const { state } = useLocation();

  useEffect(() => {
    if (!!state) {
      // Parse service images from different possible formats
      let serviceImages: string[] = [];

      try {
        if (state?.service_image) {
          // Handle JSON string format from database
          if (typeof state.service_image === "string") {
            const parsedImages = JSON.parse(state.service_image);
            if (Array.isArray(parsedImages)) {
              serviceImages = parsedImages.filter(
                (img: any) => typeof img === "string" && img.trim() !== ""
              );
            }
          }
          // Handle object with url array
          else if (Array.isArray(state.service_image?.url)) {
            serviceImages = state.service_image.url.filter(
              (img: any) => typeof img === "string" && img.trim() !== ""
            );
          }
          // Handle direct array
          else if (Array.isArray(state.service_image)) {
            serviceImages = state.service_image.filter(
              (img: any) => typeof img === "string" && img.trim() !== ""
            );
          }
        }
      } catch (error) {
        console.warn("Error parsing service images:", error);
      }

      // Fallback to default image if no valid images found
      const fallbackImage = "/assets/desertSafari.jpg";
      const imageUrls =
        serviceImages.length > 0 ? serviceImages : [fallbackImage];

      setPageData({
        Image: imageUrls,
        description:
          state?.service_description ||
          state?.description ||
          "Experience Dubai like never before.",
        id: state?.id ?? 0,
        location: state?.location || "Dubai",
        service_name: state?.service_name || "Dubai Experience",
        updated_at: state?.updated_at || "",
        default_price: state?.default_price ?? 0,
      });
      setSelectedId(0);
      setSelectedPackage(null);
    }
    const fetchPackages = async () => {
      if (!state?.id) {
        console.warn("No service ID provided for fetching packages");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("service_id", state.id)
          .order("price", { ascending: true });

        if (error) {
          console.error("Error fetching packages:", error);
          setPackages([]);
        } else if (Array.isArray(data)) {
          // Filter out any invalid packages
          const validPackages = data.filter((pkg) => pkg && pkg.id && pkg.name);
          setPackages(validPackages);
          console.log(
            `Fetched ${validPackages.length} packages for service ${state.id}`
          );
        } else {
          setPackages([]);
        }
      } catch (error) {
        console.error("Unexpected error fetching packages:", error);
        setPackages([]);
      }
    };

    fetchPackages();
    // edge case if user directly lands on this page without navigation via refresh
  }, []);

  // Check if user has a booking for this service that they can review
  useEffect(() => {
    const checkUserBooking = async () => {
      if (!session?.user?.id || !pageData.id) {
        setUserBookingId(null);
        setCanReview(false);
        return;
      }

      try {
        // Check for bookings for this service by this user
        // Allow reviews for any booking (not just completed ones)
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("id, booking_date")
          .eq("service_id", pageData.id)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error checking user bookings:", error);
          return;
        }

        if (bookings && bookings.length > 0) {
          // Check if user already reviewed this booking
          const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("booking_id", bookings[0].id)
            .eq("user_id", session.user.id)
            .single();

          if (!existingReview) {
            setUserBookingId(bookings[0].id);
            setCanReview(true);
          } else {
            setUserBookingId(null);
            setCanReview(false);
          }
        } else {
          setUserBookingId(null);
          setCanReview(false);
        }
      } catch (err) {
        console.error("Error checking user booking:", err);
      }
    };

    checkUserBooking();
  }, [session?.user?.id, pageData.id]);

  const handleClick = (imgSrc: string) => {
    setSelectedImg(imgSrc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImg("");
  };

  // Calculate the final price based on selected package
  const calculatePrice = () => {
    if (selectedPackage?.price) {
      return selectedPackage.price;
    }

    if (typeof pageData.default_price === "number") {
      return pageData.default_price;
    }
    return 0;
  };

  const finalPrice = calculatePrice();

  const formatCurrency = (value: any) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "Contact for pricing";
    }
    return `AED ${Number(value).toLocaleString()}`;
  };

  // Check if service is airport pickup
  const isAirportPickup = pageData?.service_name?.toLowerCase().includes("airport pickup") || 
                          pageData?.service_name?.toLowerCase().includes("airport") && 
                          pageData?.service_name?.toLowerCase().includes("pickup");

  // Check if user profile has all required fields
  const checkProfileCompletion = () => {
    if (!profile) {
      return {
        isComplete: false,
        missingFields: ["Profile information"],
      };
    }

    const requiredFields = [
      { key: "full_name", label: "Full Name" },
      { key: "phone_number", label: "Phone Number" },
      { key: "nationality", label: "Nationality" },
      { key: "address", label: "Address" },
    ];

    const missingFields = requiredFields
      .filter(
        (field) =>
          !profile[field.key as keyof typeof profile]?.toString().trim()
      )
      .map((field) => field.label);

    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  };

  const basePackage = {
    id: 0,
    name: "Standard Experience",
    description:
      "Includes our signature highlights, guided support, and convenient transfers.",
    price: pageData.default_price,
    isBase: true,
  };

  const hasAddOnPackages = Array.isArray(packages) && packages.length > 0;

  const packagesToDisplay = hasAddOnPackages
    ? [basePackage, ...packages.map((pack) => ({ ...pack, isBase: false }))]
    : [];

  // Handle booking navigation with all data
  const handleBookNow = async () => {
    if (!pageData.id) {
      console.warn("No service ID available for booking");
      return;
    }

    if (!session?.user) {
      setBookingFeedback({
        type: "error",
        message: "Please log in to complete your booking.",
      });
      navigate("/login", {
        state: {
          redirectTo: `/bookings/${pageData.id}`,
          servicePayload: state || null,
        },
      });
      return;
    }

    // Check if profile is complete
    const profileStatus = checkProfileCompletion();
    if (!profileStatus.isComplete) {
      setBookingFeedback({
        type: "error",
        message: `Please complete your profile before booking. Missing: ${profileStatus.missingFields.join(
          ", "
        )}`,
      });
      setShowProfileModal(true);
      return;
    }

    // Show confirmation dialog
    setShowConfirmationDialog(true);
  };

  // Proceed to checkout for payment
  const proceedWithBooking = async () => {
    setShowConfirmationDialog(false);
    setBookingFeedback(null);

    // Validate required data before proceeding to checkout
    if (!pageData.id || !session?.user?.id || !date) {
      setBookingFeedback({
        type: "error",
        message:
          "Missing required booking information. Please refresh and try again.",
      });
      return;
    }

    // Validate time for airport pickup services
    if (isAirportPickup && !departureArrivalTime) {
      setBookingFeedback({
        type: "error",
        message: "Please select your departure/arrival time.",
      });
      return;
    }

    // Check for duplicate booking on the same day
    try {
      const bookingDateString = date.format("YYYY-MM-DD");
      const { data: existingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("booking_date", bookingDateString);

      if (checkError) {
        console.error("Error checking for duplicate bookings:", checkError);
        // Continue with booking if check fails (don't block user)
      } else if (existingBookings && existingBookings.length > 0) {
        setBookingFeedback({
          type: "error",
          message: "You already have a booking on this date. Please select a different date.",
        });
        return;
      }
    } catch (err) {
      console.error("Error checking for duplicate bookings:", err);
      // Continue with booking if check fails
    }

    const bookingData = {
      trip: {
        id: pageData.id,
        name: pageData.service_name,
        location: pageData.location,
        description: pageData.description,
        default_price: pageData.default_price,
        images: pageData.Image, // Include all images
      },
      bookingDate: date.format("YYYY-MM-DD"), // Format date as string
      departureArrivalTime: departureArrivalTime ? departureArrivalTime.format("HH:mm") : null,
      selectedPackage: selectedPackage || null,
      finalPrice: finalPrice,
      packageName: selectedPackage?.name || "Standard Experience",
    };

    // Navigate to checkout for payment
    navigate("/checkout", { state: bookingData });
  };
  const MAX_CHARS = 500; // adjust this based on how many lines you want

  const isLong = pageData.description?.length > MAX_CHARS;
  return (
    <div>
      <Header />
      <Box className="servicePageContainer">
        <Box className="serviceIntro">
          <Box>
            <Typography variant="h3" className="serviceTitle">
              {pageData?.service_name}
            </Typography>
            <Typography className="serviceLocationTag">
              {pageData?.location ? `📍 ${pageData.location}` : "📍 Dubai, UAE"}
            </Typography>
          </Box>
        </Box>

        <div className="serviceGalleryWrapper">
          <StandardImageList
            Images={pageData.Image}
            handleClick={handleClick}
          />
        </div>

        <Box className="serviceDetails">
          <Box className="serviceDetailsContent">
            <Box className="serviceDescriptionBox">
              <Typography variant="h4" className="sectionHeading">
                About this experience
              </Typography>
              <Typography
                className="serviceDescriptionText"
                sx={{
                  WebkitLineClamp: expanded ? "unset" : 5,
                }}
              >
                {pageData?.description}
              </Typography>
              {isLong && (
                <Button
                  onClick={() => setExpanded((prev) => !prev)}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    color: "#FF621F",
                    fontWeight: 600,
                  }}
                >
                  {expanded ? "Show less" : "Show more"}
                </Button>
              )}
            </Box>

            <Box className="planSection">
              <Typography variant="h4" className="sectionHeading planHeading">
                {hasAddOnPackages ? "Choose your plan" : "Included experience"}
              </Typography>
              <Typography className="planSubtitle">
                {hasAddOnPackages
                  ? "Select the package that matches how you like to explore Dubai."
                  : basePackage.description}
              </Typography>
              {hasAddOnPackages ? (
                <Box className="planGrid">
                  {packagesToDisplay.map((pack: any) => {
                    const packId = pack.isBase ? 0 : pack.id;
                    const isSelected = selectedId === packId;
                    return (
                      <SubscriptionBox
                        key={packId}
                        className={isSelected ? "selected" : ""}
                        onClick={() => {
                          setSelectedId(packId);
                          setSelectedPackage(pack.isBase ? null : pack);
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {pack.isBase ? "Standard Experience" : pack.name}
                        </Typography>
                        {pack.duration && (
                          <Typography sx={{ fontWeight: 500, opacity: 0.9 }}>
                            {pack.duration}
                          </Typography>
                        )}
                        <Typography sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                          {pack.description ||
                            "Immerse yourself in handpicked highlights with a seamless travel schedule."}
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                        >
                          {formatCurrency(pack.price)}
                        </Typography>
                        <ButtonComponent
                          title={
                            isSelected
                              ? "Selected"
                              : pack.isBase
                              ? "Included"
                              : "Choose Plan"
                          }
                          width="100%"
                          bgColor="#FFFFFF"
                          style={{
                            color: "#FF621F",
                            fontWeight: 600,
                            borderRadius: "14px",
                          }}
                          onClick={() => {
                            setSelectedId(packId);
                            setSelectedPackage(pack.isBase ? null : pack);
                          }}
                        />
                      </SubscriptionBox>
                    );
                  })}
                </Box>
              ) : (
                <Box className="basePlanSummary">
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {basePackage.name}
                  </Typography>
                  <Typography sx={{ opacity: 0.9, lineHeight: 1.6, mb: 2 }}>
                    {basePackage.description}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {formatCurrency(basePackage.price)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box className="priceBox">
            <Typography className="priceLabel">Starting from</Typography>
            <Typography className="priceValue">
              {formatCurrency(finalPrice)}
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, marginTop: "8px", marginBottom: "12px" }}
            >
              Select your date
            </Typography>
            {!!isViewDatePicker && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={date}
                  onChange={(newValue: any) => {
                    if (newValue) {
                      setDate(newValue);
                    }
                  }}
                  sx={{
                    width: "100%",
                    maxHeight: "320px",
                    "& .MuiPickersCalendarHeader-root": {
                      paddingLeft: "12px",
                      paddingRight: "12px",
                      marginTop: "8px",
                    },
                    "& .MuiDayCalendar-root": {
                      fontSize: "0.85rem",
                    },
                    "& .MuiPickersDay-root": {
                      fontSize: "0.85rem",
                      margin: "2px",
                    },
                    "& .MuiPickersCalendarHeader-switchViewButton": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </LocalizationProvider>
            )}

            {/* Time picker for airport pickup services */}
            {isAirportPickup && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, marginBottom: "12px" }}
                >
                  Select departure/arrival time
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Departure/Arrival Time"
                    value={departureArrivalTime}
                    onChange={(newValue: any) => {
                      setDepartureArrivalTime(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        },
                      },
                    }}
                    sx={{
                      width: "100%",
                    }}
                  />
                </LocalizationProvider>
              </Box>
            )}

            <ButtonComponent
              title={isBooking ? "Processing..." : "Book Now"}
              width="100%"
              bgColor="#FF621F"
              onClick={handleBookNow}
              isLoading={isBooking}
              loadingText="Processing..."
              disabled={isBooking}
            />
            {bookingFeedback && (
              <Alert
                severity={bookingFeedback.type}
                onClose={() => setBookingFeedback(null)}
                sx={{ mt: 1 }}
              >
                {bookingFeedback.message}
              </Alert>
            )}
          </Box>
        </Box>
        <ReviewComponent 
          serviceId={pageData.id} 
          bookingId={userBookingId || undefined}
          limit={5}
          showReviewForm={true} // Always show form button if user can review
          allowReviewSubmission={canReview && !!session?.user} // Only allow if user is logged in and has booking
        />
      </Box>

      {/* Dialog for fullscreen image */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <Box sx={{ position: "relative", backgroundColor: "black" }}>
          <img
            src={selectedImg}
            alt="Full size service image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/desertSafari.jpg";
            }}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
          <Button
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              minWidth: "auto",
              padding: "8px",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            ✕
          </Button>
        </Box>
      </Dialog>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={async () => {
          setShowProfileModal(false);
          // Refresh profile data and clear any error messages
          await refreshProfile();
          setBookingFeedback(null);
        }}
      />

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="600">
            Confirm Your Booking
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {pageData.service_name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            📍 {pageData.location}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            📅 {date.format("MMMM DD, YYYY")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            🎫 {selectedPackage?.name || "Standard Experience"}
          </Typography>
          <Typography
            variant="h6"
            sx={{ mt: 2, fontWeight: 700, color: "#FF621F" }}
          >
            Total: {formatCurrency(finalPrice)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Are you sure you want to proceed with this booking?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: "center" }}>
          <Button
            onClick={() => setShowConfirmationDialog(false)}
            variant="outlined"
            sx={{
              borderColor: "#ddd",
              color: "#666",
              "&:hover": {
                borderColor: "#ccc",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={proceedWithBooking}
            variant="contained"
            disabled={isBooking}
            sx={{
              background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
              "&:hover": {
                background: "linear-gradient(135deg, #E5541B, #E67B44)",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            {isBooking ? "Processing..." : "Yes, Book Now"}
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </div>
  );
};
