const pool = require('../db');
const {
  loadData,
  findAppointmentByDoctorDateTime,
  createAppointment,
  getDoctorById,
  getAppointments,
  updateAppointmentStatus: updateAppointmentStatusFromFallback,
} = require('../fallbackDb');

const isDbConnected = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

const normalizeStatus = (status = '') => {
  const lower = String(status).toLowerCase();
  if (!lower) return 'Pending';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ message: 'patientId, doctorId, date, and time are required.' });
    }

    if (await isDbConnected()) {
      const doctorCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
      if (doctorCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Doctor not found.' });
      }

      const existingAppointment = await pool.query(
        `SELECT id FROM appointments
         WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status IN ('pending', 'confirmed')`,
        [doctorId, date, time]
      );

      if (existingAppointment.rows.length > 0) {
        return res.status(409).json({ message: 'Doctor is already booked at this date and time.' });
      }

      const appointmentResult = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, date, time, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [patientId, doctorId, date, time]
      );

      return res.status(201).json({
        message: 'Appointment booked successfully.',
        appointment: appointmentResult.rows[0],
      });
    }

    const doctor = getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const existingAppointment = findAppointmentByDoctorDateTime(doctorId, date, time);
    if (existingAppointment) {
      return res.status(409).json({ message: 'Doctor is already booked at this date and time.' });
    }

    const appointment = createAppointment(patientId, doctorId, date, time, 'pending');
    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while booking appointment.' });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date } = req.query;

    if (await isDbConnected()) {
      const conditions = [];
      const values = [];

      if (status) {
        conditions.push(`a.status = $${values.length + 1}`);
        values.push(status);
      }
      if (doctorId) {
        conditions.push(`a.doctor_id = $${values.length + 1}`);
        values.push(doctorId);
      }
      if (patientId) {
        conditions.push(`a.patient_id = $${values.length + 1}`);
        values.push(patientId);
      }
      if (date) {
        conditions.push(`a.date = $${values.length + 1}`);
        values.push(date);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await pool.query(
        `SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time, a.status, a.created_at,
                pu.name AS patient_name,
                du.name AS doctor_name,
                d.specialization AS department
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN users pu ON pu.id = p.user_id
         JOIN doctors d ON d.id = a.doctor_id
         JOIN users du ON du.id = d.user_id
         ${whereClause}
         ORDER BY a.date DESC, a.time DESC`,
        values
      );

      return res.status(200).json(result.rows);
    }

    const appointments = getAppointments({ status, doctorId, patientId, date });
    const data = loadData();
    const fallbackAppointments = appointments.map((appointment) => {
      const doctor = data.doctors.find((d) => Number(d.id) === Number(appointment.doctor_id)) || {};
      const patient = data.patients.find((p) => Number(p.id) === Number(appointment.patient_id)) || {};
      const doctorUser = data.users.find((u) => Number(u.id) === Number(doctor.user_id));
      const patientUser = data.users.find((u) => Number(u.id) === Number(patient.user_id));

      return {
        ...appointment,
        patient_name: patientUser?.name || appointment.patient_name || 'Unknown Patient',
        doctor_name: doctorUser?.name || doctor.name || appointment.doctor_name || 'Unknown Doctor',
        specialization: doctor.specialization || appointment.specialization || '',
        department: doctor.specialization || appointment.department || '',
      };
    });

    return res.status(200).json(fallbackAppointments);
  } catch (error) {
    console.error('Error loading appointments from DB, falling back to local data:', error);
    try {
      const appointments = getAppointments({ status, doctorId, patientId, date });
      const data = loadData();
      const fallbackAppointments = appointments.map((appointment) => {
        const doctor = data.doctors.find((d) => Number(d.id) === Number(appointment.doctor_id)) || {};
        const patient = data.patients.find((p) => Number(p.id) === Number(appointment.patient_id)) || {};
        const doctorUser = data.users.find((u) => Number(u.id) === Number(doctor.user_id));
        const patientUser = data.users.find((u) => Number(u.id) === Number(patient.user_id));

        return {
          ...appointment,
          patient_name: patientUser?.name || appointment.patient_name || 'Unknown Patient',
          doctor_name: doctorUser?.name || doctor.name || appointment.doctor_name || 'Unknown Doctor',
          department: doctor.specialization || appointment.department || '',
        };
      });
      return res.status(200).json(fallbackAppointments);
    } catch (fallbackError) {
      console.error('Fallback appointment loading also failed:', fallbackError);
      res.status(500).json({ message: 'Server error while fetching appointments.' });
    }
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (await isDbConnected()) {
      const result = await pool.query(
        `SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time, a.status, a.created_at,
                p.user_id AS patient_user_id, u.name AS patient_name
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN users u ON u.id = p.user_id
         WHERE a.doctor_id = $1
         ORDER BY a.date ASC, a.time ASC`,
        [doctorId]
      );

      return res.status(200).json(result.rows);
    }

    const appointments = getAppointments({ doctorId });
    const data = loadData();
    const mapped = appointments
      .map((appointment) => {
        const patient = data.patients.find((p) => Number(p.id) === Number(appointment.patient_id));
        const patientUser = patient ? data.users.find((u) => Number(u.id) === Number(patient.user_id)) : null;

        return {
          ...appointment,
          patient_name: patientUser?.name || 'Unknown Patient',
          status: normalizeStatus(appointment.status),
        };
      })
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    res.status(200).json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching doctor schedule.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    if (await isDbConnected()) {
      const result = await pool.query(
        `UPDATE appointments
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Appointment not found.' });
      }

      return res.status(200).json({
        message: 'Appointment status updated successfully.',
        appointment: result.rows[0],
      });
    }

    const updated = updateAppointmentStatusFromFallback(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.status(200).json({
      message: 'Appointment status updated successfully.',
      appointment: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating appointment status.' });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (await isDbConnected()) {
      const result = await pool.query(
        `SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time, a.status, a.created_at,
                d.specialization, d.consultation_fee, u.name AS doctor_name
         FROM appointments a
         JOIN doctors d ON d.id = a.doctor_id
         JOIN users u ON u.id = d.user_id
         WHERE a.patient_id = $1
         ORDER BY a.date ASC, a.time ASC`,
        [patientId]
      );

      return res.status(200).json(result.rows);
    }

    const appointments = getAppointments({ patientId });
    const appointmentsWithDoctor = appointments.map((appointment) => {
      const doctor = getDoctorById(appointment.doctor_id) || { name: 'Unknown Doctor', specialization: '', consultation_fee: 500 };
      return {
        ...appointment,
        doctor_name: doctor.name,
        specialization: doctor.specialization || '',
        consultation_fee: doctor.consultation_fee || 500,
      };
    });

    res.status(200).json(appointmentsWithDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching patient appointments.' });
  }
};

module.exports = {
  bookAppointment,
  getAllAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
};
