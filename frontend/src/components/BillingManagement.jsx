import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Calendar,
  PieChart,
  Download,
  CreditCard,
  Building,
  User,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BillingManagement = ({ onUpdate }) => {
  const [invoices, setInvoices] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [invoiceRes, reportRes] = await Promise.all([
        fetch(`/api/billing?timeframe=${timeframe}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/billing/report', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setInvoices(await invoiceRes.json());
      setReport(await reportRes.json());
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/billing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Financial Data...</div>;

  const totalRevenue = report?.statusStats.find(s => s._id === 'Paid')?.total || 0;
  const pendingRevenue = report?.statusStats.find(s => s._id === 'Pending')?.total || 0;

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patient?.name.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Billing & Financial Control</h2>
          <p className="text-slate-500 mt-1">Track revenue, monitor pending payments, and manage patient invoices.</p>
        </div>
        <div className="flex rounded-2xl bg-white p-1 shadow-sm border border-slate-200">
          {['daily', 'weekly', 'monthly'].map(t => (
            <button 
              key={t}
              onClick={() => setTimeframe(t)}
              className={`rounded-xl px-6 py-2 text-sm font-bold capitalize transition-all ${timeframe === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Revenue (Paid)</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
            <ArrowUpRight size={16} />
            <span>12% Increase</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-6">
            <Clock size={24} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Collections</p>
          <h3 className="mt-2 text-4xl font-bold text-slate-900">${pendingRevenue.toLocaleString()}</h3>
          <p className="mt-4 text-sm text-slate-500 font-medium">From {report?.statusStats.find(s => s._id === 'Pending')?.count || 0} unpaid invoices</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[2.5rem] bg-indigo-600 p-8 shadow-xl text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white mb-6">
            <PieChart size={24} />
          </div>
          <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Revenue Forecast</p>
          <h3 className="mt-2 text-4xl font-bold">${(totalRevenue + pendingRevenue).toLocaleString()}</h3>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-bold hover:bg-white/20 transition-all">
            <Download size={16} />
            Export Financial Report
          </button>
        </motion.div>
      </div>

      {/* Department Revenue Breakdown */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
        <h3 className="text-xl font-bold text-slate-900 mb-8">Revenue by Department</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {report?.departmentStats.map(dept => (
            <div key={dept._id} className="relative overflow-hidden rounded-3xl bg-slate-50 p-6">
              <span className="text-[10px] font-bold uppercase text-slate-400">{dept._id}</span>
              <p className="mt-1 text-2xl font-bold text-slate-900">${dept.revenue.toLocaleString()}</p>
              <div className="mt-4 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <div className="rounded-[2.5rem] bg-white shadow-xl border border-slate-50 overflow-hidden">
        <div className="flex flex-col gap-4 p-8 border-b border-slate-50 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Invoice # or Patient Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Paid', 'Pending'].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${statusFilter === status ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Invoice Details</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Patient</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Amount</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400">Status</th>
                <th className="px-8 py-4 text-xs font-bold uppercase text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{inv.patient?.name}</p>
                        <p className="text-xs text-slate-400">{inv.patient?.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-lg font-bold text-slate-900">${inv.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{inv.paymentMethod}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {inv.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {inv.status === 'Pending' ? (
                      <button 
                        onClick={() => handleUpdateStatus(inv._id, 'Paid')}
                        className="rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-lg hover:bg-indigo-700 transition-all"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="rounded-xl bg-slate-100 px-6 py-2 text-xs font-bold text-slate-400 hover:bg-slate-200 transition-all"
                      >
                        View Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl rounded-[2.5rem] bg-white p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">RECEIPT</h3>
                  <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">MediCenter Hospital</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6 mb-8">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Patient Details</p>
                <p className="text-lg font-bold text-slate-900">{selectedInvoice.patient?.name}</p>
                <p className="text-sm text-slate-500">{selectedInvoice.patient?.contact || selectedInvoice.patient?.email}</p>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">Description of Services</p>
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.description}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{item.category}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">${item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-xl font-bold text-slate-900">Total Amount</p>
                  <p className="text-3xl font-black text-indigo-600">${selectedInvoice.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                  <CheckCircle size={20} />
                  <p className="text-sm font-bold uppercase tracking-wide">Status: {selectedInvoice.status} via {selectedInvoice.paymentMethod}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedInvoice(null)}
                className="mt-8 w-full rounded-2xl bg-slate-900 py-4 font-bold text-white hover:bg-slate-800 transition-all"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingManagement;
