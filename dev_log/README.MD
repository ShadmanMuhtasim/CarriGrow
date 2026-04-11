

## Issue 16 Execution Note (2026-03-27)

- Assignee working: Musa
- Scope started: Issue `#16` Jobs Schema & CRUD Backend
- Database-first rewrite applied for this issue:
  - "Create jobs migration" now means "update committed SQL schema in `database/docker/init/00-schema.sql` and align Laravel backend code".
- New file created for Issue 16:
  - `server/app/Http/Controllers/JobController.php`
- Existing files updated for Issue 16:
  - `database/docker/init/00-schema.sql`
  - `server/app/Models/Job.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 18 Execution Note (2026-03-27)

- Assignee working: Musa
- Scope started: Issue `#18` Job Listing & Filtering Backend
- Base code added before frontend issue `#17` is complete so contributors can wire UI later.
- New file created for Issue 18:
  - `server/app/Http/Controllers/JobBrowseController.php`
- Existing files updated for Issue 18:
  - `database/docker/init/00-schema.sql`
  - `server/app/Models/Job.php`
  - `server/app/Http/Controllers/JobController.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 17 Execution Note (2026-03-27)

- Assignee working: Ahbab
- Scope started: Issue `#17` Job Posting Form Frontend
- Base code added so later contributors can refine employer job creation UX and backend alignment.
- New files created for Issue 17:
  - `client/src/components/jobs/jobFormSchema.ts`
  - `client/src/components/jobs/JobFormStep1.tsx`
  - `client/src/components/jobs/JobFormStep2.tsx`
  - `client/src/components/jobs/JobFormStep3.tsx`
  - `client/src/components/jobs/JobPreview.tsx`
  - `client/src/pages/employer/PostJob.tsx`
  - `client/src/pages/employer/EditJob.tsx`
  - `client/src/pages/employer/JobPostSuccess.tsx`
  - `client/src/services/jobs.ts`
- Existing files updated for Issue 17:
  - `client/src/App.tsx`
  - `client/src/types/models.ts`
  - `dev_log/README.MD`

## Issue 20 Execution Note (2026-03-27)

- Assignee working: Ahbab
- Scope started: Issue `#20` Job Management for Employers
- Base code added so contributors can extend employer-side job operations, analytics, and applicant management on top of the existing Issue `#17` flow.
- New files created for Issue 20:
  - `client/src/components/jobs/JobStatusBadge.tsx`
  - `client/src/components/jobs/JobAnalyticsChart.tsx`
  - `client/src/pages/employer/ManageJobs.tsx`
  - `client/src/pages/employer/JobAnalytics.tsx`
  - `client/src/pages/employer/JobApplicants.tsx`
- Existing files updated for Issue 20:
  - `client/src/App.tsx`
  - `client/src/services/jobs.ts`
  - `dev_log/README.MD`

## Issue 21 Execution Note (2026-03-28)

- Assignee working: Shadman
- Scope completed: Issue `#21` Applications Schema & Apply Backend
- Database-first rewrite applied for this issue:
  - "Create job_applications migration" means "update committed SQL schema in `database/docker/init/00-schema.sql` and align Laravel backend code".
- Backend implementation added for Issue 21:
  - Added `POST /api/jobs/{job}/apply` with:
    - job seeker role guard
    - published-job check
    - validation for `cover_letter`, `resume_url`, `additional_documents`
    - duplicate-application prevention (pre-check + unique-key conflict handling)
    - `jobs.applications_count` increment on successful apply
  - Added `GET /api/applications` for job seekers (filterable by status, paginated)
  - Added `GET /api/jobs/{job}/applications` for employers (owner-only, filterable by status, paginated)
- Schema/model alignment completed:
  - `job_applications` now uses `user_id` (instead of `job_seeker_id`)
  - Added fields: `resume_url`, `additional_documents`, `employer_notes`, `reviewed_at`, `reviewed_by`
  - Updated status flow to enum: `applied`, `under_review`, `shortlisted`, `rejected`, `hired`
  - Added unique key on (`job_id`, `user_id`) and review foreign key (`reviewed_by -> users.id`)
- New file created for Issue 21:
  - `server/app/Http/Controllers/JobApplicationController.php`
- Existing files updated for Issue 21:
  - `database/docker/init/00-schema.sql`
  - `server/app/Models/JobApplication.php`
  - `server/app/Models/User.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 23 Execution Note (2026-03-27)

- Assignee working: Ahbab
- Scope started: Issue `#23` Applicant Management for Employers
- Base code added so contributors can later connect real application records, employer notes persistence, resume rendering, and messaging APIs.
- New files created for Issue 23:
  - `client/src/components/applications/StatusBadge.tsx`
  - `client/src/components/applications/StatusUpdater.tsx`
  - `client/src/pages/employer/applicantData.ts`
  - `client/src/pages/employer/ApplicantsList.tsx`
  - `client/src/pages/employer/ApplicantDetail.tsx`
