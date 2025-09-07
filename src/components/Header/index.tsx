import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import theme from '../../theme';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

const pages = [
    { label: 'Home', route: '/' },
    { label: 'Services', route: '/services' },
    { label: 'Destination', route: '/destination' },
    { label: 'Blog', route: '/blog' },
    { label: 'About Us', route: '/about' }
];

export const Header = (props: { hidePages?: boolean }) => {
    const navigate = useNavigate();

    const handleNavigate = (route: string) => {
        navigate(route);
    };

    const authenticated = localStorage.getItem("supabase_session") ? true : false;
    return (
        <Box sx={{ flexGrow: 1 }}>

            <AppBar position="static" sx={{ backgroundColor: '#FBFBEC', color: 'black', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>

                <Toolbar sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }} onClick={() => navigate('/')}  >
                        <div>
                            <img src="/assets/travelLogo.jpeg" alt="logo" style={{ width: '100px', height: '100px' }} />
                        </div>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="#app-bar-with-responsive-menu"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'black',
                                textDecoration: 'none',
                            }}
                        >
                            <p style={{ color: 'orange' }}> Travel</p> <p>
                                Guru
                            </p>
                        </Typography>
                    </Box>
                    {!props.hidePages && <>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.label}
                                    onClick={() => handleNavigate(page.route)}
                                    sx={{ my: 2, color: theme.palette.secondary.main, display: 'block' }}
                                >
                                    {page.label}
                                </Button>
                            ))}
                        </Box>
                      {!authenticated &&  <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer', color: theme.palette.secondary.main }}
                            onClick={() => handleNavigate('/login')}
                        >
                            <a >Login</a>
                        </Typography>}</>}

                </Toolbar>
            </AppBar>
        </Box>
    );
}
