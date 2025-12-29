-- Create progress_insights table for AI-generated monthly summaries
CREATE TABLE IF NOT EXISTS progress_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    summary TEXT NOT NULL,
    highlights TEXT,
    areas TEXT,
    verse TEXT,
    mood_stats TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, period)
);

-- Create index on user_id and period for faster lookups
CREATE INDEX idx_progress_insights_user_period ON progress_insights(user_id, period);
CREATE INDEX idx_progress_insights_user_id ON progress_insights(user_id);
CREATE INDEX idx_progress_insights_deleted_at ON progress_insights(deleted_at);


