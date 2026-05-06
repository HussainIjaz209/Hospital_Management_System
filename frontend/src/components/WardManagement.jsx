import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Building2, 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MoreVertical,
  Activity,
  ArrowRight,
  Shield,
  Home,
  Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WardManagement = ({ onUpdate }) => {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState('All');
  
  const [wardFormData, setWardFormData] = useState({ name: '', type: 'General', floor: '1', capacity: 10, assignedNurse: '' });
  const [bedFormData, setBedFormData] = useState({ number: '', type: 'General', ward: '', isOccupied: false, patient: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [wardRes, bedRes, patientRes, userRes] = await Promise.all([
        fetch('/api/wards', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/wards/beds', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setWards(await wardRes.json());
      setBeds(await bedRes.json());
      setPatients(await patientRes.json());
      const allUsers = await userRes.json();
      setNurses(allUsers.filter(u => u.role === 'Nurse' || u.role === 'Ward Manager'));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch ward data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveWard = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(wardFormData)
      });
      if (res.ok) {
        setShowWardModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateBed = async (bedId, updates) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/wards/beds/${bedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchData();
        if (onUpdate) onUpdate();
      }
    } catch (err) { console.error(err); }
  };

  const filteredBeds = selectedWard === 'All' ? beds : beds.filter(b => b.ward?._id === selectedWard);

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Hospital Wards...</div>;

  return (
    <div className="space-y-8">
      {/* Header & Quick Stats */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Ward & Bed Management</h2>
          <p className="text-slate-500 mt-1">Real-time occupancy tracking and clinical space allocation.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowWardModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            New Ward
          </button>
        </div>
      </div>

      {/* Ward Occupancy Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wards.map(ward => {
          const wardBeds = beds.filter(b => b.ward?._id === ward._id);
          const occupiedCount = wardBeds.filter(b => b.isOccupied).length;
          const occupancyRate = wardBeds.length > 0 ? Math.round((occupiedCount / wardBeds.length) * 100) : 0;
          
          return (
            <motion.div 
              key={ward._id}
              whileHover={{ y: -5 }}
              className={`rounded-3xl bg-white p-6 shadow-xl border-t-4 transition-all ${
                ward.type === 'ICU' ? 'border-t-rose-500' : 
                ward.type === 'Private' ? 'border-t-amber-500' : 'border-t-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{ward.type} Ward</span>
                <button onClick={() => setSelectedWard(ward._id)} className="text-slate-400 hover:text-indigo-600">
                  <ArrowRight size={16} />
                </button>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{ward.name}</h3>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-bold mb-2">
                  <span className="text-slate-500">Occupancy</span>
                  <span className={occupancyRate > 80 ? 'text-rose-600' : 'text-slate-900'}>{occupancyRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${occupancyRate}%` }}
                    className={`h-full rounded-full ${
                      occupancyRate > 80 ? 'bg-rose-500' : 
                      occupancyRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-slate-400">On Duty Nurse</span>
                    <span className="text-sm font-bold text-slate-700">{ward.assignedNurse?.username || 'Unassigned'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold uppercase text-slate-400">Ward Location</span>
                    <span className="text-sm font-bold text-slate-700">{ward.floor}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Bed Dashboard */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Home size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bed Inventory Dashboard</h3>
              <p className="text-sm text-slate-500">Click a bed to assign a patient or manage status.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1">
            <button 
              onClick={() => setSelectedWard('All')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${selectedWard === 'All' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              All Beds
            </button>
            {wards.map(w => (
              <button 
                key={w._id}
                onClick={() => setSelectedWard(w._id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${selectedWard === w._id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {filteredBeds.map((bed) => (
            <motion.div 
              key={bed._id}
              layout
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                if (bed.isOccupied) {
                  if (window.confirm(`Discharge patient ${bed.patient?.name} from bed ${bed.number}?`)) {
                    handleUpdateBed(bed._id, { isOccupied: false, patient: null });
                  }
                } else {
                  const patientId = window.prompt(`Enter Patient ID to assign to ${bed.number}: (Demo: ${patients[0]?._id})`);
                  if (patientId) handleUpdateBed(bed._id, { isOccupied: true, patient: patientId });
                }
              }}
              className={`relative cursor-pointer overflow-hidden rounded-2xl p-4 transition-all border-2 ${
                bed.isOccupied ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{bed.ward?.name}</span>
                <span className="text-[10px] text-slate-400 italic mb-1">{bed.ward?.floor}</span>
                <BedDouble size={26} className={bed.isOccupied ? 'text-rose-400' : 'text-emerald-400'} />
                <span className="text-sm font-bold text-slate-800">Bed {bed.number}</span>
              </div>
              {bed.type === 'ICU' && (
                <div className="absolute top-2 right-2">
                  <Activity size={14} className="text-rose-500 animate-pulse" />
                </div>
              )}
              {bed.isOccupied && (
                <div className="mt-3 flex flex-col border-t border-rose-100 pt-2 text-center bg-rose-100/50 -mx-4 -mb-4 p-3">
                  <span className="text-xs font-extrabold text-rose-900 uppercase truncate">{bed.patient?.name}</span>
                  <span className="text-xs font-bold text-rose-700">{bed.patient?.gender} • {bed.patient?.age} Years</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-50 pt-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-emerald-100 border border-emerald-200" />
            <span className="text-xs font-bold text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-rose-100 border border-rose-200" />
            <span className="text-xs font-bold text-slate-600">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-rose-400" />
            <span className="text-xs font-bold text-slate-600">ICU Bed</span>
          </div>
        </div>
      </div>

      {/* Ward Modal */}
      <AnimatePresence>
        {showWardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWardModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-900">Create New Ward</h3>
              <form onSubmit={handleSaveWard} className="mt-8 space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Ward Name</label>
                  <input required type="text" value={wardFormData.name} onChange={(e) => setWardFormData({...wardFormData, name: e.target.value})} placeholder="e.g. ICU South" className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Ward Type</label>
                    <select value={wardFormData.type} onChange={(e) => setWardFormData({...wardFormData, type: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600">
                      {['ICU', 'General', 'Private', 'Emergency', 'Pediatric'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Floor</label>
                    <input type="text" value={wardFormData.floor} onChange={(e) => setWardFormData({...wardFormData, floor: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Bed Capacity</label>
                    <input required type="number" value={wardFormData.capacity} onChange={(e) => setWardFormData({...wardFormData, capacity: parseInt(e.target.value)})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Assign Nurse</label>
                    <select value={wardFormData.assignedNurse} onChange={(e) => setWardFormData({...wardFormData, assignedNurse: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600">
                      <option value="">Select Nurse</option>
                      {nurses.map(n => <option key={n._id} value={n._id}>{n.username}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowWardModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg">Initialize Ward</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardManagement;
