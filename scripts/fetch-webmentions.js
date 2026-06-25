// scripts/fetch-webmentions.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function fetchWebmentions() {
  // FIX 1: Just the domain name, no https:// or /
  const DOMAIN = "misfitgentleman.netlify.app"; 
  
  // FIX 2: Use the ENV VARIABLE NAME, not the value inside process.env
  const TOKEN = process.env.WEBMENTION_TOKEN; 

  console.log("--- Starting Webmention Fetch ---");
  console.log("Domain:", DOMAIN);
  console.log("Token Found?", !!TOKEN);

  if (!TOKEN) {
    console.error("❌ ERROR: WEBMENTION_TOKEN environment variable is missing!");
    console.log("Make sure you set 'WEBMENTION_TOKEN' in Netlify Environment Variables.");
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
    console.log("✅ Fetched successfully. Entries count:", data.entries ? data.entries.length : 0);

    // Ensure directory exists
    const cacheDir = path.join(".eleventy-cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Save the JSON file
    const filePath = path.join(cacheDir, "webmentions.json");
    fs.writeFileSync(filePath, JSON.stringify(data));
    
    console.log("📄 File saved to:", filePath);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch webmentions:", error.message);
    return [];
  }
}

fetchWebmentions();