- Existing files updated for Issue 23:
  - `client/src/pages/employer/JobApplicants.tsx`
  - `client/src/App.tsx`
  - `dev_log/README.MD`

## Issue 27 Execution Note (2026-03-27)

- Assignee working: Ahbab
- Scope started: Issue `#27` Match Display Frontend
- Base code added so contributors can later connect backend recommendation scoring and richer skill-gap analytics without replacing the frontend structure.
- New files created for Issue 27:
  - `client/src/components/matching/matchUtils.ts`
  - `client/src/components/matching/MatchBadge.tsx`
  - `client/src/components/matching/SkillGapChart.tsx`
  - `client/src/components/matching/MatchDetails.tsx`
  - `client/src/pages/jobseeker/RecommendedJobs.tsx`
- Existing files updated for Issue 27:
  - `client/src/services/jobs.ts`
  - `client/src/App.tsx`
  - `client/src/pages/Dashboard.tsx`
  - `dev_log/README.MD`

## Issue 19 Execution Note (2026-03-28)

- Assignee working: EASTEAK
- Scope started: Issue `#19` Job Browser & Search Frontend
- Base code added so contributors can wire richer search UX, advanced filter logic, and backend refinements without replacing the page structure.
- New files created for Issue 19:
  - `client/src/pages/jobs/JobsList.tsx`
  - `client/src/pages/jobs/JobDetail.tsx`
  - `client/src/components/jobs/JobCard.tsx`
  - `client/src/components/jobs/JobFilters.tsx`
  - `client/src/components/jobs/SearchBar.tsx`
- Existing files updated for Issue 19:
  - `client/src/App.tsx`
  - `client/src/services/jobs.ts`
  - `dev_log/README.MD`

## Issue 25 Execution Note (2026-03-28)

- Assignee working: Shadman
- Scope started: Issue `#25` Job-Skill Relationship Backend
- Database-first rewrite applied for this issue:
  - "Create `job_skill` migration" now means "update committed SQL schema in `database/docker/init/00-schema.sql` and align Laravel backend code".
- Backend foundation added for Issue 25:
  - Added `GET /api/jobs/{job}/skills` endpoint to fetch a job's skill mappings
  - Added `POST /api/jobs/{job}/skills` endpoint for employer-owned jobs
  - Added base match-percentage algorithm foundation in `Job` model using weighted skill importance (`required`, `preferred`, `bonus`)
- New file created for Issue 25:
  - `server/app/Http/Controllers/JobSkillController.php`
- Existing files updated for Issue 25:
  - `database/docker/init/00-schema.sql`
  - `server/app/Models/Job.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 28 Execution Note (2026-03-28)

- Assignee working: Shadman
- Scope started: Issue `#28` Job Recommendations Backend
- Backend foundation added for Issue 28:
  - Added `GET /api/recommendations/jobs` endpoint (auth-protected, job-seeker only)
  - Added recommendation ranking base logic with signals:
    - skill match signal
    - job freshness boost (recently posted jobs rank higher)
    - personalization boost from user application history (preferred employment type/location)
  - Added exclusion of already-applied jobs from recommendation results
  - Added pagination support (`per_page`: 10/25/50 + `page`)
  - Added simple A/B algorithm framework:
    - `ab_variant=auto|a|b` input support
    - deterministic fallback assignment by user id bucket
- New file created for Issue 28:
  - `server/app/Http/Controllers/JobRecommendationController.php`
- Existing files updated for Issue 28:
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 26 Execution Note (2026-03-28)

- Assignee working: Musa
- Scope started: Issue `#26` Skill Match Algorithm
- Base code only, kept intentionally small so other coordinators can merge and refine later.
- New files created for Issue 26:
  - `server/app/Services/SkillMatchService.php`
  - `server/app/Http/Controllers/SkillMatchController.php`
  - `server/tests/Unit/Services/SkillMatchServiceTest.php`
- Existing files updated for Issue 26:
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 22 Execution Note (2026-03-28)

- Assignee working: EASTEAK
- Scope started: Issue `#22` Job Application Form Frontend
- Base code added so contributors can later connect full file storage, richer editor capabilities, and deeper application tracking UX without replacing the frontend structure.
- New files created for Issue 22:
  - `client/src/pages/jobs/ApplyJob.tsx`
  - `client/src/components/applications/ApplicationForm.tsx`
  - `client/src/components/applications/ApplicationSuccess.tsx`
- Existing files updated for Issue 22:
  - `client/src/App.tsx`
  - `client/src/pages/jobs/JobDetail.tsx`
  - `client/src/services/jobs.ts`
  - `dev_log/README.MD`

