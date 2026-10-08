-- 06_create_claims.sql
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id_input TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read claims" ON claims
    FOR SELECT USING (true);
CREATE POLICY "Public insert claims" ON claims
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update claims" ON claims
    FOR UPDATE USING (true);
