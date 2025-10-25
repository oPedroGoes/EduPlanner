import { useState, useEffect } from 'react';
import { Plus, X, DoorOpen, Monitor, Projector, Square } from 'lucide-react';
import { supabase, Room } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/ToastNotification';

interface RoomsPageProps {
  onShowToast: (toast: Toast) => void;
}

export default function RoomsPage({ onShowToast }: RoomsPageProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sala',
    capacity: 30,
    equipment: [] as string[],
  });

  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  const loadRooms = async () => {
    const { data } = await supabase.from('rooms').select('*').order('name');
    if (data) setRooms(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('rooms').insert({
      coordinator_id: user!.id,
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      equipment: formData.equipment,
    });

    if (!error) {
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        message: '✅ Sala cadastrada com sucesso!',
      });
      setShowForm(false);
      setFormData({ name: '', type: 'sala', capacity: 30, equipment: [] });
      await loadRooms();
    } else {
      onShowToast({
        id: Date.now().toString(),
        type: 'error',
        message: '⚠ Erro ao cadastrar sala',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (!error) {
      onShowToast({
        id: Date.now().toString(),
        type: 'success',
        message: '✅ Sala removida com sucesso!',
      });
      await loadRooms();
    }
  };

  const equipmentOptions = [
    { id: 'projetor', label: 'Projetor', icon: Projector },
    { id: 'computadores', label: 'Computadores', icon: Monitor },
    { id: 'quadro-digital', label: 'Quadro Digital', icon: Square },
  ];

  return (
    <div id="page-salas" className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2703A6]">Salas e Laboratórios</h1>
          <button
            id="btn-nova-sala"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2703A6] text-white hover:bg-[#201AD9] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Adicionar Sala
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Cadastrar Sala/Laboratório</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form id="form-sala" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="Ex: Lab 3, Sala 205"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                >
                  <option value="sala">Sala</option>
                  <option value="laboratório">Laboratório</option>
                  <option value="auditório">Auditório</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidade *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Equipamentos Disponíveis
                </label>
                <div className="space-y-2">
                  {equipmentOptions.map((equip) => {
                    const Icon = equip.icon;
                    return (
                      <label key={equip.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.equipment.includes(equip.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                equipment: [...formData.equipment, equip.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                equipment: formData.equipment.filter((eq) => eq !== equip.id),
                              });
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#2703A6] focus:ring-2 focus:ring-[#2703A6]/30"
                        />
                        <Icon className="w-5 h-5 text-[#4945BF]" />
                        <span className="text-sm text-gray-700">{equip.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#2703A6] text-white hover:bg-[#201AD9] transition-all duration-200"
                >
                  Salvar Sala
                </button>
              </div>
            </form>
          </div>
        )}

        <div id="list-salas" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4945BF]/20 to-[#5E608C]/20 flex items-center justify-center">
                  <DoorOpen className="w-6 h-6 text-[#2703A6]" />
                </div>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-gray-400 hover:text-[#FF0000] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{room.name}</h3>
              <p className="text-sm text-gray-500 mb-2 capitalize">{room.type}</p>
              <p className="text-xs text-gray-500 mb-3">Capacidade: {room.capacity} pessoas</p>
              {room.equipment && Array.isArray(room.equipment) && room.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.equipment.map((eq, idx) => {
                    const equipObj = equipmentOptions.find((e) => e.id === eq);
                    const Icon = equipObj?.icon || Monitor;
                    return (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-lg bg-[#2703A6]/10 flex items-center justify-center"
                        title={equipObj?.label}
                      >
                        <Icon className="w-4 h-4 text-[#2703A6]" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
