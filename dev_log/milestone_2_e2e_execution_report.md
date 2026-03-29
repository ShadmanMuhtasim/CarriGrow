# CarriGrow Milestone 2 E2E Execution Report

## 1. Execution Summary
- **Execution date:** 2026-03-29 (Asia/Dhaka)
- **Environment status:** Docker stack started successfully after clean reset (`down -v` then `up -d --build`).
- **App startup status:** `http://localhost:8000` = 200, `http://localhost:8080` (Adminer) = 200.
- **Method used:** Live API execution + live DB verification + route reachability checks + code-backed verification for UI-only interactions that cannot be fully clicked in this CLI environment.
- **High-level verdict:** **Partially ready, not Milestone 2 demo-ready**. Core employer CRUD/apply/permissions APIs mostly work, but public job browsing has a critical backend 500 error and several milestone flows remain scaffold-only.

---

## 2. Step-by-Step Results

### Step 1 - Start stack and app
- **Status:** PASS
- **What was tested:** `docker compose --env-file .env up -d --build`, HTTP checks on app/Adminer.
- **What actually happened:** Containers `app`, `db`, `adminer` became healthy/running.
- **Expected vs actual:** Matched.
- **Relevant:** `docker-compose.yml`, `Dockerfile`
- **DB verification:** Not required.
- **Notes:** None.

### Step 2 - Optional clean DB reset
- **Status:** PASS
- **What was tested:** `docker compose --env-file .env down -v` then up/build.
- **What actually happened:** Volume/network/containers removed and recreated; SQL init re-applied.
- **Expected vs actual:** Matched.
- **Relevant:** `database/docker/init/00-schema.sql`, `database/docker/init/10-reference-data.sql`
- **DB verification:** Post-reset seeded users confirmed.
- **Notes:** Used as baseline for all downstream checks.

### Step 3 - Seeded account login (Employer A, Job Seeker A)
- **Status:** PASS
- **What was tested:** `POST /api/auth/login`, `GET /api/auth/me`, logout/login swap.
- **What actually happened:** Both seeded users authenticated and returned expected roles.
- **Expected vs actual:** Matched.
- **Relevant:** `server/routes/api.php`, `server/app/Http/Controllers/AuthController.php`
- **DB verification:** Seeded rows present in `users`, profiles, `skills`, `skill_user`.
- **Notes:** None.

### Step 4 - Protected route behavior for anonymous user
- **Status:** PARTIAL
- **What was tested:** Anonymous request to `/dashboard`, plus route/middleware code.
- **What actually happened:** HTTP returns SPA shell (200), then frontend guard should redirect.
- **Expected vs actual:** Expected redirect to `/login`; browser-level redirect could not be visually clicked here, but guard logic exists.
- **Relevant:** `client/src/components/ProtectedRoute.tsx`, `client/src/App.tsx`
- **DB verification:** N/A.
- **Notes:** SPA behavior verified by code + shell response, not visual navigation trace.

### Step 5 - Employer navigation shell
- **Status:** PARTIAL
- **What was tested:** Employer sidebar link definitions in code.
- **What actually happened:** Links exist for Overview, Post Job, Manage Jobs, Applicants, Company Profile.
- **Expected vs actual:** Matched labels.
- **Relevant:** `client/src/layouts/EmployerLayout.tsx`
- **DB verification:** N/A.
- **Notes:** UI rendered links not manually clicked in browser automation.

### Step 6 - Job seeker navigation shell
- **Status:** PARTIAL
- **What was tested:** Job seeker sidebar link definitions and route map.
- **What actually happened:** Labels exist, but Applications link points to `/dashboard/applications` while functional page is `/dashboard/my-applications`.
- **Expected vs actual:** Label expectation matched; route consistency did not.
- **Relevant:** `client/src/layouts/JobSeekerLayout.tsx:16`, `client/src/App.tsx:60`, `client/src/pages/DashboardSection.tsx:22`
- **DB verification:** N/A.
- **Notes:** Reported as issue (CG-M2-003).

