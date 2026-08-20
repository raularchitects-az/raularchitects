import { draftBlogPosts } from "./draft-posts";
import { moreDraftBlogPosts } from "./draft-posts-rest";
import { moreDraftBlogPosts2 } from "./all-draft-posts";

export const allDraftBlogPosts = [
  ...draftBlogPosts,
  ...moreDraftBlogPosts,
  ...moreDraftBlogPosts2,
];
