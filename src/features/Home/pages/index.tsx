import { useState, useEffect } from "react";
import {
  Header,
  ButtonComponent,
  Footer,
  ErrorBoundary,
} from "../../../components";
import { Box, Typography } from "@mui/material";
import { CardComponent, MiniCard } from "../../../components";
import "./index.css";
import { CustomCarousel } from "../../../components/Carousel";
import theme from "../../../theme";
import { supabase } from "../../../supabaseClient";

export const Homepage = () => {
  const [trips, setTrips] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from("services") // table name
          .select("*"); // select all columns

        if (error) {
          console.error("Error fetching trips:", error);
          setTrips([]);
        } else {
          // Ensure data is an array and contains valid entries
          const validTrips = Array.isArray(data)
            ? data.filter((trip) => trip && trip.id)
            : [];
          setTrips(validTrips);
        }
      } catch (error) {
        console.error("Unexpected error fetching trips:", error);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);
  return (
    <div>
      <Header />
      {/* 1st portion */}
      <Box
        sx={{
          display: "flex",
          backgroundColor: "#FBFBEC",
          justifyContent: "space-around",
          alignItems: "center",
          paddingRight: "10%",
        }}
      >
        <div>
          <p className="journey"> Save Journey</p>
          <p className="titleGuru">
            Make your <span style={{ color: "#FF621F" }}>travel</span> <br />
            Memorable
          </p>
          <p className="para">
            TravelGuru is one of the most popular <br />
            Travel agency for those who want to <br />
            explore the wold and try to make adventure{" "}
          </p>
          <ButtonComponent title="Plan trip" />
        </div>
        <div>
          <img
            className="beardGuyImage"
            src="/assets/beardGuy.png"
            alt="homepage"
          />
        </div>
      </Box>
      {/* Things you need to do */}
      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <p
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginTop: "2rem",
            paddingTop: "1rem",
          }}
        >
          Things you need{" "}
          <Typography
            sx={{ color: theme.palette.secondary.main, fontSize: "2rem" }}
            component="span"
          >
            to do
          </Typography>
        </p>
        <p className="ensure">
          we ensure that you'll embark on a perfectly planned, safe vacation at
          a price you can afford
          <br />
        </p>
        <div className="cardContainer">
          <MiniCard
            title="Book a flight"
            buttonTitle="details"
            location="Dubai"
          />
          <MiniCard
            title="Worth of Money"
            buttonTitle="details"
            location="Dubai"
          />
          <MiniCard
            title="Exciting travel"
            buttonTitle="details"
            location="Dubai"
            image="yellowLocation.svg"
          />
        </div>
      </Box>
      {/* popular destination */}
      <Box className="carouselMain">
        <p className="carouselHeader">Popular Destination</p>

        <ErrorBoundary>
          <CustomCarousel>
            {loading ? (
              <p>Loading trips...</p>
            ) : trips && Array.isArray(trips) && trips.length > 0 ? (
              trips
                .map((trip: any, index: number) => {
                  // Ensure we have valid trip data
                  if (!trip || !trip.id) return null;

                  // Safe access to nested properties
                  let imageUrl = null;
                  try {
                    if (
                      trip.service_image &&
                      trip.service_image.url &&
                      Array.isArray(trip.service_image.url)
                    ) {
                      imageUrl = trip.service_image.url[0] || null;
                    }
                  } catch (error) {
                    console.warn(
                      "Error accessing image URL for trip:",
                      trip.id,
                      error
                    );
                  }

                  return (
                    <CardComponent
                      key={trip.id || `trip-${index}`}
                      bookingData={trip}
                      id={trip.id}
                      title={
                        trip.service_name || trip.name || "Untitled Service"
                      }
                      buttonTitle="details"
                      location={trip.location || "Unknown Location"}
                      imageUrl={imageUrl}
                    />
                  );
                })
                .filter(Boolean)
            ) : (
              <p>No trips available</p>
            )}
            {/* <CardComponent title='Desert Safari' buttonTitle='details' location='Dubai' />
          <CardComponent title='Airport transport' buttonTitle='details' location='Dubai' />
          <CardComponent title='Abudhabi city tour' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' imageUrl='/assets/desertSafari.jpg' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' imageUrl='/assets/burjKhalifa.jpg' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' />
          <CardComponent title='Yacht' buttonTitle='details' location='Dubai' /> */}
          </CustomCarousel>
        </ErrorBoundary>
      </Box>
      {/* Subscribe  and get exclusive offers */}
      <Box
        className="subscribe"
        sx={{
          backgroundImage: `url('/assets/Bg.svg')`,
          height: "400px",
          width: "60%",
        }}
      >
        <Typography className="subscribeHeader" sx={{ fontSize: "2.5rem" }}>
          Subscribe and get exclusive <br />
          deal & offers
        </Typography>
        <div
          style={{
            backgroundImage: "url(/assets/circles.svg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left bottom",
            backgroundSize: "contain", // or 'auto' depending on your design
            height: "80%",
          }}
        >
          <div className="subscribeInput">
            <input
              placeholder="Enter your email"
              style={{ border: "none", outline: "none" }}
            />
            <ButtonComponent title="Subscribe" width="30%" />
          </div>
        </div>
      </Box>
      {/* Footer */}
      <Footer />
    </div>
  );
};
