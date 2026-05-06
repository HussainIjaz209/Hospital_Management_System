import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  History, 
  ChevronRight, 
  Plus, 
  FileText, 
  Pill, 
  FlaskConical,
  Calendar,
  Activity,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorPatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState({ records: [], labReports: [] });
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      // In a real app, this would be an endpoint like /api/doctors/my-patients
      const res = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPatients(data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const [recordsRes, labRes] = await Promise.all([
        fetch(`/api/records?patientId=${patientId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/lab/reports?patientId=${patientId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setPatientHistory({
        records: await recordsRes.json(),
        labReports: await labRes.json()
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchHistory(selectedPatient._id);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p._id.includes(searchTerm)
  );

  if (loading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400 text-lg">Accessing Clinical Records...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Assigned Patients</h2>
          <p className="text-slate-500 mt-1">Manage and review medical history for your clinical cases.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-white border border-slate-200 p-4 pl-12 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <motion.div 
            key={patient._id}
            whileHover={{ y: -5 }}
            className="group relative rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50 overflow-hidden cursor-pointer"
            onClick={() => setSelectedPatient(patient)}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ID: {patient._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Age / Gender</span>
                <span className="text-slate-700 font-bold">{patient.age} / {patient.gender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Last Visit</span>
                <span className="text-slate-700 font-bold">Oct 12, 2023</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <History size={16} />
              View Clinical History
            </button>
          </motion.div>
        ))}
      </div>

      {/* Patient History Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPatient(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="relative h-full w-full max-w-4xl rounded-[3rem] bg-white shadow-2xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-50 flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPatient.name}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Age: {selectedPatient.age}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Gender: {selectedPatient.gender}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Active Patient</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="rounded-2xl bg-slate-100 p-3 text-slate-400 hover:text-slate-600 transition-all">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                
                {/* Statistics Row */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="rounded-3xl bg-slate-50 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Visits</p>
                    <p className="text-2xl font-black text-slate-900">{patientHistory.records.length}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Lab Reports</p>
                    <p className="text-2xl font-black text-slate-900">{patientHistory.labReports.length}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Blood Group</p>
                    <p className="text-2xl font-black text-rose-600">O+</p>
                  </div>
                </div>

                {/* Main History Tabs */}
                <div className="grid gap-8 lg:grid-cols-2">
                  
                  {/* Diagnosis & Medicine History */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={20} className="text-indigo-600" />
                      Medical Consultations
                    </h4>
                    <div className="space-y-4">
                      {patientHistory.records.length > 0 ? patientHistory.records.map((record) => (
                        <div key={record._id} className="rounded-3xl border border-slate-100 p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</p>
                              <h5 className="font-bold text-slate-800 text-lg mt-1">{record.diagnosis || 'General Checkup'}</h5>
                            </div>
                            <Activity size={20} className="text-slate-200" />
                          </div>
                          <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Pill size={12} /> Prescribed Medicines</p>
                            <div className="flex flex-wrap gap-2">
                              {record.prescriptions?.map((p, i) => (
                                <span key={i} className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm">{p.medicine}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )) : <p className="text-sm font-bold text-slate-400 italic">No previous consultations found.</p>}
                    </div>
                  </div>

                  {/* Lab History */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FlaskConical size={20} className="text-emerald-600" />
                      Lab & Test Results
                    </h4>
                    <div className="space-y-4">
                      {patientHistory.labReports.length > 0 ? patientHistory.labReports.map((report) => (
                        <div key={report._id} className="flex items-center justify-between rounded-3xl border border-slate-100 p-6 hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <FlaskConical size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{report.test?.name || 'Blood Work'}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase">{report.status} • {new Date(report.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Download size={18} className="text-slate-300 hover:text-indigo-600" />
                        </div>
                      )) : <p className="text-sm font-bold text-slate-400 italic">No lab reports on file.</p>}
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex gap-4">
                <button className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm">Create New Medical Entry</button>
                <button className="px-10 rounded-2xl bg-white border border-slate-200 py-4 font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Download Full PDF Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorPatientList;
