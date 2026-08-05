const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyToken, isPatient } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', verifyToken, isPatient, createOrder);
router.post('/verify', verifyToken, isPatient, verifyPayment);

module.exports = router;
