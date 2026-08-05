const pool = require('../db');

const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, notes } = req.body;
    const doctorId = req.user?.doctorId;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: 'patientId and diagnosis are required.' });
    }

    const relationship = await pool.query(
      `SELECT 1 FROM appointments a
       WHERE a.patient_id = $1 AND a.doctor_id = $2 AND a.status IN ('confirmed', 'completed')`,
      [patientId, doctorId]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to create records for this patient.' });
    }

    const result = await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patientId, doctorId, diagnosis, notes || '']
    );

    res.status(201).json({ message: 'Medical record created successfully.', record: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating medical record.' });
  }
};

const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentUser = req.user;

    if (currentUser.role === 'patient' && Number(currentUser.patientId) !== Number(patientId)) {
      return res.status(403).json({ message: 'You can only view your own records.' });
    }

    const result = await pool.query(
      `SELECT * FROM medical_records
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching medical records.' });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const result = await pool.query('SELECT * FROM medical_records WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found.' });
    }

    const record = result.rows[0];

    if (currentUser.role === 'patient' && Number(currentUser.patientId) !== Number(record.patient_id)) {
      return res.status(403).json({ message: 'You can only view your own records.' });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching medical record.' });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, notes } = req.body;
    const doctorId = req.user?.doctorId;

    const existing = await pool.query('SELECT * FROM medical_records WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found.' });
    }

    const relationship = await pool.query(
      `SELECT 1 FROM medical_records mr
       WHERE mr.id = $1 AND mr.doctor_id = $2`,
      [id, doctorId]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({ message: 'You can only update records you created.' });
    }

    const result = await pool.query(
      `UPDATE medical_records
       SET diagnosis = COALESCE($1, diagnosis), notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [diagnosis, notes, id]
    );

    res.status(200).json({ message: 'Medical record updated successfully.', record: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating medical record.' });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user?.doctorId;

    const existing = await pool.query('SELECT * FROM medical_records WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found.' });
    }

    const relationship = await pool.query(
      `SELECT 1 FROM medical_records mr
       WHERE mr.id = $1 AND mr.doctor_id = $2`,
      [id, doctorId]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({ message: 'You can only delete records you created.' });
    }

    await pool.query('DELETE FROM medical_records WHERE id = $1', [id]);

    res.status(200).json({ message: 'Medical record deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting medical record.' });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};
