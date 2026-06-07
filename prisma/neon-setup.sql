-- ============================================================================
-- Setup inicial de la base de datos en Neon (Postgres)
-- Pega TODO este archivo en: Neon Dashboard -> SQL Editor -> Run
-- Crea las tablas y un usuario administrador:
--   email:    admin@haciendashn.com
--   password: haciendas123   (cámbiala después de entrar)
-- ============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "animals" (
    "id" SERIAL NOT NULL,
    "animal_number" INTEGER,
    "species" TEXT,
    "birthday" DATE,
    "ranch" TEXT,
    "lot_id" INTEGER,
    "status" TEXT,
    "breed" TEXT,
    "provider" TEXT,
    "mark" TEXT,
    "color" TEXT,
    "purchase_price" DOUBLE PRECISION,
    "sale_id" INTEGER,
    "sale_price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" SERIAL NOT NULL,
    "ranch" TEXT,
    "species" TEXT,
    "number" TEXT,
    "name" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plot_evaluations" (
    "id" SERIAL NOT NULL,
    "plot_id" INTEGER,
    "date" DATE,
    "water_score" INTEGER,
    "pasture_score" INTEGER,
    "fences_score" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plot_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plots" (
    "id" SERIAL NOT NULL,
    "number" TEXT,
    "area" DOUBLE PRECISION,
    "ranch" TEXT,
    "plot_type" TEXT,
    "comment" TEXT,
    "boundaries" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "date" DATE,
    "buyer" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weights" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER,
    "date" DATE,
    "weight" DOUBLE PRECISION,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "password_digest" TEXT,
    "role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "animals_lot_id_idx" ON "animals"("lot_id");

-- CreateIndex
CREATE INDEX "animals_sale_id_idx" ON "animals"("sale_id");

-- CreateIndex
CREATE INDEX "plot_evaluations_plot_id_idx" ON "plot_evaluations"("plot_id");

-- CreateIndex
CREATE INDEX "weights_animal_id_idx" ON "weights"("animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_evaluations" ADD CONSTRAINT "plot_evaluations_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================================
-- Usuario administrador inicial (contraseña: haciendas123)
-- ============================================================================
INSERT INTO "users" ("first_name","last_name","email","password_digest","role","created_at","updated_at")
VALUES ('Admin','Haciendas','admin@haciendashn.com','$2a$10$ZMD7BDr9NKiBVElmis4zGOiSOI0Rz5l8HpEWg5bFMEOu8TGyrvTEu','admin', NOW(), NOW())
ON CONFLICT ("email") DO UPDATE
  SET "password_digest" = EXCLUDED."password_digest", "role" = 'admin';
