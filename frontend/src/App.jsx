import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import DoctorManagement from './components/DoctorManagement';
import AppointmentForm from './components/AppointmentForm';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import MainLayout from './components/MainLayout';
import UserManagement from './components/UserManagement';
import DepartmentManagement from './components/DepartmentManagement';
import PatientManagementAdmin from './components/PatientManagementAdmin';
import AppointmentManagement from './components/AppointmentManagement';
import LabManagement from './components/LabManagement';
import PharmacyManagement from './components/PharmacyManagement';
import WardManagement from './components/WardManagement';
import SurgeryManagement from './components/SurgeryManagement';
import BillingManagement from './components/BillingManagement';
import AnalyticsManagement from './components/AnalyticsManagement';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import SystemSettings from './components/SystemSettings';
import DoctorPatientList from './components/DoctorPatientList';
import ConsultationModule from './components/ConsultationModule';
import DoctorProfile from './components/DoctorProfile';
import ReceptionDashboard from './components/ReceptionDashboard';

const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Unauthorized');
  }
  return response.json();
};

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    try {
      const [pts, drcs, apps, sett] = await Promise.all([
        authFetch('/api/patients'),
        authFetch('/api/doctors'),
        authFetch('/api/appointments'),
        authFetch('/api/settings')
      ]);
      setPatients(pts);
      setDoctors(drcs);
      setAppointments(apps);
      setSettings(sett);
      setError('');
    } catch (err) {
      setError('Unable to load data. Please login again.');
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (settings?.hospitalName) {
      document.title = settings.hospitalName;
    }
  }, [settings]);

  const handleRefresh = () => loadData();

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  // Helper to render based on Admin activeTab
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard />;
      case 'users':
        return <UserManagement onUpdate={handleRefresh} />;
      case 'departments':
        return <DepartmentManagement onUpdate={handleRefresh} />;
      case 'patients':
        return <PatientManagementAdmin onUpdate={handleRefresh} />;
      case 'doctors':
        return <DoctorManagement onUpdate={handleRefresh} />;
      case 'appointments':
        return <AppointmentManagement onUpdate={handleRefresh} />;
      case 'lab':
        return <LabManagement onUpdate={handleRefresh} />;
      case 'pharmacy':
        return <PharmacyManagement onUpdate={handleRefresh} />;
      case 'wards':
        return <WardManagement onUpdate={handleRefresh} />;
      case 'surgery':
        return <SurgeryManagement onUpdate={handleRefresh} />;
      case 'billing':
        return <BillingManagement onUpdate={handleRefresh} />;
      case 'analytics':
        return <AnalyticsManagement />;
      case 'settings':
        return <SystemSettings onUpdate={handleRefresh} />;
      default:
        return <Dashboard />;
    }
  };

  // MAIN RENDER LOGIC BASED ON ROLE
  if (user.role === 'Doctor') {
    const renderDoctorContent = () => {
      switch (activeTab) {
        case 'overview': return <DoctorDashboard />;
        case 'patients': return <DoctorPatientList />;
        case 'consultation': return <ConsultationModule />;
        case 'profile': return <DoctorProfile />;
        case 'appointments': return <DoctorDashboard />; 
        case 'surgery': return <DoctorDashboard />;
        default: return <DoctorDashboard />;
      }
    };
    return (
      <MainLayout user={user} handleLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
        {renderDoctorContent()}
      </MainLayout>
    );
  }

  if (user.role === 'Receptionist') {
    const renderReceptionContent = () => {
      switch (activeTab) {
        case 'overview': return <ReceptionDashboard initialTab="overview" />;
        case 'patients': return <ReceptionDashboard initialTab="registration" />;
        case 'appointments': return <ReceptionDashboard initialTab="appointments" />;
        case 'billing': return <ReceptionDashboard initialTab="billing" />;
        case 'queue': return <ReceptionDashboard initialTab="queue" />;
        default: return <ReceptionDashboard initialTab="overview" />;
      }
    };
    return (
      <MainLayout user={user} handleLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
        {renderReceptionContent()}
      </MainLayout>
    );
  }

  if (user.role === 'Lab Technician') {
    const renderLabContent = () => {
      switch (activeTab) {
        case 'overview': return <LabManagement initialTab="dashboard" />;
        case 'lab': return <LabManagement initialTab="requests" />;
        default: return <LabManagement initialTab="dashboard" />;
      }
    };
    return (
      <MainLayout user={user} handleLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
        {renderLabContent()}
      </MainLayout>
    );
  }

  if (user.role === 'Patient') {
    return (
      <MainLayout user={user} handleLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
        <PatientDashboard />
      </MainLayout>
    );
  }

  // DEFAULT TO ADMIN VIEW
  return (
    <MainLayout user={user} handleLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-rose-600 border border-rose-100 flex items-center gap-3">
          <Bell size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {renderAdminContent()}
    </MainLayout>
  );
}

export default App;
