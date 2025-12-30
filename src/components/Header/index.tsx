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
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Logout from "@mui/icons-material/Logout";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { ProfileModal } from "../ProfileModal";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logout as logoutAction } from "../../store/features/auth/authSlice";
import { clearProfile } from "../../store/features/profile/profileSlice";
import { clearCart } from "../../store/features/cart/cartSlice";
import { clearServerCartState } from "../../store/features/serverCart/serverCartSlice";
import "./index.css";

interface PageItem {
  label: string;
  route: string;
  isScroll?: boolean;
}

const pages: PageItem[] = [
  { label: "Home", route: "/" },
  { label: "Services", route: "/services" },
  { label: "About Us", route: "/about" },
  { label: "FAQ", route: "/faq" },
  { label: "Contact Us", route: "/contact" },
];

export const Header = (props: { hidePages?: boolean }) => {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const cartCount = useSelector((s: RootState) => s.cart.items.length);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMenuOpen = Boolean(menuAnchor);

  const handleNavigate = (route: string, isScroll?: boolean) => {
    setMobileDrawerOpen(false); // Close mobile drawer on navigate
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
      // Ensure all local app state is cleared even if signOut fails.
      dispatch(logoutAction());
      dispatch(clearProfile());
      dispatch(clearCart());
      dispatch(clearServerCartState());

      // Clear app-specific cached session
      localStorage.removeItem("supabase_session");

      // Clear supabase-js persisted session keys (sb-<project-ref>-auth-token)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          localStorage.removeItem(key);
        }
      }

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
      sx={{ width: "100%", position: "sticky", top: 0, zIndex: 1200 }}
    >
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 0 0 rgba(0, 0, 0, 0.08)",
          color: "inherit",
          py: 0,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            px: { xs: 2, md: 4 },
            minHeight: { xs: 60, md: 70 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 2, md: 4 },
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
                style={{ width: "96px", height: "auto" }}
              />
            </Box>
            {!props.hidePages && (
              <>
                {/* Mobile hamburger menu */}
                <IconButton
                  aria-label="menu"
                  onClick={() => setMobileDrawerOpen(true)}
                  sx={{
                    display: { xs: "flex", md: "none" },
                    color: "#333",
                  }}
                >
                  <MenuIcon />
                </IconButton>

                {/* Desktop navigation */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {pages.map((page) => (
                    <Button
                      key={page.label}
                      onClick={() => handleNavigate(page.route, page.isScroll)}
                      sx={{
                        color: "#333",
                        fontWeight: 500,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        px: 2,
                        py: 1,
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
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
                    gap: 1.5,
                  }}
                >
                  {/* Cart entry point (authenticated only) */}
                  {isAuthenticated ? (
                    <IconButton
                      aria-label="cart"
                      onClick={() => navigate("/cart")}
                      sx={{
                        color: "#333",
                        "&:hover": {
                          bgcolor: "#f5f5f5",
                        },
                      }}
                    >
                      <Badge
                        badgeContent={cartCount}
                        color="warning"
                        overlap="circular"
                        max={99}
                      >
                        <ShoppingCartOutlinedIcon />
                      </Badge>
                    </IconButton>
                  ) : null}

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
                      gap: 1,
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      px: { xs: 1.5, sm: 2 },
                      py: 0.75,
                      color: "#333",
                      textTransform: "none",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "#d0d0d0",
                      },
                    }}
                  >
                    <Avatar
                      src={avatarUrl || undefined}
                      alt={displayName}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: avatarUrl ? "transparent" : "#FF621F",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {!avatarUrl ? userInitials : null}
                    </Avatar>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        whiteSpace: "nowrap",
                        display: { xs: "none", sm: "block" },
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
                        mt: 1.5,
                        borderRadius: "12px",
                        minWidth: 220,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: "#333",
                        }}
                      >
                        {displayName}
                      </Typography>
                      {userEmail && (
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "#666",
                            mt: 0.25,
                            wordBreak: "break-word",
                          }}
                        >
                          {userEmail}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <MenuItem
                      onClick={handleProfileNavigate}
                      sx={{ py: 1.5, "&:hover": { bgcolor: "#f5f5f5" } }}
                    >
                      <ListItemIcon>
                        <ManageAccountsRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={handleBookingsNavigate}
                      sx={{ py: 1.5, "&:hover": { bgcolor: "#f5f5f5" } }}
                    >
                      <ListItemIcon>
                        <EventNoteRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      Bookings
                    </MenuItem>
                    <MenuItem
                      onClick={handleLogout}
                      sx={{ py: 1.5, "&:hover": { bgcolor: "#f5f5f5" } }}
                    >
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

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 320,
            borderRadius: 0,
          },
        }}
      >
        <Box className="mobile-drawer">
          <Box className="mobile-drawer-header">
            <img
              src="/assets/Logo-02.png"
              alt="TravelGuru Logo"
              className="mobile-drawer-logo"
              onClick={() => {
                setMobileDrawerOpen(false);
                navigate("/");
              }}
              style={{ cursor: "pointer" }}
            />
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              className="mobile-drawer-close"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className="mobile-drawer-content">
            <List disablePadding>
              {pages.map((page) => (
                <ListItem key={page.label} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(page.route, page.isScroll)}
                    sx={{
                      py: 2,
                      px: 3,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        "& .MuiListItemText-primary": {
                          color: "#FF621F",
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={page.label}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: "1rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <List disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate("/cart");
                      }}
                      sx={{ py: 2, px: 3 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Badge badgeContent={cartCount} color="warning">
                          <ShoppingCartOutlinedIcon />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary="Cart"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: "1rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        navigate("/bookings");
                      }}
                      sx={{ py: 2, px: 3 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EventNoteRoundedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="My Bookings"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: "1rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setProfileModalOpen(true);
                      }}
                      sx={{ py: 2, px: 3 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ManageAccountsRoundedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Profile"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: "1rem",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </>
            )}
          </Box>

          <Box className="mobile-drawer-footer">
            {isAuthenticated ? (
              <>
                <Box className="mobile-drawer-user-section">
                  <Avatar
                    src={avatarUrl || undefined}
                    alt={displayName}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: avatarUrl ? "transparent" : "#FF621F",
                      color: "#ffffff",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {!avatarUrl ? userInitials : null}
                  </Avatar>
                  <Box className="mobile-drawer-user-info">
                    <Typography className="mobile-drawer-user-name">
                      {displayName}
                    </Typography>
                    {userEmail && (
                      <Typography className="mobile-drawer-user-email">
                        {userEmail}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  sx={{
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    borderRadius: 2,
                    py: 1.25,
                    "&:hover": {
                      borderColor: "#dc2626",
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  navigate("/login");
                }}
                sx={{
                  background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #e55519, #e67b44)",
                  },
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </Box>
  );
};
