import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const getAuthHeaders = () => {
  const authToken = localStorage.getItem('token');
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/patients', label: 'Patients' },
  { to: '/admin/doctors', label: 'Doctors' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/pharmacy', label: 'Pharmacy' },
  { to: '/admin/laboratory', label: 'Laboratory' },
  { to: '/admin/billing', label: 'Billing' },
  { to: '/admin/staff', label: 'Staff' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/settings', label: 'Settings' },
];

const pageTitleMap = {
  dashboard: 'Dashboard',
  patients: 'Patients',
  doctors: 'Doctors',
  appointments: 'Appointments',
  departments: 'Departments',
  pharmacy: 'Pharmacy',
  laboratory: 'Laboratory',
  billing: 'Billing',
  staff: 'Staff',
  reports: 'Reports',
  inventory: 'Inventory',
  settings: 'Settings',
};

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const label = pageTitleMap[segment] || segment;
    const to = '/' + segments.slice(0, index + 1).join('/');
    return { label, to };
  });

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
      <NavLink to="/admin/dashboard" className="text-slate-400 hover:text-white">Admin</NavLink>
      {crumbs.map((crumb, index) => (
        <span key={crumb.to} className="inline-flex items-center gap-2">
          <span>•</span>
          {index === crumbs.length - 1 ? (
            <span className="text-slate-200">{crumb.label}</span>
          ) : (
            <NavLink to={crumb.to} className="hover:text-white">{crumb.label}</NavLink>
          )}
        </span>
      ))}
    </div>
  );
}

