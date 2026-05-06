import { useState, useEffect } from 'react';

const initialDoctor = {
  name: '',
  specialty: '',
  phone: '',
  email: '',
  department: ''
};

export default function DoctorList({ doctors, onChange }) {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDepartments(data);
    };
    fetchDepartments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async (event) => {
    event.preventDefault();
    try {
      await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(doctor)
      });
      setDoctor(initialDoctor);
      setError('');
      onChange();
    } catch (err) {
      setError('Unable to save doctor');
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/doctors/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    onChange();
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 p-5">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleAddDoctor}>
        <input
          required
          name="name"
          value={doctor.name}
          onChange={handleChange}
          placeholder="Doctor Name"
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3"
        />
        <input
          required
          name="specialty"
          value={doctor.specialty}
          onChange={handleChange}
          placeholder="Specialty"
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3"
        />
        <input
          required
          name="phone"
          value={doctor.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3"
        />
        <input
          name="email"
          value={doctor.email}
          onChange={handleChange}
          placeholder="Email"
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3"
        />
        <select
          name="department"
          value={doctor.department}
          onChange={handleChange}
          className="rounded-2xl border border-slate-300 bg-slate-50 p-3"
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <div className="sm:col-span-2">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button className="rounded-2xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 font-bold transition-all" type="submit">
            Add Doctor
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {doctors.length === 0 ? (
          <p className="text-slate-600">No doctors added yet.</p>
        ) : (
          doctors.map((doctorItem) => (
            <div key={doctorItem._id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold uppercase">
                    {doctorItem.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-lg">{doctorItem.name}</p>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {doctorItem.department?.name || 'General'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{doctorItem.specialty}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doctorItem._id)}
                  className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <p className="flex items-center gap-1.5"><span className="text-slate-400">P:</span> {doctorItem.phone}</p>
                {doctorItem.email && <p className="flex items-center gap-1.5"><span className="text-slate-400">E:</span> {doctorItem.email}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
