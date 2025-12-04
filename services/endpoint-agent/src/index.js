const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
  console.log('🚀 Etheron Agent Connected');
  ws.send(JSON.stringify({ type: 'agent_ready', id: 'agent-001' }));
});
