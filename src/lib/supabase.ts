import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Coordinator {
  id: string;
  email: string;
  full_name: string;
  institution: string;
  created_at: string;
  updated_at: string;
}

export interface Professor {
  id: string;
  coordinator_id: string;
  full_name: string;
  email: string;
  additional_institution: string;
  work_shifts: string[];
  availability: string[];
  google_calendar_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  coordinator_id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  coordinator_id: string;
  professor_id: string;
  room_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  has_conflict: boolean;
  conflict_reason: string;
  created_at: string;
  updated_at: string;
}
