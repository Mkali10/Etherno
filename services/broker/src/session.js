const { v4: uuidv4 } = require('uuid');
const sessions = new Map();

async function createSession(userId) {
  const sessionId = uuidv4();
  sessions.set(sessionId, { userId, createdAt: Date.now(), status: 'active' });
  // TODO: Persist session in DB and trigger recording if necessary
  return sessionId;
}

module.exports = { createSession };
