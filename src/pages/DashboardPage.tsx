import { useState, useEffect } from 'react';
import { Plus, Users, DoorOpen, Calendar, RefreshCw } from 'lucide-react';
import { supabase, Professor, Room, Schedule } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/ToastNotification';

interface DashboardPageProps {
  onShowToast: (toast: Toast) => void;
}

interface DragData {
  type: 'professor' | 'room';
  id: string;
  name: string;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const TIME_SLOTS = [
  { id: 'slot-19h00', label: '19:00 - 20:30', start: '19:00', end: '20:30' },
  { id: 'slot-20h30', label: 'Intervalo', start: '20:30', end: '20:45', isBreak: true },
  { id: 'slot-20h45', label: '20:45 - 22:15', start: '20:45', end: '22:15' },
];

export default function DashboardPage({ onShowToast }: DashboardPageProps) {
  const { user } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [tempSchedule, setTempSchedule] = useState<{
    professorId?: string;
    roomId?: string;
    day?: string;
    timeSlot?: string;
  }>({});
  const [hoveredProfessor, setHoveredProfessor] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const [profsData, roomsData, schedulesData] = await Promise.all([
      supabase.from('professors').select('*').order('full_name'),
      supabase.from('rooms').select('*').order('name'),
      supabase.from('schedules').select('*'),
    ]);

    if (profsData.data) setProfessors(profsData.data);
    if (roomsData.data) setRooms(roomsData.data);
    if (schedulesData.data) setSchedules(schedulesData.data);
  };

  const handleDragStart = (type: 'professor' | 'room', id: string, name: string) => {
    setDragData({ type, id, name });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (day: string, timeSlot: typeof TIME_SLOTS[0]) => {
    if (!dragData || timeSlot.isBreak) return;

    if (dragData.type === 'professor') {
      setTempSchedule((prev) => ({
        ...prev,
        professorId: dragData.id,
        day,
        timeSlot: timeSlot.id,
      }));
    } else if (dragData.type === 'room') {
      setTempSchedule((prev) => ({
        ...prev,
        roomId: dragData.id,
        day,
        timeSlot: timeSlot.id,
      }));
    }

    const newSchedule = {
      ...tempSchedule,
      [dragData.type === 'professor' ? 'professorId' : 'roomId']: dragData.id,
      day,
      timeSlot: timeSlot.id,
    };

    if (newSchedule.professorId && newSchedule.roomId && newSchedule.day && newSchedule.timeSlot) {
      await createSchedule(
        newSchedule.professorId,
        newSchedule.roomId,
        newSchedule.day,
        timeSlot.start,
        timeSlot.end
      );
      setTempSchedule({});
    }

    setDragData(null);
  };

  const createSchedule = async (
    professorId: string,
    roomId: string,
    day: string,
    startTime: string,
    endTime: string
  ) => {
    const conflict = detectConflict(professorId, roomId, day, startTime);

    const { error } = await supabase.from('schedules').insert({
      coordinator_id: user!.id,
      professor_id: professorId,
      room_id: roomId,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      has_conflict: conflict.hasConflict,
      conflict_reason: conflict.reason,
    });

    if (!error) {
      await loadData();
      if (conflict.hasConflict) {
        onShowToast({
          id: Date.now().toString(),
          type: 'error',
          message: `⚠ Conflito detectado: ${conflict.reason}`,
        });
      } else {
        onShowToast({
          id: Date.now().toString(),
          type: 'success',
          message: '✅ Horário atualizado com sucesso!',
        });
      }
    }
  };

  const detectConflict = (professorId: string, roomId: string, day: string, startTime: string) => {
    const professorConflict = schedules.find(
      (s) => s.professor_id === professorId && s.day_of_week === day && s.start_time === startTime
    );

    const roomConflict = schedules.find(
      (s) => s.room_id === roomId && s.day_of_week === day && s.start_time === startTime
    );

    if (professorConflict) {
      return { hasConflict: true, reason: 'Professor já possui aula neste horário' };
    }

    if (roomConflict) {
      return { hasConflict: true, reason: 'Sala já está ocupada neste horário' };
    }

    return { hasConflict: false, reason: '' };
  };

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    const slot = TIME_SLOTS.find((t) => t.id === timeSlot);
    if (!slot) return null;

    return schedules.find(
      (s) => s.day_of_week === day && s.start_time === slot.start
    );
  };

