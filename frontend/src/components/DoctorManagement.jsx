import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Clock, 
  DollarSign, 
  Award, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  X,
  Camera,
  Calendar,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorManagement = ({ onUpdate }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    department: '',
    experience: 0,
    consultationFee: 0,
    imageUrl: '',
    availability: []
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [docRes, deptRes] = await Promise.all([
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setDoctors(await docRes.json());
      setDepartments(await deptRes.json());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingDoctor ? 'PUT' : 'POST';
    const url = editingDoctor ? `/api/doctors/${editingDoctor._id}` : '/api/doctors';

    try {
      // Clean up data to avoid Mongoose validation errors on immutable fields
      const { _id, __v, createdAt, updatedAt, ...cleanData } = formData;
      
      // Clean up availability sub-documents
      if (cleanData.availability) {
        cleanData.availability = cleanData.availability.map(({ _id, ...a }) => a);
      }

      // Handle department ID
      if (cleanData.department && typeof cleanData.department === 'object') {
        cleanData.department = cleanData.department._id;
      } else if (cleanData.department === '') {
        cleanData.department = null;
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cleanData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        if (onUpdate) onUpdate();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to save doctor'}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('An unexpected error occurred while saving.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor from the system?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/doctors/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchData();
      if (onUpdate) onUpdate();
    } else {
      alert('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Medical Staff...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Doctor Management</h2>
          <p className="text-slate-500 mt-1">Manage medical professionals, schedules, and service fees.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search doctors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 rounded-2xl bg-white border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>
          <button 
            onClick={() => {
              setEditingDoctor(null);
              setFormData({ name: '', specialty: '', phone: '', email: '', department: '', experience: 0, consultationFee: 0, imageUrl: '', availability: [] });
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doc) => (
          <motion.div 
            key={doc._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-xl transition-all hover:shadow-2xl border border-slate-50"
          >
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-[1.5rem] bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center">
                  {doc.imageUrl ? (
                    <img src={doc.imageUrl} alt={doc.name} className="h-full w-full object-cover" />
                  ) : (
                    <Stethoscope size={32} className="text-indigo-400" />
                  )}
                </div>
                {doc.isOnDuty && (
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 leading-tight">{doc.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      setEditingDoctor(doc);
                      setFormData({...doc, department: doc.department?._id || doc.department || ''});
                      setShowModal(true);
                    }} className="p-1.5 text-slate-400 hover:text-indigo-600">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-indigo-600 mt-1">{doc.specialty}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Building2 size={14} />
                  {doc.department?.name || 'General'}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Award size={12} /> Experience
                </span>
                <span className="mt-1 text-sm font-bold text-slate-900">{doc.experience} Years</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <DollarSign size={12} /> Fee
                </span>
                <span className="mt-1 text-sm font-bold text-indigo-600">${doc.consultationFee}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Clock size={12} /> Availability
              </span>
              <div className="flex flex-wrap gap-2">
                {doc.availability?.length > 0 ? doc.availability.map((a, i) => (
                  <span key={i} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-100 shadow-sm">
                    {a.day.slice(0, 3)} {a.startTime}-{a.endTime}
                  </span>
                )) : (
                  <span className="text-[10px] text-slate-400 italic">Not scheduled</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">{editingDoctor ? 'Edit Doctor Profile' : 'New Doctor Profile'}</h3>
                <button onClick={() => setShowModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X /></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Full Name</label>
                    <input 
                      required type="text" value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Specialization</label>
                    <input 
                      required type="text" value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Department</label>
                    <select 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    >
                      <option value="">General / None</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Experience (Years)</label>
                    <input 
                      type="number" value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Consultation Fee ($)</label>
                    <input 
                      type="number" value={formData.consultationFee}
                      onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value) || 0})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Phone</label>
                    <input 
                      required type="text" value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Email</label>
                    <input 
                      type="email" value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Profile Image URL</label>
                    <input 
                      type="text" value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Clock size={16} /> Set Weekly Availability
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <div key={day} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                        <span className="text-xs font-bold text-slate-600">{day}</span>
                        <div className="flex gap-2">
                          <input 
                            type="time" 
                            className="text-[10px] rounded-lg bg-white p-1 border-none outline-none ring-1 ring-slate-200 focus:ring-indigo-500"
                            onChange={(e) => {
                              const newAvail = [...formData.availability].filter(a => a.day !== day);
                              if (e.target.value) newAvail.push({ day, startTime: e.target.value, endTime: '17:00' });
                              setFormData({...formData, availability: newAvail});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <div className="flex gap-4 pt-8 border-t border-slate-50">
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleSave} className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingDoctor ? 'Update Profile' : 'Complete Registration'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorManagement;
