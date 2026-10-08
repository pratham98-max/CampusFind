-- 07_create_status_events.sql
CREATE TABLE IF NOT EXISTS status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    item_id UUID NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read status_events" ON status_events
    FOR SELECT USING (true);
CREATE POLICY "Public insert status_events" ON status_events
    FOR INSERT WITH CHECK (true);
