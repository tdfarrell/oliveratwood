export default {
  layout: "poem.njk",
  kind: "poem",
  eleventyComputed: {
    permalink: (data) => `/poetry/${data.page.fileSlug}/`,
    ogImage: (data) => data.cover || "",
  },
};
