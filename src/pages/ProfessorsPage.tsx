// src/pages/ProfessorsPage.tsx
import { useState, useEffect } from 'react';
import { Plus, X, Mail, Building2, User } from 'lucide-react';
import { supabase, Professor } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/ToastNotification';
import Modal from '../components/Modal';

interface ProfessorsPageProps {
  onShowToast: (toast: Toast) => void;
}

// Estado inicial do formulário (simplificado)
const initialFormState = {
  fullName: '',
  email: '',
  additionalInstitution: '',
  workShifts: [] as string[],
};

export default function ProfessorsPage({ onShowToast }: ProfessorsPageProps) {
  const { user } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (user) {
      loadProfessors();
    }
  }, [user]);

  const loadProfessors = async () => {
    const { data } = await supabase.from('professors').select('*').order('full_name');
    if (data) setProfessors(data);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('professors').insert({
      coordinator_id: user!.id,
      full_name: formData.fullName,
      email: formData.email,
      additional_institution: formData.additionalInstitution,
      work_shifts: formData.workShifts,
      availability: [],
      google_calendar_connected: false,
    });

    if (!error) {
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        message: '✅ Professor cadastrado com sucesso!',
      });
      handleCloseForm();
      await loadProfessors();
    } else {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        message: '⚠ Erro ao cadastrar professor',
      });
    }
  };

  // --- CORREÇÃO AQUI ---
  // Esta é a função que estava faltando.
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('professors').delete().eq('id', id);

    if (!error) {
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        message: '✅ Professor removido com sucesso!',
      });
      await loadProfessors();
    }
  };
  // --- FIM DA CORREÇÃO ---

  return (
    <div id="page-professores" className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2703A6]">Professores</h1>
          <button
            id="btn-novo-professor"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2703A6] text-white hover:bg-[#201AD9] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Novo Professor
          </button>
        </div>

        <Modal isOpen={showForm} onClose={handleCloseForm}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Cadastrar Professor</h2>
          
          <form id="form-professor" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Placeholder da Foto do Perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do Perfil (Funcionalidade em breve)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed opacity-50 px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700"
                >
                  Selecionar Imagem
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="professor@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instituição Adicional
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.additionalInstitution}
                  onChange={(e) => setFormData({ ...formData, additionalInstitution: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="Outra instituição (opcional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turnos de Trabalho
              </label>
              <div className="flex gap-3">
                {['Matutino', 'Vespertino', 'Noturno'].map((shift) => (
                  <label key={shift} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.workShifts.includes(shift)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            workShifts: [...formData.workShifts, shift],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            workShifts: formData.workShifts.filter((s) => s !== shift),
                          });
                        }
                      }}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#2703A6] focus:ring-2 focus:ring-[#2703A6]/30"
                    />
                    <span className="text-sm text-gray-700">{shift}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                id="btn-salvar-professor"
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-[#2703A6] text-white hover:bg-[#201AD9] transition-all duration-200"
              >
                Salvar Professor
              </button>
            </div>
          </form>
        </Modal>

        <div id="list-professores" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professors.map((prof) => (
            <div
              key={prof.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2703A6] to-[#4945BF] flex items-center justify-center text-white font-semibold">
                  {prof.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <button
                  onClick={() => handleDelete(prof.id)}
                  className="text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{prof.full_name}</h3>
              <p className="text-sm text-gray-500 mb-2">{prof.email}</p>
              {prof.additional_institution && (
                <p className="text-xs text-gray-500 mb-2">📍 {prof.additional_institution}</p>
              )}
              {prof.work_shifts && Array.isArray(prof.work_shifts) && prof.work_shifts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prof.work_shifts.map((shift, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-lg bg-[#2703A6]/10 text-[#2703A6] text-xs font-medium"
                    >
                      {shift}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}