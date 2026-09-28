import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const toTitleCase = (value = '') => {
  const lower = String(value).toLowerCase();
  if (!lower) return 'Pending';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const statusStyles = {
  Confirmed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Completed: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  Cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

export default function DoctorPanelDashboard(){
  const doctor = JSON.parse(localStorage.getItem('doctor')||'null') || { id: null, name: 'Doctor', specialty: 'General Medicine' };
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAppointments = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/appointments/doctor/live/${doctor.id}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
      setLastUpdated(new Date());
      setSyncError('');
    } catch (error) {
      setSyncError('Live data is temporarily unavailable. Showing the last synced schedule.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();

    const intervalId = window.setInterval(loadAppointments, 5000);
    const reloadOnBook = () => loadAppointments();
    window.addEventListener('appointmentBooked', reloadOnBook);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('appointmentBooked', reloadOnBook);
    };
  }, [doctor.id]);

  const todayDate = getLocalDateKey();

  const todayAppointments = useMemo(
    () => appointments
      .filter((item) => item.date === todayDate)
      .sort((a, b) => String(a.time).localeCompare(String(b.time))),
    [appointments, todayDate]
  );

  const pendingCount = useMemo(
    () => appointments.filter((item) => String(item.status).toLowerCase() === 'pending').length,
    [appointments]
  );

  const uniquePatientsCount = useMemo(
    () => new Set(appointments.map((item) => item.patient_id)).size,
    [appointments]
  );

  const completedWeekCount = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    return appointments.filter((item) => {
      if (String(item.status).toLowerCase() !== 'completed') return false;
      const visitDate = new Date(`${item.date}T${item.time || '00:00'}`);
      return visitDate >= weekStart && visitDate <= now;
    }).length;
  }, [appointments]);

  return (
    <div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-slate-400 mt-1">Welcome back, {doctor.name}</div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <button type="button" onClick={loadAppointments} disabled={refreshing} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-cyan-300 transition hover:border-cyan-400 disabled:cursor-wait disabled:opacity-50">
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={syncError ? 'text-amber-300' : 'text-emerald-300'}>
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
          {syncError || 'Live schedule connected'}
        </span>
        <span className="text-slate-500">
          {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}` : 'Waiting for first sync'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="text-xs uppercase text-slate-400">Today's Appointments</div>
          <div className="mt-2 text-2xl font-bold">{todayAppointments.length}</div>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="text-xs uppercase text-slate-400">Total Patients</div>
          <div className="mt-2 text-2xl font-bold">{uniquePatientsCount}</div>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="text-xs uppercase text-slate-400">Pending Appointments</div>
          <div className="mt-2 text-2xl font-bold">{pendingCount}</div>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="text-xs uppercase text-slate-400">Completed This Week</div>
          <div className="mt-2 text-2xl font-bold">{completedWeekCount}</div>
        </div>
      </div>

      <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Today's Schedule</h3>
          <Link to="/doctor/appointments" className="text-cyan-400">View all</Link>
        </div>
        <ul className="mt-3 space-y-2">
          {!loading && todayAppointments.length === 0 && (
            <li className="rounded-md border border-slate-800/50 p-3 text-sm text-slate-400">No appointments booked for today yet.</li>
          )}
          {loading && (
            <li className="rounded-md border border-slate-800/50 p-3 text-sm text-slate-400">Loading appointments...</li>
          )}
          {todayAppointments.map(a=> (
            <li key={a.id} className="flex items-center justify-between rounded-md border border-slate-800/50 p-3">
              <div className="flex items-center gap-3">
                <div className="font-medium">{a.time}</div>
                <div className="text-sm text-slate-300">{a.patient_name || 'Unknown Patient'}</div>
              </div>
              <div className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[toTitleCase(a.status)] || 'border-slate-700 bg-slate-800 text-slate-300'}`}>
                {toTitleCase(a.status)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
