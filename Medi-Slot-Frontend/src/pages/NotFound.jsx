import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h1" color="text.secondary">404</Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>Page not found</Typography>
      <Button component={Link} to="/" variant="contained">Go back home</Button>
    </Box>
  );
}