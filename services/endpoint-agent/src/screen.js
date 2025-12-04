const screenshot = require('screenshot-desktop');

let captureInterval = null;
let ws = null;

function startCapture(socket) {
  ws = socket;
  captureInterval = setInterval(async () => {
    try {
      const img = await screenshot();
      ws.send(JSON.stringify({
        type: 'screen_frame',
        data: img.toString('base64'),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Screen capture error:', error);
    }
  }, 100); // 10 FPS
}

function stopCapture() {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }
}

module.exports = { startCapture, stopCapture };
