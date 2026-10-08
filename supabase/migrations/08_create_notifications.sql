-- 08_create_notifications.sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    opened_at TIMESTAMPTZ
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read notifications" ON notifications
    FOR SELECT USING (true);
CREATE POLICY "Public insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notifications" ON notifications
    FOR UPDATE USING (true);
