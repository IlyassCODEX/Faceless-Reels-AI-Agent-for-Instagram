<div align="center">

# 🎬 Faceless Reels AI Agent for Instagram

**Fully automated, 100% free AI pipeline that generates and posts faceless Instagram Reels — while you sleep.**

[![n8n](https://img.shields.io/badge/Built%20with-n8n-EF6C00?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)
[![Groq](https://img.shields.io/badge/LLM-Groq-412991?style=for-the-badge)](https://groq.com)
[![Flux Schnell](https://img.shields.io/badge/Image-Flux%20Schnell-blue?style=for-the-badge)](https://fal.ai)
[![FFmpeg](https://img.shields.io/badge/Video-FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![Google Sheets](https://img.shields.io/badge/Storage-Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)](https://sheets.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🚀 What This Does

This n8n workflow turns a topic idea into a fully produced, captioned Instagram Reel — **automatically and for free**:

1. **AI writes the story** — A Groq-powered AI Agent reads topics from a Google Sheet and writes a multi-scene video script
2. **Free image generation** — Each scene gets a cinematic image via Flux Schnell (free tier)
3. **Free TTS voiceover** — Windows Text-to-Speech generates the narration locally (no API cost)
4. **Video assembly with Ken Burns + captions** — FFmpeg stitches scenes with smooth zoom animation and burned-in subtitles
5. **Auto-posts to Instagram** — Uploads to Google Drive, then publishes directly to your Instagram account

> ✅ Zero monthly AI cost. Zero manual editing. Just plug in a Google Sheet and let it run.

---

## 📺 Demo

> 📸 ** short screen recording a generated Reel.**
![n8n1](https://github.com/user-attachments/assets/592d9036-e4ad-4962-8c53-cfa0df574148)
https://github.com/user-attachments/assets/52ac3365-f8e0-44a7-970b-3f2b2dc1e3fb

---

## 🧩 Architecture

```
Google Sheets (topics)
        │
        ▼
   AI Agent (Groq LLM)
   └── Writes multi-scene script
        │
        ▼
   Loop Over Scenes
   ├── Flux Schnell → scene_N.jpg   (via local image_server.js :5052)
   ├── Windows TTS  → scene_N.wav   (via local tts_server.js   :5050)
   └── Collect scene data
        │
        ▼
   video_server.js (:5051)
   ├── Ken Burns zoom effect (FFmpeg)
   ├── SRT subtitle generation
   └── final_TIMESTAMP.mp4
        │
        ▼
   Google Drive (upload + share link)
        │
        ▼
   Instagram Graph API (auto-publish)
        │
        ▼
   Google Sheets (log result row)
```

---

## 🛠️ Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| Workflow automation | [n8n](https://n8n.io) (self-hosted) | Free |
| LLM / Script writer | [Groq API](https://groq.com) (llama / mixtral) | Free tier |
| Image generation | [Flux Schnell](https://fal.ai) | Free tier |
| Text-to-speech | Windows `System.Speech` (PowerShell) | Free |
| Video rendering | [FFmpeg](https://ffmpeg.org) | Free |
| File storage | Google Drive | Free |
| Topic management | Google Sheets | Free |
| Publishing | Instagram Graph API | Free |

---

## 📋 Prerequisites

- **Windows PC** (TTS server uses PowerShell `System.Speech`)
- **[n8n](https://docs.n8n.io/hosting/)** installed and running locally or on a server
- **[Node.js](https://nodejs.org)** v18+ (for the 3 local servers)
- **[FFmpeg](https://ffmpeg.org/download.html)** installed and added to PATH
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))
- A **Fal.ai API key** (free at [fal.ai](https://fal.ai)) for Flux Schnell images
- A **Google Cloud** project with Sheets & Drive APIs enabled
- An **Instagram Business/Creator** account connected to a Facebook Page + Instagram Graph API access

---

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/faceless-reels-ai-agent.git
cd faceless-reels-ai-agent
```

### 2. Start the 3 local servers

Open **3 separate terminals**:

```bash
# Terminal 1 — TTS server (port 5050)
node tts_server.js

# Terminal 2 — Image server (port 5052)
node image_server.js

# Terminal 3 — Video assembly server (port 5051)
node video_server.js
```

All three must be running before you execute the workflow.

### 3. Import the workflow into n8n

1. Open your n8n instance
2. Go to **Workflows → Import from file**
3. Select `Faceless_Reels_AI_Agent_For_Instagram.json`

### 4. Configure credentials in n8n

| Credential | Where to set it |
|---|---|
| Groq API Key | Groq node → API Key |
| Fal.ai API Key | HTTP Request node (Flux Schnell) → Header `Authorization` |
| Google OAuth2 | Google Sheets & Drive nodes |
| Instagram Graph API Token | HTTP Request (publish) node |

### 5. Set up your Google Sheet

Create a sheet with at least these columns:

| Column | Description |
|---|---|
| `topic` | The video topic (e.g. "5 facts about the ocean") |
| `status` | Leave blank — workflow fills this in |
| `reel_url` | Leave blank — workflow fills the published URL |

Update the **Google Sheets** node in n8n to point to your sheet.

### 6. Run it!

Click **Execute Workflow** in n8n, or set a schedule trigger to run automatically.

---

## 📁 Project Structure

```
faceless-reels-ai-agent/
├── Faceless_Reels_AI_Agent_For_Instagram.json   # n8n workflow
├── image_server.js     # Receives & saves AI-generated images (port 5052)
├── tts_server.js       # Windows TTS → WAV audio files (port 5050)
├── video_server.js     # FFmpeg video assembly + Ken Burns + subtitles (port 5051)
└── README.md
```

---

## ⚙️ Configuration Options

Inside the **`Setup workflow`** node in n8n you can adjust:

| Setting | Default | Description |
|---|---|---|
| `OUTPUT_DIR` | `C:/Users/codex/.n8n-files/media` | Where media files are saved locally |
| Scene image size | 1080×1920 | Portrait format for Reels |
| TTS speech rate | `-1` (slightly slow) | Adjust in `tts_server.js` |
| Ken Burns zoom speed | `+0.0008 per frame` | Adjust in `video_server.js` |
| Subtitle font | `Impact, size 18` | Adjust FFmpeg `force_style` in `video_server.js` |
| Words per subtitle chunk | `5` | Adjust `chunkWords(text, 5)` in `video_server.js` |

---

## 🔧 How Each Server Works

### `tts_server.js` — Port 5050
Receives a JSON payload `{ input, filename }`, uses Windows PowerShell's `System.Speech.Synthesis.SpeechSynthesizer` to generate a `.wav` file, and returns the local file path. **No external TTS API needed.**

### `image_server.js` — Port 5052
Receives raw image bytes (from the Flux Schnell response) via POST, saves them as `scene_N.jpg`, and returns the path. Acts as a simple bridge between n8n and the local filesystem.

### `video_server.js` — Port 5051
The most powerful server. For each scene it:
- Probes audio duration with `ffprobe`
- Generates a `.srt` subtitle file (word-chunked, time-distributed)
- Applies a **Ken Burns zoom effect** (`zoompan` filter, 1080×1920)
- Burns subtitles in **Impact font** with outline
- Encodes each scene to `clip_N.mp4`
- Concatenates all clips into `final_TIMESTAMP.mp4`

---

## ❓ FAQ

**Q: Does this cost anything?**  
A: No. Every component uses a free tier or is fully local. Groq and Fal.ai both have generous free tiers for personal use.

**Q: Can I run this on Mac/Linux?**  
A: The TTS server uses Windows PowerShell. On Mac/Linux, replace it with `say` (macOS) or `espeak` (Linux) in `tts_server.js`.

**Q: The video server crashes — why?**  
A: Make sure FFmpeg is installed and accessible in your PATH. Run `ffmpeg -version` to confirm.

**Q: How do I change the Instagram account?**  
A: Update the Instagram account ID in the **`Get accounts`** or **`Setup workflow`** node.

**Q: Can I add music?**  
A: Yes — add an `-i music.mp3 -filter_complex amix` argument to the FFmpeg command in `video_server.js`.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/background-music`)
3. Commit your changes (`git commit -m 'Add background music support'`)
4. Push to the branch (`git push origin feature/background-music`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## ⭐ Support

If this project saved you time or money, **please give it a star ⭐** — it helps others find it!

---

<div align="center">
Built with ❤️ using n8n · Groq · Flux Schnell · FFmpeg
</div>
