-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TRAINER');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('rose', 'green', 'black');

-- CreateEnum
CREATE TYPE "PlanAccent" AS ENUM ('rose', 'green', 'black', 'blue', 'amber', 'violet');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM (
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES',
  'CORE',
  'FULL_BODY',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('WARM_UP', 'FEEDER', 'NORMAL', 'FAILURE', 'DROP_SET');

-- CreateEnum
CREATE TYPE "ExerciseSource" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "theme" "ThemePreference" NOT NULL DEFAULT 'rose',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
  "id" UUID NOT NULL,
  "ownerUserId" UUID,
  "name" TEXT NOT NULL,
  "muscleGroup" "MuscleGroup" NOT NULL,
  "source" "ExerciseSource" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
  "id" UUID NOT NULL,
  "ownerUserId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "accent" "PlanAccent",
  "focusLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanExercise" (
  "id" UUID NOT NULL,
  "workoutPlanId" UUID NOT NULL,
  "exerciseId" UUID NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "PlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSet" (
  "id" UUID NOT NULL,
  "planExerciseId" UUID NOT NULL,
  "order" INTEGER NOT NULL,
  "setType" "SetType" NOT NULL,
  "targetReps" INTEGER,
  "targetLoadKg" DECIMAL(8,2),
  "notes" TEXT,
  CONSTRAINT "PlanSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
  "id" UUID NOT NULL,
  "ownerUserId" UUID NOT NULL,
  "workoutPlanId" UUID NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "durationSeconds" INTEGER,
  "planSnapshot" JSONB NOT NULL,
  CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionSet" (
  "id" UUID NOT NULL,
  "workoutSessionId" UUID NOT NULL,
  "exerciseId" UUID NOT NULL,
  "setType" "SetType" NOT NULL,
  "weightKg" DECIMAL(8,2) NOT NULL,
  "reps" INTEGER NOT NULL,
  "notes" TEXT,
  "isPR" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Exercise_ownerUserId_name_idx" ON "Exercise"("ownerUserId", "name");

-- CreateIndex
CREATE INDEX "Exercise_source_muscleGroup_name_idx" ON "Exercise"("source", "muscleGroup", "name");

-- CreateIndex
CREATE INDEX "WorkoutPlan_ownerUserId_idx" ON "WorkoutPlan"("ownerUserId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_ownerUserId_updatedAt_idx" ON "WorkoutPlan"("ownerUserId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlanExercise_workoutPlanId_order_key" ON "PlanExercise"("workoutPlanId", "order");

-- CreateIndex
CREATE INDEX "PlanExercise_exerciseId_idx" ON "PlanExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSet_planExerciseId_order_key" ON "PlanSet"("planExerciseId", "order");

-- CreateIndex
CREATE INDEX "WorkoutSession_ownerUserId_status_idx" ON "WorkoutSession"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "WorkoutSession_workoutPlanId_idx" ON "WorkoutSession"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_one_active_per_user" ON "WorkoutSession"("ownerUserId") WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "SessionSet_exerciseId_createdAt_idx" ON "SessionSet"("exerciseId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionSet_workoutSessionId_idx" ON "SessionSet"("workoutSessionId");

-- AddForeignKey
ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise"
ADD CONSTRAINT "Exercise_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan"
ADD CONSTRAINT "WorkoutPlan_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExercise"
ADD CONSTRAINT "PlanExercise_workoutPlanId_fkey"
FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExercise"
ADD CONSTRAINT "PlanExercise_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSet"
ADD CONSTRAINT "PlanSet_planExerciseId_fkey"
FOREIGN KEY ("planExerciseId") REFERENCES "PlanExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_workoutPlanId_fkey"
FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSet"
ADD CONSTRAINT "SessionSet_workoutSessionId_fkey"
FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSet"
ADD CONSTRAINT "SessionSet_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
