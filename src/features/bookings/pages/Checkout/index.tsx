import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { CustomTextField,ButtonComponent } from '../../../../components';
import theme from '../../../../theme';
import { useNavigate } from 'react-router-dom';
import { StepperComponent ,Header} from '../../../../components'
export const Checkout = () => {
  return (
    <Box sx={{backgroundColor: "#f5f5f5" }}>
      <Header hidePages={true} />
      <StepperComponent activeStep={2} />
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
             <Typography className='textStyle'>
              Here stripe component will Go
            </Typography>
            </Box>
            <Typography className='textStyle'>
              By continuing, you acknowledge and agree to travel guru's general terms and conditions, privacy policy, and cancellation policy.
            </Typography>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <Typography className='textStyle'  >
                your booking will be submitted  once you got blah blah vlah
              </Typography>
              <ButtonComponent title={'Pay now'} width='40%' />
            </Box>
          </Box>
        </Box>
        <Box sx={{   borderRadius: "20px", width: "20%" }}>
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
        </Box>
      
      </Box>
    </Box>
  )
}
