-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';