### Step 7 - Create Employer B and Job Seeker B
- **Status:** PASS
- **What was tested:** `POST /api/auth/register` for both roles, followed by `GET /api/auth/me`.
- **What actually happened:** Both registrations succeeded and sessions were active.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/AuthController.php`
- **DB verification:** New rows in `users`; corresponding profile rows in `employer_profiles` and `job_seeker_profiles`.
- **Notes:** Created users with timestamped emails.

### Step 8 - Open employer job form and 5-step flow
- **Status:** PARTIAL
- **What was tested:** Route and component structure.
- **What actually happened:** `/dashboard/post-job` route exists; 5-step array present in component.
- **Expected vs actual:** Structure matches expected flow.
- **Relevant:** `client/src/pages/employer/PostJob.tsx`
- **DB verification:** N/A.
- **Notes:** Visual step transitions not manually clicked.

### Step 9 - Step validation checks
- **Status:** PARTIAL
- **What was tested:** Zod schema + per-step trigger logic.
- **What actually happened:** Validation rules exist for title/description/salary/deadline and step gating.
- **Expected vs actual:** Expected validation coverage mostly present.
- **Relevant:** `client/src/components/jobs/jobFormSchema.ts`, `client/src/pages/employer/PostJob.tsx`
- **DB verification:** N/A.
- **Notes:** UI error rendering not visually exercised.

### Step 10 - Fill Step 1
- **Status:** PARTIAL
- **What was tested:** Step fields and progression logic by code.
- **What actually happened:** Required fields wired and included in step map.
- **Expected vs actual:** Looks aligned.
- **Relevant:** `client/src/components/jobs/JobFormStep1.tsx`, `client/src/components/jobs/jobFormSchema.ts`
- **DB verification:** N/A.
- **Notes:** No browser click replay.

### Step 11 - Fill Step 2
- **Status:** PARTIAL
- **What was tested:** Description/requirements/responsibilities wiring.
- **What actually happened:** Step component and min-length schema exist.
- **Expected vs actual:** Aligned.
- **Relevant:** `client/src/components/jobs/JobFormStep2.tsx`, `client/src/components/jobs/jobFormSchema.ts`
- **DB verification:** N/A.
- **Notes:** UI-only action not fully replayed.

### Step 12 - Salary invalid then correct
- **Status:** PASS
- **What was tested:** Invalid salary API payload (`salary_max < salary_min`) and validation rules.
- **What actually happened:** API returned 422; valid payloads proceeded.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobController.php`, `client/src/components/jobs/jobFormSchema.ts`
- **DB verification:** Invalid payload created no job row.
- **Notes:** Good backend protection.

### Step 13 - Step 4 skills/qualification inputs
- **Status:** PARTIAL
- **What was tested:** Required skill selection and form fields by code.
- **What actually happened:** Step enforces at least one selected skill before continue/publish.
- **Expected vs actual:** Aligned.
- **Relevant:** `client/src/pages/employer/PostJob.tsx`, `client/src/components/SkillSelector.tsx`
- **DB verification:** N/A.
- **Notes:** Visual interaction not replayed.

### Step 14 - Preview mode
- **Status:** PARTIAL
- **What was tested:** Preview toggle and preview component logic.
- **What actually happened:** Preview mode and data rendering are wired.
- **Expected vs actual:** Aligned by code.
- **Relevant:** `client/src/pages/employer/PostJob.tsx`, `client/src/components/jobs/JobPreview.tsx`
- **DB verification:** N/A.
- **Notes:** Not visually captured.

### Step 15 - Save draft
- **Status:** PASS
- **What was tested:** Draft creation via employer jobs API.
- **What actually happened:** Draft job created (`status='draft'`) before publish update.
- **Expected vs actual:** Matched backend behavior.
- **Relevant:** `POST /api/employer/jobs`, `client/src/pages/employer/PostJob.tsx`
- **DB verification:** `jobs` row created with employer ownership and draft status.
- **Notes:** UI local-draft fallback also exists.

### Step 16 - Publish job
- **Status:** PARTIAL
- **What was tested:** Publish update API; success route code.
- **What actually happened:** Job updated to `published`; success page route exists.
- **Expected vs actual:** Backend status transition matched; browser redirect message not visually verified.
- **Relevant:** `PATCH /api/employer/jobs/{id}`, `client/src/pages/employer/JobPostSuccess.tsx`
- **DB verification:** `jobs.status='published'`, counters initialized.
- **Notes:** API verified; UI redirect partially verified by code.

### Step 17 - Additional jobs (draft + published)
- **Status:** PASS
- **What was tested:** Additional job creation for manage-jobs scenarios.
- **What actually happened:** Created one draft and one published job.
- **Expected vs actual:** Matched.
- **Relevant:** `POST /api/employer/jobs`
- **DB verification:** Multiple rows in `jobs` with mixed statuses.
- **Notes:** Used IDs 1,2,3 for downstream tests.

