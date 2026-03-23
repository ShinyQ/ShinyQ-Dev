-- Migration: align food log schema with AI pipeline (2026-03-21)
\c caloriq

-- Allow image+text inputs and store numeric AI confidence
ALTER TABLE food_logs
    ALTER COLUMN ai_confidence TYPE DOUBLE PRECISION
    USING ai_confidence::double precision;

ALTER TABLE food_logs
    DROP CONSTRAINT IF EXISTS food_logs_input_type_check;
ALTER TABLE food_logs
    ADD CONSTRAINT food_logs_input_type_check
    CHECK (input_type IN ('text', 'image', 'image_text'));

-- Align sources with current backend (no mock)
ALTER TABLE food_entries
    ALTER COLUMN source SET DEFAULT 'azure_openai';

ALTER TABLE food_entries
    DROP CONSTRAINT IF EXISTS food_entries_source_check;
ALTER TABLE food_entries
    ADD CONSTRAINT food_entries_source_check
    CHECK (source IN ('api_ninjas', 'ai_estimate', 'manual', 'azure_openai'));

-- Keep runtime behavior aligned with ORM/models
ALTER TABLE food_cache
    ALTER COLUMN original_query DROP NOT NULL;

ALTER TABLE food_entries
    ADD COLUMN IF NOT EXISTS quantity_text VARCHAR(120);
