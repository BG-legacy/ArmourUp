-- +migrate Up
CREATE TABLE prayer_chains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE chain_members (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES prayer_chains(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chain_id, user_id)
);

CREATE TABLE prayer_commitments (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL REFERENCES prayer_chains(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES chain_members(id) ON DELETE CASCADE,
    pray_for_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chain_id, member_id, pray_for_user_id)
);

-- Create indexes
CREATE INDEX idx_prayer_chains_created_by ON prayer_chains(created_by_user_id);
CREATE INDEX idx_prayer_chains_created_at ON prayer_chains(created_at DESC);
CREATE INDEX idx_chain_members_chain_id ON chain_members(chain_id);
CREATE INDEX idx_chain_members_user_id ON chain_members(user_id);
CREATE INDEX idx_prayer_commitments_chain_id ON prayer_commitments(chain_id);
CREATE INDEX idx_prayer_commitments_member_id ON prayer_commitments(member_id);
CREATE INDEX idx_prayer_commitments_pray_for_user_id ON prayer_commitments(pray_for_user_id);




