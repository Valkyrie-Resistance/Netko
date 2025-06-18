/*
  Warnings:

  - You are about to drop the column `defaultModelId` on the `assistant` table. All the data in the column will be lost.
  - You are about to drop the column `maxTokens` on the `assistant` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `assistant` table. All the data in the column will be lost.
  - You are about to drop the column `tokenCount` on the `message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,name]` on the table `llm_model` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `provider` on the `llm_model` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ModelProvider" AS ENUM ('OPENAI', 'OPENROUTER', 'OLLAMA', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "assistant" DROP CONSTRAINT "assistant_defaultModelId_fkey";

-- DropIndex
DROP INDEX "llm_model_name_key";

-- AlterTable
ALTER TABLE "assistant" DROP COLUMN "defaultModelId",
DROP COLUMN "maxTokens",
DROP COLUMN "temperature";

-- AlterTable
ALTER TABLE "llm_model" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "provider",
ADD COLUMN     "provider" "ModelProvider" NOT NULL;

-- AlterTable
ALTER TABLE "message" DROP COLUMN "tokenCount";

-- AlterTable
ALTER TABLE "thread" ADD COLUMN     "currentModelId" TEXT;

-- CreateTable
CREATE TABLE "user_api_key" (
    "id" TEXT NOT NULL,
    "provider" "ModelProvider" NOT NULL,
    "keyName" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_api_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_api_key_userId_provider_idx" ON "user_api_key"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_key_userId_provider_keyName_key" ON "user_api_key"("userId", "provider", "keyName");

-- CreateIndex
CREATE INDEX "llm_model_provider_isActive_idx" ON "llm_model"("provider", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "llm_model_provider_name_key" ON "llm_model"("provider", "name");

-- AddForeignKey
ALTER TABLE "user_api_key" ADD CONSTRAINT "user_api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread" ADD CONSTRAINT "thread_currentModelId_fkey" FOREIGN KEY ("currentModelId") REFERENCES "llm_model"("id") ON DELETE SET NULL ON UPDATE CASCADE;
