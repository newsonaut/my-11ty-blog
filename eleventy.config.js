// scripts/fetch-webmentions.js
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

async function fetchWebmentions() {
  const DOMAIN = "misfitgentleman.netlify.app";
  const TOKEN = process.env.WEBMENTION_TOKEN;

  console.log("--- Starting Webmention Fetch ---");
  console.log("Domain:", DOMAIN);
  console.log("Token Found?", !!TOKEN);

  if (!TOKEN) {
    console.warn(
      "⚠️ WEBMENTION_TOKEN missing (local env). Creating empty manifest.",
    );
    // Save to src/_data/ so it becomes global data
    const filePath = path.join(
      process.cwd(),
      "src",
      "_data",
      "webmentions.json",
    );

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify({ entries: [] }, null, 2));
    console.log("📄 Empty manifest saved to:", filePath);
    return { entries: [] };
  }

  try {
    const url = `https://webmention.io/api/mentions.jf2?domain=${DOMAIN}&token=${TOKEN}`;
    console.log("Fetching:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(
      "✅ Fetched successfully. Entries count:",
      data.entries ? data.entries.length : 0,
    );

    const filePath = path.join(
      process.cwd(),
      "src",
      "_data",
      "webmentions.json",
    );
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("📄 File saved to:", filePath);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch webmentions:", error.message);
    // Save empty on error too
    const filePath = path.join(
      process.cwd(),
      "src",
      "_data",
      "webmentions.json",
    );
    fs.writeFileSync(filePath, JSON.stringify({ entries: [] }, null, 2));
    return { entries: [] };
  }
}

export default fetchWebmentions;
