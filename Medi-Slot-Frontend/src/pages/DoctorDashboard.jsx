import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState({ startTime: '', endTime: '' });

  useEffect(() => {
    fetchAppointments();
    fetchMySlots();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/doctor/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    }
  };

  const fetchMySlots = async () => {
    try {
      const res = await api.get('/doctor/slots');
      setSlots(res.data);
    } catch (err) {
      toast.error('Failed to load your slots');
    }
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
      fetchMySlots();   // refresh slot list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slot');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dr. {user?.role === 'DOCTOR' ? 'Doctor' : ''} Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your available slots and view appointments.
      </Typography>

      <Grid container spacing={4}>
        {/* Add Slot Form & My Slots */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 4, mb: 4 }}>
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

          {/* My Slots List */}
          <Card sx={{ p: 3, boxShadow: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              <EventAvailableIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              My Slots ({slots.length})
            </Typography>
            {slots.length === 0 ? (
              <Typography color="text.secondary">You haven't added any slots yet.</Typography>
            ) : (
              slots.map((s) => (
                <Box key={s.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(s.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={s.booked ? <EventBusyIcon /> : <EventAvailableIcon />}
                      label={s.booked ? 'Booked' : 'Free'}
                      color={s.booked ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))
            )}
          </Card>
        </Grid>

        {/* Appointments */}
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