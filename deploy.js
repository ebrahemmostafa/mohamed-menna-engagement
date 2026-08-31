#!/usr/bin/env node
/**
 * ─── Invitation Deployer ───────────────────────────────────────────────────
 * Usage:  VERCEL_TOKEN=your_token node deploy.js
 *
 * What it does:
 *  1. Asks you for client details (names, date, venue, etc.)
 *  2. Injects them into your existing index.html template
 *  3. Deploys a unique site to Vercel  →  e.g. ahmed-sara.vercel.app
 *  4. Saves the record to clients.json
 */

const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");
const rl   = require("readline").createInterface({
  input: process.stdin, output: process.stdout,
});
const ask = (q) => new Promise((res) => rl.question(q, res));

const TEMPLATE = path.join(__dirname, "index.html");
const LOG_FILE = path.join(__dirname, "clients.json");

async function main() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.error("\n❌  Missing VERCEL_TOKEN environment variable.");
    console.error("    Run:  VERCEL_TOKEN=your_token node deploy.js\n");
    process.exit(1);
  }

  console.log("\n🎉  Invitation Deployer  🎉");
  console.log("─".repeat(40));

  // ── Collect client info ────────────────────────────────────────────────
  const person1     = await ask("Person 1 name (e.g. Anas):         ");
  const person2     = await ask("Person 2 name (e.g. Reham):        ");
  const eventType   = await ask("Event type (e.g. Engagement):      ");
  const dateDisplay = await ask("Date display (e.g. 4th July 2026): ");
  const dateISO     = await ask("Date ISO for countdown (YYYY-MM-DD): ");
  const dayName     = await ask("Day name (e.g. Saturday):          ");
  const venueName   = await ask("Venue name (e.g. Villa Rose):      ");
  const slug        = await ask("URL slug (e.g. ahmed-sara):         ");
  rl.close();

  const projectName = `inv-${slug}`;

  // ── Load & inject into template ───────────────────────────────────────
  console.log("\n📝  Personalising invitation...");
  let html = fs.readFileSync(TEMPLATE, "utf8");

  // Title tag
  html = html.replace(
    /(<title>)[^<]*(</title>)/,
    `$1${person1} & ${person2} · ${eventType}$2`
  );

  // Entrance screen names
  html = html.replace(
    /(<div class="ent-top" id="entEy">)[^<]*(<\/div>)/,
    `$1${eventType} Celebration$2`
  );
  // Replace ent-name spans (first = person1, second = person2)
  let nameCount = 0;
  html = html.replace(/(<span class="ent-name">)[^<]*(<\/span>)/g, (m, a, b) => {
    nameCount++;
    return nameCount === 1 ? `${a}${person1}${b}` :
           nameCount === 2 ? `${a}${person2}${b}` : m;
  });

  // Hero eyebrow text
  html = html.replace(
    /(<span class="h-ey-txt">)[^<]*(<\/span>)/,
    `$1${eventType} Celebration$2`
  );

  // Hero main names (h-name spans, first two occurrences)
  let heroCount = 0;
  html = html.replace(/(<span class="h-name">)[^<]*(<\/span>)/g, (m, a, b) => {
    heroCount++;
    return heroCount === 1 ? `${a}${person1}${b}` :
           heroCount === 2 ? `${a}${person2}${b}` : m;
  });

  // Hero pill (date pill)
  html = html.replace(
    /(<div class="h-pill">)[^<]*<span>([^<]*)<\/span>([\s\S]*?)<span>([^<]*)<\/span>([\s\S]*?)<span>([^<]*)<\/span>(<\/div>)/,
    `$1<span>${dayName}</span><span class="h-dot">&#10022;</span><span>${dateDisplay.replace(" ", " ")}</span><span class="h-dot">&#10022;</span><span>${venueName}</span>$7`
  );

  // Details band: date
  html = html.replace(
    /(<span class="det-main">)[^<]*(<!-- DATE_MAIN -->|4 July)(<\/span>)/,
    `$1${dateDisplay.split(" ").slice(0,2).join(" ")}$3`
  );

  // Event type card
  html = html.replace(
    /(<span class="det-main">)Engagement(<\/span>)/,
    `$1${eventType}$2`
  );
  html = html.replace(
    /(<span class="det-sub">)Anas &amp; Reham(<\/span>)/,
    `$1${person1} &amp; ${person2}$2`
  );

  // Location
  html = html.replace(
    /(<span class="loc-name">)[^<]*(<\/span>)/,
    `$1${venueName}$2`
  );
  html = html.replace(
    /(<span class="loc-addr">)[^<]*(<\/span>)/,
    `$1${dayName} &middot; ${dateDisplay}$2`
  );

  // Footer
  html = html.replace(
    /(<span class="ft-names">)[^<]*(<\/span>)/,
    `$1${person1} &amp; ${person2}$2`
  );
  html = html.replace(
    /(<span class="ft-date">)[^<]*(<\/span>)/,
    `$1${dateDisplay} &middot; ${venueName} &middot; ${eventType} Celebration$2`
  );

  // Wish placeholder text
  html = html.replace(
    /for Anas &amp; Reham on their special day/g,
    `for ${person1} &amp; ${person2} on their special day`
  );

  // Countdown JS date
  html = html.replace(
    /new Date\('[\d-]+T00:00:00'\)/,
    `new Date('${dateISO}T00:00:00')`
  );

  // Mystery card text
  html = html.replace(
    /(mc\.querySelector\('\.mystery-sub'\)\.textContent=')[^']*(')/,
    `$1The celebration begins ${dateDisplay}$2`
  );

  // ── Write to temp dir ─────────────────────────────────────────────────
  const tmpDir = path.join("/tmp", projectName);
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, "index.html"), html);

  // Copy music file if it exists
  const musicSrc = path.join(__dirname, "music.mp3");
  if (fs.existsSync(musicSrc)) {
    fs.copyFileSync(musicSrc, path.join(tmpDir, "music.mp3"));
  }

  // vercel.json
  fs.writeFileSync(
    path.join(tmpDir, "vercel.json"),
    JSON.stringify({ version: 2, public: true }, null, 2)
  );

  // ── Deploy ────────────────────────────────────────────────────────────
  console.log(`🚀  Deploying to Vercel as "${projectName}"...\n`);

  try {
    const out = execSync(
      `npx vercel "${tmpDir}" --token="${token}" --name="${projectName}" --yes --prod`,
      { encoding: "utf8" }
    );

    const match = out.match(/https:\/\/[^\s]+\.vercel\.app/);
    const liveUrl = match ? match[0] : null;

    console.log("\n✅  Deployed!");
    if (liveUrl) {
      console.log(`\n🔗  Live URL:\n    ${liveUrl}\n`);
    } else {
      console.log("\n🔗  Check your Vercel dashboard for the URL.\n");
    }

    // ── Save record ───────────────────────────────────────────────────
    const record = {
      slug, person1, person2, eventType,
      date: dateDisplay, venue: venueName,
      url: liveUrl,
      deployedAt: new Date().toISOString(),
    };
    const existing = fs.existsSync(LOG_FILE)
      ? JSON.parse(fs.readFileSync(LOG_FILE, "utf8"))
      : [];
    existing.push(record);
    fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
    console.log("📋  Client saved to clients.json\n");

  } catch (err) {
    console.error("\n❌  Deployment failed:\n", err.message);
    process.exit(1);
  }
}

main();
