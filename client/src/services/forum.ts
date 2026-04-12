import { api } from "./api";
import type { ForumPost, ForumPostType, ForumReply, Skill } from "../types/models";

type ForumListParams = {
  search?: string;
  skill_id?: number;
  type?: ForumPostType | "all";
  sort?: "recent" | "popular" | "unanswered";
  page?: number;
  per_page?: 10 | 25 | 50;
};

type CreateForumPostPayload = {
  title: string;
  content: string;
  type: ForumPostType;
  skill_ids: number[];
};

type CreateForumReplyPayload = {
  content: string;
};

type VoteDirection = "up" | "down";
const allowLocalFallback = import.meta.env.VITE_ALLOW_FORUM_FALLBACK === "true";

type ReportPayload = {
  reason: string;
};

const fallbackSkillMap = new Map<number, Skill>([
  [1, { id: 1, name: "JavaScript", category: "Programming" }],
  [2, { id: 2, name: "React", category: "Frontend" }],
  [3, { id: 3, name: "Laravel", category: "Backend" }],
  [4, { id: 4, name: "Interview", category: "Career" }],
  [5, { id: 5, name: "SQL", category: "Database" }],
]);

const fallbackPosts: ForumPost[] = [
  {
    id: 1,
    user_id: 3,
    title: "How should I prepare for junior frontend interviews?",
    content: "<p>I have built 3 React projects and now I want to prepare for interviews. Which topics should I prioritize?</p>",
    post_type: "question",
    status: "published",
    is_solved: true,
    is_pinned: true,
    views_count: 138,
    replies_count: 2,
    likes_count: 11,
    author_name: "Nafis",
    skill_ids: [2, 4],
    skills: [fallbackSkillMap.get(2), fallbackSkillMap.get(4)].filter(Boolean) as Skill[],
    created_at: "2026-04-01T09:15:00Z",
    updated_at: "2026-04-02T07:00:00Z",
    replies: [
      {
        id: 101,
        post_id: 1,
        user_id: 9,
        author_name: "Mentor Araf",
        content: "<p>Focus on JavaScript fundamentals, React state management, and one clean portfolio project with tradeoff explanations.</p>",
        is_solution: true,
        votes_count: 8,
        created_at: "2026-04-01T11:40:00Z",
      },
      {
        id: 102,
        post_id: 1,
        user_id: 12,
        author_name: "Sadia",
        content: "<p>Practice behavioral questions too. Interviewers often check communication and project ownership.</p>",
        votes_count: 3,
        created_at: "2026-04-01T12:30:00Z",
      },
    ],
  },
  {
    id: 2,
    user_id: 4,
    title: "Best way to structure Laravel API resources for job portal projects",
    content: "<p>I am refactoring API responses. Should I use dedicated Resource classes everywhere or only on public endpoints?</p>",
    post_type: "discussion",
    status: "published",
    is_solved: false,
    views_count: 89,
    replies_count: 1,
    likes_count: 6,
    author_name: "Rahat",
    skill_ids: [3, 5],
    skills: [fallbackSkillMap.get(3), fallbackSkillMap.get(5)].filter(Boolean) as Skill[],
    created_at: "2026-04-03T04:20:00Z",
    updated_at: "2026-04-03T05:00:00Z",
    replies: [
      {
        id: 201,
        post_id: 2,
        user_id: 7,
        author_name: "Musa",
        content: "<p>Use Resources for all user-facing responses. It keeps format consistent and easier to version later.</p>",
        votes_count: 4,
        created_at: "2026-04-03T06:10:00Z",
      },
    ],
  },
  {
    id: 3,
    user_id: 6,
    title: "Free checklist: things to verify before applying to a job",
    content: "<p>Sharing a reusable checklist that helped me avoid weak applications. Happy to improve it with feedback.</p>",
    post_type: "resource",
    status: "published",
    is_solved: false,
    views_count: 57,
    replies_count: 0,
    likes_count: 9,
    author_name: "Ishrat",
    skill_ids: [4],
    skills: [fallbackSkillMap.get(4)].filter(Boolean) as Skill[],
    created_at: "2026-04-05T08:00:00Z",
    updated_at: "2026-04-05T08:00:00Z",
    replies: [],
  },
];

