import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Clock, 
  User, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Calendar, 
  Activity,
  Microscope,
  Pill,
  RotateCcw,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SurgeryManagement = ({ onUpdate }) => {
  const [surgeries, setSurgeries] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'ongoing', 'completed'

  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    operatingTheater: '',
    procedureName: '',
    scheduledDate: '',
    durationMinutes: 60,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [surgeryRes, theaterRes, patientRes, doctorRes, medRes] = await Promise.all([
        fetch('/api/surgeries', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/surgeries/theaters', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/pharmacy', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setSurgeries(await surgeryRes.json());
      setTheaters(await theaterRes.json());
      setPatients(await patientRes.json());
      setDoctors(await doctorRes.json());
      setMedicines(await medRes.json());
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSurgery = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/surgeries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/surgeries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const toggleMedicineReturn = async (surgeryId, medicineUsageId, currentStatus) => {
    // Logic to toggle isReturned in the medicinesUsed array
    const surgery = surgeries.find(s => s._id === surgeryId);
    const updatedMeds = surgery.medicinesUsed.map(m => 
      m._id === medicineUsageId ? { ...m, isReturned: !currentStatus } : m
    );
    
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/surgeries/${surgeryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ medicinesUsed: updatedMeds })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Surgery Schedules...</div>;

  const statusGroups = {
    upcoming: surgeries.filter(s => s.status === 'Scheduled' || s.status === 'Preparation'),
    ongoing: surgeries.filter(s => s.status === 'Ongoing'),
    completed: surgeries.filter(s => s.status === 'Completed' || s.status === 'Post-Op')
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Surgery & OT Management</h2>
          <p className="text-slate-500 mt-1">Schedule procedures, manage Operating Theaters, and track medicine usage.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
        >
          <Plus size={20} />
          Schedule Surgery
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 pb-1">
        {['upcoming', 'ongoing', 'completed'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab} ({statusGroups[tab].length})
          </button>
        ))}
      </div>

      {/* Surgery Cards */}
      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {statusGroups[activeTab].map((surgery) => (
            <motion.div 
              key={surgery._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50"
            >
              <div className="grid gap-8 lg:grid-cols-4">
                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 shadow-inner">
                      <Scissors size={28} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-500">{surgery.procedureName}</span>
                      <h3 className="text-2xl font-bold text-slate-900">{surgery.patient?.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><User size={12} /> {surgery.doctor?.name}</span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Building size={12} /> {surgery.operatingTheater?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Steps */}
                  <div className="flex items-center gap-2 pt-2">
                    {['Scheduled', 'Preparation', 'Ongoing', 'Completed'].map((s, idx) => (
                      <React.Fragment key={s}>
                        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold transition-all ${
                          surgery.status === s ? 'bg-rose-600 text-white shadow-lg' : 
                          surgery.status === 'Completed' || (idx < ['Scheduled', 'Preparation', 'Ongoing', 'Completed'].indexOf(surgery.status)) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {s}
                        </div>
                        {idx < 3 && <div className="h-0.5 w-4 bg-slate-100" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="flex flex-col justify-center border-l border-slate-50 pl-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-slate-400" size={18} />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 leading-none">Date & Time</p>
                        <p className="text-sm font-bold text-slate-700">{new Date(surgery.scheduledDate).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-slate-400" size={18} />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 leading-none">Est. Duration</p>
                        <p className="text-sm font-bold text-slate-700">{surgery.durationMinutes} Minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions / Medicine Tracker */}
                <div className="flex flex-col justify-between border-l border-slate-50 pl-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Inventory Tracking</p>
                    {surgery.medicinesUsed?.length > 0 ? (
                      <div className="space-y-2">
                        {surgery.medicinesUsed.map(m => (
                          <div key={m._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                            <span className="text-[11px] font-bold text-slate-600">{m.medicine?.name}</span>
                            <button 
                              onClick={() => toggleMedicineReturn(surgery._id, m._id, m.isReturned)}
                              className={`rounded-lg px-2 py-1 text-[9px] font-bold transition-all ${m.isReturned ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
                            >
                              {m.isReturned ? 'Returned' : 'In Use'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No medicine logged.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    {surgery.status === 'Scheduled' && <button onClick={() => handleUpdateStatus(surgery._id, 'Preparation')} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg">Start Prep</button>}
                    {surgery.status === 'Preparation' && <button onClick={() => handleUpdateStatus(surgery._id, 'Ongoing')} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-lg animate-pulse">Start Surgery</button>}
                    {surgery.status === 'Ongoing' && <button onClick={() => handleUpdateStatus(surgery._id, 'Completed')} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg">Mark Complete</button>}
                    {surgery.status === 'Completed' && <span className="flex-1 text-center py-2.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">Success</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900">Schedule Procedure</h3>
              <form onSubmit={handleCreateSurgery} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400">Procedure Name</label>
                    <input required type="text" value={formData.procedureName} onChange={(e) => setFormData({...formData, procedureName: e.target.value})} placeholder="e.g. Appendectomy" className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Select Patient</label>
                    <select required value={formData.patient} onChange={(e) => setFormData({...formData, patient: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-600">
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Lead Surgeon</label>
                    <select required value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-600">
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Operating Theater</label>
                    <select required value={formData.operatingTheater} onChange={(e) => setFormData({...formData, operatingTheater: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-600">
                      <option value="">Select OT</option>
                      {theaters.map(t => <option key={t._id} value={t._id}>{t.name} ({t.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Surgery Date & Time</label>
                    <input required type="datetime-local" value={formData.scheduledDate} onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-600" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 rounded-2xl bg-rose-600 py-4 font-bold text-white shadow-lg">Confirm Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurgeryManagement;
