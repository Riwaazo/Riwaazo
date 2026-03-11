-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EVENT_PLANNER';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventPlannerId" UUID;

-- CreateTable
CREATE TABLE "EventPlannerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT,
    "services" TEXT,
    "description" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPlannerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventPlannerProfile_userId_key" ON "EventPlannerProfile"("userId");

-- CreateIndex
CREATE INDEX "Event_eventPlannerId_idx" ON "Event"("eventPlannerId");

-- AddForeignKey
ALTER TABLE "EventPlannerProfile" ADD CONSTRAINT "EventPlannerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventPlannerId_fkey" FOREIGN KEY ("eventPlannerId") REFERENCES "EventPlannerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
