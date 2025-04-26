-- +migrate Down
DROP INDEX IF EXISTS idx_users_deleted_at;
DROP INDEX IF EXISTS idx_journal_entries_deleted_at;
DROP INDEX IF EXISTS idx_encouragements_deleted_at;

ALTER TABLE users DROP COLUMN deleted_at;
ALTER TABLE journal_entries DROP COLUMN deleted_at;
ALTER TABLE encouragements DROP COLUMN deleted_at; 