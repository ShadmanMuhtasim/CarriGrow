# Milestone 2 Bugfix Notes

## Scope
Implemented fixes for:
- CG-M2-001
- CG-M2-002
- CG-M2-003

## Root Causes
- **CG-M2-001:** `JobBrowseController@index` used `Request::integer()`, which is not available in Laravel 8, causing `/api/jobs` runtime 500.
- **CG-M2-002:** `SavedJobs` depends on `listPublicJobs -> /api/jobs`; once `/api/jobs` crashed, saved jobs page failed to load.
- **CG-M2-003:** Job seeker sidebar linked Applications to `/dashboard/applications` (placeholder) instead of `/dashboard/my-applications`.

## Code Changes
- `server/app/Http/Controllers/JobBrowseController.php`
  - Replaced incompatible page parsing with Laravel-8-safe `query('page')` + integer sanitization helper.
- `server/app/Http/Controllers/JobRecommendationController.php`
  - Applied the same page sanitization pattern to prevent similar compatibility regressions.
- `client/src/layouts/JobSeekerLayout.tsx`
  - Updated Applications link to `/dashboard/my-applications`.

## Verification
- `/api/jobs?per_page=10` -> `200`
- `/api/jobs` with filter params -> `200`
- `/api/jobs?per_page=15` -> `422` (validation preserved)
- `/jobs` route -> `200` SPA shell
- `/dashboard/saved-jobs` route -> `200` SPA shell (no `/api/jobs` crash path)
- `/dashboard/my-applications` route -> `200` SPA shell
- Frontend search confirms no remaining `/dashboard/applications` references.
