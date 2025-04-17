const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, '../client/index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      }
    });
  } 
  // Serve static CSS file
  else if (req.url === '/style.css') {
    fs.readFile(path.join(__dirname, '../client/style.css'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Style not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        res.end(data);
      }
    });
  }
  // Serve client.js file
  else if (req.url === '/client.js') {
    fs.readFile(path.join(__dirname, '../client/client.js'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('JavaScript file not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        res.end(data);
      }
    });
  }
  else if (req.url === '/products' && req.method === 'GET') {
    fs.readFile(PRODUCTS_FILE, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Catalog server running at http://localhost:${PORT}`);
});