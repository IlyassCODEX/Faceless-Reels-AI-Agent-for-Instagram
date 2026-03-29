const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = 'C:/Users/codex/.n8n-files/media';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

http.createServer((req, res) => {
  if (req.method === 'POST') {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const { input, filename } = JSON.parse(Buffer.concat(chunks).toString());
        const audPath = path.join(OUTPUT_DIR, filename + '.wav').replace(/\\/g, '/');
        
        const cleanText = input.replace(/'/g, '').replace(/"/g, '');
        
        execSync(`PowerShell -Command "Add-Type -AssemblyName System.Speech; $tts = New-Object System.Speech.Synthesis.SpeechSynthesizer; $tts.Rate = -1; $tts.SetOutputToWaveFile('${audPath}'); $tts.Speak('${cleanText}'); $tts.Dispose()"`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ path: audPath }));
      } catch (e) {
        res.writeHead(500);
        res.end('Error: ' + e.message);
        console.error(e);
      }
    });
  }
}).listen(5050, () => console.log('TTS running on http://localhost:5050'));