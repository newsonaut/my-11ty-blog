// eleventy.config.js
import rssPlugin from "@11ty/eleventy-plugin-rss";
import fetchWebmentions from "./scripts/fetch-webmentions.js";

export default function (eleventyConfig) {
  // Initialize RSS plugin
  eleventyConfig.addPlugin(rssPlugin);

  // ... (passthrough copies) ...

  // --- ADD THESE MANUAL FILTERS FOR RSS/LIQUID ---

  // Filter: dateToRfc3339 (converts dates to RFC3339 format)
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return new Date(dateObj).toISOString().replace(/\.\d{3}Z$/, "Z");
  });

  // Filter: getNewestCollectionItemDate (gets newest item date from collection)
  eleventyConfig.addFilter("getNewestCollectionItemDate", (collection) => {
    const items = [...collection].sort((a, b) => b.date - a.date);
    if (items.length > 0 && items[0].date) {
      return items[0].date;
    }
    return new Date();
  });

  // Your existing filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet).sort();
  });

  // Pre-build hook for webmentions
  eleventyConfig.on("beforeBuild", async () => {
    console.log("🚀 Triggering Webmention Fetch...");
    try {
      await fetchWebmentions();
    } catch (error) {
      console.error("❌ Webmentions error:", error);
    }
  });

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
    },
    passThroughCopy: ["_redirects"],
  };
}
