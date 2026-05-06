import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Filter, 
  X, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical,
  CalendarDays,
  Search,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentManagement = ({ onUpdate }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDoctor, setFilterDoctor] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    doctor: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [apptRes, docRes] = await Promise.all([
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setAppointments(await apptRes.json());
      setDoctors(await docRes.json());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/appointments/${selectedAppt._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(rescheduleData)
      });
      if (res.ok) {
        setShowRescheduleModal(false);
        fetchData();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Reschedule failed:', err);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchStatus = filterStatus === 'All' || appt.status === filterStatus;
    const matchDoctor = filterDoctor === 'All' || appt.doctor?._id === filterDoctor;
    const matchDate = !filterDate || new Date(appt.date).toISOString().split('T')[0] === filterDate;
    return matchStatus && matchDoctor && matchDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-indigo-50 text-indigo-600';
      case 'Completed': return 'bg-emerald-50 text-emerald-600';
      case 'Cancelled': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Appointments...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Appointment Control</h2>
          <p className="text-slate-500 mt-1">Manage hospital schedules, status tracking, and doctor assignments.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-100">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Filters:</span>
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="All">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select 
          value={filterDoctor}
          onChange={(e) => setFilterDoctor(e.target.value)}
          className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="All">All Doctors</option>
          {doctors.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <input 
          type="date" 
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600"
        />

        {(filterStatus !== 'All' || filterDoctor !== 'All' || filterDate) && (
          <button 
            onClick={() => { setFilterStatus('All'); setFilterDoctor('All'); setFilterDate(''); }}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredAppointments.length === 0 ? (
          <div className="lg:col-span-2 flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>No appointments found matching your filters.</p>
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <motion.div 
              key={appt._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-50 transition-all hover:shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${appt.isEmergency ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{appt.patient?.name}</h3>
                      {appt.isEmergency && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest">Emergency</span>}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Reason: {appt.reason}</p>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                  {appt.status}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Attending Doctor</p>
                    <p className="text-sm font-bold text-slate-700">{appt.doctor?.name || 'Not Assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Schedule</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {appt.status === 'Scheduled' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      <UserCheck size={14} /> Mark Completed
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedAppt(appt);
                        setRescheduleData({ date: appt.date.slice(0, 16), doctor: appt.doctor?._id || '' });
                        setShowRescheduleModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                      <CalendarDays size={14} /> Reschedule
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </>
                )}
                {appt.status !== 'Scheduled' && (
                  <div className="flex-1 text-center py-3 text-xs font-bold text-slate-400 italic">
                    No further actions available for {appt.status.toLowerCase()} appointments.
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRescheduleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900">Reschedule / Reassign</h3>
              <p className="mt-2 text-slate-500 text-sm">Modify appointment details for <span className="font-bold text-slate-900">{selectedAppt?.patient?.name}</span>.</p>
              
              <form onSubmit={handleReschedule} className="mt-8 space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">New Date & Time</label>
                  <input 
                    required type="datetime-local" 
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">Assign Doctor</label>
                  <select 
                    value={rescheduleData.doctor}
                    onChange={(e) => setRescheduleData({...rescheduleData, doctor: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowRescheduleModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100">Confirm Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentManagement;
