const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Вспомогательная функция для чтения тела запроса
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    if (req.url === '/' && req.method === 'GET') {
      // Serve admin interface
      fs.readFile(path.join(__dirname, '../admin/index.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        }
      });
    } 
    // Get all products
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
    }
    // Add new product
    else if (req.url === '/products' && req.method === 'POST') {
      const newProduct = await getRequestBody(req);
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          const products = JSON.parse(data);
          newProduct.id = String(products.length + 1);
          products.push(newProduct);
          fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
            if (err) {
              res.writeHead(500);
              res.end('Server Error');
            } else {
              res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(newProduct));
            }
          });
        }
      });
    }
    // Update product
    else if (req.url.startsWith('/products/') && req.method === 'PUT') {
      const id = req.url.split('/')[2];
      const updatedProduct = await getRequestBody(req);
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          let products = JSON.parse(data);
          const index = products.findIndex(p => p.id === id);
          if (index === -1) {
            res.writeHead(404);
            res.end('Product not found');
          } else {
            products[index] = { ...products[index], ...updatedProduct };
            fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
              if (err) {
                res.writeHead(500);
                res.end('Server Error');
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(products[index]));
              }
            });
          }
        }
      });
    }
    // Delete product
    else if (req.url.startsWith('/products/') && req.method === 'DELETE') {
      const id = req.url.split('/')[2];
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          let products = JSON.parse(data);
          const index = products.findIndex(p => p.id === id);
          if (index === -1) {
            res.writeHead(404);
            res.end('Product not found');
          } else {
            products = products.filter(p => p.id !== id);
            fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
              if (err) {
                res.writeHead(500);
                res.end('Server Error');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Product deleted');
              }
            });
          }
        }
      });
    }
    // Serve static files (CSS)
    else if (req.url === '/style.css') {
      fs.readFile(path.join(__dirname, '../admin/style.css'), (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Style not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
          res.end(data);
        }
      });
    }
    else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});