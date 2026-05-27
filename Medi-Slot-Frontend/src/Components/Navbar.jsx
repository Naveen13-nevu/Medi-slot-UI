import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Toolbar>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'primary.main' }}>
          <CalendarMonthIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            MediSlot
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <>
            <Button
              component={Link}
              to={user.role === 'PATIENT' ? '/patient' : '/doctor'}
              variant={location.pathname === `/${user.role.toLowerCase()}` ? 'contained' : 'text'}
              color="primary"
              sx={{ mr: 2 }}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" color="inherit" sx={{ color: 'text.primary', mr: 1 }}>
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained" color="primary">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}