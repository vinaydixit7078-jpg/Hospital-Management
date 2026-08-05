const express = require('express');
const {
  bookAppointment,
  getAllAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
} = require('../controllers/appointmentController');
const { verifyToken, isAdmin, isDoctor, isPatient } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAllAppointments);
router.post('/', verifyToken, isPatient, bookAppointment);
router.get('/patient/:patientId', verifyToken, isPatient, getPatientAppointments);
router.get('/:doctorId', verifyToken, isDoctor, getDoctorAppointments);
router.put('/:id/status', verifyToken, isDoctor, updateAppointmentStatus);

module.exports = router;