### Step 18 - Edit existing job
- **Status:** PASS
- **What was tested:** Employer update API on existing job.
- **What actually happened:** Title/salary update persisted.
- **Expected vs actual:** Matched.
- **Relevant:** `PATCH /api/employer/jobs/{id}`, `client/src/pages/employer/EditJob.tsx`
- **DB verification:** Row updated in `jobs`.
- **Notes:** None.

### Step 19 - Attach relational skills API
- **Status:** PASS
- **What was tested:** `POST /api/jobs/{jobId}/skills` with `skill_id` + `importance`.
- **What actually happened:** Skill links created.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobSkillController.php`
- **DB verification:** Rows inserted into `job_skill`.
- **Notes:** Confirmed relational filter prerequisites.

### Step 20 - Manage Jobs quick stats
- **Status:** PARTIAL
- **What was tested:** API data + stats computation logic.
- **What actually happened:** Employer jobs API returns data required for total/published/draft/applications cards.
- **Expected vs actual:** Likely matches.
- **Relevant:** `client/src/pages/employer/ManageJobs.tsx`
- **DB verification:** Data aligns with current `jobs` rows.
- **Notes:** UI cards not visually asserted.

### Step 21 - Filter by status in manage jobs
- **Status:** PARTIAL
- **What was tested:** Filtering logic in component.
- **What actually happened:** Client-side filter for `all/published/draft/closed/filled` implemented.
- **Expected vs actual:** Logic present.
- **Relevant:** `client/src/pages/employer/ManageJobs.tsx`
- **DB verification:** N/A (UI client-side filtering).
- **Notes:** No click replay.

### Step 22 - Close/reopen single job
- **Status:** PASS
- **What was tested:** Status transitions via update API.
- **What actually happened:** `published -> closed -> published` executed.
- **Expected vs actual:** Matched.
- **Relevant:** `PATCH /api/employer/jobs/{id}`
- **DB verification:** `jobs.status` transitions confirmed.
- **Notes:** None.

### Step 23 - Duplicate job
- **Status:** PASS
- **What was tested:** Duplicate flow equivalent (new create using copied fields).
- **What actually happened:** New row created with `(Copy)` suffix and draft status.
- **Expected vs actual:** Matched.
- **Relevant:** `client/src/pages/employer/ManageJobs.tsx` duplicate payload logic
- **DB verification:** New job row created then observed.
- **Notes:** Duplicate later used for delete test.

### Step 24 - Bulk actions
- **Status:** PASS
- **What was tested:** Publish and close on selected jobs (API-equivalent sequence).
- **What actually happened:** Selected jobs updated to expected statuses.
- **Expected vs actual:** Matched.
- **Relevant:** `client/src/pages/employer/ManageJobs.tsx` (`Promise.all` updates)
- **DB verification:** Statuses updated in `jobs`.
- **Notes:** No dedicated backend bulk endpoint; frontend loops per job.

### Step 25 - Delete job (soft delete)
- **Status:** PASS
- **What was tested:** `DELETE /api/employer/jobs/{id}`
- **What actually happened:** Job removed from employer list; soft delete timestamp set.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobController.php`
- **DB verification:** `jobs.deleted_at` populated for deleted row.
- **Notes:** Soft delete behavior works.

### Step 26 - Analytics page
- **Status:** PARTIAL
- **What was tested:** Route and page logic.
- **What actually happened:** Analytics page is scaffolded synthetic/placeholder visualization.
- **Expected vs actual:** Loads scaffold; not real analytics backend.
- **Relevant:** `client/src/pages/employer/JobAnalytics.tsx:96,113,121,128`
- **DB verification:** N/A (no analytics persistence).
- **Notes:** Expected as scaffold in current milestone state.

### Step 27 - Public job browser list
- **Status:** FAIL
- **What was tested:** `GET /jobs` page and `GET /api/jobs`.
- **What actually happened:** Page route loads SPA, but jobs API returns 500.
- **Expected vs actual:** Expected listing cards + filters; actual backend crash blocks listing.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php:50`
- **DB verification:** N/A.
- **Notes:** Critical blocker.

### Step 28 - Search and clear
- **Status:** FAIL
- **What was tested:** Search behavior via public jobs API.
- **What actually happened:** Same 500 blocker prevents search response.
- **Expected vs actual:** Expected narrowing/clearing behavior; not executable.
- **Relevant:** `client/src/pages/jobs/JobsList.tsx`, `server/app/Http/Controllers/JobBrowseController.php`
- **DB verification:** N/A.
- **Notes:** Blocked by Step 27 failure.

### Step 29 - Filter combinations
- **Status:** FAIL
- **What was tested:** Combined filters + pagination call path.
- **What actually happened:** Valid browse calls crash with 500; invalid params still return 422.
- **Expected vs actual:** Expected filtered result pages; actual broken for valid browse.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php`
- **DB verification:** N/A.
- **Notes:** Query validation works, browse execution fails.

