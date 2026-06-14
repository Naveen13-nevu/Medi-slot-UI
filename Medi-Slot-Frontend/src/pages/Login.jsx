import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      const role = localStorage.getItem('role');
      if (role === 'PATIENT') navigate('/patient');
      else if (role === 'DOCTOR') navigate('/doctor');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #eef2ff, #ffffff)', px: 2 }}>
      <Card sx={{ p: 5, maxWidth: 420, width: '100%', boxShadow: 4 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Welcome Back
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in with your email
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Email" type="email" fullWidth margin="normal" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <TextField label="Password" type="password" fullWidth margin="normal" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Login
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            Register
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}