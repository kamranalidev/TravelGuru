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
import theme from "../../../theme";
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
  marginTop: "20px",
  gap: "20px",
  height: "421px",
  borderRadius: "16px",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px",
  transition: "all 0.3s ease-in-out",
  fontFamily: "'Inter', sans-serif",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 24px rgba(255, 98, 31, 0.3)`,
  },
}));

export const BookingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isViewDatePicker] = useState(true);
  const [packages, setPackages] = useState<any>();
  const [date, setDate] = useState(dayjs()); // today's date
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (state) {
      const images = state?.service_image?.url ?? [];
      setPageData({
        Image: images,
        description: state.description,
        id: state.id,
        location: state.location,
        service_name: state.service_name,
        updated_at: state.updated_at,
        default_price: state.default_price,
        ...state,
      });
    }
    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from("packages") // table name
        .select("*"); // select all columns
      console.log(data);
      if (error) {
        console.error("Error fetching trips:", error);
      } else {
        setPackages(data);
      }
      // setLoading(false);
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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Find the selected package
    const pack = packages?.find((p: any) => p.id === id);
    setSelectedPackage(pack);
  };

  // Calculate the final price based on selected package
  const calculatePrice = () => {
    if (!selectedPackage || selectedPackage.name?.toLowerCase() === "free") {
      return pageData.default_price;
    }
    // Use multiplier from package if it exists, otherwise default to 1
    const multiplier = selectedPackage.multiplier || 1;
    return pageData.default_price * multiplier;
  };

  const finalPrice = calculatePrice();

  // Handle booking navigation with all data
  const handleBookNow = () => {
    const bookingData = {
      trip: {
        id: pageData.id,
        name: pageData.service_name,
        location: pageData.location,
        description: pageData.description,
        default_price: pageData.default_price,
      },
      bookingDate: date.format("YYYY-MM-DD"), // Format date as string
      selectedPackage: selectedPackage || { name: "Free", multiplier: 1 },
      finalPrice: finalPrice,
    };
    navigate("/payment-confirmation", { state: bookingData });
  };
  const MAX_CHARS = 500; // adjust this based on how many lines you want

  const isLong = pageData.description?.length > MAX_CHARS;
  return (
    <div>
      <Header />
      <Box className="booking-wrapper">
        <Box className="booking-heading">
          <Typography component="h1" variant="h3">
            {pageData?.service_name || "Experience details"}
          </Typography>
          {pageData?.location && (
            <Typography component="p">
              {pageData.location}
            </Typography>
          )}
        </Box>

        <Box className="booking-hero">
          <Box className="booking-gallery">
            <StandardImageList
              Images={pageData.Image}
              handleClick={handleClick}
            />
          </Box>

          <Box className="booking-details">
            <Box className="booking-description">
              {pageData?.location && (
                <Typography className="location" component="span">
                  {pageData.location}
                </Typography>
              )}
              <Typography variant="h4" component="h2">
                {pageData?.service_name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.05rem",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  WebkitLineClamp: expanded ? "initial" : 5,
                }}
              >
                {pageData?.description}
              </Typography>
              {isLong && (
                <Button
                  onClick={() => setExpanded((prev) => !prev)}
                  sx={{
                    alignSelf: "flex-start",
                    mt: 1,
                    textTransform: "none",
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  {expanded ? "Show less" : "Read more"}
                </Button>
              )}
            </Box>

            <Box className="booking-price-card">
              <Typography className="price">
                <Typography component="span">US$</Typography>
                <span>{finalPrice.toFixed(2)}</span>
              </Typography>
              <ButtonComponent
                title="Book Now"
                width="100%"
                bgColor={theme.palette.primary.main}
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
        </Box>

        <Box>
          <Box className="plan-header">
            <Typography variant="h4" component="h2">
              Choose your plan
            </Typography>
            <Typography component="p">
              Flexible packages tailored to your adventure.
            </Typography>
          </Box>

          <Box className="plans-grid">
            <Box className="subscriptionContainer">
              <SubscriptionBox>
                <Typography
                  variant="h3"
                  sx={{
                    textAlign: "center",
                    color: "white",
                    paddingTop: "13px",
                  }}
                >
                  Free
                </Typography>
                <Typography
                  sx={{ color: "white", width: "80%", textAlign: "left" }}
                >
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography
                  sx={{ color: "white", width: "80%", textAlign: "left" }}
                >
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography
                  sx={{ color: "white", width: "80%", textAlign: "left" }}
                >
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <ButtonComponent
                  title={selectedId === null ? "Selected" : "Select"}
                  onClick={() => {
                    setSelectedId(null);
                    setSelectedPackage(null);
                  }}
                  width="80%"
                  bgColor="white"
                  style={{
                    marginTop: "32px",
                    color: theme.palette.primary.main,
                    marginBottom: "12px",
                    fontSize: "1.1rem",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </SubscriptionBox>
            </Box>
            {packages?.map((pack: any) => {
              const isSelected = selectedId === pack.id;
              return (
                <Box className="subscriptionContainer" key={pack.id}>
                  <SubscriptionBox>
                    <Typography
                      variant="h3"
                      sx={{
                        textAlign: "center",
                        color: "white",
                        paddingTop: "13px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {pack.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "white",
                        width: "80%",
                        textAlign: "left",
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.6,
                      }}
                    >
                      {pack.description}
                    </Typography>

                    <ButtonComponent
                      title={isSelected ? "Selected" : "Buy Now"}
                      onClick={() => {
                        handleSelect(pack.id);
                      }}
                      width="80%"
                      bgColor="white"
                      style={{
                        marginTop: "32px",
                        color: theme.palette.primary.main,
                        marginBottom: "12px",
                        fontSize: "1.1rem",
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </SubscriptionBox>
                </Box>
              );
            })}
          </Box>

          <ReviewComponent />
        </Box>
      </Box>

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
