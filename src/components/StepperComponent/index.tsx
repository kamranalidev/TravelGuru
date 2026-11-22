import { Box, Step, StepLabel, Stepper } from "@mui/material";

const steps = ["Your cart", "Payment", "Confirmation"];
export const StepperComponent = ({ activeStep }: { activeStep: number }) => <Box sx={{ py: { xs: 3, md: 4 }, px: 2, borderBottom: "1px solid #eee", bgcolor: "#fff" }}>
  <Stepper activeStep={Math.max(0, activeStep - 1)} alternativeLabel sx={{ maxWidth: 620, mx: "auto", "& .MuiStepLabel-label": { fontSize: "0.875rem" }, "& .MuiStepConnector-line": { borderColor: "#ddd" }, "& .MuiStepIcon-root": { color: "#ddd", "&.Mui-active, &.Mui-completed": { color: "#d74712" } } }}>
    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
  </Stepper>
</Box>;
