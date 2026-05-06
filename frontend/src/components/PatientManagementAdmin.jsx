import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Edit3, 
  History, 
  Trash2, 
  FileText, 
  Activity, 
  Calendar,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PatientManagementAdmin = ({ onUpdate }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({});

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPatients(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchHistory = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/records/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Clean up data
      const { _id, __v, createdAt, updatedAt, ...cleanData } = formData;

      const res = await fetch(`/api/patients/${selectedPatient._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cleanData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchPatients();
        if (onUpdate) onUpdate();
      } else {
        alert('Failed to update patient data');
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('An unexpected error occurred during update.');
    }
  };

  const viewHistory = (patient) => {
    setSelectedPatient(patient);
    fetchHistory(patient._id);
    setShowHistoryModal(true);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.contact.includes(search)
  );

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Patient Data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Patient Management</h2>
          <p className="text-slate-500 mt-1">Global view of all registered patients and medical history.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 rounded-2xl bg-white border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Info</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Blood Group</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold uppercase">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">ID: {patient._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="text-slate-700">{patient.gender}, {patient.age} years</p>
                    <p className="text-slate-500">{patient.contact}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                    patient.bloodGroup ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {patient.bloodGroup || 'Not Set'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => viewHistory(patient)}
                      className="p-2 bg-slate-300 rounded-2xl text-slate-900 hover:text-indigo-600 transition-colors"
                      title="Medical History"
                    >
                      Medical History
                    </button>
                    <button 
                      onClick={() => handleEdit(patient)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Edit Patient Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <form onSubmit={handleUpdate} className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                  <input 
                    type="text" value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Age</label>
                  <input 
                    type="number" value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500">Blood Group</label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    <option value="">Unknown</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Contact Number</label>
                  <input 
                    type="text" value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="2"
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="rounded-2xl bg-slate-100 px-8 py-3 font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded-2xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-100">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl h-[80vh] flex flex-col rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Medical History</h3>
                  <p className="text-slate-500 font-medium">{selectedPatient?.name} • ID: {selectedPatient?._id.slice(-6).toUpperCase()}</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p>No medical records found for this patient.</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
                    {history.map((record, i) => (
                      <div key={record._id} className="relative pl-12">
                        <div className="absolute left-4 top-2 h-4 w-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{record.diagnosis}</p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-700">{record.doctor?.name}</p>
                              <p className="text-[10px] text-slate-500">{record.doctor?.specialty}</p>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Treatment</p>
                              <p className="text-xs text-slate-600 mt-1">{record.treatment || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Prescription</p>
                              <p className="text-xs text-slate-600 mt-1">{record.prescription || 'N/A'}</p>
                            </div>
                          </div>
                          {record.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <p className="text-[10px] font-bold uppercase text-slate-400">Additional Notes</p>
                              <p className="text-xs text-slate-500 mt-1 italic">"{record.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientManagementAdmin;
