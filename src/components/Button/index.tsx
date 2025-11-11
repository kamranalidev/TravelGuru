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
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  width: width || '100%',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '1rem',
  boxShadow: '0 2px 8px rgba(255, 98, 31, 0.3)',
  '&:hover': {
    backgroundColor: bgColor || '#E65100',
    boxShadow: '0 4px 12px rgba(255, 98, 31, 0.4)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease-in-out',
}));

export const ButtonComponent = (props:{title:string,bgColor?:string,width?:string,onClick?: () => void,style?: React.CSSProperties ,type?:any}) => {
  return (
    <><CustomButton type={props.type||"button"}variant="contained" bgColor={props.bgColor} width={props.width} onClick={props.onClick} style={props.style}>{props.title}</CustomButton></>
  )
}
