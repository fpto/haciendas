-- ============================================================================
-- Migración incremental: corrales (encierros) con ubicación puntual.
-- Pega TODO este archivo en: Neon Dashboard -> SQL Editor -> Run
-- (o aplica el esquema con `npm run db:push`).
--
-- Agrega:
--   - tabla "corrals"   -> corral con ubicación puntual (latitud/longitud)
--   - lots.corral_id    -> corral asignado al lote (análogo a plot_id)
-- Es idempotente: se puede correr varias veces sin error.
-- ============================================================================

-- Corral: ubicación puntual (a diferencia del potrero, que es un polígono).
CREATE TABLE IF NOT EXISTS "corrals" (
    "id" SERIAL NOT NULL,
    "number" TEXT,
    "ranch" TEXT,
    "comment" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrals_pkey" PRIMARY KEY ("id")
);

-- Ubicación del lote: corral asignado.
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "corral_id" INTEGER;

CREATE INDEX IF NOT EXISTS "lots_corral_id_idx" ON "lots"("corral_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lots_corral_id_fkey'
  ) THEN
    ALTER TABLE "lots"
      ADD CONSTRAINT "lots_corral_id_fkey"
      FOREIGN KEY ("corral_id") REFERENCES "corrals"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
