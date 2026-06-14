import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Button, Container, Card, CardContent, Grid } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const features = [
  { icon: <LocalHospitalIcon sx={{ fontSize: 60, color: 'primary.main' }} />, title: 'Verified Doctors', desc: 'All specialists are certified and experienced.' },
  { icon: <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.main' }} />, title: 'Easy Booking', desc: 'Book a slot in under 2 minutes.' },
  { icon: <SupportAgentIcon sx={{ fontSize: 60, color: 'primary.main' }} />, title: '24/7 Support', desc: 'We’re here whenever you need help.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', py: 8, px: 2, background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)' }}>
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to <Box component="span" sx={{ color: 'primary.main' }}>MediSlot</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Your one‑stop platform for booking doctor appointments.
        </Typography>

        {user ? (
          <Button
            component={Link}
            to={user.role === 'PATIENT' ? '/patient' : user.role === 'DOCTOR' ? '/doctor' : '/admin'}
            variant="contained"
            size="large"
            sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
          >
            Go to My Dashboard
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} to="/register" variant="contained" size="large" sx={{ px: 5, py: 1.5, fontSize: '1rem' }}>
              Register
            </Button>
            <Button component={Link} to="/login" variant="outlined" size="large" sx={{ px: 5, py: 1.5, fontSize: '1rem' }}>
              Login
            </Button>
          </Box>
        )}
      </Container>

      <Container sx={{ mt: 8 }}>
        <Grid container spacing={4}>
          {features.map((f, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3, height: '100%' }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>{f.title}</Typography>
                <Typography variant="body1" color="text.secondary">{f.desc}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}