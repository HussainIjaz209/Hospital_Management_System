import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, FlaskConical, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPanel = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const getIcon = (type, priority) => {
    if (priority === 'Urgent' || type === 'Emergency') return <AlertTriangle className="text-rose-500" size={18} />;
    switch (type) {
      case 'Appointment': return <Calendar className="text-indigo-500" size={18} />;
      case 'LabReport': return <FlaskConical className="text-emerald-500" size={18} />;
      default: return <Bell className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
                <h3 className="font-black text-slate-900 tracking-tight">Clinical Alerts</h3>
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[400px] space-y-2 overflow-y-auto custom-scrollbar pr-1">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div 
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`group flex items-start gap-4 rounded-2xl p-4 transition-all cursor-pointer ${n.isRead ? 'opacity-60 grayscale-[0.5]' : 'bg-slate-50 hover:bg-slate-100 shadow-sm'}`}
                  >
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      n.priority === 'Urgent' ? 'bg-rose-100' : 'bg-white shadow-sm'
                    }`}>
                      {getIcon(n.type, n.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${n.priority === 'Urgent' ? 'text-rose-900' : 'text-slate-900'}`}>{n.title}</p>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                    )}
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle size={48} className="text-slate-100 mb-4" />
                    <p className="text-sm font-bold text-slate-300 italic">No new clinical alerts.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
