import { useState } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";

type PasswordFieldProps = TextFieldProps & {
  labelcolor?: string;
  labelfocusedcolor?: string;
  bordercolor?: string;
  borderhovercolor?: string;
  borderfocusedcolor?: string;
};

const StyledTextField = styled(TextField)<PasswordFieldProps>(
  ({
    labelcolor = "#3f51b5",
    labelfocusedcolor = "#ff5722",
    bordercolor = "#ccc",
    borderhovercolor = "#3f51b5",
    borderfocusedcolor = "#ff5722",
  }) => ({
    "& label": {
      color: labelcolor,
    },
    "& label.Mui-focused": {
      color: labelfocusedcolor,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      minWidth: 350,
      "& fieldset": {
        borderColor: bordercolor,
      },
      "&:hover fieldset": {
        borderColor: borderhovercolor,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderfocusedcolor,
      },
    },
  })
);

export const PasswordField = (props: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <StyledTextField
      {...props}
      type={showPassword ? "text" : "password"}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
