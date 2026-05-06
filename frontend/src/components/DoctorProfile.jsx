import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Clock, 
  Phone, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    experience: 0,
    consultationFee: 0
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Availability
  const [availability, setAvailability] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const res = await fetch('/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allDoctors = await res.json();
      const me = allDoctors.find(d => d.email === user.email);
      
      if (me) {
        setDoctor(me);
        setProfileData({
          name: me.name || '',
          specialty: me.specialty || '',
          phone: me.phone || '',
          email: me.email || '',
          experience: me.experience || 0,
          consultationFee: me.consultationFee || 0
        });
        setAvailability(me.availability || []);
      }
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/doctors/${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const handleUpdateAvailability = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/doctors/${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ availability })
      });
      setSuccess('Availability updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeAvailabilitySlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  if (loading) return <div className="flex h-96 items-center justify-center font-bold text-slate-400 italic">Loading Profile...</div>;
  if (!doctor) return <div className="p-8 text-center bg-white rounded-3xl shadow-xl">Doctor profile not found. Please contact Admin.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Card */}
      <div className="relative rounded-[3rem] bg-indigo-900 p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Activity size={180} />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-32 w-32 rounded-[2.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
            <User size={64} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">{doctor.name}</h2>
            <p className="text-indigo-200 text-lg font-medium mt-1 uppercase tracking-widest">{doctor.specialty}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold border border-white/10">
                <Mail size={14} /> {doctor.email}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold border border-white/10">
                <Phone size={14} /> {doctor.phone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'profile', label: 'Personal Info', icon: User },
          { id: 'availability', label: 'My Availability', icon: Clock },
          { id: 'security', label: 'Security & Access', icon: Lock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
              activeSubTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-100">
          <CheckCircle size={20} />
          <p className="font-bold">{success}</p>
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100">
          <AlertCircle size={20} />
          <p className="font-bold">{error}</p>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-50">
        {activeSubTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Specialty</label>
                <input 
                  type="text" 
                  value={profileData.specialty}
                  onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Contact Phone</label>
                <input 
                  type="text" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Experience (Years)</label>
                <input 
                  type="number" 
                  value={profileData.experience}
                  onChange={(e) => setProfileData({...profileData, experience: parseInt(e.target.value)})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-black text-white shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Update Clinical Profile'}
              </button>
            </div>
          </form>
        )}

        {activeSubTab === 'availability' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Set Weekly Schedule</h3>
                <p className="text-slate-500 font-medium">Define your consultation hours for patient booking.</p>
              </div>
              <button 
                onClick={addAvailabilitySlot}
                className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-all"
              >
                <Plus size={18} /> Add Slot
              </button>
            </div>

            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="flex flex-wrap items-center gap-4 rounded-3xl bg-slate-50 p-4 border border-slate-100">
                  <select 
                    value={slot.day}
                    onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={slot.startTime}
                      onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-bold outline-none"
                    />
                    <span className="text-slate-400 font-black">TO</span>
                    <input 
                      type="time" 
                      value={slot.endTime}
                      onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-bold outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeAvailabilitySlot(index)}
                    className="ml-auto rounded-xl p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-50">
              <button 
                onClick={handleUpdateAvailability}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-black text-white shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-8 max-w-lg">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 border-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-indigo-900 px-8 py-4 font-black text-white shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              <Shield size={20} />
              {saving ? 'Updating...' : 'Change Secure Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
