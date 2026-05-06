import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Stethoscope, 
  UserRound, 
  CalendarCheck, 
  FlaskConical, 
  Pill, 
  BedDouble, 
  Scissors, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Database, 
  Bell,
  User,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'users', name: 'User Management', icon: Users },
  { id: 'departments', name: 'Department Management', icon: Building2 },
  { id: 'doctors', name: 'Doctor Management', icon: Stethoscope },
  { id: 'patients', name: 'Patient Management', icon: UserRound },
  { id: 'appointments', name: 'Appointment Control', icon: CalendarCheck },
  { id: 'lab', name: 'Lab & Test Management', icon: FlaskConical },
  { id: 'pharmacy', name: 'Pharmacy / Inventory', icon: Pill },
  { id: 'wards', name: 'Ward & Bed Management', icon: BedDouble },
  { id: 'queue', name: 'Live Queue Tracking', icon: Clock },
  { id: 'billing', name: 'Billing & Financial', icon: Wallet },
  { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3 },
  { id: 'consultation', name: 'Clinical Consultation', icon: Stethoscope },
  { id: 'profile', name: 'Doctor Profile', icon: User },
  { id: 'settings', name: 'System Settings', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab, user, settings }) => {
  const filteredItems = menuItems.filter(item => {
    if (user.role === 'Admin') return true;
    if (user.role === 'Doctor') return ['overview', 'patients', 'consultation', 'profile'].includes(item.id);
    if (user.role === 'Receptionist') return ['overview', 'patients', 'appointments', 'billing', 'queue'].includes(item.id);
    if (user.role === 'Lab Technician') return ['overview', 'lab'].includes(item.id);
    if (user.role === 'Patient') return ['overview', 'appointments', 'billing', 'lab'].includes(item.id);
    return item.id === 'overview';
  });

  return (
    <div className="flex h-screen w-72 flex-col bg-white border-r border-slate-200">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <Building2 size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          {settings?.hospitalName?.split(' ')[0] || 'MediCenter'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Role</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Administrator</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
