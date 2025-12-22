import { createTheme } from '@mui/material/styles';
import { enUS } from "@mui/material/locale";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#FF621F',
    },
    background:{
      default: '#F0F0F0'
    }
  },
},enUS);

export default theme;