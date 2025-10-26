/*
  # Create player progress table for Core Builder game

  1. New Tables
    - `player_progress`
      - `id` (uuid, primary key) - Unique identifier
      - `player_id` (text, unique) - Player identifier (default user)
      - `resources` (jsonb) - Array of resource objects with materialId and amount
      - `hammer` (jsonb) - Hammer stats object with level, power, and speed
      - `auto_miners` (integer) - Number of automatic miners
      - `discovered_materials` (text[]) - Array of discovered material IDs
      - `buildings` (jsonb) - Array of placed buildings with positions
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `player_progress` table
    - Add policy for public access (single-player idle game)
    
  3. Notes
    - Using jsonb for flexible data structures
    - Default values ensure game starts in clean state
    - Public access allowed as this is a client-side idle game
*/

CREATE TABLE IF NOT EXISTS player_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text UNIQUE NOT NULL DEFAULT 'default',
  resources jsonb DEFAULT '[]'::jsonb,
  hammer jsonb DEFAULT '{"level": 1, "power": 10, "speed": 1}'::jsonb,
  auto_miners integer DEFAULT 0,
  discovered_materials text[] DEFAULT ARRAY[]::text[],
  buildings jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to player progress"
  ON player_progress
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
