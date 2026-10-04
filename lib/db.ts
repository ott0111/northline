import { neon } from '@neondatabase/serverless';

export const db = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function ensureTalentTable() {
  if (!db) return false;
  await db`CREATE TABLE IF NOT EXISTS northline_talent_profiles (
    talent_handle TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Talent',
    discipline TEXT NOT NULL DEFAULT '',
    public_status TEXT NOT NULL DEFAULT 'published',
    pfp TEXT NOT NULL DEFAULT '',
    socials JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  return true;
}
