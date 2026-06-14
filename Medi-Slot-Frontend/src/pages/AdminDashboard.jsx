import { Box, Typography, Card, Button, TextField, Alert, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Safe toast import – if it fails, use alert
let toast;
try {
  toast = require('react-hot-toast').default;
} catch (e) {
  toast = null;
}
const notify = (type, msg) => {
  if (toast && toast[type]) {
    toast[type](msg);
  } else {
    alert(`${type}: ${msg}`);
  }
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slotForm, setSlotForm] = useState({ startTime: '', endTime: '' });

  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
    name: '',
    specialization: '',
    experience: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors?size=100');
      const list = res.data?.content || res.data || [];
      setDoctors(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchDoctors failed:', err);
      notify('error', 'Could not load doctors');
      setDoctors([]);
    }
  };

  const handleDoctorChange = (e) =>
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  const createDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/admin/doctors', doctorForm);
      notify('success', 'Doctor created');
      fetchDoctors();
      setDoctorForm({ email: '', password: '', name: '', specialization: '', experience: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
      notify('error', 'Failed to create doctor');
    }
  };

  const handleSlotChange = (e) =>
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });

  const addSlotForDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      notify('error', 'Please select a doctor');
      return;
    }
    if (new Date(slotForm.endTime) <= new Date(slotForm.startTime)) {
      notify('error', 'End time must be after start time');
      return;
    }
    try {
      await api.post(`/admin/doctors/${selectedDoctorId}/slots`, slotForm);
      notify('success', 'Slot added for doctor');
      setSlotForm({ startTime: '', endTime: '' });
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to add slot');
    }
  };

  const doctorOptions = Array.isArray(doctors) ? doctors : [];

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Logged in as <strong>{user?.role || 'Admin'}</strong>
      </Typography>

      <Card sx={{ p: 4, maxWidth: 500, width: '100%', mb: 4, boxShadow: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Create a New Doctor
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <form onSubmit={createDoctor}>
          <TextField name="name" label="Full Name" fullWidth margin="normal" value={doctorForm.name} onChange={handleDoctorChange} required />
          <TextField name="email" type="email" label="Email" fullWidth margin="normal" value={doctorForm.email} onChange={handleDoctorChange} required />
          <TextField name="password" type="password" label="Password" fullWidth margin="normal" value={doctorForm.password} onChange={handleDoctorChange} required />
          <TextField name="specialization" label="Specialization" fullWidth margin="normal" value={doctorForm.specialization} onChange={handleDoctorChange} required />
          <TextField name="experience" label="Experience" fullWidth margin="normal" value={doctorForm.experience} onChange={handleDoctorChange} />
          <TextField name="phone" label="Phone" fullWidth margin="normal" value={doctorForm.phone} onChange={handleDoctorChange} />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Create Doctor
          </Button>
        </form>
      </Card>

      <Card sx={{ p: 4, maxWidth: 500, width: '100%', boxShadow: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Add Available Slot for a Doctor
        </Typography>
        <TextField
          select
          label="Select Doctor"
          fullWidth
          margin="normal"
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          required
        >
          {doctorOptions.length === 0 ? (
            <MenuItem disabled>No doctors available</MenuItem>
          ) : (
            doctorOptions.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name || 'Unnamed'} ({doc.specialization || 'No specialty'})
              </MenuItem>
            ))
          )}
        </TextField>
        <form onSubmit={addSlotForDoctor}>
          <TextField
            name="startTime"
            label="Start Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={slotForm.startTime}
            onChange={handleSlotChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            name="endTime"
            label="End Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={slotForm.endTime}
            onChange={handleSlotChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
            Add Slot
          </Button>
        </form>
      </Card>
    </Box>
  );
}