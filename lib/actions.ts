"use server";

import { z } from "zod";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
  phone: z.string().min(1, "Phone number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function registerUser(formData: z.infer<typeof signupSchema>) {
  try {
    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: "Invalid form data" };
    }

    const { email, password, fullName, phone } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return { error: "User already exists with this email." };
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    await prisma.user.create({
      data: {
        email,
        name: fullName,
        phone,
        password: passwordHash,
        role: "CUSTOMER",
      }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to register." };
  }
}
