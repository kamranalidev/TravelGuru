import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

interface CustomButtonProps {
  bgColor?: string;
  width?: string;
}

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "bgColor" && prop !== "width",
})<CustomButtonProps>(({ bgColor, width }) => ({
  backgroundColor: bgColor || "#FF621F",
  color: "white",
  padding: "10px 20px",
  borderRadius: "8px",
  textTransform: "none",
  width: width || "100%",
  "&:hover": {
    backgroundColor: bgColor || "#FF621F",
  },
}));

type ButtonComponentProps = {
  title: string;
  bgColor?: string;
  width?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
};

export const ButtonComponent = ({
  title,
  bgColor,
  width,
  onClick,
  style,
  type,
  disabled,
  isLoading,
  loadingText,
}: ButtonComponentProps) => {
  const label = isLoading ? loadingText || "Processing..." : title;

  return (
    <CustomButton
      type={type || "button"}
      variant="contained"
      bgColor={bgColor}
      width={width}
      onClick={onClick}
      style={style}
      disabled={disabled || isLoading}
    >
      {label}
    </CustomButton>
  );
};
