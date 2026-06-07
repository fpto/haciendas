-- ============================================================================
-- Migración incremental: estado y venta del lote (modo "Por Lote").
-- Pega TODO este archivo en: Neon Dashboard -> SQL Editor -> Run
-- (o aplica el esquema con `npm run db:push`).
--
-- Agrega a la tabla "lots":
--   - status       -> estado del lote: "growing" (en crecimiento, por defecto),
--                     "sold" (vendido) o "destroyed" (destruido).
--   - sale_date    -> fecha de la venta (solo aplica cuando status = "sold").
--   - buyer        -> comprador del lote.
--   - sale_price   -> precio de venta por kilogramo.
--   - sale_comment -> comentario de la venta.
-- Es idempotente: se puede correr varias veces sin error.
-- ============================================================================

ALTER TABLE "lots"
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'growing';

-- Asegura que los lotes existentes queden "en crecimiento".
UPDATE "lots" SET "status" = 'growing' WHERE "status" IS NULL;

ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "sale_date" DATE;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "buyer" TEXT;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "sale_price" DOUBLE PRECISION;
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "sale_comment" TEXT;
