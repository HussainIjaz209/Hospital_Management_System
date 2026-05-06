import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  UserPlus, 
  Search, 
  Flame, 
  Activity,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Printer,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReceptionDashboard = ({ initialTab = 'overview' }) => {
  const [stats, setStats] = useState({ todayPatients: 0, appointments: 0, waiting: 0, newReg: 0 });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab); // overview, registration, appointments, queue, billing
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '', age: '', gender: 'Male', contact: '', cnic: '', bloodGroup: 'B+', address: '', emergencyContact: ''
  });
  
  // Appointment Form State
  const [appForm, setAppForm] = useState({
    patientId: '', doctorId: '', date: '', reason: '', isEmergency: false
  });

  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [appRes, patRes, docRes] = await Promise.all([
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const allApps = await appRes.json();
      const allPats = await patRes.json();
      const allDocs = await docRes.json();
      
      setAppointments(allApps);
      setPatients(allPats);
      setDoctors(allDocs);
      
      const today = new Date().toDateString();
      const todayApps = allApps.filter(a => new Date(a.date).toDateString() === today);
      
      setStats({
        todayPatients: todayApps.length,
        appointments: todayApps.filter(a => a.status === 'Scheduled').length,
        waiting: todayApps.filter(a => a.status === 'Scheduled').length,
        newReg: allPats.filter(p => new Date(p.createdAt).toDateString() === today).length
      });
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const patientId = 'PAT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...regForm, patientId })
      });
      if (res.ok) {
        alert(`Patient Registered Successfully! ID: ${patientId}`);
        setRegForm({ name: '', age: '', gender: 'Male', contact: '', cnic: '', bloodGroup: 'B+', address: '', emergencyContact: '' });
        fetchData();
        setActiveTab('overview');
      }
    } catch (err) { console.error(err); }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const tokenNumber = 'T-' + (stats.todayPatients + 1).toString().padStart(3, '0');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          patient: appForm.patientId, 
          doctor: appForm.doctorId, 
          date: appForm.date, 
          reason: appForm.reason,
          isEmergency: appForm.isEmergency,
          tokenNumber
        })
      });
      if (res.ok) {
        alert(`Appointment Booked! Token: ${tokenNumber}`);
        setAppForm({ patientId: '', doctorId: '', date: '', reason: '', isEmergency: false });
        fetchData();
        setActiveTab('overview');
      }
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
      fetchData();
    } catch (err) { console.error(err); }
  };

  const searchPatients = (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    const results = patients.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.patientId?.includes(query.toUpperCase()) ||
      p.contact.includes(query) ||
      p.cnic?.includes(query)
    );
    setSearchResults(results.slice(0, 5));
  };

  if (loading) return <div className="flex h-96 items-center justify-center font-black text-slate-300 italic">Receptionist Workspace Loading...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Receptionist Console</h2>
          <p className="text-slate-500 font-medium">Manage registrations, clinical flow, and frontline operations.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'registration', label: 'Registration', icon: UserPlus },
            { id: 'appointments', label: 'Bookings', icon: Calendar },
            { id: 'queue', label: 'Queue', icon: Clock },
            { id: 'billing', label: 'Billing', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: 'Today\'s Patients', value: stats.todayPatients, icon: Users, color: 'indigo' },
                { label: 'Pending Bookings', value: stats.appointments, icon: Calendar, color: 'emerald' },
                { label: 'Waiting in Queue', value: stats.waiting, icon: Clock, color: 'amber' },
                { label: 'New Registrations', value: stats.newReg, icon: UserPlus, color: 'rose' }
              ].map((s, i) => (
                <div key={i} className="rounded-[2rem] bg-white p-6 shadow-xl border border-slate-50">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}-50 text-${s.color}-600 mb-4`}>
                    <s.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <h3 className="mt-1 text-3xl font-black text-slate-900">{s.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Emergency Fast Entry */}
              <div className="rounded-[2.5rem] bg-rose-600 p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110">
                  <Flame size={120} />
                </div>
                <h3 className="text-2xl font-black mb-2">Emergency Fast-Track</h3>
                <p className="text-rose-100 font-medium mb-8">Bypass full registration for critical medical situations.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setActiveTab('registration'); setRegForm({...regForm, name: 'EMERGENCY PATIENT'}); }}
                    className="rounded-2xl bg-white px-8 py-4 font-black text-rose-600 shadow-xl hover:bg-rose-50 transition-all uppercase tracking-widest"
                  >
                    Launch Emergency Mode
                  </button>
                </div>
              </div>

              {/* Quick Search / Returning Patient */}
              <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Search size={20} className="text-indigo-600" />
                  Returning Patient Lookup
                </h3>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by Name, ID, Phone or CNIC..." 
                    className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                    value={searchQuery}
                    onChange={(e) => searchPatients(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  {searchResults.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] font-black text-indigo-600 uppercase">{p.patientId || 'No ID'}</p>
                      </div>
                      <button 
                        onClick={() => { setAppForm({...appForm, patientId: p._id}); setActiveTab('appointments'); }}
                        className="rounded-xl bg-white p-2 text-indigo-600 shadow-sm border border-slate-100 hover:bg-indigo-50"
                      >
                        <Calendar size={18} />
                      </button>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <p className="text-center py-4 text-slate-400 font-bold italic text-sm">No patients found matching your search.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'registration' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="registration" className="max-w-4xl mx-auto rounded-[3rem] bg-white p-10 shadow-2xl border border-slate-50">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserPlus size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">New Patient Registration</h3>
                <p className="text-slate-500 font-medium">Initialize digital health record and patient identity.</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input required type="text" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="e.g. John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Age</label>
                    <input required type="number" value={regForm.age} onChange={(e) => setRegForm({...regForm, age: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Gender</label>
                    <select value={regForm.gender} onChange={(e) => setRegForm({...regForm, gender: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Contact Number</label>
                  <input required type="text" value={regForm.contact} onChange={(e) => setRegForm({...regForm, contact: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="e.g. +92 300 1234567" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">CNIC / ID Number</label>
                  <input type="text" value={regForm.cnic} onChange={(e) => setRegForm({...regForm, cnic: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" placeholder="e.g. 42101-XXXXXXX-X" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Emergency Contact</label>
                  <input type="text" value={regForm.emergencyContact} onChange={(e) => setRegForm({...regForm, emergencyContact: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Blood Group</label>
                  <select value={regForm.bloodGroup} onChange={(e) => setRegForm({...regForm, bloodGroup: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Permanent Address</label>
                <textarea value={regForm.address} onChange={(e) => setRegForm({...regForm, address: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" rows={2}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setActiveTab('overview')} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Discard</button>
                <button type="submit" className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">Register Patient & Generate ID</button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="appointments" className="max-w-4xl mx-auto rounded-[3rem] bg-white p-10 shadow-2xl border border-slate-50">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Clinical Booking</h3>
                <p className="text-slate-500 font-medium">Assign patients to specialized medical consultants.</p>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Select Patient</label>
                  <select required value={appForm.patientId} onChange={(e) => setAppForm({...appForm, patientId: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                    <option value="">Choose Patient...</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Assign Doctor</label>
                  <select required value={appForm.doctorId} onChange={(e) => setAppForm({...appForm, doctorId: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                    <option value="">Choose Doctor...</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Date & Time</label>
                  <input required type="datetime-local" value={appForm.date} onChange={(e) => setAppForm({...appForm, date: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Consultation Priority</label>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setAppForm({...appForm, isEmergency: false})}
                      className={`flex-1 rounded-2xl p-4 font-bold transition-all ${!appForm.isEmergency ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}
                    >
                      Routine
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAppForm({...appForm, isEmergency: true})}
                      className={`flex-1 rounded-2xl p-4 font-bold transition-all ${appForm.isEmergency ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}
                    >
                      Emergency
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Visit Reason / Notes</label>
                <textarea value={appForm.reason} onChange={(e) => setAppForm({...appForm, reason: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" rows={2} placeholder="Briefly describe the symptoms..."></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setActiveTab('overview')} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Cancel</button>
                <button type="submit" className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">Confirm Booking & Issue Token</button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'queue' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="queue" className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-slate-50">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Live Queue Management</h3>
                <p className="text-slate-500 font-medium">Real-time tracking of patients waiting for consultation.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase">In-Consult</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {appointments.filter(a => a.status === 'Scheduled' || a.status === 'In-Consultation').map((app) => (
                <div key={app._id} className={`rounded-3xl border-2 p-6 transition-all ${app.status === 'In-Consultation' ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-50 bg-white shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white shadow-lg">
                      {app.tokenNumber || '---'}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                      app.isEmergency ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {app.isEmergency ? 'Urgent' : 'Routine'}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{app.patient?.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">Doctor: {app.doctor?.name}</p>
                  
                  <div className="mt-6 flex gap-2">
                    {app.status === 'Scheduled' ? (
                      <button 
                        onClick={() => handleUpdateStatus(app._id, 'In-Consultation')}
                        className="flex-1 rounded-xl bg-indigo-600 py-3 text-[10px] font-black text-white shadow-lg hover:bg-indigo-700 uppercase tracking-widest"
                      >
                        Call Patient
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 rounded-xl bg-emerald-50 py-3 text-[10px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-widest"
                      >
                        In Consultation
                      </button>
                    )}
                    <button className="rounded-xl bg-white p-3 text-slate-400 border border-slate-100 hover:text-rose-500 hover:bg-rose-50 transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="billing" className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-slate-50">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Frontline Billing</h3>
                <p className="text-slate-500 font-medium">Collection of OPD consultation fees and lab test charges.</p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg">
                <Plus size={18} /> New Receipt
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4">Receipt ID</th>
                    <th className="px-8 py-4">Patient</th>
                    <th className="px-8 py-4">Type</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.slice(0, 5).map((app, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 font-bold text-slate-600">#INV-88{i}</td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900">{app.patient?.name}</p>
                        <p className="text-[10px] text-slate-400">{app.patient?.patientId}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">OPD FEE</span>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">PKR 1,500</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black">
                          <CheckCircle size={12} /> PAID
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all">
                          <Printer size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceptionDashboard;
