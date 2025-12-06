import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { styled } from "@mui/material/styles";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { Check } from "@mui/icons-material";
const steps = ["Select package", "Checkout", "Confirmation"];
// Orange background container
const OrangeContainer = styled(Box)(({ theme }) => ({
  // background: 'linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)',
  padding: theme.spacing(4),
  minHeight: "150px",
}));

// Custom connector for orange theme
const OrangeConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#ff6f00",
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#ff6f00",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#ff6f00",
    },
  },
}));
// Custom step icon
const OrangeStepIconRoot = styled("div")(({ theme }) => ({
  zIndex: 1,
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "16px",
  fontWeight: 600,
  transition: "all 0.3s ease",
  "&.completed": {
    backgroundColor: "#ff6f00",
    color: "#ffffff",
    border: "none",
  },
  "&.active": {
    backgroundColor: "#ff6f00",
    color: "#ffffff",
    border: "none",
  },
  "&.inactive": {
    backgroundColor: "#ffb74d",
    color: "#ffffff",
    border: "2px solid rgba(255, 255, 255, 0.5)",
  },
}));
function OrangeStepIcon(props: any) {
  const { active, completed, className } = props;

  const stepClass = completed ? "completed" : active ? "active" : "inactive";

  return (
    <OrangeStepIconRoot className={`${className} ${stepClass}`}>
      {completed ? <Check /> : props.icon}
    </OrangeStepIconRoot>
  );
}

export const StepperComponent = (props: { activeStep: number }) => {
  return (
    <OrangeContainer>
      <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
        <Stepper
          activeStep={props.activeStep}
          alternativeLabel
          connector={<OrangeConnector />}
          sx={{
            "& .MuiStepLabel-label": {
              color: "#ff6f00",
              fontSize: "16px",
              fontWeight: 500,
              marginTop: 1,
              "&.Mui-active": {
                color: "#ff6f00",
                fontWeight: 600,
              },
              "&.Mui-completed": {
                color: "#ff6f00",
                fontWeight: 500,
              },
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={OrangeStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </OrangeContainer>
  );
};
