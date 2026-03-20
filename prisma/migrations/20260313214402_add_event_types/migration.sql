-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "eventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "eventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
