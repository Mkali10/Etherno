const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const auth = require('./auth');
const session = require('./session');
const signaling = require('./signaling');

const app = express();
app.use(express.json());
app.use(auth.jwtMiddleware);

app.post('/session', async (req, res) => {
  const sessionId = await session.createSession(req.user.id);
  res.json({ sessionId });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  signaling.handleConnection(ws, req);
});

server.listen(process.env.PORT || 8080, () => {
  console.log('Broker running on port', process.env.PORT || 8080);
});
