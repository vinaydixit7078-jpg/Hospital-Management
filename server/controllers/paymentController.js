const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { loadData, saveData, getPatientByUserId, updateAppointmentStatus } = require('../fallbackDb');

const isDbConnected = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_dummy') {
    throw new Error('Razorpay credentials are not configured.');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const getAppointmentAccess = async (userId, appointmentId) => {
  if (await isDbConnected()) {
    const patientResult = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
    if (patientResult.rows.length === 0) {
      throw { status: 404, message: 'Patient profile not found.' };
    }

    const appointmentResult = await pool.query('SELECT id, patient_id FROM appointments WHERE id = $1', [appointmentId]);
    if (appointmentResult.rows.length === 0) {
      throw { status: 404, message: 'Appointment not found.' };
    }

    const appointment = appointmentResult.rows[0];
    if (Number(appointment.patient_id) !== Number(patientResult.rows[0].id)) {
      throw { status: 403, message: 'You can only pay for your own appointments.' };
    }

    return { patientId: patientResult.rows[0].id, appointment };
  }

  const patient = getPatientByUserId(userId);
  if (!patient) {
    throw { status: 404, message: 'Patient profile not found.' };
  }

  const data = loadData();
  const appointment = data.appointments.find((item) => Number(item.id) === Number(appointmentId));
  if (!appointment) {
    throw { status: 404, message: 'Appointment not found.' };
  }

  if (Number(appointment.patient_id) !== Number(patient.id)) {
    throw { status: 403, message: 'You can only pay for your own appointments.' };
  }

  return { patientId: patient.id, appointment };
};

const createOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const userId = req.user?.id;

    if (!appointmentId || amount === undefined || amount === null || amount === '') {
      return res.status(400).json({ message: 'appointmentId and amount are required.' });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const { appointment } = await getAppointmentAccess(userId, appointmentId);

    const effectiveAmount = Math.round(numericAmount * 100);

    try {
      const razorpayClient = getRazorpayClient();
      const order = await razorpayClient.orders.create({
        amount: effectiveAmount,
        currency: 'INR',
        receipt: `apt_${appointmentId}`,
        notes: {
          appointmentId: String(appointmentId),
        },
      });

      return res.status(200).json({ order });
    } catch (razorpayError) {
      const mockOrder = {
        id: `mock_order_${Date.now()}`,
        entity: 'order',
        amount: effectiveAmount,
        currency: 'INR',
        receipt: `apt_${appointmentId}`,
        status: 'created',
        notes: { appointmentId: String(appointmentId) },
      };

      return res.status(200).json({ order: mockOrder, mockOrder: true });
    }
  } catch (error) {
    console.error(error);
    if (error?.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error creating payment order.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId, amount } = req.body;
    const userId = req.user?.id;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const useRealRazorpay = Boolean(keyId && keySecret && keyId !== 'rzp_test_dummy');

    let isValid = true;
    if (useRealRazorpay) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = generatedSignature === razorpay_signature;
    } else if (razorpay_signature && razorpay_signature !== 'mock-signature') {
      isValid = false;
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    const { appointment } = await getAppointmentAccess(userId, appointmentId);

    if (await isDbConnected()) {
      await pool.query(
        `INSERT INTO payments (appointment_id, amount, status, payment_method, transaction_id, created_at)
         VALUES ($1, $2, 'paid', 'razorpay', $3, CURRENT_TIMESTAMP)
         ON CONFLICT (transaction_id) DO NOTHING`,
        [appointmentId, amount, razorpay_payment_id]
      );

      await pool.query(
        `UPDATE appointments
         SET status = 'confirmed'
         WHERE id = $1`,
        [appointmentId]
      );
    } else {
      const data = loadData();
      const existingPayment = data.payments.find((item) => item.transaction_id === razorpay_payment_id);
      if (!existingPayment) {
        data.payments.push({
          id: Date.now(),
          appointment_id: Number(appointmentId),
          amount: Number(amount),
          status: 'paid',
          payment_method: 'razorpay',
          transaction_id: razorpay_payment_id,
          created_at: new Date().toISOString(),
        });
      }
      saveData(data);
      updateAppointmentStatus(appointmentId, 'confirmed');
    }

    await generateInvoicePdf(appointmentId, razorpay_payment_id, amount);

    return res.status(200).json({ message: 'Payment verified and appointment confirmed.', paymentId: razorpay_payment_id });
  } catch (error) {
    console.error(error);
    if (error?.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Error verifying payment.' });
  }
};

const generateInvoicePdf = async (appointmentId, transactionId, amount) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  let appointment;
  if (await isDbConnected()) {
    const appointmentResult = await pool.query(
      `SELECT a.id, a.date, a.time, a.status, p.id AS patient_id, u.name AS patient_name, d.id AS doctor_id, du.name AS doctor_name
       FROM appointments a
       JOIN patients pt ON pt.id = a.patient_id
       JOIN users u ON u.id = pt.user_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users du ON du.id = d.user_id
       WHERE a.id = $1`,
      [appointmentId]
    );

    appointment = appointmentResult.rows[0];
  } else {
    const data = loadData();
    const fallbackAppointment = data.appointments.find((item) => Number(item.id) === Number(appointmentId));
    const patient = data.patients.find((item) => Number(item.id) === Number(fallbackAppointment?.patient_id));
    const patientUser = data.users.find((item) => Number(item.id) === Number(patient?.user_id));
    const doctor = data.doctors.find((item) => Number(item.id) === Number(fallbackAppointment?.doctor_id));
    const doctorUser = data.users.find((item) => Number(item.id) === Number(doctor?.user_id));

    appointment = {
      id: fallbackAppointment?.id,
      date: fallbackAppointment?.date,
      time: fallbackAppointment?.time,
      status: fallbackAppointment?.status,
      patient_name: patientUser?.name || 'Unknown Patient',
      doctor_name: doctorUser?.name || doctor?.name || 'Unknown Doctor',
    };
  }

  const filePath = path.join(uploadsDir, `invoice-${appointmentId}.pdf`);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text('Hospital Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Invoice ID: ${transactionId}`);
  doc.text(`Patient: ${appointment.patient_name}`);
  doc.text(`Doctor: ${appointment.doctor_name}`);
  doc.text(`Appointment Date: ${appointment.date}`);
  doc.text(`Appointment Time: ${appointment.time}`);
  doc.text(`Amount: ₹${amount}`);
  doc.text(`Status: ${appointment.status}`);
  doc.end();

  return filePath;
};

module.exports = {
  createOrder,
  verifyPayment,
};
