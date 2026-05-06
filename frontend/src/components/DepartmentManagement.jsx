import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  ChevronRight,
  UserPlus,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DepartmentManagement = ({ onUpdate }) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', head: '', status: 'Active' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [deptRes, docRes] = await Promise.all([
        fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const depts = await deptRes.json();
      const docs = await docRes.json();
      setDepartments(depts);
      setDoctors(docs);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingDept ? 'PUT' : 'POST';
    const url = editingDept ? `/api/departments/${editingDept._id}` : '/api/departments';

    try {
      // Clean up data
      const { _id, __v, createdAt, updatedAt, ...cleanData } = formData;
      if (cleanData.head && typeof cleanData.head === 'object') {
        cleanData.head = cleanData.head._id;
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cleanData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingDept(null);
        fetchData();
        if (onUpdate) onUpdate();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to save department'}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('An unexpected error occurred while saving.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will fail if doctors are assigned.')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchData();
      if (onUpdate) onUpdate();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Departments...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Department Management</h2>
          <p className="text-slate-500 mt-1">Organize hospital structure and assign medical heads.</p>
        </div>
        <button 
          onClick={() => {
            setEditingDept(null);
            setFormData({ name: '', description: '', head: '', status: 'Active' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          Create Department
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const deptDocs = doctors.filter(d => d.department?._id === dept._id || d.department === dept._id);
          return (
            <motion.div 
              key={dept._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl transition-all hover:shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingDept(dept);
                      setFormData({ 
                        name: dept.name, 
                        description: dept.description || '', 
                        head: dept.head?._id || dept.head || '', 
                        status: dept.status 
                      });
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{dept.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    dept.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {dept.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{dept.description || 'No description provided.'}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users size={16} />
                    <span className="text-sm font-bold">{deptDocs.length} Doctors</span>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {deptDocs.slice(0, 3).map((doc, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase" title={doc.name}>
                      {doc.name.charAt(0)}
                    </div>
                  ))}
                  {deptDocs.length > 3 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-400">
                      +{deptDocs.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Head</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Stethoscope size={14} className="text-indigo-400" />
                  {dept.head?.name || 'Not Assigned'}
                </div>
              </div>
            </motion.div>
          );
        })}
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
              <h3 className="text-2xl font-bold text-slate-900">{editingDept ? 'Edit Department' : 'Create Department'}</h3>
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700">Department Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Cardiology"
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Head of Department</label>
                  <select 
                    value={formData.head}
                    onChange={(e) => setFormData({...formData, head: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>{doc.name} ({doc.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-indigo-600 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
                    {editingDept ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentManagement;
