export default {
  layout: "post.njk",
  kind: "post",
  eleventyComputed: {
    permalink: (data) => `/blog/${data.page.fileSlug}/`,
    ogImage: (data) => data.image || "",
  },
};
