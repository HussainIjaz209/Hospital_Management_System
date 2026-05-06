import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Pill, 
  Wallet, 
  Activity, 
  Clock, 
  CheckCircle, 
  Download,
  AlertCircle,
  ChevronRight,
  FlaskConical,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      // In a real app, filter by patient ID on server
      const [appRes, labRes, invRes] = await Promise.all([
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/lab/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/billing', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      setAppointments(await appRes.json());
      setLabResults(await labRes.json());
      setInvoices(await invRes.json());
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400">Loading Your Health Dashboard...</div>;

  const nextAppointment = appointments.find(a => new Date(a.date) > new Date());

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="rounded-[3rem] bg-indigo-600 p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Activity size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Good Morning!</h2>
            <p className="text-indigo-100 text-lg max-w-md">Your health is our priority. Here's an overview of your medical journey with us.</p>
            <button className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-indigo-600 shadow-xl hover:bg-indigo-50 transition-all">
              <Plus size={20} />
              Book New Appointment
            </button>
          </div>
          {nextAppointment && (
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Next Appointment</p>
              <h3 className="mt-2 text-2xl font-bold">{new Date(nextAppointment.date).toLocaleDateString()}</h3>
              <p className="text-sm font-medium text-indigo-100">With {nextAppointment.doctor?.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Links */}
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          {/* Lab Reports */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FlaskConical size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{labResults.length} Reports</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Latest Lab Results</h3>
            <div className="space-y-3">
              {labResults.slice(0, 3).map(report => (
                <div key={report._id} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${report.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <p className="text-sm font-bold text-slate-700">{report.test?.name}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Billing & Invoices */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Wallet size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Manage Billing</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Invoices & Payments</h3>
            <div className="space-y-3">
              {invoices.slice(0, 3).map(inv => (
                <div key={inv._id} className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-bold text-slate-700">${inv.totalAmount}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{inv.status}</p>
                  </div>
                  {inv.status === 'Pending' && <button className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Pay Now</button>}
                </div>
              ))}
            </div>
          </div>

          {/* Active Prescriptions */}
          <div className="md:col-span-2 rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Pill size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Current Medications</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {['Amoxicillin 500mg', 'Panadol Extra', 'Vitamin C 1000mg'].map((med, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">{med}</p>
                  <Clock size={16} className="text-rose-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar / Appointments */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Appointment History</h3>
          </div>
          <div className="space-y-6">
            {appointments.map((app) => (
              <div key={app._id} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${new Date(app.date) > new Date() ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                  <div className="h-12 w-0.5 bg-slate-100" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{new Date(app.date).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 font-medium">Consultation with {app.doctor?.name}</p>
                  <span className="mt-2 inline-block rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase text-slate-400">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
