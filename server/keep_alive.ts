
import express from 'express';
import { log } from './vite';

const app = express();
const PORT = 3000; // Different port from main app

// Simple health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ping endpoint for external monitoring
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Start the keep alive server
export function startKeepAlive() {
  app.listen(PORT, '0.0.0.0', () => {
    log(`Keep alive server running on port ${PORT}`, 'keep-alive');
  });
}

// Self-ping function to keep the process active
function selfPing() {
  const startTime = Date.now();
  
  fetch(`http://localhost:${PORT}/ping`)
    .then(response => {
      if (response.ok) {
        const responseTime = Date.now() - startTime;
        log(`Self-ping successful (${responseTime}ms)`, 'keep-alive');
      }
    })
    .catch(error => {
      log(`Self-ping failed: ${error.message}`, 'keep-alive');
    });
}

// Ping every 5 minutes to keep active
setInterval(selfPing, 5 * 60 * 1000);

// Initial ping after 30 seconds
setTimeout(selfPing, 30 * 1000);

log('Keep alive system initialized', 'keep-alive');
