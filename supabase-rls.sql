-- ============================================================
-- RLS POLICIES — Huntly (versión segura, solo CREATE)
-- Ejecutar en: Supabase → SQL Editor
--
-- La app usa service_role key → bypasea RLS → no se rompe nada.
-- Estas políticas solo bloquean accesos directos con la anon key.
-- ============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access_users" ON users
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ── 2. SAVED_LEADS ───────────────────────────────────────────
ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access_saved_leads" ON saved_leads
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ── 3. SEARCH_HISTORY ────────────────────────────────────────
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access_search_history" ON search_history
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ── 4. PRODUCT_EVENTS ────────────────────────────────────────
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access_product_events" ON product_events
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ── VERIFICACIÓN (ejecuta esto después) ──────────────────────
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','saved_leads','search_history','product_events');
-- Debe devolver rowsecurity = true para las 4 tablas.
