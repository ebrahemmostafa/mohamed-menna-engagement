# 🎉 Invitation Deployer

Deploy a personalized invitation website for each client in seconds.
Every client gets a unique Vercel URL like `ahmed-sara.vercel.app`.

---

## Setup (one time)

1. **Get a Vercel token**
   - Go to https://vercel.com/account/tokens
   - Create a token → copy it

2. **Install Node.js** (if not installed)
   - https://nodejs.org

3. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

---

## Deploy a new client

```bash
VERCEL_TOKEN=your_token_here node deploy.js
```

You'll be prompted for:

| Field | Example |
|-------|---------|
| Person 1 name | `Ahmed` |
| Person 2 name | `Sara` |
| Event type | `Wedding` |
| Date display | `15th August 2026` |
| Date ISO | `2026-08-15` |
| Day name | `Saturday` |
| Venue name | `Four Seasons Cairo` |
| URL slug | `ahmed-sara` |

Result → `https://inv-ahmed-sara.vercel.app`

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Your invitation template |
| `music.mp3` | Background music |
| `deploy.js` | The deployment script |
| `clients.json` | Auto-created log of all deployments |

---

## Tips

- Change `index.html` at any time to update your template design
- Each client gets their own isolated Vercel project
- Free Vercel account supports unlimited deployments
- `clients.json` keeps a record of all URLs for your reference
