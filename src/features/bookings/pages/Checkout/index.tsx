import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { CustomTextField,ButtonComponent } from '../../../../components';
import theme from '../../../../theme';
import { useNavigate } from 'react-router-dom';
import { StepperComponent ,Header} from '../../../../components'
export const Checkout = () => {
  return (
    <Box sx={{
      backgroundColor: theme.palette.background.default,
      minHeight: "100vh",
      fontFamily: 'Inter, sans-serif'
    }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={2} />
       <Box className="centerSection" style={{ padding: '2rem' }}>

        <Box sx={{ 
          backgroundColor: "#fff", 
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)", 
          borderRadius: "16px", 
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto"
        }}>

          <Typography variant="h4" sx={{ 
            textAlign: "left", 
            marginTop: "20px", 
            color: theme.palette.primary.main, 
            fontWeight: 700, 
            fontSize: "24px", 
            padding: "24px",
            fontFamily: 'Inter, sans-serif'
          }}>
            Enter info
          </Typography>
          <Box sx={{ borderTop: "1px solid #E0E0E0", padding: "24px" }}>
            <Typography sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#333333',
              marginBottom: '8px'
            }}>
              Contact Info
            </Typography>
            <Typography sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: '#666666',
              marginBottom: '24px'
            }}>
              We will use this information to contact you about your booking.
            </Typography>
            <Box sx={{ marginBottom: '24px' }}>
             <Typography sx={{
               fontFamily: 'Inter, sans-serif',
               fontSize: '0.95rem',
               color: '#666666'
             }}>
              Here stripe component will Go
            </Typography>
            </Box>
            <Typography sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              color: '#666666',
              marginBottom: '24px',
              lineHeight: 1.6
            }}>
              By continuing, you acknowledge and agree to travel guru's general terms and conditions, privacy policy, and cancellation policy.
            </Typography>
            <Box style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginTop: "20px",
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <Typography sx={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                color: '#666666',
                flex: 1,
                minWidth: '200px'
              }}>
                Your booking will be submitted once you complete the payment.
              </Typography>
              <ButtonComponent title={'Pay now'} width='200px' />
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
  )
}
