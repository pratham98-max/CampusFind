-- 04_create_found_items.sql
CREATE TABLE IF NOT EXISTS found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date_found DATE NOT NULL,
    location TEXT,
    photo_url TEXT,
    embedding vector(384),
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'matched', 'returned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read found items" ON found_items
    FOR SELECT USING (true);
CREATE POLICY "Public insert found items" ON found_items
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update found items" ON found_items
    FOR UPDATE USING (true);
