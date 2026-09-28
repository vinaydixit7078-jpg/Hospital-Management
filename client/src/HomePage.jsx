import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorData } from './data/doctors';
import { diseaseDirectory } from './data/diseaseDirectory';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const matchedSpecializations = diseaseDirectory
    .filter((entry) => entry.terms.some((term) => {
      const normalizedTerm = term.toLowerCase();
      return normalizedTerm.includes(normalizedQuery) || normalizedQuery.includes(normalizedTerm) || tokens.every((token) => normalizedTerm.includes(token));
    }))
    .map((entry) => entry.specialization.toLowerCase());

  const matchingDoctors = normalizedQuery
    ? doctorData.filter((doctor) => doctor.name.toLowerCase().includes(normalizedQuery) || doctor.specialization.toLowerCase().includes(normalizedQuery) || matchedSpecializations.includes(doctor.specialization.toLowerCase()))
    : [];
  const doctors = doctorData.filter((doctor) => {
    if (selectedSpecialization && doctor.specialization !== selectedSpecialization) return false;
    if (!normalizedQuery) return true;
    return doctor.name.toLowerCase().includes(normalizedQuery) || doctor.specialization.toLowerCase().includes(normalizedQuery) || matchedSpecializations.includes(doctor.specialization.toLowerCase());
  });
  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine'];

  useEffect(() => {
    if (normalizedQuery && matchedSpecializations.length) setSelectedSpecialization('');
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="bg-slate-950 px-6 py-2 text-center text-sm text-slate-300">Emergency Contact: +1 (555) 123-4567</div>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
          <Link to="/" className="flex items-center gap-3 text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-xl font-bold text-white">H</span>
            <span><strong className="block text-sm">City Hospital</strong><small className="text-slate-500">Premium care, modern systems</small></span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex"><a href="#departments">Departments</a><a href="#doctors">Doctors</a><a href="#contact">Contact</a></nav>
          <div className="flex items-center gap-3">
            <div className="nav-search hidden sm:block">
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onFocus={() => setShowSearchResults(true)} onBlur={() => setTimeout(() => setShowSearchResults(false), 150)} placeholder="Search disease or doctor" aria-label="Search doctors or diseases" />
              {showSearchResults && matchingDoctors.length > 0 && <div className="search-results">{matchingDoctors.slice(0, 6).map((doctor) => <button type="button" className="item w-full text-left" key={doctor.id} onMouseDown={() => { setSelectedSpecialization(doctor.specialization); setShowSearchResults(false); document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' }); }}><span><strong className="block text-sm text-slate-900">{doctor.name}</strong><small className="text-slate-500">{doctor.specialization}</small></span><small className="text-slate-400">View</small></button>)}</div>}
            </div>
            <Link to="/register" className="btn-primary whitespace-nowrap text-sm">Book Appointment</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-panel mx-auto max-w-7xl px-6 py-20">
          <div className="hero-copy">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-cyan-400">Trusted by 25,000+ Patients</p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">Compassionate care, advanced medicine.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-400">Our hospital combines expert clinicians, modern facilities, and a patient-first approach to deliver exceptional healthcare.</p>
            <Link to="/register" className="mt-8 inline-flex rounded-full bg-cyan-600 px-5 py-3 font-semibold text-slate-950">Book an Appointment</Link>
          </div>
        </section>
        <section id="departments" className="mx-auto max-w-6xl px-6 py-10"><h2 className="text-2xl font-semibold">Departments</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{departments.map((department) => <button type="button" key={department} onClick={() => { setSelectedSpecialization(department); document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-xl border border-slate-800 bg-slate-800 p-5 text-left hover:border-cyan-500"><h3 className="font-semibold">{department}</h3><p className="mt-2 text-sm text-slate-400">Expert care from our specialist team.</p></button>)}</div></section>
        <section id="doctors" className="mx-auto max-w-6xl px-6 py-10"><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">Meet Our Doctors</h2><p className="mt-1 text-sm text-slate-400">Search a disease to find the right specialist.</p></div>{selectedSpecialization && <button type="button" onClick={() => setSelectedSpecialization('')} className="rounded-full border border-slate-700 px-4 py-2 text-sm">Clear filter</button>}</div><div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{doctors.slice(0, 9).map((doctor) => <article key={doctor.id} className="rounded-xl border border-slate-800 bg-slate-800 p-5"><h3 className="font-semibold">{doctor.name}</h3><p className="mt-1 text-sm text-cyan-400">{doctor.specialization}</p><p className="mt-4 text-sm text-slate-400">{doctor.qualification}</p></article>)}</div>{normalizedQuery && doctors.length === 0 && <p className="mt-5 text-slate-400">No related doctors found. Try another disease or symptom.</p>}</section>
        <section id="contact" className="mx-auto max-w-6xl px-6 py-12"><div className="rounded-xl border border-slate-800 bg-slate-800 p-6"><h2 className="font-semibold">Emergency & Contact</h2><p className="mt-2 text-slate-400">123 Health Ave, Wellness City · info@cityhospital.example</p></div></section>
      </main>
    </div>
  );
}
