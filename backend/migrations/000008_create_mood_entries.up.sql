-- +migrate Up
-- Mood entries table for tracking daily emotional/spiritual check-ins
CREATE TABLE mood_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotional_state VARCHAR(50) NOT NULL,
    spiritual_state VARCHAR(50) NOT NULL,
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    gratitude TEXT,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_mood_entries_date ON mood_entries(date);
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date);
CREATE INDEX idx_mood_entries_deleted_at ON mood_entries(deleted_at);

