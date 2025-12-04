const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const screenCapture = require('./screen');
const inputHandler = require('./input');
const websocket = require('./websocket');

const ENDPOINT_ID = process.env.ENDPOINT_ID || uuidv4();
const BROKER_URL = process.env.BROKER_URL || 'ws://localhost:8080/ws';

console.log(`🚀 Endpoint Agent ${ENDPOINT_ID} starting...`);

const ws = new WebSocket(BROKER_URL);

ws.on('open', () => {
  console.log('✅ Connected to broker');
  ws.send(JSON.stringify({
    type: 'register',
    endpointId: ENDPOINT_ID
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  switch (message.type) {
    case 'start_session':
      screenCapture.startCapture(ws);
      inputHandler.startListening(ws);
      break;
    case 'stop_session':
      screenCapture.stopCapture();
      inputHandler.stopListening();
      break;
    case 'mouse_event':
      inputHandler.handleMouse(message);
      break;
    case 'key_event':
      inputHandler.handleKey(message);
      break;
  }
});

ws.on('close', () => {
  console.log('🔌 Disconnected from broker');
  process.exit(0);
});
