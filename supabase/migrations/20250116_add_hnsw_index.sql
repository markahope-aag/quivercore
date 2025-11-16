-- Add HNSW index for better vector search performance at scale
-- This is an optional optimization for when you have >500K prompts with embeddings
-- HNSW provides better accuracy and performance for large datasets compared to IVFFlat

-- Note: This migration is optional and should only be run when:
-- 1. You have >500K prompts with embeddings
-- 2. Vector search queries are taking >200ms
-- 3. You want better search accuracy

-- Drop existing IVFFlat index if it exists (optional - you can keep both)
-- DROP INDEX IF EXISTS idx_prompts_embedding;

-- Create HNSW index for vector similarity search
-- HNSW (Hierarchical Navigable Small World) is more accurate and faster for large datasets
CREATE INDEX IF NOT EXISTS idx_prompts_embedding_hnsw 
ON prompts 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index parameters:
-- m = 16: Number of connections per layer (higher = more accurate, slower to build)
-- ef_construction = 64: Size of candidate list during construction (higher = more accurate, slower to build)

-- Performance characteristics:
-- Build time: ~2-5x slower than IVFFlat
-- Query speed: Similar or slightly faster than IVFFlat
-- Accuracy: Better than IVFFlat (especially for large datasets)
-- Memory: Slightly higher memory usage

-- Usage:
-- The database will automatically use the HNSW index if it exists
-- You can drop the IVFFlat index after verifying HNSW works well:
-- DROP INDEX IF EXISTS idx_prompts_embedding;

