import { Link, Outlet, useNavigate, Navigate } from 'react-router-dom';

const ACCESS_CODE = 'Jaya';
const TARGET_DOCTOR_NAME = 'Dr. Jaya Srinivasan';

function Sidebar({doctor, onLogout}){
  const items = [
    ['/doctor/dashboard','Dashboard'],
    ['/doctor/appointments','My Appointments'],
    ['/doctor/patients','My Patients'],
    ['/doctor/profile','Profile'],
    ['/doctor/settings','Settings']
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 px-4 pt-6 lg:flex">
      <div className="mb-6 px-2">
        <div className="mb-2 text-2xl font-semibold">City Hospital</div>
        <div className="text-sm text-slate-400">Doctor</div>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(([to,label])=> (
          <Link key={to} to={to} className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800`}>{label}</Link>
        ))}
      </nav>
      <div className="mt-auto px-2">
        <button onClick={onLogout} className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium">Logout</button>
      </div>
    </aside>
  );
}

export default function DoctorLayout(){
  const navigate = useNavigate();
  let doctor = null;
  try{ doctor = JSON.parse(localStorage.getItem('doctor')||'null'); }catch(e){ doctor = null; }
  const savedAccessCode = localStorage.getItem('doctor_access_code');
  const isAllowedDoctor = String(doctor?.name || '').trim().toLowerCase() === TARGET_DOCTOR_NAME.toLowerCase();

  if(!doctor || !doctor.id || !isAllowedDoctor || savedAccessCode !== ACCESS_CODE){
    try { localStorage.removeItem('doctor'); } catch (e) {}
    try { localStorage.removeItem('doctor_access_code'); } catch (e) {}
    return <Navigate to="/doctor/login" replace />;
  }

  const doctorName = doctor.name || 'Doctor';
  const doctorSpecialty = doctor.specialty || 'General Medicine';
  const initials = (doctorName || 'Doctor')
    .split(/\s+/)
    .filter(Boolean)
    .map(s => s[0])
    .slice(0,2)
    .join('') || 'D';

  function logout(){
    try{ localStorage.removeItem('doctor'); localStorage.removeItem('doctor_access_code'); localStorage.removeItem('token'); }catch(e){}
    navigate('/doctor/login');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="lg:flex lg:gap-6">
        <Sidebar doctor={doctor} onLogout={logout} />
        <div className="w-full">
          <div className="sticky top-0 z-40 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="text-sm text-slate-400">Doctor • {doctorName} • Dashboard</div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-400">{doctorName} — {doctorSpecialty}</div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">{initials}</div>
              </div>
            </div>
          </div>
          <main className="mx-auto max-w-6xl p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
