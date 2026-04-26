-- Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/pzzunxgbzkhdqemmgavd/editor

CREATE TABLE IF NOT EXISTS sourcing_products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  site        TEXT,
  cat         TEXT,
  wholesale   TEXT,
  retail      TEXT,
  img         TEXT,
  memo        TEXT,
  link        TEXT,
  brand       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 누구나 읽기/쓰기 가능 (관리자 전용 페이지이므로 RLS 비활성화)
ALTER TABLE sourcing_products DISABLE ROW LEVEL SECURITY;
