import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (err) { toast.error('Could not load doctors'); }
  };

  const fetchSlots = async (doctorId) => {
    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${doctorId}/slots`);
      setSlots(res.data);
      setSelectedDoctor(doctorId);
    } catch (err) { toast.error('Failed to load slots'); }
    finally { setLoadingSlots(false); }
  };

  const bookSlot = async (slotId) => {
    try {
      await api.post(`/patient/book/${slotId}`);
      toast.success('Appointment confirmed!');
      fetchSlots(selectedDoctor);
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patient/appointments');
      setAppointments(res.data);
    } catch (err) { toast.error('Failed to load appointments'); }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome, {user?.username || 'Patient'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find and book appointments with top doctors.
      </Typography>

      {/* Search */}
      <TextField
        variant="outlined"
        placeholder="Search doctor or specialization..."
        fullWidth
        sx={{ mb: 4, maxWidth: 400 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon /></InputAdornment>
          ),
        }}
      />

      <Grid container spacing={4}>
        {/* Doctors */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Available Doctors</Typography>
          <Grid container spacing={2}>
            {filteredDoctors.map((doc) => (
              <Grid item xs={12} sm={6} key={doc.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedDoctor === doc.id ? '2px solid #2563EB' : '2px solid transparent',
                    boxShadow: selectedDoctor === doc.id ? 4 : 2,
                    transition: '0.2s',
                  }}
                  onClick={() => fetchSlots(doc.id)}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{doc.name}</Typography>
                    <Chip label={doc.specialization} color="primary" size="small" sx={{ mt: 1 }} />
                    {doc.experience && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{doc.experience} exp.</Typography>}
                    {doc.phone && <Typography variant="body2" color="text.secondary">{doc.phone}</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Slots Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 20, boxShadow: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {selectedDoctor ? 'Available Slots' : 'Select a Doctor'}
            </Typography>
            {loadingSlots ? (
              <Typography>Loading slots…</Typography>
            ) : selectedDoctor && slots.length === 0 ? (
              <Typography color="text.secondary">No open slots for this doctor.</Typography>
            ) : (
              slots.map((slot) => (
                <Box key={slot.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="small"
                    onClick={() => bookSlot(slot.id)}
                    startIcon={<EventAvailableIcon />}
                    sx={{ mt: 1 }}
                  >
                    Book Now
                  </Button>
                </Box>
              ))
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Appointments */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography color="text.secondary">No appointments yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((app) => (
              <Grid item xs={12} sm={6} md={4} key={app.id}>
                <Card sx={{ borderLeft: '4px solid #2563EB', boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{app.doctorName}</Typography>
                    <Typography variant="body2" color="text.secondary">{app.specialization}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {new Date(app.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(app.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}