  const getProfessorById = (id: string) => professors.find((p) => p.id === id);
  const getRoomById = (id: string) => rooms.find((r) => r.id === id);

  return (
    <div id="page-dashboard" className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#2703A6]">Painel do Coordenador</h1>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2703A6] text-white hover:bg-[#201AD9] transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="dashboard-professores" className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#2703A6]" />
              <h2 className="text-lg font-semibold text-gray-800">Professores</h2>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {professors.map((prof) => (
                <div
                  key={prof.id}
                  id={`professor-card-${prof.id}`}
                  draggable
                  onDragStart={() => handleDragStart('professor', prof.id, prof.full_name)}
                  onMouseEnter={() => setHoveredProfessor(prof.id)}
                  onMouseLeave={() => setHoveredProfessor(null)}
                  className="bg-gradient-to-br from-[#2703A6]/5 to-[#4945BF]/5 rounded-xl p-3 cursor-move hover:shadow-md transition-all duration-200 border border-[#2703A6]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2703A6] to-[#4945BF] flex items-center justify-center text-white font-semibold text-sm">
                      {prof.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{prof.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{prof.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                id="btn-add-professor"
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-[#2703A6] hover:bg-[#2703A6]/5 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-[#2703A6]"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium text-sm">Adicionar Professor</span>
              </button>
            </div>
          </div>
        </div>

        <div id="grade-horarios" className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#2703A6]" />
              <h2 className="text-lg font-semibold text-gray-800">Grade de Horários</h2>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-6 gap-2">
                  <div className="font-semibold text-sm text-gray-700 p-2"></div>
                  {DAYS.map((day) => (
                    <div key={day} id={`col-${day.toLowerCase()}`} className="font-semibold text-sm text-center text-gray-700 p-2">
                      {day}
                    </div>
                  ))}

                  {TIME_SLOTS.map((slot) => (
                    <>
                      <div key={`label-${slot.id}`} className="font-medium text-xs text-gray-600 p-2 flex items-center">
                        {slot.label.split(' - ')[0]}
                      </div>
                      {DAYS.map((day) => {
                        const schedule = getScheduleForSlot(day, slot.id);
                        const professor = schedule ? getProfessorById(schedule.professor_id) : null;
                        const room = schedule ? getRoomById(schedule.room_id) : null;

                        return (
                          <div
                            key={`${day}-${slot.id}`}
                            id={`schedule-block-${day}-${slot.id}`}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(day, slot)}
                            className={`rounded-xl p-2 min-h-[80px] transition-all duration-200 ${
                              slot.isBreak
                                ? 'bg-[#D9D9D9] cursor-not-allowed'
                                : schedule?.has_conflict
                                ? 'bg-[#FF0000]/10 border-2 border-[#FF0000]'
                                : schedule
                                ? 'bg-[#201AD9]/10 border border-[#201AD9]/30'
                                : 'bg-gray-50 border border-gray-200 hover:border-[#2703A6] hover:bg-[#2703A6]/5'
                            }`}
                          >
                            {slot.isBreak ? (
                              <p className="text-xs text-gray-600 text-center">Intervalo</p>
                            ) : schedule ? (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                  {professor?.full_name}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {room?.name}
                                </p>
                                {schedule.has_conflict && (
                                  <p className="text-xs text-[#FF0000] font-medium">⚠ Conflito</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 text-center">Arraste aqui</p>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="dashboard-salas" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            draggable
            onDragStart={() => handleDragStart('room', room.id, room.name)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-all duration-200 hover:border-[#2703A6]"
          >
            <DoorOpen className="w-8 h-8 text-[#4945BF] mb-2" />
            <p className="font-semibold text-sm text-gray-800 truncate">{room.name}</p>
            <p className="text-xs text-gray-500">Cap: {room.capacity}</p>
          </div>
        ))}
        <button
          id="btn-add-sala"
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#2703A6] hover:bg-[#2703A6]/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-[#2703A6]"
        >
          <Plus className="w-8 h-8" />
          <span className="font-medium text-xs">Adicionar Sala</span>
        </button>
      </div>
    </div>
  );
}
