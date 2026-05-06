import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  User, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Save, 
  AlertCircle,
  Plus,
  ArrowRight,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Activity,
  BedDouble,
  DoorOpen,
  Syringe,
  Scissors
} from 'lucide-react';
import { motion } from 'framer-motion';

const ConsultationModule = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    symptoms: [],
    diagnosis: '',
    advice: '',
    notes: '',
    prescriptions: [],
    labTests: [],
    admission: { admit: false, bedId: '' },
    surgery: { recommend: false, procedure: '', theaterId: '', date: '', notes: '' }
  });
  const [newSymptom, setNewSymptom] = useState('');
  const [newMedicine, setNewMedicine] = useState({ medicine: '', dosage: '', duration: '' });
  const [labCatalog, setLabCatalog] = useState([]);
  const [patientReports, setPatientReports] = useState([]);
  const [allBeds, setAllBeds] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [newLabTest, setNewLabTest] = useState({ testId: '', priority: 'Normal' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReportView, setShowReportView] = useState(null);

  const fetchActiveAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Only show today's scheduled/confirmed appointments
      const today = new Date().toDateString();
      setAppointments(data.filter(a => new Date(a.date).toDateString() === today && a.status !== 'Completed'));
    } catch (err) { console.error(err); }
  };

  const fetchLabCatalog = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/lab/tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLabCatalog(data);
    } catch (err) { console.error(err); }
  };

  const fetchPatientReports = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/lab/reports?patient=${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPatientReports(data);
    } catch (err) { console.error(err); }
  };

  const fetchAllBeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wards/beds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllBeds(data);
    } catch (err) { console.error(err); }
  };

  const fetchTheaters = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/surgeries/theaters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTheaters(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchActiveAppointments();
    fetchLabCatalog();
    fetchAllBeds();
    fetchTheaters();
  }, []);

  useEffect(() => {
    if (selectedAppointment?.patient?._id) {
      fetchPatientReports(selectedAppointment.patient._id);
    }
  }, [selectedAppointment]);

  const handleAddSymptom = (e) => {
    if (e.key === 'Enter' && newSymptom) {
      setFormData({ ...formData, symptoms: [...formData.symptoms, newSymptom] });
      setNewSymptom('');
    }
  };

  const handleAddMedicine = () => {
    if (newMedicine.medicine) {
      setFormData({ ...formData, prescriptions: [...formData.prescriptions, newMedicine] });
      setNewMedicine({ medicine: '', dosage: '', duration: '' });
    }
  };

  const handleAddLabTest = () => {
    if (newLabTest.testId) {
      const test = labCatalog.find(t => t._id === newLabTest.testId);
      setFormData({ 
        ...formData, 
        labTests: [...formData.labTests, { ...newLabTest, name: test.name }] 
      });
      setNewLabTest({ testId: '', priority: 'Normal' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // 1. Create Medical Record
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient: selectedAppointment.patient?._id,
          doctor: selectedAppointment.doctor?._id,
          diagnosis: formData.diagnosis,
          notes: `${formData.notes}\n\nAdvice: ${formData.advice}`,
          prescriptions: formData.prescriptions
        })
      });

      // 2. Mark Appointment as Completed
      await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Completed' })
      });

      // 3. Handle Admission if requested
      if (formData.admission.admit && formData.admission.bedId) {
        await fetch(`/api/wards/beds/${formData.admission.bedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            isOccupied: true, 
            patient: selectedAppointment.patient?._id 
          })
        });
      }

      // 4. Handle Surgery Recommendation
      if (formData.surgery.recommend && formData.surgery.procedure) {
        await fetch('/api/surgeries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            patient: selectedAppointment.patient?._id,
            doctor: selectedAppointment.doctor?._id,
            operatingTheater: formData.surgery.theaterId,
            procedureName: formData.surgery.procedure,
            scheduledDate: formData.surgery.date || new Date(),
            notes: formData.surgery.notes,
            status: 'Scheduled'
          })
        });
      }

      // 5. Create Lab Reports
      if (formData.labTests.length > 0) {
        await Promise.all(formData.labTests.map(test => 
          fetch('/api/lab/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              patient: selectedAppointment.patient?._id,
              doctor: selectedAppointment.doctor?._id,
              test: test.testId,
              priority: test.priority
            })
          })
        ));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedAppointment(null);
        setFormData({ 
          symptoms: [], 
          diagnosis: '', 
          advice: '', 
          notes: '', 
          prescriptions: [], 
          labTests: [], 
          admission: { admit: false, bedId: '' },
          surgery: { recommend: false, procedure: '', theaterId: '', date: '', notes: '' }
        });
        fetchActiveAppointments();
      }, 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Consultation Module</h2>
          <p className="text-slate-500 mt-1">Record active diagnosis, symptoms, and clinical advice.</p>
        </div>
        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-emerald-100 shadow-sm">
            <Save size={18} /> Consultation Completed Successfully!
          </motion.div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Patient Selector */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              Select Active Patient
            </h3>
            <div className="space-y-3">
              {appointments.length > 0 ? appointments.map((app) => (
                <button
                  key={app._id}
                  onClick={() => setSelectedAppointment(app)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedAppointment?._id === app._id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold">{app.patient?.name}</p>
                    <p className={`text-[10px] font-bold uppercase ${selectedAppointment?._id === app._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ArrowRight size={16} />
                </button>
              )) : (
                <div className="text-center py-8 text-slate-300 font-bold italic">No active appointments for today.</div>
              )}
            </div>
          </div>

          {selectedAppointment && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="rounded-[2.5rem] bg-indigo-50/50 p-8 border border-indigo-100">
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4">Patient Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold"><span className="text-indigo-400">Age</span><span className="text-indigo-900">{selectedAppointment.patient?.age}</span></div>
                  <div className="flex justify-between text-sm font-bold"><span className="text-indigo-400">Gender</span><span className="text-indigo-900">{selectedAppointment.patient?.gender}</span></div>
                  <div className="flex justify-between text-sm font-bold"><span className="text-indigo-400">Blood</span><span className="text-indigo-900">O+</span></div>
                </div>
              </div>

              {/* Investigation History */}
              <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FlaskConical size={18} className="text-indigo-600" />
                  Investigation History
                </h3>
                <div className="space-y-3">
                  {patientReports.length > 0 ? patientReports.map((report) => (
                    <div key={report._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{report.test?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          report.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.status === 'Completed' && (
                        <button 
                          onClick={() => setShowReportView(report)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Eye size={12} /> View Report
                        </button>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-4 text-slate-300 text-xs font-bold italic">No past investigations found.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Diagnosis Form */}
        <div className="lg:col-span-2 space-y-8">
          {!selectedAppointment ? (
            <div className="h-96 flex flex-col items-center justify-center rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400">
              <Clipboard size={64} className="mb-4 opacity-20" />
              <p className="font-bold text-xl">Select a patient to start consultation</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Symptoms & Diagnosis */}
              <div className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-slate-50 space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500" />
                    Symptoms & Observations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.symptoms.map((s, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        {s} <Plus className="rotate-45 cursor-pointer" size={14} onClick={() => setFormData({...formData, symptoms: formData.symptoms.filter((_, idx) => idx !== i)})} />
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Type symptom and press Enter..."
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={handleAddSymptom}
                    className="w-full rounded-2xl bg-slate-50 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 border-none shadow-inner"
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Stethoscope size={14} className="text-indigo-600" />
                      Clinical Diagnosis
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                      className="w-full rounded-3xl bg-slate-50 p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 border-none shadow-inner"
                      placeholder="Enter primary diagnosis..."
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-amber-500" />
                      Clinical Advice
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.advice}
                      onChange={(e) => setFormData({...formData, advice: e.target.value})}
                      className="w-full rounded-3xl bg-slate-50 p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 border-none shadow-inner"
                      placeholder="Advice for the patient..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    Internal Notes (Private)
                  </label>
                  <textarea 
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full rounded-3xl bg-slate-50 p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-400 border-none shadow-inner"
                    placeholder="Internal medical notes..."
                  />
                </div>
              </div>

              {/* Lab Investigation Requests */}
              <div className="rounded-[2.5rem] bg-indigo-50 p-10 shadow-xl border border-indigo-100">
                <h4 className="text-xl font-bold mb-8 text-indigo-900 flex items-center gap-3">
                  <FlaskConical size={24} className="text-indigo-600" />
                  Lab Investigation Requests
                </h4>
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <select 
                    className="md:col-span-2 rounded-2xl bg-white p-4 text-sm font-bold border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-600"
                    value={newLabTest.testId}
                    onChange={(e) => setNewLabTest({...newLabTest, testId: e.target.value})}
                  >
                    <option value="">Select Lab Test...</option>
                    {labCatalog.map(test => (
                      <option key={test._id} value={test._id}>{test.name} ({test.category})</option>
                    ))}
                  </select>
                  <select 
                    className="rounded-2xl bg-white p-4 text-sm font-bold border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-600"
                    value={newLabTest.priority}
                    onChange={(e) => setNewLabTest({...newLabTest, priority: e.target.value})}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <button type="button" onClick={handleAddLabTest} className="rounded-2xl bg-indigo-600 p-4 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <Plus size={20} /> Request
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.labTests.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-sm text-slate-900">{t.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          t.priority === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <Plus className="rotate-45 cursor-pointer text-slate-400 hover:text-rose-500" size={18} onClick={() => setFormData({...formData, labTests: formData.labTests.filter((_, idx) => idx !== i)})} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission & Ward Request */}
              <div className="rounded-[2.5rem] bg-amber-50 p-10 shadow-xl border border-amber-100">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-bold text-amber-900 flex items-center gap-3">
                    <DoorOpen size={24} className="text-amber-600" />
                    Admission & Ward Request
                  </h4>
                  <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-amber-100">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, admission: { ...formData.admission, admit: false, bedId: '' } })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!formData.admission.admit ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      OPD
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, admission: { ...formData.admission, admit: true } })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.admission.admit ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Admit
                    </button>
                  </div>
                </div>

                {formData.admission.admit && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <label className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                      <BedDouble size={14} className="text-amber-600" />
                      Select Available Bed
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select 
                        className="w-full rounded-2xl bg-white p-4 text-sm font-bold border border-amber-100 outline-none focus:ring-2 focus:ring-amber-600"
                        value={formData.admission.bedId}
                        onChange={(e) => setFormData({...formData, admission: {...formData.admission, bedId: e.target.value}})}
                      >
                        <option value="">Choose a bed...</option>
                        {allBeds.filter(b => !b.isOccupied).map(bed => (
                          <option key={bed._id} value={bed._id}>
                            {bed.ward?.name} — Bed {bed.number} ({bed.type})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-amber-100/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                          <AlertCircle size={20} />
                        </div>
                        <p className="text-xs font-medium text-amber-800 leading-tight">
                          Admission will notify the ward manager and assigned nurse immediately.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Surgery Recommendation */}
              <div className="rounded-[2.5rem] bg-rose-50 p-10 shadow-xl border border-rose-100">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-bold text-rose-900 flex items-center gap-3">
                    <Scissors size={24} className="text-rose-600" />
                    Surgery Recommendation
                  </h4>
                  <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-rose-100">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, surgery: { ...formData.surgery, recommend: false } })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!formData.surgery.recommend ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      No Surgery
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, surgery: { ...formData.surgery, recommend: true } })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.surgery.recommend ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      Recommend
                    </button>
                  </div>
                </div>

                {formData.surgery.recommend && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                          Procedure Name
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Appendectomy"
                          className="w-full rounded-2xl bg-white p-4 text-sm font-bold border border-rose-100 outline-none focus:ring-2 focus:ring-rose-600"
                          value={formData.surgery.procedure}
                          onChange={(e) => setFormData({...formData, surgery: {...formData.surgery, procedure: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                          Target Operating Theater
                        </label>
                        <select 
                          className="w-full rounded-2xl bg-white p-4 text-sm font-bold border border-rose-100 outline-none focus:ring-2 focus:ring-rose-600"
                          value={formData.surgery.theaterId}
                          onChange={(e) => setFormData({...formData, surgery: {...formData.surgery, theaterId: e.target.value}})}
                        >
                          <option value="">Select Theater...</option>
                          {theaters.map(ot => (
                            <option key={ot._id} value={ot._id}>{ot.name} ({ot.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                          Proposed Date & Time
                        </label>
                        <input 
                          type="datetime-local"
                          className="w-full rounded-2xl bg-white p-4 text-sm font-bold border border-rose-100 outline-none focus:ring-2 focus:ring-rose-600"
                          value={formData.surgery.date}
                          onChange={(e) => setFormData({...formData, surgery: {...formData.surgery, date: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-rose-900 uppercase tracking-widest flex items-center gap-2">
                          Surgical Team Notes
                        </label>
                        <textarea 
                          rows={1}
                          placeholder="Pre-op instructions..."
                          className="w-full rounded-2xl bg-white p-4 text-sm font-bold border border-rose-100 outline-none focus:ring-2 focus:ring-rose-600"
                          value={formData.surgery.notes}
                          onChange={(e) => setFormData({...formData, surgery: {...formData.surgery, notes: e.target.value}})}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Prescription Engine */}
              <div className="rounded-[2.5rem] bg-indigo-900 p-10 shadow-xl text-white">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Pill size={24} className="text-indigo-400" />
                  Prescription Engine
                </h4>
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <input 
                    className="md:col-span-2 rounded-2xl bg-white/10 p-4 text-sm font-bold border border-white/10 outline-none focus:bg-white/20" 
                    placeholder="Medicine Name"
                    value={newMedicine.medicine}
                    onChange={(e) => setNewMedicine({...newMedicine, medicine: e.target.value})}
                  />
                  <input 
                    className="rounded-2xl bg-white/10 p-4 text-sm font-bold border border-white/10 outline-none focus:bg-white/20" 
                    placeholder="Dosage" 
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                  />
                  <button type="button" onClick={handleAddMedicine} className="rounded-2xl bg-indigo-500 p-4 text-white font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50">
                    <Plus size={20} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.prescriptions.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="font-bold text-sm">{p.medicine} — <span className="text-indigo-300">{p.dosage}</span></p>
                      <Plus className="rotate-45 cursor-pointer text-white/40 hover:text-white" size={18} onClick={() => setFormData({...formData, prescriptions: formData.prescriptions.filter((_, idx) => idx !== i)})} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 rounded-[2.5rem] bg-white border-2 border-indigo-600 py-6 font-black text-indigo-600 shadow-xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-lg disabled:opacity-50"
                >
                  {saving ? 'Completing Session...' : 'Finish Consultation & Save Record'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      {/* Report Viewer Modal */}
      {showReportView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowReportView(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Investigation Report</h3>
                <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-tight">{showReportView.test?.name} Investigation</p>
              </div>
              <button onClick={() => setShowReportView(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                  <p className="font-bold text-emerald-600 flex items-center gap-2"><CheckCircle size={14} /> {showReportView.status}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Completed On</p>
                  <p className="font-bold text-slate-700">{new Date(showReportView.completedAt || showReportView.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                  <Activity size={12} /> Result Findings
                </p>
                <p className="text-slate-700 font-medium leading-relaxed italic">
                  "{showReportView.result || 'No findings reported yet.'}"
                </p>
              </div>

              <button 
                onClick={() => setShowReportView(null)}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConsultationModule;
