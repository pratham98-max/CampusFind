-- 09_create_indexes_and_storage.sql

-- Performance and search indexes
CREATE INDEX IF NOT EXISTS idx_lost_items_org_cat_status ON lost_items(org_id, category, status);
CREATE INDEX IF NOT EXISTS idx_found_items_org_cat_status ON found_items(org_id, category, status);
CREATE INDEX IF NOT EXISTS idx_lost_items_date ON lost_items(date_lost);
CREATE INDEX IF NOT EXISTS idx_found_items_date ON found_items(date_found);
CREATE INDEX IF NOT EXISTS idx_matches_lost_found ON matches(lost_item_id, found_item_id);
CREATE INDEX IF NOT EXISTS idx_status_events_item ON status_events(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_claims_match ON claims(match_id);

-- Vector indexes using IVFFLAT for fast cosine similarity
CREATE INDEX IF NOT EXISTS idx_lost_items_embedding ON lost_items 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_found_items_embedding ON found_items 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage public read policy
CREATE POLICY "Public item photos access"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-photos');

-- Storage public upload policy
CREATE POLICY "Public item photos upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'item-photos');
