-- ========================================
-- Inversion Excursion Database Schema
-- Production-ready PostgreSQL schema for Supabase
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- Core Tables
-- ========================================

-- Player profiles (linked to wallet addresses)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL UNIQUE,
    farcaster_fid INTEGER,
    farcaster_username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    cell_id UUID,
    resonance_score INTEGER DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_draws INTEGER DEFAULT 0,
    tokens_earned NUMERIC DEFAULT 0,
    tokens_spent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_wallet CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Cells (player groups)
CREATE TABLE IF NOT EXISTS cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    formation_number INTEGER NOT NULL,
    leader_id UUID REFERENCES players(id) ON DELETE SET NULL,
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 5,
    resonance_pool NUMERIC DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dissolved_at TIMESTAMPTZ,
    
    CONSTRAINT valid_cell_size CHECK (member_count <= max_members)
);

-- Cell membership
CREATE TABLE IF NOT EXISTS cell_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cell_id UUID NOT NULL REFERENCES cells(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    contribution_score INTEGER DEFAULT 0,
    
    UNIQUE(cell_id, player_id)
);

-- Battles
CREATE TABLE IF NOT EXISTS battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash TEXT,
    chain_id INTEGER,
    initiator_id UUID NOT NULL REFERENCES players(id),
    opponent_id UUID REFERENCES players(id),
    cell_battle BOOLEAN DEFAULT FALSE,
    cell_id UUID REFERENCES cells(id),
    opponent_cell_id UUID REFERENCES cells(id),
    battle_type TEXT DEFAULT 'solo' CHECK (battle_type IN ('solo', 'cell', 'tournament')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    winner_id UUID REFERENCES players(id),
    initiator_deck JSONB,
    opponent_deck JSONB,
    initiator_score INTEGER,
    opponent_score INTEGER,
    resonance_multiplier NUMERIC DEFAULT 1.0,
    reward_tokens NUMERIC DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards in player inventories
CREATE TABLE IF NOT EXISTS player_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    card_type TEXT NOT NULL,
    element TEXT NOT NULL,
    frequency INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    power INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    resonance_bonus INTEGER DEFAULT 0,
    mint_tx_hash TEXT,
    minted_at TIMESTAMPTZ DEFAULT NOW(),
    in_deck BOOLEAN DEFAULT FALSE,
    deck_position INTEGER,
    
    CONSTRAINT valid_frequency CHECK (frequency >= 0 AND frequency <= 1000)
);

-- Achievements (soulbound tokens)
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    token_id INTEGER,
    mint_tx_hash TEXT,
    minted_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    
    UNIQUE(player_id, achievement_id)
);

-- Transactions (token transfers, mints, etc.)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_hash TEXT NOT NULL UNIQUE,
    chain_id INTEGER NOT NULL,
    block_number INTEGER,
    from_address TEXT NOT NULL,
    to_address TEXT,
    tx_type TEXT NOT NULL CHECK (tx_type IN ('mint', 'transfer', 'battle', 'reward', 'stake', 'unstake')),
    token_amount NUMERIC DEFAULT 0,
    token_id INTEGER,
    battle_id UUID REFERENCES battles(id),
    player_id UUID REFERENCES players(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    gas_used NUMERIC,
    gas_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- Zora NFT collections
CREATE TABLE IF NOT EXISTS zora_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_address TEXT NOT NULL UNIQUE,
    chain_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    creator_address TEXT NOT NULL,
    total_minted INTEGER DEFAULT 0,
    price_per_token NUMERIC DEFAULT 0,
    mint_start_at TIMESTAMPTZ,
    mint_end_at TIMESTAMPTZ,
    metadata_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily login tracking
CREATE TABLE IF NOT EXISTS daily_logins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    login_date DATE NOT NULL DEFAULT CURRENT_DATE,
    streak_count INTEGER DEFAULT 1,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(player_id, login_date)
);

-- Activity log for analytics
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    session_id TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_farcaster ON players(farcaster_fid);
CREATE INDEX IF NOT EXISTS idx_players_cell ON players(cell_id);
CREATE INDEX IF NOT EXISTS idx_players_resonance ON players(resonance_score DESC);

CREATE INDEX IF NOT EXISTS idx_cells_formation ON cells(formation_number);
CREATE INDEX IF NOT EXISTS idx_cells_leader ON cells(leader_id);

CREATE INDEX IF NOT EXISTS idx_cell_members_cell ON cell_members(cell_id);
CREATE INDEX IF NOT EXISTS idx_cell_members_player ON cell_members(player_id);

