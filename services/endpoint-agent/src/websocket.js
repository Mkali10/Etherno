const WebSocket = require('ws');

function createWebSocketConnection(url) {
  const ws = new WebSocket(url);

  ws.on('open', () => {
    console.log('WebSocket Connected');
  });

  ws.on('message', (msg) => {
    console.log('Message from server:', msg);
  });

  ws.on('close', () => {
    console.log('WebSocket Disconnected');
  });

  return ws;
}

module.exports = { createWebSocketConnection };