## Issue 24 Execution Note (2026-03-28)

- Assignee working: EASTEAK
- Scope started: Issue `#24` Application Tracking for Job Seekers
- Base code added so contributors can later connect withdraw APIs, persistent notification delivery, and richer tracking analytics without replacing the frontend structure.
- New files created for Issue 24:
  - `client/src/pages/jobseeker/MyApplications.tsx`
  - `client/src/pages/jobseeker/SavedJobs.tsx`
  - `client/src/components/applications/ApplicationCard.tsx`
  - `client/src/components/applications/StatusTimeline.tsx`
- Existing files updated for Issue 24:
  - `client/src/App.tsx`
  - `dev_log/README.MD`

## Issue 31 Execution Note (2026-04-07)

- Assignee working: Ahbab
- Scope started: Issue `#31` Forum UI - List & Detail
- Implementation approach:
  - Added forum listing, post detail, and new post pages.
  - Added forum UI components (`PostCard`, `ReplyThread`, `RichTextEditor`).
  - Added frontend forum service with API-first calls and local fallback behavior so UI remains usable while backend forum endpoints are incomplete.
  - Wired forum routes for both public navigation and mentor dashboard path.
- Milestone 2 carry-over fixes done during this pass:
  - Updated navbar quick navigation to include real app routes (`/jobs`, `/forum`) and corrected CTA text (`Post a Job`).
  - Fixed job row separator text rendering in employer job management view.
- New files created for Issue 31:
  - `client/src/services/forum.ts`
  - `client/src/components/forum/PostCard.tsx`
  - `client/src/components/forum/ReplyThread.tsx`
  - `client/src/components/forum/RichTextEditor.tsx`
  - `client/src/pages/forum/ForumList.tsx`
  - `client/src/pages/forum/PostDetail.tsx`
  - `client/src/pages/forum/NewPost.tsx`
- Existing files updated for Issue 31:
  - `client/src/App.tsx`
  - `client/src/types/models.ts`
  - `client/src/index.css`
  - `client/src/components/Navbar.tsx`
  - `client/src/pages/employer/ManageJobs.tsx`
  - `dev_log/README.MD`

## Issue 29 Execution Note (2026-04-09)

- Assignee working: Musa
- Scope completed: Issue `#29` Forum Schema Backend
- Database-first rewrite applied for this issue:
  - "Create forum migrations" means "update committed SQL schema in `database/docker/init/00-schema.sql` and align Laravel backend models".
- Forum schema/model alignment completed:
  - `forum_posts` now includes `type`, `views_count`, `replies_count`, `is_pinned`, `is_solved`, `status`, and `deleted_at`
  - `forum_replies` now includes `is_solution`
  - `forum_post_skill` remains the post-skill relationship source of truth
  - `ForumPost` now uses soft deletes and includes casts/constants for forum metadata
  - `ForumReply` now casts `is_solution` and supports the answer-marking flag
- Existing files updated for Issue 29:
  - `database/docker/init/00-schema.sql`
  - `server/app/Models/ForumPost.php`
  - `server/app/Models/ForumReply.php`
  - `dev_log/README.MD`

## Issue 30 Execution Note (2026-04-09)

- Assignee working: Musa
- Scope completed: Issue `#30` Forum API Endpoints
- Backend implementation added for Issue 30:
  - Added `GET /api/forum/posts` with pagination, search, skill/type/date filters, and `recent` / `popular` / `unanswered` sorting
  - Added `POST /api/forum/posts`
  - Added `GET /api/forum/posts/{id}` with replies, solution reply, skills, author names, and view count increment
  - Added `PUT/PATCH /api/forum/posts/{id}` and `DELETE /api/forum/posts/{id}` with owner/moderator guard and soft delete behavior
  - Added reply endpoints:
    - `POST /api/forum/posts/{id}/replies`
    - `PUT/PATCH /api/forum/replies/{id}`
    - `DELETE /api/forum/replies/{id}`
    - `POST /api/forum/replies/{id}/mark-solution`
- Forum response alignment completed:
  - `ForumPost` now exposes `author_name` and `skill_ids`
  - `ForumReply` now exposes `author_name`
  - Post metadata (`replies_count`, `is_solved`) is kept in sync after reply create/delete/solution mark
- New files created for Issue 30:
  - `server/app/Http/Controllers/ForumPostController.php`
  - `server/app/Http/Controllers/ForumReplyController.php`
- Existing files updated for Issue 30:
  - `server/app/Models/ForumPost.php`
  - `server/app/Models/ForumReply.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 33 Execution Note (2026-04-09)

- Assignee working: Shadman
- Scope completed: Issue `#33` Notification System
- Database-first rewrite applied for this issue:
  - "Create notifications migration" means "update committed SQL schema in `database/docker/init/00-schema.sql` and align Laravel backend code".