const localPostsStorageKey = "carrigrow.forum.local_posts";
const localVotesStorageKey = "carrigrow.forum.post_votes";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function clonePost(post: ForumPost): ForumPost {
  return {
    ...post,
    skill_ids: post.skill_ids ? [...post.skill_ids] : [],
    skills: post.skills ? [...post.skills] : [],
    replies: post.replies ? post.replies.map((reply) => ({ ...reply })) : [],
  };
}

function applySkillDetails(post: ForumPost): ForumPost {
  const explicitSkillIds = post.skill_ids ?? [];
  const inferredSkillIds = (post.skills ?? []).map((skill) => skill.id);
  const skillIds = Array.from(new Set([...explicitSkillIds, ...inferredSkillIds])).filter((id) => id > 0);

  const skills = skillIds
    .map((id) => {
      const fromPost = post.skills?.find((skill) => skill.id === id);
      return fromPost ?? fallbackSkillMap.get(id);
    })
    .filter(Boolean) as Skill[];

  return {
    ...post,
    skill_ids: skillIds,
    skills,
  };
}

function normalizeReplyPayload(payload: unknown): ForumReply | null {
  if (!isObject(payload)) {
    return null;
  }

  if (typeof payload.id !== "number") {
    return null;
  }

  return {
    id: payload.id,
    post_id: toNumber(payload.post_id, 0),
    user_id: toNumber(payload.user_id, 0),
    content: typeof payload.content === "string" ? payload.content : "",
    is_solution: Boolean(payload.is_solution),
    votes_count: toNumber(payload.votes_count, 0),
    created_at: toStringOrNull(payload.created_at),
    updated_at: toStringOrNull(payload.updated_at),
    author_name: toStringOrNull(payload.author_name),
  };
}

function normalizePostPayload(payload: unknown): ForumPost | null {
  if (!isObject(payload) || typeof payload.id !== "number") {
    return null;
  }

  const rawSkills = Array.isArray(payload.skills) ? payload.skills : [];
  const skills = rawSkills
    .map((entry) => {
      if (!isObject(entry) || typeof entry.id !== "number" || typeof entry.name !== "string") {
        return null;
      }

      return {
        id: entry.id,
        name: entry.name,
        category: typeof entry.category === "string" ? entry.category : null,
      } satisfies Skill;
    })
    .filter(Boolean) as Skill[];

  const rawSkillIds = Array.isArray(payload.skill_ids) ? payload.skill_ids : [];
  const skillIds = rawSkillIds.map((id) => toNumber(id, 0)).filter((id) => id > 0);

  const rawReplies = Array.isArray(payload.replies) ? payload.replies : [];
  const replies = rawReplies.map(normalizeReplyPayload).filter(Boolean) as ForumReply[];

  return applySkillDetails({
    id: payload.id,
    user_id: toNumber(payload.user_id, 0),
    title: typeof payload.title === "string" ? payload.title : "Untitled",
    content: typeof payload.content === "string" ? payload.content : "",
    post_type:
      payload.post_type === "question" || payload.post_type === "discussion" || payload.post_type === "resource"
        ? payload.post_type
        : "discussion",
    status: typeof payload.status === "string" ? payload.status : "published",
    is_solved: Boolean(payload.is_solved),
    is_pinned: Boolean(payload.is_pinned),
    views_count: toNumber(payload.views_count, 0),
    replies_count: toNumber(payload.replies_count, replies.length),
    likes_count: toNumber(payload.likes_count, 0),
    created_at: toStringOrNull(payload.created_at),
    updated_at: toStringOrNull(payload.updated_at),
    author_name: toStringOrNull(payload.author_name),
    skill_ids: skillIds,
    skills,
    replies,
  });
}

