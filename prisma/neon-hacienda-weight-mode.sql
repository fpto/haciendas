-- ============================================================================
-- Migración incremental: modo de medición de peso por hacienda.
-- Pega TODO este archivo en: Neon Dashboard -> SQL Editor -> Run
-- (o aplica el esquema con `npm run db:push`).
--
-- Agrega:
--   - haciendas.weight_mode -> modo de medición de peso del ganado.
--       "lot"    = Por Lote   (peso promedio del lote, tabla lot_weighings)
--       "animal" = Por Animal (peso individual, tabla weights)
-- Es idempotente: se puede correr varias veces sin error.
-- ============================================================================

ALTER TABLE "haciendas"
  ADD COLUMN IF NOT EXISTS "weight_mode" TEXT NOT NULL DEFAULT 'lot';
