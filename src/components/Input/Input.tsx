import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material/TextField";
import "./index.css";

type CustomTextFieldProps = TextFieldProps & {
  labelcolor?: string;
  labelfocusedcolor?: string;
  bordercolor?: string;
  borderhovercolor?: string;
  borderfocusedcolor?: string;
};

const StyledTextField = styled(TextField)<CustomTextFieldProps>(
  ({
    labelcolor = "#3f51b5",
    labelfocusedcolor = "#ff5722",
    bordercolor = "#ccc",
    borderhovercolor = "#3f51b5",
    borderfocusedcolor = "#ff5722",
  }) => ({
    width: "100%",
    "& label": {
      color: labelcolor,
    },
    "& label.Mui-focused": {
      color: labelfocusedcolor,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      width: "100%",
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
