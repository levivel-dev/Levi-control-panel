CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- event | schedule
  trigger_event TEXT,         -- e.g. api_failed, file_uploaded
  schedule_cron TEXT,
  action_type TEXT NOT NULL,  -- notify | run_script | webhook
  action_payload JSONB,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- queued | running | success | failed
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS automations_trigger_type_idx ON automations(trigger_type);
CREATE INDEX IF NOT EXISTS automations_enabled_idx ON automations(enabled);
CREATE INDEX IF NOT EXISTS automation_runs_automation_id_idx ON automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS automation_runs_created_at_idx ON automation_runs(created_at);
