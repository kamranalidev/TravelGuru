import { Header } from '../../../../components';
import Box from '@mui/material/Box';
import { StepperComponent } from '../../../../components';
import theme from '../../../../theme';
import { Typography } from '@mui/material';
import { CustomTextField ,ButtonComponent} from '../../../../components';
import { useNavigate } from 'react-router-dom';
import './index.css';


export const PaymentConfirmation = () => {
  const navigate = useNavigate();

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
                  date
                </p>
                <p>
                  21 Aug 2025
                </p>
              </div>


            </Box>
          </Box>
        </Box>
      
      </Box>
    </div>
  )
}