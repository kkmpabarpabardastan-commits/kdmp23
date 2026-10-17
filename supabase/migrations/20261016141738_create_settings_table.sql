/*
# Create settings table for KDMP admin password

## Overview
Creates a key-value settings table to store the staff admin password for the
Administrasi page. The password can be changed by authenticated staff.

## New Tables
- `settings`
  - id (uuid, PK)
  - key (text, unique) — setting key e.g. 'admin_password'
  - value (text) — setting value
  - updated_at (timestamptz)

## Seed
- Default admin password: 'kdmp2024'

## Security
- RLS enabled, anon + authenticated CRUD (single-tenant, no-auth app).
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
TO anon, authenticated USING (true);

-- Seed default password
INSERT INTO settings (key, value) VALUES ('admin_password', 'kdmp2024')
ON CONFLICT (key) DO NOTHING;
