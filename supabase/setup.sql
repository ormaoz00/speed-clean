-- =============================================
-- Speed Clean - Lead Table Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================

-- 1. Create the leads table
CREATE TABLE IF NOT EXISTS leads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Contact info
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,

  -- Service details
  service       TEXT,
  units         TEXT,
  city          TEXT,
  message       TEXT,

  -- Consent
  consent       BOOLEAN DEFAULT false,

  -- UTM tracking
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT,

  -- Page context
  page_url      TEXT,
  form_source   TEXT   -- which form: 'heroForm' or 'contactForm'
);

-- 2. Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous inserts (public form submissions)
CREATE POLICY "Allow anonymous inserts" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Block anonymous reads (leads are private data)
-- Only authenticated/service_role can SELECT
CREATE POLICY "Allow authenticated reads" ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Create index on created_at for fast sorting
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);

-- 6. Create index on phone for dedup lookups
CREATE INDEX idx_leads_phone ON leads (phone);
