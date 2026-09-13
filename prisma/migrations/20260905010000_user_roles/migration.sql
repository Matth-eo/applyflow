CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
CREATE INDEX "User_createdAt_id_idx" ON "User"("createdAt", "id");
CREATE INDEX "Application_createdAt_id_idx" ON "Application"("createdAt", "id");
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");
CREATE INDEX "Application_appliedDate_idx" ON "Application"("appliedDate");
