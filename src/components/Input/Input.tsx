import { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { TextFieldProps } from "@mui/material/TextField";
type CustomTextFieldProps = TextFieldProps & {
  labelcolor?: string;
  labelfocusedcolor?: string;
  bordercolor?: string;
  borderhovercolor?: string;
  borderfocusedcolor?: string;
};

const StyledTextField = styled(TextField)<CustomTextFieldProps>(
  ({ labelcolor = "#666666", labelfocusedcolor = "#FF621F", bordercolor = "#E0E0E0", borderhovercolor = "#FF8A50", borderfocusedcolor = "#FF621F" }) => ({
    fontFamily: 'Inter, sans-serif',
    "& label": {
      color: labelcolor,
      fontFamily: 'Inter, sans-serif',
    },
    "& label.Mui-focused": {
      color: labelfocusedcolor,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      minWidth: 350,
      fontFamily: 'Inter, sans-serif',
      "& input": {
        fontFamily: 'Inter, sans-serif',
        padding: '12px 14px',
      },
      "& fieldset": {
        borderColor: bordercolor,
        borderWidth: '1.5px',
      },
      "&:hover fieldset": {
        borderColor: borderhovercolor,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderfocusedcolor,
        borderWidth: '2px',
      },
    },
    transition: 'all 0.2s ease-in-out',
  })
);

export const CustomTextField = (props: CustomTextFieldProps) => {
  return (
    <StyledTextField
      label={props.label}
      placeholder={props.placeholder}
      variant="outlined"
      {...props}
    />
  );
};

export const PasswordField = (props: CustomTextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <StyledTextField
      {...props}
      type={showPassword ? "text" : "password"}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={toggleShowPassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
