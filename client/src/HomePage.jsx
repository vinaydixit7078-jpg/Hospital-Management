import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doctorData } from './data/doctors';

const NavIcons = {
  home: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  departments: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  doctors: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 21v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  contact: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 7l8 5 8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  profile: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.5 8.5 1.65 1.65 0 004.17 6.68l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 008.5 4.6 1.65 1.65 0 0010 3H10a2 2 0 014 0h.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 00.33 1.82z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  bell: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null') || {};

  const ADMIN_ACCESS_CODE = '7070'; // replace with secure check or env variable
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  const departments = [
    { key: 'cardio', name: 'Cardiology', emoji: '❤️', desc: 'Heart care and cardiac surgery.' },
    { key: 'neuro', name: 'Neurology', emoji: '🧠', desc: 'Brain and nervous system specialists.' },
    { key: 'pedi', name: 'Pediatrics', emoji: '🧒', desc: 'Healthcare for infants and children.' },
    { key: 'ortho', name: 'Orthopedics', emoji: '🦴', desc: 'Bone, joint and muscle treatments.' },
    { key: 'radio', name: 'Radiology', emoji: '🩻', desc: 'Imaging and diagnostic services.' },
    { key: 'er', name: 'Emergency Care', emoji: '🚑', desc: '24/7 emergency and trauma services.' },
    { key: 'gen', name: 'General Medicine', emoji: '🏥', desc: 'Primary care and internal medicine.' },
    { key: 'derm', name: 'Dermatology', emoji: '🩺', desc: 'Skin care and treatments.' },
  ];

  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('theme');
    const nextLight = savedTheme === 'light';
    setIsLightTheme(nextLight);
    document.documentElement.classList.toggle('light', nextLight);
  }, []);

  const toggleTheme = () => {
    const nextLight = !isLightTheme;
    setIsLightTheme(nextLight);
    document.documentElement.classList.toggle('light', nextLight);
    try {
      localStorage.setItem('theme', nextLight ? 'light' : 'dark');
    } catch (e) {
      // ignore storage errors
    }
  };

  const menuItems = [
    { label: 'Home', href: '#home', key: 'home', icon: NavIcons.home },
    { label: 'Departments', href: '#departments', key: 'departments', icon: NavIcons.departments },
    { label: 'Doctors', href: '#doctors', key: 'doctors', icon: NavIcons.doctors },
    { label: 'Contact', href: '/contact', key: 'contact', icon: NavIcons.contact },
  ];

  const sampleDoctors = doctorData.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
    bio: doctor.qualification,
  }));

  const filteredDoctors = sampleDoctors.filter((doc) => !selectedSpecialization || doc.specialization === selectedSpecialization);
  const visibleDoctors = showAllDoctors ? filteredDoctors : filteredDoctors.slice(0, 5);
  const extraDoctorsCount = Math.max(0, filteredDoctors.length - 5);
  const [activeSection, setActiveSection] = useState('home');
  const profileName = (user.name || 'Admin').trim() || 'Admin';
  const profileInitial = profileName.charAt(0).toUpperCase();

  useEffect(() => {
    const updateActive = () => {
      const hash = window.location.hash || '#home';
      const section = hash.replace('#', '') || 'home';
      setActiveSection(['home', 'departments', 'doctors', 'contact'].includes(section) ? section : 'home');
    };
    updateActive();
    window.addEventListener('hashchange', updateActive);
    return () => window.removeEventListener('hashchange', updateActive);
  }, []);

  const handleAdminDashboardClick = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_secret') === 'true' && storedUser?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setAdminCodeInput('');
      setAdminError('');
      setShowAdminModal(true);
    }
    setProfileOpen(false);
  };

  const submitAdminCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/admin-code-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCodeInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        setAdminError(data.message || 'Invalid code');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('admin_secret', 'true');
      sessionStorage.setItem('admin_name', data.user.name);
      window.dispatchEvent(new Event('adminSecretChanged'));
      setShowAdminModal(false);
      navigate('/admin/dashboard');
    } catch (error) {
      setAdminError('Unable to connect to the hospital server. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileOpen(false);
    navigate('/login');
  };

  const handleNotifications = () => {
    setProfileOpen(false);
    window.alert('No new notifications at this time.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-500 ease-out">
      {/* Sticky premium nav */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/85 backdrop-blur-xl shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 rounded-3xl border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-base font-semibold text-white shadow-lg shadow-slate-950/20 transition duration-300 hover:border-cyan-400/40 hover:bg-slate-900">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-bold text-white shadow-inner shadow-cyan-500/20">H</span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm text-slate-200">City Hospital</span>
                  <span className="text-xs text-slate-400">Premium care, modern systems</span>
                </span>
              </Link>
            </div>

            <button
              type="button"
              className="inline-flex items-center rounded-3xl border border-slate-700/70 bg-slate-900/70 p-3 text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-900 md:hidden"
              aria-expanded={navOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setNavOpen((current) => !current)}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <div className="hidden items-center gap-1 md:flex">
              {menuItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${activeSection === item.key ? 'bg-slate-100/10 text-cyan-200 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/15' : 'text-slate-300 hover:text-white hover:bg-slate-900/70'}`}
                  aria-current={activeSection === item.key ? 'page' : undefined}
                >
                  <span className="text-cyan-300">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="pointer-events-none absolute inset-x-0 bottom-1 mx-auto h-0.5 w-full scale-x-0 rounded-full bg-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {!token ? (
                <>
                  <Link to="/login" className="rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-900">Login</Link>
                  <Link to="/register" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30">Register</Link>
                </>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                >
                  <span>{NavIcons.calendar}</span>
                  Book an Appointment
                </Link>
              )}

              <button
                type="button"
                onClick={toggleTheme}
                className="group inline-flex items-center rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition duration-300 hover:border-cyan-400/40 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                aria-label="Toggle light and dark mode"
              >
                <span className="mr-2 text-cyan-300 transition duration-300 group-hover:text-white">{isLightTheme ? '🌞' : '🌙'}</span>
                <span className="hidden sm:inline">{isLightTheme ? 'Light' : 'Dark'}</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleAdminDashboardClick}
                  className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300 transition hover:border-cyan-400/40 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                >
                  ADMIN
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={handleAdminDashboardClick}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      >
                        <span className="text-cyan-300">{NavIcons.home}</span>
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/admin/dashboard');
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      >
                        <span className="text-cyan-300">{NavIcons.profile}</span>
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/admin/settings');
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      >
                        <span className="text-cyan-300">{NavIcons.settings}</span>
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={handleNotifications}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                      >
                        <span className="text-cyan-300">{NavIcons.bell}</span>
                        Notifications
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-slate-800"
                      >
                        <span className="text-rose-400">{NavIcons.logout}</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`overflow-hidden transition-all duration-500 md:hidden ${navOpen ? 'max-h-72' : 'max-h-0'}`}>
            <nav className="space-y-2 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              {menuItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition duration-300 ${activeSection === item.key ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'}`}
                  onClick={() => setNavOpen(false)}
                >
                  <span className="text-cyan-300">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Admin code modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Admin Access</h3>
            <p className="mb-4 text-sm text-slate-400">Enter the admin access code to view the admin panel.</p>
            <input
              autoFocus
              value={adminCodeInput}
              onChange={(e) => setAdminCodeInput(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              placeholder="Access code"
              type="password"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitAdminCode();
                }
              }}
            />
            {adminError && <div className="mb-2 text-sm text-rose-400">{adminError}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAdminModal(false); setAdminError(''); }} className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1 text-sm">Cancel</button>
              <button
                onClick={submitAdminCode}
                className="rounded-full bg-rose-600 px-4 py-1 text-sm font-medium text-white hover:bg-rose-500"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section id="home" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold leading-tight lg:text-5xl">Compassionate care, advanced medicine.</h1>
            <p className="mt-4 text-lg text-slate-400">Our hospital combines expert clinicians, modern facilities, and a patient-first approach to deliver exceptional healthcare.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500">Book an Appointment</Link>
              <button onClick={() => alert('Emergency: Call +1 (555) 123-4567')} className="rounded-md border border-slate-800 bg-slate-800/60 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800">Emergency Contact: +1 (555) 123-4567</button>
            </div>

            <div className="mt-8 flex items-center gap-4">
              {/* Subtle animated pulse-line SVG */}
              <svg className="h-10 w-40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <path d="M0 24 L30 24 L38 12 L46 36 L58 4 L70 24 L200 24" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
                </path>
              </svg>
              <div className="text-sm text-slate-400">Open 24/7 • Board-certified specialists • Modern facilities</div>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Quick Facts</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-slate-400">Departments</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="text-2xl font-bold text-white">48</div>
                  <div className="text-xs text-slate-400">Doctors</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="text-2xl font-bold text-white">25,000+</div>
                  <div className="text-xs text-slate-400">Patients Served</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="text-2xl font-bold text-white">30</div>
                  <div className="text-xs text-slate-400">Years of Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-4 text-2xl font-semibold">Departments & Services</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {departments.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setSelectedSpecialization(d.name)}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-cyan-400 hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-xl text-slate-100">
                  {d.emoji}
                </div>
                <div>
                  <div className="font-semibold text-white">{d.name}</div>
                  <div className="text-sm text-slate-300">{d.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Doctors preview */}
      <section id="doctors" className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Meet Our Doctors</h2>
            <p className="mt-1 text-sm text-slate-400">Click a department to filter doctors by specialization.</p>
          </div>
          {selectedSpecialization ? (
            <button
              type="button"
              onClick={() => setSelectedSpecialization('')}
              className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400"
            >
              Clear filter
            </button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {visibleDoctors.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-white">{doc.name}</div>
                  <div className="text-sm text-slate-400">{doc.specialization}</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-xl text-slate-100">{doc.name[0]}</div>
              </div>
              <p className="text-sm text-slate-300">{doc.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Book</span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Consult</span>
              </div>
            </div>
          ))}
        </div>
        {extraDoctorsCount > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAllDoctors((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              <span>{showAllDoctors ? 'Show fewer doctors' : `Show ${extraDoctorsCount} more doctors`}</span>
              <svg className={`h-4 w-4 transition-transform ${showAllDoctors ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Emergency / contact banner */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold">Emergency & Contact</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {(() => {
              let contact = { address: '123 Health Ave, Wellness City', phone: '+1 (555) 123-4567', email: 'info@cityhospital.example', hours: 'Mon–Sun: 24 hours' };
              try {
                contact = JSON.parse(localStorage.getItem('hospital_contact') || 'null') || contact;
              } catch (e) {}
              return (
                <>
                  <div>
                    <div className="text-sm text-slate-400">Address</div>
                    <div className="mt-1">{contact.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Phone</div>
                    <div className="mt-1">{contact.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Email</div>
                    <div className="mt-1">{contact.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Hours</div>
                    <div className="mt-1">{contact.hours}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="font-semibold">City Hospital</div>
              <div className="text-sm text-slate-400">Trusted healthcare for our community.</div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/" className="text-sm hover:text-cyan-400">Home</Link>
              <a href="#departments" className="text-sm hover:text-cyan-400">Departments</a>
              <a href="#doctors" className="text-sm hover:text-cyan-400">Doctors</a>
              <Link to="/login" className="text-sm hover:text-cyan-400">Login</Link>
              <Link to="/register" className="text-sm hover:text-cyan-400">Register</Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">© {new Date().getFullYear()} City Hospital. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
