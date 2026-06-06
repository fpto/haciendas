import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@haciendas.mx";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "haciendas123";

  const passwordDigest = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordDigest, role: "admin" },
    create: {
      email,
      firstName: "Admin",
      lastName: "Haciendas",
      role: "admin",
      passwordDigest,
    },
  });

  console.log(`✔ Usuario administrador listo: ${user.email}`);
  console.log(`  Contraseña: ${password}`);
  console.log("  (cámbiala con SEED_ADMIN_PASSWORD antes de producción)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
