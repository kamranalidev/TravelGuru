import { createTheme } from "@mui/material/styles";
import { enUS } from "@mui/material/locale";

const theme = createTheme({
  palette: {
    primary: { main: "#d74712", dark: "#b93b0d", contrastText: "#ffffff" },
    secondary: { main: "#d74712" },
    text: { primary: "#242424", secondary: "#666666" },
    background: { default: "#ffffff", paper: "#ffffff" },
    divider: "#e8e8e8",
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-1.5px" },
    h2: { fontWeight: 700, letterSpacing: "-1px" },
    h3: { fontWeight: 700, letterSpacing: "-.6px" },
    h4: { fontWeight: 650, letterSpacing: "-.4px" },
    h5: { fontWeight: 650 },
    h6: { fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 7, padding: "10px 18px", boxShadow: "none" } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiCard: { styleOverrides: { root: { border: "1px solid #e6e6e6", borderRadius: 10, boxShadow: "none" } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 7 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 5, fontWeight: 500 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12, boxShadow: "0 16px 64px #00000026" } } },
  },
}, enUS);
export default theme;
