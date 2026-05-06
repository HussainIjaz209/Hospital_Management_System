import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  Plus, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  X, 
  ChevronRight,
  ClipboardList,
  Edit3,
  Trash2,
  Activity,
  Layers,
  Thermometer,
  Beaker,
  AlertTriangle,
  Printer,
  Download,
  User,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LabManagement = ({ onUpdate, initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // dashboard, requests, catalog

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({ pending: 0, processing: 0, ready: 0, urgent: 0 });

  const [testFormData, setTestFormData] = useState({ name: '', category: 'Blood Work', price: 0, tat: '24 Hours', description: '' });
  const [reportResultData, setReportResultData] = useState({ 
    result: '', 
    status: 'Pending',
    labTechnician: '',
    numericResults: []
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [testRes, reportRes] = await Promise.all([
        fetch('/api/lab/tests', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/lab/reports', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const allTests = await testRes.json();
      const allReports = await reportRes.json();
      
      setTests(allTests);
      setReports(allReports);
      
      setStats({
        pending: allReports.filter(r => r.status === 'Pending').length,
        processing: allReports.filter(r => r.status === 'Processing').length,
        ready: allReports.filter(r => r.status === 'Completed').length,
        urgent: allReports.filter(r => r.priority === 'Urgent' && r.status !== 'Completed').length
      });
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status, extraData = {}) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/lab/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, ...extraData })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/lab/reports/${selectedReport._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...reportResultData, status: 'Completed', completedAt: new Date() })
      });
      if (res.ok) {
        setShowReportModal(false);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const addNumericRow = () => {
    setReportResultData({
      ...reportResultData,
      numericResults: [...reportResultData.numericResults, { parameter: '', value: '', unit: '', referenceRange: '' }]
    });
  };

  const updateNumericRow = (index, field, value) => {
    const updated = [...reportResultData.numericResults];
    updated[index][field] = value;
    setReportResultData({ ...reportResultData, numericResults: updated });
  };

  if (loading) return <div className="flex h-96 items-center justify-center font-black text-slate-300 italic">Laboratory Workspace Loading...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Diagnostic Laboratory</h2>
          <p className="text-slate-500 font-medium">Process medical investigations and generate precise clinical reports.</p>
        </div>
        <div className="flex rounded-2xl bg-slate-100 p-1 shadow-sm">
          {[
            { id: 'dashboard', label: 'Overview', icon: Activity },
            { id: 'requests', label: 'Test Requests', icon: ClipboardList },
            { id: 'catalog', label: 'Inventory & Catalog', icon: Beaker }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key="dashboard" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: 'Pending Samples', value: stats.pending, icon: Thermometer, color: 'amber' },
                { label: 'In Process', value: stats.processing, icon: Clock, color: 'indigo' },
                { label: 'Reports Ready', value: stats.ready, icon: CheckCircle, color: 'emerald' },
                { label: 'Urgent Cases', value: stats.urgent, icon: AlertTriangle, color: 'rose' }
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

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
                <h3 className="text-xl font-black text-slate-900 mb-6">Recent Urgent Requests</h3>
                <div className="space-y-4">
                  {reports.filter(r => r.priority === 'Urgent' && r.status !== 'Completed').slice(0, 4).map(report => (
                    <div key={report._id} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-sm">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{report.patient?.name}</p>
                          <p className="text-xs font-bold text-rose-600 uppercase tracking-tighter">{report.test?.name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('requests')}
                        className="rounded-xl bg-white p-2 text-rose-600 shadow-sm border border-rose-100 hover:bg-rose-100 transition-all"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <FlaskConical size={180} />
                </div>
                <h3 className="text-2xl font-black mb-4">Lab Catalog</h3>
                <p className="text-indigo-200 text-sm font-medium mb-8 leading-relaxed">View all available tests, pricing, and standard reference ranges used in this facility.</p>
                <button 
                  onClick={() => setActiveTab('catalog')}
                  className="w-full rounded-2xl bg-white py-4 font-black text-indigo-900 shadow-xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-xs"
                >
                  Manage Test Types
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Patient Test Requests</h3>
              <div className="flex gap-2">
                <button className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">All</button>
                <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm border border-slate-100">Urgent Only</button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reports.filter(r => r.status !== 'Completed').map(report => (
                <div key={report._id} className={`rounded-[2.5rem] bg-white p-8 shadow-xl border-2 transition-all ${report.priority === 'Urgent' ? 'border-rose-100' : 'border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase ${
                      report.priority === 'Urgent' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {report.priority}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(report.createdAt).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl">
                      {report.patient?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{report.patient?.name}</h4>
                      <p className="text-sm font-bold text-indigo-600">{report.test?.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Prescribed By</span>
                      <span className="text-slate-700">{report.doctor?.name || 'Emergency Dept'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Sample Status</span>
                      <span className={`px-2 py-0.5 rounded ${report.collectedAt ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {report.collectedAt ? 'COLLECTED' : 'AWAITING COLLECTION'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!report.collectedAt ? (
                      <button 
                        onClick={() => handleUpdateStatus(report._id, 'Pending', { collectedAt: new Date() })}
                        className="flex-1 rounded-2xl bg-indigo-600 py-3 text-[10px] font-black text-white shadow-lg hover:bg-indigo-700 uppercase tracking-widest"
                      >
                        Mark Sample Collected
                      </button>
                    ) : report.status === 'Pending' ? (
                      <button 
                        onClick={() => handleUpdateStatus(report._id, 'Processing')}
                        className="flex-1 rounded-2xl bg-slate-900 py-3 text-[10px] font-black text-white shadow-lg hover:bg-slate-800 uppercase tracking-widest"
                      >
                        Start Processing
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedReport(report);
                          setReportResultData({ 
                            result: report.result || '', 
                            status: 'Processing',
                            labTechnician: '',
                            numericResults: report.test?.category === 'Blood Work' ? [
                              { parameter: 'Hemoglobin', value: '', unit: 'g/dL', referenceRange: '13.5-17.5' },
                              { parameter: 'WBC Count', value: '', unit: 'cells/mcL', referenceRange: '4,500-11,000' },
                              { parameter: 'Platelet Count', value: '', unit: 'cells/mcL', referenceRange: '150k-450k' }
                            ] : []
                          });
                          setShowReportModal(true);
                        }}
                        className="flex-1 rounded-2xl bg-emerald-600 py-3 text-[10px] font-black text-white shadow-lg hover:bg-emerald-700 uppercase tracking-widest"
                      >
                        Enter Results
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="catalog" className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Diagnostic Catalog</h3>
              <button 
                onClick={() => {
                  setEditingTest(null);
                  setTestFormData({ name: '', category: 'Blood Work', price: 0, tat: '24 Hours', description: '' });
                  setShowTestModal(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
              >
                <Plus size={18} /> New Test Type
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tests.map(test => (
                <div key={test._id} className="group relative rounded-[2rem] bg-white p-8 shadow-xl border border-slate-50 hover:border-indigo-100 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Beaker size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingTest(test); setTestFormData(test); setShowTestModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">{test.name}</h4>
                  <span className="mt-1 inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {test.category}
                  </span>
                  <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{test.description || 'Standard laboratory procedure.'}</p>
                  
                  <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                      <p className="text-xl font-black text-indigo-600">PKR {test.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TAT</p>
                      <p className="text-xs font-bold text-slate-900">{test.tat}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Catalog Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTestModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg rounded-[3rem] bg-white p-10 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTest ? 'Update Catalog' : 'New Investigation Type'}</h3>
              <form onSubmit={handleSaveReport} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Test Name</label>
                  <input required type="text" value={testFormData.name} onChange={(e) => setTestFormData({...testFormData, name: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                    <select value={testFormData.category} onChange={(e) => setTestFormData({...testFormData, category: e.target.value})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none">
                      {['Blood Work', 'Imaging', 'Pathology', 'Cardiology', 'Neurology', 'Other'].map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Price (PKR)</label>
                    <input required type="number" value={testFormData.price} onChange={(e) => setTestFormData({...testFormData, price: parseInt(e.target.value)})} className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                  <textarea value={testFormData.description} onChange={(e) => setTestFormData({...testFormData, description: e.target.value})} rows="2" className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowTestModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Discard</button>
                  <button type="submit" className="flex-1 rounded-2xl bg-indigo-600 py-4 font-black text-white shadow-xl hover:bg-indigo-700 uppercase tracking-widest text-xs">Save to Catalog</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Entry Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl rounded-[3rem] bg-white p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-indigo-900 text-white flex items-center justify-center text-3xl font-black">
                    {selectedReport?.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{selectedReport?.patient?.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedReport?.test?.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-bold text-slate-400">Request ID: {selectedReport?._id?.substr(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 transition-all"><X /></button>
              </div>

              <form onSubmit={handleSaveReport} className="space-y-10">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Performing Technician</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required 
                        type="text" 
                        placeholder="Name of Technician"
                        value={reportResultData.labTechnician} 
                        onChange={(e) => setReportResultData({...reportResultData, labTechnician: e.target.value})} 
                        className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Summary Remarks</label>
                    <input 
                      type="text" 
                      placeholder="High-level diagnosis summary"
                      value={reportResultData.result} 
                      onChange={(e) => setReportResultData({...reportResultData, result: e.target.value})} 
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Structured Numeric Results */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Parameter Findings</h4>
                    <button 
                      type="button" 
                      onClick={addNumericRow}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-all"
                    >
                      <Plus size={14} /> Add Parameter
                    </button>
                  </div>

                  <div className="rounded-3xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Parameter</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Result Value</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Unit</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Reference Range</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reportResultData.numericResults.map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-3"><input value={row.parameter} onChange={(e) => updateNumericRow(idx, 'parameter', e.target.value)} className="w-full bg-transparent font-bold text-slate-700 outline-none" placeholder="e.g. Hemoglobin" /></td>
                            <td className="px-6 py-3"><input value={row.value} onChange={(e) => updateNumericRow(idx, 'value', e.target.value)} className="w-full bg-transparent font-black text-indigo-600 outline-none" placeholder="14.5" /></td>
                            <td className="px-6 py-3"><input value={row.unit} onChange={(e) => updateNumericRow(idx, 'unit', e.target.value)} className="w-full bg-transparent font-bold text-slate-500 outline-none" placeholder="g/dL" /></td>
                            <td className="px-6 py-3"><input value={row.referenceRange} onChange={(e) => updateNumericRow(idx, 'referenceRange', e.target.value)} className="w-full bg-transparent font-bold text-slate-400 outline-none" placeholder="13.5-17.5" /></td>
                            <td className="px-6 py-3 text-right">
                              <button onClick={() => {
                                const updated = reportResultData.numericResults.filter((_, i) => i !== idx);
                                setReportResultData({...reportResultData, numericResults: updated});
                              }} className="text-slate-300 hover:text-rose-500"><X size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-6 pt-10 border-t border-slate-50">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 rounded-[2rem] bg-slate-100 py-6 font-black text-slate-600 uppercase tracking-widest text-xs">Discard Report</button>
                  <button type="submit" className="flex-1 rounded-[2rem] bg-indigo-900 py-6 font-black text-white shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">Authorize & Finalize Report</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabManagement;
