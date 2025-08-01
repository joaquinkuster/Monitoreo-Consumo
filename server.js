const http = require('http');
const path = require('path');
const fs = require('fs');

// Servidor HTTP que sirve archivos estáticos
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'resources', req.url === '/' ? 'template.html' : req.url);
    const ext = path.extname(filePath);

    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.end(data);
    });
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`);
});

module.exports = server;  // Exportamos para que socket.js pueda usar este servidor
