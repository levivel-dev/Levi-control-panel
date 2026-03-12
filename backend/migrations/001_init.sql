CREATE TABLE IF NOT EXISTS apis (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  expected_status INTEGER NOT NULL DEFAULT 200,
  last_status INTEGER,
  last_response_time_ms INTEGER,
  last_ok BOOLEAN,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_logs (
  id SERIAL PRIMARY KEY,
  api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  status INTEGER,
  response_time_ms INTEGER,
  ok BOOLEAN,
  error_message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_logs_api_id_idx ON api_logs(api_id);
CREATE INDEX IF NOT EXISTS api_logs_checked_at_idx ON api_logs(checked_at);
CREATE INDEX IF NOT EXISTS api_logs_ok_idx ON api_logs(ok);
