const db = require('../utils/db');

const createFile = async ({
  filename,
  originalName,
  mimeType,
  sizeBytes,
  storagePath,
  storageProvider,
  storageBucket,
  workspaceType,
  workspaceId,
  metadata
}) => {
  const query = `
    INSERT INTO files (
      filename,
      original_name,
      mime_type,
      size_bytes,
      storage_path,
      storage_provider,
      storage_bucket,
      workspace_type,
      workspace_id,
      metadata,
      uploaded_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING id,
      filename,
      original_name AS "originalName",
      mime_type AS "mimeType",
      size_bytes AS "sizeBytes",
      storage_path AS "storagePath",
      storage_provider AS "storageProvider",
      storage_bucket AS "storageBucket",
      workspace_type AS "workspaceType",
      workspace_id AS "workspaceId",
      metadata,
      uploaded_at AS "uploadedAt";
  `;

  const { rows } = await db.query(query, [
    filename,
    originalName,
    mimeType,
    sizeBytes,
    storagePath,
    storageProvider,
    storageBucket,
    workspaceType,
    workspaceId,
    metadata
  ]);

  return rows[0];
};

const listFiles = async ({ workspaceType, workspaceId } = {}) => {
  const filters = [];
  const params = [];

  if (workspaceType) {
    if (workspaceType === 'general') {
      filters.push('workspace_type IS NULL');
    } else {
      params.push(workspaceType);
      filters.push(`workspace_type = $${params.length}`);
    }
  }

  if (workspaceId) {
    params.push(workspaceId);
    filters.push(`workspace_id = $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const query = `
    SELECT id,
      filename,
      original_name AS "originalName",
      mime_type AS "mimeType",
      size_bytes AS "sizeBytes",
      storage_path AS "storagePath",
      storage_provider AS "storageProvider",
      storage_bucket AS "storageBucket",
      workspace_type AS "workspaceType",
      workspace_id AS "workspaceId",
      metadata,
      uploaded_at AS "uploadedAt"
    FROM files
    ${whereClause}
    ORDER BY uploaded_at DESC;
  `;

  const { rows } = await db.query(query, params);
  return rows;
};

const getFileById = async (id) => {
  const query = `
    SELECT id,
      filename,
      original_name AS "originalName",
      mime_type AS "mimeType",
      size_bytes AS "sizeBytes",
      storage_path AS "storagePath",
      storage_provider AS "storageProvider",
      storage_bucket AS "storageBucket",
      workspace_type AS "workspaceType",
      workspace_id AS "workspaceId",
      metadata,
      uploaded_at AS "uploadedAt"
    FROM files
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const deleteFileById = async (id) => {
  const query = 'DELETE FROM files WHERE id = $1 RETURNING id;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const getFileUsage = async () => {
  const query = `
    SELECT
      COALESCE(SUM(size_bytes), 0)::bigint AS "totalBytes",
      COUNT(*)::int AS "fileCount"
    FROM files;
  `;

  const { rows } = await db.query(query);
  return rows[0];
};

module.exports = {
  createFile,
  listFiles,
  getFileById,
  deleteFileById,
  getFileUsage
};
