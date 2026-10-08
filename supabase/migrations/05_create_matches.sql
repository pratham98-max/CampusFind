-- 05_create_matches.sql
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
    confidence_score FLOAT NOT NULL,
    category_match BOOLEAN NOT NULL DEFAULT true,
    keyword_score FLOAT NOT NULL DEFAULT 0.0,
    date_score FLOAT NOT NULL DEFAULT 0.0,
    embedding_score FLOAT NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMPTZ,
    UNIQUE(lost_item_id, found_item_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read matches" ON matches
    FOR SELECT USING (true);
CREATE POLICY "Public insert matches" ON matches
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update matches" ON matches
    FOR UPDATE USING (true);
