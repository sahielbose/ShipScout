-- Raw migration to add pgvector columns (CONTEXT.md section 6).
-- Run after `prisma migrate dev` / `prisma db push`.
-- The vector dimension must match EMBEDDING_DIM and the Voyage model you pick.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Capability" ADD COLUMN IF NOT EXISTS embedding vector(1024);
ALTER TABLE "DeveloperProfile" ADD COLUMN IF NOT EXISTS "profileEmbedding" vector(1024);

CREATE INDEX IF NOT EXISTS capability_embedding_idx
  ON "Capability" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS developer_profile_embedding_idx
  ON "DeveloperProfile" USING hnsw ("profileEmbedding" vector_cosine_ops);
