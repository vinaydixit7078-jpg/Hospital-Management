import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ACCESS_CODE = 'Jaya';
const TARGET_DOCTOR_NAME = 'Dr. Jaya Srinivasan';
const JAYA_FALLBACK_PROFILE = {
  id: 23,
  name: TARGET_DOCTOR_NAME,
  email: 'jaya.srinivasan@cityhospital.com',
  specialization: 'Anesthesiology',
};

export default function DoctorLogin() {
  const [doctors, setDoctors] = useState([]);
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/doctors`);
        const doctorList = Array.isArray(res.data) ? res.data : [];
        setDoctors(doctorList);
      } catch (error) {
        setMessage('Unable to load doctors right now.');
      }
    };

    loadDoctors();
  }, []);

  const selectedDoctor = useMemo(() =>
    doctors.find((item) => String(item.name || '').trim().toLowerCase() === TARGET_DOCTOR_NAME.toLowerCase()) || null,
    [doctors]
  );

  function handleSubmit(e) {
    e.preventDefault();

    if (accessCode !== ACCESS_CODE) {
      setMessage('Invalid access code.');
      return;
    }

    const activeDoctor = selectedDoctor || JAYA_FALLBACK_PROFILE;

    const doctorProfile = {
      id: activeDoctor.id,
      email: activeDoctor.email || email,
      name: activeDoctor.name,
      specialty: activeDoctor.specialization || 'General Medicine',
      token: 'doctor-token'
    };

    localStorage.setItem('doctor', JSON.stringify(doctorProfile));
    localStorage.setItem('doctor_access_code', ACCESS_CODE);
    navigate('/doctor/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Doctor Login</h2>
        <p className="mb-4 text-sm text-slate-300">Authorized doctor: {TARGET_DOCTOR_NAME}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-200 mb-1">Access Code</label>
            <input
              type="password"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="Enter code"
              className="w-full p-2 border border-slate-700 rounded bg-slate-900 text-white"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Login
          </button>

          {message && <p className="text-sm text-rose-300">{message}</p>}

          <p className="mt-4 text-sm text-slate-300">
            Back to <Link to="/" className="text-blue-400 hover:underline">main site</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
