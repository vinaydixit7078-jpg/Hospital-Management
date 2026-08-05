const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'fallback-db.json');

const defaultData = {
  users: [],
  doctors: [],
  patients: [],
  appointments: [],
  medical_records: [],
  prescriptions: [],
  payments: [],
  contact_messages: [],
};

const sampleDoctors = [
  { id: 1, user_id: 1, name: 'Dr. Aarav Kapoor', specialization: 'Cardiology', qualification: 'MBBS, MD (Cardiology)', experience: 14, availability: 'Available', contact: '+91 98100 12345', email: 'aarav.kapoor@cityhospital.com', consultation_fee: 1200, status: 'Active' },
  { id: 2, user_id: 2, name: 'Dr. Aditi Desai', specialization: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 12, availability: 'Available', contact: '+91 98101 12345', email: 'aditi.desai@cityhospital.com', consultation_fee: 900, status: 'Active' },
  { id: 3, user_id: 3, name: 'Dr. Ajay Mehta', specialization: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics)', experience: 15, availability: 'Available', contact: '+91 98102 12345', email: 'ajay.mehta@cityhospital.com', consultation_fee: 1100, status: 'Active' },
  { id: 4, user_id: 4, name: 'Dr. Akash Verma', specialization: 'General Surgery', qualification: 'MBBS, MS (General Surgery)', experience: 13, availability: 'Available', contact: '+91 98103 12345', email: 'akash.verma@cityhospital.com', consultation_fee: 1150, status: 'Active' },
  { id: 5, user_id: 5, name: 'Dr. Alisha Reddy', specialization: 'Gynecology', qualification: 'MBBS, DGO', experience: 11, availability: 'Available', contact: '+91 98104 12345', email: 'alisha.reddy@cityhospital.com', consultation_fee: 950, status: 'Active' },
  { id: 6, user_id: 6, name: 'Dr. Amar Jain', specialization: 'Urology', qualification: 'MBBS, MS (Urology)', experience: 16, availability: 'Available', contact: '+91 98105 12345', email: 'amar.jain@cityhospital.com', consultation_fee: 1300, status: 'Active' },
  { id: 7, user_id: 7, name: 'Dr. Anjali Iyer', specialization: 'Endocrinology', qualification: 'MBBS, DM (Endocrinology)', experience: 10, availability: 'Available', contact: '+91 98106 12345', email: 'anjali.iyer@cityhospital.com', consultation_fee: 950, status: 'Active' },
  { id: 8, user_id: 8, name: 'Dr. Ankit Singh', specialization: 'Ophthalmology', qualification: 'MBBS, MS (Ophthalmology)', experience: 12, availability: 'Available', contact: '+91 98107 12345', email: 'ankit.singh@cityhospital.com', consultation_fee: 900, status: 'Active' },
  { id: 9, user_id: 9, name: 'Dr. Aparna Rao', specialization: 'Radiology', qualification: 'MBBS, MD (Radiology)', experience: 14, availability: 'Available', contact: '+91 98108 12345', email: 'aparna.rao@cityhospital.com', consultation_fee: 1050, status: 'Active' },
  { id: 10, user_id: 10, name: 'Dr. Arjun Malhotra', specialization: 'Emergency Medicine', qualification: 'MBBS, MD (Emergency Medicine)', experience: 13, availability: 'Available', contact: '+91 98109 12345', email: 'arjun.malhotra@cityhospital.com', consultation_fee: 1100, status: 'Active' },
  { id: 11, user_id: 11, name: 'Dr. Bhavna Kapoor', specialization: 'Psychiatry', qualification: 'MBBS, MD (Psychiatry)', experience: 12, availability: 'Available', contact: '+91 98110 12345', email: 'bhavna.kapoor@cityhospital.com', consultation_fee: 950, status: 'Active' },
  { id: 12, user_id: 12, name: 'Dr. Chetan Gupta', specialization: 'Gastroenterology', qualification: 'MBBS, DM (Gastroenterology)', experience: 15, availability: 'Available', contact: '+91 98111 12345', email: 'chetan.gupta@cityhospital.com', consultation_fee: 1300, status: 'Active' },
  { id: 13, user_id: 13, name: 'Dr. Devika Nair', specialization: 'Nephrology', qualification: 'MBBS, DM (Nephrology)', experience: 14, availability: 'Available', contact: '+91 98112 12345', email: 'devika.nair@cityhospital.com', consultation_fee: 1250, status: 'Active' },
  { id: 14, user_id: 14, name: 'Dr. Dhruv Shah', specialization: 'Pulmonology', qualification: 'MBBS, MD (Pulmonology)', experience: 11, availability: 'Available', contact: '+91 98113 12345', email: 'dhruv.shah@cityhospital.com', consultation_fee: 1100, status: 'Active' },
  { id: 15, user_id: 15, name: 'Dr. Divya Menon', specialization: 'ENT', qualification: 'MBBS, MS (ENT)', experience: 12, availability: 'Available', contact: '+91 98114 12345', email: 'divya.menon@cityhospital.com', consultation_fee: 1000, status: 'Active' },
  { id: 16, user_id: 16, name: 'Dr. Eshan Patel', specialization: 'Internal Medicine', qualification: 'MBBS, MD (Internal Medicine)', experience: 13, availability: 'Available', contact: '+91 98115 12345', email: 'eshan.patel@cityhospital.com', consultation_fee: 950, status: 'Active' },
  { id: 17, user_id: 17, name: 'Dr. Farah Sheikh', specialization: 'Oncology', qualification: 'MBBS, MD (Oncology)', experience: 14, availability: 'Available', contact: '+91 98116 12345', email: 'farah.sheikh@cityhospital.com', consultation_fee: 1400, status: 'Active' },
  { id: 18, user_id: 18, name: 'Dr. Gaurav Bhatia', specialization: 'Urology', qualification: 'MBBS, MS (Urology)', experience: 13, availability: 'Available', contact: '+91 98117 12345', email: 'gaurav.bhatia@cityhospital.com', consultation_fee: 1250, status: 'Active' },
  { id: 19, user_id: 19, name: 'Dr. Harini Kulkarni', specialization: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)', experience: 11, availability: 'Available', contact: '+91 98118 12345', email: 'harini.kulkarni@cityhospital.com', consultation_fee: 900, status: 'Active' },
  { id: 20, user_id: 20, name: 'Dr. Hasan Siddiqui', specialization: 'Cardiology', qualification: 'MBBS, DM (Cardiology)', experience: 16, availability: 'Available', contact: '+91 98119 12345', email: 'hasan.siddiqui@cityhospital.com', consultation_fee: 1350, status: 'Active' },
  { id: 21, user_id: 21, name: 'Dr. Isha Anand', specialization: 'Neurology', qualification: 'MBBS, DM (Neurology)', experience: 13, availability: 'Available', contact: '+91 98120 12345', email: 'isha.anand@cityhospital.com', consultation_fee: 1200, status: 'Active' },
  { id: 22, user_id: 22, name: 'Dr. Jai Sharma', specialization: 'Dental', qualification: 'BDS', experience: 10, availability: 'Available', contact: '+91 98121 12345', email: 'jai.sharma@cityhospital.com', consultation_fee: 850, status: 'Active' },
  { id: 23, user_id: 23, name: 'Dr. Jaya Srinivasan', specialization: 'Anesthesiology', qualification: 'MBBS, MD (Anesthesiology)', experience: 14, availability: 'Available', contact: '+91 98122 12345', email: 'jaya.srinivasan@cityhospital.com', consultation_fee: 1200, status: 'Active' },
  { id: 24, user_id: 24, name: 'Dr. Kabir Khan', specialization: 'Plastic Surgery', qualification: 'MBBS, MCh (Plastic Surgery)', experience: 13, availability: 'Available', contact: '+91 98123 12345', email: 'kabir.khan@cityhospital.com', consultation_fee: 1500, status: 'Active' },
  { id: 25, user_id: 25, name: 'Dr. Kanchan Pillai', specialization: 'Rheumatology', qualification: 'MBBS, DM (Rheumatology)', experience: 12, availability: 'Available', contact: '+91 98124 12345', email: 'kanchan.pillai@cityhospital.com', consultation_fee: 1150, status: 'Active' },
  { id: 26, user_id: 26, name: 'Dr. Karan Chopra', specialization: 'Gastroenterology', qualification: 'MBBS, DM (Gastroenterology)', experience: 15, availability: 'Available', contact: '+91 98125 12345', email: 'karan.chopra@cityhospital.com', consultation_fee: 1300, status: 'Active' },
  { id: 27, user_id: 27, name: 'Dr. Kavya Ramesh', specialization: 'Ophthalmology', qualification: 'MBBS, MS (Ophthalmology)', experience: 11, availability: 'Available', contact: '+91 98126 12345', email: 'kavya.ramesh@cityhospital.com', consultation_fee: 950, status: 'Active' },
  { id: 28, user_id: 28, name: 'Dr. Kunal Mehra', specialization: 'Psychiatry', qualification: 'MBBS, MD (Psychiatry)', experience: 14, availability: 'Available', contact: '+91 98127 12345', email: 'kunal.mehra@cityhospital.com', consultation_fee: 1050, status: 'Active' },
  { id: 29, user_id: 29, name: 'Dr. Lata Iyer', specialization: 'Gynecology', qualification: 'MBBS, DGO', experience: 13, availability: 'Available', contact: '+91 98128 12345', email: 'lata.iyer@cityhospital.com', consultation_fee: 980, status: 'Active' },
  { id: 30, user_id: 30, name: 'Dr. Madhav Rao', specialization: 'Neurology', qualification: 'MBBS, DM (Neurology)', experience: 16, availability: 'Available', contact: '+91 98129 12345', email: 'madhav.rao@cityhospital.com', consultation_fee: 1300, status: 'Active' },
  { id: 31, user_id: 31, name: 'Dr. Meera Sen', specialization: 'Internal Medicine', qualification: 'MBBS, MD (Internal Medicine)', experience: 14, availability: 'Available', contact: '+91 98130 12345', email: 'meera.sen@cityhospital.com', consultation_fee: 1000, status: 'Active' },
  { id: 32, user_id: 32, name: 'Dr. Milan Deshpande', specialization: 'Cardiology', qualification: 'MBBS, DM (Cardiology)', experience: 15, availability: 'Available', contact: '+91 98131 12345', email: 'milan.deshpande@cityhospital.com', consultation_fee: 1400, status: 'Active' },
  { id: 33, user_id: 33, name: 'Dr. Mira Reddy', specialization: 'Nephrology', qualification: 'MBBS, DM (Nephrology)', experience: 12, availability: 'Available', contact: '+91 98132 12345', email: 'mira.reddy@cityhospital.com', consultation_fee: 1250, status: 'Active' },
  { id: 34, user_id: 34, name: 'Dr. Mohit Arora', specialization: 'Pulmonology', qualification: 'MBBS, MD (Pulmonology)', experience: 13, availability: 'Available', contact: '+91 98133 12345', email: 'mohit.arora@cityhospital.com', consultation_fee: 1150, status: 'Active' },
  { id: 35, user_id: 35, name: 'Dr. Naina Gupta', specialization: 'Pathology', qualification: 'MBBS, MD (Pathology)', experience: 11, availability: 'Available', contact: '+91 98134 12345', email: 'naina.gupta@cityhospital.com', consultation_fee: 900, status: 'Active' },
  { id: 36, user_id: 36, name: 'Dr. Nikhil Saxena', specialization: 'General Surgery', qualification: 'MBBS, MS (General Surgery)', experience: 15, availability: 'Available', contact: '+91 98135 12345', email: 'nikhil.saxena@cityhospital.com', consultation_fee: 1200, status: 'Active' },
  { id: 37, user_id: 37, name: 'Dr. Nisha Patel', specialization: 'Dentistry', qualification: 'BDS', experience: 10, availability: 'Available', contact: '+91 98136 12345', email: 'nisha.patel@cityhospital.com', consultation_fee: 850, status: 'Active' },
  { id: 38, user_id: 38, name: 'Dr. Pankaj Verma', specialization: 'Radiology', qualification: 'MBBS, MD (Radiology)', experience: 13, availability: 'Available', contact: '+91 98137 12345', email: 'pankaj.verma@cityhospital.com', consultation_fee: 1075, status: 'Active' },
  { id: 39, user_id: 39, name: 'Dr. Parul Sharma', specialization: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 12, availability: 'Available', contact: '+91 98138 12345', email: 'parul.sharma@cityhospital.com', consultation_fee: 925, status: 'Active' },
  { id: 40, user_id: 40, name: 'Dr. Pranav Joshi', specialization: 'ENT', qualification: 'MBBS, MS (ENT)', experience: 14, availability: 'Available', contact: '+91 98139 12345', email: 'pranav.joshi@cityhospital.com', consultation_fee: 1000, status: 'Active' },
  { id: 41, user_id: 41, name: 'Dr. Preeti Banerjee', specialization: 'Gynecology', qualification: 'MBBS, DGO', experience: 13, availability: 'Available', contact: '+91 98140 12345', email: 'preeti.banerjee@cityhospital.com', consultation_fee: 980, status: 'Active' },
  { id: 42, user_id: 42, name: 'Dr. Raghav Sharma', specialization: 'Cardiology', qualification: 'MBBS, DM (Cardiology)', experience: 14, availability: 'Available', contact: '+91 98141 12345', email: 'raghav.sharma@cityhospital.com', consultation_fee: 1350, status: 'Active' },
  { id: 43, user_id: 43, name: 'Dr. Rima Nair', specialization: 'Endocrinology', qualification: 'MBBS, MD (Endocrinology)', experience: 12, availability: 'Available', contact: '+91 98142 12345', email: 'rima.nair@cityhospital.com', consultation_fee: 980, status: 'Active' },
  { id: 44, user_id: 44, name: 'Dr. Rohit Mishra', specialization: 'Oncology', qualification: 'MBBS, MD (Oncology)', experience: 15, availability: 'Available', contact: '+91 98143 12345', email: 'rohit.mishra@cityhospital.com', consultation_fee: 1450, status: 'Active' },
  { id: 45, user_id: 45, name: 'Dr. Saisha Rao', specialization: 'Nephrology', qualification: 'MBBS, DM (Nephrology)', experience: 13, availability: 'Available', contact: '+91 98144 12345', email: 'saisha.rao@cityhospital.com', consultation_fee: 1250, status: 'Active' },
  { id: 46, user_id: 46, name: 'Dr. Sakshi Patel', specialization: 'Plastic Surgery', qualification: 'MBBS, MCh (Plastic Surgery)', experience: 12, availability: 'Available', contact: '+91 98145 12345', email: 'sakshi.patel@cityhospital.com', consultation_fee: 1500, status: 'Active' },
  { id: 47, user_id: 47, name: 'Dr. Sameer Khan', specialization: 'Pulmonology', qualification: 'MBBS, MD (Pulmonology)', experience: 14, availability: 'Available', contact: '+91 98146 12345', email: 'sameer.khan@cityhospital.com', consultation_fee: 1150, status: 'Active' },
  { id: 48, user_id: 48, name: 'Dr. Sanjana Joshi', specialization: 'Gastroenterology', qualification: 'MBBS, DM (Gastroenterology)', experience: 13, availability: 'Available', contact: '+91 98147 12345', email: 'sanjana.joshi@cityhospital.com', consultation_fee: 1300, status: 'Active' },
  { id: 49, user_id: 49, name: 'Dr. Siddharth Bhat', specialization: 'Anesthesiology', qualification: 'MBBS, MD (Anesthesiology)', experience: 12, availability: 'Available', contact: '+91 98148 12345', email: 'siddharth.bhat@cityhospital.com', consultation_fee: 1150, status: 'Active' },
  { id: 50, user_id: 50, name: 'Dr. Sneha Iyer', specialization: 'Rheumatology', qualification: 'MBBS, DM (Rheumatology)', experience: 11, availability: 'Available', contact: '+91 98149 12345', email: 'sneha.iyer@cityhospital.com', consultation_fee: 1150, status: 'Active' },
];

