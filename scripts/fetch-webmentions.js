// scripts/fetch-webmentions.js
const fetch = require("node-fetch"); // Install with: npm install node-fetch

async function fetchWebmentions() {
  const DOMAIN = "https://misfitgentleman.netlify.app/"; // Replace with your domain
  const TOKEN = process.env.GZ0JziQvtpeVFsTgc8lh7Q; // Store token as env variable in Netlify

  if (!TOKEN) {
    console.error("WEBMENTION_TOKEN not set!");
    return [];
  }

  try {
    const response = await fetch(
      `https://webmention.io/api/mentions.jf2?domain=${DOMAIN}&token=${TOKEN}`,
    );
    const data = await response.json();

    // Save to .eleventy-cache/webmentions.json
    const fs = require("fs");
    const path = require("path");
    const cacheDir = path.join(".eleventy-cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    fs.writeFileSync(
      path.join(cacheDir, "webmentions.json"),
      JSON.stringify(data),
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch webmentions:", error);
    return [];
  }
}

fetchWebmentions();
