import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ButtonComponent, Header, ReviewComponent } from "../../../components";
import { Box, Typography, Button, styled } from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import "./index.css";

import dayjs from "dayjs";
function StandardImageList(props: any) {
  const images =
    props?.Images?.map((imgUrl: string, index: number, arr: string[]) => ({
      src: imgUrl,
      rows: arr.length % 2 !== 0 && index === arr.length - 1 ? 3 : 2,
      cols: arr.length % 2 !== 0 && index === arr.length - 1 ? 2 : 1,
    })) || [];
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
      {/* {itemData.map((item) => (
       
      ))} */}
      {images.map((item: any, idx: any) => (
        <ImageListItem
          key={idx}
          cols={item.cols || 1}
          rows={item.rows || 1}
          onClick={() => props.handleClick(item.src)}
        >
          <img
            src={item.src}
            alt={`Image ${idx + 1}`}
            loading="lazy"
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
  const navigate = useNavigate();
  const [pageData, setPageData] = useState({
    Image: [],
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
      const serviceImages =
        state?.service_image &&
        Array.isArray(state?.service_image?.url)
          ? state.service_image.url.filter(Boolean)
          : [];
      const fallbackImage = "/assets/desertSafari.jpg";
      const imageUrls =
        serviceImages && serviceImages.length > 0
          ? serviceImages
          : [fallbackImage];

      setPageData({
        Image: imageUrls,
        description:
          state?.description || state?.service_description || "Experience Dubai like never before.",
        id: state?.id ?? 0,
        location: state?.location || "Dubai",
        service_name: state?.service_name || "Dubai Experience",
        updated_at: state?.updated_at || "",
        default_price: state?.default_price ?? 0,
        ...state,
      });
      setSelectedId(0);
      setSelectedPackage(null);
    }
    const fetchPackages = async () => {
      if (!state?.id) {
        return;
      }

      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("service_id", state.id)
        .order("price", { ascending: true });

      if (error) {
        console.error("Error fetching packages:", error);
      } else if (Array.isArray(data)) {
        setPackages(data);
      } else {
        setPackages([]);
      }
    };

    fetchPackages();
    // edge case if user directly lands on this page without navigation via refresh
  }, []);

  const handleClick = (imgSrc: string) => {
    setSelectedImg(imgSrc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImg("");
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    // Find the selected package
    const pack = packages?.find((p: any) => p.id === id);
    setSelectedPackage(pack);
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

  const basePackage = {
    id: 0,
    name: "Standard Experience",
    description:
      "Includes our signature highlights, guided support, and convenient transfers.",
    price: pageData.default_price,
    isBase: true,
  };

  const packagesToDisplay =
    packages && packages.length > 0
      ? [basePackage, ...packages.map((pack) => ({ ...pack, isBase: false }))]
      : [basePackage];

  // Handle booking navigation with all data
  const handleBookNow = () => {
    if (!pageData.id) {
      return;
    }

    const bookingData = {
      trip: {
        id: pageData.id,
        name: pageData.service_name,
        location: pageData.location,
        description: pageData.description,
        default_price: pageData.default_price,
      },
      bookingDate: date.format("YYYY-MM-DD"), // Format date as string
      selectedPackage: selectedPackage || null,
      finalPrice: finalPrice,
    };
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

          <Box className="priceBox">
            <Typography className="priceLabel">Starting from</Typography>
            <Typography className="priceValue">
              {formatCurrency(finalPrice)}
            </Typography>
            <ButtonComponent
              title="Book Now"
              width="100%"
              bgColor="#FF621F"
              onClick={handleBookNow}
            />
            {!!isViewDatePicker && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={date}
                  onChange={(newValue: any) => {
                    if (newValue) {
                      setDate(newValue);
                    }
                  }}
                />
              </LocalizationProvider>
            )}
          </Box>
        </Box>

        <Box className="planSection">
          <Typography variant="h4" className="sectionHeading center">
            Choose your plan
          </Typography>
          <Typography className="planSubtitle">
            Select the package that matches how you like to explore Dubai.
          </Typography>
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
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
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

          <ReviewComponent />
        </Box>
      </Box>

      {/* Dialog for fullscreen image */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <img
          src={selectedImg}
          alt="Selected"
          style={{ width: "100%", height: "auto" }}
        />
      </Dialog>
    </div>
  );
};