const loadData = () => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return { ...defaultData };
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read fallback DB:', error);
    return { ...defaultData };
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write fallback DB:', error);
  }
};

const getNextId = (items) => {
  if (!items || items.length === 0) {
    return 1;
  }
  return Math.max(...items.map((item) => item.id || 0)) + 1;
};

const findUserByEmail = (email) => {
  const data = loadData();
  return data.users.find((user) => user.email === email.toLowerCase());
};

const createUser = (user) => {
  const data = loadData();
  const newUser = { id: getNextId(data.users), ...user };
  data.users.push(newUser);
  saveData(data);
  return newUser;
};

const createDoctor = (userId, specialization = '') => {
  const data = loadData();
  const newDoctor = { id: getNextId(data.doctors), user_id: userId, specialization };
  data.doctors.push(newDoctor);
  saveData(data);
  return newDoctor;
};

const createPatient = (userId, gender = 'Male', address = '') => {
  const data = loadData();
  const newPatient = { id: getNextId(data.patients), user_id: userId, gender, address };
  data.patients.push(newPatient);
  saveData(data);
  return newPatient;
};

const getDoctorByUserId = (userId) => {
  const data = loadData();
  return data.doctors.find((doctor) => doctor.user_id === userId);
};

const getPatientByUserId = (userId) => {
  const data = loadData();
  return data.patients.find((patient) => patient.user_id === userId);
};