### Step 30 - Grid/List toggle
- **Status:** PARTIAL
- **What was tested:** Toggle and URL view-state logic in code.
- **What actually happened:** Toggle logic exists; full UX blocked because list data call fails.
- **Expected vs actual:** Partial.
- **Relevant:** `client/src/pages/jobs/JobsList.tsx`
- **DB verification:** N/A.
- **Notes:** Dependent on fixing Step 27.

### Step 31 - Save job from list
- **Status:** PARTIAL
- **What was tested:** Save mechanism in code and persistence model.
- **What actually happened:** Uses localStorage key `carrigrow.saved_jobs`; no DB write by design.
- **Expected vs actual:** Persistence model matches clarification, but live list flow blocked by Step 27.
- **Relevant:** `client/src/pages/jobs/JobsList.tsx`, `client/src/pages/jobseeker/SavedJobs.tsx`
- **DB verification:** No DB changes expected.
- **Notes:** Local-only behavior confirmed.

### Step 32 - Job detail page
- **Status:** PASS
- **What was tested:** `GET /api/jobs/{publishedId}` on published job.
- **What actually happened:** Detail payload returned with expected fields.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php::show`
- **DB verification:** N/A.
- **Notes:** UI render not visually replayed; API is healthy.

### Step 33 - Views count increment
- **Status:** PASS
- **What was tested:** Repeated detail loads.
- **What actually happened:** `views_count` incremented to 3 after three loads.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php::show`
- **DB verification:** `jobs.views_count` confirmed in MySQL.
- **Notes:** Works.

### Step 34 - Unpublished detail visibility
- **Status:** PASS
- **What was tested:** Direct detail request on closed job.
- **What actually happened:** 404 returned.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php::show`
- **DB verification:** Closed job remained non-public.
- **Notes:** Visibility rule works.

### Step 35 - Apply page as anonymous
- **Status:** PARTIAL
- **What was tested:** Anonymous apply API and route reachability.
- **What actually happened:** API submission returns 401; apply route serves SPA shell.
- **Expected vs actual:** Auth gate works; sign-in card validated by code path.
- **Relevant:** `client/src/pages/jobs/ApplyJob.tsx:143`, `POST /api/jobs/{id}/apply`
- **DB verification:** No application row created.
- **Notes:** Browser card message not visually captured.

### Step 36 - Apply page as non-job-seeker
- **Status:** PASS
- **What was tested:** Employer submission attempt to apply endpoint.
- **What actually happened:** 403 returned; UI code also shows role-required message.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobApplicationController.php`, `client/src/pages/jobs/ApplyJob.tsx:163,168`
- **DB verification:** No row inserted.
- **Notes:** Works.

### Step 37 - Apply as job seeker (manual path)
- **Status:** PASS
- **What was tested:** Job seeker submit to published job.
- **What actually happened:** 201 created application with status `applied`.
- **Expected vs actual:** Matched for backend persistence and state.
- **Relevant:** `POST /api/jobs/3/apply`
- **DB verification:** Row inserted in `job_applications`, `jobs.applications_count` incremented.
- **Notes:** Redirect page UI not visually asserted.

### Step 38 - Apply with profile quick action
- **Status:** PARTIAL
- **What was tested:** Second apply submission on another published job.
- **What actually happened:** Second application succeeded; profile-assisted UI path inferred from code.
- **Expected vs actual:** Backend success matched.
- **Relevant:** `client/src/components/applications/ApplicationForm.tsx` (auto-fill/apply with profile), `POST /api/jobs/1/apply`
- **DB verification:** Second row inserted.
- **Notes:** Auto-fill button not physically clicked.

