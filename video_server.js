const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = 'C:/Users/codex/.n8n-files/media';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function chunkWords(text, size = 5) {
  const words = text.split(' ');
  const chunks = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

function toSrtTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.round((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${s},${ms}`;
}

function generateSrt(subtitles, duration) {
  const timePerChunk = duration / subtitles.length;
  return subtitles.map((phrase, i) => {
    const start = toSrtTime(i * timePerChunk);
    const end = toSrtTime((i + 1) * timePerChunk);
    return `${i + 1}\n${start} --> ${end}\n${phrase}`;
  }).join('\n\n');
}

http.createServer((req, res) => {
  if (req.method === 'POST') {
    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const { scenes } = JSON.parse(Buffer.concat(chunks).toString());
        const clipPaths = [];

        scenes.forEach((scene, i) => {
          const clipPath = path.join(OUTPUT_DIR, `clip_${i}.mp4`).replace(/\\/g, '/');
          const imgPath = scene.image.replace(/\\/g, '/');
          const audPath = scene.audio.replace(/\\/g, '/');
          const srtPath = path.join(OUTPUT_DIR, `scene_${i}.srt`).replace(/\\/g, '/');

          // Get audio duration
          let duration = 5;
          try {
            const probe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audPath}"`).toString().trim();
            duration = parseFloat(probe) || 5;
          } catch (e) { console.log('probe failed, using 5s'); }

          // Generate SRT file
          const subtitles = scene.subtitles && scene.subtitles.length ? scene.subtitles : [scene.text || ''];
          fs.writeFileSync(srtPath, generateSrt(subtitles, duration));

          // animation
          const kenBurns = `scale=8000:14223,zoompan=z='min(zoom+0.0008,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(duration * 25)}:s=1080x1920:fps=25,setsar=1`;

          // FFmpeg with subtitle filter - y position near bottom of image area
          const srtEscaped = srtPath.replace(/\//g, '\\\\').replace(/:/g, '\\:');
          execSync(`ffmpeg -analyzeduration 10M -probesize 10M -loop 1 -i "${imgPath}" -i "${audPath}" -vf "${kenBurns},subtitles='${srtEscaped}':force_style='Fontname=Impact,Fontsize=18,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=1,Alignment=2,MarginV=50'" -c:v libx264 -c:a aac -shortest -y "${clipPath}"`);
          // execSync(`ffmpeg -analyzeduration 10M -probesize 10M -loop 1 -i "${imgPath}" -i "${audPath}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,subtitles='${srtEscaped}':force_style='Fontname=Arial,Fontsize=22,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=1,Alignment=2,MarginV=80'" -c:v libx264 -c:a aac -shortest -y "${clipPath}"`);
          clipPaths.push(clipPath);
        });

        const listFile = path.join(OUTPUT_DIR, 'list.txt').replace(/\\/g, '/');
        fs.writeFileSync(listFile, clipPaths.map(p => `file '${p}'`).join('\n'));

        const outPath = path.join(OUTPUT_DIR, `final_${Date.now()}.mp4`).replace(/\\/g, '/');
        execSync(`ffmpeg -f concat -safe 0 -i "${listFile}" -c copy -y "${outPath}"`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ path: outPath }));

      } catch (e) {
        res.writeHead(500);
        res.end('Error: ' + e.message);
        console.error(e);
      }
    });
  }
}).listen(5051, () => console.log('Video server running on http://localhost:5051'));