const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  // Add new client to the set
  clients.add(ws);

  ws.on('message', (message) => {
    // Parse the incoming message
    const msgData = JSON.parse(message);
    
    // Broadcast message to all connected clients
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          sender: msgData.sender,
          text: msgData.text,
          timestamp: new Date().toISOString()
        }));
      }
    });
  });

  ws.on('close', () => {
    // Remove client when they disconnect
    clients.delete(ws);
  });
});

console.log('WebSocket chat server running at ws://localhost:8081');