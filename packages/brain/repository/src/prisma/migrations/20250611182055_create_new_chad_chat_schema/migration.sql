-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "llm_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "llm_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "defaultModelId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT,
    "assistantId" TEXT,
    "modelId" TEXT,
    "parentId" TEXT,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_chat" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "shareUpToMessageId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "llm_model_name_key" ON "llm_model"("name");

-- CreateIndex
CREATE INDEX "thread_createdAt_id_idx" ON "thread"("createdAt", "id");

-- CreateIndex
CREATE INDEX "thread_userId_idx" ON "thread"("userId");

-- CreateIndex
CREATE INDEX "thread_parentId_idx" ON "thread"("parentId");

-- CreateIndex
CREATE INDEX "message_threadId_idx" ON "message"("threadId");

-- CreateIndex
CREATE INDEX "message_parentId_idx" ON "message"("parentId");

-- CreateIndex
CREATE INDEX "message_createdAt_id_idx" ON "message"("createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_chat_shareId_key" ON "shared_chat"("shareId");

-- CreateIndex
CREATE INDEX "shared_chat_shareId_idx" ON "shared_chat"("shareId");

-- AddForeignKey
ALTER TABLE "assistant" ADD CONSTRAINT "assistant_defaultModelId_fkey" FOREIGN KEY ("defaultModelId") REFERENCES "llm_model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant" ADD CONSTRAINT "assistant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread" ADD CONSTRAINT "thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread" ADD CONSTRAINT "thread_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "assistant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread" ADD CONSTRAINT "thread_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "llm_model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_chat" ADD CONSTRAINT "shared_chat_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
