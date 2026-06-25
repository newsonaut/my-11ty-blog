// eleventy.config.js
import rssPlugin from "@11ty/eleventy-plugin-rss";
import fetchWebmentions from "./scripts/fetch-webmentions.js";
import fs from "fs";
import path from "path";

export default function (eleventyConfig) {
  // ... (plugins, filters, passthrough copies remain the same) ...

  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/js");

  // Filters...
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );
  eleventyConfig.addFilter("getAllTags", (collection) =>
    Array.from(new Set(collection.flatMap((i) => i.data.tags || []))).sort(),
  );
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) =>
    new Date(dateObj).toISOString().replace(/\.\d{3}Z$/, "Z"),
  );
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    const items = [...collection].sort((a, b) => b.date - a.date);
    return items[0]?.date || new Date();
  });

  // Pre-build hook (Fetches data)
  eleventyConfig.on("beforeBuild", async () => {
    console.log("🚀 Triggering Webmention Fetch...");
    try {
      await fetchWebmentions();
    } catch (error) {
      console.error("❌ Webmentions error:", error);
    }
  });

  // ✅ CRITICAL FIX: Explicitly define global data
  // Note: 'webmentions' is the variable name in your templates
  eleventyConfig.addGlobalDataAsync("webmentions", async () => {
    const cachePath = path.join(
      process.cwd(),
      ".eleventy-cache",
      "webmentions.json",
    );

    // Log what we are trying to do for debugging
    console.log("ℹ️ Looking for webmentions at:", cachePath);

    if (fs.existsSync(cachePath)) {
      try {
        const raw = fs.readFileSync(cachePath, "utf8");
        const data = JSON.parse(raw);
        console.log(
          "✅ Loaded webmentions with",
          data.entries?.length || 0,
          "entries.",
        );
        return data;
      } catch (e) {
        console.error("⚠️ Error parsing webmentions:", e.message);
        return { entries: [] };
      }
    } else {
      console.warn("⚠️ Webmentions file NOT FOUND at:", cachePath);
      return { entries: [] };
    }
  });

  return {
    dir: { input: "src", output: "public", includes: "_includes" },
    passThroughCopy: ["_redirects"],
  };
}
