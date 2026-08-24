import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "anna_training_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 90;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(
  userId: string,
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000,
  );

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          login: true,
          fullName: true,
          phone: true,
          age: true,
          role: true,
          isBlocked: true,
          mustChangePassword: true,
          vkUserId: true,
          vkMessagesAllowed: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  if (session.user.isBlocked) {
    return null;
  }

  return session.user;
}