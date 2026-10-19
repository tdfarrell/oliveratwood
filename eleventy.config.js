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

  const byDateDesc = (a, b) => b.date - a.date;

  // Serials and their installments
  eleventyConfig.addCollection("episodes", (api) =>
    api.getFilteredByGlob("src/episodes/*.md").sort((a, b) => a.data.number - b.data.number)
  );
  eleventyConfig.addCollection("latest", (api) =>
    api.getFilteredByGlob("src/episodes/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("stories", (api) =>
    api
      .getFilteredByGlob("src/stories/*.md")
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99))
  );

  // Stand-alone pieces and the blog, newest first
  eleventyConfig.addCollection("shorts", (api) =>
    api.getFilteredByGlob("src/short-stories/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("poems", (api) =>
    api.getFilteredByGlob("src/poetry/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/*.md").sort(byDateDesc)
  );

  // All fiction (serial parts, short stories, poems), newest first: drives the featured cover
  eleventyConfig.addCollection("fiction", (api) =>
    api
      .getFilteredByGlob(["src/episodes/*.md", "src/short-stories/*.md", "src/poetry/*.md"])
      .sort(byDateDesc)
  );

  // Everything for the RSS feed
  eleventyConfig.addCollection("everything", (api) =>
    api
      .getFilteredByGlob(["src/episodes/*.md", "src/short-stories/*.md", "src/poetry/*.md", "src/blog/*.md"])
      .sort(byDateDesc)
  );

  // Previous (older) and next (newer) pieces within a date-sorted list
  eleventyConfig.addFilter("olderThan", (list, url) => {
    const i = (list || []).findIndex((x) => x.url === url);
    return i >= 0 ? list[i + 1] : undefined;
  });
  eleventyConfig.addFilter("newerThan", (list, url) => {
    const i = (list || []).findIndex((x) => x.url === url);
    return i > 0 ? list[i - 1] : undefined;
  });

  // Serials that have at least one published part
  eleventyConfig.addFilter("withParts", (stories, episodes) =>
    (stories || []).filter((s) => (episodes || []).some((e) => e.data.story === s.fileSlug))
  );

  // Blog posts that are about a given serial
  eleventyConfig.addFilter("postsAbout", (posts, slug) =>
    (posts || []).filter((p) => p.data.story && p.data.story === slug)
  );

  // Color for a stand-alone piece: its own spine color, else one from the palette
  eleventyConfig.addFilter("pieceColor", (item, list, offset = 0) => {
    if (item?.data?.spine) return item.data.spine;
    const i = Math.max(0, (list || []).findIndex((x) => x.url === item?.url));
    return SPINE_PALETTE[(i + offset) % SPINE_PALETTE.length];
  });

  // A short plain-text preview from a piece's text
  eleventyConfig.addFilter("excerpt", (content, words = 30) => {
    const text = String(content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .split(/\s+/)
      .filter(Boolean);
    return text.slice(0, words).join(" ") + (text.length > words ? "…" : "");
  });

  // The first line of a poem
  eleventyConfig.addFilter("firstLine", (content) => {
    const firstPara = (String(content || "").match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    return firstPara.split(/\n|<br\s*\/?>/)[0].replace(/<[^>]+>/g, "").trim();
  });

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