CREATE INDEX IF NOT EXISTS idx_battles_initiator ON battles(initiator_id);
CREATE INDEX IF NOT EXISTS idx_battles_opponent ON battles(opponent_id);
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_created ON battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battles_tx ON battles(tx_hash);

CREATE INDEX IF NOT EXISTS idx_player_cards_player ON player_cards(player_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_token ON player_cards(token_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_deck ON player_cards(player_id, in_deck);

CREATE INDEX IF NOT EXISTS idx_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON player_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_activity_player ON activity_log(player_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_logins_player ON daily_logins(player_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_date ON daily_logins(login_date);

-- ========================================
-- Functions
-- ========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to players
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Calculate player win rate
CREATE OR REPLACE FUNCTION calculate_win_rate(player_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total INTEGER;
    wins INTEGER;
BEGIN
    SELECT total_battles, total_wins 
    INTO total, wins
    FROM players 
    WHERE id = player_uuid;
    
    IF total = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((wins::NUMERIC / total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    player_id UUID,
    display_name TEXT,
    wallet_address TEXT,
    resonance_score INTEGER,
    win_rate NUMERIC,
    total_battles INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.resonance_score DESC, p.total_wins DESC)::BIGINT as rank,
        p.id as player_id,
        p.display_name,
        p.wallet_address,
        p.resonance_score,
        calculate_win_rate(p.id) as win_rate,
        p.total_battles
    FROM players p
    WHERE p.total_battles > 0
    ORDER BY p.resonance_score DESC, p.total_wins DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Log activity function
CREATE OR REPLACE FUNCTION log_activity(
    p_player_id UUID,
    p_action TEXT,
    p_category TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_log (player_id, action, category, metadata)
    VALUES (p_player_id, p_action, p_category, p_metadata)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Players: anyone can read, only owner can update
CREATE POLICY "Players are viewable by everyone" ON players
    FOR SELECT USING (true);

CREATE POLICY "Players can update own profile" ON players
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'sub');

-- Cells: anyone can read, members can update
CREATE POLICY "Cells are viewable by everyone" ON cells
    FOR SELECT USING (true);

-- Battles: anyone can read
CREATE POLICY "Battles are viewable by everyone" ON battles
    FOR SELECT USING (true);

-- Player cards: anyone can read, owner can update
CREATE POLICY "Cards are viewable by everyone" ON player_cards
    FOR SELECT USING (true);

CREATE POLICY "Players can manage own cards" ON player_cards
    FOR ALL USING (player_id = (SELECT id FROM players WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Achievements: anyone can read
CREATE POLICY "Achievements are viewable by everyone" ON player_achievements
    FOR SELECT USING (true);

-- Transactions: anyone can read
CREATE POLICY "Transactions are viewable by everyone" ON transactions
    FOR SELECT USING (true);

-- ========================================
-- Initial Data
-- ========================================

-- Achievement definitions (reference data)
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon_url TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    points INTEGER DEFAULT 0
);

INSERT INTO achievement_definitions (id, name, description, category, requirement_type, requirement_value, points) VALUES
(1, 'First Steps', 'Complete your first battle', 'battles', 'battles_completed', 1, 100),
(2, 'Battle Hardened', 'Complete 10 battles', 'battles', 'battles_completed', 10, 250),
(3, 'Veteran', 'Complete 100 battles', 'battles', 'battles_completed', 100, 1000),
(4, 'First Victory', 'Win your first battle', 'victories', 'battles_won', 1, 150),
(5, 'Undefeated', 'Win 10 battles', 'victories', 'battles_won', 10, 300),
(6, 'Champion', 'Win 100 battles', 'victories', 'battles_won', 100, 1500),
(7, 'Cell Founder', 'Form your first cell', 'cells', 'cells_formed', 1, 200),
(8, 'Collective', 'Have 5 members in your cell', 'cells', 'cell_size', 5, 500),
(9, 'Resonant', 'Reach 1000 resonance score', 'resonance', 'resonance_score', 1000, 500),
(10, 'Harmonized', 'Reach 5000 resonance score', 'resonance', 'resonance_score', 5000, 1500),
(11, 'Enlightened', 'Reach 10000 resonance score', 'resonance', 'resonance_score', 10000, 5000),
(12, 'Daily Devoted', 'Login 7 days in a row', 'engagement', 'login_streak', 7, 100),
(13, 'Dedicated', 'Login 30 days in a row', 'engagement', 'login_streak', 30, 500)
ON CONFLICT (id) DO NOTHING;
