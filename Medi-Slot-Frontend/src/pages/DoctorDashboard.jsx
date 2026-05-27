import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Box, Grid, Card, CardContent, Typography, Button, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slot, setSlot] = useState({ startTime: '', endTime: '' });

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/doctor/appointments');
      setAppointments(res.data);
    } catch (err) { toast.error('Failed to load appointments'); }
  };

  const addSlot = async (e) => {
    e.preventDefault();
    if (new Date(slot.endTime) <= new Date(slot.startTime)) {
      toast.error('End time must be after start time');
      return;
    }
    try {
      await api.post('/doctor/slots', slot);
      toast.success('Slot added successfully!');
      setSlot({ startTime: '', endTime: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add slot'); }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dr. {user?.username || 'Doctor'} Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your available slots and view appointments.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              <AddIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'secondary.main' }} />
              Add New Slot
            </Typography>
            <form onSubmit={addSlot}>
              <TextField
                label="Start Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={slot.startTime}
                onChange={(e) => setSlot({ ...slot, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="End Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={slot.endTime}
                onChange={(e) => setSlot({ ...slot, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }}>
                Add Slot
              </Button>
            </form>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              My Appointments
            </Typography>
            {appointments.length === 0 ? (
              <Typography color="text.secondary">No appointments booked yet.</Typography>
            ) : (
              appointments.map((app) => (
                <Box key={app.id} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{app.doctorName}</Typography>
                  <Typography variant="body2" color="text.secondary">{app.specialization}</Typography>
                  <Typography variant="body2">
                    {new Date(app.startTime).toLocaleString()} – {new Date(app.endTime).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}