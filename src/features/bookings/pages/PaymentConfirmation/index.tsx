import { Header } from '../../../../components';
import Box from '@mui/material/Box';
import { StepperComponent } from '../../../../components';
import theme from '../../../../theme';
import { Typography } from '@mui/material';
import { CustomTextField ,ButtonComponent} from '../../../../components';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import './index.css';


export const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  // Extract booking data from navigation state
  const bookingData = state || null;
  const trip = bookingData?.trip || null;
  const bookingDate = bookingData?.bookingDate || null;
  const selectedPackage = bookingData?.selectedPackage || null;
  const finalPrice = bookingData?.finalPrice || 0;
  
  // Format the date for display
  const formattedDate = bookingDate ? dayjs(bookingDate).format("DD MMM YYYY") : "Not selected";

  return (
    <div style={{ backgroundColor: "#f5f5f5" }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={1} />
      <Box className="centerSection">

        <Box sx={{ backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", borderRadius: "20px", width: "50%" }}>

          <Typography variant="h4" sx={{ textAlign: "left", marginTop: "20px", color: theme.palette.secondary.main, fontWeight: "bold", fontSize: "20px", padding: "20px" }}>
            Enter info
          </Typography>
          <Box sx={{ borderTop: "1px solid #e6e6e6", padding: "20px" }}>
            <Typography  className='textStyle'>
              Contact Info
            </Typography>
            <Typography className='textStyle'>
              we will use this information to contact you about your booking.
            </Typography>
            <Box>
              <CustomTextField
                label="First Name"
                placeholder="Enter your first name"
                fullWidth
                labelcolor={theme.palette.secondary.main}
                labelfocusedcolor={theme.palette.secondary.main}
                borderfocusedcolor={theme.palette.secondary.main}
                borderhovercolor={theme.palette.secondary.main}
                bordercolor={theme.palette.secondary.main}
                margin="normal"
              /><CustomTextField
                label="Last Name"
                placeholder="Enter your Last name"
                fullWidth
                labelcolor={theme.palette.secondary.main}
                labelfocusedcolor={theme.palette.secondary.main}
                borderfocusedcolor={theme.palette.secondary.main}
                borderhovercolor={theme.palette.secondary.main}

                bordercolor={theme.palette.secondary.main}
                margin="normal"
              /><CustomTextField
                label="Email"
                placeholder="Enter your email"
                fullWidth
                labelcolor={theme.palette.secondary.main}
                labelfocusedcolor={theme.palette.secondary.main}
                borderfocusedcolor={theme.palette.secondary.main}
                bordercolor={theme.palette.secondary.main}
                borderhovercolor={theme.palette.secondary.main}

                margin="normal"
              />
              <CustomTextField
                label="Phone Number"
                placeholder="Enter your phone number"
                fullWidth
                labelcolor={theme.palette.secondary.main}
                labelfocusedcolor={theme.palette.secondary.main}
                borderfocusedcolor={theme.palette.secondary.main}
                bordercolor={theme.palette.secondary.main}
                
                margin="normal"
              />
            </Box>
            <Typography className='textStyle'>
              By continuing, you acknowledge and agree to travel guru's general terms and conditions, privacy policy, and cancellation policy.
            </Typography>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <Typography className='textStyle'  >
                your booking will be submitted  once you got blah blah vlah
              </Typography>
              <ButtonComponent title={'Go to payment'} width='40%' onClick={()=>navigate("/checkout")}/>
            </Box>
          </Box>
        </Box>
        <Box sx={{   borderRadius: "20px", width: "30%" }}>
          <Box sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",marginBottom: "20px",backgroundColor: "#fff",borderRadius: "20px", padding: "20px" }}>
            <Typography  sx={{ textAlign: "left", color: theme.palette.secondary.main, fontWeight: "bold", fontSize: "20px" }}>
              Booking Details
            </Typography>
            <Box >
              <Typography sx={{ fontWeight: "bold", marginTop: "10px" }}>
                {trip?.name || "Trip Name"}
              </Typography>
              <Typography sx={{ color: "#666", marginBottom: "10px" }}>
                {trip?.location || "Location"}
              </Typography>
              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Booking Date
                </p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {formattedDate}
                </p>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Package
                </p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {selectedPackage?.name || "Free"}
                </p>
              </div>

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <p style={{ margin: 0, color: "#666" }}>
                  Base Price
                </p>
                <p style={{ margin: 0 }}>
                  US$ {trip?.default_price?.toFixed(2) || "0.00"}
                </p>
              </div>

              {selectedPackage && selectedPackage.name?.toLowerCase() !== "free" && selectedPackage.multiplier && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <p style={{ margin: 0, color: "#666" }}>
                    Package Multiplier ({selectedPackage.name})
                  </p>
                  <p style={{ margin: 0 }}>
                    {selectedPackage.multiplier}x
                  </p>
                </div>
              )}


            </Box>
          </Box>

          <Box sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",marginBottom: "20px",backgroundColor: "#fff",borderRadius: "20px", padding: "20px" }}>
            <Box >
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ margin: 0 }}>
                  Subtotal
                </p>
                <p style={{fontWeight: "bold", margin: 0}}>
                  US$ {finalPrice.toFixed(2)}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ margin: 0 }}>
                  Promotion Discount
                </p>
                <p style={{ margin: 0 }}>
                  - US$ 0.00
                </p>
              </div>

              <hr />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem" }}>
                  Total
                </p>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1.1rem", color: theme.palette.secondary.main }}>
                  US$ {finalPrice.toFixed(2)}
                </p>
              </div>


            </Box>
          </Box>
        </Box>
      
      </Box>
    </div>
  )
}