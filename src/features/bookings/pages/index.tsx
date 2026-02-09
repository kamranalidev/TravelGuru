import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ButtonComponent,
  Header,
  ReviewComponent,
  ProfileModal,
} from "../../../components/index.tsx";
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
  Tabs,
  Tab,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  Divider,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BoltIcon from "@mui/icons-material/Bolt";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BlockIcon from "@mui/icons-material/Block";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient.ts";
import { useAuth } from "../../../hooks/useAuth.tsx";
import "./index.css";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store.ts";
import { addItem } from "../../../store/features/cart/cartSlice.ts";
import { addServerCartItem } from "../../../store/features/serverCart/serverCartSlice.ts";

import dayjs, { Dayjs } from "dayjs";

// ============ Type Definitions ============
interface ServiceImage {
  url?: string;
  path?: string;
}

interface DaysValue {
  days?: string[];
  [key: string]: boolean | string[] | undefined;
}

interface ImageItem {
  src: string;
  rows: number;
  cols: number;
}

interface ImageListProps {
  Images?: string[];
  handleClick: (imgSrc: string) => void;
}

interface PackageData {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  max_guests?: number;
  includes?: string[];
  excludes?: string[];
  isBase?: boolean;
  service_id?: number;
  package_type?: string;
  combo_items?: Array<{ name: string; price: number }>; // Inline combo items
  original_price?: number; // For showing savings on combo
  cancellation_policy?: string | { type?: string; details?: string };
  confirmation_type?: string;
  voucher_type?: string;
  eligibility?: string[];
  terms?: string[];
  how_to_use?: string[];
  opening_hours?: string;
  address?: string;
  how_to_get_there?: string;
}

interface PageDataState {
  Image: string[];
  description: string;
  id: number;
  location: string;
  service_name: string;
  updated_at: string;
  default_price: number;
  service_type: string | null;
  daily_slots: number | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  days: DaysValue | string | string[] | null;
}

interface ServiceRecord {
  id?: number;
  service_name?: string;
  service_description?: string;
  description?: string;
  location?: string;
  default_price?: number;
  service_type?: string;
  daily_slots?: number;
  start_time?: string;
  end_time?: string;
  duration?: number;
  days?: DaysValue | string | string[];
  updated_at?: string;
  service_image?: string | ServiceImage[] | ServiceImage;
}

// ============ Helper Functions ============
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

const formatDays = (
  value: DaysValue | string | string[] | null | undefined,
): string | null => {
  if (!value) return null;
  try {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed) as DaysValue | string[];
        return formatDays(parsed);
      }
      return trimmed;
    }
    if (typeof value === "object") {
      const objValue = value as DaysValue;
      if (Array.isArray(objValue.days)) return objValue.days.join(", ");
      const keys = Object.keys(value).filter((k) => Boolean(objValue[k]));
      return keys.length ? keys.join(", ") : null;
    }
  } catch {
    return null;
  }
  return null;
};

// Helper to extract image URLs from various formats
const extractImageUrls = (
  imgVal: string | ServiceImage[] | ServiceImage | undefined,
): string[] => {
  if (!imgVal) return [];

  try {
    // Handle JSON string format from database
    if (typeof imgVal === "string") {
      const parsedImages = JSON.parse(imgVal) as (string | ServiceImage)[];
      if (Array.isArray(parsedImages)) {
        return parsedImages
          .map((x) => (typeof x === "string" ? x : x?.url))
          .filter((u): u is string => typeof u === "string" && u.trim() !== "");
      }
      return [];
    }

    // Handle direct array (may contain strings or { url, path } objects)
    if (Array.isArray(imgVal)) {
      return imgVal
        .map((x) => (typeof x === "string" ? x : x?.url))
        .filter((u): u is string => typeof u === "string" && u.trim() !== "");
    }

    // Handle single object: { url: string }
    // At this point imgVal is ServiceImage
    const url = (imgVal as ServiceImage).url;
    if (typeof url === "string" && url.trim() !== "") {
      return [url];
    }
  } catch {
    // JSON parse or other error
  }
  return [];
};

