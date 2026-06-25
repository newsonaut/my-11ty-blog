// scripts/fetch-webmentions.js
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWebmentions() {
  const DOMAIN = "misfitgentleman.netlify.app";
  const TOKEN = process.env.WEBMENTION_TOKEN;

  // Ensure cache directory ALWAYS exists
  const cacheDir = path.join(process.cwd(), ".eleventy-cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const filePath = path.join(cacheDir, "webmentions.json");

  console.log("--- Starting Webmention Fetch ---");
  console.log("Domain:", DOMAIN);
  console.log("Token Found?", !!TOKEN);

  if (!TOKEN) {
    console.warn(
      "⚠️  WEBMENTION_TOKEN missing (local env). Creating empty manifest.",
    );
    // CRITICAL FIX: Write an empty structure so templates don't break
    fs.writeFileSync(filePath, JSON.stringify({ entries: [] }, null, 2));
    console.log("📄 Empty manifest saved to:", filePath);
    return { entries: [] };
  }

  try {
    const url = `https://webmention.io/api/mentions.jf2?domain=${DOMAIN}&token=${TOKEN}`;
    console.log("Fetching:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "✅ Fetched successfully. Entries count:",
      data.entries ? data.entries.length : 0,
    );

    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log("📄 File saved to:", filePath);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch webmentions:", error.message);
    // Save empty on error too, so build doesn't crash
    fs.writeFileSync(filePath, JSON.stringify({ entries: [] }, null, 2));
    return { entries: [] };
  }
}

export default fetchWebmentions;

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchWebmentions().catch(console.error);
}
