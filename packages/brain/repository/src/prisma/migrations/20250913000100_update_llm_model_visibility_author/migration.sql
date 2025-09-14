-- AlterTable: update LLM Model visibility/author fields
-- 1) Drop legacy default flag
-- 2) Add isPublic flag (default false)
-- 3) Add optional authorId referencing user(id)

ALTER TABLE "llm_model"
DROP COLUMN IF EXISTS "isDefault",
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "authorId" TEXT;

-- Add FK to user(id) for authorId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'llm_model_authorId_fkey'
      AND tc.table_name = 'llm_model'
  ) THEN
    ALTER TABLE "llm_model"
    ADD CONSTRAINT "llm_model_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;


