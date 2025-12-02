import { Header } from '../../../../components';
import Box from '@mui/material/Box';
import { StepperComponent, ButtonComponent } from '../../../../components';
import theme from '../../../../theme';
import { Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './index.css';


export const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { profile } = useAuth();
  
  // Extract booking data from navigation state
  const bookingData = state || null;
  const trip = bookingData?.trip || null;
  const bookingDate = bookingData?.bookingDate || null;
  const departureArrivalTime = bookingData?.departureArrivalTime || null;
  const selectedPackage = bookingData?.selectedPackage || null;
  const finalPrice = bookingData?.finalPrice || 0;
  const bookingId = bookingData?.bookingId || null;
  // const booking = bookingData?.booking || null;
  
  // Format the date for display
  const formattedDate = bookingDate ? dayjs(bookingDate).format("DD MMM YYYY") : "Not selected";

  // Redirect if no booking data
  if (!bookingData || !bookingId) {
    return (
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Header hidePages={true} />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Alert severity="error" sx={{ maxWidth: "500px" }}>
            No booking information found. Please start a new booking.
          </Alert>
        </Box>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={3} />
      <Box className="centerSection" sx={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {/* Success Message */}
          <Box sx={{ 
          backgroundColor: "#fff", 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", 
          borderRadius: "20px", 
          width: "100%",
          marginBottom: "20px",
          padding: { xs: "24px", md: "40px" },
          textAlign: "center"
        }}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: { xs: "60px", md: "80px" }, 
              color: "#4caf50", 
              mb: 2 
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              color: theme.palette.secondary.main, 
              fontWeight: "bold", 
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.125rem" }
            }}
          >
            Booking Confirmed!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "#666", 
              mb: 3,
              fontSize: { xs: "1rem", md: "1.1rem" }
            }}
          >
            Your booking has been successfully confirmed. We've sent a confirmation email to your registered email address.
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#999",
              mb: 3
            }}
          >
            Booking ID: <strong>{bookingId}</strong>
          </Typography>
          
          {/* User Info Display */}
          {profile && (
            <Box sx={{ 
              backgroundColor: "#f9f9f9", 
              borderRadius: "12px", 
              padding: "20px", 
              mt: 3,
              textAlign: "left"
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: "bold", 
                  mb: 2,
                  color: theme.palette.secondary.main
                }}
              >
                Contact Information
              </Typography>
              <Typography className='textStyle' sx={{ mb: 1 }}>
                <strong>Name:</strong> {profile.full_name || "Not provided"}
              </Typography>
              <Typography className='textStyle' sx={{ mb: 1 }}>
                <strong>Email:</strong> {profile.email || "Not provided"}
              </Typography>
              {profile.phone_number && (
                <Typography className='textStyle' sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {profile.phone_number}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            justifyContent: "center", 
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            "& > *": {
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "auto", sm: "150px" }
            }
          }}>
            <ButtonComponent 
              title="View My Bookings" 
              width="100%"
              onClick={() => navigate("/bookings")}
              bgColor={theme.palette.secondary.main}
            />
            <ButtonComponent 
              title="Back to Home" 
              width="100%"
              onClick={() => navigate("/")}
              bgColor="#666"
            />
          </Box>
        </Box>
        {/* Booking Details */}
        <Box sx={{ 
          display: "flex", 
          gap: "20px", 
          flexWrap: { xs: "wrap", md: "nowrap" },
          width: "100%",
          flexDirection: { xs: "column", md: "row" }
        }}>
          <Box sx={{ 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            borderRadius: "20px", 
            padding: { xs: "16px", md: "20px" },
            flex: 1,
            width: { xs: "100%", md: "auto" }
          }}>
            <Typography sx={{ 
              textAlign: "left", 
              color: theme.palette.secondary.main, 
              fontWeight: "bold", 
              fontSize: "20px",
              mb: 2
            }}>
              Booking Details
            </Typography>
            <Box>
              <Typography sx={{ fontWeight: "bold", marginTop: "10px", fontSize: "1.2rem" }}>
                {trip?.name || "Trip Name"}
              </Typography>
              <Typography sx={{ color: "#666", marginBottom: "10px" }}>
                📍 {trip?.location || "Location"}
              </Typography>
              <hr style={{ margin: "15px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Booking Date
                </p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  📅 {formattedDate}
                </p>
              </div>

              {departureArrivalTime && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
                  <p style={{ margin: 0, color: "#666" }}>
                    Time
                  </p>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    🕐 {departureArrivalTime}
                  </p>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Package
                </p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  📦 {selectedPackage?.name || "Standard Experience"}
                </p>
              </div>

              <hr style={{ margin: "15px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Base Price
                </p>
                <p style={{ margin: 0 }}>
                  AED {Number(trip?.default_price || 0).toLocaleString()}
                </p>
              </div>

              {selectedPackage && selectedPackage.price && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <p style={{ margin: 0, color: "#666" }}>
                    Package Upgrade
                  </p>
                  <p style={{ margin: 0 }}>
                    AED {Number(selectedPackage.price).toLocaleString()}
                  </p>
                </div>
              )}
            </Box>
          </Box>

          <Box sx={{ 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            borderRadius: "20px", 
            padding: { xs: "16px", md: "20px" },
            flex: 1,
            width: { xs: "100%", md: "auto" }
          }}>
            <Typography sx={{ 
              textAlign: "left", 
              color: theme.palette.secondary.main, 
              fontWeight: "bold", 
              fontSize: { xs: "18px", md: "20px" },
              mb: 2
            }}>
              Payment Summary
            </Typography>
            <Box>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ margin: 0 }}>
                  Subtotal
                </p>
                <p style={{ fontWeight: "bold", margin: 0 }}>
                  AED {Number(finalPrice).toLocaleString()}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ margin: 0 }}>
                  Promotion Discount
                </p>
                <p style={{ margin: 0 }}>
                  - AED 0
                </p>
              </div>

              <hr style={{ margin: "15px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>
                  Total Paid
                </p>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.2rem", color: theme.palette.secondary.main }}>
                  AED {Number(finalPrice).toLocaleString()}
                </p>
              </div>
            </Box>
          </Box>
        </Box>
      
      </Box>
    </div>
  )
}