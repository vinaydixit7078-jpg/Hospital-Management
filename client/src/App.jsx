import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import ContactPage from './ContactPage';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { doctorData } from './data/doctors';
import AdminLogin from './admin/AdminLogin';
import DoctorDashboard from './admin/DoctorDashboard';
import DashboardLayout from './layout/DashboardLayout';
import DoctorLayout from './doctor/DoctorLayout';
import { diseaseDirectory } from './data/diseaseDirectory';
// Lazy-load doctor panel pages to avoid blocking initial module evaluation
const DoctorAppointments = React.lazy(() => import('./doctor/DoctorAppointments'));
const DoctorLogin = React.lazy(() => import('./doctor/DoctorLogin'));
const DoctorPanelDashboard = React.lazy(() => import('./doctor/DoctorPanelDashboard'));
const DoctorPatients = React.lazy(() => import('./doctor/DoctorPatients'));
const DoctorProfile = React.lazy(() => import('./doctor/DoctorProfile'));
import { AuthProvider, useAuth } from './auth';
import {
  AdminDashboardPage,
  AdminPatientsPage,
  AdminDoctorsPage,
  AdminAppointmentsPage,
  AdminDepartmentsPage,
  AdminPharmacyPage,
  AdminLaboratoryPage,
  AdminBillingPage,
  AdminStaffPage,
  AdminReportsPage,
  AdminInventoryPage,
  AdminSettingsPage,
} from './admin/AdminPages';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

const getAuthHeaders = (token) => {
  const authToken = token || localStorage.getItem('token');
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error){
    return { error };
  }
  componentDidCatch(error, info){
    console.error('Unhandled render error:', error, info);
  }
  render(){
    if(this.state.error){
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
          <div className="max-w-2xl rounded-xl border border-rose-600/40 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-rose-400">Something went wrong</h2>
            <pre className="mt-4 text-xs text-slate-300 whitespace-pre-wrap">{String(this.state.error)}</pre>
            <div className="mt-4 text-sm text-slate-400">Check the browser console for details.</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


// DashboardLayout moved to ./layout/DashboardLayout

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post('/auth/login', { email, password });
      login({ token: res.data.token, user: res.data.user });

      if (res.data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold">Hospital Portal</h1>
        <p className="mb-6 text-sm text-slate-400">Sign in to access your dashboard.</p>
        <label className="block text-sm text-slate-300">Email</label>
        <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="mb-2 text-sm text-rose-400">{errors.email}</p>}
        <label className="block text-sm text-slate-300">Password</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {errors.password && <p className="mb-3 text-sm text-rose-400">{errors.password}</p>}
        <button className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">Login</button>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
        <p className="mt-4 text-sm text-slate-400">
          Don&apos;t have an account? <Link to="/register" className="text-cyan-400 hover:text-cyan-300">Register</Link>
        </p>
      </form>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (!form.role) {
      nextErrors.role = 'Role selection is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.post('/auth/register', form);
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      login({ token: res.data.token, user: res.data.user });

      if (res.data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleRegister} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold">Create Account</h1>
        <p className="mb-6 text-sm text-slate-400">Register as a patient or doctor to use the hospital portal.</p>
        <label className="block text-sm text-slate-300">Name</label>
        <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p className="mb-2 text-sm text-rose-400">{errors.name}</p>}
        <label className="block text-sm text-slate-300">Email</label>
        <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <p className="mb-2 text-sm text-rose-400">{errors.email}</p>}
        <label className="block text-sm text-slate-300">Password</label>
        <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errors.password && <p className="mb-2 text-sm text-rose-400">{errors.password}</p>}
        <label className="block text-sm text-slate-300">Role</label>
        <select className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        {errors.role && <p className="mb-2 text-sm text-rose-400">{errors.role}</p>}
        <button className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">Register</button>
        {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Login</Link>
        </p>
      </form>
    </div>
  );
}

