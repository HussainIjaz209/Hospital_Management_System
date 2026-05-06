import { useState } from 'react';

const initialState = {
  name: '',
  age: '',
  gender: 'Male',
  contact: '',
  notes: ''
};

export default function PatientForm({ onSaved }) {
  const [patient, setPatient] = useState(initialState);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...patient,
          age: Number(patient.age)
        })
      });
      setPatient(initialState);
      setError('');
      onSaved();
    } catch (err) {
      setError('Unable to save patient');
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <h3 className="mb-4 text-xl font-semibold text-slate-800">Add New Patient</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Name</span>
            <input
              required
              name="name"
              value={patient.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Age</span>
            <input
              required
              name="age"
              type="number"
              min="0"
              value={patient.age}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-600">Gender</span>
            <select
              name="gender"
              value={patient.gender}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">Contact</span>
            <input
              required
              name="contact"
              value={patient.contact}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-slate-600">Notes</span>
          <textarea
            name="notes"
            value={patient.notes}
            onChange={handleChange}
            rows="3"
            className="mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded-2xl bg-sky-600 px-5 py-3 text-white transition hover:bg-sky-700" type="submit">
          Save Patient
        </button>
      </form>
    </div>
  );
}
