import { useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Badge, Button, Drawer, IconButton, Menu, MenuItem } from "@mui/material";
import { Menu as MenuIcon, X, Search, ShoppingCart, UserRound, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { ProfileModal } from "../ProfileModal";
import { CountrySelector } from "../CountrySelector";
import type { RootState, AppDispatch } from "../../store/store";
import { logout as logoutAction } from "../../store/features/auth/authSlice";
import { clearProfile } from "../../store/features/profile/profileSlice";
import { clearCart } from "../../store/features/cart/cartSlice";
import { clearServerCartState } from "../../store/features/serverCart/serverCartSlice";
import "./index.css";

const pages = [{ label: "Explore", route: "/services" }, { label: "About us", route: "/about" }, { label: "Help centre", route: "/faq" }, { label: "Contact", route: "/contact" }];

export const Header = ({ hidePages = false }: { hidePages?: boolean }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { session, profile } = useAuth();
  const cartCount = useSelector((s: RootState) => s.cart.items.length);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const name = profile?.full_name?.split(" ")[0] || "My account";
  const search = (e: FormEvent) => { e.preventDefault(); navigate(`/services${query.trim() ? `?query=${encodeURIComponent(query.trim())}` : ""}`); };
  const logout = async () => {
    setAnchor(null);
    try {
      await supabase.auth.signOut();
    } finally {
      dispatch(logoutAction()); dispatch(clearProfile()); dispatch(clearCart()); dispatch(clearServerCartState());
      try { localStorage.removeItem("supabase_session"); } catch { /* Storage may be unavailable. */ }
      navigate("/");
    }
  };

  return <>
    <header className="site-header">
      <div className="header-main">
        <Link to="/" className="brand" aria-label="Travel Guroo home"><img src="/Travel-Guru-Logo-Final.png" alt="" /><span>travel<span>guroo</span></span></Link>
        {!hidePages && <form className="header-search" onSubmit={search} role="search"><Search size={18} /><label className="sr-only" htmlFor="header-search">Find destinations and experiences</label><input id="header-search" placeholder="Search destinations, tours, and more" value={query} onChange={e => setQuery(e.target.value)} /><button type="submit" aria-label="Search"><Search size={17} /></button></form>}
        <div className="header-actions">
          <Link className="header-help" to="/contact">Get help</Link>
          <IconButton onClick={() => navigate("/cart")} aria-label={`Cart, ${cartCount} items`}><Badge badgeContent={cartCount} color="secondary"><ShoppingCart size={21} strokeWidth={1.7} /></Badge></IconButton>
          {session ? <Button className="account-button" color="inherit" startIcon={<UserRound size={18} />} endIcon={<ChevronDown size={14} />} onClick={e => setAnchor(e.currentTarget)} aria-haspopup="menu" aria-expanded={!!anchor}>{name}</Button> : <Button variant="contained" onClick={() => navigate("/login")}>Log in</Button>}
          <IconButton className="mobile-nav-toggle" aria-label="Open navigation" onClick={() => setDrawer(true)}><MenuIcon size={22} /></IconButton>
        </div>
      </div>
      {!hidePages && <nav className="header-navigation" aria-label="Main navigation"><div className="header-nav-inner"><div className="header-country"><CountrySelector /></div><div className="header-nav-links">{pages.map(p => <NavLink key={p.route} to={p.route}>{p.label}</NavLink>)}</div><span className="header-currency">Prices in AED</span></div></nav>}
    </header>
    <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
      <MenuItem onClick={() => { setAnchor(null); navigate("/bookings"); }}>My bookings</MenuItem>
      <MenuItem onClick={() => { setAnchor(null); setProfileOpen(true); }}>Edit profile</MenuItem>
      <MenuItem onClick={() => void logout()}>Log out</MenuItem>
    </Menu>
    <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
      <div className="mobile-navigation"><div className="mobile-navigation-heading"><strong>Travel Guroo</strong><IconButton aria-label="Close navigation" onClick={() => setDrawer(false)}><X size={21} /></IconButton></div>
        {pages.map(p => <NavLink key={p.route} to={p.route} onClick={() => setDrawer(false)}>{p.label}</NavLink>)}
        {session && <Link to="/bookings" onClick={() => setDrawer(false)}>My bookings</Link>}
        <div className="mobile-country"><CountrySelector /></div>
      </div>
    </Drawer>
    <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
  </>;
};
