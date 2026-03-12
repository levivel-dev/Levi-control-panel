CREATE TABLE IF NOT EXISTS bots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bot_type TEXT,
  status TEXT NOT NULL DEFAULT 'stopped',
  config JSONB,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bot_logs (
  id SERIAL PRIMARY KEY,
  bot_id INTEGER NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bots_status_idx ON bots(status);
CREATE INDEX IF NOT EXISTS bot_logs_bot_id_idx ON bot_logs(bot_id);
CREATE INDEX IF NOT EXISTS files_uploaded_at_idx ON files(uploaded_at);
