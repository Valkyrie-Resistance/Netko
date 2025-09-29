/*
  Warnings:

  - A unique constraint covering the columns `[id,threadId]` on the table `message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,userId]` on the table `thread` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "message_id_threadId_key" ON "message"("id", "threadId");

-- CreateIndex
CREATE UNIQUE INDEX "thread_id_userId_key" ON "thread"("id", "userId");