// ============ StandardImageList Component ============
function StandardImageList(props: ImageListProps) {
  const images: ImageItem[] =
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
      {images.map((item: ImageItem, idx: number) => (
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
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [date, setDate] = useState<Dayjs>(dayjs()); // today's date
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null,
  );
  // Klook-style package tabs and details modal
  const [packageTab, setPackageTab] = useState<"standard" | "combo">(
    "standard",
  );
  const [packageDetailsOpen, setPackageDetailsOpen] = useState(false);
  const [packageToView, setPackageToView] = useState<PackageData | null>(null);

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

  // === Booking capacity state ===
  const [slotsBooked, setSlotsBooked] = useState<number>(0);
  const [capacityLoading, setCapacityLoading] = useState(false);

  const [pageData, setPageData] = useState<PageDataState>({
    Image: [],
    description: "",
    id: 0,
    location: "",
    service_name: "",
    updated_at: "",
    default_price: 0,
    service_type: null,
    daily_slots: null,
    start_time: null,
    end_time: null,
    duration: null,
    days: null,
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

  // Derived capacity values
  const isServiceFull =
    pageData.daily_slots != null &&
    pageData.daily_slots > 0 &&
    slotsBooked >= pageData.daily_slots;
  const slotsRemaining =
    pageData.daily_slots != null && pageData.daily_slots > 0
      ? Math.max(0, pageData.daily_slots - slotsBooked)
      : null;

  // Check booking capacity whenever date or service changes
  useEffect(() => {
    const checkCapacity = async () => {
      if (
        !pageData.id ||
        !date ||
        pageData.daily_slots == null ||
        pageData.daily_slots <= 0
      ) {
        setSlotsBooked(0);
        return;
      }

      try {
        setCapacityLoading(true);
        const bookingDate = date.format("YYYY-MM-DD");

        const { count, error } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("service_id", pageData.id)
          .eq("booking_date", bookingDate);

        if (error) {
          console.error("Error checking booking capacity:", error);
          setSlotsBooked(0);
        } else {
          setSlotsBooked(count ?? 0);
        }
      } catch (err) {
        console.error("Unexpected error checking capacity:", err);
        setSlotsBooked(0);
      } finally {
        setCapacityLoading(false);
      }
    };

    void checkCapacity();
  }, [pageData.id, pageData.daily_slots, date]);

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
      const serviceRecord = data as ServiceRecord;

      const serviceImages = extractImageUrls(serviceRecord?.service_image);
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
    if (state) {
      // Parse service images from different possible formats
      const stateRecord = state as ServiceRecord;
      const serviceImages = extractImageUrls(stateRecord?.service_image);

      // Fallback to default image if no valid images found
      const fallbackImage = "/assets/desertSafari.jpg";
      const imageUrls =
        serviceImages.length > 0 ? serviceImages : [fallbackImage];

      setPageData({
        Image: imageUrls,
        description:
          stateRecord?.service_description ||
          stateRecord?.description ||
          "Experience Dubai like never before.",
        id: stateRecord?.id ?? 0,
        location: stateRecord?.location || "Dubai",
        service_name: stateRecord?.service_name || "Dubai Experience",
        updated_at: stateRecord?.updated_at || "",
        default_price: stateRecord?.default_price ?? 0,
        service_type: stateRecord?.service_type || null,
        daily_slots:
          stateRecord?.daily_slots != null
            ? Number(stateRecord.daily_slots)
            : null,
        start_time: stateRecord?.start_time || null,
        end_time: stateRecord?.end_time || null,
        duration:
          stateRecord?.duration != null ? Number(stateRecord.duration) : null,
        days: stateRecord?.days || null,
      });
      setSelectedId(0);
      setSelectedPackage(null);
    }
    const fetchPackages = async () => {
      const stateRecord = state as ServiceRecord | null;
      const idToUse = stateRecord?.id ?? serviceIdFromRoute;
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
          const validPackages = data.filter(
            (pkg): pkg is PackageData =>
              pkg && typeof pkg.id === "number" && typeof pkg.name === "string",
          );
          setPackages(validPackages);
          console.log(
            `Fetched ${validPackages.length} packages for service ${idToUse}`,
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

  const formatCurrency = (value: number | string | null | undefined) => {
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

  // Handle booking navigation with all data
  const handleBookNow = () => {
    if (!pageData.id) {
      console.warn("No service ID available for booking");
      return;
    }

    // Block booking if service is full for the selected date
    if (isServiceFull) {
      setBookingFeedback({
        type: "error",
        message: `This service is fully booked for ${date.format("MMMM DD, YYYY")}. Please select a different date.`,
      });
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
  const proceedWithBooking = () => {
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
        quantity: 1,
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
            quantity: 1,
          },
        }),
      );
    }

    navigate("/cart");
  };

  const addToCart = () => {
    if (!pageData.id || !date) return;

    // Block if service is full for the selected date
    if (isServiceFull) {
      setBookingFeedback({
        type: "error",
        message: `This service is fully booked for ${date.format("MMMM DD, YYYY")}. Please select a different date.`,
      });
      return;
    }

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
        quantity: 1,
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
            quantity: 1,
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

            {/* Klook-style Package Options Section */}
            <Box className="planSection">
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 28,
                    bgcolor: "#FF621F",
                    borderRadius: 1,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#1a1a1a" }}
                >
                  {pageData.service_name} Package Options
                </Typography>
              </Box>

              {packagesLoading ? (
                <Box className="loader-container">
                  <span className="loader"></span>
                </Box>
              ) : hasAddOnPackages ? (
                <>
                  {/* Klook-style Tabs */}
                  <Box sx={{ mb: 3 }}>
                    <Tabs
                      value={packageTab}
                      onChange={(_, newValue) => setPackageTab(newValue)}
                      sx={{
                        "& .MuiTabs-indicator": {
                          backgroundColor: "#FF621F",
                          height: 3,
                        },
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#666",
                          "&.Mui-selected": {
                            color: "#FF621F",
                          },
                        },
                      }}
                    >
                      <Tab label="Standard" value="standard" />
                      <Tab
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>Combo deals</span>
                            {packages.filter((p) => p.package_type === "combo")
                              .length > 0 && (
                              <Chip
                                label={`${Math.round(
                                  (packages.filter(
                                    (p) => p.package_type === "combo",
                                  )[0]?.original_price || 0) > 0
                                    ? (((packages.filter(
                                        (p) => p.package_type === "combo",
                                      )[0]?.original_price || 0) -
                                        (packages.filter(
                                          (p) => p.package_type === "combo",
                                        )[0]?.price || 0)) /
                                        (packages.filter(
                                          (p) => p.package_type === "combo",
                                        )[0]?.original_price || 1)) *
                                        100
                                    : 10,
                                )}% off`}
                                size="small"
                                sx={{
                                  bgcolor: "#fff3e6",
                                  color: "#FF621F",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                  height: 20,
                                }}
                              />
                            )}
                          </Box>
                        }
                        value="combo"
                      />
                    </Tabs>
                  </Box>

                  {/* Package List - Klook Style */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {(packageTab === "standard"
                      ? [
                          basePackage,
                          ...packages.filter((p) => p.package_type !== "combo"),
                        ]
                      : packages.filter((p) => p.package_type === "combo")
                    ).map((pack: PackageData) => {
                      const packId = pack.isBase ? 0 : pack.id;
                      const isSelected = selectedId === packId;
                      const isCombo = pack.package_type === "combo";
                      const savings =
                        isCombo && pack.original_price
                          ? Math.round(
                              ((pack.original_price - pack.price) /
                                pack.original_price) *
                                100,
                            )
                          : 0;

                      return (
                        <Box
                          key={packId}
                          sx={{
                            border: isSelected
                              ? "2px solid #FF621F"
                              : "1px solid #e8e8e8",
                            borderRadius: 2,
                            p: 2.5,
                            bgcolor: isSelected ? "#fff9f5" : "#fff",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#FF621F",
                              boxShadow: "0 2px 12px rgba(255, 98, 31, 0.1)",
                            },
                          }}
                        >
                          {/* Package Title */}
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              mb: 1.5,
                              color: "#1a1a1a",
                            }}
                          >
                            {pack.isBase ? "Standard Experience" : pack.name}
                          </Typography>

                          {/* Feature Tags */}
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={
                                typeof pack.cancellation_policy === "object" &&
                                pack.cancellation_policy !== null
                                  ? (
                                      pack.cancellation_policy as {
                                        type?: string;
                                        details?: string;
                                      }
                                    ).type
                                      ?.replace(/_/g, " ")
                                      .replace(/\b\w/g, (c: string) =>
                                        c.toUpperCase(),
                                      ) || "No cancellation"
                                  : typeof pack.cancellation_policy === "string"
                                    ? pack.cancellation_policy
                                    : "No cancellation"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  typeof pack.cancellation_policy ===
                                    "object" &&
                                  (
                                    pack.cancellation_policy as {
                                      type?: string;
                                    }
                                  )?.type === "free_cancellation"
                                    ? "#e8f5e9"
                                    : "#f5f5f5",
                                color:
                                  typeof pack.cancellation_policy ===
                                    "object" &&
                                  (
                                    pack.cancellation_policy as {
                                      type?: string;
                                    }
                                  )?.type === "free_cancellation"
                                    ? "#2e7d32"
                                    : "#666",
                                fontSize: "0.75rem",
                              }}
                            />
                            <Chip
                              label="Valid on the selected date"
                              size="small"
                              sx={{
                                bgcolor: "#f5f5f5",
                                color: "#666",
                                fontSize: "0.75rem",
                              }}
                            />
                            <Chip
                              label={pack.voucher_type || "Enter with voucher"}
                              size="small"
                              sx={{
                                bgcolor: "#f5f5f5",
                                color: "#666",
                                fontSize: "0.75rem",
                              }}
                            />
                            <Chip
                              label={
                                pack.confirmation_type || "Instant confirmation"
                              }
                              size="small"
                              sx={{
                                bgcolor: "#f5f5f5",
                                color: "#666",
                                fontSize: "0.75rem",
                              }}
                            />
                          </Box>

                          {/* Price and Select Row */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {/* Package Details Link */}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPackageToView(pack);
                                setPackageDetailsOpen(true);
                              }}
                              sx={{
                                textTransform: "none",
                                color: "#1a1a1a",
                                fontWeight: 600,
                                p: 0,
                                "&:hover": {
                                  bgcolor: "transparent",
                                  color: "#FF621F",
                                },
                              }}
                              endIcon={<ChevronRightIcon />}
                            >
                              Package details
                            </Button>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              {/* Price */}
                              <Box sx={{ textAlign: "right" }}>
                                {isCombo && pack.original_price && (
                                  <Typography
                                    sx={{
                                      textDecoration: "line-through",
                                      color: "#999",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    AED {pack.original_price.toLocaleString()}
                                  </Typography>
                                )}
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "1.25rem",
                                    color: "#1a1a1a",
                                  }}
                                >
                                  AED {Number(pack.price || 0).toLocaleString()}
                                </Typography>
                              </Box>

                              {/* Combo Badge */}
                              {isCombo && savings > 0 && (
                                <Box
                                  sx={{
                                    border: "1px solid #FF621F",
                                    borderRadius: 1,
                                    px: 1,
                                    py: 0.5,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: "#FF621F",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Combo
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#FF621F",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Save {savings}%
                                  </Typography>
                                </Box>
                              )}

                              {/* Select Button */}
                              <Button
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(packId);
                                  setSelectedPackage(pack.isBase ? null : pack);
                                }}
                                sx={{
                                  bgcolor: isSelected ? "#e0e0e0" : "#FF621F",
                                  color: isSelected ? "#666" : "#fff",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  px: 3,
                                  borderRadius: 1,
                                  "&:hover": {
                                    bgcolor: isSelected ? "#d0d0d0" : "#e55519",
                                  },
                                }}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Empty state for combo tab */}
                    {packageTab === "combo" &&
                      packages.filter((p) => p.package_type === "combo")
                        .length === 0 && (
                        <Box sx={{ textAlign: "center", py: 4, color: "#666" }}>
                          <Typography>
                            No combo deals available for this service yet.
                          </Typography>
                        </Box>
                      )}
                  </Box>
                </>
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
                      setAirportTransferType(
                        e.target.value as "pickup" | "dropoff",
                      )
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
                disabled={isBooking || isServiceFull}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: isServiceFull ? "#ef4444" : "#d0d5dd",
                  color: isServiceFull ? "#ef4444" : undefined,
                }}
              >
                {isServiceFull ? "Fully Booked" : "Add to cart"}
              </Button>
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, marginTop: "8px", marginBottom: "12px" }}
            >
              Select your date
            </Typography>
            {isViewDatePicker && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={date}
                  minDate={dayjs()}
                  onChange={(newValue: Dayjs | null) => {
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

            {/* Availability indicator */}
            {pageData.daily_slots != null && pageData.daily_slots > 0 && (
              <Box
                sx={{
                  mt: 1,
                  mb: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isServiceFull ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${isServiceFull ? "#fecaca" : "#bbf7d0"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {capacityLoading ? (
                  <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                    Checking availability…
                  </Typography>
                ) : isServiceFull ? (
                  <>
                    <BlockIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      Fully booked for {date.format("MMM DD, YYYY")}
                    </Typography>
                  </>
                ) : (
                  <>
                    <EventAvailableIcon
                      sx={{ color: "#16a34a", fontSize: 20 }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      {slotsRemaining} of {pageData.daily_slots} slots available
                    </Typography>
                  </>
                )}
              </Box>
            )}

            <ButtonComponent
              title={
                isServiceFull
                  ? "Fully Booked"
                  : isBooking
                    ? "Processing..."
                    : "Book Now"
              }
              width="100%"
              bgColor={isServiceFull ? "#d1d5db" : "#FF621F"}
              onClick={handleBookNow}
              isLoading={isBooking}
              loadingText="Processing..."
              disabled={isBooking || isServiceFull}
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

      {/* Klook-style Package Details Drawer */}
      <Drawer
        anchor="right"
        open={packageDetailsOpen}
        onClose={() => setPackageDetailsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 450 },
            maxWidth: "100vw",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Package details
            </Typography>
            <IconButton onClick={() => setPackageDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {packageToView && (
              <>
                {/* Package Name */}
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 2 }}
                >
                  {packageToView.isBase
                    ? "Standard Experience"
                    : packageToView.name}
                </Typography>

                {/* Quick Info Tags */}
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BoltIcon sx={{ color: "#666", fontSize: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
                      {packageToView.confirmation_type ||
                        "Instant confirmation"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ConfirmationNumberIcon
                      sx={{ color: "#666", fontSize: 20 }}
                    />
                    <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
                      {packageToView.voucher_type || "Enter with voucher"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventAvailableIcon sx={{ color: "#666", fontSize: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
                      Valid on the selected date
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: "#888", ml: 0.5 }}
                    >
                      The voucher is valid only on the specified date (and time
                      if applicable)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BlockIcon sx={{ color: "#666", fontSize: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
                      {typeof packageToView.cancellation_policy === "object" &&
                      packageToView.cancellation_policy !== null
                        ? (
                            packageToView.cancellation_policy as {
                              type?: string;
                              details?: string;
                            }
                          ).type || "No cancellation"
                        : typeof packageToView.cancellation_policy === "string"
                          ? packageToView.cancellation_policy
                          : "No cancellation"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: "#888", ml: 0.5 }}
                    >
                      {typeof packageToView.cancellation_policy === "object" &&
                      packageToView.cancellation_policy !== null &&
                      (
                        packageToView.cancellation_policy as {
                          details?: string;
                        }
                      ).details
                        ? (
                            packageToView.cancellation_policy as {
                              details?: string;
                            }
                          ).details
                        : "No cancellations, refunds, or changes can be made"}
                    </Typography>
                  </Box>
                </Stack>

                {/* About this package */}
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2 }}>
                  About this package
                </Typography>

                {/* What's included */}
                {Array.isArray(packageToView.includes) &&
                  packageToView.includes.length > 0 && (
                    <Box
                      sx={{
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 600, mb: 1.5, color: "#1a1a1a" }}
                      >
                        What's included
                      </Typography>
                      <Stack spacing={1}>
                        {packageToView.includes.map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{ color: "#2e7d32", fontSize: 18, mt: 0.3 }}
                            />
                            <Typography
                              sx={{ fontSize: "0.9rem", color: "#444" }}
                            >
                              {item}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                {/* What's not included */}
                {Array.isArray(packageToView.excludes) &&
                  packageToView.excludes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        sx={{ fontWeight: 600, mb: 1.5, color: "#1a1a1a" }}
                      >
                        Not included
                      </Typography>
                      <Stack spacing={1}>
                        {packageToView.excludes.map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <CancelIcon
                              sx={{ color: "#999", fontSize: 18, mt: 0.3 }}
                            />
                            <Typography
                              sx={{ fontSize: "0.9rem", color: "#666" }}
                            >
                              {item}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                {/* Eligibility */}
                {Array.isArray(packageToView.eligibility) &&
                  packageToView.eligibility.length > 0 && (
                    <Box
                      sx={{
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 600, mb: 1.5, color: "#1a1a1a" }}
                      >
                        Eligibility
                      </Typography>
                      <Stack
                        spacing={0.5}
                        component="ul"
                        sx={{ m: 0, pl: 2.5 }}
                      >
                        {packageToView.eligibility.map((item, idx) => (
                          <Typography
                            key={idx}
                            component="li"
                            sx={{ fontSize: "0.9rem", color: "#444" }}
                          >
                            {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                {/* Terms & Conditions */}
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2 }}>
                  Terms & Conditions
                </Typography>

                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "8px !important",
                    mb: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Confirmation
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                      {packageToView.confirmation_type === "instant"
                        ? "You will receive instant confirmation of your booking. A voucher will be sent to your email address which you can present at the venue."
                        : packageToView.confirmation_type === "24_hours"
                          ? "You will receive confirmation of your booking within 24 hours. A voucher will be sent to your email address which you can present at the venue."
                          : packageToView.confirmation_type === "48_hours"
                            ? "You will receive confirmation of your booking within 48 hours. A voucher will be sent to your email address which you can present at the venue."
                            : "Confirmation details will be sent to your email after your booking is reviewed."}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "8px !important",
                    mb: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Additional information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                      {packageToView.description ||
                        "Please arrive at least 15 minutes before your scheduled time. " +
                          "Remember to bring a valid ID and your booking confirmation."}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Combo Items - show what's included in combo */}
                {packageToView.package_type === "combo" &&
                  Array.isArray(packageToView.combo_items) &&
                  packageToView.combo_items.length > 0 && (
                    <Box
                      sx={{
                        bgcolor: "#fff9f5",
                        border: "1px solid #FF621F",
                        borderRadius: 2,
                        p: 2,
                        mt: 2,
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          mb: 1.5,
                          color: "#FF621F",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        🎁 Combo Includes
                      </Typography>
                      <Stack spacing={1}>
                        {packageToView.combo_items.map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "0.9rem", color: "#444" }}
                            >
                              {item.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                color: "#888",
                                textDecoration: "line-through",
                              }}
                            >
                              AED {item.price}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, color: "#444" }}>
                            Total if bought separately
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "#888",
                              textDecoration: "line-through",
                            }}
                          >
                            AED{" "}
                            {packageToView.original_price ||
                              packageToView.combo_items.reduce(
                                (sum, item) => sum + (item.price || 0),
                                0,
                              )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 700, color: "#2e7d32" }}
                          >
                            Combo Price
                          </Typography>
                          <Typography
                            sx={{ fontWeight: 700, color: "#2e7d32" }}
                          >
                            AED {packageToView.price}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                {/* How to use */}
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 3, mb: 2 }}
                >
                  How to use
                </Typography>

                {packageToView.opening_hours && (
                  <Accordion
                    elevation={0}
                    sx={{
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px !important",
                      mb: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>
                        Opening hours
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                        {packageToView.opening_hours}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "8px !important",
                    mb: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Voucher type
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                      {packageToView.voucher_type === "mobile"
                        ? "Show your mobile voucher to gain entry. No printing required."
                        : packageToView.voucher_type === "print"
                          ? "Please print your voucher and present it at the entrance."
                          : packageToView.voucher_type === "both"
                            ? "You can show your mobile voucher or bring a printed copy."
                            : "Show your mobile voucher to gain entry. No printing required."}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "8px !important",
                    mb: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 600 }}>
                      How to redeem
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Array.isArray(packageToView.how_to_use) &&
                    packageToView.how_to_use.length > 0 ? (
                      <Stack spacing={1}>
                        {packageToView.how_to_use.map((step, idx) => (
                          <Typography
                            key={idx}
                            sx={{ fontSize: "0.9rem", color: "#666" }}
                          >
                            {idx + 1}. {step}
                          </Typography>
                        ))}
                      </Stack>
                    ) : (
                      <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                        Present your voucher at the ticket counter or entrance.
                        Staff will scan your voucher code to validate your
                        booking.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {packageToView.address && (
                  <Accordion
                    elevation={0}
                    sx={{
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px !important",
                      mb: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>Address</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                        {packageToView.address}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}

                {packageToView.how_to_get_there && (
                  <Accordion
                    elevation={0}
                    sx={{
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px !important",
                      mb: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 600 }}>
                        How to get there
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                        {packageToView.how_to_get_there}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}
          </Box>

          {/* Footer with Select button */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#888" }}>
                Price
              </Typography>
              <Typography
                sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#1a1a1a" }}
              >
                AED {Number(packageToView?.price || 0).toLocaleString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                if (packageToView) {
                  const packId = packageToView.isBase ? 0 : packageToView.id;
                  setSelectedId(packId);
                  setSelectedPackage(
                    packageToView.isBase ? null : packageToView,
                  );
                  setPackageDetailsOpen(false);
                }
              }}
              sx={{
                bgcolor: "#FF621F",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#e55519",
                },
              }}
            >
              Select
            </Button>
          </Box>
        </Box>
      </Drawer>
    </div>
  );
};
