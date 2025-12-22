import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Logout from "@mui/icons-material/Logout";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import theme from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { ProfileModal } from "../ProfileModal";

interface PageItem {
  label: string;
  route: string;
  isScroll?: boolean;
}

const pages: PageItem[] = [
  { label: "Home", route: "/" },
  { label: "Services", route: "/services" },
  { label: "FAQ", route: "/faq" },
  { label: "Contact Us", route: "/contact" },
];

export const Header = (props: { hidePages?: boolean }) => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const isMenuOpen = Boolean(menuAnchor);

  const handleNavigate = (route: string, isScroll?: boolean) => {
    if (isScroll && route.includes("#")) {
      const [path, sectionId] = route.split("#");

      if (window.location.pathname !== path) {
        navigate(path);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }
    } else {
      navigate(route);
    }
  };

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("supabase_session");
      navigate("/");
    }
  };

  const handleBookingsNavigate = () => {
    handleCloseMenu();
    navigate("/bookings");
  };

  const handleProfileNavigate = () => {
    handleCloseMenu();
    setProfileModalOpen(true);
  };

  const displayName = useMemo(() => {
    if (!session?.user) return "Login";
    return (
      profile?.full_name?.trim() ||
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      profile?.email?.split("@")[0] ||
      session.user.email?.split("@")[0] ||
      "Traveler"
    );
  }, [profile?.email, profile?.full_name, session?.user]);

  const avatarUrl =
    profile?.profile_picture ||
    session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture ||
    null;

  const userInitials = useMemo(() => {
    if (!session?.user) return "TG";
    const nameParts = displayName.trim().split(" ");
    const initials = nameParts
      .map((part: any) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return initials || "TG";
  }, [displayName, session?.user]);

  const userEmail = profile?.email || session?.user?.email;

  const isAuthenticated = Boolean(session);

  return (
    <Box
      component="header"
      sx={{ width: "100%", position: "relative", zIndex: 1000 }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          color: "inherit",
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: "100%",
            maxWidth: "1400px", 
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
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              px: { xs: 3, md: 6 },
              py: { xs: 1.25, md: 1.5 },
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
                style={{ width: "120px", height: "auto" }} 
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
                      onClick={() => handleNavigate(page.route, page.isScroll)}
                      sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600, 
                        textTransform: "none",
                        fontSize: "1rem",
                        px: 2,
                        py: 0.75,
                        borderRadius: "12px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          color: "#FF621F",
                        },
                      }}
                    >
                      {page.label}
                    </Button>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    disableRipple
                    onClick={
                      isAuthenticated
                        ? handleOpenMenu
                        : () => handleNavigate("/login")
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      px: { xs: 1.5, sm: 2 },
                      py: 0.75,
                      color: theme.palette.secondary.main,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.4)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <Avatar
                      src={avatarUrl || undefined}
                      alt={displayName}
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: avatarUrl
                          ? "transparent"
                          : "rgba(255, 98, 31, 0.15)",
                        color: avatarUrl ? "inherit" : "#FF621F",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {!avatarUrl ? userInitials : null}
                    </Avatar>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayName}
                    </Typography>
                  </Button>

                  <Menu
                    anchorEl={menuAnchor}
                    open={isMenuOpen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1,
                        borderRadius: "20px",
                        minWidth: 200,
                        px: 0.5,
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {displayName}
                      </Typography>
                      {userEmail && (
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "text.secondary",
                            mt: 0.25,
                            wordBreak: "break-word",
                          }}
                        >
                          {userEmail}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleProfileNavigate}>
                      <ListItemIcon>
                        <ManageAccountsRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleBookingsNavigate}>
                      <ListItemIcon>
                        <EventNoteRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      Bookings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </Box>
  );
};