- Backend implementation added for Issue 33:
  - Added `notifications` table with recipient, actor, type, read state, post/reply references, and JSON payload support
  - Added forum notification types for:
    - new reply to your post
    - your answer marked as solution
    - new question in your expertise
    - `@mentions` in posts and replies
  - Added notification endpoints:
    - `GET /api/notifications`
    - `PUT /api/notifications/{id}/read`
    - `PUT /api/notifications/read-all`
  - Hooked forum post/reply/solution flows into a dedicated notification service
  - Optional real-time broadcasting was left out for now because it is not required for core acceptance and the repo has no Pusher setup yet
- New files created for Issue 33:
  - `server/app/Models/UserNotification.php`
  - `server/app/Http/Controllers/NotificationController.php`
  - `server/app/Services/ForumNotificationService.php`
- Existing files updated for Issue 33:
  - `database/docker/init/00-schema.sql`
  - `server/app/Http/Controllers/ForumPostController.php`
  - `server/app/Http/Controllers/ForumReplyController.php`
  - `server/app/Models/User.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`

## Issue 33 Runtime Activation Note (2026-04-09)

- Live local stack fix completed for Issue `#33` without resetting the whole database.
- Runtime blockers found and resolved:
  - existing MySQL volume did not have the `notifications` table
  - existing `forum_posts` / `forum_replies` tables were older than the current Issue `#29/#30` schema used by the backend
  - forum skill pivot relation needed explicit key mapping for `forum_post_skill(post_id, skill_id)`
- Additional existing files updated during runtime fix:
  - `server/app/Models/ForumPost.php`
  - `server/app/Models/Skill.php`
  - `dev_log/README.MD`
- Live verification completed on local stack:
  - `new question in your expertise`
  - `@mention` in post
  - `new reply to your post`
  - `your answer marked as solution`
  - `@mention` in reply
  - `GET /api/notifications`
  - `PUT /api/notifications/{id}/read`
  - `PUT /api/notifications/read-all`

## Issue 33 Real-Time Activation Note (2026-04-10)

- Real-time notification delivery is now active without adding external Pusher infrastructure.
- Implementation approach:
  - added auth-protected server-sent events stream endpoint for notifications
  - added frontend notification state provider with live stream subscription
  - added live notification bell/dropdown to public navbar and dashboard topbar
- New files created for Issue 33 real-time activation:
  - `client/src/services/notifications.ts`
  - `client/src/context/NotificationContext.tsx`
  - `client/src/components/NotificationBell.tsx`
- Existing files updated for Issue 33 real-time activation:
  - `client/src/main.tsx`
  - `client/src/components/Navbar.tsx`
  - `client/src/layouts/RoleDashboardLayout.tsx`
  - `client/src/index.css`
  - `client/src/types/models.ts`
  - `server/app/Http/Controllers/NotificationController.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`
- Live verification completed on local stack:
  - rebuilt app container successfully with client + server changes
  - opened `GET /api/notifications/stream?last_id=...` as authenticated mentor
  - created a new forum question from job seeker account
  - confirmed immediate `notification.created` SSE event without manual refresh

## Issue 35 Execution Note (2026-04-10)

- Assignee working: Ahbab
- Scope completed: Issue `#35` Admin Dashboard Frontend
- Implementation summary:
  - Added dedicated admin frontend pages for analytics dashboard, user management, moderation queue, and system logs.
  - Added role/status user controls (role change dropdown and suspend/activate actions).
  - Added user detail view flow under user management (`/dashboard/users/:userId`).
  - Added platform growth chart and reports management section in admin dashboard.
  - Added API-first admin service layer with local fallback data so pages stay functional while backend admin endpoints evolve.
- New files created for Issue 35:
  - `client/src/services/admin.ts`
  - `client/src/pages/admin/Dashboard.tsx`
  - `client/src/pages/admin/UserManagement.tsx`
  - `client/src/pages/admin/ContentModeration.tsx`
  - `client/src/pages/admin/SystemLogs.tsx`
- Existing files updated for Issue 35:
  - `client/src/App.tsx`
  - `client/src/layouts/AdminLayout.tsx`
  - `client/src/utils/authRedirect.ts`
  - `dev_log/README.MD`

## Issue 35 Refinement Note (2026-04-10)

- Follow-up refinement completed for Issue `#35` Admin Dashboard Frontend.
- Reports management now includes:
  - report type selection (`weekly`, `monthly`, `custom`)
  - generate report action with API-first/local fallback behavior
  - selected report detail panel
  - export action for ready reports
