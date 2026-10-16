export default {
  layout: "story.njk",
  eleventyComputed: {
    permalink: (data) => `/stories/${data.page.fileSlug}/`,
    ogImage: (data) => data.cover || "",
  },
};
