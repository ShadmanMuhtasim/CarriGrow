import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import PostCard from "../../components/forum/PostCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { listForumPosts } from "../../services/forum";
import { listSkills } from "../../services/skills";
import type { ForumPost, ForumPostType, Skill } from "../../types/models";

type PostSort = "recent" | "popular" | "unanswered";

const perPage = 10;

function parseType(value: string): ForumPostType | "all" {
  if (value === "question" || value === "discussion" || value === "resource") {
    return value;
  }
  return "all";
}

function formatType(value: ForumPostType): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ForumList() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ForumPostType | "all">("all");
  const [skillFilter, setSkillFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<PostSort>("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadSkills() {
      try {
        const response = await listSkills();
        if (!cancelled) {
          setSkills(response.skills);
        }
      } catch {
        if (!cancelled) {
          setSkills([]);
        }
      }
    }

    void loadSkills();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);

      try {
        const response = await listForumPosts({
          search: appliedSearch || undefined,
          skill_id: skillFilter === "all" ? undefined : skillFilter,
          type: typeFilter,
          sort: sortBy,
          page,
          per_page: perPage,
        });

        if (!cancelled) {
          setPosts(response.posts);
          setTotalPosts(response.total);
          setTotalPages(response.totalPages);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setTotalPosts(0);
          setTotalPages(1);
          toastUI.error("Could not load forum posts right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, page, skillFilter, sortBy, typeFilter]);

  const typeOptions = useMemo(() => {
    const options: Array<ForumPostType | "all"> = ["all", "question", "discussion", "resource"];
    return options;
  }, []);

  function resetFilters() {
    setTypeFilter("all");
    setSkillFilter("all");
    setSortBy("recent");
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  }

  function applySearch() {
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <div className="container py-4">
      <div className="vstack gap-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Forum" }]} />

        <Card
          title="Community Forum"
          subtitle="Browse discussions, ask questions, and share knowledge with the community."
          actions={
            <div className="d-flex gap-2">
              {user ? (
                <Link to="/forum/new">
                  <Button icon={<i className="bi bi-plus-lg" />}>New post</Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline">Sign in to post</Button>
                </Link>
              )}
            </div>
          }
        >
          <div className="row g-3">
            <aside className="col-12 col-xl-3">
              <div className="border rounded-3 p-3 h-100">
                <div className="fw-semibold mb-3">Filter sidebar</div>

                <div className="mb-3">
                  <label className="form-label">Post type</label>
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(event) => {
                      setTypeFilter(parseType(event.target.value));
                      setPage(1);
                    }}
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "all" ? "All types" : formatType(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Skill</label>
                  <select
                    className="form-select"
                    value={skillFilter}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSkillFilter(nextValue === "all" ? "all" : Number(nextValue));
                      setPage(1);
                    }}
                  >
                    <option value="all">All skills</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Sort by</label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value as PostSort);
                      setPage(1);
                    }}
                  >
                    <option value="recent">Most recent</option>
                    <option value="popular">Most popular</option>
                    <option value="unanswered">Unanswered first</option>
                  </select>
                </div>

                <Button type="button" variant="outline" className="w-100" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            </aside>

            <section className="col-12 col-xl-9">
              <div className="border rounded-3 p-3 mb-3">
                <form
                  className="d-flex flex-wrap gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    applySearch();
                  }}
                >
                  <div className="flex-grow-1" style={{ minWidth: 240 }}>
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search title or content"
                      aria-label="Search forum posts"
                    />
                  </div>
                  <Button type="submit" variant="primary" icon={<i className="bi bi-search" />}>
                    Search
                  </Button>
                </form>
              </div>

              <div className="text-muted small mb-3">Showing {posts.length} of {totalPosts} posts</div>

              {loading ? (
                <Loading label="Loading forum posts..." />
              ) : posts.length === 0 ? (
                <div className="border rounded-3 p-4 text-center text-muted">No posts found for the selected filters.</div>
              ) : (
                <div className="row g-3">
                  {posts.map((post) => (
                    <div key={post.id} className="col-12">
                      <PostCard post={post} detailPath={`/forum/${post.id}`} />
                    </div>
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-end mt-3">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
