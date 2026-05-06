import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  UserCog, 
  Trash2, 
  Shield, 
  Lock, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = ({ onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'Receptionist'
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/auth/roles');
      const data = await response.json();
      setRoles(data.roles);
      setPermissions(data.permissions);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchRoles()]).then(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      let res;
      if (editingUser) {
        res = await fetch(`/api/auth/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ role: formData.role, username: formData.username, isActive: editingUser.isActive })
        });
      } else {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (res.ok) {
        setShowModal(false);
        setEditingUser(null);
        fetchUsers();
        if (onUpdate) onUpdate();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to save user'}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('An unexpected error occurred while saving.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchUsers();
      if (onUpdate) onUpdate();
    } else {
      alert('Failed to delete user');
    }
  };

  const toggleStatus = async (user) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/auth/users/${user._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ isActive: !user.isActive })
    });
    if (res.ok) {
      fetchUsers();
      if (onUpdate) onUpdate();
    } else {
      alert('Failed to toggle status');
    }
  };

  const handleResetPassword = async () => {
    const token = localStorage.getItem('token');
    await fetch(`/api/auth/users/${editingUser._id}/reset-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ newPassword })
    });
    setShowResetModal(false);
    setEditingUser(null);
    setNewPassword('');
    alert('Password reset successfully');
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading User Management...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">Control access, roles, and permissions across the system.</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ email: '', username: '', password: '', role: 'Receptionist' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <UserPlus size={20} />
          Create New User
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* User Table */}
        <div className="lg:col-span-2 rounded-3xl bg-white shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold uppercase">
                        {user.username?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.username || 'No Username'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      user.role === 'Admin' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        user.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setShowResetModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Reset Password"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({ username: user.username || '', role: user.role });
                          setShowModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <UserCog size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions Preview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-6">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold">Role Permissions</h3>
            <p className="mt-2 text-indigo-100 text-sm">Preview access levels for different system roles to ensure security compliance.</p>
            
            <div className="mt-8 space-y-4">
              {Object.entries(permissions).slice(0, 5).map(([role, perms]) => (
                <div key={role} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-bold text-sm">{role}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {perms.map(p => (
                      <span key={p} className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                        {p.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'Create User'}</h3>
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                {!editingUser && (
                  <div>
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-slate-700">Username</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-slate-700">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-2xl bg-slate-100 py-3 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Reset Password</h3>
              <p className="text-slate-500 mt-2 text-sm">Enter a new password for <span className="font-bold text-slate-900">{editingUser?.email}</span>.</p>
              
              <div className="mt-6">
                <label className="text-sm font-bold text-slate-700">New Password</label>
                <input 
                  type="password" 
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  Reset Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
