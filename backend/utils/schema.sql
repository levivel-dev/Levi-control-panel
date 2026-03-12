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

CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_event TEXT,
  schedule_cron TEXT,
  action_type TEXT NOT NULL,
  action_payload JSONB,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  storage_provider TEXT NOT NULL DEFAULT 'local',
  storage_bucket TEXT,
  workspace_type TEXT,
  workspace_id INTEGER,
  metadata JSONB,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_logs_api_id_idx ON api_logs(api_id);
CREATE INDEX IF NOT EXISTS api_logs_checked_at_idx ON api_logs(checked_at);
CREATE INDEX IF NOT EXISTS api_logs_ok_idx ON api_logs(ok);
CREATE INDEX IF NOT EXISTS automations_trigger_type_idx ON automations(trigger_type);
CREATE INDEX IF NOT EXISTS automations_enabled_idx ON automations(enabled);
CREATE INDEX IF NOT EXISTS automation_runs_automation_id_idx ON automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS automation_runs_created_at_idx ON automation_runs(created_at);
CREATE INDEX IF NOT EXISTS bots_status_idx ON bots(status);
CREATE INDEX IF NOT EXISTS bot_logs_bot_id_idx ON bot_logs(bot_id);
CREATE INDEX IF NOT EXISTS files_uploaded_at_idx ON files(uploaded_at);
CREATE INDEX IF NOT EXISTS files_workspace_idx ON files(workspace_type, workspace_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
