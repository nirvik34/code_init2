# SAMAAN Clarifier — Chrome Extension

A production-ready Manifest V3 Chrome Extension that simplifies complex government,
pension, and legal policy text into clear, citizen-friendly plain language.

## Features

- **Side Panel UI** — Premium glassmorphism design with dark/light mode
- **AI-Powered Simplification** — LLM-backed text clarification via `/api/clarify`
- **Language Toggle** — English / Hindi output
- **Mode Toggle** — Prose paragraphs or bullet-point summaries
- **Copy to Clipboard** — One-click copy of simplified text
- **Context Menu** — Right-click → "Clarify Selected Text" on any page
- **Floating Button** — Select text on any page → floating ⚖️ Clarify button
- **Keyboard Shortcut** — `Ctrl+Enter` to clarify
- **Accessible** — ARIA labels, keyboard navigation, high contrast

## Setup

### 1. Start the Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Set your LLM API Key
Create a `.env.local` in the project root:
```
LLM_API_KEY=your-groq-api-key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=mixtral-8x7b-32768
```

### 3. Load the Extension
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

## Architecture

```
User → Extension Side Panel → POST /api/clarify → LLM Provider → Simplified Text → UI
```

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 config with CSP |
| `sidepanel.html` | Main extension UI |
| `sidepanel.js` | UI logic, API calls, state |
| `styles.css` | Design system with dark mode |
| `background.js` | Service worker, context menu |
| `content.js` | Floating selection button |
| `popup.html` | Extension popup menu |
