-- +migrate Down
DELETE FROM journal_entries WHERE user_id = 1;
DELETE FROM encouragements WHERE user_id = 1;
DELETE FROM users WHERE email = 'admin@example.com'; 