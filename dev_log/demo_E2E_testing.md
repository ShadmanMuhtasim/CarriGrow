# CarriGrow Deep Demo E2E Test Plan (Issue #1 to #35)

This plan is a practical, full-depth runbook for browser + API + database validation.
It is optimized for your current workflow so we avoid slow blanket checks and run targeted end-to-end stories with fixed accounts and fixed records.

## 1) Objective

1. Validate all core flows shipped through Issue `#35`.
2. Detect broken route links, missing API integrations, hardcoded UI values, and schema/model drift.
3. Produce reproducible evidence using fixed test accounts and known job/forum records.

## 2) Test Mode (Fast but Deep)

Use this instead of broad Gate B scanning:

1. Run one complete role story at a time.
2. For each user action, verify:
- UI behavior
- Network endpoint
- database state
3. Log only failures and affected route/API/table.

## 3) Environment Baseline

1. `docker compose down -v`
2. `docker compose up -d --build`
3. Open:
- App: `http://localhost:8000`
- Adminer: `http://localhost:8080`
- Mailpit inbox: `http://localhost:8025`

Preflight for existing DB volumes (important):
1. `Get-Content .\database\docker\patches\2026-04-11_schema_sync.sql | docker compose exec -T db mysql -ucarrigrow -pcarrigrow carrigrow`
2. Use this whenever forum publish/list fails with unknown-column errors on old local data volumes.

## 4) Fixed Accounts

Seeded role accounts:
- Employer: `employer@carrigrow.com`
- Job seeker: `jobseeker@carrigrow.com`
- Mentor: `mentor@carrigrow.com`
- Admin: `admin1@carrigrow.com`
- Password: `password`

Create extra deterministic users for this test cycle:
- `e2e.employer@carrigrow.com`
- `e2e.seeker@carrigrow.com`
- `e2e.mentor@carrigrow.com`
- password: `12345678Mm`

## 5) Fixed Test Data Pack

Create these jobs as employer and reuse in all checks:

1. `Backend Developer (E2E-A)`
- status: published
- location: Dhaka
- skills: Laravel, MySQL, REST API

2. `Frontend Engineer (E2E-B)`
- status: published
- location: Remote
- skills: React, TypeScript, CSS

3. `Data Analyst (E2E-C)`
- status: draft first, then publish

Create these forum posts:

1. Question: `How to prepare Laravel API interview? (E2E)`
2. Discussion: `React state management in medium projects (E2E)`
3. Resource: `Job application checklist (E2E)`

Who creates these and from where:
- Login as `mentor@carrigrow.com` (single actor for deterministic test history).
- Create from public forum new-post page: `/forum/new`.
- Alternative (same result): dashboard forum new-post page: `/dashboard/forum-posts/new`.

## 6) Route/Navigation Validation Matrix

Run after each role login.

Employer side panel must open only real pages:
- `/dashboard`
- `/dashboard/post-job`
- `/dashboard/manage-jobs`
- `/dashboard/manage-jobs/:jobId/applicants`
- `/dashboard/profile`

Job seeker side panel:
- `/dashboard`
- `/dashboard/jobs`
- `/dashboard/my-applications`
- `/dashboard/forum-posts`
- `/dashboard/profile`

Mentor side panel:
- `/dashboard`
- `/dashboard/forum-overview`
- `/dashboard/questions-for-me`
- `/dashboard/my-answers`
- `/dashboard/forum-posts`
- `/dashboard/profile`

Admin side panel:
- `/dashboard/admin`
- `/dashboard/users`
- `/dashboard/moderation`
- `/dashboard/system-logs`
- `/dashboard/profile`

Pass rule:
- No broken route
- No unintended fallback page
- No breadcrumb trail shown (per current UX decision)

## 7) Scenario A: Employer Full Story

1. Login as `e2e.employer@carrigrow.com`.
2. Check dashboard overview values.
Pass:
- values come from API-backed data (not static constants)

3. Create `Backend Developer (E2E-A)`.
4. Create `Frontend Engineer (E2E-B)`.
5. Keep `Data Analyst (E2E-C)` as draft, then publish.
6. Open Manage Jobs and verify all statuses update immediately.
7. Open Applicants page for a job and change statuses:
- `applied -> under_review -> shortlisted`
8. Add employer notes and verify persistence.

API checkpoints:
- `GET /api/employer/jobs`
- `POST /api/employer/jobs`
- `PATCH /api/employer/jobs/{job}`
- `GET /api/jobs/{job}/applications`
- `PATCH /api/jobs/{job}/applications/{application}`

DB checkpoints:
- `jobs`
- `job_applications`

## 8) Scenario B: Job Seeker Full Story

