import {
  Box, Typography, Card, Button, TextField, Alert, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';

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

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

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
      toast.error('Could not load doctors');
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
      toast.success('Doctor created');
      fetchDoctors();
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

  // ---------- Delete doctor ----------
  const openDeleteDialog = (doctor) => {
    setDoctorToDelete(doctor);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      await api.delete(`/admin/doctors/${doctorToDelete.id}`);
      toast.success('Doctor deleted');
      fetchDoctors(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      closeDeleteDialog();
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
      <Card sx={{ p: 4, maxWidth: 500, width: '100%', mb: 4, boxShadow: 4 }}>
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

      {/* Existing Doctors List – with Delete */}
      <Card sx={{ p: 4, maxWidth: 500, width: '100%', boxShadow: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          All Doctors ({doctorOptions.length})
        </Typography>
        {doctorOptions.length === 0 ? (
          <Typography color="text.secondary">No doctors registered yet.</Typography>
        ) : (
          doctorOptions.map((doc) => (
            <Box
              key={doc.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                borderBottom: '1px solid #eee'
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {doc.name || 'Unnamed'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doc.specialization || 'No specialty'}
                </Typography>
                {doc.experience && (
                  <Typography variant="body2" color="text.secondary">
                    {doc.experience} exp.
                  </Typography>
                )}
                {doc.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {doc.phone}
                  </Typography>
                )}
              </Box>
              <IconButton color="error" onClick={() => openDeleteDialog(doc)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Dr.{' '}
            <strong>{doctorToDelete?.name || 'this doctor'}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDeleteDoctor} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}