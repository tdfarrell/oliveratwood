export default {
  layout: "short.njk",
  kind: "short",
  eleventyComputed: {
    permalink: (data) => `/short-stories/${data.page.fileSlug}/`,
    ogImage: (data) => data.cover || "",
  },
};
