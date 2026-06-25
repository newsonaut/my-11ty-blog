const rssPlugin = require("@11ty/eleventy-plugin-rss");
const fs = require("fs");
const path = require("path");

// Webmentions fetcher (simplified - adjust path if needed)
const fetchWebmentions = async () => {
  // Your actual fetch logic here
  console.log("Webmentions fetch placeholder");
  return { entries: [] };
};

module.exports = function (eleventyConfig) {
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
    try {
      await fetchWebmentions();
    } catch (error) {
      console.error("Webmentions error:", error);
    }
  });

  // Global data workaround (if you need mentions available in templates)
  // You can load from cache file synchronously or pass via template data files
  eleventyConfig.addDataExtension("json", (contents) => {
    return JSON.parse(contents);
  });

  return {
    dir: { input: "src" },
    passThroughCopy: ["_redirects"],
  };
};

module.exports.config = {
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
