import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, "Введите полное ФИО")
    .max(150, "ФИО слишком длинное"),

  age: z
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
    .toLowerCase()
    .min(4, "Логин должен содержать минимум 4 символа")
    .max(50, "Логин слишком длинный")
    .regex(
      /^[a-z0-9._-]+$/,
      "В логине разрешены только латинские буквы, цифры, точка, дефис и подчёркивание",
    ),

  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(72, "Пароль не должен превышать 72 символа"),

  personalDataConsent: z
    .boolean()
    .refine((value) => value, {
      message:
        "Необходимо согласие на обработку персональных данных",
    }),
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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsed.error.issues[0]?.message ??
            "Проверьте введённые данные",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedPhone = normalizePhone(
      parsed.data.phone,
    );

    if (!normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Введите российский номер телефона в формате +7",
        },
        {
          status: 400,
        },
      );
    }

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
      return NextResponse.json(
        {
          success: false,
          message:
            "Пользователь с таким логином уже зарегистрирован",
        },
        {
          status: 409,
        },
      );
    }

    if (existingUser?.phone === normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Пользователь с таким номером уже зарегистрирован",
        },
        {
          status: 409,
        },
      );
    }

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
        fullName: true,
        login: true,
        role: true,
      },
    });

    await createUserSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Аккаунт успешно создан",
        user,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Пользователь с такими данными уже существует",
        },
        {
          status: 409,
        },
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Не удалось создать аккаунт. Попробуйте ещё раз",
      },
      {
        status: 500,
      },
    );
  }
}