### Step 39 - Duplicate application prevention
- **Status:** PASS
- **What was tested:** Re-apply same user to same job.
- **What actually happened:** 409 conflict returned.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobApplicationController.php` duplicate check
- **DB verification:** No duplicate `(job_id,user_id)` row.
- **Notes:** Works.

### Step 40 - Application form validation errors
- **Status:** PARTIAL
- **What was tested:** API invalid payload (`resume_url` missing) + frontend validation code inspection.
- **What actually happened:** API returns 422 for missing resume; richer checks (email format/URL/question pair/cover length) exist client-side only.
- **Expected vs actual:** Partially matched.
- **Relevant:** `client/src/components/applications/ApplicationForm.tsx:130,137,144,153`, `server/app/Http/Controllers/JobApplicationController.php:32-35`
- **DB verification:** Invalid request created no row.
- **Notes:** Server-side validation depth is weaker than UI validation.

### Step 41 - Applicants sidebar route
- **Status:** PASS
- **What was tested:** `/dashboard/applicants` route behavior by route map/code.
- **What actually happened:** Route resolves via generic `:section` placeholder.
- **Expected vs actual:** Matched plan clarification.
- **Relevant:** `client/src/layouts/EmployerLayout.tsx`, `client/src/App.tsx:70`, `client/src/pages/DashboardSection.tsx:22`
- **DB verification:** N/A.
- **Notes:** Intentional placeholder behavior.

### Step 42 - Job-specific applicants route
- **Status:** PARTIAL
- **What was tested:** Route reachability and data source wiring.
- **What actually happened:** Route exists and loads scaffold list built from job metadata, not live applicant records.
- **Expected vs actual:** UI route present; persistence wiring incomplete.
- **Relevant:** `client/src/pages/employer/ApplicantsList.tsx:77`, `client/src/pages/employer/applicantData.ts:43`
- **DB verification:** N/A for UI status updates.
- **Notes:** Scaffolding confirmed.

### Step 43 - Applicants list interactions
- **Status:** PARTIAL
- **What was tested:** Status filter, skill filter, bulk status, CSV logic in code + employer applications API.
- **What actually happened:** Interactions are local UI state; API exists only for read listing.
- **Expected vs actual:** UI behavior likely works, DB persistence absent.
- **Relevant:** `client/src/pages/employer/ApplicantsList.tsx:114,118,124,161,186`, `GET /api/jobs/{job}/applications`
- **DB verification:** No status/notes updates persisted from UI actions.
- **Notes:** Expected scaffold gap.

### Step 44 - Applicant detail interactions
- **Status:** PARTIAL
- **What was tested:** Detail route and action handlers.
- **What actually happened:** Status save/notes/message actions are toast/local-only.
- **Expected vs actual:** UI interactions exist; persistence missing.
- **Relevant:** `client/src/pages/employer/ApplicantDetail.tsx:74,78,113`
- **DB verification:** No `job_applications` update path used by UI.
- **Notes:** Scaffold-only.

### Step 45 - My Applications page
- **Status:** PASS
- **What was tested:** `/dashboard/my-applications` route + `GET /api/applications`.
- **What actually happened:** API returned real records for job seeker (2 rows).
- **Expected vs actual:** Matched backend expectation.
- **Relevant:** `client/src/pages/jobseeker/MyApplications.tsx`, `server/app/Http/Controllers/JobApplicationController.php::indexForJobSeeker`
- **DB verification:** Records match inserted applications.
- **Notes:** UI timeline rendering inferred from component code.

### Step 46 - Status notification baseline reset
- **Status:** PARTIAL
- **What was tested:** Local snapshot logic in code.
- **What actually happened:** Baseline storage/reset implemented in localStorage.
- **Expected vs actual:** Aligned.
- **Relevant:** `client/src/pages/jobseeker/MyApplications.tsx:22,254,258`
- **DB verification:** No DB writes expected.
- **Notes:** Not interactively clicked.

### Step 47 - Withdraw action behavior
- **Status:** PARTIAL
- **What was tested:** Withdraw logic in code.
- **What actually happened:** Removes cards from local dashboard view only; no API call.
- **Expected vs actual:** Matches plan clarification (local only).
- **Relevant:** `client/src/pages/jobseeker/MyApplications.tsx:221`
- **DB verification:** No DB update/delete.
- **Notes:** Local-state only.

### Step 48 - Saved Jobs page
- **Status:** FAIL
- **What was tested:** `/dashboard/saved-jobs` dependency chain (`listPublicJobs -> browsePublicJobs -> /api/jobs`).
- **What actually happened:** Saved-jobs route loads, but data fetch fails due `/api/jobs` 500.
- **Expected vs actual:** Expected saved list display; actual broken data loading.
- **Relevant:** `client/src/pages/jobseeker/SavedJobs.tsx:81,91`, `client/src/services/jobs.ts:179`
- **DB verification:** N/A (localStorage feature).
- **Notes:** Blocked by public jobs API failure.

### Step 49 - Job seeker calls employer CRUD endpoint
- **Status:** PASS
- **What was tested:** `POST /api/employer/jobs` as job seeker.
- **What actually happened:** 403.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobController.php`
- **DB verification:** No row created.
- **Notes:** Works.

