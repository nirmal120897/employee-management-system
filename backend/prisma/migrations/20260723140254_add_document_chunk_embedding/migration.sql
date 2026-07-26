-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "document_chunks" ADD COLUMN     "embedding" vector;

-- AlterTable
ALTER TABLE "employee_profiles" ADD COLUMN     "embedding" vector;
