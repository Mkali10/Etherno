const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocket = require('ws');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'etheron-secret';

// Database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'etheron',
  user: process.env.DB_USER || 'etheron',
  password: process.env.DB_PASS || 'etheron123'
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Etheron Broker', timestamp: new Date().toISOString() }));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, subscription_active: user.subscription_active },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ 
        token, 
        user: { id: user.id, email: user.email, role: user.role, subscription_active: user.subscription_active }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create Session
app.post('/api/sessions', authenticateToken, async (req, res) => {
  if (!req.user.subscription_active) {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  
  const { endpoint_id } = req.body;
  const sessionId = uuidv4();
  
  try {
    await pool.query(
      'INSERT INTO sessions (id, user_id, endpoint_id, status, created_at) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, req.user.id, endpoint_id, 'active', new Date()]
    );
    res.json({ sessionId, status: 'created', message: 'Etheron session created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// WebSocket Signaling
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('Etheron WebSocket connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Etheron WebSocket disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Etheron Broker running on port ${PORT}`);
});
