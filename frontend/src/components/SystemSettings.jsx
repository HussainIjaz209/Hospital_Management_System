import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Clock, 
  DollarSign, 
  Bell, 
  Save, 
  Image as ImageIcon,
  CheckCircle,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const SystemSettings = ({ onUpdate }) => {
  const [settings, setSettings] = useState({
    hospitalName: '',
    workingHours: { start: '', end: '' },
    currency: { code: '', symbol: '' },
    notifications: { emailAlerts: true, stockAlerts: true, appointmentReminders: true }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSettings(data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Settings updated successfully!');
        if (onUpdate) onUpdate();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400">Loading Configuration...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-slate-500 mt-1">Configure global hospital parameters and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hospital Branding */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Hospital Branding</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Hospital Name</label>
              <input 
                type="text" 
                value={settings.hospitalName}
                onChange={(e) => setSettings({...settings, hospitalName: e.target.value})}
                className="w-full rounded-2xl bg-slate-50 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                placeholder="e.g. MediCenter General Hospital"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Hospital Logo URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full rounded-2xl bg-slate-50 p-4 pl-12 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operations & Finance */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Working Hours</h3>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="time" 
                value={settings.workingHours.start}
                onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, start: e.target.value}})}
                className="flex-1 rounded-2xl bg-slate-50 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600"
              />
              <span className="font-bold text-slate-300">to</span>
              <input 
                type="time" 
                value={settings.workingHours.end}
                onChange={(e) => setSettings({...settings, workingHours: {...settings.workingHours, end: e.target.value}})}
                className="flex-1 rounded-2xl bg-slate-50 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Currency Settings</h3>
            </div>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="USD"
                value={settings.currency.code}
                onChange={(e) => setSettings({...settings, currency: {...settings.currency, code: e.target.value}})}
                className="w-24 rounded-2xl bg-slate-50 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <input 
                type="text" 
                placeholder="$"
                value={settings.currency.symbol}
                onChange={(e) => setSettings({...settings, currency: {...settings.currency, symbol: e.target.value}})}
                className="w-24 rounded-2xl bg-slate-50 p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600 text-center"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl border border-slate-50">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Bell size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
          </div>
          
          <div className="space-y-6">
            {[
              { key: 'emailAlerts', label: 'Email Alerts for New Appointments', desc: 'Send automated confirmation emails to patients.' },
              { key: 'stockAlerts', label: 'Low Stock Pharmacy Alerts', desc: 'Notify pharmacists when medicine levels are critical.' },
              { key: 'appointmentReminders', label: 'Appointment SMS Reminders', desc: 'Send daily reminders to patients via SMS.' }
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between p-2">
                <div>
                  <p className="font-bold text-slate-800">{n.label}</p>
                  <p className="text-sm text-slate-500">{n.desc}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({
                    ...settings, 
                    notifications: { ...settings.notifications, [n.key]: !settings.notifications[n.key] }
                  })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${settings.notifications[n.key] ? 'bg-rose-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.notifications[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {message && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle size={20} />
              {message}
            </motion.div>
          )}
          <button 
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-10 py-4 font-bold text-white shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 ml-auto"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
