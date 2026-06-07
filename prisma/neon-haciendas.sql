-- Crea la tabla de haciendas y registra la hacienda inicial "Nueva Joya".
CREATE TABLE IF NOT EXISTS "haciendas" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "haciendas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "haciendas_name_key" ON "haciendas"("name");

INSERT INTO "haciendas" ("name", "created_at", "updated_at")
VALUES ('Nueva Joya', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;