### Step 50 - Employer tries to apply
- **Status:** PASS
- **What was tested:** `POST /api/jobs/{job}/apply` as employer.
- **What actually happened:** 403.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobApplicationController.php`
- **DB verification:** No application created.
- **Notes:** Works.

### Step 51 - Employer ownership enforcement
- **Status:** PASS
- **What was tested:** Employer B attempts `GET/PATCH/DELETE /api/employer/jobs/{EmployerAJob}`.
- **What actually happened:** All returned 403.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobController.php::ensureEmployerOwnsJob`
- **DB verification:** Target job unchanged.
- **Notes:** Works.

### Step 52 - Non-owner employer views applications
- **Status:** PASS
- **What was tested:** Employer B `GET /api/jobs/{job}/applications` for Employer A job.
- **What actually happened:** 403.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobApplicationController.php::ensureEmployerOwnsJob`
- **DB verification:** No changes.
- **Notes:** Works.

### Step 53 - Invalid query validation
- **Status:** PASS
- **What was tested:** `/api/jobs?per_page=15` and invalid `sort`.
- **What actually happened:** Both return 422 validation errors.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobBrowseController.php` validators
- **DB verification:** N/A.
- **Notes:** Validation works even while valid browse path crashes (Step 27).

### Step 54 - Apply to non-published job
- **Status:** PASS
- **What was tested:** Job seeker apply to closed job.
- **What actually happened:** 422 with published-only guard.
- **Expected vs actual:** Matched.
- **Relevant:** `server/app/Http/Controllers/JobApplicationController.php:27`
- **DB verification:** No application row for closed job.
- **Notes:** Works.

---

## 3. Detailed Issues Found

### CG-M2-001 - Public jobs API crashes with HTTP 500
- **Severity:** Critical
- **Area:** Job Listing / API
- **Reproduction steps:**
1. Start stack.
2. Ensure at least one published job exists.
3. Call `GET /api/jobs?per_page=10`.
- **Expected behavior:** 200 paginated published jobs.
- **Actual behavior:** 500 Internal Server Error.
- **Root cause analysis:** Controller uses `$request->integer('page', 1)` which is unavailable in current Laravel version (8.x), causing `BadMethodCallException`.
- **Files involved:** `server/app/Http/Controllers/JobBrowseController.php:50`, `storage/logs/laravel.log` stack trace.
- **Affected layer:** Backend (and frontend consumers).
- **Suggested fix:** Replace with Laravel-8-safe integer parsing (e.g., `(int) $request->input('page', 1)` with sanitization).
- **Blocks milestone acceptance:** **Yes**.

### CG-M2-002 - Saved Jobs page cannot load due dependency on broken public jobs API
- **Severity:** High
- **Area:** Saved Jobs / Job Listing / API
- **Reproduction steps:**
1. Open `/dashboard/saved-jobs` as job seeker.
2. Page attempts `listPublicJobs()`.
3. Backend call to `/api/jobs?per_page=50` fails with 500.
- **Expected behavior:** Saved jobs list should render from bookmarked IDs.
- **Actual behavior:** Fetch fails (`Could not load saved jobs.`).
- **Root cause analysis:** `SavedJobs` fully depends on `listPublicJobs -> browsePublicJobs -> /api/jobs`; upstream API crash propagates here.
- **Files involved:** `client/src/pages/jobseeker/SavedJobs.tsx:81,91`, `client/src/services/jobs.ts:179`, `server/app/Http/Controllers/JobBrowseController.php:50`.
- **Affected layer:** Both.
- **Suggested fix:** Fix CG-M2-001 first; optionally add graceful fallback and cached saved metadata.
- **Blocks milestone acceptance:** **Yes**.

