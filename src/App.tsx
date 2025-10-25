import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfessorsPage from './pages/ProfessorsPage';
import RoomsPage from './pages/RoomsPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import ToastNotification, { Toast } from './components/ToastNotification';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      dismissToast(toast.id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onShowToast={showToast} />;
      case 'professors':
        return <ProfessorsPage onShowToast={showToast} />;
      case 'rooms':
        return <RoomsPage onShowToast={showToast} />;
      case 'settings':
        return <SettingsPage onShowToast={showToast} />;
      default:
        return <DashboardPage onShowToast={showToast} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2703A6] via-[#201AD9] to-[#4945BF] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        {renderPage()}
      </div>
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
