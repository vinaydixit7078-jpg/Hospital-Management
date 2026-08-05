const express = require('express');
const {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');
const { verifyToken, isDoctor, isPatient } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, isDoctor, createMedicalRecord);
router.get('/patient/:patientId', verifyToken, getMedicalRecordsByPatient);
router.get('/:id', verifyToken, getMedicalRecordById);
router.put('/:id', verifyToken, isDoctor, updateMedicalRecord);
router.delete('/:id', verifyToken, isDoctor, deleteMedicalRecord);

module.exports = router;
