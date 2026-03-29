const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/codex/.n8n-files/media';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

http.createServer((req, res) => {
  if (req.method === 'POST') {
    const scene = req.headers['x-scene'] || Date.now();
    const filePath = path.join(OUTPUT_DIR, `scene_${scene}.jpg`).replace(/\\/g, '/');
    
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      fs.writeFileSync(filePath, Buffer.concat(chunks));
      console.log(`Saved image: ${filePath}, size: ${Buffer.concat(chunks).length}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ path: filePath }));
    });
  }
}).listen(5052, () => console.log('Image server running on http://localhost:5052'));