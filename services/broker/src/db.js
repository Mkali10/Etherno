const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      subscription_active BOOLEAN DEFAULT false,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      endpoint_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      recording_id UUID,
      created_at TIMESTAMP DEFAULT NOW(),
      ended_at TIMESTAMP
    );
  `);
}

async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function saveSession(session) {
  await pool.query(`
    INSERT INTO sessions (id, user_id, endpoint_id, status, recording_id, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    session.id, session.userId, session.endpointId, 
    session.status, session.recordingId, session.createdAt
  ]);
}

async function getSession(sessionId) {
  const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
  return result.rows[0];
}

async function updateSession(session) {
  await pool.query(`
    UPDATE sessions SET status = $1, ended_at = $2 WHERE id = $3
  `, [session.status, session.endedAt, session.id]);
}

module.exports = { initDB, getUserByEmail, saveSession, getSession, updateSession };