- Existing files updated during Issue 35 refinement:
  - `client/src/services/admin.ts`
  - `client/src/pages/admin/Dashboard.tsx`
  - `dev_log/README.MD`

## Issue 34 Execution Note (2026-04-10)

- Assignee working: Musa
- Scope completed: Issue `#34` Admin Dashboard Backend
- Implementation summary:
  - Added JWT-protected admin middleware and real `/api/admin/*` backend routes.
  - Added analytics summary/stats and platform growth endpoints for the admin dashboard.
  - Added admin user management endpoints for list, detail, role change, suspend/activate, and status update.
  - Added moderation queue backend with moderation item resolution flow.
  - Added system logs endpoint backed by admin audit actions and failed job data.
  - Added admin report generation/list endpoints with audit trail entries.
  - Added persistent database tables for moderation items and generated admin reports.
- New files created for Issue 34:
  - `server/app/Models/AdminReport.php`
  - `server/app/Models/ContentReport.php`
  - `server/app/Http/Middleware/EnsureAdmin.php`
  - `server/app/Services/AdminAuditService.php`
  - `server/app/Services/AdminMetricsService.php`
  - `server/app/Http/Controllers/AdminDashboardController.php`
  - `server/app/Http/Controllers/AdminUserController.php`
  - `server/app/Http/Controllers/AdminModerationController.php`
  - `server/app/Http/Controllers/AdminReportController.php`
- Existing files updated for Issue 34:
  - `database/docker/init/00-schema.sql`
  - `server/app/Http/Kernel.php`
  - `server/app/Models/AdminAction.php`
  - `server/routes/api.php`
  - `dev_log/README.MD`
- Live local runtime activation completed:
  - created `content_reports` and `admin_reports` tables in the existing MySQL Docker volume
  - rebuilt the `app` container after backend changes
  - verified `GET /api/admin/analytics/summary`
  - verified `GET /api/admin/stats`
  - verified `GET /api/admin/analytics/growth`
  - verified `GET /api/admin/users`
  - verified `GET /api/admin/users/{id}`
  - verified `PATCH /api/admin/users/{id}/role`
  - verified `GET /api/admin/system-logs`
  - verified `GET /api/admin/reports`
  - verified `POST /api/admin/reports`
  - verified `GET /api/admin/moderation`
  - verified `POST /api/admin/moderation/{id}/resolve`

## Issue 32 Execution Note (2026-04-10)

- Assignee working: Ishtiak
- Scope completed: Issue `#32` Mentor Dashboard - Forum Management
- Implementation summary:
  - Added mentor forum management overview with:
    - recent questions in mentor expertise
    - unanswered question count
    - mentor recent answers
    - engagement metrics (answers, solutions, votes, views)
  - Added dedicated mentor pages:
    - `My Answers`
    - `Questions For Me` (skill-filtered + unanswered toggle)
  - Added mentor-specific expertise notifications UI for `new question in your expertise` alerts, including read-state handling.
  - Added public mentor profile view route and page for forum credibility/discovery.
  - Updated mentor dashboard navigation to include the new forum management sections.
- New files created for Issue 32:
  - `client/src/components/mentor/ExpertiseBadge.tsx`
  - `client/src/pages/mentor/ForumOverview.tsx`
  - `client/src/pages/mentor/MyAnswers.tsx`
  - `client/src/pages/mentor/QuestionsForMe.tsx`
  - `client/src/pages/mentor/PublicMentorProfile.tsx`
- Existing files updated for Issue 32:
  - `client/src/App.tsx`
  - `client/src/layouts/MentorLayout.tsx`
  - `dev_log/README.MD`
- Local verification note:
  - attempted frontend build command `npm --prefix client run build`
  - local environment is missing client dev dependencies (`typescript`/`tsc` not installed), so compile verification could not be completed in this workspace session

## UI Text Cleanup Update (2026-04-10)
- Removed leaked issue-tracker and milestone implementation copy from user-facing UI pages across dashboard, employer, job seeker, forum, admin, jobs, and shared application components.
- Replaced internal/planning subtitles and helper text with production-ready copy while keeping behavior and layout unchanged.
- Cleaned seeded applicant cover-letter mock content to remove internal placeholder wording at the source (client/src/pages/employer/applicantData.ts).
- Verified with repo-wide search that Issue #... and milestone reminder strings no longer appear in user-facing source paths (excluding docs/readmes).
- Validation run: client lint reports pre-existing unrelated lint errors; client build fails in this environment with Vite/esbuild spawn EPERM.

## Whole Project Audit + Test Planning Note (2026-04-11)

- Scope completed:
  - audited whole-project page/router/API/table/model connections for completed issues through `#35`
  - replaced milestone-2-only test doc with a full project plan from Milestone 1 onward
