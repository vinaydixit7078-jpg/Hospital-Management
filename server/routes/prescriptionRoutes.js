const express = require('express');
const {
  createPrescription,
  getPatientPrescriptions,
  downloadPatientPrescriptionPdf,
} = require('../controllers/prescriptionController');
const { verifyToken, isDoctor, isPatient } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, isDoctor, createPrescription);
router.get('/patient/:patientId', verifyToken, getPatientPrescriptions);
router.get('/:id/download', verifyToken, downloadPatientPrescriptionPdf);

module.exports = router;
