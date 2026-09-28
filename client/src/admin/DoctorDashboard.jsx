import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// DoctorDashboard
// Single-file component for doctor-facing dashboard
// Matches app visual language (dark, rounded cards, teal accents)

const SAMPLE_APPOINTMENTS = [
  {
    appointmentId: 'a1',
    doctorId: 'd1',
    patient: { id: 'p1', fullName: 'John Doe', age: 34, gender: 'Male', phone: '+1 (555) 101-202', email: 'john@example.com', medicalHistory: 'Hypertension. No known allergies.' },
    date: new Date().toISOString().slice(0,10),
    time: '09:00',
    status: 'Confirmed',
    reasonForVisit: 'Routine checkup / blood pressure follow-up',
    notes: 'Patient requests morning slot; prefers telehealth if possible.',
    type: 'In-person'
  },
  {
    appointmentId: 'a2',
    doctorId: 'd1',
    patient: { id: 'p2', fullName: 'Mary Smith', age: 28, gender: 'Female', phone: '+1 (555) 303-404', email: 'mary@example.com', medicalHistory: 'Asthma. Penicillin allergy.' },
    date: new Date().toISOString().slice(0,10),
    time: '10:30',
    status: 'Pending',
    reasonForVisit: 'Shortness of breath, wheeze',
    notes: '',
    type: 'Video'
  },

  {
    appointmentId: 'a3',
    doctorId: 'd1',
    patient: { id: 'p3', fullName: 'Carlos Ruiz', age: 46, gender: 'Male', phone: '+1 (555) 505-606', email: 'carlos@example.com', medicalHistory: 'Diabetes type II.' },
    date: new Date().toISOString().slice(0,10),
    time: '13:00',
    status: 'Confirmed',
    reasonForVisit: 'Foot numbness and tingling',
    notes: 'Bring prior labs.',
    type: 'In-person'
  },
  {
    appointmentId: 'a4',
    doctorId: 'd1',
    patient: { id: 'p4', fullName: 'Aisha Khan', age: 52, gender: 'Female', phone: '+1 (555) 707-808', email: 'aisha@example.com', medicalHistory: 'None reported.' },
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().slice(0,10),
    time: '11:00',
    status: 'Confirmed',
    reasonForVisit: 'Medication refill',
    notes: '',
    type: 'In-person'
  },
  {
    appointmentId: 'a5',
    doctorId: 'd1',
    patient: { id: 'p5', fullName: 'Liam Nguyen', age: 19, gender: 'Male', phone: '+1 (555) 909-000', email: 'liam@example.com', medicalHistory: 'Peanut allergy.' },
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().slice(0,10),
    time: '15:30',
    status: 'Pending',
    reasonForVisit: 'Sports physical',
    notes: '',
    type: 'In-person'
  }
];

function formatDate(isoDate) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch (e) {
    return isoDate;
  }
}

