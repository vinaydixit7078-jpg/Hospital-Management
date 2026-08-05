const express = require('express');
const { registerUser, loginUser, adminCodeLogin } = require('../controllers/authController');
const { verifyToken, isAdmin, isDoctor, isPatient } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-code-login', adminCodeLogin);

router.get('/admin-dashboard', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Welcome Admin', user: req.user });
});

router.get('/doctor-dashboard', verifyToken, isDoctor, (req, res) => {
  res.json({ message: 'Welcome Doctor', user: req.user });
});

router.get('/patient-dashboard', verifyToken, isPatient, (req, res) => {
  res.json({ message: 'Welcome Patient', user: req.user });
});

module.exports = router;
