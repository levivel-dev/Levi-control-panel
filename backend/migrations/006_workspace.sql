ALTER TABLE files
  ADD COLUMN IF NOT EXISTS workspace_type TEXT,
  ADD COLUMN IF NOT EXISTS workspace_id INTEGER;

CREATE INDEX IF NOT EXISTS files_workspace_idx ON files(workspace_type, workspace_id);
