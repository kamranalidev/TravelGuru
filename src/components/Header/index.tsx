import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';

const pages = ['Home','Services','Destination', 'Blog', 'About Us'];

export const Header = () => {
    const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(null);

    const [anchorElUser, setAnchorElUser] = React.useState<HTMLElement | null>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    return (
        <Box sx={{ flexGrow: 1 }}>

            <AppBar position="static" sx={{ backgroundColor: '#FBFBEC', color: 'black' ,boxShadow: 'none'}}>

                <Toolbar sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center'}} >
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
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'black', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' },color: 'black'}}
                    >
                        Login
                    </Typography>

                </Toolbar>
            </AppBar>
        </Box>
    );
}
