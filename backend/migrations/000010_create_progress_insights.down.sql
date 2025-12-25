-- Drop progress_insights table
DROP INDEX IF EXISTS idx_progress_insights_deleted_at;
DROP INDEX IF EXISTS idx_progress_insights_user_id;
DROP INDEX IF EXISTS idx_progress_insights_user_period;
DROP TABLE IF EXISTS progress_insights;

