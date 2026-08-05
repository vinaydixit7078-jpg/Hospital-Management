const express = require('express');
const { getPatients, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getPatients);
router.post('/', verifyToken, isAdmin, createPatient);
router.put('/:id', verifyToken, isAdmin, updatePatient);
router.delete('/:id', verifyToken, isAdmin, deletePatient);

module.exports = router;