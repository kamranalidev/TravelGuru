import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { ButtonComponent } from "../../../../components";
import theme from "../../../../theme";
import { useNavigate, useLocation } from "react-router-dom";
import { StepperComponent, Header } from "../../../../components";

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  // If no booking data, redirect back to home
  if (!bookingData) {
    navigate("/");
    return null;
  }

  const { trip, bookingDate, selectedPackage, finalPrice, packageName } =
    bookingData;

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", height: "100vh" }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={2} />
      <Box
        className="centerSection"
        sx={{ display: "flex", gap: "20px", padding: "20px" }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: "50%",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: "20px",
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: "20px",
              padding: "20px",
            }}
          >
            Enter info
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: "20px" }}>
            <Typography className="textStyle">Contact Info</Typography>
            <Typography className="textStyle">
              we will use this information to contact you about your booking.
            </Typography>
            <Box>
              <Typography className="textStyle">
                Here stripe component will Go
              </Typography>
            </Box>
            <Typography className="textStyle">
              By continuing, you acknowledge and agree to travel guru's general
              terms and conditions, privacy policy, and cancellation policy.
            </Typography>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <Typography className="textStyle">
                your booking will be submitted once you got blah blah vlah
              </Typography>
              <ButtonComponent title={"Pay now"} width="40%" />
            </Box>
          </Box>
        </Box>

        {/* Booking Summary */}
        <Box
          sx={{
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderRadius: "20px",
            width: "40%",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "left",
              marginTop: "20px",
              color: theme.palette.secondary.main,
              fontWeight: "bold",
              fontSize: "20px",
              padding: "20px",
            }}
          >
            Booking Summary
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: "20px" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "10px" }}
            >
              {trip.name}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "5px" }}>
              📍 {trip.location}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "10px" }}>
              📅 {bookingDate}
            </Typography>
            <Typography className="textStyle" sx={{ marginBottom: "10px" }}>
              📦 {packageName}
            </Typography>
            <Box
              sx={{
                borderTop: "1px solid #e6e6e6",
                marginTop: "15px",
                paddingTop: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <Typography className="textStyle">Base Price:</Typography>
                <Typography className="textStyle">
                  ${trip.default_price}
                </Typography>
              </Box>
              {selectedPackage && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <Typography className="textStyle">
                    Package Upgrade:
                  </Typography>
                  <Typography className="textStyle">
                    ${selectedPackage.price}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e6e6e6",
                }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                  Total:
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: theme.palette.primary.main,
                  }}
                >
                  ${finalPrice}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* <Box sx={{   borderRadius: "20px", width: "20%" }}>
          <Box sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",marginBottom: "20px",backgroundColor: "#fff",borderRadius: "20px", padding: "20px" }}>
            <Typography  sx={{ textAlign: "left", color: "black", fontWeight: "bold", fontSize: "20px" }}>
              Payment Successful
            </Typography>
            <Box >
              <Typography>
                Premium Desert Safari in Dubai - Morning, Evening and Overnight
              </Typography>
              <Typography>
                4hrs morning desert safari
              </Typography>
              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                  date
                </p>
                <p>
                  21 Aug 2025
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                  date
                </p>
                <p>
                  21 Aug 2025
                </p>
              </div>

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                  date
                </p>
                <p>
                  21 Aug 2025
                </p>
              </div>


            </Box>
          </Box>

          <Box sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",marginBottom: "20px",backgroundColor: "#fff",borderRadius: "20px", padding: "20px" }}>
            <Box >
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                  Subtotal
                </p>
                <p style={{fontWeight: "bold"}}>
                  US$ 45.45
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                  Promotion Discount
                </p>
                <p>
                  - US$ 5.00
                </p>
              </div>

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p>
                   Payment amount
                </p>
                <Typography style={{fontWeight: "bold",color: theme.palette.secondary.main,fontSize: "20px"}}>
                  US$ 40.45
                </Typography>
              </div>


            </Box>
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};
