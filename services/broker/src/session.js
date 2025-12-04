const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const recording = require('./recording');

const activeSessions = new Map();

async function createSession({ userId, endpointId }) {
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    userId,
    endpointId,
    status: 'active',
    createdAt: new Date().toISOString(),
    recordingId: null
  };

  // Save to database
  await db.saveSession(session);
  
  // Start recording
  session.recordingId = await recording.startRecording(sessionId);
  
  activeSessions.set(sessionId, session);
  return sessionId;
}

async function getSession(sessionId) {
  const session = activeSessions.get(sessionId) || await db.getSession(sessionId);
  return session;
}

async function endSession(sessionId) {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    await db.updateSession(session);
    activeSessions.delete(sessionId);
  }
}

module.exports = { createSession, getSession, endSession };
