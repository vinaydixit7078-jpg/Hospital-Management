const pool = require('../db');
const { loadData, sampleDoctors } = require('../fallbackDb');

const toMonth = (value) => String(value || '').slice(0, 7);
const groupValues = (items, key, amount = () => 1) => Object.entries(items.reduce((groups, item) => {
  const group = key(item);
  if (group) groups[group] = (groups[group] || 0) + amount(item);
  return groups;
}, {})).sort(([first], [second]) => first.localeCompare(second)).map(([name, value]) => ({ name, value }));

const getAppointmentsPerMonth = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT TO_CHAR(date, 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM appointments
       GROUP BY TO_CHAR(date, 'YYYY-MM')
       ORDER BY month ASC`
    );

    const data = result.rows.map((row) => ({
      name: row.month,
      value: row.count,
    }));

    res.status(200).json(data);
  } catch (error) {
    const data = loadData();
    res.status(200).json(groupValues(data.appointments || [], (appointment) => toMonth(appointment.date)));
  }
};

const getRevenuePerMonth = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COALESCE(SUM(amount), 0)::float AS revenue
       FROM payments
       WHERE status = 'paid'
       GROUP BY TO_CHAR(created_at, 'YYYY-MM')
       ORDER BY month ASC`
    );

    const data = result.rows.map((row) => ({
      name: row.month,
      value: Number(row.revenue),
    }));

    res.status(200).json(data);
  } catch (error) {
    const data = loadData();
    res.status(200).json(groupValues(
      (data.payments || []).filter((payment) => payment.status === 'paid'),
      (payment) => toMonth(payment.created_at),
      (payment) => Number(payment.amount) || 0
    ));
  }
};

const getMostBookedDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, u.name AS doctor_name, d.specialization, COUNT(a.id)::int AS appointment_count
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN appointments a ON a.doctor_id = d.id
       GROUP BY d.id, u.name, d.specialization
       ORDER BY appointment_count DESC, doctor_name ASC`
    );

    const data = result.rows.map((row) => ({
      name: row.doctor_name,
      value: row.appointment_count,
      specialization: row.specialization,
    }));

    res.status(200).json(data);
  } catch (error) {
    const data = loadData();
    const doctors = data.doctors?.length ? data.doctors : sampleDoctors;
    const appointments = data.appointments || [];
    res.status(200).json(doctors.map((doctor) => ({
      name: doctor.name || `Doctor ${doctor.id}`,
      value: appointments.filter((appointment) => Number(appointment.doctor_id) === Number(doctor.id)).length,
      specialization: doctor.specialization || '',
    })).sort((first, second) => second.value - first.value || first.name.localeCompare(second.name)));
  }
};

const getPatientCountByDepartment = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.specialization AS department, COUNT(DISTINCT a.patient_id)::int AS patient_count
       FROM doctors d
       LEFT JOIN appointments a ON a.doctor_id = d.id
       GROUP BY d.specialization
       ORDER BY patient_count DESC, department ASC`
    );

    const data = result.rows.map((row) => ({
      name: row.department,
      value: row.patient_count,
    }));

    res.status(200).json(data);
  } catch (error) {
    const data = loadData();
    const doctors = data.doctors?.length ? data.doctors : sampleDoctors;
    const departments = new Map(doctors.map((doctor) => [Number(doctor.id), doctor.specialization || 'Unassigned']));
    const uniquePatients = new Map();
    (data.appointments || []).forEach((appointment) => {
      const department = departments.get(Number(appointment.doctor_id)) || 'Unassigned';
      if (!uniquePatients.has(department)) uniquePatients.set(department, new Set());
      uniquePatients.get(department).add(appointment.patient_id);
    });
    res.status(200).json([...uniquePatients.entries()]
      .map(([name, patients]) => ({ name, value: patients.size }))
      .sort((first, second) => second.value - first.value || first.name.localeCompare(second.name)));
  }
};

module.exports = {
  getAppointmentsPerMonth,
  getRevenuePerMonth,
  getMostBookedDoctors,
  getPatientCountByDepartment,
};
