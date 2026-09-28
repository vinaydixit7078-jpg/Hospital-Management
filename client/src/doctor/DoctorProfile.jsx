import { useState } from 'react';

export default function DoctorProfile(){
  const stored = JSON.parse(localStorage.getItem('doctor')||'null') || { id:null, name:'Doctor', specialty:'General Medicine', department:'General Medicine', phone:'', email:'', bio:'', years:0 };
  const [form, setForm] = useState(stored);
  const [message, setMessage] = useState('');

  function save(e){
    e.preventDefault();
    try{ localStorage.setItem('doctor', JSON.stringify(form)); setMessage('Saved'); }catch(e){ setMessage('Could not save'); }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      <form onSubmit={save} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 max-w-xl">
        <label className="block text-sm text-slate-300">Name</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />

        <label className="block text-sm text-slate-300">Specialty</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})} />

        <label className="block text-sm text-slate-300">Department</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />

        <label className="block text-sm text-slate-300">Phone</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />

        <label className="block text-sm text-slate-300">Email</label>
        <input className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />

        <label className="block text-sm text-slate-300">Bio</label>
        <textarea className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />

        <label className="block text-sm text-slate-300">Years of experience</label>
        <input type="number" className="mb-3 w-40 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" value={form.years} onChange={e=>setForm({...form,years:Number(e.target.value)})} />

        <div className="mt-4 flex gap-2">
          <button className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">Save</button>
          <div className="text-sm text-slate-400">{message}</div>
        </div>
      </form>
    </div>
  );
}
