-- Migration: add city and consent columns to leads table
-- Run this in Supabase SQL Editor if the table already exists

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS city    TEXT,
  ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT false;
