const express = require('express');
const { getDoctors, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getDoctors);
router.post('/', verifyToken, isAdmin, createDoctor);
router.put('/:id', verifyToken, isAdmin, updateDoctor);
router.delete('/:id', verifyToken, isAdmin, deleteDoctor);

module.exports = router;