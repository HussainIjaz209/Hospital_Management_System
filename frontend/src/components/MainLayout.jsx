import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import { LogOut, Bell, Search, User } from 'lucide-react';

const MainLayout = ({ user, handleLogout, children, activeTab, setActiveTab, settings }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} settings={settings} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {settings?.hospitalName || 'MediCenter Hospital'}
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-80 rounded-2xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-slate-100 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationPanel user={user} />
            
            <div className="h-8 w-px bg-slate-200" />
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user.email.split('@')[0]}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <User size={20} />
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
