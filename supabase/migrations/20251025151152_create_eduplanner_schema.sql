/*
  # EduPlanner Schema - Academic Schedule Management System

  ## Overview
  This migration creates the complete database schema for EduPlanner, an academic schedule 
  coordination system that helps coordinators manage professors, rooms, and class schedules 
  with conflict detection.

  ## New Tables
  
  ### 1. `coordinators`
  - `id` (uuid, primary key) - Unique coordinator identifier
  - `email` (text, unique) - Login email
  - `password_hash` (text) - Hashed password
  - `full_name` (text) - Coordinator's full name
  - `institution` (text) - Academic institution name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `professors`
  - `id` (uuid, primary key) - Unique professor identifier
  - `coordinator_id` (uuid, foreign key) - Associated coordinator
  - `full_name` (text) - Professor's full name
  - `email` (text) - Contact email
  - `additional_institution` (text, optional) - Other affiliated institution
  - `work_shifts` (jsonb) - Available work shifts
  - `availability` (jsonb) - Available time slots (e.g., ["seg-19h00", "qua-20h45"])
  - `google_calendar_connected` (boolean) - Google Calendar sync status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `rooms`
  - `id` (uuid, primary key) - Unique room identifier
  - `coordinator_id` (uuid, foreign key) - Associated coordinator
  - `name` (text) - Room/lab name
  - `type` (text) - Type: "sala", "laboratório", "auditório"
  - `capacity` (integer) - Maximum capacity
  - `equipment` (jsonb) - Available equipment (projector, computers, etc.)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `schedules`
  - `id` (uuid, primary key) - Unique schedule identifier
  - `coordinator_id` (uuid, foreign key) - Associated coordinator
  - `professor_id` (uuid, foreign key) - Assigned professor
  - `room_id` (uuid, foreign key) - Assigned room
  - `day_of_week` (text) - Day: "Segunda", "Terça", "Quarta", "Quinta", "Sexta"
  - `start_time` (time) - Class start time
  - `end_time` (time) - Class end time
  - `has_conflict` (boolean) - Conflict detection flag
  - `conflict_reason` (text, optional) - Description of conflict
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Coordinators can only access their own data
  - Policies restrict SELECT, INSERT, UPDATE, DELETE to authenticated users
  - Data is isolated per coordinator using coordinator_id

  ## Important Notes
  - All timestamps use timestamptz for timezone awareness
  - JSONB fields allow flexible storage of availability and equipment data
  - Foreign keys ensure referential integrity
  - Indexes added for performance on frequently queried columns
*/

-- Create coordinators table
CREATE TABLE IF NOT EXISTS coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  institution text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create professors table
CREATE TABLE IF NOT EXISTS professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL REFERENCES coordinators(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  additional_institution text DEFAULT '',
  work_shifts jsonb DEFAULT '[]'::jsonb,
  availability jsonb DEFAULT '[]'::jsonb,
  google_calendar_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL REFERENCES coordinators(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'sala',
  capacity integer DEFAULT 30,
  equipment jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id uuid NOT NULL REFERENCES coordinators(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  has_conflict boolean DEFAULT false,
  conflict_reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_professors_coordinator ON professors(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_coordinator ON rooms(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_schedules_coordinator ON schedules(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_schedules_professor ON schedules(professor_id);
CREATE INDEX IF NOT EXISTS idx_schedules_room ON schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day_of_week, start_time);

-- Enable Row Level Security
ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coordinators table
CREATE POLICY "Coordinators can view own profile"
  ON coordinators FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Coordinators can update own profile"
  ON coordinators FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for professors table
CREATE POLICY "Coordinators can view own professors"
  ON professors FOR SELECT
  TO authenticated
  USING (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can insert own professors"
  ON professors FOR INSERT
  TO authenticated
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update own professors"
  ON professors FOR UPDATE
  TO authenticated
  USING (coordinator_id = auth.uid())
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can delete own professors"
  ON professors FOR DELETE
  TO authenticated
  USING (coordinator_id = auth.uid());

-- RLS Policies for rooms table
CREATE POLICY "Coordinators can view own rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can insert own rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update own rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (coordinator_id = auth.uid())
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can delete own rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (coordinator_id = auth.uid());

-- RLS Policies for schedules table
CREATE POLICY "Coordinators can view own schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can insert own schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update own schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (coordinator_id = auth.uid())
  WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can delete own schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (coordinator_id = auth.uid());

ALTER TABLE professors ADD COLUMN avatar_url TEXT;