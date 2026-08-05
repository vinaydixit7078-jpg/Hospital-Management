const express = require('express');
const {
  getAppointmentsPerMonth,
  getRevenuePerMonth,
  getMostBookedDoctors,
  getPatientCountByDepartment,
} = require('../controllers/analyticsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/appointments-per-month', verifyToken, isAdmin, getAppointmentsPerMonth);
router.get('/revenue-per-month', verifyToken, isAdmin, getRevenuePerMonth);
router.get('/most-booked-doctors', verifyToken, isAdmin, getMostBookedDoctors);
router.get('/patients-by-department', verifyToken, isAdmin, getPatientCountByDepartment);

module.exports = router;
