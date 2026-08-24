"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, "Введите полное ФИО")
    .max(150, "ФИО слишком длинное"),

  age: z.coerce
    .number()
    .int("Возраст должен быть целым числом")
    .min(5, "Минимальный возраст — 5 лет")
    .max(100, "Проверьте указанный возраст"),

  phone: z
    .string()
    .trim()
    .min(10, "Введите корректный номер телефона")
    .max(30, "Номер телефона слишком длинный"),

  login: z
    .string()
    .trim()
    .min(4, "Логин должен содержать минимум 4 символа")
    .max(50, "Логин слишком длинный")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "В логине разрешены латинские буквы, цифры, точка, дефис и подчёркивание",
    )
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(72, "Пароль не должен превышать 72 символа"),

  personalDataConsent: z.string().optional(),
});

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  return null;
}

function registrationErrorUrl(message: string): string {
  return `/register?error=${encodeURIComponent(message)}`;
}

export async function registerAction(
  formData: FormData,
): Promise<void> {
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    age: formData.get("age"),
    phone: formData.get("phone"),
    login: formData.get("login"),
    password: formData.get("password"),
    personalDataConsent: formData.get(
      "personalDataConsent",
    ),
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ??
      "Проверьте введённые данные";

    redirect(registrationErrorUrl(message));
  }

  if (parsed.data.personalDataConsent !== "on") {
    redirect(
      registrationErrorUrl(
        "Необходимо согласие на обработку персональных данных",
      ),
    );
  }

  const normalizedPhone = normalizePhone(
    parsed.data.phone,
  );

  if (!normalizedPhone) {
    redirect(
      registrationErrorUrl(
        "Введите российский номер телефона в формате +7",
      ),
    );
  }

  let userId: string | null = null;
  let errorMessage: string | null = null;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            login: parsed.data.login,
          },
          {
            phone: normalizedPhone,
          },
        ],
      },
      select: {
        login: true,
        phone: true,
      },
    });

    if (existingUser?.login === parsed.data.login) {
      errorMessage =
        "Пользователь с таким логином уже зарегистрирован";
    } else if (existingUser?.phone === normalizedPhone) {
      errorMessage =
        "Пользователь с таким номером уже зарегистрирован";
    } else {
      const passwordHash = await hash(
        parsed.data.password,
        12,
      );

      const user = await prisma.user.create({
        data: {
          fullName: parsed.data.fullName,
          age: parsed.data.age,
          phone: normalizedPhone,
          login: parsed.data.login,
          passwordHash,
        },
        select: {
          id: true,
        },
      });

      userId = user.id;
    }
  } catch (error) {
    console.error("Registration database error:", error);

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      errorMessage =
        "Пользователь с таким логином или телефоном уже существует";
    } else {
      errorMessage =
        "Не удалось создать аккаунт. Повторите попытку";
    }
  }

  if (errorMessage) {
    redirect(registrationErrorUrl(errorMessage));
  }

  if (!userId) {
    redirect(
      registrationErrorUrl(
        "Не удалось создать аккаунт",
      ),
    );
  }

  let sessionCreationFailed = false;

  try {
    await createUserSession(userId);
  } catch (error) {
    console.error("Session creation error:", error);

    sessionCreationFailed = true;

    // Не оставляем аккаунт без рабочей сессии,
    // если это была только что выполненная регистрация.
    await prisma.user
      .delete({
        where: {
          id: userId,
        },
      })
      .catch(() => undefined);
  }

  if (sessionCreationFailed) {
    redirect(
      registrationErrorUrl(
        "Аккаунт не создан: не удалось открыть сессию",
      ),
    );
  }

  redirect("/dashboard");
}