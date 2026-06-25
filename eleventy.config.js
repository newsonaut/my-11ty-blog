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

  console.log("--- Starting Webmention Fetch ---");
  console.log("Domain:", DOMAIN);
  console.log("Token Found?", !!TOKEN);

  if (!TOKEN) {
    console.error(
      "❌ ERROR: WEBMENTION_TOKEN environment variable is missing!",
    );
    return [];
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

    const cacheDir = path.join(process.cwd(), ".eleventy-cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const filePath = path.join(cacheDir, "webmentions.json");
    fs.writeFileSync(filePath, JSON.stringify(data));

    console.log("📄 File saved to:", filePath);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch webmentions:", error.message);
    return [];
  }
}

// 🔥 CRITICAL FIX: Export the function as default
export default fetchWebmentions;

// Optional: Run immediately if called directly (for local testing without importing)
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchWebmentions().catch(console.error);
}
