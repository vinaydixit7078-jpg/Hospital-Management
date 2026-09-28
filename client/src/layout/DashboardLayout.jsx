import { Link, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children, title = 'Dashboard', links = [] }) {
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-heading)' }}>
      <nav className="sticky top-0 z-50 px-4 py-3 sm:px-6" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link to="/" className="group inline-flex items-center gap-3 rounded-3xl px-4 py-2 transition" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg,var(--primary),#3b82f6)', color: '#fff', fontWeight: 700 }}>H</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{title}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-1 p-1.5 text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem' }}>
            <Link
              to="/"
              className="rounded-full px-4 py-2 font-medium transition"
              style={{ color: 'var(--text-body)' }}
            >
              Home
            </Link>
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full px-4 py-2 font-medium transition"
                  style={isActive ? { background: 'rgba(14,165,233,0.12)', color: 'var(--primary)', boxShadow: '0 1px 2px rgba(14,165,233,0.06)' } : { color: 'var(--text-body)' }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
