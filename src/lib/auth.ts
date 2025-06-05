/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import { AuthResult, User } from "../types/auth";
import { prisma } from "./prisma";

export async function createUser(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        created_at: true,
        updated_at: true,
      },
    });

    return { success: true, user: user as User };
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Username already exists" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function verifyUser(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: "User not Found" };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return { success: false, error: "Invalid Password" };
    }

    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword as User };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}