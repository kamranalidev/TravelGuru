import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ButtonComponent,
  Header,
  ReviewComponent,
  ProfileModal,
} from "../../../components";
import {
  Alert,
  Box,
  Typography,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { useAuth } from "../../../hooks/useAuth";
import "./index.css";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { addItem } from "../../../store/features/cart/cartSlice";
import { addServerCartItem } from "../../../store/features/serverCart/serverCartSlice";

import dayjs from "dayjs";

// Helper functions for formatting service details
const formatTime = (t: string | null | undefined) => {
  if (!t) return null;
  const d = new Date(`1970-01-01T${t}`);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleTimeString("en-AE", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (hours: number | string | null | undefined) => {
  const v = Number(hours);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v === 1 ? "1 hour" : `${v} hours`;
};

const formatDays = (value: any): string | null => {
  if (!value) return null;
  try {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        return formatDays(parsed);
      }
      return trimmed;
    }
    if (typeof value === "object") {
      if (Array.isArray((value as any).days))
        return (value as any).days.join(", ");
      const keys = Object.keys(value).filter((k) => (value as any)[k]);
      return keys.length ? keys.join(", ") : null;
    }
  } catch {
    return null;
  }
  return null;
};

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
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "#f1f1f1",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#FF621F",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#e55519",
          },
        },
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
          sx={{
            overflow: "hidden",
            borderRadius: "8px",
            bgcolor: "#f5f5f5",
          }}
        >
          <img
            src={item.src}
            alt={`Service image ${idx + 1}`}
            loading="lazy"
            onError={handleImageError}
            style={{
              cursor: "pointer",
              objectFit: "contain",
              objectPosition: "center",
              width: "100%",
              height: "100%",
              display: "block",
              backgroundColor: "#f5f5f5",
            }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export const BookingPage = () => {
  const params = useParams();
  const serviceIdFromRoute = params.id ? Number(params.id) : null;

  const [open, setOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isViewDatePicker] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [date, setDate] = useState(dayjs()); // today's date
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { session, profile, refreshProfile } = useAuth();
  const [bookingFeedback, setBookingFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isBooking] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pageData, setPageData] = useState({
    Image: [] as string[],
    description: "",
    id: 0,
    location: "",
    service_name: "",
    updated_at: "",
    default_price: 0,
    service_type: "" as string | null,
    daily_slots: null as number | null,
    start_time: null as string | null,
    end_time: null as string | null,
    duration: null as number | null,
    days: null as any,
  });

  // Airport Pickup / Dropoff extras
  const isAirportPickup =
    (pageData?.service_name ?? "").trim().toLowerCase() ===
    "airport pickup/drop";
  const [airportTime, setAirportTime] = useState<string>("");
  const [airportTransferType, setAirportTransferType] = useState<
    "pickup" | "dropoff"
  >("pickup");
  const [dropoffAddress, setDropoffAddress] = useState<string>("");

  const { state } = useLocation();

  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [packagesLoading, setPackagesLoading] = useState(false);

  useEffect(() => {
    if (!serviceIdFromRoute || Number.isNaN(serviceIdFromRoute)) return;
    if (state) return;

    const loadService = async () => {
      setServiceLoading(true);
      setServiceError(null);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceIdFromRoute)
        .maybeSingle();

      if (error) {
        setServiceError(error.message);
        setServiceLoading(false);
        return;
      }

      if (!data) {
        setServiceError("Service not found.");
        setServiceLoading(false);
        return;
      }

      const fallbackImage = "/assets/desertSafari.jpg";
      const serviceRecord = data as any;

      let serviceImages: string[] = [];
      try {
        if (serviceRecord?.service_image) {
          const imgVal = serviceRecord.service_image;
          if (typeof imgVal === "string") {
            const parsedImages = JSON.parse(imgVal);
            if (Array.isArray(parsedImages)) {
              serviceImages = parsedImages
                .map((x: any) => (typeof x === "string" ? x : x?.url))
                .filter((u: any) => typeof u === "string" && u.trim() !== "");
            }
          } else if (Array.isArray(imgVal)) {
            serviceImages = imgVal
              .map((x: any) => (typeof x === "string" ? x : x?.url))
              .filter((u: any) => typeof u === "string" && u.trim() !== "");
          } else if (Array.isArray(imgVal?.url)) {
            serviceImages = imgVal.url.filter(
              (img: any) => typeof img === "string" && img.trim() !== "",
            );
          } else if (
            typeof imgVal?.url === "string" &&
            imgVal.url.trim() !== ""
          ) {
            serviceImages = [imgVal.url];
          }
        }
      } catch {
        serviceImages = [];
      }

      const imageUrls =
        serviceImages.length > 0 ? serviceImages : [fallbackImage];

      setPageData({
        Image: imageUrls,
        description:
          serviceRecord?.service_description ||
          serviceRecord?.description ||
          "Experience Dubai like never before.",
        id: serviceRecord?.id ?? 0,
        location: serviceRecord?.location || "Dubai",
        service_name: serviceRecord?.service_name || "Dubai Experience",
        updated_at: serviceRecord?.updated_at || "",
        default_price: Number(serviceRecord?.default_price ?? 0),
        service_type: serviceRecord?.service_type || null,
        daily_slots:
          serviceRecord?.daily_slots != null
            ? Number(serviceRecord.daily_slots)
            : null,
        start_time: serviceRecord?.start_time || null,
        end_time: serviceRecord?.end_time || null,
        duration:
          serviceRecord?.duration != null
            ? Number(serviceRecord.duration)
            : null,
        days: serviceRecord?.days || null,
      });

      setSelectedId(0);
      setSelectedPackage(null);
      setServiceLoading(false);
    };

    void loadService();
  }, [serviceIdFromRoute, state]);

  useEffect(() => {
    if (!!state) {
      // Parse service images from different possible formats
      let serviceImages: string[] = [];

      try {
        if (state?.service_image) {
          const imgVal = state.service_image;
          // Handle JSON string format from database
          if (typeof imgVal === "string") {
            const parsedImages = JSON.parse(imgVal);
            if (Array.isArray(parsedImages)) {
              serviceImages = parsedImages
                .map((x: any) => (typeof x === "string" ? x : x?.url))
                .filter((u: any) => typeof u === "string" && u.trim() !== "");
            }
          }
          // Handle direct array (may contain strings or { url, path } objects)
          else if (Array.isArray(imgVal)) {
            serviceImages = imgVal
              .map((x: any) => (typeof x === "string" ? x : x?.url))
              .filter((u: any) => typeof u === "string" && u.trim() !== "");
          }
          // Handle object with url array
          else if (Array.isArray(imgVal?.url)) {
            serviceImages = imgVal.url.filter(
              (img: any) => typeof img === "string" && img.trim() !== "",
            );
          }
          // Handle single object: { url: string }
          else if (
            typeof imgVal?.url === "string" &&
            imgVal.url.trim() !== ""
          ) {
            serviceImages = [imgVal.url];
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
        service_type: state?.service_type || null,
        daily_slots:
          state?.daily_slots != null ? Number(state.daily_slots) : null,
        start_time: state?.start_time || null,
        end_time: state?.end_time || null,
        duration: state?.duration != null ? Number(state.duration) : null,
        days: state?.days || null,
      });
      setSelectedId(0);
      setSelectedPackage(null);
    }
    const fetchPackages = async () => {
      const idToUse = state?.id ?? serviceIdFromRoute;
      if (!idToUse) {
        console.warn("No service ID provided for fetching packages");
        return;
      }

      try {
        setPackagesLoading(true);
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("service_id", idToUse)
          .order("price", { ascending: true });

        if (error) {
          console.error("Error fetching packages:", error);
          setPackages([]);
        } else if (Array.isArray(data)) {
          // Filter out any invalid packages
          const validPackages = data.filter((pkg) => pkg && pkg.id && pkg.name);
          setPackages(validPackages);
          console.log(
            `Fetched ${validPackages.length} packages for service ${state.id}`,
          );
        } else {
          setPackages([]);
        }
      } catch (error) {
        console.error("Unexpected error fetching packages:", error);
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };

    void fetchPackages();
  }, [state, serviceIdFromRoute]);

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
          !profile[field.key as keyof typeof profile]?.toString().trim(),
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
          ", ",
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

    // Validate required data before proceeding to cart
    if (!pageData.id || !session?.user?.id || !date) {
      setBookingFeedback({
        type: "error",
        message:
          "Missing required booking information. Please refresh and try again.",
      });
      return;
    }

    // Airport Pickup validation
    if (isAirportPickup) {
      if (!airportTime.trim()) {
        setBookingFeedback({
          type: "error",
          message: "Please select a time for your airport transfer.",
        });
        return;
      }
      if (airportTransferType === "dropoff" && !dropoffAddress.trim()) {
        setBookingFeedback({
          type: "error",
          message: "Please enter the dropoff address.",
        });
        return;
      }
    }

    // All bookings go through cart (single service booking = 1 cart item)
    const normalizedAirportTime = (() => {
      if (!isAirportPickup) return null;
      const t = (airportTime ?? "").trim();
      if (!t) return null;
      if (t.toLowerCase() === "null") return null;
      return t;
    })();

    dispatch(
      addItem({
        serviceId: pageData.id,
        serviceName: pageData.service_name,
        location: pageData.location,
        packageId: selectedPackage?.id ?? null,
        packageName: selectedPackage?.name ?? "Standard Experience",
        bookingDate: date.format("YYYY-MM-DD"),
        bookingTime: normalizedAirportTime,
        airportType: isAirportPickup ? airportTransferType : null,
        address:
          isAirportPickup && airportTransferType === "dropoff"
            ? dropoffAddress.trim()
            : null,
        unitPrice: finalPrice,
      }),
    );

    // Persist to server-side cart when authenticated
    if (session?.user?.id) {
      void dispatch(
        addServerCartItem({
          userId: session.user.id,
          item: {
            serviceId: pageData.id,
            serviceName: pageData.service_name,
            location: pageData.location,
            packageId: selectedPackage?.id ?? null,
            packageName: selectedPackage?.name ?? "Standard Experience",
            bookingDate: date.format("YYYY-MM-DD"),
            bookingTime: normalizedAirportTime,
            airportType: isAirportPickup ? airportTransferType : null,
            address:
              isAirportPickup && airportTransferType === "dropoff"
                ? dropoffAddress.trim()
                : null,
            unitPrice: finalPrice,
          },
        }),
      );
    }

    navigate("/cart");
  };

  const addToCart = () => {
    if (!pageData.id || !date) return;

    // Airport transfer validation
    if (isAirportPickup) {
      if (!airportTime.trim()) {
        setBookingFeedback({
          type: "error",
          message: "Please select a time for your airport transfer.",
        });
        return;
      }
      if (airportTransferType === "dropoff" && !dropoffAddress.trim()) {
        setBookingFeedback({
          type: "error",
          message: "Please enter the dropoff address.",
        });
        return;
      }
    }

    const normalizedAirportTime = (() => {
      if (!isAirportPickup) return null;
      const t = (airportTime ?? "").trim();
      if (!t) return null;
      if (t.toLowerCase() === "null") return null;
      return t;
    })();

    dispatch(
      addItem({
        serviceId: pageData.id,
        serviceName: pageData.service_name,
        location: pageData.location,
        packageId: selectedPackage?.id ?? null,
        packageName: selectedPackage?.name ?? "Standard Experience",
        bookingDate: date.format("YYYY-MM-DD"),
        bookingTime: normalizedAirportTime,
        airportType: isAirportPickup ? airportTransferType : null,
        address:
          isAirportPickup && airportTransferType === "dropoff"
            ? dropoffAddress.trim()
            : null,
        unitPrice: finalPrice,
      }),
    );

    // Persist to server-side cart when authenticated
    if (session?.user?.id) {
      void dispatch(
        addServerCartItem({
          userId: session.user.id,
          item: {
            serviceId: pageData.id,
            serviceName: pageData.service_name,
            location: pageData.location,
            packageId: selectedPackage?.id ?? null,
            packageName: selectedPackage?.name ?? "Standard Experience",
            bookingDate: date.format("YYYY-MM-DD"),
            bookingTime: normalizedAirportTime,
            airportType: isAirportPickup ? airportTransferType : null,
            address:
              isAirportPickup && airportTransferType === "dropoff"
                ? dropoffAddress.trim()
                : null,
            unitPrice: finalPrice,
          },
        }),
      );
    }

    setBookingFeedback({ type: "success", message: "Added to cart." });
  };

  const MAX_CHARS = 500;
  const isLong = pageData.description?.length > MAX_CHARS;

  if (serviceLoading) {
    return (
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Header />
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (serviceError) {
    return (
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Header />
        <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
          <Alert severity="error">{serviceError}</Alert>
        </Box>
      </Box>
    );
  }

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

            {/* Service Details Section */}
            {(pageData.service_type ||
              pageData.start_time ||
              pageData.end_time ||
              pageData.duration ||
              pageData.daily_slots ||
              pageData.days) && (
              <Box
                className="serviceInfoBox"
                sx={{
                  mt: 3,
                  p: 2.5,
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 2, fontSize: "1.1rem" }}
                >
                  Experience Details
                </Typography>
                <Stack spacing={1.5}>
                  {pageData.service_type && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={pageData.service_type}
                        size="small"
                        sx={{
                          bgcolor: "#FF621F",
                          color: "white",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </Stack>
                  )}

                  {(pageData.start_time || pageData.end_time) && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ScheduleIcon sx={{ color: "#6b7280", fontSize: 20 }} />
                      <Typography sx={{ color: "#374151", fontSize: 14 }}>
                        <strong>Operating Hours:</strong>{" "}
                        {formatTime(pageData.start_time) ?? "—"} –{" "}
                        {formatTime(pageData.end_time) ?? "—"}
                      </Typography>
                    </Stack>
                  )}

                  {pageData.duration != null &&
                    formatDuration(pageData.duration) && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTimeIcon
                          sx={{ color: "#6b7280", fontSize: 20 }}
                        />
                        <Typography sx={{ color: "#374151", fontSize: 14 }}>
                          <strong>Duration:</strong>{" "}
                          {formatDuration(pageData.duration)}
                        </Typography>
                      </Stack>
                    )}

                  {pageData.daily_slots != null && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <GroupIcon sx={{ color: "#6b7280", fontSize: 20 }} />
                      <Typography sx={{ color: "#374151", fontSize: 14 }}>
                        <strong>Daily Availability:</strong>{" "}
                        {Number(pageData.daily_slots).toLocaleString("en-AE")}{" "}
                        slots
                      </Typography>
                    </Stack>
                  )}

                  {pageData.days && formatDays(pageData.days) && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayIcon
                        sx={{ color: "#6b7280", fontSize: 20 }}
                      />
                      <Typography sx={{ color: "#374151", fontSize: 14 }}>
                        <strong>Available Days:</strong>{" "}
                        {formatDays(pageData.days)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}

            <Box className="planSection">
              <Typography variant="h4" className="sectionHeading planHeading">
                {hasAddOnPackages ? "Choose your plan" : "Included experience"}
              </Typography>
              <Typography className="planSubtitle">
                {hasAddOnPackages
                  ? "Select the package that matches how you like to explore Dubai."
                  : basePackage.description}
              </Typography>
              {packagesLoading ? (
                <Box className="loader-container">
                  <span className="loader"></span>
                </Box>
              ) : hasAddOnPackages ? (
                <Box className="packagesGrid">
                  {packagesToDisplay.map((pack: any) => {
                    const packId = pack.isBase ? 0 : pack.id;
                    const isSelected = selectedId === packId;
                    return (
                      <Box
                        key={packId}
                        className={`packageCard ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedId(packId);
                          setSelectedPackage(pack.isBase ? null : pack);
                        }}
                      >
                        <Box className="packageHeader">
                          <Typography className="packageName">
                            {pack.isBase ? "Standard Experience" : pack.name}
                          </Typography>
                          {pack.isBase && (
                            <span className="packageBadge">Included</span>
                          )}
                          {!pack.isBase && packId === packages[0]?.id && (
                            <span className="packageBadge popular">
                              Popular
                            </span>
                          )}
                        </Box>

                        <Box className="packageMeta">
                          {pack.duration && (
                            <Box className="packageMetaItem">
                              <AccessTimeIcon />
                              <span>{pack.duration}</span>
                            </Box>
                          )}
                          {pack.max_guests && (
                            <Box className="packageMetaItem">
                              <span>👥 Up to {pack.max_guests} guests</span>
                            </Box>
                          )}
                        </Box>

                        <Typography className="packageDescription">
                          {pack.description ||
                            "Immerse yourself in handpicked highlights with a seamless travel schedule."}
                        </Typography>

                        {/* Show includes if available */}
                        {Array.isArray(pack.includes) &&
                          pack.includes.length > 0 && (
                            <Box className="packageIncludes">
                              <Typography className="packageIncludesTitle">
                                What's Included
                              </Typography>
                              <Box className="packageIncludesList">
                                {pack.includes
                                  .slice(0, 3)
                                  .map((item: string, idx: number) => (
                                    <Box
                                      key={idx}
                                      className="packageIncludeItem included"
                                    >
                                      {item}
                                    </Box>
                                  ))}
                                {pack.includes.length > 3 && (
                                  <Typography
                                    sx={{
                                      fontSize: "0.8rem",
                                      color: "#888",
                                      mt: 0.5,
                                    }}
                                  >
                                    +{pack.includes.length - 3} more
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}

                        <Box className="packageFooter">
                          <Box className="packagePriceWrapper">
                            <span className="packagePriceLabel">Price</span>
                            <Typography className="packagePrice">
                              <span className="currency">AED </span>
                              {Number(pack.price || 0).toLocaleString()}
                            </Typography>
                          </Box>
                          <button
                            className="packageSelectBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(packId);
                              setSelectedPackage(pack.isBase ? null : pack);
                            }}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </Box>
                      </Box>
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

            {/* Airport Pickup / Dropoff extra fields */}
            {isAirportPickup ? (
              <Box sx={{ mt: 2, display: "grid", gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Airport transfer details
                </Typography>

                <TextField
                  label="Time"
                  type="time"
                  value={airportTime}
                  onChange={(e) => setAirportTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel id="airport-transfer-type-label">Type</InputLabel>
                  <Select
                    labelId="airport-transfer-type-label"
                    value={airportTransferType}
                    label="Type"
                    onChange={(e) =>
                      setAirportTransferType(e.target.value as any)
                    }
                  >
                    <MenuItem value="pickup">Airport Pickup</MenuItem>
                    <MenuItem value="dropoff">Airport Dropoff</MenuItem>
                  </Select>
                </FormControl>

                {airportTransferType === "dropoff" ? (
                  <TextField
                    label="Dropoff address"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    fullWidth
                  />
                ) : null}
              </Box>
            ) : null}

            <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={addToCart}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#d0d5dd",
                }}
              >
                Add to cart
              </Button>
            </Box>

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
                  minDate={dayjs()}
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
        <ReviewComponent serviceId={pageData.id} limit={5} />
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
            Add to Cart
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
            Price: {formatCurrency(finalPrice)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            This will be added to your cart. You can review and pay at checkout.
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
            {isBooking ? "Processing..." : "Add & Go to Cart"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
