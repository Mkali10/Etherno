const WebSocket = require('ws');
const session = require('./session');

const clients = new Map();

function handleConnection(ws, req) {
  const sessionId = req.url.split('/')[2];
  
  if (!sessionId) {
    ws.close(1008, 'Session ID required');
    return;
  }

  clients.set(ws, { sessionId });
  
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    
    // Broadcast to other clients in same session
    for (const [client, clientData] of clients) {
      if (client !== ws && clientData.sessionId === sessionId) {
        client.send(JSON.stringify(data));
      }
    }
    
    // Handle screen data, input events, etc.
    if (data.type === 'screen_frame') {
      // Forward screen capture
    } else if (data.type === 'mouse_event') {
      // Forward input
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    session.endSession(sessionId).catch(console.error);
  });
}

module.exports = { handleConnection };
