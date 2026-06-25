// eleventy.config.js
import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rssPlugin);

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/js");

  // Filters
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

  // Configuration
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
    },
    passThroughCopy: ["_redirects"],
  };
}
