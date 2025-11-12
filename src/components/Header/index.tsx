import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import theme from "../../theme";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const pages = [
  { label: "Home", route: "/" },
  { label: "Services", route: "/services" },
  { label: "Destination", route: "/destination" },
  { label: "Blog", route: "/blog" },
  { label: "About Us", route: "/about" },
];

export const Header = (props: { hidePages?: boolean }) => {
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const authenticated = localStorage.getItem("supabase_session") ? true : false;
  return (
    <Box component="header" sx={{ width: "100%" }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "inherit",
          py: { xs: 2, md: 3 },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            px: { xs: 2, md: 4 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 2, md: 4 },
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              px: { xs: 3, md: 5 },
              py: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <img
                src="/assets/Logo-02.png"
                alt="TravelGuru Logo"
                style={{ width: "110px", height: "auto" }}
              />
            </Box>
            {!props.hidePages && (
              <>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {pages.map((page) => (
                    <Button
                      key={page.label}
                      onClick={() => handleNavigate(page.route)}
                      sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 500,
                        textTransform: "none",
                        fontSize: "1rem",
                      }}
                    >
                      {page.label}
                    </Button>
                  ))}
                </Box>
                {!authenticated && (
                  <Typography
                    component="button"
                    sx={{
                      display: { xs: "none", sm: "block" },
                      cursor: "pointer",
                      color: theme.palette.secondary.main,
                      background: "transparent",
                      border: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                    onClick={() => handleNavigate("/login")}
                  >
                    Login
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
