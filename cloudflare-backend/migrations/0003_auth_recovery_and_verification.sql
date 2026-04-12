CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_type_expires
  ON auth_tokens(token_type, expires_at);

CREATE TABLE IF NOT EXISTS verified_emails (
  email TEXT PRIMARY KEY,
  verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);