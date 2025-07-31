// theme.js or theme.ts
import { createTheme } from '@mui/material/styles';

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
});

export default theme;
