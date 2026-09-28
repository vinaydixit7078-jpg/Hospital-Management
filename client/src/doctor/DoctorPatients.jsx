import { useState } from 'react';

const SAMPLE_PATIENTS = [
  { id: 'p1', fullName: 'John Doe', age: 34, gender: 'Male', lastVisit: '2026-07-28' },
  { id: 'p2', fullName: 'Mary Smith', age: 28, gender: 'Female', lastVisit: '2026-07-30' },
  { id: 'p3', fullName: 'Carlos Ruiz', age: 46, gender: 'Male', lastVisit: '2026-07-25' },
  { id: 'p4', fullName: 'Aisha Khan', age: 52, gender: 'Female', lastVisit: '2026-07-20' }
];

export default function DoctorPatients(){
  const [patients] = useState(SAMPLE_PATIENTS);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Patients</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map(p=> (
          <div key={p.id} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-medium">{p.fullName.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
              <div>
                <div className="font-semibold">{p.fullName}</div>
                <div className="text-sm text-slate-400">{p.age} • {p.gender}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-400">Last visit: {p.lastVisit}</div>
            <div className="mt-4">
              <button className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">View History</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