function formatTime(time) {
  // time in HH:MM (24h) -> locale time
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const base = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';
  const map = {
    Confirmed: 'bg-cyan-500/12 text-cyan-300 border border-cyan-500/30',
    Pending: 'bg-amber-500/12 text-amber-300 border border-amber-500/30',
    Completed: 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/30',
    Cancelled: 'bg-rose-500/12 text-rose-300 border border-rose-500/30'
  };
  return <span className={`${base} ${map[status] || map.Pending}`}>{status}</span>;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState(SAMPLE_APPOINTMENTS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const todayStr = new Date().toISOString().slice(0,10);

  useEffect(() => {
    // placeholder: could fetch real data here
  }, []);

  const todaysAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === todayStr)
      .sort((x,y) => x.time.localeCompare(y.time));
  }, [appointments, todayStr]);

  const totalPatientsSeen = useMemo(() => {
    // count unique patients with Completed status
    const seen = new Set(appointments.filter(a => a.status === 'Completed').map(a => a.patient.id));
    return seen.size;
  }, [appointments]);

  const upcomingWeekCount = useMemo(() => {
    const now = new Date();
    const in7 = new Date(); in7.setDate(now.getDate()+7);
    return appointments.filter(a => new Date(a.date) > now && new Date(a.date) <= in7).length;
  }, [appointments]);

  const pendingCount = useMemo(() => appointments.filter(a => a.status === 'Pending').length, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (query && !a.patient.fullName.toLowerCase().includes(query.toLowerCase())) return false;
      if (startDate && new Date(a.date) < new Date(startDate)) return false;
      if (endDate && new Date(a.date) > new Date(endDate)) return false;
      return true;
    }).sort((x,y) => (x.date + x.time).localeCompare(y.date + y.time));
  }, [appointments, statusFilter, query, startDate, endDate]);

  const upcomingGrouped = useMemo(() => {
    const now = new Date();
    const groups = {};
    for (let i=0;i<7;i++){
      const d = new Date(); d.setDate(now.getDate()+i);
      const key = d.toISOString().slice(0,10);
      groups[key] = [];
    }
    appointments.forEach(a => {
      if (groups[a.date]) groups[a.date].push(a);
    });
    return groups;
  }, [appointments]);

  function openDetails(appt) {
    setSelectedAppt(appt);
  }

  function closeDetails() {
    setSelectedAppt(null);
  }

  function updateStatus(id, status) {
    setAppointments(prev => prev.map(a => a.appointmentId === id ? { ...a, status } : a));
  }

  function addNotes(id, notes) {
    setAppointments(prev => prev.map(a => a.appointmentId === id ? { ...a, notes: (a.notes || '') + '\n' + notes } : a));
  }

  const doctor = { name: 'Amina Patel', specialty: 'Cardiology', avatar: null };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 p-1 shadow-inner">
              <div className="h-full w-full rounded-lg bg-slate-900 flex items-center justify-center text-lg font-bold text-white">AP</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Welcome back,</div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">Dr. {doctor.name}</h2>
                <div className="text-sm text-slate-400">{doctor.specialty}</div>
              </div>
              <div className="text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/doctor/profile" className="rounded-full border border-slate-800/60 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/40">Profile</Link>
            <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20">New Patient</button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Today's Appointments</div>
            <div className="mt-2 text-2xl font-bold text-white">{todaysAppointments.length}</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Total Patients Seen</div>
            <div className="mt-2 text-2xl font-bold text-white">{totalPatientsSeen}</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Upcoming This Week</div>
            <div className="mt-2 text-2xl font-bold text-white">{upcomingWeekCount}</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="text-xs uppercase text-slate-400">Pending Appointments</div>
            <div className="mt-2 text-2xl font-bold text-white">{pendingCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's schedule (main) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Schedule</h3>
              <div className="flex items-center gap-2">
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search patient or appointment" className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:outline-none" />
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                  <option>All</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flow-root">
              <ul className="divide-y divide-slate-800">
                {filteredAppointments.filter(a=>a.date===todayStr).length===0 && (
                  <li className="py-6 text-center text-slate-400">No appointments for today.</li>
                )}
                {filteredAppointments.filter(a=>a.date===todayStr).map(a => (
                  <li key={a.appointmentId} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm text-slate-300">{formatTime(a.time)}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-800 text-sm text-slate-200 flex items-center justify-center">{a.patient.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                          <div>
                            <div className="font-semibold">{a.patient.fullName}</div>
                            <div className="text-sm text-slate-400">{a.reasonForVisit}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={a.status} />
                      <button onClick={()=>openDetails(a)} className="rounded-full border border-slate-800/60 bg-slate-900/50 px-3 py-1 text-sm text-slate-200 hover:border-cyan-400/40">View Details</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: upcoming + calendar-list */}
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <h4 className="text-lg font-semibold">Upcoming (7 days)</h4>
            <div className="mt-3 space-y-3">
              {Object.keys(upcomingGrouped).map(dateKey => (
                <div key={dateKey} className="rounded-md border border-slate-800/50 bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-300">{formatDate(dateKey)}</div>
                    <div className="text-xs text-slate-500">{upcomingGrouped[dateKey].length} appt(s)</div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {upcomingGrouped[dateKey].slice(0,3).map(a=> (
                      <div key={a.appointmentId} className="flex items-center justify-between">
                        <div className="text-sm text-slate-300">{formatTime(a.time)} — {a.patient.fullName}</div>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment detail modal */}
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={closeDetails} />
            <div className="relative z-10 w-full max-w-3xl rounded-xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-400">Appointment</div>
                  <h3 className="text-xl font-bold">{selectedAppt.patient.fullName} — {formatTime(selectedAppt.time)}</h3>
                  <div className="text-sm text-slate-500">{formatDate(selectedAppt.date)} • {selectedAppt.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedAppt.status} />
                  <button onClick={closeDetails} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-3 py-1 text-sm text-slate-200">Close</button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-400">Contact</div>
                  <div className="mt-1 text-sm">{selectedAppt.patient.phone} • {selectedAppt.patient.email}</div>
                  <div className="mt-3 text-xs text-slate-400">Demographics</div>
                  <div className="mt-1 text-sm">{selectedAppt.patient.age} years • {selectedAppt.patient.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Medical History</div>
                  <div className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{selectedAppt.patient.medicalHistory || 'No history available.'}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-400">Reason for visit</div>
                <div className="mt-1 text-sm text-slate-200">{selectedAppt.reasonForVisit}</div>
                {selectedAppt.notes && (
                  <>
                    <div className="text-xs text-slate-400 mt-3">Patient notes</div>
                    <div className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{selectedAppt.notes}</div>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={()=>{updateStatus(selectedAppt.appointmentId,'Completed'); closeDetails();}} className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Mark Completed</button>
                <button onClick={()=>{updateStatus(selectedAppt.appointmentId,'Cancelled'); closeDetails();}} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Cancel</button>
                <button onClick={()=>{ const note = prompt('Add consultation note:'); if(note) addNotes(selectedAppt.appointmentId, note); }} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-4 py-2 text-sm text-slate-200">Add Notes</button>
                <button onClick={()=>{ const nd = prompt('New date (YYYY-MM-DD):'); const nt = prompt('New time (HH:MM):'); if(nd && nt) setAppointments(prev=>prev.map(a=>a.appointmentId===selectedAppt.appointmentId?{...a,date:nd,time:nt}:a)); closeDetails(); }} className="rounded-md border border-slate-800/60 bg-slate-900/50 px-4 py-2 text-sm text-slate-200">Reschedule</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
