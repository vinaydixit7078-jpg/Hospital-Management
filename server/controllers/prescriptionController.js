const pool = require('../db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicineName, dosage, frequency, duration, instructions } = req.body;
    const doctorId = req.user?.doctorId;

    if (!appointmentId || !medicineName || !dosage || !frequency || !duration) {
      return res.status(400).json({ message: 'appointmentId, medicineName, dosage, frequency, and duration are required.' });
    }

    const appointmentCheck = await pool.query(
      'SELECT id, doctor_id, patient_id FROM appointments WHERE id = $1',
      [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const appointment = appointmentCheck.rows[0];
    if (Number(appointment.doctor_id) !== Number(doctorId)) {
      return res.status(403).json({ message: 'You can only create prescriptions for your own appointments.' });
    }

    const result = await pool.query(
      `INSERT INTO prescriptions (appointment_id, medicine_name, dosage, frequency, duration, instructions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [appointmentId, medicineName, dosage, frequency, duration, instructions || '']
    );

    res.status(201).json({ message: 'Prescription created successfully.', prescription: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating prescription.' });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentUser = req.user;

    if (currentUser.role === 'patient' && Number(currentUser.patientId) !== Number(patientId)) {
      return res.status(403).json({ message: 'You can only view your own prescriptions.' });
    }

    const result = await pool.query(
      `SELECT p.*, a.date, a.time, u.name AS doctor_name
       FROM prescriptions p
       JOIN appointments a ON a.id = p.appointment_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users u ON u.id = d.user_id
       WHERE a.patient_id = $1
       ORDER BY p.id DESC`,
      [patientId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching prescriptions.' });
  }
};

const downloadPatientPrescriptionPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const result = await pool.query(
      `SELECT p.*, a.patient_id, a.date, a.time, u.name AS doctor_name
       FROM prescriptions p
       JOIN appointments a ON a.id = p.appointment_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users u ON u.id = d.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    const prescription = result.rows[0];

    if (currentUser.role === 'patient' && Number(currentUser.patientId) !== Number(prescription.patient_id)) {
      return res.status(403).json({ message: 'You can only download your own prescriptions.' });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `prescription-${id}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Doctor: ${prescription.doctor_name}`);
    doc.text(`Date: ${prescription.date}`);
    doc.text(`Time: ${prescription.time}`);
    doc.moveDown();
    doc.text(`Medicine: ${prescription.medicine_name}`);
    doc.text(`Dosage: ${prescription.dosage}`);
    doc.text(`Frequency: ${prescription.frequency}`);
    doc.text(`Duration: ${prescription.duration}`);
    doc.text(`Instructions: ${prescription.instructions || 'None'}`);
    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `prescription-${id}.pdf`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while generating prescription PDF.' });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  downloadPatientPrescriptionPdf,
};
