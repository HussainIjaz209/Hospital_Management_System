import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Scissors, 
  Clipboard, 
  Activity, 
  Clock, 
  CheckCircle, 
  Stethoscope,
  ChevronRight,
  User,
  Plus,
  Building,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({ appointments: 0, surgeries: 0, patients: 0 });
  const [appointments, setAppointments] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [emergencyCases, setEmergencyCases] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentFilter, setAppointmentFilter] = useState('Today');
  const [loading, setLoading] = useState(true);

  const fetchDoctorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch data specific to this doctor
      const [appRes, surgRes, doctorRes] = await Promise.all([
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/surgeries', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const allApps = await appRes.json();
      const allSurgs = await surgRes.json();
      const allDoctors = await doctorRes.json();

      // Find the current doctor record
      const currentDoctor = allDoctors.find(d => d.email === user.email);
      
      // Filter by doctor (using email or name as bridge if ID is not directly linked in User)
      const myAppointments = allApps.filter(a => 
        a.doctor?._id === currentDoctor?._id || a.doctor?.email === user.email
      );
      const mySurgeries = allSurgs.filter(s => 
        s.doctor?._id === currentDoctor?._id || s.doctor?.email === user.email
      );

      setAppointments(myAppointments);
      setEmergencyCases(myAppointments.filter(a => a.isEmergency && a.status !== 'Completed'));
      setSurgeries(mySurgeries.filter(s => s.status !== 'Completed'));
      
      setStats({
        appointments: myAppointments.length,
        surgeries: mySurgeries.filter(s => s.status === 'Ongoing').length,
        patients: [...new Set(myAppointments.map(a => a.patient?._id))].length
      });
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchDoctorData();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400">Loading Clinical Workspace...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-indigo-600">Doctor's Workspace</h2>
          <p className="text-slate-500 mt-1">Review your schedule, patient records, and upcoming procedures.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (appointments.length > 0) setSelectedPatient(appointments[0].patient);
            }}
            className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ArrowRight size={18} />
            View Next Patient
          </button>
        </div>
      </div>

      {/* Emergency Cases Section */}
      {emergencyCases.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2.5rem] bg-rose-50 p-8 border border-rose-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white animate-pulse">
              <Flame size={20} />
            </div>
            <h3 className="text-xl font-bold text-rose-900">Critical Emergency Cases</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {emergencyCases.map(em => (
              <div key={em._id} className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm border border-rose-200">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{em.patient?.name}</p>
                    <p className="text-xs text-rose-500 font-bold uppercase">Immediate Attention Required</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(em.patient)}
                  className="rounded-xl bg-rose-600 px-6 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-all"
                >
                  Attend Now
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Today\'s Appointments', value: stats.appointments, icon: Calendar, color: 'indigo' },
          { label: 'Active Surgeries', value: stats.surgeries, icon: Scissors, color: 'rose' },
          { label: 'Total Patients', value: stats.patients, icon: Users, color: 'emerald' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="mt-2 text-4xl font-bold text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Appointments List */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Patient Management</h3>
              <div className="flex gap-2 rounded-xl bg-slate-50 p-1">
                {['Today', 'Upcoming', 'Completed'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setAppointmentFilter(f)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${appointmentFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {(() => {
              const filtered = appointments.filter(app => {
                const appDate = new Date(app.date);
                const today = new Date();
                
                // Strip time for day comparison
                const isToday = appDate.toDateString() === today.toDateString();
                const isFuture = appDate.setHours(0,0,0,0) > today.setHours(0,0,0,0);

                if (appointmentFilter === 'Today') return isToday && app.status !== 'Completed';
                if (appointmentFilter === 'Upcoming') return isFuture && app.status !== 'Completed';
                if (appointmentFilter === 'Completed') return app.status === 'Completed';
                return true;
              });

              if (filtered.length === 0) return (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">No {appointmentFilter.toLowerCase()} appointments found.</p>
                </div>
              );

              return filtered.map((app) => (
              <div key={app._id} className="group flex flex-col gap-4 rounded-3xl border border-slate-100 p-6 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{app.patient?.name}</p>
                      <p className="text-xs text-slate-400 font-medium">Time: {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                      app.status === 'Scheduled' ? 'bg-indigo-50 text-indigo-600' :
                      app.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => setSelectedPatient(app.patient)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 hover:text-indigo-600 transition-all"
                  >
                    Open Clinical File <ChevronRight size={10} />
                  </button>
                  
                  {app.status === 'Scheduled' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                        className="rounded-lg bg-rose-50 px-4 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ));
          })()}
          </div>
        </div>

        {/* Surgery Alerts */}
        <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-xl text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={120} />
          </div>
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Scissors size={20} className="text-rose-500" />
            Upcoming Procedures
          </h3>
          <div className="space-y-6">
            {surgeries.length > 0 ? surgeries.map((surg) => (
              <div key={surg._id} className="relative rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">{surg.procedureName}</span>
                    <h4 className="text-lg font-bold mt-1">{surg.patient?.name}</h4>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${surg.status === 'Ongoing' ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white/60'}`}>
                    {surg.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                  <span className="flex items-center gap-1"><Clock size={12} /> {new Date(surg.scheduledDate).toLocaleTimeString()}</span>
                  <span className="flex items-center gap-1"><Building size={12} /> {surg.operatingTheater?.name}</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <CheckCircle size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No surgeries scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient File Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPatient(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl rounded-[3rem] bg-white p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-500">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-slate-500 font-medium">Age: {selectedPatient.age} | Gender: {selectedPatient.gender}</p>
                    <span className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">Patient ID: {selectedPatient._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="rounded-2xl bg-slate-100 p-3 text-slate-400 hover:text-slate-600 transition-all">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Contact Information</h4>
                  <p className="text-sm font-bold text-slate-700 mb-1">Email: {selectedPatient.email}</p>
                  <p className="text-sm font-bold text-slate-700">Phone: {selectedPatient.contact}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Medical Summary</h4>
                  <p className="text-sm font-bold text-slate-700 mb-1">Blood Group: B+</p>
                  <p className="text-sm font-bold text-slate-700">Allergies: None</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900">Clinical Timeline</h4>
                {[1, 2].map((_, i) => (
                  <div key={i} className="relative pl-8 border-l-2 border-slate-100 pb-6">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Oct 24, 2023</p>
                    <p className="font-bold text-slate-800 mt-1">General Consultation - Dr. Sarah Mitchell</p>
                    <p className="text-sm text-slate-500 mt-2">Patient reported mild chest pain and shortness of breath. Prescribed ECG and basic blood work.</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-4">
                <button className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-700 transition-all">Start New Entry</button>
                <button className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 transition-all">Download History</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default DoctorDashboard;