1. Login as `jobseeker@carrigrow.com`.
2. Browse jobs and apply to `E2E-A` and `E2E-B`.
3. Verify duplicate apply is blocked.
4. Save one job and confirm Saved Jobs count updates.
5. Open My Applications and verify status reflects employer updates.
6. Open Mentorship page and verify posts come from API/DB, not fallback samples.
7. Open a forum post and submit one post report and one reply report from a non-admin account.

API checkpoints:
- `GET /api/jobs`
- `POST /api/jobs/{job}/apply`
- `GET /api/applications`
- `GET /api/forum/posts`
- `POST /api/forum/posts/{post}/report`
- `POST /api/forum/replies/{reply}/report`

DB checkpoints:
- `job_applications`
- `forum_posts`

## 9) Scenario C: Mentor Full Story

1. Login as `mentor@carrigrow.com`.
2. Open Questions For Me and My Answers.
3. Reply to a question and mark one reply as solution.
4. Confirm mentor dashboard metrics update from live forum data.
5. Confirm no breadcrumb strips are visible.


-------------------------
Open normal Chrome as jobseeker@carrigrow.com and create a forum question (/forum/new or /dashboard/forum-posts/new).
Open an Incognito window (or different browser) as mentor@carrigrow.com.
In mentor session, go to Questions For Me or forum post detail, open that jobseeker question, and submit a reply.
Switch back to jobseeker session, open the same post, verify the mentor reply appears.
If you want to test solution flow, mark that mentor reply as solution from the original poster side (jobseeker who created the question).
-------------------------
API checkpoints:
- `GET /api/forum/posts`
- `POST /api/forum/posts/{post}/replies`
- `POST /api/forum/replies/{reply}/mark-solution`

DB checkpoints:
- `forum_posts`
- `forum_replies`

## 10) Scenario D: Admin Full Story

1. Login as `admin1@carrigrow.com`.
2. Open Admin dashboard and verify summary/growth loads.
3. Open Users and test:
- change role
- change status
4. Open Moderation and resolve one report.
5. Open Reports and generate one report.
6. Open System Logs and confirm results load.

API checkpoints:
- `GET /api/admin/analytics/summary`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{user}/role`
- `PATCH /api/admin/users/{user}/status`
- `GET /api/admin/moderation`
- `POST /api/admin/moderation/{report}/resolve`
- `GET /api/admin/reports`
- `POST /api/admin/reports`

DB checkpoints:
- `admin_actions`
- `content_reports`
- `admin_reports`

## 11) Notifications + Layout Safety

1. Trigger notifications by replying and solution marking.
2. Open bell menu on dashboard top bar at narrow and wide widths.
Pass:
- panel stays inside viewport
- menu scroll works vertically
- long message text wraps

API checkpoints:
- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`
- `GET /api/notifications/stream`

DB checkpoints:
- `notifications`

## 12) Forgot Password Real Mechanism

1. Open Forgot Password.
2. Request reset using `mentor@carrigrow.com`.
3. Open Mailpit (`http://localhost:8025`) and verify message arrives.
4. Open reset link from email.
5. Complete password reset.
6. Login with new password.

API checkpoints:
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

DB checkpoints:
- `password_reset_tokens`

## 13) SQL Verification Snippets (MySQL)

Use inside DB container:
`docker compose exec db mysql -ucarrigrow -pcarrigrow carrigrow`

1. Employer job and application summary:
```sql
SELECT j.id, j.title, j.status, COUNT(a.id) AS applicant_count
FROM jobs j
LEFT JOIN job_applications a ON a.job_id = j.id
GROUP BY j.id, j.title, j.status
ORDER BY j.id DESC;
```

2. Forum integrity:
```sql
SELECT p.id, p.title, p.post_type, p.is_solved, COUNT(r.id) AS replies
FROM forum_posts p
LEFT JOIN forum_replies r ON r.post_id = p.id
GROUP BY p.id, p.title, p.post_type, p.is_solved
ORDER BY p.id DESC;
```

3. Notification health:
```sql
SELECT id, user_id, type, title, read_at, created_at
FROM notifications
ORDER BY id DESC
LIMIT 20;
```

4. Admin report generation:
```sql
SELECT id, type, status, generated_by, generated_at
FROM admin_reports
ORDER BY id DESC;
```

## 14) Exit Criteria

A run is PASS only if:

1. All four role stories complete.
2. No hardcoded placeholder metrics remain on dashboards.
3. Mentorship/forum list uses live API data by default.
4. Breadcrumb strips are not visible.
5. Notification dropdown stays inside viewport and scrolls correctly.
6. Forgot password sends a real reset email via Mailpit.
7. No unresolved 5xx in browser network logs.

## 15) Failure Capture Template

Use this exact format:

- Step:
- Role:
- Route:
- API:
- Status code:
- Error payload:
- Table/model impact:
- Repro steps:
- Fix commit:
- Retest result:
