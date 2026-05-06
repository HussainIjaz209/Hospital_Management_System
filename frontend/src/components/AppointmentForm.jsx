import { useState } from 'react';

const initialAppointment = {
  patient: '',
  doctor: '',
  date: '',
  reason: ''
};

export default function AppointmentForm({ patients, doctors, onSaved }) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!appointment.patient || !appointment.doctor || !appointment.date) {
      setError('Patient, doctor, and date are required');
      return;
    }

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(appointment)
      });
      setAppointment(initialAppointment);
      setError('');
      onSaved();
    } catch (err) {
      setError('Unable to create appointment');
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mb-4 text-xl font-semibold text-slate-800">Create Appointment</h3>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <select
          required
          name="patient"
          value={appointment.patient}
          onChange={handleChange}
          className="rounded-2xl border border-slate-300 bg-white p-3"
        >
          <option value="">Select Patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>{patient.name}</option>
          ))}
        </select>
        <select
          required
          name="doctor"
          value={appointment.doctor}
          onChange={handleChange}
          className="rounded-2xl border border-slate-300 bg-white p-3"
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>{doc.name} — {doc.specialty}</option>
          ))}
        </select>
        <input
          required
          name="date"
          type="datetime-local"
          value={appointment.date}
          onChange={handleChange}
          className="rounded-2xl border border-slate-300 bg-white p-3"
        />
        <input
          name="reason"
          value={appointment.reason}
          onChange={handleChange}
          placeholder="Reason for visit"
          className="rounded-2xl border border-slate-300 bg-white p-3"
        />
        <div className="sm:col-span-2">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="rounded-2xl bg-sky-600 px-5 py-3 text-white hover:bg-sky-700" type="submit">
            Schedule Appointment
          </button>
        </div>
      </form>
    </div>
  );
}
