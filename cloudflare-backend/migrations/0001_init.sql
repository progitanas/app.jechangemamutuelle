CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  need_type TEXT NOT NULL,
  requested_leads INTEGER NOT NULL,
  geo_area TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  quality_level TEXT NOT NULL,
  is_exclusive INTEGER NOT NULL DEFAULT 0,
  budget_max INTEGER NOT NULL,
  max_price_per_lead INTEGER NOT NULL,
  quota_requested INTEGER NOT NULL,
  quota_consumed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  feasibility_score INTEGER,
  estimated_cost INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_customer_id ON campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE TABLE IF NOT EXISTS lead_rejections (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  lead_external_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  replacement_external_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE INDEX IF NOT EXISTS idx_rejections_campaign_id ON lead_rejections(campaign_id);
CREATE INDEX IF NOT EXISTS idx_rejections_status ON lead_rejections(status);
