import React from 'react'
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
const StyledTextField = styled(TextField)`
  & label {
    color: #3f51b5;
  }

  & label.Mui-focused {
    color: #ff5722;
  }

  & .MuiOutlinedInput-root {
    border-radius: 8px;
    min-width:350px;
    
    & fieldset {
      border-color: #ccc;
    }

    &:hover fieldset {
      border-color: #3f51b5;
    }

    &.Mui-focused fieldset {
      border-color: #ff5722;
    }
  }
`;
export const CustomTextField = (props:any) => {
  return <StyledTextField title={props.title} placeholder={props.placeholder} variant="outlined" {...props} />;
};  

