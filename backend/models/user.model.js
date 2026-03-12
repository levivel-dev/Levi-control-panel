const db = require('../utils/db');

const createUser = async ({ name, email, passwordHash, role }) => {
  const query = `
    INSERT INTO users (name, email, password_hash, role, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id,
      name,
      email,
      role,
      created_at AS "createdAt";
  `;

  const { rows } = await db.query(query, [name, email, passwordHash, role]);
  return rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id,
      name,
      email,
      role,
      password_hash AS "passwordHash",
      created_at AS "createdAt"
    FROM users
    WHERE email = $1;
  `;

  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const getUserById = async (id) => {
  const query = `
    SELECT id,
      name,
      email,
      role,
      created_at AS "createdAt"
    FROM users
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const listUsers = async () => {
  const query = `
    SELECT id,
      name,
      email,
      role,
      created_at AS "createdAt"
    FROM users
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query);
  return rows;
};

const updateUserRole = async (id, role) => {
  const query = `
    UPDATE users
    SET role = $2
    WHERE id = $1
    RETURNING id,
      name,
      email,
      role,
      created_at AS "createdAt";
  `;

  const { rows } = await db.query(query, [id, role]);
  return rows[0];
};

const updateUserPassword = async (id, passwordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $2
    WHERE id = $1
    RETURNING id,
      name,
      email,
      role,
      created_at AS "createdAt";
  `;

  const { rows } = await db.query(query, [id, passwordHash]);
  return rows[0];
};

const countUsers = async () => {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM users;');
  return rows[0].count;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  listUsers,
  updateUserRole,
  updateUserPassword,
  countUsers
};
