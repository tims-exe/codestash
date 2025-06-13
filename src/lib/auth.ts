import * as bcrypt from "bcryptjs";
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

    const userForReturn: User = {
      id: user.id,
      username: user.username,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    return { success: true, user: userForReturn };
  } catch (error: unknown) {
    // Handle unique constraint error (Prisma error code P2002)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      return { success: false, error: "Username already exists" };
    }

    console.error('Create user error:', error);
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

    const userForReturn: User = {
      id: user.id,
      username: user.username,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    return { success: true, user: userForReturn };
  } catch (error: unknown) {
    console.error('Verify user error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}