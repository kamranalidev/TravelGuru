import React, { useState } from "react";
import { ButtonComponent, Header, ReviewComponent } from '../../../components'
import { Box, Typography, Button, styled } from '@mui/material'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Dialog from "@mui/material/Dialog";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useNavigate } from "react-router-dom";
import "./index.css"

import dayjs from "dayjs";
function StandardImageList(props: any) {
  const images = [
    { src: "/assets/desert1.jpg", rows: 3, cols: 1 }, // first image big
    { src: "/assets/desertSafari.jpg", rows: 1, cols: 1 },
    { src: "/assets/yachtdubai.jpg", rows: 1, cols: 1 },
    { src: "/assets/desertSafari3.jpg", rows: 2, cols: 1 },
    { src: "/assets/desert1.jpg", rows: 1, cols: 1 },
  ];
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
  const [date, setDate] = useState(dayjs()); // today's date
  const navigate = useNavigate();
  const handleClick = (imgSrc: string) => {
    setSelectedImg(imgSrc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImg("");
  };
  const text =
    "Enjoy a traditional BBQ dinner under the stars, complete with cultural performancescomplete with cultural performances and stunning desert views.complete wicomplete with cultural performances and stunning desert views.complete with cultural performances and stunning desert views.complete with cultural performances and stunning desert views.complete with cultural performances and stunning desert views. Complete with cultural performances and stunning desert views. Complete with cultural performances and stunning desert views. Complete with cultural performances and stunning desert views.";
  const MAX_CHARS = 500; // adjust this based on how many lines you want

  const isLong = text.length > MAX_CHARS;
  return (
    <div>
      <Header />
      <Box sx={{ width: "80%", margin: "0 auto 0" }}>
        <Typography
          variant="h3" sx={{ marginLeft: "auto", marginTop: "40px" }}>Premium safari  in dubai
        </Typography>

        <div style={{ display: "flex", justifyContent: "center", margin: "0 auto 0", borderRadius: "20px" }} >
          <StandardImageList handleClick={handleClick} />
        </div>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ width: "60%" }}>
            <Typography variant="h4" sx={{ margin: " 0" }}>
              Desert safari
            </Typography>
            <Typography sx={{
              fontSize: "1.2rem",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: expanded ? "none" : 4, // show only 4 lines if not expanded
            }}>
              {text}   </Typography>
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
              <span style={{ fontWeight: "900", fontSize: "1.9rem", marginLeft: "4px" }}> US $36.05</span>
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
            <Box className="subscriptionContainer">
              <SubscriptionBox >
                <Typography variant="h3" sx={{ textAlign: "center", color: "white", paddingTop: "13px" }}>Premium</Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  incididunt ut labore et dolore magna aliqua.
                </Typography><Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  incididunt ut labore et dolore magna aliqua.
                </Typography>
                <ButtonComponent title="Buy Now" width="70%" bgColor="white" style={{ marginTop: "50px", color: "#c44109ff", marginBottom: "20px", fontSize: "1.2rem" }} />
              </SubscriptionBox>
            </Box>
            <Box className="subscriptionContainer">
              <SubscriptionBox >
                <Typography variant="h3" sx={{ textAlign: "center", color: "white", paddingTop: "13px" }}>Deluxe</Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  incididunt ut labore et dolore magna aliqua.
                </Typography><Typography sx={{ color: "white", width: "70%", textAlign: "left" }}>
                  incididunt ut labore et dolore magna aliqua.
                </Typography>
                <ButtonComponent title="Buy Now" width="70%" bgColor="white" style={{ marginTop: "50px", color: "#c44109ff", marginBottom: "20px", fontSize: "1.2rem" }} />
              </SubscriptionBox>
            </Box>
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
