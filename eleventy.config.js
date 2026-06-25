// eleventy.config.js
import rssPlugin from "@11ty/eleventy-plugin-rss";
import fetchWebmentions from "./scripts/fetch-webmentions.js";

export default function (eleventyConfig) {
  // Passthrough copies
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/js");

  // Input/output directories
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("public");

  // Plugins & filters
  eleventyConfig.addPlugin(rssPlugin);

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
    dir: { input: "src" },
    passThroughCopy: ["_redirects"],
  };
}