const getPatientById = (id) => {
  const data = loadData();
  return data.patients.find((patient) => patient.id === Number(id));
};

const getDoctorById = (id) => {
  const data = loadData();
  const doctor = data.doctors.find((doctor) => doctor.id === Number(id));
  if (doctor) {
    return doctor;
  }
  return sampleDoctors.find((doctor) => doctor.id === Number(id)) || null;
};

const findAppointmentByDoctorDateTime = (doctorId, date, time) => {
  const data = loadData();
  return data.appointments.find(
    (appointment) =>
      Number(appointment.doctor_id) === Number(doctorId) &&
      appointment.date === date &&
      appointment.time === time &&
      ['pending', 'confirmed'].includes(appointment.status)
  );
};

const createAppointment = (patientId, doctorId, date, time, status = 'pending') => {
  const data = loadData();
  const newAppointment = {
    id: getNextId(data.appointments),
    patient_id: Number(patientId),
    doctor_id: Number(doctorId),
    date,
    time,
    status,
    created_at: new Date().toISOString(),
  };
  data.appointments.push(newAppointment);
  saveData(data);
  return newAppointment;
};

const createContactMessage = ({ name, email, phone, subject, message, created_at }) => {
  const data = loadData();
  const newMessage = {
    id: getNextId(data.contact_messages),
    name,
    email,
    phone,
    subject,
    message,
    created_at,
  };
  data.contact_messages.push(newMessage);
  saveData(data);
  return newMessage;
};

const getAppointments = (filters = {}) => {
  const data = loadData();
  const { doctorId, patientId, date, status } = filters;
  return data.appointments.filter((appointment) => {
    if (doctorId && Number(appointment.doctor_id) !== Number(doctorId)) return false;
    if (patientId && Number(appointment.patient_id) !== Number(patientId)) return false;
    if (date && appointment.date !== date) return false;
    if (status && appointment.status !== status) return false;
    return true;
  });
};

const updateAppointmentStatus = (id, status) => {
  const data = loadData();
  const appointment = data.appointments.find((appointment) => appointment.id === Number(id));
  if (!appointment) return null;
  appointment.status = status;
  saveData(data);
  return appointment;
};

module.exports = {
  loadData,
  saveData,
  findUserByEmail,
  createUser,
  createDoctor,
  createPatient,
  getDoctorByUserId,
  getPatientByUserId,
  getDoctorById,
  getPatientById,
  findAppointmentByDoctorDateTime,
  createAppointment,
  createContactMessage,
  getAppointments,
  updateAppointmentStatus,
  sampleDoctors,
};
