const bcrypt = require('bcryptjs');
const pool = require('../db');
const { loadData, sampleDoctors } = require('../fallbackDb');

const getDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, u.name, u.email, d.specialization
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       ORDER BY u.name ASC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.warn('Doctor API falling back to local sample doctors:', error.message || error);
    try {
      const data = loadData();
      const doctors = data.doctors && data.doctors.length ? data.doctors : sampleDoctors;
      const normalizedDoctors = doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email || `${doctor.name.toLowerCase().replace(/[^a-z]/g, '.')}@cityhospital.com`,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        availability: doctor.availability,
        contact: doctor.contact,
        consultation_fee: doctor.consultation_fee,
        status: doctor.status,
      }));
      res.status(200).json(normalizedDoctors);
    } catch (fallbackError) {
      console.error('Failed to load fallback doctors:', fallbackError);
      res.status(500).json({ message: 'Error fetching doctors.' });
    }
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: 'Name, email, password, and specialization are required.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'A doctor with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'doctor')
       RETURNING id`,
      [name, email, hashedPassword]
    );

    const doctorResult = await pool.query(
      `INSERT INTO doctors (user_id, specialization)
       VALUES ($1, $2)
       RETURNING id`,
      [userResult.rows[0].id, specialization]
    );

    res.status(201).json({ message: 'Doctor created successfully.', doctor: { id: doctorResult.rows[0].id, name, email, specialization } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating doctor.' });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, specialization } = req.body;

    const doctorCheck = await pool.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const userId = doctorCheck.rows[0].user_id;
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push(`name = $${updateFields.length + 1}`);
      values.push(name);
    }
    if (email) {
      updateFields.push(`email = $${updateFields.length + 1}`);
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push(`password = $${updateFields.length + 1}`);
      values.push(hashedPassword);
    }

    if (updateFields.length > 0) {
      await pool.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateFields.length + 1}`, [...values, userId]);
    }

    if (specialization) {
      await pool.query('UPDATE doctors SET specialization = $1 WHERE id = $2', [specialization, id]);
    }

    res.status(200).json({ message: 'Doctor updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating doctor.' });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorCheck = await pool.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const userId = doctorCheck.rows[0].user_id;
    await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting doctor.' });
  }
};

module.exports = {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