- Existing file updated:
  - `dev_log/carrigrow_wholeproject_end_to_end_test_plan.md`
- Key audit findings captured for follow-up:
  - forum voting call exists in frontend (`POST /api/forum/posts/{id}/vote`) but backend route/controller endpoint is not implemented
  - employer sidebar link `/dashboard/applicants` currently lands in generic dashboard fallback section (no dedicated route page)
  - job seeker sidebar link `/dashboard/mentorship` currently lands in generic dashboard fallback section (no dedicated route page)
  - admin dashboard reports UI button/row actions are not wired to `POST /api/admin/reports` and export/view handlers
  - employer applicant detail/list actions are still scaffold-local (`buildApplicantsForJob`) and do not persist status/notes to backend application records
- Local verification limitations in this workspace session:
  - `npm` PowerShell shim blocked by execution policy (`npm.ps1`)
  - retried with `npm.cmd`, but client dependencies are not installed here (`tsc`/`eslint` not found), so build/lint verification could not run

## Whole Project Connectivity Hardening Note (2026-04-11)

- Scope completed:
  - fixed the key route/API/model/table connectivity gaps discovered in the full-project audit
  - aligned employer applicant management UI with persistent backend application records
  - aligned dashboard sidebar links to real routes (no generic fallback dependency for mentorship/applicants)
- New file created:
  - `server/app/Models/ForumPostVote.php`
- Existing files updated:
  - `database/docker/init/00-schema.sql`
  - `server/routes/api.php`
  - `server/app/Models/ForumPost.php`
  - `server/app/Http/Controllers/ForumPostController.php`
  - `server/app/Http/Controllers/JobApplicationController.php`
  - `client/src/layouts/EmployerLayout.tsx`
  - `client/src/layouts/JobSeekerLayout.tsx`
  - `client/src/services/jobs.ts`
  - `client/src/services/admin.ts`
  - `client/src/components/applications/StatusBadge.tsx`
  - `client/src/components/applications/StatusUpdater.tsx`
  - `client/src/pages/employer/ApplicantsList.tsx`
  - `client/src/pages/employer/ApplicantDetail.tsx`
  - `client/src/pages/admin/Dashboard.tsx`
  - `dev_log/carrigrow_wholeproject_end_to_end_test_plan.md`
  - `dev_log/README.MD`
- Existing file removed:
  - `client/src/pages/employer/applicantData.ts`
- Connectivity fixes included:
  - added backend forum vote endpoint and persistence (`POST /api/forum/posts/{post}/vote`)
  - added persistent employer application update endpoint (`PATCH /api/jobs/{job}/applications/{application}`)
  - wired admin report generation UI to backend (`POST /api/admin/reports`) and added report export/view behavior
  - replaced scaffold-local employer applicant list/detail flow with API-backed load + status/notes updates
  - synchronized employer applicant UI status values with backend enum (`applied`, `under_review`, `shortlisted`, `rejected`, `hired`)
- Local verification limitation in this workspace session:
  - `php -l` could not be executed due local `php.exe` access denied in this environment

## Dev UX + Full-Proof Test Plan Update (2026-04-11)

- Scope completed:
  - enabled default password prefill for login/register dev flow
  - rewrote whole-project test plan into issue-by-issue execution from Milestone 1 Issue `#1` through completed Issue `#35`
- Existing files updated:
  - `client/src/pages/Login.tsx`
  - `client/src/pages/Register.tsx`
  - `dev_log/carrigrow_wholeproject_end_to_end_test_plan.md`
  - `dev_log/README.MD`
- Auth form dev-flow change:
  - login password default now prefilled as `password`
  - registration password and confirm password defaults now prefilled as `password`
  - registration validation now explicitly allows `password` for development convenience, while still accepting strong passwords with uppercase/lowercase/number combinations
- Test plan improvement highlights:
  - adds global route/API/schema integrity gates before milestone checks
  - adds milestone issue grouping from `#1` to `#35` with explicit pass criteria
  - adds router connectivity checklist and SQL table-model connectivity checklist
  - adds final sign-off rules and run evidence template for repeatable QA cycles

## Docker Build Unblock + Compile Fix (2026-04-11)

- Scope completed:
  - fixed Docker client build failure caused by TypeScript `noUnusedParameters` error in employer applicants page
  - verified full `docker compose up -d --build` succeeds after patch
- Existing files updated:
  - `client/src/pages/employer/ApplicantsList.tsx`
  - `dev_log/README.MD`
- Fix details:
  - removed unused `application` parameter from `getSkillTags` helper
  - updated helper call site to match new signature
- Verification notes:
  - host-side `npm run build` still cannot run directly in PowerShell due local execution policy for `npm.ps1`
  - host-side `npm.cmd run build` reports missing local `node_modules` (`tsc` not found), but Docker build path installs deps and now compiles successfully

