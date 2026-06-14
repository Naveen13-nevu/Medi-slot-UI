import { Box, Typography, Card, Button, TextField, Alert, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
      console.log('Doctors API response:', res.data);   // DEBUG
      const list = res.data.content || res.data;         // support page or array
      if (Array.isArray(list)) {
        console.log('Setting doctors list:', list.length, 'items');
        setDoctors([...list]);   // new array to trigger re-render
      } else {
        console.warn('Unexpected doctors format', list);
        setDoctors([]);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      toast.error('Could not load doctors');
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
      toast.success('Doctor created');
      fetchDoctors();                     // refresh the list
      setDoctorForm({ email: '', password: '', name: '', specialization: '', experience: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
      toast.error('Failed to create doctor');
    }
  };

  const handleSlotChange = (e) =>
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });

  const addSlotForDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (new Date(slotForm.endTime) <= new Date(slotForm.startTime)) {
      toast.error('End time must be after start time');
      return;
    }
    try {
      await api.post(`/admin/doctors/${selectedDoctorId}/slots`, slotForm);
      toast.success('Slot added for doctor');
      setSlotForm({ startTime: '', endTime: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slot');
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Logged in as <strong>{user?.role || 'Admin'}</strong>
      </Typography>

      {/* Create Doctor Card */}
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

      {/* Add Slot Card */}
      <Card sx={{ p: 4, maxWidth: 500, width: '100%', boxShadow: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Add Available Slot for a Doctor
          </Typography>
          <Button size="small" variant="outlined" onClick={fetchDoctors}>
            Refresh Doctors
          </Button>
        </Box>
        <TextField
          select
          label="Select Doctor"
          fullWidth
          margin="normal"
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          required
        >
          {doctors.length === 0 ? (
            <MenuItem disabled>No doctors available</MenuItem>
          ) : (
            doctors.map((doc) => (
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