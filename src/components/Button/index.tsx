import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

interface CustomButtonProps {
  bgColor?: string;
  width?: string;
}

const CustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<CustomButtonProps>(({ bgColor ,width}) => ({
  backgroundColor: bgColor || '#FF621F',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  textTransform: 'none',
  width: width || '100%',
  '&:hover': {
    backgroundColor: bgColor || '#FF621F',
  },
}));

export const ButtonComponent = (props:{title:string,bgColor?:string,width?:string,onClick?: () => void,style?: React.CSSProperties ,type?:any}) => {
  return (
    <><CustomButton type={props.type||"button"}variant="contained" bgColor={props.bgColor} width={props.width} onClick={props.onClick} style={props.style}>{props.title}</CustomButton></>
  )
}
