import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Edit3, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Box,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PharmacyManagement = ({ onUpdate }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Tablet',
    stock: 0,
    minStockLevel: 10,
    price: 0,
    expiryDate: '',
    manufacturer: '',
    location: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pharmacy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMedicines(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch pharmacy data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingMedicine ? 'PUT' : 'POST';
    const url = editingMedicine ? `/api/pharmacy/${editingMedicine._id}` : '/api/pharmacy';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medicine from inventory?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/pharmacy/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchData();
      if (onUpdate) onUpdate();
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = medicines.filter(m => m.stock <= m.minStockLevel);

  if (loading) return <div className="flex h-96 items-center justify-center">Loading Inventory...</div>;

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Pharmacy & Inventory</h2>
          <p className="text-slate-500 mt-1">Manage medicine stocks, pricing, and supply alerts.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMedicine(null);
            setFormData({ name: '', genericName: '', category: 'Tablet', stock: 0, minStockLevel: 10, price: 0, expiryDate: '', manufacturer: '', location: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          <Plus size={20} />
          Add Medicine
        </button>
      </div>

      {/* Low Stock Warning Panel */}
      {lowStockItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-rose-50 border border-rose-100 p-6"
        >
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <AlertTriangle size={24} />
            <h3 className="font-bold text-lg">Low Stock Warning</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lowStockItems.map(item => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-rose-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-rose-500 font-bold">{item.stock} left</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingMedicine(item);
                    setFormData(item);
                    setShowModal(true);
                  }}
                  className="rounded-xl bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] bg-white p-4 shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search medicines, generic names..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TableIcon size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedicines.map((m) => (
            <motion.div 
              key={m._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-slate-50 transition-all hover:shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  m.stock <= m.minStockLevel ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <Pill size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingMedicine(m); setFormData(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(m._id)} className="p-2 text-slate-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-slate-900 leading-tight">{m.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{m.genericName || 'Generic N/A'}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.category}</span>
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    m.stock > m.minStockLevel ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {m.stock} Units
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Price</span>
                  <span className="text-lg font-bold text-emerald-600">${m.price}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                  <span className="text-sm font-bold text-slate-700">{m.location || 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Medicine</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.stock <= m.minStockLevel ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Pill size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${m.stock <= m.minStockLevel ? 'text-rose-600' : 'text-slate-700'}`}>
                      {m.stock} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${m.price}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingMedicine(m); setFormData(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Medicine Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold text-slate-900">{editingMedicine ? 'Update Inventory' : 'Add New Medicine'}</h3>
              <form onSubmit={handleSave} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400">Medicine Name</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Generic Name</label>
                    <input type="text" value={formData.genericName} onChange={(e) => setFormData({...formData, genericName: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600">
                      {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Current Stock</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Low Stock Alert Level</label>
                    <input type="number" value={formData.minStockLevel} onChange={(e) => setFormData({...formData, minStockLevel: parseInt(e.target.value)})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Unit Price ($)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Expiry Date</label>
                    <input type="date" value={formData.expiryDate?.split('T')[0]} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Manufacturer</label>
                    <input type="text" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400">Storage Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Shelf A-1" className="mt-2 w-full rounded-2xl bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PharmacyManagement;
