-- 01_create_organizations.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('college', 'school', 'hospital')),
    categories TEXT[] NOT NULL DEFAULT ARRAY['Electronics', 'Wallets & Bags', 'Identification', 'Books & Notebooks', 'Bottles & Tumblers', 'Keys', 'Clothing & Accessories', 'Medical Equipment', 'Other'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read organizations" ON organizations
    FOR SELECT USING (true);
