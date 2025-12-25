-- +migrate Down
DROP INDEX IF EXISTS idx_prayer_requests_created_at;
DROP INDEX IF EXISTS idx_prayer_requests_user_id;
DROP TABLE IF EXISTS prayer_requests;

