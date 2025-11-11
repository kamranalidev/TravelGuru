import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import theme from '../../theme';
import logo from '../../assets/Logo-02.png';
import { supabase } from '../../supabaseClient';

const pages = [
    { label: 'Home', route: '/' },
    { label: 'Services', route: '/services' },
    { label: 'Destination', route: '/destination' },
    { label: 'Blog', route: '/blog' },
    { label: 'About Us', route: '/about' }
];

export const Header = (props: { hidePages?: boolean }) => {
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const rawSession = localStorage.getItem('supabase_session');
    const session = useMemo(() => {
        if (!rawSession) {
            return null;
        }
        try {
            return JSON.parse(rawSession);
        } catch (error) {
            console.warn('Unable to parse session from storage', error);
            return null;
        }
    }, [rawSession]);

    const authenticated = Boolean(session);
    const userMetadata = session?.user?.user_metadata ?? {};
    const displayName = userMetadata.full_name || session?.user?.email || 'Traveler';
    const avatarUrl = userMetadata.avatar_url;
    const initials = useMemo(() => {
        if (avatarUrl) {
            return '';
        }
        if (!displayName) {
            return 'TG';
        }
        const parts = displayName.split(' ').filter(Boolean);
        if (!parts.length) {
            return displayName.charAt(0).toUpperCase();
        }
        const letters = parts.map((part: string) => part.charAt(0)).slice(0, 2).join('');
        return letters.toUpperCase();
    }, [avatarUrl, displayName]);

    const handleNavigate = (route: string) => {
        navigate(route);
    };

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out', error);
        } finally {
            localStorage.removeItem('supabase_session');
            handleCloseUserMenu();
            navigate('/login');
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    color: '#1F1F1F',
                    boxShadow: '0px 16px 40px rgba(255, 98, 31, 0.12)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 98, 31, 0.12)'
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: { xs: 2, md: 3 },
                        px: { xs: 2, md: 4 },
                        py: 1.5
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/')}
                    >
                        <img
                            src={logo}
                            alt="Travel Guru Logo"
                            style={{ width: 56, height: 56, objectFit: 'contain' }}
                        />
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '0.08rem',
                                color: '#333333',
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span style={{ color: theme.palette.primary.main }}>Travel</span>
                            <span>Guru</span>
                        </Typography>
                    </Box>

                    {!props.hidePages && (
                        <Box
                            component="nav"
                            sx={{
                                flexGrow: 1,
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: 'center',
                                gap: 1.5
                            }}
                        >
                            {pages.map((page) => (
                                <Button
                                    key={page.label}
                                    onClick={() => handleNavigate(page.route)}
                                    sx={{
                                        color: '#333333',
                                        fontWeight: 500,
                                        fontSize: '1rem',
                                        borderRadius: '12px',
                                        px: 2,
                                        py: 1,
                                        '&:hover': {
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'rgba(255, 98, 31, 0.08)'
                                        }
                                    }}
                                >
                                    {page.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        {!authenticated && (
                            <Button
                                variant="outlined"
                                onClick={() => handleNavigate('/login')}
                                sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    px: 2.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 98, 31, 0.12)',
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                Login
                            </Button>
                        )}

                        {authenticated && (
                            <>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        display: { xs: 'none', md: 'block' },
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        color: '#333333'
                                    }}
                                >
                                    {displayName}
                                </Typography>
                                <Tooltip title="Account settings">
                                    <IconButton
                                        onClick={handleOpenUserMenu}
                                        size="small"
                                        sx={{
                                            border: '2px solid rgba(255, 98, 31, 0.4)',
                                            padding: 0.5
                                        }}
                                        aria-controls={anchorElUser ? 'account-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={anchorElUser ? 'true' : undefined}
                                    >
                                        <Avatar
                                            src={avatarUrl || undefined}
                                            alt={displayName}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: theme.palette.primary.main,
                                                color: '#FFFFFF',
                                                fontWeight: 600
                                            }}
                                        >
                                            {initials}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorElUser}
                                    id="account-menu"
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
                                            borderRadius: '16px',
                                            mt: 1.5,
                                            minWidth: 200,
                                            '& .MuiMenuItem-root': {
                                                fontFamily: 'Inter, sans-serif'
                                            },
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 20,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0
                                            }
                                        }
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleCloseUserMenu}>
                                        <ListItemIcon>
                                            <AccountCircleIcon fontSize="small" />
                                        </ListItemIcon>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={handleCloseUserMenu}>
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        Settings
                                    </MenuItem>
                                    <Divider sx={{ my: 1 }} />
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};
