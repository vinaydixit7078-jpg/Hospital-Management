import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role !== 'admin') {
        setMessage('Only admin users may sign in here.');
        return;
      }
      login({ token: res.data.token, user: res.data.user });
      navigate('/admin/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  };

  const handleAdminCode = async (event) => {
    event.preventDefault();
    if (!code) {
      setMessage('Admin access code is required.');
      return;
    }

    try {
      const res = await api.post('/auth/admin-code-login', { code });
      login({ token: res.data.token, user: res.data.user });
      navigate('/admin/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Admin code login failed.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
            <h1 className="text-3xl font-semibold text-white">Admin Login</h1>
            <p className="mt-3 text-sm text-slate-400">Use your admin email and password, or the secure admin access code.</p>
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-2 text-sm text-rose-400">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-500">
                Sign in as Admin
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
            <h2 className="text-xl font-semibold text-white">Admin access code</h2>
            <p className="mt-3 text-sm text-slate-400">If you have the admin access code, use it here to log in without a user account.</p>
            <form onSubmit={handleAdminCode} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300">Access code</label>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                  placeholder="Enter admin code"
                  type="password"
                />
              </div>
              <button type="submit" className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200">
                Use access code
              </button>
            </form>
          </section>
        </div>

        {message && <div className="mt-6 rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</div>}

        <p className="mt-6 text-center text-sm text-slate-400">
          Not an admin? <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">Use regular login</Link>
        </p>
      </div>
    </div>
  );
}