### CG-M2-003 - Job seeker “Applications” sidebar route points to placeholder, not functional page
- **Severity:** High
- **Area:** Routing / Navigation
- **Reproduction steps:**
1. Login as job seeker.
2. Click sidebar “Applications”.
3. It navigates to `/dashboard/applications`.
- **Expected behavior:** Should open functional My Applications page (`/dashboard/my-applications`).
- **Actual behavior:** Hits generic `:section` placeholder.
- **Root cause analysis:** Sidebar link and route path mismatch.
- **Files involved:** `client/src/layouts/JobSeekerLayout.tsx:16`, `client/src/App.tsx:60,70`, `client/src/pages/DashboardSection.tsx:22`.
- **Affected layer:** Frontend.
- **Suggested fix:** Change link to `/dashboard/my-applications`.
- **Blocks milestone acceptance:** **Likely yes** for milestone demo flow.

### CG-M2-004 - Employer applicant management is scaffold-local, not persisted
- **Severity:** High
- **Area:** Applicant Management / Applications
- **Reproduction steps:**
1. Open `/dashboard/manage-jobs/{jobId}/applicants`.
2. Change statuses, bulk update, save notes, message actions.
3. Reload or query DB.
- **Expected behavior:** Applicant actions persist to `job_applications` or dedicated endpoint.
- **Actual behavior:** Actions are local state/toast-only; no persistence calls.
- **Root cause analysis:** UI uses synthetic records (`buildApplicantsForJob`) and local `setApplicants`; no update endpoint integration.
- **Files involved:** `client/src/pages/employer/applicantData.ts:43`, `client/src/pages/employer/ApplicantsList.tsx:77,114,118,124`, `client/src/pages/employer/ApplicantDetail.tsx:74,78`.
- **Affected layer:** Frontend (missing backend wiring).
- **Suggested fix:** Bind list/detail to real `job_applications` data and add backend update endpoints (status/notes/review metadata).
- **Blocks milestone acceptance:** **Partially** (depends on required depth for Milestone 2).

### CG-M2-005 - Applicant status taxonomy mismatch between scaffold UI and backend model
- **Severity:** Medium
- **Area:** Applicant Management / Data Consistency
- **Reproduction steps:**
1. Compare statuses used in Applicants UI with backend `job_applications.status`.
2. Observe values `new/reviewing/interview` in UI not matching backend enum (`applied/under_review/...`).
- **Expected behavior:** Consistent status vocabulary across app and DB.
- **Actual behavior:** Divergent status sets.
- **Root cause analysis:** Separate scaffold status type not mapped to backend enum.
- **Files involved:** `client/src/pages/employer/applicantData.ts:41`, `client/src/components/applications/StatusBadge.tsx`, `server/app/Models/JobApplication.php`.
- **Affected layer:** Both (integration gap).
- **Suggested fix:** Unify status enum and map explicitly where UX labels differ.
- **Blocks milestone acceptance:** No, but high risk for future integration defects.

### CG-M2-006 - Tracking actions (withdraw/reset baseline) and saved jobs are local-only
- **Severity:** Medium
- **Area:** My Applications / Saved Jobs / Persistence
- **Reproduction steps:**
1. In My Applications, use Withdraw or reset baseline.
2. In Saved Jobs, add/remove saved items.
3. Check DB.
- **Expected behavior:** If product expects server persistence, actions should reflect in DB.
- **Actual behavior:** LocalStorage/view-state only; no backend persistence.
- **Root cause analysis:** Explicit local-only implementation.
- **Files involved:** `client/src/pages/jobseeker/MyApplications.tsx:22,221,254`, `client/src/pages/jobseeker/SavedJobs.tsx:12,16,33`.
- **Affected layer:** Frontend design choice.
- **Suggested fix:** Add backend endpoints/tables if persistence is required by milestone scope.
- **Blocks milestone acceptance:** No if accepted as temporary; yes if persistence is mandatory.

### CG-M2-007 - Application backend validation is weaker than frontend validation
- **Severity:** Medium
- **Area:** Applications / Validation / API
- **Reproduction steps:**
1. Submit application directly to API with minimal fields.
2. Compare with stricter frontend form validation.
- **Expected behavior:** Backend should enforce core data integrity independent of frontend.
- **Actual behavior:** Backend only requires `resume_url` as string and optional loose fields.
- **Root cause analysis:** Validation rules in API are minimal.
- **Files involved:** `server/app/Http/Controllers/JobApplicationController.php:32-35`, `client/src/components/applications/ApplicationForm.tsx:130,137,144,153`.
- **Affected layer:** Backend.
- **Suggested fix:** Strengthen server rules (`url`, min lengths, normalized additional fields) and keep client validation as UX layer.
- **Blocks milestone acceptance:** Not immediate blocker, but important security/data-quality gap.

