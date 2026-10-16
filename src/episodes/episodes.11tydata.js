export default {
  layout: "episode.njk",
  eleventyComputed: {
    permalink: (data) => `/stories/${data.story}/part-${data.number}/`,
    ogImage: (data) => data.cover || "",
  },
};
