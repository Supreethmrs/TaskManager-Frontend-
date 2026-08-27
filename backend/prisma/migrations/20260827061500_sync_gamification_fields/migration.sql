-- This migration documents changes that were already applied to the database directly (via db push or manual changes) on 2026-08-24-26. No SQL needs to run here since the database already matches this state.
-- AlterTable: User (add gamification fields)
ALTER TABLE "User" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN "streakCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastCompletedDate" TIMESTAMP(3);

-- AlterTable: Task (add priority, kanban, recurrence fields)
ALTER TABLE "Task" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "Task" ADD COLUMN "estimatedMinutes" INTEGER DEFAULT 25;
ALTER TABLE "Task" ADD COLUMN "kanbanStatus" TEXT NOT NULL DEFAULT 'TODO';
ALTER TABLE "Task" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Task" ADD COLUMN "recurrenceRule" TEXT;

-- CreateTable: TaskStep
CREATE TABLE "TaskStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskStep" ADD CONSTRAINT "TaskStep_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;