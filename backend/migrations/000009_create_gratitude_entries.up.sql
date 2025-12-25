CREATE TABLE IF NOT EXISTS gratitude_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    blessing TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT,
    reflection TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_gratitude_user_id ON gratitude_entries(user_id);
CREATE INDEX idx_gratitude_created_at ON gratitude_entries(created_at);
CREATE INDEX idx_gratitude_category ON gratitude_entries(category);
CREATE INDEX idx_gratitude_deleted_at ON gratitude_entries(deleted_at);

