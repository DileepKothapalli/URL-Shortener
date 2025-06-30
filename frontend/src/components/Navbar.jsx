import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { logout } from '../services/Auth';

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    nav('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/shorten"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            URL Shortener
          </Typography>
          <Button
            component={Link}
            to="/shorten"
            sx={{ color: isActive('/shorten') ? 'primary.main' : 'inherit' }}
          >
            Shorten
          </Button>
          <Button
            component={Link}
            to="/my-links"
            sx={{ color: isActive('/my-links') ? 'primary.main' : 'inherit' }}
          >
            My Links
          </Button>
          <Typography variant="body2" sx={{ mx: 2 }}>{username}</Typography>
          <Button onClick={handleLogout} variant="outlined" size="small">Logout</Button>
        </Toolbar>
      </AppBar>
      <Box p={2}>
        <Outlet />
      </Box>
    </>
  );
}