function AdminShell({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 md:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              ☰
            </button>
            <div>
              <div className="text-lg font-semibold text-white">City Hospital Admin</div>
              <div className="text-sm text-slate-400">{pageTitle}</div>
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <NavLink to="/" className="rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500 hover:text-white">Switch Site</NavLink>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:items-start">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl md:block md:w-80`}>
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="text-sm font-semibold text-white">Navigation</div>
            <button className="text-slate-400" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-cyan-600 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState({ revenue: [], appointments: [] });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [doctorRes, patientRes, appointmentRes, revenueRes, apptRes] = await Promise.all([
        api.get('/doctors', { headers: getAuthHeaders() }),
        api.get('/patients', { headers: getAuthHeaders() }),
        api.get('/appointments', { headers: getAuthHeaders() }),
        api.get('/analytics/revenue-per-month', { headers: getAuthHeaders() }),
        api.get('/analytics/appointments-per-month', { headers: getAuthHeaders() }),
      ]);
      setDoctors(doctorRes.data || []);
      setPatients(patientRes.data || []);
      setAppointments(appointmentRes.data || []);
      setAnalytics({ revenue: revenueRes.data || [], appointments: apptRes.data || [] });
    } catch (error) {
      setMessage('Unable to load full admin data. Showing cached placeholder values.');
      setDoctors([{ id: 1, name: 'Dr. Mira Sharma', specialization: 'Cardiology' }, { id: 2, name: 'Dr. Amit Patel', specialization: 'Neurology' }]);
      setPatients([{ id: 1, name: 'Rina Desai', gender: 'Female', address: 'Sector 22' }, { id: 2, name: 'Rahul Mehta', gender: 'Male', address: 'Lakeview' }]);
      setAppointments([{ id: 1, patient_name: 'Rina Desai', doctor_name: 'Dr. Mira Sharma', date: '2026-08-01', time: '10:30', status: 'confirmed' }]);
      setAnalytics({ revenue: [{ name: 'Jan', value: 9000 }, { name: 'Feb', value: 12000 }], appointments: [{ name: 'Jan', value: 18 }, { name: 'Feb', value: 22 }] });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = analytics.revenue.reduce((sum, item) => sum + (item.value || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter((appt) => appt.date === today).length;

  return (
    <AdminShell pageTitle="Dashboard">
      <div className="grid gap-6 lg:grid-cols-4">
        <InfoCard title="Patients" value={patients.length} />
        <InfoCard title="Doctors" value={doctors.length} />
        <InfoCard title="Appointments" value={appointments.length} />
        <InfoCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} />
      </div>

      {message && <div className="mt-6 rounded-2xl border border-amber-500 bg-amber-500/10 p-4 text-sm text-amber-200">{message}</div>}

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <MetricCard title="Today" value={`${todayAppointments} visits`} description="Appointments scheduled for today." />
        <MetricCard title="Active Staff" value="28" description="Employees currently on shift." />
        <MetricCard title="Inventory Health" value="Good" description="Low stock alerts monitored." />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <PanelCard title="Revenue Trend">
          <div className="space-y-2 text-sm text-slate-300">
            {analytics.revenue.slice(0, 5).map((item) => (
              <div key={item.name} className="flex justify-between gap-4 border-b border-slate-800/70 py-2">
                <span>{item.name}</span>
                <span className="font-semibold">${item.value?.toLocaleString() ?? 0}</span>
              </div>
            ))}
          </div>
        </PanelCard>
        <PanelCard title="Appointments Trend">
          <div className="space-y-2 text-sm text-slate-300">
            {analytics.appointments.slice(0, 5).map((item) => (
              <div key={item.name} className="flex justify-between gap-4 border-b border-slate-800/70 py-2">
                <span>{item.name}</span>
                <span className="font-semibold">{item.value ?? 0}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>
    </AdminShell>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
      <div className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function MetricCard({ title, value, description }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function PanelCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
      <div className="mb-4 text-lg font-semibold text-white">{title}</div>
      {children}
    </div>
  );
}

function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '', gender: 'Female', address: '' });
  const [message, setMessage] = useState('');
  const pageSize = 6;

  const loadPatients = async () => {
    try {
      const res = await api.get('/patients', { headers: getAuthHeaders() });
      setPatients(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Could not load patients from server.');
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const next = patients.filter((patient) => {
      const matchSearch = `${patient.name} ${patient.email} ${patient.address}`.toLowerCase().includes(lowerSearch);
      const matchGender = genderFilter ? patient.gender === genderFilter : true;
      return matchSearch && matchGender;
    });
    setFiltered(next);
    setPage(1);
  }, [patients, search, genderFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagePatients = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (form.id) {
        await api.put(`/patients/${form.id}`, { name: form.name, email: form.email, password: form.password, gender: form.gender, address: form.address }, { headers: getAuthHeaders() });
        setMessage('Patient updated successfully.');
      } else {
        await api.post('/patients', { name: form.name, email: form.email, password: form.password, gender: form.gender, address: form.address }, { headers: getAuthHeaders() });
        setMessage('Patient added successfully.');
      }
      setForm({ id: null, name: '', email: '', password: '', gender: 'Female', address: '' });
      loadPatients();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving patient.');
    }
  };

  const handleEdit = (patient) => {
    setForm({ id: patient.id, name: patient.name, email: patient.email, password: '', gender: patient.gender, address: patient.address });
    setSelected(patient);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`, { headers: getAuthHeaders() });
      setMessage('Patient removed successfully.');
      setSelected(null);
      loadPatients();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting patient.');
    }
  };

  return (
    <AdminShell pageTitle="Patients">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Patient Directory</h2>
                <p className="text-sm text-slate-400">Search, filter, and manage patient records.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients"
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">All genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagePatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No records found.</td>
                    </tr>
                  ) : (
                    pagePatients.map((patient) => (
                      <tr key={patient.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                        <td className="px-4 py-3">{patient.name}</td>
                        <td className="px-4 py-3">{patient.email}</td>
                        <td className="px-4 py-3">{patient.gender}</td>
                        <td className="px-4 py-3">{patient.address}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleEdit(patient)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Edit</button>
                            <button onClick={() => handleDelete(patient.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                            <button onClick={() => setSelected(patient)} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700">View</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <div>{filtered.length} patients total</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 hover:bg-slate-900"
                >Prev</button>
                <span>Page {page} of {pageCount}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 hover:bg-slate-900"
                >Next</button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{form.id ? 'Edit Patient' : 'Add Patient'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" rows="3" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">{form.id ? 'Update Patient' : 'Create Patient'}</button>
            </form>
          </div>
          {selected && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-4 text-lg font-semibold text-white">Patient details</div>
              <div className="space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-400">Name:</span> {selected.name}</div>
                <div><span className="text-slate-400">Email:</span> {selected.email}</div>
                <div><span className="text-slate-400">Gender:</span> {selected.gender}</div>
                <div><span className="text-slate-400">Address:</span> {selected.address}</div>
                <div><span className="text-slate-400">Patient ID:</span> {selected.id}</div>
              </div>
            </div>
          )}
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '', specialization: '' });
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const loadDoctors = async () => {
    try {
      const res = await api.get('/doctors', { headers: getAuthHeaders() });
      setDoctors(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Could not load doctors.');
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(doctors.filter((doctor) => `${doctor.name} ${doctor.email} ${doctor.specialization}`.toLowerCase().includes(lowerSearch)));
  }, [doctors, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (form.id) {
        await api.put(`/doctors/${form.id}`, { name: form.name, email: form.email, password: form.password, specialization: form.specialization }, { headers: getAuthHeaders() });
        setMessage('Doctor updated successfully.');
      } else {
        await api.post('/doctors', { name: form.name, email: form.email, password: form.password, specialization: form.specialization }, { headers: getAuthHeaders() });
        setMessage('Doctor added successfully.');
      }
      loadDoctors();
      setForm({ id: null, name: '', email: '', password: '', specialization: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save doctor.');
    }
  };

  const handleEdit = (doctor) => {
    setForm({ id: doctor.id, name: doctor.name, email: doctor.email, password: '', specialization: doctor.specialization });
    setSelected(doctor);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`, { headers: getAuthHeaders() });
      setMessage('Doctor deleted successfully.');
      setSelected(null);
      loadDoctors();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not delete doctor.');
    }
  };

  return (
    <AdminShell pageTitle="Doctors">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Doctor Roster</h2>
                <p className="text-sm text-slate-400">Manage doctor profiles, availability, and departments.</p>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors"
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No doctors match this query.</td>
                    </tr>
                  ) : (
                    filtered.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                        <td className="px-4 py-3">{doctor.name}</td>
                        <td className="px-4 py-3">{doctor.email}</td>
                        <td className="px-4 py-3">{doctor.specialization}</td>
                        <td className="px-4 py-3"><span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs text-emerald-300">Available</span></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleEdit(doctor)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Edit</button>
                            <button onClick={() => handleDelete(doctor.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                            <button onClick={() => setSelected(doctor)} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700">View</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{form.id ? 'Edit Doctor' : 'Add Doctor'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">{form.id ? 'Update Doctor' : 'Create Doctor'}</button>
            </form>
          </div>
          {selected && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-4 text-lg font-semibold text-white">Doctor details</div>
              <div className="space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-400">Name:</span> {selected.name}</div>
                <div><span className="text-slate-400">Email:</span> {selected.email}</div>
                <div><span className="text-slate-400">Department:</span> {selected.specialization}</div>
                <div><span className="text-slate-400">Availability:</span> <span className="rounded-full bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300">Available</span></div>
              </div>
            </div>
          )}
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ patient_name: '', doctor_name: '', department: '', date: '', time: '', status: 'pending' });
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    try {
      setMessage('');
      const res = await api.get('/appointments', { headers: getAuthHeaders() });
      setAppointments(res.data || []);
    } catch (error) {
      console.error('Admin appointment load error:', error.response?.data || error.message || error);
      setMessage(error.response?.data?.message || error.message || 'Could not load appointments.');
    }
  };

  useEffect(() => {
    loadAppointments();
    const onAppointmentBooked = () => loadAppointments();
    window.addEventListener('appointmentBooked', onAppointmentBooked);
    return () => window.removeEventListener('appointmentBooked', onAppointmentBooked);
  }, []);

  const filtered = appointments.filter((appointment) => {
    const combined = `${appointment.patient_name} ${appointment.doctor_name} ${appointment.department}`.toLowerCase();
    const matches = combined.includes(search.toLowerCase());
    const statusMatches = statusFilter ? appointment.status === statusFilter : true;
    return matches && statusMatches;
  });

  const handleBook = (event) => {
    event.preventDefault();
    const next = { ...form, id: Date.now(), status: form.status || 'pending' };
    setAppointments((prev) => [next, ...prev]);
    setForm({ patient_name: '', doctor_name: '', department: '', date: '', time: '', status: 'pending' });
    setMessage('Appointment booked locally.');
  };

  const handleStatusChange = (id, nextStatus) => {
    setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? { ...appointment, status: nextStatus } : appointment)));
  };

  const handleCancel = (id) => {
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
  };

  return (
    <AdminShell pageTitle="Appointments">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Appointment Management</h2>
                <p className="text-sm text-slate-400">Search, update status, and cancel bookings.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search appointments"
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={loadAppointments}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 hover:bg-slate-900"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-slate-500">No appointments available.</td>
                    </tr>
                  ) : (
                    filtered.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                        <td className="px-4 py-3">{appointment.patient_name}</td>
                        <td className="px-4 py-3">{appointment.doctor_name}</td>
                        <td className="px-4 py-3">{appointment.department || 'General'}</td>
                        <td className="px-4 py-3">{appointment.date}</td>
                        <td className="px-4 py-3">{appointment.time}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs ${
                            appointment.status === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-400 text-slate-950'
                              : appointment.status === 'cancelled'
                              ? 'bg-rose-600 text-white'
                              : 'bg-sky-600 text-white'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelected(appointment)} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700">View</button>
                            <button onClick={() => handleStatusChange(appointment.id, appointment.status === 'confirmed' ? 'completed' : 'confirmed')} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Toggle</button>
                            <button onClick={() => handleCancel(appointment.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Book New Appointment</h3>
            <form className="space-y-4" onSubmit={handleBook}>
              <input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} placeholder="Doctor name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} type="time" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">Book Appointment</button>
            </form>
          </div>

          {selected && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-4 text-lg font-semibold text-white">Appointment details</div>
              <div className="space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-400">Patient:</span> {selected.patient_name}</div>
                <div><span className="text-slate-400">Doctor:</span> {selected.doctor_name}</div>
                <div><span className="text-slate-400">Date:</span> {selected.date}</div>
                <div><span className="text-slate-400">Time:</span> {selected.time}</div>
                <div><span className="text-slate-400">Status:</span> {selected.status}</div>
              </div>
            </div>
          )}
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Cardiology', doctors: 14, patients: 72 },
    { id: 2, name: 'Neurology', doctors: 9, patients: 46 },
    { id: 3, name: 'Radiology', doctors: 6, patients: 38 },
  ]);
  const [form, setForm] = useState({ id: null, name: '', doctors: '', patients: '' });
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const filtered = departments.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name) {
      setMessage('Department name is required.');
      return;
    }
    if (form.id) {
      setDepartments((prev) => prev.map((item) => (item.id === form.id ? { ...item, ...form, doctors: Number(form.doctors), patients: Number(form.patients) } : item)));
      setMessage('Department updated.');
    } else {
      setDepartments((prev) => [...prev, { ...form, id: Date.now(), doctors: Number(form.doctors), patients: Number(form.patients) }]);
      setMessage('Department added.');
    }
    setForm({ id: null, name: '', doctors: '', patients: '' });
  };

  const handleEdit = (department) => setForm({ ...department });
  const handleDelete = (id) => setDepartments((prev) => prev.filter((item) => item.id !== id));

  return (
    <AdminShell pageTitle="Departments">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Departments</h2>
                <p className="text-sm text-slate-400">Track department size, doctors, and patient load.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Doctors</th>
                    <th className="px-4 py-3">Patients</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((department) => (
                    <tr key={department.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-3">{department.name}</td>
                      <td className="px-4 py-3">{department.doctors}</td>
                      <td className="px-4 py-3">{department.patients}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(department)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Edit</button>
                          <button onClick={() => handleDelete(department.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{form.id ? 'Edit Department' : 'Add Department'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Department name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.doctors} onChange={(e) => setForm({ ...form, doctors: e.target.value })} placeholder="Doctors count" type="number" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.patients} onChange={(e) => setForm({ ...form, patients: e.target.value })} placeholder="Patients count" type="number" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">{form.id ? 'Update Department' : 'Create Department'}</button>
            </form>
          </div>
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminPharmacyPage() {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol 500mg', stock: 120, expiry: '2027-02-01' },
    { id: 2, name: 'Amoxicillin 250mg', stock: 18, expiry: '2026-09-12' },
    { id: 3, name: 'Insulin', stock: 40, expiry: '2026-11-20' },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: null, name: '', stock: '', expiry: '' });
  const [message, setMessage] = useState('');

  const filtered = medicines.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = medicines.filter((item) => item.stock <= 20);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name) {
      setMessage('Medicine name required.');
      return;
    }
    if (form.id) {
      setMedicines((prev) => prev.map((item) => (item.id === form.id ? { ...item, name: form.name, stock: Number(form.stock), expiry: form.expiry } : item)));
      setMessage('Medicine updated.');
    } else {
      setMedicines((prev) => [...prev, { ...form, id: Date.now(), stock: Number(form.stock) }]);
      setMessage('Medicine added.');
    }
    setForm({ id: null, name: '', stock: '', expiry: '' });
  };

  const handleEdit = (medicine) => setForm({ ...medicine });
  const handleDelete = (id) => setMedicines((prev) => prev.filter((item) => item.id !== id));

  return (
    <AdminShell pageTitle="Pharmacy">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Pharmacy Inventory</h2>
                <p className="text-sm text-slate-400">Monitor stock, expiry, and low-stock alerts.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            {lowStock.length > 0 && (
              <div className="mb-4 rounded-2xl bg-rose-600/10 p-4 text-sm text-rose-200">Low stock alert: {lowStock.length} medicine(s) need restocking.</div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Medicine</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((medicine) => (
                    <tr key={medicine.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-3">{medicine.name}</td>
                      <td className={`px-4 py-3 ${medicine.stock <= 20 ? 'text-rose-300' : 'text-slate-300'}`}>{medicine.stock}</td>
                      <td className="px-4 py-3">{medicine.expiry}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(medicine)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Edit</button>
                          <button onClick={() => handleDelete(medicine.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{form.id ? 'Edit Medicine' : 'Add Medicine'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Medicine name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} placeholder="Expiry date" type="date" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">{form.id ? 'Update Medicine' : 'Create Medicine'}</button>
            </form>
          </div>
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminLaboratoryPage() {
  const [reports, setReports] = useState([
    { id: 1, patient: 'Rina Desai', doctor: 'Dr. Mira Sharma', status: 'Completed', type: 'Blood Panel', pdf: null },
    { id: 2, patient: 'Rahul Mehta', doctor: 'Dr. Amit Patel', status: 'In review', type: 'X-Ray', pdf: null },
  ]);
  const [upload, setUpload] = useState({ patient: '', doctor: '', type: '', status: 'Pending' });
  const [message, setMessage] = useState('');

  const handleUpload = (event) => {
    event.preventDefault();
    if (!upload.patient || !upload.doctor || !upload.type) {
      setMessage('Complete all fields before upload.');
      return;
    }
    setReports((prev) => [...prev, { ...upload, id: Date.now(), pdf: null }]);
    setUpload({ patient: '', doctor: '', type: '', status: 'Pending' });
    setMessage('Lab report uploaded locally.');
  };

  return (
    <AdminShell pageTitle="Laboratory">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Laboratory Reports</h2>
            <p className="mt-1 text-sm text-slate-400">Upload, monitor status, and download reports.</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Report Type</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Doctor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-3">{report.type}</td>
                      <td className="px-4 py-3">{report.patient}</td>
                      <td className="px-4 py-3">{report.doctor}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs ${report.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-yellow-500 text-black'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a href="#" className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Download PDF</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Upload New Report</h3>
            <form className="space-y-4" onSubmit={handleUpload}>
              <input value={upload.patient} onChange={(e) => setUpload({ ...upload, patient: e.target.value })} placeholder="Patient name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={upload.doctor} onChange={(e) => setUpload({ ...upload, doctor: e.target.value })} placeholder="Doctor name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={upload.type} onChange={(e) => setUpload({ ...upload, type: e.target.value })} placeholder="Report type" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <select value={upload.status} onChange={(e) => setUpload({ ...upload, status: e.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="Pending">Pending</option>
                <option value="In review">In review</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">Upload Report</button>
            </form>
          </div>
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminBillingPage() {
  const [invoices, setInvoices] = useState([
    { id: 1, patient: 'Rina Desai', amount: 420, status: 'Paid', date: '2026-07-25' },
    { id: 2, patient: 'Rahul Mehta', amount: 980, status: 'Pending', date: '2026-07-28' },
  ]);
  const [message, setMessage] = useState('');

  const printInvoice = (invoice) => {
    window.print();
    setMessage(`Printing invoice ${invoice.id}`);
  };

  const exportPdf = () => setMessage('Exported billing summary to PDF.');
  const exportExcel = () => setMessage('Exported billing summary to Excel.');

  return (
    <AdminShell pageTitle="Billing">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <PanelCard title="Payment Status"> <div className="text-sm text-slate-300">Paid invoices: {invoices.filter((item) => item.status === 'Paid').length}</div> </PanelCard>
          <PanelCard title="Outstanding"> <div className="text-sm text-slate-300">Pending invoices: {invoices.filter((item) => item.status === 'Pending').length}</div></PanelCard>
          <PanelCard title="Revenue"> <div className="text-sm text-slate-300">Total billed: ${invoices.reduce((sum, invoice) => sum + invoice.amount, 0)}</div></PanelCard>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Billing Table</h2>
              <p className="text-sm text-slate-400">Track invoice status and print receipts.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={exportPdf} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700">Export PDF</button>
              <button onClick={exportExcel} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700">Export Excel</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                    <td className="px-4 py-3">#{invoice.id}</td>
                    <td className="px-4 py-3">{invoice.patient}</td>
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3">${invoice.amount}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => printInvoice(invoice)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
      </div>
    </AdminShell>
  );
}

function AdminStaffPage() {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Nikita Sharma', role: 'Nurse', shift: 'Morning', attendance: 'Present', salary: '$2,400' },
    { id: 2, name: 'Vikram Singh', role: 'Technician', shift: 'Night', attendance: 'Absent', salary: '$1,900' },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: null, name: '', role: '', shift: '', salary: '' });
  const [message, setMessage] = useState('');

  const filtered = staff.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.role) {
      setMessage('Name and role are required.');
      return;
    }
    if (form.id) {
      setStaff((prev) => prev.map((item) => (item.id === form.id ? { ...item, ...form } : item)));
      setMessage('Staff record updated.');
    } else {
      setStaff((prev) => [...prev, { ...form, id: Date.now(), attendance: 'Present' }]);
      setMessage('Staff member added.');
    }
    setForm({ id: null, name: '', role: '', shift: '', salary: '' });
  };

  const handleEdit = (item) => setForm({ ...item });
  const handleDelete = (id) => setStaff((prev) => prev.filter((item) => item.id !== id));

  return (
    <AdminShell pageTitle="Staff">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Staff Management</h2>
                <p className="text-sm text-slate-400">Track attendance, shift timing, and salary information.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Attendance</th>
                    <th className="px-4 py-3">Salary</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.role}</td>
                      <td className="px-4 py-3">{item.shift}</td>
                      <td className="px-4 py-3">{item.attendance}</td>
                      <td className="px-4 py-3">{item.salary}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(item)} className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-500">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{form.id ? 'Edit Staff' : 'Add Staff'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} placeholder="Shift timing" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Salary" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">{form.id ? 'Update Staff' : 'Add Staff'}</button>
            </form>
          </div>
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminReportsPage() {
  const [range, setRange] = useState('daily');
  const [message, setMessage] = useState('');
  const reports = {
    daily: { title: 'Daily Report', description: 'Patient flow and revenue for today.' },
    weekly: { title: 'Weekly Report', description: 'Seven-day operational summary.' },
    monthly: { title: 'Monthly Report', description: 'Monthly hospital performance.' },
    revenue: { title: 'Revenue Report', description: 'Income and expenses breakdown.' },
  };

  return (
    <AdminShell pageTitle="Reports">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Reports</h2>
                <p className="text-sm text-slate-400">Export patient statistics, revenue, and time-based reports.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['daily', 'weekly', 'monthly', 'revenue'].map((option) => (
                  <button key={option} onClick={() => setRange(option)} className={`rounded-2xl px-4 py-2 text-sm ${range === option ? 'bg-cyan-600 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-900'}`}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-4 text-lg font-semibold text-white">{reports[range].title}</div>
            <p className="text-sm text-slate-400">{reports[range].description}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <PanelCard title="Total Patients"><div className="text-sm text-slate-300">128 patients</div></PanelCard>
              <PanelCard title="Revenue"><div className="text-sm text-slate-300">$24,600</div></PanelCard>
              <PanelCard title="Operations"><div className="text-sm text-slate-300">42 completed</div></PanelCard>
              <PanelCard title="New Admissions"><div className="text-sm text-slate-300">18 admissions</div></PanelCard>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Export Options</h3>
            <div className="space-y-3">
              <button onClick={() => setMessage('PDF exported successfully.')} className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">Export PDF</button>
              <button onClick={() => setMessage('Excel report exported successfully.')} className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-100 hover:bg-slate-700">Export Excel</button>
            </div>
          </div>
          {message && <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminInventoryPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'ECG Machine', stock: 4, vendor: 'MedEquip', maintenance: '2026-09-15' },
    { id: 2, name: 'Ventilator', stock: 8, vendor: 'HealTech', maintenance: '2026-08-01' },
    { id: 3, name: 'Ultrasound', stock: 2, vendor: 'SonoLab', maintenance: '2026-10-05' },
  ]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const filtered = items.filter((item) => `${item.name} ${item.vendor}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell pageTitle="Inventory">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Equipment Inventory</h2>
              <p className="text-sm text-slate-400">Track stock status, vendor details, and maintenance schedules.</p>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-500" />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-950/50">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className={`px-4 py-3 ${item.stock <= 3 ? 'text-rose-300' : 'text-slate-300'}`}>{item.stock}</td>
                    <td className="px-4 py-3">{item.vendor}</td>
                    <td className="px-4 py-3">{item.maintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {message && <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </div>
      </div>
    </AdminShell>
  );
}

function AdminSettingsPage() {
  const [hospital, setHospital] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hospital_settings') || 'null') || { name: 'City Hospital', address: '123 Health Ave, Wellness City', email: 'info@cityhospital.example', phone: '+1 (555) 123-4567', notifications: true, darkMode: true };
    } catch (error) {
      return { name: 'City Hospital', address: '123 Health Ave, Wellness City', email: 'info@cityhospital.example', phone: '+1 (555) 123-4567', notifications: true, darkMode: true };
    }
  });
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@cityhospital.example' });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const saveSettings = () => {
    localStorage.setItem('hospital_settings', JSON.stringify(hospital));
    setMessage('Settings saved successfully.');
  };

  return (
    <AdminShell pageTitle="Settings">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Hospital Information</h2>
            <div className="mt-4 space-y-4">
              <input value={hospital.name} onChange={(e) => setHospital({ ...hospital, name: e.target.value })} placeholder="Hospital name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={hospital.address} onChange={(e) => setHospital({ ...hospital, address: e.target.value })} placeholder="Address" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={hospital.email} onChange={(e) => setHospital({ ...hospital, email: e.target.value })} placeholder="Email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={hospital.phone} onChange={(e) => setHospital({ ...hospital, phone: e.target.value })} placeholder="Phone" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button onClick={saveSettings} className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">Save Hospital Info</button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Admin Profile</h2>
            <div className="mt-4 space-y-4">
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" type="password" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none" />
              <button onClick={() => setMessage('Password changed successfully.')} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-500">Change Password</button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Theme & Notifications</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <div className="font-medium text-white">Dark mode</div>
                  <p className="text-slate-400">Use the dark theme across the admin panel.</p>
                </div>
                <button onClick={() => setHospital((prev) => ({ ...prev, darkMode: !prev.darkMode }))} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-500">Toggle</button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <div className="font-medium text-white">Notifications</div>
                  <p className="text-slate-400">Enable email and system notifications.</p>
                </div>
                <button onClick={() => setHospital((prev) => ({ ...prev, notifications: !prev.notifications }))} className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700">{hospital.notifications ? 'On' : 'Off'}</button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div>
                  <div className="font-medium text-white">Backup Settings</div>
                  <p className="text-slate-400">Schedule automatic configuration backups.</p>
                </div>
                <button onClick={() => setMessage('Backup settings saved.')} className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700">Save</button>
              </div>
            </div>
          </div>
          {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}
        </aside>
      </div>
    </AdminShell>
  );
}

export {
  AdminShell,
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
};