## Runtime Connectivity Audit + DB Drift Fix (2026-04-11)

- Scope completed:
  - resumed whole-project runtime connectivity audit after Docker rebuild
  - validated app, DB, route inventory, and key HTTP paths under Docker
  - fixed live database schema drift that caused forum endpoint runtime failure
- New file created:
  - `database/docker/patches/2026-04-11_schema_sync.sql`
- Existing files updated:
  - `client/src/pages/employer/ApplicantsList.tsx`
  - `dev_log/README.MD`
- Runtime issue found and fixed:
  - `GET /api/forum/posts` was failing with `500`
  - Laravel log root cause: missing `forum_posts.deleted_at` on existing Docker DB volume
  - existing DB also lacked newer tables (`forum_post_votes`, `notifications`, `content_reports`, `admin_reports`) because SQL init files do not rerun on already-initialized volumes
  - applied non-destructive SQL sync patch to running MySQL container
- Verification after fix:
  - `docker compose up -d --build` succeeds
  - `/` -> `200`
  - `/dashboard/manage-jobs` -> `200`
  - `/api/jobs` -> `200`
  - `/api/forum/posts` -> `200` (was `500` before patch)
  - `/api/admin/reports` -> `401` without auth (expected protected behavior)
  - MySQL table inventory now includes `forum_post_votes`, `notifications`, `content_reports`, `admin_reports`

## Admin Scenario D Fix Pass (2026-04-11)

- Scope completed:
  - fixed admin user-search UX interruption in User Management
  - improved moderation dashboard counters and empty-state guidance
  - implemented missing report-source flow so moderation queue can receive real items
  - expanded admin profile page from placeholder copy to useful account + shortcuts view
  - synchronized deep demo E2E plan with new report flow dependency
- Existing files updated:
  - `client/src/pages/admin/UserManagement.tsx`
  - `client/src/pages/admin/ContentModeration.tsx`
  - `client/src/pages/Profile.tsx`
  - `client/src/components/forum/ReplyThread.tsx`
  - `client/src/pages/forum/PostDetail.tsx`
  - `client/src/services/forum.ts`
  - `server/app/Http/Controllers/ForumPostController.php`
  - `server/app/Http/Controllers/ForumReplyController.php`
  - `server/routes/api.php`
  - `dev_log/demo_E2E_testing.md`
- Backend feature additions:
  - added `POST /api/forum/posts/{post}/report`
  - added `POST /api/forum/replies/{reply}/report`
  - report records are saved to `content_reports` as `pending` items for admin moderation review
- Behavior improvements:
  - user search in admin panel no longer drops typing after one character
  - moderation cards (`Pending/Approved/Removed`) now represent global queue totals, not only current filter subset
  - moderation empty state now explains that reports appear after users report forum content
  - forum post detail and reply thread now expose `Report` actions for authenticated users
  - admin profile page now shows real current admin info and direct links to admin operations
- Verification performed:
  - `docker compose up -d --build` succeeds
  - report submission test: `POST /api/forum/posts/{post}/report` returns `201`
  - admin moderation fetch (`status=all`) returns newly reported item count > 0

## Mentor Route Matrix Navigation Fix (2026-04-11)

- Scope completed:
  - fixed mentor forum authoring/navigation so dashboard flow stays inside dashboard forum routes
  - added explicit mentor return path from forum create/detail views
- Existing files updated:
  - `client/src/layouts/MentorLayout.tsx`
  - `client/src/pages/forum/ForumList.tsx`
  - `client/src/pages/forum/NewPost.tsx`
  - `client/src/pages/forum/PostDetail.tsx`
  - `dev_log/README.MD`
- Behavior updates:
  - mentor sidebar now includes `New Post` at `/dashboard/forum-posts/new`
  - forum list/detail/create now use route-aware base paths:
    - dashboard context -> `/dashboard/forum-posts/...`
    - public context -> `/forum/...`
  - after publishing a forum post in dashboard context, navigation returns to dashboard forum detail route
  - mentor-only quick action `Back to Mentor Dashboard` added in create and detail actions
- Verification:
  - `docker compose up -d --build` succeeds after patch

## Mentor Publish Failure Fix + Forum Schema Sync Expansion (2026-04-11)

- Scope completed:
  - fixed mentor forum post publish failure (`Could not publish this post`)
  - expanded live schema sync for legacy `forum_posts`/`forum_replies` structures
- Existing files updated:
  - `database/docker/patches/2026-04-11_schema_sync.sql`
  - `dev_log/demo_E2E_testing.md`
  - `dev_log/README.MD`
- Root cause:
  - live `forum_posts` table came from an older local volume and missed current columns (`type`, counters, pin/solve flags)
  - API insert failed with `Unknown column 'type' in 'field list'`
