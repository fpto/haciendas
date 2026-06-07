-- ============================================================================
-- Migración incremental: manejo de ganado a nivel de lote.
-- Pega TODO este archivo en: Neon Dashboard -> SQL Editor -> Run
-- (o aplica el esquema con `npm run db:push`).
--
-- Agrega:
--   - lots.plot_id            -> ubicación del lote en un potrero (plots)
--   - tabla "lot_weighings"   -> registros de pesado del lote
--       (fecha, peso promedio en kg, número de animales y notas)
-- Es idempotente: se puede correr varias veces sin error.
-- ============================================================================

-- Ubicación del lote: potrero asignado.
ALTER TABLE "lots" ADD COLUMN IF NOT EXISTS "plot_id" INTEGER;

CREATE INDEX IF NOT EXISTS "lots_plot_id_idx" ON "lots"("plot_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lots_plot_id_fkey'
  ) THEN
    ALTER TABLE "lots"
      ADD CONSTRAINT "lots_plot_id_fkey"
      FOREIGN KEY ("plot_id") REFERENCES "plots"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Registros de pesado del lote. El peso promedio se almacena en kg (canónico).
CREATE TABLE IF NOT EXISTS "lot_weighings" (
    "id" SERIAL NOT NULL,
    "lot_id" INTEGER,
    "date" DATE,
    "average_weight" DOUBLE PRECISION,
    "animal_count" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_weighings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "lot_weighings_lot_id_idx" ON "lot_weighings"("lot_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'lot_weighings_lot_id_fkey'
  ) THEN
    ALTER TABLE "lot_weighings"
      ADD CONSTRAINT "lot_weighings_lot_id_fkey"
      FOREIGN KEY ("lot_id") REFERENCES "lots"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
