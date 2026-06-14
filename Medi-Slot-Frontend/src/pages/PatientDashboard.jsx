import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, TextField,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CancelIcon from '@mui/icons-material/Cancel';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Booking confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookedSlotInfo, setBookedSlotInfo] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors?size=100');
      setDoctors(res.data.content || res.data);
    } catch (err) {
      toast.error('Could not load doctors');
    }
  };

  const fetchSlots = async (doctorId) => {
    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${doctorId}/slots`);
      setSlots(res.data);
      setSelectedDoctor(doctorId);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const bookSlot = async (slot) => {
    try {
      await api.post(`/patient/book/${slot.id}`);
      toast.success('Appointment confirmed!');
      // Set booking info for the popup
      const doctor = doctors.find((d) => d.id === selectedDoctor);
      setBookedSlotInfo({
        doctorName: doctor?.name || 'Doctor',
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      setConfirmOpen(true);
      fetchSlots(selectedDoctor);   // refresh available slots
      fetchAppointments();          // refresh my appointments
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patient/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/patient/appointments/${appointmentId}`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setBookedSlotInfo(null);
  };

  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter(doc =>
        (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Patient Dashboard
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
        {/* Doctors List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Available Doctors</Typography>
          <Grid container spacing={2}>
            {filteredDoctors.length === 0 ? (
              <Typography sx={{ p: 2 }}>No doctors found.</Typography>
            ) : (
              filteredDoctors.map((doc) => (
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
                      <Typography variant="h6" fontWeight="bold">{doc.name || 'Unnamed'}</Typography>
                      <Chip label={doc.specialization || 'General'} color="primary" size="small" sx={{ mt: 1 }} />
                      {doc.experience && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{doc.experience} exp.</Typography>}
                      {doc.phone && <Typography variant="body2" color="text.secondary">{doc.phone}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
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
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="small"
                    onClick={() => bookSlot(slot)}
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

      {/* My Appointments */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography color="text.secondary">No appointments yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((app) => (
              <Grid item xs={12} sm={6} md={4} key={app.id}>
                <Card sx={{ borderLeft: '4px solid #2563EB', boxShadow: 2, position: 'relative' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{app.doctorName}</Typography>
                    <Typography variant="body2" color="text.secondary">{app.specialization}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {new Date(app.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(app.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <IconButton
                      color="error"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => cancelAppointment(app.id)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Booking Confirmation Dialog (Popup) */}
      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Appointment Confirmed!</DialogTitle>
        <DialogContent>
          {bookedSlotInfo && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Doctor:</strong> {bookedSlotInfo.doctorName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong>{' '}
                {new Date(bookedSlotInfo.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Time:</strong>{' '}
                {new Date(bookedSlotInfo.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                {new Date(bookedSlotInfo.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}