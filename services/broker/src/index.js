const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocket = require('ws');
const auth = require('./auth');
const session = require('./session');
const signaling = require('./signaling');
const recording = require('./recording');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(auth.jwtMiddleware);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.post('/api/sessions', auth.requireSubscription, async (req, res) => {
  try {
    const { endpointId, userId } = req.body;
    const sessionId = await session.createSession({ userId, endpointId });
    res.json({ sessionId, status: 'created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:id', auth.requireSubscription, async (req, res) => {
  const sessionData = await session.getSession(req.params.id);
  res.json(sessionData);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUserByEmail(email);
  if (user && await auth.verifyPassword(password, user.password)) {
    const token = auth.generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, subscriptionActive: user.subscriptionActive } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// WebSocket for real-time signaling
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  verifyClient: (info) => auth.verifyWebSocketToken(info.req.headers.authorization)
});

wss.on('connection', (ws, req) => {
  console.log('WebSocket connected:', req.url);
  signaling.handleConnection(ws, req);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Broker running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