function sortFallbackPosts(posts: ForumPost[], sort: ForumListParams["sort"]): ForumPost[] {
  const cloned = posts.map(clonePost);

  if (sort === "popular") {
    return cloned.sort((a, b) => (b.likes_count ?? 0) + (b.views_count ?? 0) - ((a.likes_count ?? 0) + (a.views_count ?? 0)));
  }

  if (sort === "unanswered") {
    return cloned.sort((a, b) => (a.replies_count ?? 0) - (b.replies_count ?? 0));
  }

  return cloned.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

function readLocalPosts(): ForumPost[] {
  try {
    const raw = window.localStorage.getItem(localPostsStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizePostPayload).filter(Boolean) as ForumPost[];
  } catch {
    return [];
  }
}

function writeLocalPosts(posts: ForumPost[]) {
  window.localStorage.setItem(localPostsStorageKey, JSON.stringify(posts));
}

function readLocalVotes(): Record<number, VoteDirection | null> {
  try {
    const raw = window.localStorage.getItem(localVotesStorageKey);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) {
      return {};
    }

    const result: Record<number, VoteDirection | null> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const id = Number(key);
      if (!Number.isFinite(id) || id <= 0) {
        continue;
      }

      if (value === "up" || value === "down" || value === null) {
        result[id] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

function writeLocalVotes(votes: Record<number, VoteDirection | null>) {
  window.localStorage.setItem(localVotesStorageKey, JSON.stringify(votes));
}

function mergedFallbackPosts(): ForumPost[] {
  const localPosts = readLocalPosts();
  const byId = new Map<number, ForumPost>();

  for (const post of [...fallbackPosts, ...localPosts]) {
    byId.set(post.id, applySkillDetails(clonePost(post)));
  }

  return Array.from(byId.values());
}

function findPostFromFallback(postId: number): ForumPost | null {
  const post = mergedFallbackPosts().find((item) => item.id === postId);
  if (!post) {
    return null;
  }

  return clonePost(post);
}

export async function listForumPosts(params: ForumListParams = {}) {
  const requestParams: ForumListParams = {
    ...params,
    type: params.type === "all" ? undefined : params.type,
  };

  try {
    const { data } = await api.get("/forum/posts", { params: requestParams });

    if (isObject(data) && Array.isArray(data.data)) {
      const posts = data.data.map(normalizePostPayload).filter(Boolean) as ForumPost[];
      return {
        posts,
        page: Math.max(1, toNumber(data.current_page, 1)),
        totalPages: Math.max(1, toNumber(data.last_page, 1)),
        total: Math.max(posts.length, toNumber(data.total, posts.length)),
      };
    }

    if (isObject(data) && Array.isArray(data.posts)) {
      const posts = data.posts.map(normalizePostPayload).filter(Boolean) as ForumPost[];
      return {
        posts,
        page: 1,
        totalPages: 1,
        total: posts.length,
      };
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Forum posts API did not return a supported payload.");
  }

  const merged = mergedFallbackPosts();

  const filtered = merged.filter((post) => {
    if (params.type && params.type !== "all" && (post.post_type ?? "discussion") !== params.type) {
      return false;
    }

    if (params.skill_id && !(post.skill_ids ?? []).includes(params.skill_id)) {
      return false;
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim().toLowerCase();
      const haystack = `${post.title} ${post.content}`.toLowerCase();
      if (!haystack.includes(term)) {
        return false;
      }
    }

    return true;
  });

  const sorted = sortFallbackPosts(filtered, params.sort);
  const perPage = params.per_page ?? 10;
  const page = Math.max(1, params.page ?? 1);
  const startIndex = (page - 1) * perPage;
  const paged = sorted.slice(startIndex, startIndex + perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));

  return {
    posts: paged,
    page,
    totalPages,
    total: sorted.length,
  };
}

export async function getForumPost(postId: number) {
  try {
    const { data } = await api.get(`/forum/posts/${postId}`);

    if (isObject(data) && isObject(data.post)) {
      const post = normalizePostPayload(data.post);
      if (post) {
        return { post };
      }
    }

    const post = normalizePostPayload(data);
    if (post) {
      return { post };
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Forum post API did not return a supported payload.");
  }

  const fallbackPost = findPostFromFallback(postId);
  if (!fallbackPost) {
    throw new Error("Post not found");
  }

  fallbackPost.views_count = (fallbackPost.views_count ?? 0) + 1;

  const allPosts = mergedFallbackPosts().map((post) => (post.id === postId ? fallbackPost : post));
  writeLocalPosts(allPosts);

  return { post: fallbackPost };
}

export async function createForumPost(payload: CreateForumPostPayload) {
  try {
    const { data } = await api.post("/forum/posts", payload);

    if (isObject(data) && isObject(data.post)) {
      const post = normalizePostPayload(data.post);
      if (post) {
        return { post };
      }
    }

    const post = normalizePostPayload(data);
    if (post) {
      return { post };
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Forum post creation failed.");
  }

  const currentPosts = mergedFallbackPosts();
  const nextId = currentPosts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;

  const post: ForumPost = applySkillDetails({
    id: nextId,
    user_id: 0,
    title: payload.title,
    content: payload.content,
    post_type: payload.type,
    status: "published",
    is_solved: false,
    is_pinned: false,
    views_count: 0,
    replies_count: 0,
    likes_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skill_ids: payload.skill_ids,
    replies: [],
  });

  writeLocalPosts([post, ...currentPosts]);

  return { post };
}

export async function createForumReply(postId: number, payload: CreateForumReplyPayload) {
  try {
    const { data } = await api.post(`/forum/posts/${postId}/replies`, payload);

    if (isObject(data) && isObject(data.reply)) {
      const reply = normalizeReplyPayload(data.reply);
      if (reply) {
        return { reply };
      }
    }

    const reply = normalizeReplyPayload(data);
    if (reply) {
      return { reply };
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Forum reply creation failed.");
  }

  const allPosts = mergedFallbackPosts();
  const nextReplyId = allPosts
    .flatMap((post) => post.replies ?? [])
    .reduce((maxId, reply) => Math.max(maxId, reply.id), 0) + 1;

  const reply: ForumReply = {
    id: nextReplyId,
    post_id: postId,
    user_id: 0,
    content: payload.content,
    is_solution: false,
    votes_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_name: "You",
  };

  const nextPosts = allPosts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    const replies = [...(post.replies ?? []), reply];
    return {
      ...post,
      replies,
      replies_count: replies.length,
      updated_at: new Date().toISOString(),
    };
  });

  writeLocalPosts(nextPosts);

  return { reply };
}

export async function markReplyAsSolution(replyId: number) {
  try {
    const { data } = await api.post(`/forum/replies/${replyId}/mark-solution`);

    if (isObject(data) && isObject(data.reply)) {
      const reply = normalizeReplyPayload(data.reply);
      if (reply) {
        return { reply };
      }
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Mark solution failed.");
  }

  const allPosts = mergedFallbackPosts();
  let updatedReply: ForumReply | null = null;

  const nextPosts = allPosts.map((post) => {
    const replies = (post.replies ?? []).map((reply) => {
      const nextReply = {
        ...reply,
        is_solution: reply.id === replyId,
      };

      if (nextReply.id === replyId) {
        updatedReply = nextReply;
      }

      return nextReply;
    });

    const isSolved = replies.some((reply) => reply.is_solution);
    return {
      ...post,
      replies,
      is_solved: isSolved,
      updated_at: new Date().toISOString(),
    };
  });

  writeLocalPosts(nextPosts);

  if (!updatedReply) {
    throw new Error("Reply not found");
  }

  return { reply: updatedReply };
}

export async function voteForumPost(postId: number, direction: VoteDirection) {
  try {
    const { data } = await api.post(`/forum/posts/${postId}/vote`, { direction });

    if (isObject(data) && isObject(data.post)) {
      const post = normalizePostPayload(data.post);
      if (post) {
        return { post };
      }
    }
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
  }

  if (!allowLocalFallback) {
    throw new Error("Forum voting failed.");
  }

  const votes = readLocalVotes();
  const currentVote = votes[postId] ?? null;
  const nextVote = currentVote === direction ? null : direction;
  votes[postId] = nextVote;
  writeLocalVotes(votes);

  const delta =
    nextVote === currentVote
      ? 0
      : (nextVote === "up" ? 1 : nextVote === "down" ? -1 : 0) - (currentVote === "up" ? 1 : currentVote === "down" ? -1 : 0);

  const allPosts = mergedFallbackPosts();
  const nextPosts = allPosts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    return {
      ...post,
      likes_count: Math.max(0, (post.likes_count ?? 0) + delta),
      updated_at: new Date().toISOString(),
    };
  });

  writeLocalPosts(nextPosts);

  const updated = nextPosts.find((post) => post.id === postId);
  if (!updated) {
    throw new Error("Post not found");
  }

  return { post: updated };
}

export async function reportForumPost(postId: number, payload: ReportPayload) {
  const { data } = await api.post(`/forum/posts/${postId}/report`, payload);
  return data as { message: string };
}

export async function reportForumReply(replyId: number, payload: ReportPayload) {
  const { data } = await api.post(`/forum/replies/${replyId}/report`, payload);
  return data as { message: string };
}
