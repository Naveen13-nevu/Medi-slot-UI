import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    pincode: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const { confirmPassword, ...payload } = { ...form, role: 'PATIENT' };
    try {
      await register(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #eef2ff, #ffffff)', px: 2, py: 4 }}>
      <Card sx={{ p: 5, maxWidth: 460, width: '100%', boxShadow: 4 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Patient Registration
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          Create your account to book appointments
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField name="name" label="Full Name" fullWidth margin="normal" value={form.name} onChange={handleChange} required />
          <TextField name="email" type="email" label="Email" fullWidth margin="normal" value={form.email} onChange={handleChange} required />
          <TextField name="password" type="password" label="Password" fullWidth margin="normal" value={form.password} onChange={handleChange} required />
          <TextField name="confirmPassword" type="password" label="Re-enter Password" fullWidth margin="normal" value={form.confirmPassword} onChange={handleChange} required />
          <TextField name="location" label="Location" fullWidth margin="normal" value={form.location} onChange={handleChange} />
          <TextField name="pincode" label="Pincode" fullWidth margin="normal" value={form.pincode} onChange={handleChange} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Register
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            Login
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}