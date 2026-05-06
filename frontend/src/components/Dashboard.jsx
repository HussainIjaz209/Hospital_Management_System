import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BedDouble, 
  Stethoscope, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl transition-all hover:shadow-2xl"
  >
    <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full opacity-10 bg-${color}-500`} />
    <div className="flex items-center justify-between">
      <div className={`rounded-2xl bg-${color}-50 p-4 text-${color}-600`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
          <TrendingUp size={16} />
          {trend}
        </span>
      )}
    </div>
    <div className="mt-6">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-3xl bg-slate-200" />
        ))}
      </div>
    );
  }

  const { metrics, chartData } = stats;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard 
          title="Patients Today" 
          value={metrics.totalPatientsToday} 
          icon={Users} 
          color="blue"
          trend="+12%"
        />
        <StatsCard 
          title="Total Appointments" 
          value={metrics.totalAppointments} 
          icon={Calendar} 
          color="indigo"
        />
        <StatsCard 
          title="Available Beds" 
          value={`${metrics.availableBeds}/${metrics.availableBeds + metrics.occupiedBeds}`} 
          icon={BedDouble} 
          color="emerald"
        />
        <StatsCard 
          title="Doctors On Duty" 
          value={metrics.doctorsOnDuty} 
          icon={Stethoscope} 
          color="violet"
        />
        <StatsCard 
          title="Emergency Cases" 
          value={metrics.emergencyCases} 
          icon={AlertCircle} 
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-white p-8 shadow-xl lg:col-span-2"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Hospital Activity</h3>
              <p className="text-sm text-slate-500">Weekly appointment trends</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              View Report <ArrowUpRight size={16} />
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAppointments)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-between rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Activity size={24} />
            </div>
            <h3 className="mt-6 text-2xl font-bold">System Status</h3>
            <p className="mt-2 text-indigo-100">All modules are performing optimally. Check the latest logs for details.</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-100">CPU Usage</span>
              <span className="font-semibold">24%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-1/4 bg-white" />
            </div>
            
            <div className="flex items-center justify-between text-sm pt-4">
              <span className="text-indigo-100">Storage</span>
              <span className="font-semibold">68%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[68%] bg-white" />
            </div>
          </div>

          <button className="mt-8 w-full rounded-2xl bg-white py-4 font-bold text-indigo-600 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            View System Health
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
