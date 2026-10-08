-- 02_create_users.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    student_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'security', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read users" ON users
    FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON users
    FOR INSERT WITH CHECK (true);
