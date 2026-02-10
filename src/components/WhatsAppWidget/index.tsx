import { Box, Fab, Tooltip, Zoom } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import "./index.css";

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
}

export const WhatsAppWidget = ({
  phoneNumber = "+971501234567", 
  message = "Hello! I'm interested in your Dubai travel services.",
}: WhatsAppWidgetProps) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Box className="whatsapp-widget-container">
      <Tooltip
        title="Chat with us on WhatsApp"
        placement="left"
        TransitionComponent={Zoom}
        arrow
      >
        <Fab
          className="whatsapp-widget"
          onClick={handleClick}
          aria-label="Contact us on WhatsApp"
        >
          <WhatsAppIcon className="whatsapp-icon" />
        </Fab>
      </Tooltip>
      <Box className="whatsapp-pulse-ring" />
    </Box>
  );
};

