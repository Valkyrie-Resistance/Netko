/*
  Warnings:

  - You are about to drop the column `keyName` on the `user_api_key` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,provider]` on the table `user_api_key` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_api_key_userId_provider_keyName_key";

-- AlterTable
ALTER TABLE "user_api_key" DROP COLUMN "keyName";

-- CreateIndex
CREATE UNIQUE INDEX "user_api_key_userId_provider_key" ON "user_api_key"("userId", "provider");
