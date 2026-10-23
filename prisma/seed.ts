import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_SUBJECTS } from "../src/lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const subject of DEFAULT_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
  }

  const adminEmail = "admin@tutor-match.local";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin1234!", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "ผู้ดูแลระบบ",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin: ${adminEmail} / Admin1234!`);
  }

  console.log(`Seeded ${DEFAULT_SUBJECTS.length} subjects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
