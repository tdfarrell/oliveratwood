export default {
  layout: "episode.njk",
  kind: "episode",
  eleventyComputed: {
    permalink: (data) => `/stories/${data.story}/part-${data.number}/`,
    ogImage: (data) => data.cover || "",
  },
};