function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '09:00' });
  const [message, setMessage] = useState('');

  const patient = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = patient.patientId || patient.id;

  const sampleDoctors = doctorData;

  const normalizedDoctorSearch = doctorSearch.trim().toLowerCase();
  const searchTokens = normalizedDoctorSearch.split(/\s+/).filter(Boolean);

  const matchedDiseaseEntries = diseaseDirectory.filter((entry) =>
    entry.terms.some((term) => {
      const normalizedTerm = term.toLowerCase();
      if (!normalizedDoctorSearch) return false;
      if (normalizedTerm.includes(normalizedDoctorSearch) || normalizedDoctorSearch.includes(normalizedTerm)) return true;
      return searchTokens.length > 0 && searchTokens.every((token) => normalizedTerm.includes(token));
    })
  );

  const diseaseSuggestions = [...new Set(matchedDiseaseEntries.flatMap((entry) => entry.terms))]
    .filter((term) => term.toLowerCase().includes(normalizedDoctorSearch) || normalizedDoctorSearch.includes(term.toLowerCase()))
    .slice(0, 8);

  const suggestedSpecializations = [...new Set(matchedDiseaseEntries.map((entry) => entry.specialization))];

  const filteredDoctors = doctors
    .filter((doctor) => {
      if (!normalizedDoctorSearch) return true;

      const byNameOrSpecialization =
        doctor.name.toLowerCase().includes(normalizedDoctorSearch) ||
        doctor.specialization.toLowerCase().includes(normalizedDoctorSearch);

      const byDiseaseSuggestion = suggestedSpecializations.some(
        (specialization) => doctor.specialization.toLowerCase() === specialization.toLowerCase()
      );

      return byNameOrSpecialization || byDiseaseSuggestion;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const loadData = async () => {
    try {
      const docRes = await api.get('/doctors', { headers: getAuthHeaders() });
      const loadedDoctors = docRes.data && docRes.data.length ? docRes.data : sampleDoctors;
      const sortedDoctors = [...loadedDoctors].sort((a, b) => a.name.localeCompare(b.name));
      setDoctors(sortedDoctors);
      const apptRes = await api.get(`/appointments/patient/${patientId}`, { headers: getAuthHeaders() });
      setAppointments(apptRes.data || []);
    } catch (error) {
      console.error(error);
      const sortedSample = [...sampleDoctors].sort((a, b) => a.name.localeCompare(b.name));
      setDoctors(sortedSample);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        '/appointments',
        {
          patientId,
          doctorId: Number(form.doctorId),
          date: form.date,
          time: form.time,
        },
        { headers: getAuthHeaders() }
      );
      window.dispatchEvent(new Event('appointmentBooked'));
      setMessage('Appointment booked successfully');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  const upcoming = appointments.filter((a) => new Date(`${a.date}T${a.time}`) >= new Date());
  const past = appointments.filter((a) => new Date(`${a.date}T${a.time}`) < new Date());

  return (
    <DashboardLayout title="Patient Dashboard" links={[{ to: '/appointments', label: 'Appointments' }, { to: '/records', label: 'Medical Records' }, { to: '/prescriptions', label: 'Prescriptions' }, { to: '/pay', label: 'Pay' }]}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            {patient.name ? `Book an Appointment, ${patient.name}` : 'Book an Appointment'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Search doctors</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-cyan-500"
                placeholder="Search doctor by your Decease"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                list="disease-search-list"
              />
              <datalist id="disease-search-list">
                {diseaseDirectory.flatMap((entry) => entry.terms).map((term) => (
                  <option key={term} value={term} />
                ))}
              </datalist>
              {diseaseSuggestions.length > 0 && (
                <div className="mt-2 text-xs text-slate-400">
                  Suggested disease search:{' '}
                  {diseaseSuggestions.map((disease) => (
                    <button
                      key={disease}
                      type="button"
                      className="mr-2 mt-1 rounded-full border border-slate-700 px-2 py-1 text-slate-300 hover:border-cyan-500 hover:text-cyan-300"
                      onClick={() => setDoctorSearch(disease)}
                    >
                      {disease}
                    </button>
                  ))}
                </div>
              )}
              {suggestedSpecializations.length > 0 && (
                <p className="mt-2 text-xs text-cyan-300">
                  Suggested specialist: {suggestedSpecializations.join(', ')}
                </p>
              )}
            </div>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            >
              <option value="">Select doctor</option>
              {Object.entries(
                filteredDoctors
                  .reduce((groups, doctor) => {
                    const key = doctor.specialization || 'General';
                    groups[key] = groups[key] || [];
                    groups[key].push(doctor);
                    return groups;
                  }, {})
              ).sort(([a], [b]) => a.localeCompare(b)).map(([specialization, doctorsInGroup]) => (
                <optgroup key={specialization} label={specialization}>
                  {doctorsInGroup.map((doctor) => {
                    const doctorLabel = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
                    return (
                      <option key={doctor.id} value={doctor.id}>
                        {doctorLabel} — {doctor.specialization}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
            <input type="date" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
            </select>
            <button className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">Book Appointment</button>
            {message && <p className="text-sm text-slate-300">{message}</p>}
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Appointments</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming</h3>
              <div className="space-y-2">
                {upcoming.length === 0 ? <p className="text-sm text-slate-400">No upcoming appointments.</p> : upcoming.map((appt) => (
                  <div key={appt.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{appt.doctor_name}</span>
                      <span className="rounded-full bg-emerald-700/40 px-2 py-1 text-xs">{appt.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{appt.date} at {appt.time}</p>
                    <p className="text-sm text-slate-400">Specialization: {appt.specialization}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Past</h3>
              <div className="space-y-2">
                {past.length === 0 ? <p className="text-sm text-slate-400">No past appointments.</p> : past.map((appt) => (
                  <div key={appt.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{appt.doctor_name}</span>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-xs">{appt.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{appt.date} at {appt.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RecordsPage() {
  const [records, setRecords] = useState([]);
  const patient = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = patient.patientId || patient.id;

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/medical-records/patient/${patientId}`, { headers: getAuthHeaders() });
      setRecords(res.data || []);
    };
    load();
  }, [patientId]);

  return (
    <DashboardLayout title="Patient Dashboard" links={[{ to: '/appointments', label: 'Appointments' }, { to: '/records', label: 'Medical Records' }, { to: '/prescriptions', label: 'Prescriptions' }, { to: '/pay', label: 'Pay' }]}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Medical Records</h2>
        <div className="space-y-3">
          {records.length === 0 ? <p className="text-sm text-slate-400">No medical records yet.</p> : records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-4">
              <p className="font-medium">{record.diagnosis}</p>
              <p className="mt-1 text-sm text-slate-400">{record.notes}</p>
              <p className="mt-2 text-xs text-slate-500">Created: {record.created_at}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const patient = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = patient.patientId || patient.id;

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/prescriptions/patient/${patientId}`, { headers: getAuthHeaders() });
      setPrescriptions(res.data || []);
    };
    load();
  }, [patientId]);

  return (
    <DashboardLayout title="Patient Dashboard" links={[{ to: '/appointments', label: 'Appointments' }, { to: '/records', label: 'Medical Records' }, { to: '/prescriptions', label: 'Prescriptions' }, { to: '/pay', label: 'Pay' }]}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Prescriptions</h2>
        <div className="space-y-3">
          {prescriptions.length === 0 ? <p className="text-sm text-slate-400">No prescriptions yet.</p> : prescriptions.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.medicine_name}</p>
                <a href={`${BACKEND_URL}/api/prescriptions/${item.id}/download`} className="text-sm text-cyan-400" target="_blank" rel="noreferrer">Download PDF</a>
              </div>
              <p className="mt-1 text-sm text-slate-400">Dosage: {item.dosage}</p>
              <p className="mt-1 text-sm text-slate-400">Frequency: {item.frequency}</p>
              <p className="mt-1 text-sm text-slate-400">Duration: {item.duration}</p>
              <p className="mt-1 text-sm text-slate-400">Instructions: {item.instructions}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PaymentPage() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [amount, setAmount] = useState('500');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const patientId = user.patientId || user.id;

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await api.get(`/appointments/patient/${patientId}`, { headers: getAuthHeaders() });
        const data = res.data || [];
        setAppointments(data);
        if (data.length > 0) {
          const firstAppointment = data[0];
          setAppointmentId(String(firstAppointment.id));
          setAmount(String(firstAppointment.consultation_fee || firstAppointment.amount || 500));
        }
      } catch (error) {
        console.error(error);
        setMessage('Unable to load appointments for payment.');
      }
    };

    if (patientId) {
      loadAppointments();
    }
  }, [patientId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      setCheckoutReady(true);
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setCheckoutReady(true);
    script.onerror = () => setCheckoutReady(false);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!appointmentId) return;
    const selectedAppointment = appointments.find((item) => String(item.id) === String(appointmentId));
    if (selectedAppointment) {
      setAmount(String(selectedAppointment.consultation_fee || selectedAppointment.amount || 500));
    }
  }, [appointmentId, appointments]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!appointmentId || !amount) {
      setMessage('Select an appointment and enter an amount.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const orderRes = await api.post('/payments/create-order', { appointmentId, amount }, { headers: getAuthHeaders() });
      const { order, mockOrder } = orderRes.data;

      if (mockOrder) {
        await api.post('/payments/verify', {
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_${Date.now()}`,
          razorpay_signature: 'mock-signature',
          appointmentId,
          amount,
        }, { headers: getAuthHeaders() });
        setMessage('Payment successful in demo mode.');
        return;
      }

      if (!checkoutReady || !window.Razorpay) {
        setMessage('Razorpay is not ready yet. Please refresh and try again.');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: order.amount,
        currency: order.currency,
        name: 'Hospital Management System',
        description: 'Appointment Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
              amount,
            }, { headers: getAuthHeaders() });
            setMessage('Payment successful.');
          } catch (error) {
            setMessage(error.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name || 'Patient',
          email: user.email || 'patient@example.com',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Patient Dashboard" links={[{ to: '/appointments', label: 'Appointments' }, { to: '/records', label: 'Medical Records' }, { to: '/prescriptions', label: 'Prescriptions' }, { to: '/pay', label: 'Pay' }]}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Make Payment</h2>
        <p className="mb-4 text-sm text-slate-400">Choose an appointment and pay securely online for your consultation.</p>
        <form onSubmit={handlePay} className="space-y-4">
          <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
            {appointments.length === 0 ? <option value="">No appointments available</option> : appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.date} at {appointment.time} • {appointment.doctor_name || 'Doctor'}
              </option>
            ))}
          </select>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button disabled={loading} className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
          {message && <p className="text-sm text-slate-300">{message}</p>}
        </form>
      </div>
    </DashboardLayout>
  );
}

function LegacyDoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [recordForm, setRecordForm] = useState({ patientId: '', diagnosis: '', notes: '' });
  const [prescriptionForm, setPrescriptionForm] = useState({ appointmentId: '', medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const loadData = async () => {
      try {
        const apptRes = await api.get(`/appointments/${user.doctorId || 1}`, { headers: getAuthHeaders() });
        setAppointments(apptRes.data || []);
        const patientRes = await api.get('/patients', { headers: getAuthHeaders() });
        setPatients(patientRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [user.doctorId]);

  const handlePatientSelect = async (patientId) => {
    setRecordForm({ ...recordForm, patientId });
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`, { headers: getAuthHeaders() });
      setPatientHistory(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', recordForm, { headers: getAuthHeaders() });
      setMessage('Medical record added successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add record');
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', prescriptionForm, { headers: getAuthHeaders() });
      setMessage('Prescription created successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create prescription');
    }
  };

  return (
    <DashboardLayout title="Doctor Dashboard" links={[{ to: '/doctor', label: 'Today' }, { to: '/doctor/history', label: 'History' }]}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Today's Appointments</h2>
            <div className="space-y-3">
              {appointments.length === 0 ? <p className="text-sm text-slate-400">No appointments today.</p> : appointments.map((appt) => (
                <div key={appt.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{appt.patient_name}</span>
                    <span className="rounded-full bg-emerald-700/40 px-2 py-1 text-xs">{appt.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{appt.date} at {appt.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Patient History</h2>
            <select className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={recordForm.patientId} onChange={(e) => handlePatientSelect(e.target.value)}>
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            <div className="space-y-3">
              {patientHistory.length === 0 ? <p className="text-sm text-slate-400">Select a patient to view medical history.</p> : patientHistory.map((record) => (
                <div key={record.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-4">
                  <p className="font-medium">{record.diagnosis}</p>
                  <p className="mt-1 text-sm text-slate-400">{record.notes}</p>
                  <p className="mt-2 text-xs text-slate-500">Created: {record.created_at}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Add Diagnosis / Medical Record</h2>
            <form onSubmit={handleRecordSubmit} className="space-y-3">
              <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={recordForm.patientId} onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}>
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
              <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Diagnosis" value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} />
              <textarea className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Notes" value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} />
              <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500">Save Record</button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Create Prescription</h2>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-3">
              <select className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={prescriptionForm.appointmentId} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, appointmentId: e.target.value })}>
                <option value="">Select appointment</option>
                {appointments.map((appt) => (
                  <option key={appt.id} value={appt.id}>{appt.patient_name} - {appt.date}</option>
                ))}
              </select>
              <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Medicine Name" value={prescriptionForm.medicineName} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicineName: e.target.value })} />
              <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Dosage" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} />
              <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Frequency" value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })} />
              <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Duration" value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} />
              <textarea className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Instructions" value={prescriptionForm.instructions} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} />
              <button className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">Create Prescription</button>
            </form>
            {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AdminDashboard() {
  const [contact, setContact] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hospital_contact') || 'null') || { address: '123 Health Ave, Wellness City', phone: '+1 (555) 123-4567', email: 'info@cityhospital.example', hours: 'Mon–Sun: 24 hours' };
    } catch (e) {
      return { address: '123 Health Ave, Wellness City', phone: '+1 (555) 123-4567', email: 'info@cityhospital.example', hours: 'Mon–Sun: 24 hours' };
    }
  });

  const [contactForm, setContactForm] = useState(contact);

  const saveContact = () => {
    try {
      localStorage.setItem('hospital_contact', JSON.stringify(contactForm));
      setContact(contactForm);
      setMessage('Contact information updated');
    } catch (e) {
      setMessage('Could not save contact info');
    }
  };
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilters, setAppointmentFilters] = useState({ status: '', doctorId: '', patientId: '', date: '' });
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', specialization: '' });
  const [patientForm, setPatientForm] = useState({ name: '', email: '', password: '', gender: 'Male', address: '' });
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState({ appointments: [], revenue: [] });

  const sampleDoctors = [
    { id: 1, name: 'Dr. Nina Patel', specialization: 'Cardiology', email: 'nina@hospital.test' },
    { id: 2, name: 'Dr. Omar Hassan', specialization: 'Neurology', email: 'omar@hospital.test' },
  ];

  const samplePatients = [
    { id: 1, name: 'Asha Khan', gender: 'Female', address: '12 Main Street', email: 'asha@hospital.test' },
    { id: 2, name: 'Ben Alvarez', gender: 'Male', address: '45 River Road', email: 'ben@hospital.test' },
  ];

  const sampleAppointments = [
    { id: 1, patient_name: 'Asha Khan', doctor_name: 'Dr. Nina Patel', date: '2026-07-28', time: '09:00', status: 'confirmed' },
    { id: 2, patient_name: 'Ben Alvarez', doctor_name: 'Dr. Omar Hassan', date: '2026-07-30', time: '14:00', status: 'pending' },
  ];

  const sampleAnalytics = {
    appointments: [
      { name: 'Jan', value: 8 },
      { name: 'Feb', value: 11 },
      { name: 'Mar', value: 10 },
      { name: 'Apr', value: 15 },
      { name: 'May', value: 13 },
      { name: 'Jun', value: 18 },
    ],
    revenue: [
      { name: 'Jan', value: 9000 },
      { name: 'Feb', value: 10500 },
      { name: 'Mar', value: 11200 },
      { name: 'Apr', value: 12800 },
      { name: 'May', value: 14600 },
      { name: 'Jun', value: 17000 },
    ],
  };

  const loadData = async () => {
    try {
      const [doctorRes, patientRes, appointmentsRes, monthlyAppointmentsRes, revenueRes] = await Promise.all([
        api.get('/doctors', { headers: getAuthHeaders() }),
        api.get('/patients', { headers: getAuthHeaders() }),
        api.get('/appointments', { headers: getAuthHeaders(), params: appointmentFilters }),
        api.get('/analytics/appointments-per-month', { headers: getAuthHeaders() }),
        api.get('/analytics/revenue-per-month', { headers: getAuthHeaders() }),
      ]);

      setDoctors(doctorRes.data || sampleDoctors);
      setPatients(patientRes.data || samplePatients);
      setAppointments(appointmentsRes.data || sampleAppointments);
      setAnalytics({
        appointments: monthlyAppointmentsRes.data || sampleAnalytics.appointments,
        revenue: revenueRes.data || sampleAnalytics.revenue,
      });
    } catch (error) {
      setDoctors(sampleDoctors);
      setPatients(samplePatients);
      setAppointments(sampleAppointments);
      setAnalytics({ appointments: sampleAnalytics.appointments, revenue: sampleAnalytics.revenue });
      setMessage('Showing sample admin data because the server is not reachable yet.');
    }
  };

  useEffect(() => {
    loadData();
  }, [appointmentFilters.status, appointmentFilters.doctorId, appointmentFilters.patientId, appointmentFilters.date]);

  const adminName = (() => {
    try {
      return (typeof window !== 'undefined' && (sessionStorage.getItem('admin_name') || JSON.parse(localStorage.getItem('user') || 'null')?.name)) || 'Admin';
    } catch (e) {
      return 'Admin';
    }
  })();

  const { logout } = useAuth();

  // live time
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Derived metrics
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter(a => a.date === todayStr).length;
  const totalRevenue = (analytics.revenue || []).reduce((s, r) => s + (r.value || 0), 0);

  // Sample / persisted inventory and beds
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hospital_inventory') || 'null') || [
        { id: 1, name: 'Paracetamol 500mg', stock: 120, expiry: '2027-02-01' },
        { id: 2, name: 'Amoxicillin 250mg', stock: 18, expiry: '2026-09-12' },
        { id: 3, name: 'Insulin', stock: 40, expiry: '2026-11-20' },
      ];
    } catch (e) {
      return [];
    }
  });

  const [beds] = useState({ total: 150, occupied: 112, icu: 12 });

  const lowStockThreshold = 20;

  // small UI components used in the redesigned layout
  const StatCard = ({ title, value, icon, trend, color = 'bg-cyan-600' }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/60 p-5 shadow-lg transform transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-400">{title}</div>
          <div className="mt-1 text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}>{icon}</div>
      </div>
      {trend && <div className="mt-3 text-sm text-slate-400">{trend}</div>}
    </div>
  );

  const Sidebar = ({ active = 'dashboard' }) => (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 px-4 pt-6 lg:flex">
      <div className="mb-6 px-2">
        <div className="mb-2 text-2xl font-semibold">City Hospital</div>
        <div className="text-sm text-slate-400">Admin</div>
      </div>
      <nav className="flex flex-col gap-1">
        {[
          ['dashboard','Dashboard'],['patients','Patients'],['doctors','Doctors'],['appointments','Appointments'],['departments','Departments'],['pharmacy','Pharmacy'],['laboratory','Laboratory'],['billing','Billing'],['staff','Staff'],['reports','Reports'],['inventory','Inventory'],['settings','Settings']
        ].map(([k,label]) => (
          <a key={k} className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active===k? 'bg-slate-800 text-white':'text-slate-300 hover:bg-slate-800'}`} href="#">
            <span className="inline-block h-4 w-4 rounded bg-slate-700/40" />
            <span className="flex-1">{label}</span>
            {active===k && <span className="text-xs text-cyan-400">•</span>}
          </a>
        ))}
      </nav>
      <div className="mt-auto px-2">
        <button onClick={() => { logout(); }} className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium">Logout</button>
      </div>
    </aside>
  );

  const TopNav = () => (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 rounded-md bg-slate-900/60 px-3 py-2 md:flex">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <input placeholder="Search patients, doctors, appointments..." className="bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500" />
        </div>
        <div className="rounded-md bg-slate-900/60 px-3 py-2 text-sm text-slate-300">{now.toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-md bg-slate-900/60 p-2 text-slate-300 hover:bg-slate-800">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-xs text-white">3</span>
        </button>
        <button
          onClick={() => {
            const nextLight = document.documentElement.classList.toggle('light');
            try {
              localStorage.setItem('theme', nextLight ? 'light' : 'dark');
            } catch (e) {
              // ignore storage errors
            }
          }}
          className="rounded-md bg-slate-900/60 p-2 text-slate-300 hover:bg-slate-800"
          aria-label="Toggle light and dark theme"
        >🌗</button>
        <div className="flex items-center gap-2 rounded-md bg-slate-900/60 px-3 py-1 text-sm">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500" />
          <div className="text-sm">{adminName}</div>
        </div>
      </div>
    </div>
  );

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctorId) {
        await api.put(`/doctors/${editingDoctorId}`, doctorForm, { headers: getAuthHeaders() });
      } else {
        await api.post('/doctors', doctorForm, { headers: getAuthHeaders() });
      }
      setDoctorForm({ name: '', email: '', password: '', specialization: '' });
      setEditingDoctorId(null);
      setMessage('Doctor saved successfully');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save doctor');
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatientId) {
        await api.put(`/patients/${editingPatientId}`, patientForm, { headers: getAuthHeaders() });
      } else {
        await api.post('/patients', patientForm, { headers: getAuthHeaders() });
      }
      setPatientForm({ name: '', email: '', password: '', gender: 'Male', address: '' });
      setEditingPatientId(null);
      setMessage('Patient saved successfully');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save patient');
    }
  };

  const handleDoctorEdit = (doctor) => {
    setEditingDoctorId(doctor.id);
    setDoctorForm({ name: doctor.name, email: doctor.email || '', password: '', specialization: doctor.specialization || '' });
  };

  const handleDoctorDelete = async (id) => {
    try {
      await api.delete(`/doctors/${id}`, { headers: getAuthHeaders() });
      setMessage('Doctor deleted');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not delete doctor');
    }
  };

  const handlePatientEdit = (patient) => {
    setEditingPatientId(patient.id);
    setPatientForm({ name: patient.name, email: patient.email || '', password: '', gender: patient.gender || 'Male', address: patient.address || '' });
  };

  const handlePatientDelete = async (id) => {
    try {
      await api.delete(`/patients/${id}`, { headers: getAuthHeaders() });
      setMessage('Patient deleted');
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not delete patient');
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" links={[{ to: '/admin', label: 'Overview' }]}> 
      <div className="lg:flex lg:gap-6">
        <Sidebar />

        <div className="w-full">
          <TopNav />

          <section className="mb-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Patients" value={totalPatients} icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 21a9 9 0 0118 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} trend="+6% since last month" />
              <StatCard title="Total Doctors" value={totalDoctors} icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 21a9 9 0 0118 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} trend="+2%" />
              <StatCard title="Today's Appointments" value={todaysAppointments} icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M8 7V3M16 7V3M3 11h18" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} trend="+12%" />
              <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 1v22" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} trend="+9%" />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Monthly Revenue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Patient Gender</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Male', value: 60 }, { name: 'Female', value: 40 }]} dataKey="value" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                      <Cell fill="#06b6d4" />
                      <Cell fill="#7c3aed" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Appointments</h3>
                <div className="flex items-center gap-2">
                  <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={appointmentFilters.status} onChange={(e) => setAppointmentFilters({ ...appointmentFilters, status: e.target.value })}>
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <input className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Date" value={appointmentFilters.date} onChange={(e) => setAppointmentFilters({ ...appointmentFilters, date: e.target.value })} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="px-3 py-2">Patient</th>
                      <th className="px-3 py-2">Doctor</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-slate-800 hover:bg-slate-900/40">
                        <td className="px-3 py-2">{appointment.patient_name}</td>
                        <td className="px-3 py-2">{appointment.doctor_name}</td>
                        <td className="px-3 py-2">{appointment.department || '-'}</td>
                        <td className="px-3 py-2">{appointment.date}</td>
                        <td className="px-3 py-2">{appointment.time}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs ${appointment.status === 'completed' ? 'bg-emerald-600 text-white' : appointment.status === 'pending' ? 'bg-yellow-500 text-black' : appointment.status === 'cancelled' ? 'bg-rose-600 text-white' : 'bg-sky-600 text-white'}`}>{appointment.status}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => alert('View')} className="rounded bg-slate-800 px-2 py-1 text-sm">View</button>
                            <button onClick={() => alert('Edit')} className="rounded bg-amber-600 px-2 py-1 text-sm">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Activity Timeline</h3>
              <div className="space-y-3">
                {[...patients.slice(0,3)].map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mt-2" />
                    <div>
                      <div className="text-sm font-medium">Patient Registered</div>
                      <div className="text-xs text-slate-400">{p.name} registered.</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold">Quick Actions</h4>
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-lg bg-cyan-600 px-3 py-2 text-sm">+ Add Patient</button>
                    <button className="rounded-lg bg-sky-500 px-3 py-2 text-sm">+ Add Doctor</button>
                    <button className="rounded-lg bg-amber-500 px-3 py-2 text-sm">+ Book Appointment</button>
                    <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm">+ Admit Patient</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Doctor Availability</h3>
              <div className="space-y-2">
                {doctors.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-sm text-slate-400">{d.specialization}</div>
                    </div>
                    <div className="text-sm text-slate-200">Available</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Bed Management</h3>
              <div className="space-y-2">
                <div>Total Beds: <strong>{beds.total}</strong></div>
                <div>Occupied: <strong>{beds.occupied}</strong></div>
                <div>Available: <strong>{beds.total - beds.occupied}</strong></div>
                <div>ICU Beds: <strong>{beds.icu}</strong></div>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-cyan-500" style={{ width: `${(beds.occupied / beds.total) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Medicine Inventory</h3>
              <div className="space-y-2">
                {inventory.map((m) => (
                  <div key={m.id} className={`flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2 ${m.stock <= lowStockThreshold ? 'ring-2 ring-rose-600' : ''}`}>
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-slate-400">Expiry: {m.expiry}</div>
                    </div>
                    <div className="text-sm">{m.stock}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Keep existing manage forms lower to preserve functionality */}
          <section className="mt-8">
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-4 text-lg font-semibold">Manage Doctors (Legacy)</h3>
                <form onSubmit={handleDoctorSubmit} className="space-y-3">
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Name" value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Password" type="password" value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })} />
                  <button className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">{editingDoctorId ? 'Update Doctor' : 'Add Doctor'}</button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-4 text-lg font-semibold">Manage Patients (Legacy)</h3>
                <form onSubmit={handlePatientSubmit} className="space-y-3">
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Name" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Email" value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Password" type="password" value={patientForm.password} onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Gender" value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} />
                  <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Address" value={patientForm.address} onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })} />
                  <button className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500">{editingPatientId ? 'Update Patient' : 'Add Patient'}</button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function App() {
  const { auth } = useAuth();
  const token = auth?.token;
  const user = auth?.user || {};

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/patient-dashboard" element={token ? <PatientDashboard /> : <Navigate to="/login" />} />
        <Route path="/appointments" element={token ? <PatientDashboard /> : <Navigate to="/login" />} />
        <Route path="/records" element={token ? <RecordsPage /> : <Navigate to="/login" />} />
        <Route path="/prescriptions" element={token ? <PrescriptionsPage /> : <Navigate to="/login" />} />
        <Route path="/pay" element={token ? <PaymentPage /> : <Navigate to="/login" />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/*" element={<DoctorLayout />}>
          <Route index element={<DoctorPanelDashboard />} />
          <Route path="dashboard" element={<DoctorPanelDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
        <Route path="/admin/dashboard" element={token && user.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/patients" element={token && user.role === 'admin' ? <AdminPatientsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/doctors" element={token && user.role === 'admin' ? <AdminDoctorsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/appointments" element={token && user.role === 'admin' ? <AdminAppointmentsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/departments" element={token && user.role === 'admin' ? <AdminDepartmentsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/pharmacy" element={token && user.role === 'admin' ? <AdminPharmacyPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/laboratory" element={token && user.role === 'admin' ? <AdminLaboratoryPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/billing" element={token && user.role === 'admin' ? <AdminBillingPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/staff" element={token && user.role === 'admin' ? <AdminStaffPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/reports" element={token && user.role === 'admin' ? <AdminReportsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/inventory" element={token && user.role === 'admin' ? <AdminInventoryPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/settings" element={token && user.role === 'admin' ? <AdminSettingsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<div className="min-h-screen p-8 bg-slate-950 text-slate-100">App is running — no matching route.</div>} />
      </Routes>
      </React.Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
export { AuthProvider };
