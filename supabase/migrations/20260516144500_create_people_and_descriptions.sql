/*
  # Create people and descriptions tables

  1. New Tables
    - `people`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) - the name of the person
      - `created_at` (timestamptz) - when the person was added
    - `descriptions`
      - `id` (uuid, primary key)
      - `person_id` (uuid, foreign key to people) - which person this describes
      - `content` (text, not null) - the description text
      - `author_name` (text) - optional name of the person who wrote it
      - `created_at` (timestamptz) - when the description was submitted

  2. Security
    - Enable RLS on both tables
    - Anyone can read people (public list for selection)
    - Anyone can insert descriptions (public submission)
    - Anyone can read descriptions (for display)
    - Only admin can insert/update/delete people (admin managed via edge function)
*/

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_name text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE descriptions ENABLE ROW LEVEL SECURITY;

-- People: anyone can read (needed for the public selection page)
CREATE POLICY "Anyone can read people"
  ON people FOR SELECT
  TO anon, authenticated
  USING (true);

-- People: only admin can insert (handled via edge function with service role)
-- No INSERT/UPDATE/DELETE policies for anon on people table

-- Descriptions: anyone can read
CREATE POLICY "Anyone can read descriptions"
  ON descriptions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Descriptions: anyone can insert (public submission)
CREATE POLICY "Anyone can insert descriptions"
  ON descriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_descriptions_person_id ON descriptions(person_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
