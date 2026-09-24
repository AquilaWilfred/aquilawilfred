-- ═══════════════════════════════════════════════════════
-- Aquila Portfolio Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  long_desc   TEXT,
  tech        TEXT[]   DEFAULT '{}',
  stats       JSONB    DEFAULT '{}',
  category    TEXT,
  image       TEXT,
  featured    BOOLEAN  DEFAULT FALSE,
  github      TEXT     DEFAULT '#',
  live        TEXT     DEFAULT '#',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  content    TEXT,
  tags       TEXT[]   DEFAULT '{}',
  date       DATE     DEFAULT CURRENT_DATE,
  read_time  TEXT,
  image      TEXT,
  published  BOOLEAN  DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table with Cloudinary metadata columns
CREATE TABLE IF NOT EXISTS gallery (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  category    TEXT,
  image       TEXT,
  tags        TEXT[]   DEFAULT '{}',
  source      TEXT     DEFAULT 'url',      -- 'cloudinary' | 'url'
  public_id   TEXT,                        -- Cloudinary public_id
  file_format TEXT,                        -- jpg, png, webp etc
  file_bytes  INT,                         -- file size in bytes
  img_width   INT,
  img_height  INT,
  visible     BOOLEAN  DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id         TEXT PRIMARY KEY,
  title      TEXT,
  url        TEXT,
  thumbnail  TEXT,
  category   TEXT DEFAULT 'Demo',
  visible    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS owner_settings (
  id   INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL
);

-- RLS: public read, service role write
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery        ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read projects"       ON projects       FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts"     ON blog_posts     FOR SELECT USING (true);
CREATE POLICY "Public read gallery"        ON gallery        FOR SELECT USING (true);
CREATE POLICY "Public read videos"         ON videos         FOR SELECT USING (true);
CREATE POLICY "Public read owner_settings" ON owner_settings FOR SELECT USING (true);

CREATE POLICY "Service write projects"       ON projects       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write blog_posts"     ON blog_posts     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write gallery"        ON gallery        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write videos"         ON videos         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write owner_settings" ON owner_settings FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════
-- Additional tables (run if not already created)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS services (
  id             TEXT PRIMARY KEY,
  icon           TEXT DEFAULT '🔧',
  title          TEXT NOT NULL,
  description    TEXT DEFAULT '',
  prices         JSONB DEFAULT '{"KSH":0,"USD":0,"EUR":0,"CNY":0,"GBP":0}',
  exchange_rates JSONB DEFAULT '{"USD":{"buying":129,"selling":131},"EUR":{"buying":140,"selling":142},"CNY":{"buying":18,"selling":19},"GBP":{"buying":163,"selling":165}}',
  feasibility    TEXT DEFAULT '',
  visible        BOOLEAN DEFAULT TRUE,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience (
  id          TEXT PRIMARY KEY,
  role        TEXT,
  company     TEXT,
  period      TEXT,
  location    TEXT,
  highlights  TEXT[] DEFAULT '{}',
  visible     BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS socials (
  id          TEXT PRIMARY KEY,
  platform    TEXT,
  url         TEXT DEFAULT '',
  icon        TEXT DEFAULT '🔗',
  visible     BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0
);

ALTER TABLE services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience  ENABLE ROW LEVEL SECURITY;
ALTER TABLE socials     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read services"    ON services    FOR SELECT USING (true);
CREATE POLICY "Public read experience"  ON experience  FOR SELECT USING (true);
CREATE POLICY "Public read socials"     ON socials     FOR SELECT USING (true);

CREATE POLICY "Service write services"    ON services    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write experience"  ON experience  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write socials"     ON socials     FOR ALL USING (auth.role() = 'service_role');
