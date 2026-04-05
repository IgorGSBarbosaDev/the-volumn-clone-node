ALTER TABLE "WorkoutSession"
ADD COLUMN "planSnapshot" JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX "WorkoutSession_one_active_per_user"
ON "WorkoutSession" ("ownerUserId")
WHERE "status" = 'ACTIVE';
