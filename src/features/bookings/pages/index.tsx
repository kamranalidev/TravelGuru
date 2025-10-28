import React, { use, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ButtonComponent, Header, ReviewComponent } from '../../../components'
import { Box, Typography, Button, styled } from '@mui/material'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../../supabaseClient'
import "./index.css"

import dayjs from "dayjs";
function StandardImageList(props: any) {
  const images = props?.Images?.map((imgUrl: string, index: number, arr: string[]) => ({
    src: imgUrl,
    rows: arr.length % 2 !== 0 && index === arr.length - 1 ? 3 : 2,
    cols: arr.length % 2 !== 0 && index === arr.length - 1 ? 2 : 1,
  })) || [];
  return (
    <ImageList sx={{
      borderRadius: "20px",
      width: "100%",
      height: 450,
      // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
      transform: 'translateZ(0)',
    }}
      rowHeight={200}
      gap={1}>
      {/* {itemData.map((item) => (
       
      ))} */}
      {images.map((item, idx) => (
        <ImageListItem key={idx}
          cols={item.cols || 1}
          rows={item.rows || 1} onClick={() => props.handleClick(item.src)}>
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
  height:"421px",
  borderRadius: "30px",
  background: "linear-gradient(135deg, rgb(255, 112, 67) 0%, rgb(255, 152, 0) 100%);",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "3px",
  ":hover": {
    background: theme.palette.secondary.main, // Slightly enlarge on hover  
  }
}));

export const BookingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isViewDatePicker, setIsViewDatePicker] = useState(false);
  const [packages, setPackages] = useState<any>();
  const [date, setDate] = useState(dayjs()); // today's date
  const navigate = useNavigate();
  const [pageData, setPageData] = useState({
    "Image": [],
    "description": "",
    "id": 0,
    "location": "",
    "name": "",
    "updated_at": "",
    "default_price": 0
  });

  const { state } = useLocation();
  const { id } = useParams();

  useEffect(() => {
    if (!!state) {
      setPageData({
        Image: state.Image,
        description: state.description,
        id: state.id,
        location: state.location,
        name: state.name,
        updated_at: state.updated_at,
        price: state.default_price,
        ...state
      })
    }
    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from("packages") // table name
        .select("*");  // select all columns
      console.log(data)
      if (error) {
        console.error("Error fetching trips:", error);
      } else {
        setPackages(data);
      }
      // setLoading(false);
    };

    fetchPackages();
    // edge case if user directly lands on this page without navigation via refresh
  }, [])


  const handleClick = (imgSrc: string) => {
    setSelectedImg(imgSrc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImg("");
  };
  const MAX_CHARS = 500; // adjust this based on how many lines you want

  const isLong = pageData.description.length > MAX_CHARS;
  return (
    <div>
      <Header />
      <Box sx={{ width: "80%", margin: "0 auto 0" }}>
        <Typography
          variant="h3" sx={{ marginLeft: "auto", marginTop: "40px" }}>Premium safari  in dubai
        </Typography>

        <div style={{ display: "flex", justifyContent: "center", margin: "0 auto 0", borderRadius: "20px" }} >
          <StandardImageList Images={pageData.Image} handleClick={handleClick} />
        </div>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ width: "60%" }}>
            <Typography variant="h4" sx={{ margin: " 0" }}>
              {pageData?.name}
            </Typography>
            <Typography sx={{
              fontSize: "1.2rem",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: expanded ? "none" : 4, // show only 4 lines if not expanded
            }}>
              {pageData?.description}   </Typography>
            {/* Show button only if text is longer */}
            {isLong && (
              <Button
                onClick={() => setExpanded((prev) => !prev)}
                sx={{
                  mt: 1,
                  textTransform: "none",
                  color: "black",
                  textDecoration: "underline",
                }}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}
          </Box>
          <Box className="priceBox" >
            <Typography style={{ display: "flex", justifyContent: "center", fontSize: "1.9rem" }} >
              <span style={{ fontWeight: "900", fontSize: "1.9rem", marginLeft: "4px" }}> US $ {pageData.price}</span>
            </Typography>
            <ButtonComponent title="Book Now" width="70%" bgColor="#FF621F"
              onClick={() => setIsViewDatePicker(!isViewDatePicker)} />
            {!!isViewDatePicker && <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar value={date}
                onChange={(newValue) => setDate(newValue)} />
            </LocalizationProvider>}

          </Box>
        </Box>
        {/* Choose your plan */}

        <Box>
          <Typography variant="h3" sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            Choose your plan
          </Typography>
          {/* Subscription plans */}
          <Box sx={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "20px",
            width: "100%",
            gap: "3px",


          }}>
            <Box className="subscriptionContainer">
              <SubscriptionBox >
                <Typography variant="h3" sx={{ textAlign: "center", color: "white", paddingTop: "13px" }}>Free</Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography><Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <ButtonComponent
                  onClick={() => navigate("/payment-confirmation")}
                  title="Already Using" width="70%" bgColor="white" style={{ marginTop: "50px", color: "#c44109ff", marginBottom: "20px", fontSize: "1.2rem" }} />
              </SubscriptionBox>
            </Box>
            {packages?.map((pack: any) => {
              return (
                <Box className="subscriptionContainer" key={pack.id}>
                  <SubscriptionBox >
                    <Typography variant="h3" sx={{ textAlign: "center", color: "white", paddingTop: "13px" }}>{pack.name}</Typography>
                    <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                      {pack.description}
                    </Typography>
                  
                    <ButtonComponent
                      onClick={() => navigate("/payment-confirmation")}
                      title="Buy now" width="70%" bgColor="white" style={{ marginTop: "50px", color: "#c44109ff", marginBottom: "20px", fontSize: "1.2rem" }} />

                  </SubscriptionBox>
                </Box>
              )
            })
            }





          </Box>

          {/* Review component */}
          < ReviewComponent />
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
  )
}
