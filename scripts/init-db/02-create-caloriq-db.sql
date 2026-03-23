-- Create CalorIQ database and user
SELECT 'CREATE DATABASE caloriq' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'caloriq')\gexec
GRANT ALL PRIVILEGES ON DATABASE caloriq TO shinyq;

-- Connect to caloriq database and create tables
\c caloriq

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (1:1 with users)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
    goal VARCHAR(10) CHECK (goal IN ('lose', 'maintain', 'gain')),
    daily_calorie_target INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Food logs (one per submission)
CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_type VARCHAR(12) NOT NULL CHECK (input_type IN ('text', 'image', 'image_text')),
    original_input TEXT,
    normalized_query TEXT,
    image_url TEXT,
    ai_extracted_text TEXT,
    ai_confidence DOUBLE PRECISION,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at);

-- Food entries (individual items)
CREATE TABLE IF NOT EXISTS food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_log_id UUID NOT NULL REFERENCES food_logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbohydrates_total_g DECIMAL(8,2),
    fat_total_g DECIMAL(8,2),
    fat_saturated_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    potassium_mg DECIMAL(8,2),
    cholesterol_mg DECIMAL(8,2),
    serving_size_g DECIMAL(8,2),
    quantity_text VARCHAR(120),
    meal_type VARCHAR(10) NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snacks')),
    logged_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(20) DEFAULT 'azure_openai' CHECK (source IN ('api_ninjas', 'ai_estimate', 'manual', 'azure_openai')),
    raw_api_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_entries_user_date ON food_entries(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_food_entries_meal ON food_entries(user_id, meal_type, logged_at);

-- Food cache (for quick re-add)
CREATE TABLE IF NOT EXISTS food_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    original_query TEXT,
    calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbohydrates_total_g DECIMAL(8,2),
    fat_total_g DECIMAL(8,2),
    serving_size_g DECIMAL(8,2),
    times_logged INTEGER DEFAULT 1,
    last_logged_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_food_cache_user ON food_cache(user_id, last_logged_at DESC);
