import rssPlugin from "@11ty/eleventy-plugin-rss";
import { read } from "fast-glob"; // If needed for webmentions
import fs from "fs";
import path from "path";

// Fetch webmentions helper
const fetchWebmentions = () => {
  // Your existing fetch logic here
};

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

  // Webmentions (pre-build hook)
  eleventyConfig.on("beforeBuild", async () => {
    try {
      await fetchWebmentions();
    } catch (error) {
      console.error(error);
    }
  });

  // Make mentions available globally
  eleventyConfig.addGlobalDataAsync("webmentions", async () => {
    const cachePath = path.join(".eleventy-cache", "webmentions.json");
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    }
    return { entries: [] };
  });

  return {
    dir: { input: "src" },
    passThroughCopy: ["_redirects"],
  };
}

export const config = {
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
