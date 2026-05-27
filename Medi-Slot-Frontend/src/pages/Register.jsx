import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'PATIENT',   // hidden, always patient
    // Doctor fields are removed because patient can't register as doctor
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Always sends role PATIENT
      await register({ username: form.username, password: form.password, role: 'PATIENT' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #eef2ff, #ffffff)', px: 2, py: 4 }}>
      <Card sx={{ p: 5, maxWidth: 460, width: '100%', boxShadow: 4 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Create Patient Account
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          Join MediSlot as a patient
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField name="username" label="Username" fullWidth margin="normal" value={form.username} onChange={handleChange} required />
          <TextField name="password" label="Password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} required />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Register
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}