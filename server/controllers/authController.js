const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const {
  findUserByEmail,
  createUser,
  createDoctor,
  createPatient,
  getDoctorByUserId,
  getPatientByUserId,
} = require('../fallbackDb');

const isDbConnected = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const validRoles = ['patient', 'doctor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (await isDbConnected()) {
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists.' });
      }

      const newUser = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        [name, normalizedEmail, hashedPassword, role]
      );

      const createdUser = newUser.rows[0];

      if (role === 'doctor') {
        await pool.query('INSERT INTO doctors (user_id, specialization) VALUES ($1, $2)', [createdUser.id, '']);
      }
      if (role === 'patient') {
        await pool.query('INSERT INTO patients (user_id, gender, address) VALUES ($1, $2, $3)', [createdUser.id, 'Male', '']);
      }

      return res.status(201).json({ message: 'User registered successfully.', user: createdUser });
    }

    const fallbackExisting = findUserByEmail(normalizedEmail);
    if (fallbackExisting) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = createUser({ name, email: normalizedEmail, password: hashedPassword, role });
    if (role === 'doctor') {
      createDoctor(newUser.id, '');
    }
    if (role === 'patient') {
      createPatient(newUser.id, 'Male', '');
    }

    return res.status(201).json({ message: 'User registered successfully.', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    let user;
    let doctorId = null;
    let patientId = null;

    if (await isDbConnected()) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const doctorResult = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [user.id]);
      const patientResult = await pool.query('SELECT id FROM patients WHERE user_id = $1', [user.id]);

      doctorId = doctorResult.rows[0]?.id || null;
      patientId = patientResult.rows[0]?.id || null;
    } else {
      const fallbackUser = findUserByEmail(normalizedEmail);
      if (!fallbackUser) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isPasswordValid = await bcrypt.compare(password, fallbackUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      user = fallbackUser;
      const doctor = getDoctorByUserId(user.id);
      const patient = getPatientByUserId(user.id);
      doctorId = doctor?.id || null;
      patientId = patient?.id || null;
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      doctorId,
      patientId,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId,
        patientId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const adminCodeLogin = (req, res) => {
  const { code } = req.body;
  const adminCode = process.env.ADMIN_ACCESS_CODE || 'admin123';

  if (!code || code !== adminCode) {
    return res.status(401).json({ message: 'Invalid admin access code.' });
  }

  const user = { id: 'admin-code', name: 'Administrator', email: 'admin@cityhospital.local', role: 'admin' };
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, adminCodeAccess: true },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({ message: 'Admin access granted.', token, user });
};

module.exports = {
  registerUser,
  loginUser,
  adminCodeLogin,
};
