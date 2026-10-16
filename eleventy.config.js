import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// Spine colors used when a story doesn't set its own
const SPINE_PALETTE = ["#C9531A", "#2F6E8F", "#2E7D4F", "#7A3E8C", "#B8862B", "#9C2F3A"];

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**"); // the editor is copied as-is
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy({ "src/static/.htaccess": ".htaccess" }); // Bluehost (Apache) settings

  // Every <img> pointing at an uploaded image is resized and converted to WebP,
  // so large cover uploads stay fast to load.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "auto"],
    widths: [320, 640, 1000],
    svgShortCircuit: true,
    failOnError: false,
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
    },
  });

  // Drafts (draft: true) are skipped entirely: never built, never listed.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft) return false;
  });

  eleventyConfig.addCollection("episodes", (api) =>
    api.getFilteredByGlob("src/episodes/*.md").sort((a, b) => a.data.number - b.data.number)
  );

  eleventyConfig.addCollection("latest", (api) =>
    api.getFilteredByGlob("src/episodes/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("stories", (api) =>
    api
      .getFilteredByGlob("src/stories/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  eleventyConfig.addFilter("forStory", (episodes, slug) =>
    (episodes || []).filter((e) => e.data.story === slug)
  );

  eleventyConfig.addFilter("storyBySlug", (stories, slug) =>
    (stories || []).find((s) => s.fileSlug === slug)
  );

  // A story's spine color: its own setting, else one from the palette.
  eleventyConfig.addFilter("spineColor", (story, stories) => {
    if (story?.data?.spine) return story.data.spine;
    const i = Math.max(0, (stories || []).findIndex((s) => s.fileSlug === story?.fileSlug));
    return SPINE_PALETTE[i % SPINE_PALETTE.length];
  });

  // Readable text color (light or dark) to sit on top of a background color.
  eleventyConfig.addFilter("inkOn", (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return "#FFFFFF";
    const n = parseInt(m[1], 16);
    const lin = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
    return L > 0.4 ? "#1C2326" : "#FFFFFF";
  });

  // Varied but stable spine heights, so the shelf looks hand-stacked.
  eleventyConfig.addFilter("spineHeight", (key) => {
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return 270 + (h % 70);
  });

  eleventyConfig.addFilter("roman", (num) => {
    let n = Number(num) || 0;
    if (n <= 0 || n > 3999) return String(num);
    const map = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let out = "";
    for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
    return out;
  });

  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("shortDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("rfcDate", (d) => new Date(d).toUTCString());
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("inSection", (url, prefix) => typeof url === "string" && url.startsWith(prefix));
  eleventyConfig.addFilter("absoluteUrl", (path, base) => new URL(path, base).toString());

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 230)) + " min read";
  });

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
