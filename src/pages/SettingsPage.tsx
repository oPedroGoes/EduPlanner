import { useState } from 'react';
import { Moon, Bell, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/ToastNotification';

interface SettingsPageProps {
  onShowToast: (toast: Toast) => void;
}

export default function SettingsPage({ onShowToast }: SettingsPageProps) {
  const { coordinator, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleGoogleSync = () => {
    onShowToast({
      id: Date.now().toString(),
      type: 'success',
      message: '✅ Integração com Google Calendar em breve!',
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        message: '⚠ Erro ao fazer logout',
      });
    }
  };

  return (
    <div id="page-config" className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2703A6] mb-6">Configurações</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações da Conta</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="text-gray-800 font-medium">{coordinator?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="text-gray-800 font-medium">{coordinator?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Instituição</p>
              <p className="text-gray-800 font-medium">{coordinator?.institution || 'Não informada'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferências</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2703A6]/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-[#2703A6]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Tema Escuro</p>
                  <p className="text-sm text-gray-500">Alternar aparência do sistema</p>
                </div>
              </div>
              <label id="toggle-darkmode" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2703A6]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2703A6]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2703A6]/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#2703A6]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Notificações</p>
                  <p className="text-sm text-gray-500">Alertas e lembretes do sistema</p>
                </div>
              </div>
              <label id="toggle-notifications" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2703A6]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2703A6]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Integrações</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4945BF]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#4945BF]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Google Calendar</p>
                  <p className="text-sm text-gray-500">Sincronize disponibilidade dos professores</p>
                </div>
              </div>
              <button
                id="sync-google"
                onClick={handleGoogleSync}
                className="px-4 py-2 rounded-xl bg-[#2703A6] text-white text-sm font-medium hover:bg-[#201AD9] transition-all duration-200"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF0000]/10 text-[#FF0000] font-semibold hover:bg-[#FF0000]/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
