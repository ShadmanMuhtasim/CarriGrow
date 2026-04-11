# CarriGrow Full-Proof End-to-End Test Plan (Issue #1 to #35)

This document is the execution playbook for validating CarriGrow from Milestone 1 Issue #1 through all completed work to Issue #35.

It is designed to catch:
- Broken frontend page routes
- Missing frontend-to-backend endpoint connections
- Role authorization leaks
- Database table/model/controller mismatches
- Regressions in cross-feature user flows

---

## 1) Test Objective

Primary objective:
- Prove that completed issues (#1-#35) work end-to-end from browser to API to database.

Secondary objective:
- Produce a reproducible sign-off process that any team member can run before merge/release.

---

## 2) Scope

In scope:
- Milestone 1: Issues #1-#15
- Milestone 2: Issues #16-#28
- Milestone 3 completed scope: Issues #29-#35

Out of scope:
- Planned but not completed delivery items (#36-#40), except smoke readiness dependencies.

---

## 3) Required Test Environment

Use local Docker stack and committed SQL baseline:
1. `docker compose --env-file .env up -d --build`
2. App URL: `http://localhost:8000`
3. Frontend URL: `http://localhost:5173` (or mapped host port)
4. API root: `http://localhost:8000/api`

Deterministic reset (recommended before full run):
1. `docker compose --env-file .env down -v`
2. `docker compose --env-file .env up -d --build`

Seeded account set (from `10-reference-data.sql`):
- Employer: `employer@carrigrow.com`
- Job seeker: `jobseeker@carrigrow.com`
- Mentor: `mentor@carrigrow.com`
- Admin: `admin1@carrigrow.com`
- Password: `password`



---

## 4) Architecture Sources of Truth

Frontend routing source:
- `client/src/App.tsx`

Frontend role navigation sources:
- `client/src/layouts/JobSeekerLayout.tsx`
- `client/src/layouts/EmployerLayout.tsx`
- `client/src/layouts/MentorLayout.tsx`
- `client/src/layouts/AdminLayout.tsx`

Backend route source:
- `server/routes/api.php`

Database schema source:
- `database/docker/init/00-schema.sql`

Primary model set to verify:
- `User`, `Job`, `JobApplication`, `Skill`
- `JobSeekerProfile`, `EmployerProfile`, `MentorProfile`
- `ForumPost`, `ForumReply`, `ForumPostVote`
- `UserNotification`
- `ContentReport`, `AdminReport`, `AdminAction`

---

## 5) Global Must-Pass Gates (Run Before Milestone Tests)

### Gate A: Route-to-Page Integrity

Verify all known routes render valid pages, especially:
- Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/jobs`, `/jobs/:jobId`, `/forum`, `/forum/new`, `/forum/:postId`, `/mentors/:mentorId`
- Dashboard: `/dashboard` and all role menu links

Pass criteria:
- No critical route falls into unintended generic fallback (`/dashboard/:section`)
- No 404 for expected production routes

employer@carrigrow.com
jobseeker@carrigrow.com
mentor@carrigrow.com
admin1@carrigrow.com

### Gate B: Page-to-API Connectivity

For each data-driven page:
1. Open page
2. Inspect network requests
3. Confirm endpoint exists in `server/routes/api.php`
4. Confirm status codes and payload shape are valid

Pass criteria:
- No frontend call to missing endpoint
- No consistent `500` in happy-path interactions

### Gate C: Schema-Model-Controller Alignment

For each active feature:
1. Table exists in `00-schema.sql`
2. Related model exists and maps expected fields/relations
3. Controller endpoint reads/writes existing columns only

Pass criteria:
- No writes to missing columns
- No active model pointing to non-existent table

---

## 6) Milestone 1 Test Plan (Issue #1 to #15)

## Issue #1 and #2: Monorepo + Docker Baseline
- Verify repo boots with documented commands.
- Verify app + db + adminer services are healthy.
- Verify no migration/seeder dependency is required for base start.

Pass criteria:
- Fresh clone/setup path works with database-first SQL init.

## Issue #3: Users/Auth Core Tables
- Validate presence and shape of tables:
  - `users`
  - `password_reset_tokens`
  - `failed_jobs`
  - `personal_access_tokens`
- Register and login one user; confirm row creation and role field behavior.

Pass criteria:
- Auth flow creates/reads correct rows without schema errors.

## Issue #4: Frontend Boilerplate and Base Layout
- Verify global router works.
- Verify `NotFound` route behavior.
- Verify Loading/Error boundary surfaces expected UI.

Pass criteria:
- Public pages load with no layout-level crash.

## Issue #5 and #6: Auth Backend + Login/Register Frontend
- Register each role from UI.
- Login each seeded role.
- Check logout and token invalidation behavior.
- Verify forgot/reset password flow.
- Verify redirect paths by role after login/register.

API checks:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Pass criteria:
- Full auth lifecycle works for all supported roles.

## Issue #7, #8, #9: Role Profile Schemas and CRUD
- For job seeker, employer, mentor:
  - Update profile
  - Reload page
  - Confirm persistence
- Test profile delete path where supported.

Table checks:
- `job_seeker_profiles`
- `employer_profiles`
- `mentor_profiles`

Pass criteria:
- Role-specific profile data persists and returns correctly.

## Issue #10: Skills Schema and Tagging
- Verify skills list endpoint.
- Add/update/remove user skills.
- Verify proficiency values persist.

API checks:
- `GET /api/skills`
- `GET /api/users/{id}/skills`
- `POST /api/users/{id}/skills`
- `DELETE /api/users/{id}/skills/{skillId}`

Table checks:
- `skills`
- `skill_user`

Pass criteria:
- Skill attach/detach lifecycle works with correct pivot updates.

## Issue #11, #12, #13, #14, #15: Profile/Dashboard/UI/Form Foundation
- Verify all dashboard sections for each role render.
- Verify nav links in each role layout map to real routes.
- Verify shared UI components render in key pages.
- Verify form validation and loading states in auth/profile pages.

Pass criteria:
- No role layout contains dead link to unknown route.
- Shared component layer does not break core flows.

---

## 7) Milestone 2 Test Plan (Issue #16 to #28)

## Issue #16, #17, #20: Employer Job CRUD and Management
- Create job (draft)
- Publish job
- Edit job
- Close/reopen job
- Delete job
- Verify management pages reflect latest status

API checks:
- `GET /api/employer/jobs`
- `POST /api/employer/jobs`
- `GET /api/employer/jobs/{job}`
- `PUT/PATCH /api/employer/jobs/{job}`
- `DELETE /api/employer/jobs/{job}`

Table checks:
- `jobs` (`status`, `deleted_at`, `views_count`, `applications_count`)

Pass criteria:
- All employer job actions persist and reload correctly.

## Issue #18 and #19: Job Browse/Search/Detail
- Verify public jobs list with search/filter/sort/pagination.
- Verify detail page only serves eligible published job data.
- Verify repeated views update count.

API checks:
- `GET /api/jobs`
- `GET /api/jobs/featured`
- `GET /api/jobs/{job}`

Pass criteria:
- Browse/detail UX matches backend filtering rules.

## Issue #21, #22, #23, #24: Applications and Tracking
- Job seeker applies to published job.
- Duplicate apply returns expected conflict.
- Employer lists applicants for owned job.
- Employer updates application status/notes and data persists.
- Job seeker sees updates in tracking list.

API checks:
- `POST /api/jobs/{job}/apply`
- `GET /api/applications`
- `GET /api/jobs/{job}/applications`
- `PATCH /api/jobs/{job}/applications/{application}`

Table checks:
- `job_applications`
- Unique key `(job_id, user_id)`

Pass criteria:
- Application lifecycle is consistent across seeker and employer views.

## Issue #25, #26, #27, #28: Matching and Recommendations
- Attach skills to job.
- Validate match-score endpoint with different user skill profiles.
- Validate recommended jobs endpoint and pagination.
- Validate frontend match display and missing-skill sections.

API checks:
- `GET /api/jobs/{job}/skills`
- `POST /api/jobs/{job}/skills`
- `GET /api/jobs/{job}/match-score`
- `GET /api/recommendations/jobs`
- `GET /api/users/{user}/recommended-jobs`

Table checks:
- `job_skill`

Pass criteria:
- Match/recommendation path returns coherent scores and visible UI output.

---

## 8) Milestone 3 Test Plan (Completed Scope: Issue #29 to #35)

## Issue #29 and #30 and #31: Forum Schema, API, and UI
- Create/list/filter/view posts.
- Create/edit/delete own post.
- Create/edit/delete own reply.
- Mark solution.
- Vote up/down and verify like count changes.

API checks:
- `GET /api/forum/posts`
- `GET /api/forum/posts/{post}`
- `POST /api/forum/posts`
- `PUT/PATCH /api/forum/posts/{post}`
- `DELETE /api/forum/posts/{post}`
- `POST /api/forum/posts/{post}/vote`
- `POST /api/forum/posts/{post}/replies`
- `PUT/PATCH /api/forum/replies/{reply}`
- `DELETE /api/forum/replies/{reply}`
- `POST /api/forum/replies/{reply}/mark-solution`

Table checks:
- `forum_posts`
- `forum_replies`
- `forum_post_skill`
- `forum_post_votes`

Pass criteria:
- Forum actions are fully persistent and reflected in UI counters/states.

## Issue #32: Mentor Forum Management
- Verify mentor overview metrics.
- Verify `Questions For Me` filtering by expertise.
- Verify `My Answers` route and detail navigation.
- Verify public mentor profile route data.

Pass criteria:
- Mentor-specific routes and data aggregates function without fallback pages.

## Issue #33: Notification System (+ SSE)
- Trigger each notification type:
  - new reply to your post
  - solution marked
  - question in expertise
  - mention
- Verify list/read/read-all behavior.
- Verify SSE stream emits new event in live session.

API checks:
- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`
- `GET /api/notifications/stream`

Table checks:
- `notifications`

Pass criteria:
- Notification insert/read-state and real-time delivery are both working.

## Issue #34 and #35: Admin Backend + Frontend
- Verify admin dashboard summary/stats/growth.
- Verify user management list/detail/role/status actions.
- Verify moderation list and resolve flow.
- Verify system logs endpoint.
- Verify report generation from UI and report list refresh.

API checks:
- `GET /api/admin/analytics/summary`
- `GET /api/admin/stats`
- `GET /api/admin/analytics/growth`
- `GET /api/admin/users`
- `GET /api/admin/users/{user}`
- `PATCH /api/admin/users/{user}/role`
- `PATCH /api/admin/users/{user}/status`
- `POST /api/admin/users/{user}/suspend`
- `POST /api/admin/users/{user}/activate`
- `GET /api/admin/moderation`
- `POST /api/admin/moderation/{report}/resolve`
- `GET /api/admin/system-logs`
- `GET /api/admin/reports`
- `POST /api/admin/reports`

Table checks:
- `content_reports`
- `admin_reports`
- `admin_actions`

Pass criteria:
- Admin UI is API-backed and all core actions persist with audit trail.

---

## 9) Router Connectivity Checklist (Whole Project)

Run and mark each route as:
- `PASS`: page renders expected feature
- `FAIL`: route broken/missing
- `FALLBACK-RISK`: route only works because generic `:section`

Critical route families:
- Public auth routes
- Public jobs and forum routes
- Job seeker dashboard routes
- Employer dashboard routes
- Mentor dashboard routes
- Admin dashboard routes

Hard requirement:
- Role-critical navigation links must not depend on generic fallback routes.

---

## 10) SQL Table and Model Connectivity Checklist

For each pair, verify model reads and writes to actual table columns:
- `users` <-> `User`
- `job_seeker_profiles` <-> `JobSeekerProfile`
- `employer_profiles` <-> `EmployerProfile`
- `mentor_profiles` <-> `MentorProfile`
- `skills` + `skill_user` <-> `Skill` + user-skill endpoints
- `jobs` <-> `Job`
- `job_applications` <-> `JobApplication`
- `forum_posts` <-> `ForumPost`
- `forum_replies` <-> `ForumReply`
- `forum_post_votes` <-> `ForumPostVote`
- `notifications` <-> `UserNotification`
- `content_reports` <-> `ContentReport`
- `admin_reports` <-> `AdminReport`
- `admin_actions` <-> `AdminAction`

Pass criteria:
- No ORM/controller mismatch with committed schema.

---

## 11) Final Sign-Off Rules

Project sign-off for Issues #1-#35 requires all conditions:
1. All global gates (A/B/C) pass.
2. All milestone issue groups pass.
3. All four roles pass smoke flow:
   - job seeker
   - employer
   - mentor
   - admin
4. No unresolved `FAIL` in route connectivity checklist.
5. No unresolved table-model mismatch.

---

## 12) Test Evidence Template (Per Run)

For every execution cycle, capture:
1. Commit hash / branch name
2. Date/time
3. Environment reset used or not
4. Failed cases with route/API/table reference
5. Fix commit references
6. Retest result (PASS/FAIL)

This evidence must be logged in `dev_log/README.MD` after each full or partial run.
