import { blogLocalizedSlugs } from "./localized-slugs";
import { moreDraftBlogPosts2 } from "./all-draft-posts";
import { draftBlogPosts } from "./draft-posts";
import { moreDraftBlogPosts } from "./draft-posts-rest";
import type { BlogPost } from "./types";

export const allDraftBlogPosts: BlogPost[] = [
  ...draftBlogPosts,
  ...moreDraftBlogPosts,
  ...moreDraftBlogPosts2,
].map((post) => ({
  ...post,
  slugs: blogLocalizedSlugs[post.slug] ?? {
    az: post.slug,
    en: post.slug,
    de: post.slug,
    ru: post.slug,
  },
}));
