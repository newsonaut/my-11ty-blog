import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/js");

  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("public");

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
}

export const config = {
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};

// webmentions
const fetchWebmentions = require("./_data/fetch-webmentions");

module.exports = async function (eleventyConfig) {
  // Pre-build: Fetch mentions
  eleventyConfig.on("beforeBuild", () => {
    fetchWebmentions().catch(console.error);
  });

  // Make mentions available globally
  eleventyConfig.addGlobalDataAsync("webmentions", async () => {
    const fs = require("fs");
    const path = require("path");
    const cachePath = path.join(".eleventy-cache", "webmentions.json");
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    }
    return { entries: [] };
  });

  return {
    dir: { input: "src" },
    passThroughCopy: ["_redirects"], // Optional for Netlify redirects
  };
};
