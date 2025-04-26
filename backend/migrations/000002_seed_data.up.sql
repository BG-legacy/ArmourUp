-- +migrate Up
-- Insert sample user
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@example.com', '$2a$10$X7J3Y5Z9B7D9F1H3J5L7N9P1R3T5V7X9Z1B3D5F7H9J1L3N5P7R9T1V3X5Z', 'admin');

-- Insert sample encouragements
INSERT INTO encouragements (user_id, message, category)
VALUES 
(1, 'You are stronger than you think!', 'motivation'),
(1, 'Every step forward is progress.', 'inspiration'),
(1, 'You have the power to change your story.', 'empowerment');

-- Insert sample journal entries
INSERT INTO journal_entries (user_id, title, content, mood, tags)
VALUES 
(1, 'First Day', 'Today was challenging but I learned a lot.', 'neutral', ARRAY['learning', 'growth']),
(1, 'Breakthrough', 'Finally understood a difficult concept!', 'happy', ARRAY['achievement', 'success']); 