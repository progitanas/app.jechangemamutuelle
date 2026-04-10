import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "Owner";

  if (!adminEmail || !adminPassword) {
    console.log(
      "No bootstrap user created. Define ADMIN_EMAIL and ADMIN_PASSWORD to create an admin account.",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName: adminFirstName,
      lastName: adminLastName,
      role: "ADMIN",
    },
    create: {
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin bootstrap complete", {
    adminId: admin.id,
    email: admin.email,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
