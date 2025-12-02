import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash("Asdfgh08@", 10);
    
    const adminUser = await db.insert(users).values({
      name: "Admin",
      email: "khalilmukhtar08@gmail.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      balance: "0.00",
    }).returning();

    console.log("✅ Admin user created successfully:", adminUser[0].email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

seed();
