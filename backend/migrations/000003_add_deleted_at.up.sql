-- +migrate Up
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE journal_entries ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE encouragements ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

DO $$ 
BEGIN
    BEGIN
        CREATE INDEX idx_users_deleted_at ON users(deleted_at);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_journal_entries_deleted_at ON journal_entries(deleted_at);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
    
    BEGIN
        CREATE INDEX idx_encouragements_deleted_at ON encouragements(deleted_at);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
    END;
END $$; 