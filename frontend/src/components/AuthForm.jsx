import { useState } from 'react';

const roles = [
  'Admin',
  'Doctor',
  'Receptionist',
  'Lab Technician',
  'Ward Manager',
  'Pharmacist',
  'Billing Specialist',
  'Nurse'
];

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', role: 'Doctor' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to complete request');
        return;
      }

      if (mode === 'login') {
        onLogin(data.token, data.user);
      } else {
        setSuccess('Registration complete. You can now log in.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
            setSuccess('');
          }}
          className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
          type="button"
        >
          {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-slate-600">Email</span>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600">Password</span>
          <input
            required
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </label>

        {mode === 'register' && (
          <label className="block">
            <span className="text-sm text-slate-600">Role</span>
            <select
              required
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <button className="w-full rounded-2xl bg-sky-600 px-5 py-3 text-white hover:bg-sky-700" type="submit">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Available roles</p>
        <p>{roles.join(', ')}</p>
      </div>
    </div>
  );
}
