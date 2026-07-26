import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    if (existingAdmin) {
      console.log("[seedAdmin] Admin already exists - skipping");
      return;
    }

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn(
        "[seedAdmin] ADMIN_EMAIL/ADMIN_PASSWORD missing in .env - skipping auto-seed",
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await prisma.user.create({
      data: {
        name: ADMIN_NAME || "Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(`[seedAdmin] Default admin created: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("[seedAdmin] Failed:", error.message);
  }
};
