function handleMouse(event) {
  // Mouse events process through WebSocket 
  console.log('Mouse event:', event);
}

function handleKey(event) {
  console.log('Keyboard event:', event);
}

function startListening(ws) {
  // Add event listeners for mouse and keyboard and send via ws
  window.addEventListener('mousemove', handleMouse);
  window.addEventListener('keydown', handleKey);
}

function stopListening() {
  window.removeEventListener('mousemove', handleMouse);
  window.removeEventListener('keydown', handleKey);
}

module.exports = { handleMouse, handleKey, startListening, stopListening };
