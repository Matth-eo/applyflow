CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'INTERVIEW', 'TECHNICAL_EXAM', 'OFFER', 'REJECTED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "company" VARCHAR(120) NOT NULL,
    "position" VARCHAR(160) NOT NULL,
    "location" VARCHAR(160) NOT NULL,
    "jobUrl" VARCHAR(2048) NOT NULL,
    "salary" VARCHAR(120),
    "appliedDate" DATE NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "notes" VARCHAR(10000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");
CREATE INDEX "Application_userId_status_createdAt_idx" ON "Application"("userId", "status", "createdAt");
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
