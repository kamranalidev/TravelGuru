import * as React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { Header, StepperComponent } from "../../../../components/index.tsx";

export const PaymentConfirmation = () => {
  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Header hidePages />
      <StepperComponent activeStep={2} />
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Payment confirmation
        </Typography>
        <Typography sx={{ mt: 1, color: "#666" }}>
          This page is no longer used. After payment, you are redirected to the
          home page.
        </Typography>
      </Box>
    </Box>
  );
};
