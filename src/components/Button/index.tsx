import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

interface CustomButtonProps {
  bgColor?: string;
}

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<CustomButtonProps>(({ bgColor }) => ({
  backgroundColor: bgColor || '#FF621F',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: bgColor || '#FF621F',
  },
}));

export const ButtonComponent = (props:{title:string,bgColor:string}) => {
  return (
    <div><CustomButton variant="contained" bgColor={props.bgColor}>{props.title}</CustomButton></div>
  )
}
