-- Add status and answer fields to prayer_requests
ALTER TABLE prayer_requests ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE prayer_requests ADD COLUMN answered_at TIMESTAMP NULL;
ALTER TABLE prayer_requests ADD COLUMN answer_testimony TEXT;

-- Create prayer_logs table to track who prayed
CREATE TABLE prayer_logs (
    id SERIAL PRIMARY KEY,
    prayer_request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prayer_request_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_prayer_logs_prayer_request_id ON prayer_logs(prayer_request_id);
CREATE INDEX idx_prayer_logs_user_id ON prayer_logs(user_id);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);



