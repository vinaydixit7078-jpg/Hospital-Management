import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../layout/DashboardLayout';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const toTitleCase = (value = '') => {
  const lower = String(value).toLowerCase();
  if (!lower) return 'Pending';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

function StatusBadge({ status }) {
  const base = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';
  const map = {
    Confirmed: 'bg-emerald-600 text-white',
    Pending: 'bg-yellow-400 text-slate-950',
    Completed: 'bg-emerald-600 text-white',
    Cancelled: 'bg-rose-600 text-white',
  };
  return <span className={`${base} ${map[status] || map.Pending}`}>{status}</span>;
}

export default function DoctorAppointments() {
  const doctor = JSON.parse(localStorage.getItem('doctor') || 'null') || { id: null, name: 'Doctor', specialty: 'General Medicine' };
  const [items, setItems] = useState([]);
  const [notesById, setNotesById] = useState({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Today');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    if (!doctor.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BACKEND_URL}/api/appointments/doctor/live/${doctor.id}`);
      const mapped = (Array.isArray(res.data) ? res.data : []).map((item) => ({
        appointmentId: item.id,
        id: item.id,
        date: item.date,
        time: item.time,
        status: toTitleCase(item.status),
        type: 'In-person',
        reasonForVisit: item.reason_for_visit || 'General consultation',
        notes: notesById[item.id] || '',
        patient: {
          fullName: item.patient_name || 'Unknown Patient',
          age: item.patient_age || '--',
          gender: item.patient_gender || '--',
          phone: item.patient_phone || '--',
          email: item.patient_email || '--',
          medicalHistory: {
            allergies: [],
            chronicConditions: [],
          },
        },
      }));

      setItems(mapped);
      setMessage('');
    } catch (error) {
      setItems([]);
      setMessage('Unable to load live appointments right now.');
    } finally {
      setLoading(false);
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

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (statusFilter !== 'All' && item.status !== statusFilter) return false;
        if (query && !item.patient.fullName.toLowerCase().includes(query.toLowerCase())) return false;

        if (dateFilter === 'Today') {
          const today = new Date().toISOString().slice(0, 10);
          if (item.date !== today) return false;
        }

        if (dateFilter === 'This Week') {
          const now = new Date();
          const end = new Date();
          end.setDate(now.getDate() + 7);
          const visit = new Date(`${item.date}T${item.time || '00:00'}`);
          if (visit < now || visit > end) return false;
        }

        return true;
      }),
    [items, statusFilter, query, dateFilter]
  );

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function updateStatus(id, status) {
    try {
      await axios.put(`${BACKEND_URL}/api/appointments/doctor/live/${id}/status`, {
        status: status.toLowerCase(),
      });
      setItems((prev) => prev.map((item) => (item.appointmentId === id ? { ...item, status } : item)));
    } catch (error) {
      setMessage('Could not update appointment status.');
    }
  }

  function addConsultationNote(id, note) {
    setNotesById((prev) => ({
      ...prev,
      [id]: (prev[id] ? `${prev[id]}\n` : '') + note,
    }));

    setItems((prev) =>
      prev.map((item) =>
        item.appointmentId === id
          ? {
              ...item,
              notes: (item.notes ? `${item.notes}\n` : '') + note,
            }
          : item
      )
    );
  }

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    return {
      today: items.filter((item) => item.date === today).length,
      pending: items.filter((item) => item.status === 'Pending').length,
      completedWeek: items.filter((item) => {
        if (item.status !== 'Completed') return false;
        const visitDate = new Date(`${item.date}T${item.time || '00:00'}`);
        return visitDate >= weekStart && visitDate <= now;
      }).length,
    };
  }, [items]);

  return (
    <DashboardLayout title="Doctor Appointments" links={[{ to: '/doctor/appointments', label: 'Appointments' }]}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <div className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="text-sm text-slate-300">{doctor.name} - {doctor.specialty || 'General Medicine'}</div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Today's Appointments</div>
            <div className="mt-2 text-2xl font-bold">{stats.today}</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Pending / Unconfirmed</div>
            <div className="mt-2 text-2xl font-bold">{stats.pending}</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Completed This Week</div>
            <div className="mt-2 text-2xl font-bold">{stats.completedWeek}</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient" className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                <option>All</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                <option>Today</option>
                <option>This Week</option>
                <option>All</option>
              </select>
            </div>
            {message && <div className="text-sm text-rose-300">{message}</div>}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/60">
          {loading && <div className="p-4 text-sm text-slate-400">Loading live appointments...</div>}
          {!loading && filtered.length === 0 && <div className="p-4 text-sm text-slate-400">No appointments found.</div>}

          <table className="min-w-full text-sm hidden md:table">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <>
                  <tr key={item.appointmentId} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-4 py-3 align-top">{item.date}</td>
                    <td className="px-4 py-3 align-top">{item.time}</td>
                    <td className="px-4 py-3 align-top flex items-center gap-3">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-sm">{item.patient.fullName.split(' ').map((value) => value[0]).slice(0, 2).join('')}</div>
                      <div>
                        <div className="font-medium">{item.patient.fullName}</div>
                        <div className="text-xs text-slate-400">{item.patient.age} - {item.patient.gender}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-300 truncate max-w-xl">{item.reasonForVisit}</td>
                    <td className="px-4 py-3 align-top">{item.type}</td>
                    <td className="px-4 py-3 align-top"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 align-top text-right">
                      <button aria-expanded={expanded === item.appointmentId} onClick={() => toggle(item.appointmentId)} className="rounded-full p-2 hover:bg-slate-800/60">{expanded === item.appointmentId ? '?' : '?'}</button>
                    </td>
                  </tr>
                  <tr key={`${item.appointmentId}-detail`} className={expanded === item.appointmentId ? 'bg-slate-900/50 transition-all' : 'hidden'}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-sm text-slate-400">Contact</div>
                          <div className="mt-1 text-sm">{item.patient.phone} - {item.patient.email}</div>
                          <div className="mt-3 text-sm text-slate-400">Medical history</div>
                          <div className="mt-1 text-sm text-slate-300">Allergies: {item.patient.medicalHistory.allergies.length ? item.patient.medicalHistory.allergies.join(', ') : 'None'}</div>
                          <div className="mt-1 text-sm text-slate-300">Chronic: {item.patient.medicalHistory.chronicConditions.length ? item.patient.medicalHistory.chronicConditions.join(', ') : 'None'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Notes</div>
                          <div className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{item.notes || 'No notes'}</div>
                          <div className="mt-4 flex gap-2">
                            <button onClick={() => updateStatus(item.appointmentId, 'Completed')} className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">Mark Completed</button>
                            <button onClick={() => updateStatus(item.appointmentId, 'Cancelled')} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white">Cancel</button>
                            <InlineNote onSave={(note) => { if (note) addConsultationNote(item.appointmentId, note); }} />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>

          <div className="md:hidden space-y-3 p-4">
            {filtered.map((item) => (
              <div key={item.appointmentId} className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-sm">{item.patient.fullName.split(' ').map((value) => value[0]).slice(0, 2).join('')}</div>
                    <div>
                      <div className="font-medium">{item.patient.fullName}</div>
                      <div className="text-xs text-slate-400">{item.date} - {item.time} - {item.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <button aria-expanded={expanded === item.appointmentId} onClick={() => toggle(item.appointmentId)} className="rounded-full p-2 hover:bg-slate-800/60">{expanded === item.appointmentId ? '?' : '?'}</button>
                  </div>
                </div>
                {expanded === item.appointmentId && (
                  <div className="mt-3 text-sm text-slate-300">
                    <div>Phone: {item.patient.phone}</div>
                    <div className="mt-1">Email: {item.patient.email}</div>
                    <div className="mt-2">Notes: {item.notes || 'No notes'}</div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => updateStatus(item.appointmentId, 'Completed')} className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">Mark Completed</button>
                      <button onClick={() => updateStatus(item.appointmentId, 'Cancelled')} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InlineNote({ onSave }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  return (
    <div className="flex items-center gap-2">
      {open ? (
        <div className="flex items-center gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm" />
          <button onClick={() => { onSave(text); setText(''); setOpen(false); }} className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">Add Consultation Notes</button>
      )}
    </div>
  );
}
