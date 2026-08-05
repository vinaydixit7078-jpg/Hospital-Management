const bcrypt = require('bcryptjs');
const pool = require('../db');
const { loadData } = require('../fallbackDb');

const getPatients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, u.name, u.email, p.gender, p.address
       FROM patients p
       JOIN users u ON u.id = p.user_id
       ORDER BY u.name ASC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.warn('Patient API falling back to local data:', error.message || error);
    try {
      const data = loadData();
      const patients = data.patients.map((patient) => {
        const user = data.users.find((item) => Number(item.id) === Number(patient.user_id)) || {};
        return {
          id: patient.id,
          name: user.name || 'Unknown Patient',
          email: user.email || '',
          gender: patient.gender || '',
          address: patient.address || '',
        };
      });
      res.status(200).json(patients);
    } catch (fallbackError) {
      console.error('Failed to load fallback patients:', fallbackError);
      res.status(500).json({ message: 'Error fetching patients.' });
    }
  }
};

const createPatient = async (req, res) => {
  try {
    const { name, email, password, gender, address } = req.body;

    if (!name || !email || !password || !gender || !address) {
      return res.status(400).json({ message: 'Name, email, password, gender, and address are required.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'A patient with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id`,
      [name, email, hashedPassword]
    );

    const patientResult = await pool.query(
      `INSERT INTO patients (user_id, gender, address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userResult.rows[0].id, gender, address]
    );

    res.status(201).json({ message: 'Patient created successfully.', patient: { id: patientResult.rows[0].id, name, email, gender, address } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating patient.' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, gender, address } = req.body;

    const patientCheck = await pool.query('SELECT user_id FROM patients WHERE id = $1', [id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const userId = patientCheck.rows[0].user_id;
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

    if (gender) {
      await pool.query('UPDATE patients SET gender = $1 WHERE id = $2', [gender, id]);
    }
    if (address) {
      await pool.query('UPDATE patients SET address = $1 WHERE id = $2', [address, id]);
    }

    res.status(200).json({ message: 'Patient updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating patient.' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientCheck = await pool.query('SELECT user_id FROM patients WHERE id = $1', [id]);
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const userId = patientCheck.rows[0].user_id;
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.status(200).json({ message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting patient.' });
  }
};

module.exports = {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
};