- Fix:
  - updated sync patch to add missing forum columns/indexes and normalize forum status values
  - added `forum_replies.is_solution` column/index when absent
  - applied patch to running DB
- Verification:
  - mentor login + `POST /api/forum/posts` now returns `201`
  - forum post create response includes expected fields and synced skill links

## E2E Scenario 7-8 UX/Data Fixes (2026-04-11)

- Scope completed:
  - clarified and preserved logic-based job match percentage display
  - fixed match badge visual alignment so percentage is centered
  - replaced dead-end `Save / Apply` action in recommended jobs with real navigation actions
  - verified forum list API returns live DB posts for mentorship flow
- Existing files updated:
  - `client/src/components/matching/MatchBadge.tsx`
  - `client/src/index.css`
  - `client/src/pages/jobseeker/RecommendedJobs.tsx`
  - `dev_log/README.MD`
- Behavior updates:
  - match badge now renders percentage and label in centered stacked layout
  - recommended job actions now provide:
    - `View details` -> `/jobs/{jobId}`
    - `Apply now` -> `/jobs/{jobId}/apply`
  - `Save / Apply` toast-only action removed
- Data logic note:
  - job match percentage remains calculated by `calculateJobMatch`:
    - matched required skills / total required skills
    - rounded to integer percent
- Verification:
  - `docker compose up -d --build` succeeds after patch
  - `GET /api/forum/posts?per_page=10&page=1` returns `200` with live forum records

## E2E Scenario 7-8 Forum Route Load Fix (2026-04-11)

- Scope completed:
  - fixed forum list load failure from mentor dashboard `All Forum Posts` and `/mentors/me` -> `Browse forum`
  - normalized forum service query params so backend validation passes
- Existing files updated:
  - `client/src/services/forum.ts`
  - `dev_log/README.MD`
- Root cause:
  - frontend was sending `type=all` to `GET /api/forum/posts`
  - backend validator accepts only `question|discussion|resource`, so request failed and UI showed `Could not load forum posts right now.`
- Fix:
  - service now strips `type: "all"` before request and sends `type` only when it is a valid backend enum
- Upper-flow impact covered:
  - `/dashboard/forum-posts`
  - `/forum`
  - mentor public profile button flow (`/mentors/me` -> `Browse forum`)
- Verification:
  - `docker compose up -d --build` succeeds after patch
  - `GET /api/forum/posts` returns `200`

## E2E Scenario 7-8 Navigation + Match UX Fixes (2026-04-11)

- Scope completed:
  - added direct `Saved Jobs` access in job seeker dashboard sidebar
  - fixed job detail back navigation when opened from dashboard recommended jobs
  - refreshed match-details modal UI to align with current card styling and readability
  - revalidated forum endpoint and removed stale dead-end apply text from source
- Existing files updated:
  - `client/src/layouts/JobSeekerLayout.tsx`
  - `client/src/pages/jobseeker/RecommendedJobs.tsx`
  - `client/src/pages/jobs/JobDetail.tsx`
  - `client/src/components/matching/MatchDetails.tsx`
  - `client/src/index.css`
  - `dev_log/README.MD`
- Behavior updates:
  - sidebar now includes `Saved Jobs` -> `/dashboard/saved-jobs`
  - opening job details from `/dashboard/jobs` now passes state and `Back` returns to `/dashboard/jobs` instead of `/jobs`
  - match details modal now uses structured sections with cleaner visual hierarchy
- Verification:
  - `docker compose up -d --build` succeeds after patch
  - `GET /api/forum/posts` returns `200`
  - source no longer contains `Save / Apply` or `Open the job details page to apply` text

## E2E Scenario 8 Follow-up: Back Path + Solid Match Modal (2026-04-11)

- Scope completed:
  - fixed residual job detail back navigation path drift for job seeker flow
  - replaced transparent match-details overlay behavior with a solid modal panel and explicit close icon
- Existing files updated:
  - `client/src/components/jobs/JobCard.tsx`
  - `client/src/pages/jobs/JobDetail.tsx`
  - `client/src/components/ui/Modal.tsx`
  - `client/src/index.css`
  - `dev_log/README.MD`
- Behavior updates:
  - all job-card `View details` links now pass source route state (`pathname + search`) to detail pages
  - `JobDetail` back target now:
    - uses passed route state when available
    - otherwise defaults to `/dashboard/jobs` for `job_seeker` users
    - otherwise defaults to `/jobs`
  - modal now renders inside a dedicated white panel (`cg-modal-panel`) with stronger backdrop and readable body content
- Verification:
  - `docker compose up -d --build` succeeds after patch
  - containers healthy (`app`, `db`, `adminer`, `mailpit`)

