-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "age" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "vkUserId" VARCHAR(30),
    "vkMessagesAllowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_vkUserId_key" ON "User"("vkUserId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
