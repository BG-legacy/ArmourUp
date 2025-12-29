-- Drop prayer_logs table
DROP TABLE IF EXISTS prayer_logs;

-- Remove added columns from prayer_requests
ALTER TABLE prayer_requests DROP COLUMN IF EXISTS status;
ALTER TABLE prayer_requests DROP COLUMN IF EXISTS answered_at;
ALTER TABLE prayer_requests DROP COLUMN IF EXISTS answer_testimony;