---

## 4. Working Features Confirmed
- Dockerized environment startup/reset and seeded data initialization.
- Seeded auth login/logout and role identity (`/api/auth/login`, `/api/auth/me`).
- User registration creates correct role-specific profiles.
- Employer job create/edit/publish/close/reopen/duplicate/delete API flows.
- Soft delete (`deleted_at`) works for jobs.
- Relational job skills attach endpoint works (`job_skill` rows created).
- Published job detail endpoint works and increments `views_count`.
- Unpublished/closed jobs are blocked from public detail (404).
- Job seeker apply flow inserts `job_applications` and increments `jobs.applications_count`.
- Duplicate apply prevention works (409).
- Role-based protections (403) for job CRUD/applications and ownership checks.
- Invalid query and non-published apply guards (422) are enforced.

---

## 5. Partial / Scaffolded Features
- Protected-route redirect behavior validated by code + SPA response, not click-by-click browser replay.
- Employer/job-seeker dashboard shell link rendering mostly code-verified.
- Post-job multi-step UI, preview toggle, and step-level UX validations are code-backed; not fully replayed visually.
- Job analytics page is scaffold visualization (synthetic/placeholder values).
- Applicant management list/detail pages are scaffold-heavy and local-state driven.
- My Applications baseline reset/withdraw are local-state/localStorage actions.
- Saved jobs are localStorage-backed (and currently impacted by `/api/jobs` backend failure).

---

## 6. DB Verification Notes
- **Tables checked directly in MySQL:**
  - `users`
  - `employer_profiles`
  - `job_seeker_profiles`
  - `jobs`
  - `job_skill`
  - `job_applications`
- **Observed outcomes:**
  - New users for Employer B / Job Seeker B inserted with matching profile rows.
  - Jobs created/updated with expected statuses (`published`, `closed`, etc.).
  - Soft-deleted job had `deleted_at` set.
  - `job_skill` rows created for attached skills.
  - Two application rows inserted for job seeker.
  - `applications_count` incremented on successful applies.
  - `views_count` incremented on job detail requests.

---

## 7. Final Verdict
- **Readiness:** **Partially ready (not demo-ready for full Milestone 2).**
- **Top blockers:**
1. Public jobs list API crashes (`/api/jobs` 500) - breaks browsing/search/filter and downstream saved-jobs data loading.
2. Job seeker sidebar route mismatch for Applications causes users to land on placeholder page.
3. Applicant management remains scaffold/local-only rather than persisted lifecycle management.
- **Most important next fixes:**
1. Fix public browse API crash immediately.
2. Correct job seeker Applications sidebar path.
3. Decide and implement persistence scope for applicant management and tracking actions.

---

## 8. Recommended Fix Order
1. **CG-M2-001** - Fix `/api/jobs` 500 (`Request::integer` incompatibility) to restore core browsing.
2. **CG-M2-002** - Re-verify and stabilize Saved Jobs once public browse API is fixed.
3. **CG-M2-003** - Correct sidebar route to `/dashboard/my-applications`.
4. **CG-M2-004** - Replace scaffold applicant data/actions with real `job_applications` wiring and persistence.
5. **CG-M2-005** - Unify applicant status vocabulary between UI and backend.
6. **CG-M2-007** - Strengthen backend validation for application payload integrity.
7. **CG-M2-006** - Decide whether local-only tracking/saved behavior should become DB-backed in this milestone.

---

## Fix Verification Notes
- **CG-M2-001 fixed:** Replaced Laravel-8-incompatible request page parsing in public jobs browse endpoint (`request->integer`) with safe query parsing/defaulting. `GET /api/jobs` now returns `200` with expected paginated JSON; filter query and pagination query both return `200`; invalid `per_page=15` still returns `422`.
- **CG-M2-002 fixed:** Saved Jobs dependency endpoint (`/api/jobs`) now responds successfully, removing the prior crash path. Saved jobs remain localStorage-backed by design; page data loading path is now healthy again. Code path for missing/deleted/unpublished saved IDs already handles absence safely via filtering.
- **CG-M2-003 fixed:** Job seeker sidebar Applications link updated from `/dashboard/applications` to `/dashboard/my-applications`. Verified no remaining `/dashboard/applications` references in frontend source and route target exists in app router.
