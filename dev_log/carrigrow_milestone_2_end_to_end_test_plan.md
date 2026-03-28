# CarriGrow Milestone 2 End-to-End Test Plan

This is a repo-grounded, manual end-to-end test plan for **Milestone 2 (Job Portal Core)** in CarriGrow.

It is written in a practical, step-by-step style so you can execute flows manually from UI and verify DB-impacting behavior.

Milestone 2 scope covered here:
- Job posting form and employer CRUD flows (Issue #17 + #16 backend)
- Job listing, search, filtering, and detail (Issue #18 + #19)
- Employer job management and analytics scaffolding (Issue #20)
- Job application backend and apply flow (Issue #21 + #22)
- Employer applicant management UI flow (Issue #23)
- Job seeker tracking and saved jobs flow (Issue #24)

---

## Test Actors

Use seeded users from `database/docker/init/10-reference-data.sql` where possible.

- `Employer A` (seeded): `employer@carrigrow.com`
- `Job Seeker A` (seeded): `jobseeker@carrigrow.com`
- `Mentor A` (seeded): `mentor@carrigrow.com`
- `Admin A` (seeded): `admin1@carrigrow.com`
- Seeded password for all above: `password`

Create additional users during test if needed:
- `Employer B` (new registration)
- `Job Seeker B` (new registration)

---

## Part 1: Environment and Baseline Setup

1. Start the stack and app.
- Run project stack (`docker compose --env-file .env up -d --build`)
- Confirm app opens at `http://localhost:8000`
- Confirm DB UI opens at `http://localhost:8080`

2. (Optional but recommended) Reset DB for clean run.
- Run `docker compose --env-file .env down -v`
- Re-run stack up command
- This ensures `00-schema.sql` and `10-reference-data.sql` are re-applied

3. Validate seeded account login works.
- Login as `Employer A`
- Logout
- Login as `Job Seeker A`

Expected:
- Authentication succeeds
- Redirect goes to dashboard area (`/dashboard/profile` through role redirect logic)

Expected DB result:
- Seeded rows already exist in `users`, `employer_profiles`, `job_seeker_profiles`, `mentor_profiles`, `skills`, `skill_user`

---

## Part 2: Auth, Role Navigation, and Access Baseline

4. Verify protected route behavior for anonymous users.
- Open `/dashboard` in logged-out state

Expected:
- Redirect to `/login`

5. Verify employer navigation shell.
- Login as `Employer A`
- Confirm left nav includes: Overview, Post Job, Manage Jobs, Applicants, Company Profile

6. Verify job seeker navigation shell.
- Login as `Job Seeker A`
- Confirm left nav includes: Overview, Jobs, Applications, Mentorship, Profile

7. Create extra users for ownership/permission tests.
- Register `Employer B` with role `employer`
- Register `Job Seeker B` with role `job_seeker`

Expected:
- Successful registration and auto-login

Expected DB result:
- New rows in `users`
- New row in `employer_profiles` for `Employer B`
- New row in `job_seeker_profiles` for `Job Seeker B`

---

## Part 3: Employer Job Posting Flow (Issue #17 + #16)

8. Open employer job form.
- Login as `Employer A`
- Go to `/dashboard/post-job`
- Confirm 5-step flow is visible:
  - Basic Info
  - Description
  - Compensation
  - Skills
  - Review

9. Step validation checks.
- Try moving next with invalid/missing inputs in each step
- Confirm validation errors appear (title length, description length, salary rules, etc.)

Expected:
- Cannot proceed until current step passes validation

10. Fill Step 1 (Basic Info).
- Enter title, location, employment type, experience level
- Click Continue

11. Fill Step 2 (Description/Requirements).
- Provide long enough description, requirements, responsibilities
- Continue

12. Fill Step 3 (Compensation).
- Enter salary range and currency
- Test invalid case `salary_max < salary_min` then correct it

Expected:
- Error for invalid salary range
- Continue allowed after correction

13. Fill Step 4 (Skills + Qualifications).
- Enter education requirement
- Set application deadline
- Select at least 1 skill
- Continue

14. Test preview mode.
- Toggle Preview on/off
- Confirm entered values render in preview panel

15. Save draft.
- Click `Save draft`

Expected:
- Draft is saved (backend call attempted; local draft also maintained)

Expected DB result:
- If backend call succeeds: row in `jobs` with `status='draft'` and `employer_id=Employer A`
- `skills_required` JSON populated with selected skill names

16. Publish job.
- Go to step 5
- Click `Publish job`

Expected:
- Redirect to `/dashboard/post-job/success`
- Success page shows posted title

Expected DB result:
- Job row exists/updated in `jobs`
- `status='published'`
- `created_at`/`updated_at` set
- `applications_count` starts at 0

17. Create at least one additional employer job.
- Repeat creation once to have multiple records for management tests
- Keep one as `draft`, one as `published`

18. Edit existing job.
- Go `/dashboard/manage-jobs`
- Click Edit on one job
- Change title or salary and save/publish

Expected DB result:
- Corresponding `jobs` row updated

19. (Optional API-level for skill relation coverage) Attach relational skills.
- For at least one published job, call `POST /api/jobs/{jobId}/skills` as employer
- Provide `skills` array with `skill_id` + `importance`

Expected DB result:
- Rows inserted into `job_skill` for that `job_id`

---

## Part 4: Employer Manage Jobs and CRUD (Issue #20)

20. Open Manage Jobs.
- Visit `/dashboard/manage-jobs`
- Verify quick stats: total, published, drafts, applications

21. Filter by status.
- Use status dropdown (`all`, `published`, `draft`, `closed`, `filled`)

Expected:
- Table updates correctly by selected status

22. Close/Reopen single job.
- Use row action to close a published job
- Use action again to reopen

Expected DB result:
- `jobs.status` transitions `published -> closed -> published`

23. Duplicate a job.
- Click `Duplicate` on an existing job

Expected:
- New job appears

Expected DB result:
- New `jobs` row with copied fields
- Title suffixed with `(Copy)`
- `status='draft'`

24. Bulk actions.
- Select multiple rows
- Apply `Publish selected` then `Close selected`

Expected DB result:
- Selected rows have updated `status`

25. Delete job.
- Use delete action and confirm modal

Expected DB result:
- Soft delete in `jobs` (`deleted_at` populated)
- Row no longer appears in manage list

26. Open analytics page.
- Open `/dashboard/manage-jobs/{jobId}/analytics`

Expected:
- Page loads and displays chart panels
- This is scaffolded visualization based on totals

---

## Part 5: Public Job Browser and Detail (Issue #18 + #19)

27. Browse jobs as public/anonymous user.
- Open `/jobs`

Expected:
- Jobs list loads with cards
- Search bar and filters visible

28. Search and clear.
- Search by title keyword
- Use clear

Expected:
- List narrows/expands appropriately
- Query string updates

29. Filter combinations.
- Test location, job type, experience level, salary range, posted window, sort, per-page

Expected:
- Results and pagination update
- Filter state persists in URL params

30. Toggle Grid/List view.
- Switch between Grid and List

Expected:
- Card layout changes
- `view` state reflected in URL

31. Save job from list.
- Click `Save Job` from job card

Expected:
- Badge/label changes to Saved
- Saved state persists locally

Expected DB result:
- No DB change (localStorage key `carrigrow.saved_jobs`)

32. Open job detail.
- Open `/jobs/{publishedJobId}`

Expected:
- Full detail loads (description, requirements, responsibilities, skills)

33. Verify views count increments.
- Refresh detail page multiple times

Expected DB result:
- `jobs.views_count` increments on each detail load

34. Verify unpublished visibility rule.
- Try opening a known `draft`/`closed` job detail by direct URL id

Expected:
- Public detail should not resolve as a normal published detail (404/not found behavior)

---

## Part 6: Job Application Flow (Issue #21 + #22)

35. Open apply page as anonymous user.
- Visit `/jobs/{publishedJobId}/apply` while logged out

Expected:
- Sign-in required card shown

36. Open apply page as non-job-seeker role.
- Login as employer or mentor
- Open same apply URL

Expected:
- "Job seeker role required" message
- No submission allowed

37. Apply as job seeker (manual form path).
- Login as `Job Seeker A`
- Open `/jobs/{publishedJobId}/apply`
- Fill form:
  - name/email/phone
  - resume URL or uploaded file placeholder
  - rich-text cover letter
  - optional portfolio/doc links
  - optional additional questions
- Submit

Expected:
- Redirect to `/jobs/{jobId}/apply/success`
- Status shown as `Applied` (or backend status mapping)

Expected DB result:
- New row in `job_applications`
- `job_id` linked to selected job
- `user_id` = `Job Seeker A`
- `status='applied'`
- `applied_at` set
- `jobs.applications_count` incremented by 1

38. Apply with profile quick action.
- Use `Auto-fill profile` and `Apply with profile` flow on another published job

Expected:
- Profile defaults injected into form
- Submission succeeds if validation passes

39. Duplicate application prevention.
- Attempt applying again to the same job with same job seeker

Expected:
- API conflict behavior (already applied)
- UI shows error toast/message

Expected DB result:
- No second row for same (`job_id`, `user_id`) pair

40. Validation error checks on application form.
- Try invalid email format
- Try cover letter too short
- Try invalid portfolio/document URLs
- Try question without answer (or answer without question)

Expected:
- Client-side validation blocks submit with clear errors

---

## Part 7: Employer Applicant Management (Issue #23)

41. Open applicants from sidebar.
- As employer, click `/dashboard/applicants`

Expected:
- Current code routes this to generic dashboard section placeholder

42. Open job-specific applicants route.
- Navigate directly to `/dashboard/manage-jobs/{jobId}/applicants`

Expected:
- Applicants list UI loads for that job
- Status, skill filters, and bulk status controls visible

43. Verify list interactions.
- Filter by status and skill
- Toggle shortlist/interview action
- Bulk status update
- Export CSV

Expected:
- UI updates as expected

Expected DB result:
- For current implementation, no server status persistence from this UI flow

44. Open applicant detail.
- Navigate to `/dashboard/manage-jobs/{jobId}/applicants/{applicantId}`
- Test:
  - status change
  - notes save
  - resume link open
  - message action

Expected:
- UI interactions work
- Timeline updates in UI

Expected DB result:
- Notes/status changes here are scaffold-local in current implementation (no `job_applications` update endpoint wired in UI)

---

## Part 8: Job Seeker Tracking and Saved Jobs (Issue #24)

45. Open My Applications.
- Login as job seeker
- Open `/dashboard/my-applications` directly

Expected:
- Applications list renders real data from `/api/applications`
- Status timeline appears per application
- Summary analytics cards visible

46. Status notification baseline.
- Use reset baseline action
- Reload page

Expected:
- Snapshot-based status notification behavior works from local baseline

47. Withdraw action behavior.
- Click Withdraw on applicable status cards

Expected:
- Card removed from current dashboard view

Expected DB result:
- No DB delete/update in current implementation (local dashboard state only)

48. Saved jobs page.
- Open `/dashboard/saved-jobs`
- Confirm saved jobs from list/detail are shown
- Remove one saved job

Expected:
- Saved list updates

Expected DB result:
- No DB change (localStorage only)

---

## Part 9: Role Permissions and Important Negative API Checks

Use browser devtools network, Postman, or curl with JWT tokens.

49. Job seeker tries employer job CRUD endpoint.
- `POST /api/employer/jobs` as job seeker token

Expected:
- `403` (only employers can manage jobs)

50. Employer tries applying to job.
- `POST /api/jobs/{jobId}/apply` as employer token

Expected:
- `403` (only job seekers can apply)

51. Employer ownership enforcement.
- As `Employer B`, attempt `GET/PATCH/DELETE /api/employer/jobs/{jobOwnedByEmployerA}`

Expected:
- `403` not allowed to manage/view that job

52. Employer applications visibility enforcement.
- As non-owner employer, attempt `GET /api/jobs/{jobId}/applications`

Expected:
- `403` not allowed

53. Invalid query validation.
- Call `/api/jobs?per_page=15` or invalid `sort`

Expected:
- `422` validation failed

54. Apply to non-published job (API-level).
- Attempt apply to `draft` or `closed` job id as job seeker

Expected:
- `422` can only apply to published jobs

---

## Part 10: Database Tables to Verify

After running this plan, verify these entities/tables:

- `users`
- `job_seeker_profiles`
- `employer_profiles`
- `skills`
- `skill_user`
- `jobs`
- `job_skill` (if skills endpoint tested)
- `job_applications`

Key fields to inspect:
- `jobs`: `employer_id`, `status`, `skills_required`, `views_count`, `applications_count`, `deleted_at`
- `job_applications`: `job_id`, `user_id`, `status`, `applied_at`, `reviewed_at`, `reviewed_by`, `additional_documents`

---

## Expected Final Story (Milestone 2)

By the end of this plan, the system should demonstrate:

1. Employer can create, draft, publish, edit, duplicate, close, and delete jobs.
2. Public users can browse and filter published jobs.
3. Job detail pages load and increment views.
4. Job seeker can apply with validation and success flow.
5. Duplicate applications are blocked.
6. Application count increases on successful apply.
7. Job seeker can track applications from My Applications.
8. Saved jobs and some tracking interactions work from local UI state.
9. Role-based backend protections enforce access boundaries.
10. Applicant management pages are available, with clear indication of scaffolded vs persisted behavior.

---

## Important Clarifications and Assumptions

1. `ApplicantsList` and `ApplicantDetail` are currently scaffold-heavy:
- Applicant cards are generated from job metadata (`buildApplicantsForJob`) and not fully bound to live `job_applications` records for status updates.
- Status update, notes, and messaging actions in those screens are UI-local in current code.

2. `My Applications` route:
- Functional page is `/dashboard/my-applications`.
- Sidebar link currently points to `/dashboard/applications` (generic section fallback), so test the functional route directly.

3. Saved jobs and withdraw behavior:
- Saved jobs are localStorage-backed (`carrigrow.saved_jobs`), not DB-backed.
- Withdraw action in tracker removes items from local dashboard view only.

4. Skill filtering behavior:
- Backend skill filter (`skill_ids`) uses relational `job_skill`.
- Job posting form saves `skills_required` JSON.
- For full skill-id filter coverage, include API test to populate `job_skill`.

5. Analytics page:
- Current charts/demographics are scaffolds based on available totals, not finalized analytics backend.

6. Plan is grounded in current repository behavior as of this run; areas marked above are intentional assumptions or known implementation gaps.

