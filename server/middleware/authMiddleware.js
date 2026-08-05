const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

const isDoctor = (req, res, next) => {
  if (req.user?.role !== 'doctor') {
    return res.status(403).json({ message: 'Doctor access required.' });
  }
  next();
};

const isPatient = (req, res, next) => {
  if (req.user?.role !== 'patient') {
    return res.status(403).json({ message: 'Patient access required.' });
  }
  next();
};

const isDoctorOrAdmin = (req, res, next) => {
  if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Doctor or admin access required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDoctor,
  isPatient,
  isDoctorOrAdmin,
};
