# 📋 CarriGrow - Complete GitHub Issues & Milestones Guide

## 🎯 Overview
This guide creates **40 well-distributed issues** across 3 milestones, ensuring each team member has **8-10 commits**. Each issue is designed to be atomic (one feature per issue) and properly tagged by contributor responsibility.

---

## 🚦 Execution Decision (2026-03-09)
- Frontend stack is **Bootstrap-based** for this project.
- **Do not add Tailwind** unless the team explicitly decides to migrate later.
- Current priority is to **finish Milestone 1 completely** before starting Milestone 2 or Milestone 3 implementation.
- Milestone 2 and Milestone 3 can stay planned in this file, but active coding focus remains Milestone 1.

## Architecture Decision (2026-03-11)
- The repository is now **database-first only**.
- Schema source of truth: `database/docker/init/00-schema.sql`
- Baseline reference data source of truth: `database/docker/init/10-reference-data.sql`
- Docker MySQL bootstraps from committed SQL files in `database/docker/init/`.
- Laravel migration and seeder files are intentionally removed and must not be reintroduced for Milestone 1 work.
- Any issue that previously said "create migration" now means "update the committed SQL schema and related models/controllers".

## Database-First Implementation Summary

### What was made
- Added committed SQL bootstrap files for schema and safe reference data.
- Switched Docker startup to rely on MySQL init SQL instead of `php artisan migrate` and `php artisan db:seed`.
- Removed the migration/seeder fallback so the project is not hybrid anymore.
- Removed legacy SQL migration artifacts under `database/migrations/` to keep one schema source of truth.
- Updated setup documentation to explain the database-first workflow.

### What each part does
- `database/docker/init/00-schema.sql`: creates the database structure used by the app.
- `database/docker/init/10-reference-data.sql`: inserts safe demo/reference records needed for local development.
- `docker-compose.yml`: mounts `database/docker/init/` into the MySQL container so SQL runs on first boot.
- `docker/php/docker-entrypoint.sh`: waits for MySQL and starts the app without trying to generate schema from code.

### Why this was needed
- To keep one clear database source of truth in Git.
- To avoid a hybrid setup where SQL and Laravel migrations both compete to define schema.
- To make local setup repeatable for every team member with the same baseline data and structure.

## Milestone 1 Execution Update (2026-03-11)

### Scope Completed
- Backend remains Laravel PHP API with a strict database-first workflow.
- Frontend remains React + Bootstrap and now includes Milestone 1 shared UI/form layers and role pages.
- No Laravel migration/seeder files were reintroduced.

### Issue Text Rewrites Applied (Database-First)
- Issue #1 now means: **keep current Laravel baseline and complete monorepo/dev tooling sign-off**.
- Issue #2 now means: **single app-container Docker architecture with DB-first SQL bootstrap**.
- Issue #3 now means: **update committed SQL schema**.
- Issue #7 now means: **update committed SQL schema**.
- Issue #8 now means: **update committed SQL schema**.
- Issue #9 now means: **update committed SQL schema**.
- Issue #10 now means: **update committed SQL schema**.

### What Was Made, What It Does, Why Needed

#### 1) SQL schema + reference data alignment (`#3`, `#7`, `#8`, `#9`, `#10`)
- What made:
  - Updated `database/docker/init/00-schema.sql` with full auth tables, expanded role profile tables, and skill proficiency model.
  - Updated `database/docker/init/10-reference-data.sql` to match new schema columns (`category`, `proficiency_level`, expanded profile fields).
- What it does:
  - Keeps MySQL initialization deterministic from committed SQL only.
  - Provides consistent demo users/profiles/skills across all local environments.
- Why needed:
  - Removes schema drift and ensures the repository stays database-first (no hybrid behavior).

#### 2) Laravel auth/profile/skills API completion (`#5`, `#7`, `#8`, `#9`, `#10`)
- What made:
  - Added `POST /api/auth/refresh`.
  - Added `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`.
  - Added login throttling (`throttle:login`) via `RouteServiceProvider`.
  - Updated `AuthController`, `UserController`, and `SkillController` for full schema fields and skill proficiency.
  - Added `DELETE /api/users/me/profile` to complete profile CRUD coverage for role profiles.
  - Added user skill endpoints:
    - `GET /api/users/{id}/skills`
    - `POST /api/users/{id}/skills`
    - `DELETE /api/users/{id}/skills/{skillId}`
  - Updated model mappings/casts (`User`, `Skill`, `JobSeekerProfile`, `EmployerProfile`, `MentorProfile`) to match SQL.
  - Corrected password reset table mapping to `password_reset_tokens`.
- What it does:
  - Auth and profile flows now align with committed SQL column names and data types.
  - Skill tagging supports required proficiency levels end-to-end.
- Why needed:
  - Milestone 1 API contracts now match implementation and database structure.

#### 3) Frontend auth + profile + dashboard/UI foundations (`#4`, `#6`, `#11`, `#12`, `#13`, `#14`, `#15`)
- What made:
  - Added `Loading` and `ErrorBoundary`.
  - Added auth state layer (`AuthContext`, `useAuth`) and integrated it with protected routes/layout/nav.
  - Rebuilt login/register with React Hook Form + Zod:
    - confirm password
    - terms checkbox
    - forgot-password link
    - stronger validation and loading/error handling
  - Added dedicated `ForgotPassword` and `ResetPassword` pages wired to backend auth reset endpoints.
  - Split profile UI into role-focused pages:
    - `JobSeekerProfile`
    - `EmployerProfile`
    - `MentorProfile`
  - Added reusable `SkillSelector`, `FileUpload`, profile completion progress, and tabbed profile sections.
  - Expanded role dashboard navigation and overview/recent activity sections.
  - Added reusable navigation components: `Breadcrumbs`, `Tabs`, navbar user dropdown.
  - Added reusable UI library:
    - `Button`, `Input`, `Card`, `Modal`, `Toast`, `Badge`, `Pagination`
  - Added reusable form layer:
    - `Select`, `CheckboxRadio`, `DatePicker`, `Textarea`
  - Documented UI component usage in `client/src/components/ui/README.md`.
- What it does:
  - Provides milestone-required reusable UI/form primitives and role-specific UX foundations.
  - Keeps frontend auth/profile behavior consistent with backend role/profile schema.
- Why needed:
  - Closes Milestone 1 functional and structural frontend acceptance criteria.

### Milestone 1 Status
- `#1`: Completed via repo structure + environment docs + root scripts (Laravel version issue handled by rewrite path in this log).
- `#2`: Completed via current Docker architecture and documentation alignment.
- `#3`: Completed (database-first SQL schema updated).
- `#4`: Completed.
- `#5`: Completed.
- `#6`: Completed.
- `#7`: Completed (database-first SQL schema + backend handling updated).
- `#8`: Completed (database-first SQL schema + backend handling updated).
- `#9`: Completed (database-first SQL schema + backend handling updated).
- `#10`: Completed (database-first SQL schema + reference data + skill endpoints).
- `#11`: Completed.
- `#12`: Completed.
- `#13`: Completed.
- `#14`: Completed.
- `#15`: Completed.

## Milestone 1 Sign-Off Checklist

### Must-Do Before Milestone 1 Sign-Off (Completed)
- Issue #1: Completed via formal issue rewrite to current Laravel baseline plus Husky/root scripts and setup docs.
- Issue #2: Completed via formal issue rewrite to the committed single app-container Docker architecture (`app`, `db`, `adminer`) with DB-first SQL bootstrapping.
- Issue #3: Completed in committed SQL (`users` soft deletes + auth support tables).
- Issue #4: Completed (`Loading`, `ErrorBoundary`, router, Bootstrap, Axios base, 404).
- Issue #5: Completed (`POST /api/auth/refresh` + login throttling).
- Issue #6: Completed (confirm password, terms checkbox, forgot-password link + dedicated reset pages, stronger form validation).
- Issue #7: Completed (`job_seeker_profiles` SQL expansion + backend profile handling with CRUD coverage).
- Issue #8: Completed (`employer_profiles` SQL expansion + backend profile handling with CRUD coverage).
- Issue #9: Completed (`mentor_profiles` SQL expansion + backend profile handling with CRUD coverage).
- Issue #10: Completed (`skills`/`skill_user` schema with proficiency + required user-skill API endpoints).
- Issue #11: Completed (role-specific profile pages + `SkillSelector` + `FileUpload` + completion progress).
- Issue #12: Completed (role-based dashboard layouts, sidebar links, overview cards, recent activity).
- Issue #13: Completed (`Breadcrumbs`, `Tabs`, and navbar user dropdown).
- Issue #14: Completed (shared UI library + usage documentation).
- Issue #15: Completed (shared form layer + React Hook Form + Zod integration).

### Should-Do Before Milestone 1 Sign-Off
- Remove or isolate leftover template/session code that is unrelated to CarriGrow Milestone 1 so milestone verification stays focused.
- Align file paths named in issues with the actual repo structure, especially for auth pages, layout components, and shared UI components.
- Add a small verification checklist under each completed issue showing which files prove the acceptance criteria.
- Keep `database/docker/init/01-xampp-export.sql` local only and never use it as milestone evidence or committed source of truth.

### Issue Text That Should Be Rewritten
- Issue #1: Rewritten to match current Laravel baseline and accepted as completed.
- Issue #2: Rewritten to match the committed single app-container Docker approach and accepted as completed.
- Issue #3: Replace every "create migration" instruction with "update committed SQL schema in `database/docker/init/00-schema.sql`".
- Issue #4: Rewrite file-create examples so they match the current layout naming if the team keeps `PublicLayout` and `Navbar` instead of the original filenames.
- Issue #6: Rewrite file paths if login/register stay in `client/src/pages/` instead of `client/src/pages/auth/`, and rewrite the auth-state requirement if the team will not add context/hooks.
- Issue #7: Replace "create migration" with "update committed SQL schema and backend profile handling".
- Issue #8: Replace "create migration" with "update committed SQL schema and backend profile handling".
- Issue #9: Replace "create migration" with "update committed SQL schema and backend profile handling".
- Issue #10: Replace "create migration" with "update committed SQL schema, reference data, and skill API endpoints".

---

## 🏷️ Issue Labels to Create

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | #5319E7 | Backend-related tasks |
| `frontend` | #FBCA04 | Frontend-related tasks |
| `auth` | #006B75 | Authentication & authorization |
| `job-portal` | #1D76DB | Job posting & application features |
| `mentorship` | #E99695 | Forum & mentorship features |
| `skill-matching` | #BFD4F2 | Skill matching algorithm |
| `database` | #0052CC | Database-first SQL schema & reference data |
| `ui/ux` | #FEF2C0 | UI components & design |
| `documentation` | #0E8A16 | README, API docs, comments |
| `testing` | #F9D0C4 | Tests & quality assurance |
| `milestone-1` | #0E8A16 | Core Foundation |
| `milestone-2` | #1D76DB | Job Portal Core |
| `milestone-3` | #5319E7 | Mentorship & Finalization |

---

## 🎯 Assignee Responsibilities

| Team Member | Role | Primary Focus |
|-------------|------|---------------|
| **Muskikim Musa** | Team Lead / Backend | Auth, Database, API Architecture |
| **Shadman Muhtasim** | Backend Developer | Job Portal, Applications, Matching |
| **Ahbab Hassan** | Frontend Developer | UI Components, Pages, Routing |
| **Eastiak Ahmed** | Frontend Developer | State Management, API Integration, Styling |

---

# 📦 MILESTONE 1: Core Foundation & Authentication (15 Issues)

## 🔧 Setup & Infrastructure (Issues #1-4)

### Issue #1: Project Monorepo Setup
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `documentation` `milestone-1`

**Description:** Set up the monorepo structure with Laravel backend and React frontend.

**Acceptance Criteria:**
- [x] Keep Laravel backend project in `/server` directory (current repository baseline)
- [x] Keep React + TypeScript project in `/client` directory
- [x] Configure Vite for frontend development
- [x] Set up Git hooks with Husky
- [x] Create comprehensive README with setup instructions
- [x] Configure environment variable examples for backend, frontend, and Docker flow

**Technical Notes:**
- Laravel version follows current repository baseline unless an explicit upgrade task is approved.
- React stack uses Vite + TypeScript in `/client`.
- Root scripts support running both servers concurrently.

**Commit Message:** `chore: initialize monorepo with laravel and react #1`

---

### Issue #2: Docker Development Environment
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `devops` `milestone-1`

**Description:** Create Docker configuration for consistent development environment.

**Acceptance Criteria:**
- [x] Create root Dockerfile with multi-stage build (Node client build + PHP app runtime)
- [x] Configure `docker-compose.yml` with services: `app`, `db`, `adminer`
- [x] Set up MySQL container with volume persistence
- [x] Mount committed SQL init files for database-first bootstrap
- [x] Configure environment variables for Docker
- [x] Document Docker commands in README

**Files to Create:**
- `Dockerfile` (root)
- `docker-compose.yml`
- `docker/` directory with app entrypoint config

**Commit Message:** `feat(docker): add development environment with mysql and node #2`

---

### Issue #3: Database Schema - Users & Roles
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `database` `auth` `milestone-1`

**Description:** Update the committed SQL schema with the initial users/auth tables and role-based structure.

**Acceptance Criteria:**
- [ ] Update `database/docker/init/00-schema.sql` so `users` includes: name, email, password, role (job_seeker, employer, mentor, admin)
- [ ] Add `email_verified_at` for email verification
- [ ] Add `remember_token` for "remember me"
- [ ] Add timestamps and soft deletes
- [ ] Add `password_reset_tokens` table in `database/docker/init/00-schema.sql`
- [ ] Add `failed_jobs` table in `database/docker/init/00-schema.sql`
- [ ] Add `personal_access_tokens` table for API tokens in `database/docker/init/00-schema.sql`

**Technical Notes:**
- Do not reintroduce Laravel migrations
- Database-first means committed SQL files are the schema source of truth
- Update related backend model/config code as needed after changing SQL
- Index email for faster queries

**Commit Message:** `feat(db): create users table with role-based enum #3`

---

### Issue #4: React Frontend Boilerplate
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Set up React frontend with routing, styling, and basic layout components.

**Acceptance Criteria:**
- [ ] Configure React Router v6 with route structure
- [ ] Set up Bootstrap-based global styling and theme tokens
- [ ] Create Layout component with Header and Footer
- [ ] Create Loading component and Error Boundary
- [ ] Configure Axios instance with base URL
- [ ] Set up environment variables for API URL
- [ ] Create basic 404 page

**Files to Create:**
- `client/src/components/Layout.tsx`
- `client/src/components/Header.tsx`
- `client/src/components/Footer.tsx`
- `client/src/components/Loading.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/NotFound.tsx`

**Commit Message:** `feat(frontend): setup react router, bootstrap, and layout components #4`

---

## 🔐 Authentication & Profiles (Issues #5-12)

### Issue #5: JWT Authentication Backend
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `auth` `milestone-1`

**Description:** Implement JWT authentication for all user roles.

**Acceptance Criteria:**
- [ ] Install and configure `tymon/jwt-auth` package
- [ ] Generate JWT secret key
- [ ] Update User model with JWT methods
- [ ] Create AuthController with:
  - `POST /api/auth/register` - Register with role selection
  - `POST /api/auth/login` - Login with email/password
  - `POST /api/auth/logout` - Invalidate token
  - `POST /api/auth/refresh` - Refresh token
  - `GET /api/auth/me` - Get authenticated user
- [ ] Add validation rules for registration
- [ ] Implement login throttling

**Commit Message:** `feat(auth): implement jwt authentication with multi-role support #5`

---

### Issue #6: Registration & Login Frontend
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `auth` `ui/ux` `milestone-1`

**Description:** Create registration and login pages with form validation.

**Acceptance Criteria:**
- [ ] Create Login page with email/password form
- [ ] Create Registration page with:
  - Name, email, password, confirm password
  - Role selection dropdown (Job Seeker, Employer, Mentor)
  - Terms and conditions checkbox
- [ ] Implement form validation with error messages
- [ ] Add loading states for form submission
- [ ] Store JWT token in localStorage/httpOnly cookie
- [ ] Redirect to appropriate dashboard after login
- [ ] Add "Forgot Password" link

**Files to Create:**
- `client/src/pages/auth/Login.tsx`
- `client/src/pages/auth/Register.tsx`
- `client/src/hooks/useAuth.ts`
- `client/src/context/AuthContext.tsx`

**Commit Message:** `feat(auth): create login and registration pages with validation #6`

---

### Issue #7: Profile Schema - Job Seeker
**Assignee:** Shadman (Backend)
**Labels:** `backend` `database` `milestone-1`

**Description:** Update the committed SQL schema and backend profile handling for job seeker profiles.

**Acceptance Criteria:**
- [ ] Update `database/docker/init/00-schema.sql` so `job_seeker_profiles` includes:
  - `user_id` (foreign key)
  - `phone` string
  - `location` string
  - `bio` text
  - `education` JSON (array of degrees)
  - `experience` JSON (array of jobs)
  - `resume_url` string
  - `portfolio_url` string
  - `linkedin_url` string
  - `github_url` string
  - `date_of_birth` date
  - `gender` enum
- [ ] Create relationships in User model
- [ ] Update backend profile handling/controllers to support CRUD operations for the full schema

**Commit Message:** `feat(profile): create job seeker profile schema and relationships #7`

---

### Issue #8: Profile Schema - Employer
**Assignee:** Shadman (Backend)
**Labels:** `backend` `database` `milestone-1`

**Description:** Update the committed SQL schema and backend profile handling for employer profiles.

**Acceptance Criteria:**
- [ ] Update `database/docker/init/00-schema.sql` so `employer_profiles` includes:
  - `user_id` (foreign key)
  - `company_name` string
  - `company_website` string
  - `company_logo_url` string
  - `company_description` text
  - `industry` string
  - `company_size` enum (1-10, 11-50, 51-200, 201-500, 500+)
  - `founded_year` integer
  - `headquarters_location` string
  - `contact_email` string
  - `contact_phone` string
- [ ] Create relationships in User model
- [ ] Update backend profile handling/controllers to support the full employer profile schema

**Commit Message:** `feat(profile): create employer profile schema and relationships #8`

---

### Issue #9: Profile Schema - Mentor
**Assignee:** Shadman (Backend)
**Labels:** `backend` `database` `milestone-1`

**Description:** Update the committed SQL schema and backend profile handling for mentor profiles.

**Acceptance Criteria:**
- [ ] Update `database/docker/init/00-schema.sql` so `mentor_profiles` includes:
  - `user_id` (foreign key)
  - `current_position` string
  - `company` string
  - `years_of_experience` integer
  - `expertise_areas` JSON (array of fields)
  - `bio` text
  - `linkedin_url` string
  - `calendly_link` string (optional)
  - `availability` JSON (schedule)
  - `mentorship_areas` JSON
  - `hourly_rate` decimal (nullable)
- [ ] Create relationships in User model
- [ ] Update backend profile handling/controllers to support the full mentor profile schema

**Commit Message:** `feat(profile): create mentor profile schema and relationships #9`

---

### Issue #10: Skills Schema & Tagging
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `database` `skill-matching` `milestone-1`

**Description:** Update the committed SQL schema and API for skills and user-skill tagging.

**Acceptance Criteria:**
- [ ] Update `database/docker/init/00-schema.sql` so `skills` includes: `id`, `name` (unique), `category`, `created_at`
- [ ] Update `database/docker/init/00-schema.sql` so `skill_user` includes: `skill_id`, `user_id`, `proficiency_level` (beginner, intermediate, advanced, expert)
- [ ] Create Skill model with relationships
- [ ] Update `database/docker/init/10-reference-data.sql` with initial skills (programming languages, frameworks, soft skills)
- [ ] Create SkillController with:
  - `GET /api/skills` - List all skills
  - `POST /api/users/{id}/skills` - Add skill to user
  - `DELETE /api/users/{id}/skills/{skillId}` - Remove skill
  - `GET /api/users/{id}/skills` - Get user's skills

**Commit Message:** `feat(skills): create skills schema and user-skill relationships #10`

---

### Issue #11: Profile Pages Frontend
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Create profile pages for all roles with forms and display.

**Acceptance Criteria:**
- [ ] Create Job Seeker Profile page:
  - View profile information
  - Edit profile form
  - Skills selection (multi-select)
  - Resume upload functionality
- [ ] Create Employer Profile page:
  - Company information form
  - Logo upload
- [ ] Create Mentor Profile page:
  - Professional background form
  - Expertise areas selection
- [ ] Add profile completion progress bar
- [ ] Implement form validation
- [ ] Create reusable form components

**Files to Create:**
- `client/src/pages/profile/JobSeekerProfile.tsx`
- `client/src/pages/profile/EmployerProfile.tsx`
- `client/src/pages/profile/MentorProfile.tsx`
- `client/src/components/SkillSelector.tsx`
- `client/src/components/FileUpload.tsx`

**Commit Message:** `feat(profile): create role-based profile pages with forms #11`

---

### Issue #12: Role-Based Dashboard Layouts
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Create role-based dashboard layouts with navigation.

**Acceptance Criteria:**
- [ ] Create Job Seeker Dashboard layout with:
  - Sidebar navigation (Dashboard, Jobs, Applications, Mentorship, Profile)
  - Overview cards (applications count, saved jobs, upcoming mentorship)
  - Recent activity feed
- [ ] Create Employer Dashboard layout with:
  - Sidebar (Dashboard, Post Job, Manage Jobs, Applicants, Company Profile)
  - Stats cards (active jobs, total applicants)
- [ ] Create Mentor Dashboard layout with:
  - Sidebar (Dashboard, Forum Posts, Q&A, Mentees, Profile)
  - Recent questions, activity metrics
- [ ] Create Admin Dashboard layout (basic structure)
- [ ] Implement responsive design for mobile/tablet

**Files to Create:**
- `client/src/layouts/JobSeekerLayout.tsx`
- `client/src/layouts/EmployerLayout.tsx`
- `client/src/layouts/MentorLayout.tsx`
- `client/src/layouts/AdminLayout.tsx`
- `client/src/components/Sidebar.tsx`

**Commit Message:** `feat(dashboard): create role-based dashboard layouts #12`

---

## 🏗️ Core UI Components (Issues #13-15)

### Issue #13: Navigation Components
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Create reusable navigation components.

**Acceptance Criteria:**
- [ ] Create Navbar component with:
  - Logo
  - Navigation links (conditional based on auth)
  - User dropdown menu
  - Mobile responsive menu
- [ ] Create Footer component with links
- [ ] Create Breadcrumb component
- [ ] Create Tab component for profile sections
- [ ] Ensure consistent styling across all components

**Commit Message:** `feat(ui): create reusable navigation components #13`

---

### Issue #14: UI Component Library
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Create reusable UI component library.

**Acceptance Criteria:**
- [ ] Create Button component with variants (primary, secondary, outline, danger)
- [ ] Create Input component with validation states
- [ ] Create Card component for content display
- [ ] Create Modal component
- [ ] Create Alert/Toast notification system
- [ ] Create Badge component for skills/status
- [ ] Create Pagination component
- [ ] Document component props and usage

**Files to Create:**
- `client/src/components/ui/Button.tsx`
- `client/src/components/ui/Input.tsx`
- `client/src/components/ui/Card.tsx`
- `client/src/components/ui/Modal.tsx`
- `client/src/components/ui/Toast.tsx`
- `client/src/components/ui/Badge.tsx`

**Commit Message:** `feat(ui): create reusable component library #14`

---

### Issue #15: Form Components & Validation
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `ui/ux` `milestone-1`

**Description:** Create form components with validation integration.

**Acceptance Criteria:**
- [ ] Create Form component with error handling
- [ ] Create Select component with options
- [ ] Create Checkbox/Radio components
- [ ] Create DatePicker component
- [ ] Create Textarea component
- [ ] Implement React Hook Form integration
- [ ] Add Yup/Zod validation schemas
- [ ] Create form validation hooks

**Commit Message:** `feat(forms): create form components with validation #15`

---

# 📦 MILESTONE 2: Job Portal Core (13 Issues)

## 💼 Job Postings (Issues #16-20)

### Issue #16: Jobs Schema & CRUD Backend
**Assignee:** Musa (Backend)
**Labels:** `backend` `database` `job-portal` `milestone-2`

**Description:** Create jobs table and CRUD operations for employers.

**Acceptance Criteria:**
- [ ] Create `jobs` migration with:
  - `employer_id` (foreign key to users)
  - `title` string
  - `description` text
  - `requirements` text
  - `responsibilities` text
  - `location` string (remote, hybrid, on-site)
  - `salary_min` decimal
  - `salary_max` decimal
  - `salary_currency` string (default: USD)
  - `employment_type` enum (full-time, part-time, contract, internship)
  - `experience_level` enum (entry, mid, senior, lead)
  - `education_required` string
  - `skills_required` JSON or relationship
  - `application_deadline` date
  - `status` enum (draft, published, closed, filled)
  - `views_count` integer
  - `applications_count` integer
  - `created_at`, `updated_at`, `soft_deletes`
- [ ] Create Job model with relationships
- [ ] Create JobController with CRUD endpoints
- [ ] Add authorization (only employers can create/update/delete)

**Commit Message:** `feat(jobs): create jobs schema and employer crud operations #16`

---

### Issue #17: Job Posting Form Frontend
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create job posting form for employers.

**Acceptance Criteria:**
- [ ] Create multi-step job posting form:
  - Step 1: Basic Info (title, location, employment type)
  - Step 2: Description & Requirements (rich text editor)
  - Step 3: Compensation & Benefits (salary range)
  - Step 4: Skills & Qualifications (skill selector)
  - Step 5: Review & Publish
- [ ] Add form validation for each step
- [ ] Implement draft save functionality
- [ ] Add preview mode
- [ ] Create success page after posting

**Files to Create:**
- `client/src/pages/employer/PostJob.tsx`
- `client/src/pages/employer/EditJob.tsx`
- `client/src/components/jobs/JobFormStep1.tsx`
- `client/src/components/jobs/JobFormStep2.tsx`
- `client/src/components/jobs/JobFormStep3.tsx`
- `client/src/components/jobs/JobPreview.tsx`

**Commit Message:** `feat(jobs): create multi-step job posting form #17`

---

### Issue #18: Job Listing & Filtering Backend
**Assignee:** musa (Backend)
**Labels:** `backend` `job-portal` `milestone-2`

**Description:** Create job listing API with filtering and search.

**Acceptance Criteria:**
- [ ] Create `GET /api/jobs` endpoint with:
  - Pagination (10, 25, 50 per page)
  - Search by title, description
  - Filter by location, employment type, experience level
  - Filter by salary range
  - Filter by skills (skill IDs)
  - Filter by date posted
  - Sorting options (newest, salary, relevance)
- [ ] Create `GET /api/jobs/featured` for featured jobs
- [ ] Create `GET /api/jobs/{id}` with full details
- [ ] Implement query optimization with indexes
- [ ] Add caching for frequent queries

**Commit Message:** `feat(jobs): create job listing api with filtering and search #18`

---

### Issue #19: Job Browser & Search Frontend
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create job browsing page with filters and search.

**Acceptance Criteria:**
- [ ] Create Jobs page with:
  - Search bar (title, keywords)
  - Filter sidebar with:
    - Location filter
    - Job type checkboxes
    - Experience level
    - Salary range slider
    - Skills multi-select
    - Date posted dropdown
  - Job cards grid/list view toggle
  - Pagination or infinite scroll
- [ ] Save filter state in URL for sharing
- [ ] Add loading skeletons
- [ ] Create job detail modal/page
- [ ] Implement "Save Job" functionality

**Files to Create:**
- `client/src/pages/jobs/JobsList.tsx`
- `client/src/pages/jobs/JobDetail.tsx`
- `client/src/components/jobs/JobCard.tsx`
- `client/src/components/jobs/JobFilters.tsx`
- `client/src/components/jobs/SearchBar.tsx`

**Commit Message:** `feat(jobs): create job browser with filters and search #19`

---

### Issue #20: Job Management for Employers
**Assignee:** Ahbab & Ishtiak (Frontend Team)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create job management dashboard for employers.

**Acceptance Criteria:**
- [ ] Create "My Jobs" page with:
  - List of all jobs posted
  - Status indicators (published, draft, closed)
  - Quick stats (views, applications)
  - Actions: edit, duplicate, close, delete
  - Filter by status
- [ ] Create job analytics page:
  - Views over time chart
  - Applications by day
  - Applicant demographics
- [ ] Create "Applicants" page for each job
- [ ] Add bulk actions for jobs

**Commit Message:** `feat(jobs): create employer job management dashboard #20`

---

## 📝 Job Applications (Issues #21-24)

### Issue #21: Applications Schema & Apply Backend
**Assignee:** Shadman (Backend)
**Labels:** `backend` `database` `job-portal` `milestone-2`

**Description:** Create job applications schema and apply functionality.

**Acceptance Criteria:**
- [ ] Create `job_applications` migration with:
  - `job_id` foreign key
  - `user_id` foreign key (job seeker)
  - `cover_letter` text
  - `resume_url` string
  - `additional_documents` JSON
  - `status` enum (applied, under_review, shortlisted, rejected, hired)
  - `employer_notes` text (private)
  - `applied_at` timestamp
  - `reviewed_at` timestamp
  - `reviewed_by` foreign key
- [ ] Create Application model with relationships
- [ ] Create `POST /api/jobs/{id}/apply` endpoint
- [ ] Add validation (prevent duplicate applications)
- [ ] Create `GET /api/applications` for job seekers
- [ ] Create `GET /api/jobs/{id}/applications` for employers

**Commit Message:** `feat(applications): create applications schema and apply endpoint #21`

---

### Issue #22: Job Application Form Frontend
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create job application form for job seekers.

**Acceptance Criteria:**
- [ ] Create application form with:
  - Resume upload (PDF, DOC)
  - Cover letter (rich text editor)
  - Additional questions (if any)
  - Portfolio links
- [ ] Auto-fill profile information
- [ ] Add form validation
- [ ] Create success confirmation page
- [ ] Add "Apply with Profile" option
- [ ] Track application status after submission

**Files to Create:**
- `client/src/pages/jobs/ApplyJob.tsx`
- `client/src/components/applications/ApplicationForm.tsx`
- `client/src/components/applications/ApplicationSuccess.tsx`

**Commit Message:** `feat(applications): create job application form #22`

---

### Issue #23: Applicant Management for Employers
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create applicant management dashboard for employers.

**Acceptance Criteria:**
- [ ] Create applicants list view with:
  - Applicant cards with name, photo, applied date
  - Status badges
  - Skills tags
  - Quick actions (view profile, change status, message)
- [ ] Create applicant detail page with:
  - Full profile information
  - Resume viewer
  - Cover letter display
  - Status update form
  - Notes section
- [ ] Add filtering by status, skills
- [ ] Implement bulk status updates
- [ ] Add export to CSV functionality

**Files to Create:**
- `client/src/pages/employer/ApplicantsList.tsx`
- `client/src/pages/employer/ApplicantDetail.tsx`
- `client/src/components/applications/StatusBadge.tsx`
- `client/src/components/applications/StatusUpdater.tsx`

**Commit Message:** `feat(applications): create employer applicant management #23`

---

### Issue #24: Application Tracking for Job Seekers
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `job-portal` `ui/ux` `milestone-2`

**Description:** Create application tracking dashboard for job seekers.

**Acceptance Criteria:**
- [ ] Create "My Applications" page with:
  - List of all applications
  - Status indicators with timeline
  - Company and job details
  - Applied date
  - Actions: withdraw application
- [ ] Create status progress tracker
- [ ] Add notifications for status changes
- [ ] Create saved jobs page
- [ ] Add application analytics (success rate, response time)

**Files to Create:**
- `client/src/pages/jobseeker/MyApplications.tsx`
- `client/src/pages/jobseeker/SavedJobs.tsx`
- `client/src/components/applications/ApplicationCard.tsx`
- `client/src/components/applications/StatusTimeline.tsx`

**Commit Message:** `feat(applications): create job seeker application tracking #24`

---

## 🔍 Skill Matching (Issues #25-28)

### Issue #25: Job-Skill Relationship Backend
**Assignee:** Shadman (Backend)
**Labels:** `backend` `database` `skill-matching` `milestone-2`

**Description:** Create job-skill relationship and matching algorithm foundation.

**Acceptance Criteria:**
- [ ] Create `job_skill` pivot table with:
  - `job_id` foreign key
  - `skill_id` foreign key
  - `importance` enum (required, preferred, bonus)
- [ ] Update Job model with skills relationship
- [ ] Create `GET /api/jobs/{id}/skills` endpoint
- [ ] Create `POST /api/jobs/{id}/skills` for employers
- [ ] Create algorithm to calculate match percentage

**Commit Message:** `feat(matching): create job-skill relationship and matching foundation #25`

---

### Issue #26: Skill Match Algorithm
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `skill-matching` `milestone-2`

**Description:** Implement skill matching algorithm with percentage score.

**Acceptance Criteria:**
- [ ] Create SkillMatchService class
- [ ] Implement algorithm that:
  - Compares job required skills with user skills
  - Calculates match percentage
  - Identifies missing skills
  - Suggests skills to acquire
- [ ] Create `GET /api/jobs/{id}/match-score` endpoint
- [ ] Create `GET /api/users/{id}/recommended-jobs` endpoint
- [ ] Cache results for performance
- [ ] Add unit tests for algorithm

**Commit Message:** `feat(matching): implement skill matching algorithm with percentage score #26`

---

### Issue #27: Match Display Frontend
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `skill-matching` `ui/ux` `milestone-2`

**Description:** Display match scores and missing skills in UI.

**Acceptance Criteria:**
- [ ] Add match percentage badge on job cards
- [ ] Create match details modal showing:
  - Overall percentage
  - Matched skills list
  - Missing skills list
  - Suggested skills to learn
- [ ] Add color coding (green for high match)
- [ ] Create recommended jobs section on dashboard
- [ ] Add skill gap analysis chart

**Files to Create:**
- `client/src/components/matching/MatchBadge.tsx`
- `client/src/components/matching/MatchDetails.tsx`
- `client/src/components/matching/SkillGapChart.tsx`
- `client/src/pages/jobseeker/RecommendedJobs.tsx`

**Commit Message:** `feat(matching): display match scores and missing skills in ui #27`

---

### Issue #28: Job Recommendations Backend
**Assignee:** Shadman (Backend)
**Labels:** `backend` `skill-matching` `milestone-2`

**Description:** Create job recommendation system based on user skills.

**Acceptance Criteria:**
- [ ] Create `GET /api/recommendations/jobs` endpoint
- [ ] Implement recommendation logic:
  - Find jobs matching user skills
  - Consider job freshness (recently posted)
  - Boost jobs with higher match percentage
  - Exclude already applied jobs
- [ ] Add pagination for recommendations
- [ ] Create personalization based on user history
- [ ] Add A/B testing framework for algorithm

**Commit Message:** `feat(recommendations): create job recommendation system based on skills #28`

---

# 📦 MILESTONE 3: Mentorship & Finalization (12 Issues)

## 💬 Mentorship Forum (Issues #29-33)

### Issue #29: Forum Schema Backend
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `database` `mentorship` `milestone-3`

**Description:** Create forum posts and replies schema.

**Acceptance Criteria:**
- [ ] Create `forum_posts` migration with:
  - `user_id` foreign key
  - `title` string
  - `content` text (rich text)
  - `type` enum (question, discussion, resource)
  - `skill_ids` JSON or relationship
  - `views_count` integer
  - `replies_count` integer
  - `is_pinned` boolean
  - `is_solved` boolean (for questions)
  - `status` enum (published, hidden, deleted)
  - `created_at`, `updated_at`, `soft_deletes`
- [ ] Create `forum_replies` migration with:
  - `post_id` foreign key
  - `user_id` foreign key
  - `content` text
  - `is_solution` boolean (mark as answer)
  - `created_at`, `updated_at`
- [ ] Create `forum_post_skill` pivot table
- [ ] Create models with relationships

**Commit Message:** `feat(forum): create forum posts and replies schema #29`

---

### Issue #30: Forum API Endpoints
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `mentorship` `milestone-3`

**Description:** Create CRUD API endpoints for forum.

**Acceptance Criteria:**
- [ ] Create `GET /api/forum/posts` with:
  - Pagination
  - Filter by skill, type, date
  - Search in title/content
  - Sort by popularity, recent, unanswered
- [ ] Create `POST /api/forum/posts` for new posts
- [ ] Create `GET /api/forum/posts/{id}` with replies
- [ ] Create `PUT /api/forum/posts/{id}` for edits
- [ ] Create `DELETE /api/forum/posts/{id}` (soft delete)
- [ ] Create reply endpoints:
  - `POST /api/forum/posts/{id}/replies`
  - `PUT /api/forum/replies/{id}`
  - `DELETE /api/forum/replies/{id}`
- [ ] Add `POST /api/forum/replies/{id}/mark-solution`

**Commit Message:** `feat(forum): create crud api endpoints for forum #30`

---

### Issue #31: Forum UI - List & Detail
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `mentorship` `ui/ux` `milestone-3`

**Description:** Create forum listing and detail pages.

**Acceptance Criteria:**
- [ ] Create Forum page with:
  - Post cards with title, author, preview
  - Skill tags
  - Stats (views, replies)
  - "Solved" indicator
  - Filter sidebar (by skill, by type)
  - Search bar
  - New Post button
- [ ] Create Post Detail page with:
  - Full post content
  - Replies thread
  - Reply form
  - Mark as solution (for mentors/post author)
  - Vote/like functionality
- [ ] Create New Post form with:
  - Title input
  - Rich text editor
  - Skill selector
  - Post type selection

**Files to Create:**
- `client/src/pages/forum/ForumList.tsx`
- `client/src/pages/forum/PostDetail.tsx`
- `client/src/pages/forum/NewPost.tsx`
- `client/src/components/forum/PostCard.tsx`
- `client/src/components/forum/ReplyThread.tsx`
- `client/src/components/forum/RichTextEditor.tsx`

**Commit Message:** `feat(forum): create forum listing and detail pages #31`

---

### Issue #32: Mentor Dashboard - Forum Management
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `mentorship` `ui/ux` `milestone-3`

**Description:** Create mentor dashboard for forum management.

**Acceptance Criteria:**
- [ ] Create mentor forum overview with:
  - Recent questions in their expertise
  - Unanswered questions count
  - Their recent answers
  - Engagement metrics
- [ ] Create "My Answers" page
- [ ] Create "Questions for Me" page (filtered by skills)
- [ ] Add notification for new questions in their expertise
- [ ] Create mentor profile public view

**Files to Create:**
- `client/src/pages/mentor/ForumOverview.tsx`
- `client/src/pages/mentor/MyAnswers.tsx`
- `client/src/pages/mentor/QuestionsForMe.tsx`
- `client/src/components/mentor/ExpertiseBadge.tsx`

**Commit Message:** `feat(mentor): create mentor forum management dashboard #32`

---

### Issue #33: Notification System
**Assignee:** Musa & Shadman (Backend Team)
**Labels:** `backend` `mentorship` `milestone-3`

**Description:** Create notification system for forum interactions.

**Acceptance Criteria:**
- [ ] Create `notifications` table
- [ ] Implement notification types:
  - New reply to your post
  - Your answer marked as solution
  - New question in your expertise
  - @mentions in posts/replies
- [ ] Create `GET /api/notifications` endpoint
- [ ] Create `PUT /api/notifications/{id}/read`
- [ ] Create `PUT /api/notifications/read-all`
- [ ] Add real-time notifications (optional, with Pusher)

**Commit Message:** `feat(notifications): create notification system for forum interactions #33`

---

## 🎯 Admin & Final Polish (Issues #34-40)

### Issue #34: Admin Dashboard Backend
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `milestone-3`

**Description:** Create admin dashboard backend with analytics.

**Acceptance Criteria:**
- [ ] Create admin-specific endpoints:
  - `GET /api/admin/stats` - platform statistics
  - `GET /api/admin/users` - user management
  - `PUT /api/admin/users/{id}/role` - change user role
  - `POST /api/admin/users/{id}/suspend` - suspend user
  - `GET /api/admin/reports` - reported content
- [ ] Create user activity logs
- [ ] Create `admin_actions` table for audit trail
- [ ] Implement admin middleware

**Commit Message:** `feat(admin): create admin dashboard backend with analytics #34`

---

### Issue #35: Admin Dashboard Frontend
**Assignee:** Ahbab (Frontend)
**Labels:** `frontend` `ui/ux` `milestone-3`

**Description:** Create admin dashboard frontend.

**Acceptance Criteria:**
- [ ] Create admin dashboard with:
  - Analytics cards (users, jobs, applications, forum posts)
  - User management table with filters
  - Role change dropdown
  - Suspend/activate actions
  - Content moderation queue
- [ ] Create user detail view for admin
- [ ] Create system logs viewer
- [ ] Add charts for platform growth
- [ ] Create reports management

**Files to Create:**
- `client/src/pages/admin/Dashboard.tsx`
- `client/src/pages/admin/UserManagement.tsx`
- `client/src/pages/admin/ContentModeration.tsx`
- `client/src/pages/admin/SystemLogs.tsx`

**Commit Message:** `feat(admin): create admin dashboard frontend #35`

---

### Issue #36: Testing - Backend Unit Tests
**Assignee:** Shadman (Backend)
**Labels:** `backend` `testing` `milestone-3`

**Description:** Write comprehensive backend unit tests.

**Acceptance Criteria:**
- [ ] Write tests for authentication (100% coverage)
- [ ] Write tests for user profiles
- [ ] Write tests for job CRUD operations
- [ ] Write tests for applications
- [ ] Write tests for forum posts/replies
- [ ] Write tests for skill matching algorithm
- [ ] Achieve minimum 80% code coverage

**Files to Create:**
- `server/tests/Feature/Auth/*`
- `server/tests/Feature/Job/*`
- `server/tests/Feature/Application/*`
- `server/tests/Feature/Forum/*`
- `server/tests/Unit/SkillMatchTest.php`

**Commit Message:** `test: add comprehensive backend unit tests #36`

---

### Issue #37: Testing - Frontend Component Tests
**Assignee:** Ishtiak (Frontend)
**Labels:** `frontend` `testing` `milestone-3`

**Description:** Write frontend component tests.

**Acceptance Criteria:**
- [ ] Set up Jest and React Testing Library
- [ ] Test all UI components (Button, Input, Card, etc.)
- [ ] Test authentication flows
- [ ] Test job browsing and filtering
- [ ] Test application forms
- [ ] Test forum interactions
- [ ] Achieve minimum 70% code coverage

**Files to Create:**
- `client/src/components/__tests__/*.test.tsx`
- `client/src/pages/__tests__/*.test.tsx`
- `client/src/hooks/__tests__/*.test.ts`

**Commit Message:** `test: add frontend component tests #37`

---

### Issue #38: API Documentation
**Assignee:** Musa (Backend Lead)
**Labels:** `backend` `documentation` `milestone-3`

**Description:** Create comprehensive API documentation.

**Acceptance Criteria:**
- [ ] Install and configure Swagger/OpenAPI
- [ ] Document all authentication endpoints
- [ ] Document all user/profile endpoints
- [ ] Document all job endpoints
- [ ] Document all application endpoints
- [ ] Document all forum endpoints
- [ ] Document all admin endpoints
- [ ] Create Postman collection for testing
- [ ] Add examples for each endpoint

**Commit Message:** `docs: create comprehensive api documentation with swagger #38`

---

### Issue #39: Performance Optimization
**Assignee:** Shadman (Backend) & Ahbab (Frontend)
**Labels:** `backend` `frontend` `milestone-3`

**Description:** Optimize application performance.

**Acceptance Criteria:**

**Backend:**
- [ ] Implement Redis caching for frequent queries
- [ ] Add database indexes for slow queries
- [ ] Optimize N+1 queries with eager loading
- [ ] Implement pagination for all list endpoints
- [ ] Add query logging and analysis

**Frontend:**
- [ ] Implement code splitting with React.lazy
- [ ] Add image optimization and lazy loading
- [ ] Implement virtual scrolling for long lists
- [ ] Reduce bundle size (analyze with source-map-explorer)
- [ ] Add service worker for offline capability

**Commit Message:** `perf: optimize application performance backend and frontend #39`

---

### Issue #40: Deployment & Final Polish
**Assignee:** All Team Members
**Labels:** `documentation` `milestone-3`

**Description:** Prepare for deployment and final polish.

**Acceptance Criteria:**
- [ ] Create production environment configuration
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Create deployment scripts
- [ ] Update README with live demo link
- [ ] Create user manual/documentation
- [ ] Fix all known bugs
- [ ] Conduct final testing on staging
- [ ] Deploy to production server

**Commit Message:** `chore: prepare for deployment and final polish #40`

---

# 📊 Issue Distribution Summary

## By Milestone

| Milestone | Issues | Backend | Frontend | Mixed |
|-----------|--------|---------|----------|-------|
| Milestone 1 | 15 | 7 | 6 | 2 |
| Milestone 2 | 13 | 5 | 6 | 2 |
| Milestone 3 | 12 | 5 | 4 | 3 |
| **Total** | **40** | **17** | **16** | **7** |

## By Team Member

| Team Member | Issues | Commit Estimate |
|-------------|--------|-----------------|
| **Musa** (Backend Lead) | 10-12 | ~10 commits |
| **Shadman** (Backend) | 8-10 | ~8 commits |
| **Ahbab** (Frontend) | 8-10 | ~8 commits |
| **Ishtiak** (Frontend) | 8-10 | ~8 commits |

---

# 📝 GitHub Labels Summary

```
# Create these labels in your repository:

auth (color: #006B75)
backend (color: #5319E7)
bug (color: #d73a4a)
database (color: #0052CC)
documentation (color: #0E8A16)
enhancement (color: #a2eeef)
frontend (color: #FBCA04)
good-first-issue (color: #7057ff)
job-portal (color: #1D76DB)
mentorship (color: #E99695)
milestone-1 (color: #0E8A16)
milestone-2 (color: #1D76DB)
milestone-3 (color: #5319E7)
skill-matching (color: #BFD4F2)
testing (color: #F9D0C4)
ui/ux (color: #FEF2C0)
```

---

# 🚀 Getting Started for Team Members

## For Backend Team (Musa & Shadman)

```bash
# Clone repository
git clone https://github.com/your-org/CarriGrow.git
cd CarriGrow/server

# Install dependencies
composer install

# Set up environment
cp .env.example .env
# Update database credentials in .env

# Generate key and import SQL baseline
php artisan key:generate
php artisan jwt:secret
# Import database/docker/init/00-schema.sql
# Import database/docker/init/10-reference-data.sql

# Start server
php artisan serve
```

## For Frontend Team (Ahbab & Ishtiak)

```bash
# Clone repository
git clone https://github.com/your-org/CarriGrow.git
cd CarriGrow/client

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Update API URL in .env.local

# Start development server
npm run dev
```

---

# 🔄 Git Workflow for Team

## Branch Naming Convention
- Feature: `feature/issue-number-feature-name`
- Bugfix: `fix/issue-number-bug-description`
- Hotfix: `hotfix/issue-number-description`

## Commit Message Convention
```
type(scope): description #issue-number

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, jobs, forum, ui, api, db, etc.

Example: feat(auth): implement jwt authentication #5
```

## Pull Request Process
1. Create feature branch from `dev`
2. Implement changes with multiple commits
3. Push branch and create PR to `dev`
4. Assign reviewer (team lead)
5. Address review comments
6. Merge after approval

---

This guide ensures:
- ✅ **40 well-distributed issues** across 3 milestones
- ✅ **8-10 commits per team member**
- ✅ **Clear responsibilities** (backend/frontend separation)
- ✅ **Atomic commits** with proper messages
- ✅ **Comprehensive features** covering all requirements
- ✅ **Testing and documentation** included

**Ready to create these issues in your GitHub repository!** 🚀



==========================================================================
==========================================================================
==========================================================================
==========================================================================
==========================================================================
==========================================================================
mapping : 
# 📊 CarriGrow - Complete Issues & Commits Chart

## 📋 Master Chart: All 40 Issues with Commit Messages

---

## 🏷️ MILESTONE 1: Core Foundation & Authentication (15 Issues)

| # | Issue Title | Assignee | Commit Message |
|---|-------------|----------|----------------|
| **1** | Project Monorepo Setup | Musa | `chore: initialize monorepo with laravel and react #1` |
| **2** | Docker Development Environment | Musa | `feat(docker): add development environment with mysql and node #2` |
| **3** | Database Schema - Users & Roles | Musa | `feat(db): create users table with role-based enum #3` |
| **4** | React Frontend Boilerplate | Ahbab & Ishtiak | `feat(frontend): setup react router, bootstrap, and layout components #4` |
| **5** | JWT Authentication Backend | Musa | `feat(auth): implement jwt authentication with multi-role support #5` |
| **6** | Registration & Login Frontend | Ahbab & Ishtiak | `feat(auth): create login and registration pages with validation #6` |
| **7** | Profile Schema - Job Seeker | Shadman | `feat(profile): create job seeker profile schema and relationships #7` |
| **8** | Profile Schema - Employer | Shadman | `feat(profile): create employer profile schema and relationships #8` |
| **9** | Profile Schema - Mentor | Shadman | `feat(profile): create mentor profile schema and relationships #9` |
| **10** | Skills Schema & Tagging | Musa | `feat(skills): create skills schema and user-skill relationships #10` |
| **11** | Profile Pages Frontend | Ahbab & Ishtiak | `feat(profile): create role-based profile pages with forms #11` |
| **12** | Role-Based Dashboard Layouts | Ahbab & Ishtiak | `feat(dashboard): create role-based dashboard layouts #12` |
| **13** | Navigation Components | Ahbab | `feat(ui): create reusable navigation components #13` |
| **14** | UI Component Library | Ishtiak | `feat(ui): create reusable component library #14` |
| **15** | Form Components & Validation | Ahbab & Ishtiak | `feat(forms): create form components with validation #15` |

---

## 🏷️ MILESTONE 2: Job Portal Core (13 Issues)

| # | Issue Title | Assignee | Commit Message |
|---|-------------|----------|----------------|
| **16** | Jobs Schema & CRUD Backend | Shadman | `feat(jobs): create jobs schema and employer crud operations #16` |
| **17** | Job Posting Form Frontend | Ahbab | `feat(jobs): create multi-step job posting form #17` |
| **18** | Job Listing & Filtering Backend | Shadman | `feat(jobs): create job listing api with filtering and search #18` |
| **19** | Job Browser & Search Frontend | Ishtiak | `feat(jobs): create job browser with filters and search #19` |
| **20** | Job Management for Employers | Ahbab & Ishtiak | `feat(jobs): create employer job management dashboard #20` |
| **21** | Applications Schema & Apply Backend | Shadman | `feat(applications): create applications schema and apply endpoint #21` |
| **22** | Job Application Form Frontend | Ishtiak | `feat(applications): create job application form #22` |
| **23** | Applicant Management for Employers | Ahbab | `feat(applications): create employer applicant management #23` |
| **24** | Application Tracking for Job Seekers | Ishtiak | `feat(applications): create job seeker application tracking #24` |
| **25** | Job-Skill Relationship Backend | Shadman | `feat(matching): create job-skill relationship and matching foundation #25` |
| **26** | Skill Match Algorithm | Musa | `feat(matching): implement skill matching algorithm with percentage score #26` |
| **27** | Match Display Frontend | Ahbab | `feat(matching): display match scores and missing skills in ui #27` |
| **28** | Job Recommendations Backend | Shadman | `feat(recommendations): create job recommendation system based on skills #28` |

---

## 🏷️ MILESTONE 3: Mentorship & Finalization (12 Issues)

| # | Issue Title | Assignee | Commit Message |
|---|-------------|----------|----------------|
| **29** | Forum Schema Backend | Musa | `feat(forum): create forum posts and replies schema #29` |
| **30** | Forum API Endpoints | Musa | `feat(forum): create crud api endpoints for forum #30` |
| **31** | Forum UI - List & Detail | Ahbab | `feat(forum): create forum listing and detail pages #31` |
| **32** | Mentor Dashboard - Forum Management | Ishtiak | `feat(mentor): create mentor forum management dashboard #32` |
| **33** | Notification System | Musa & Shadman | `feat(notifications): create notification system for forum interactions #33` |
| **34** | Admin Dashboard Backend | Musa | `feat(admin): create admin dashboard backend with analytics #34` |
| **35** | Admin Dashboard Frontend | Ahbab | `feat(admin): create admin dashboard frontend #35` |
| **36** | Testing - Backend Unit Tests | Shadman | `test: add comprehensive backend unit tests #36` |
| **37** | Testing - Frontend Component Tests | Ishtiak | `test: add frontend component tests #37` |
| **38** | API Documentation | Musa | `docs: create comprehensive api documentation with swagger #38` |
| **39** | Performance Optimization | Shadman & Ahbab | `perf: optimize application performance backend and frontend #39` |
| **40** | Deployment & Final Polish | All Team Members | `chore: prepare for deployment and final polish #40` |

---

## 👥 Team Member Workload Distribution

### Musa (Team Lead / Backend) - 10 Issues

| # | Issue Title | Commit Message |
|---|-------------|----------------|
| 1 | Project Monorepo Setup | `chore: initialize monorepo with laravel and react #1` |
| 2 | Docker Development Environment | `feat(docker): add development environment with mysql and node #2` |
| 3 | Database Schema - Users & Roles | `feat(db): create users table with role-based enum #3` |
| 5 | JWT Authentication Backend | `feat(auth): implement jwt authentication with multi-role support #5` |
| 10 | Skills Schema & Tagging | `feat(skills): create skills schema and user-skill relationships #10` |
| 26 | Skill Match Algorithm | `feat(matching): implement skill matching algorithm with percentage score #26` |
| 29 | Forum Schema Backend | `feat(forum): create forum posts and replies schema #29` |
| 30 | Forum API Endpoints | `feat(forum): create crud api endpoints for forum #30` |
| 34 | Admin Dashboard Backend | `feat(admin): create admin dashboard backend with analytics #34` |
| 38 | API Documentation | `docs: create comprehensive api documentation with swagger #38` |

### Shadman (Backend Developer) - 9 Issues

| # | Issue Title | Commit Message |
|---|-------------|----------------|
| 7 | Profile Schema - Job Seeker | `feat(profile): create job seeker profile schema and relationships #7` |
| 8 | Profile Schema - Employer | `feat(profile): create employer profile schema and relationships #8` |
| 9 | Profile Schema - Mentor | `feat(profile): create mentor profile schema and relationships #9` |
| 16 | Jobs Schema & CRUD Backend | `feat(jobs): create jobs schema and employer crud operations #16` |
| 18 | Job Listing & Filtering Backend | `feat(jobs): create job listing api with filtering and search #18` |
| 21 | Applications Schema & Apply Backend | `feat(applications): create applications schema and apply endpoint #21` |
| 25 | Job-Skill Relationship Backend | `feat(matching): create job-skill relationship and matching foundation #25` |
| 28 | Job Recommendations Backend | `feat(recommendations): create job recommendation system based on skills #28` |
| 36 | Testing - Backend Unit Tests | `test: add comprehensive backend unit tests #36` |

### Ahbab (Frontend Developer) - 9 Issues

| # | Issue Title | Commit Message |
|---|-------------|----------------|
| 4 | React Frontend Boilerplate | `feat(frontend): setup react router, bootstrap, and layout components #4` (with Ishtiak) |
| 6 | Registration & Login Frontend | `feat(auth): create login and registration pages with validation #6` (with Ishtiak) |
| 11 | Profile Pages Frontend | `feat(profile): create role-based profile pages with forms #11` (with Ishtiak) |
| 12 | Role-Based Dashboard Layouts | `feat(dashboard): create role-based dashboard layouts #12` (with Ishtiak) |
| 13 | Navigation Components | `feat(ui): create reusable navigation components #13` |
| 17 | Job Posting Form Frontend | `feat(jobs): create multi-step job posting form #17` |
| 20 | Job Management for Employers | `feat(jobs): create employer job management dashboard #20` (with Ishtiak) |
| 23 | Applicant Management for Employers | `feat(applications): create employer applicant management #23` |
| 31 | Forum UI - List & Detail | `feat(forum): create forum listing and detail pages #31` |

### Ishtiak (Frontend Developer) - 9 Issues

| # | Issue Title | Commit Message |
|---|-------------|----------------|
| 4 | React Frontend Boilerplate | `feat(frontend): setup react router, bootstrap, and layout components #4` (with Ahbab) |
| 6 | Registration & Login Frontend | `feat(auth): create login and registration pages with validation #6` (with Ahbab) |
| 11 | Profile Pages Frontend | `feat(profile): create role-based profile pages with forms #11` (with Ahbab) |
| 12 | Role-Based Dashboard Layouts | `feat(dashboard): create role-based dashboard layouts #12` (with Ahbab) |
| 14 | UI Component Library | `feat(ui): create reusable component library #14` |
| 15 | Form Components & Validation | `feat(forms): create form components with validation #15` (with Ahbab) |
| 19 | Job Browser & Search Frontend | `feat(jobs): create job browser with filters and search #19` |
| 22 | Job Application Form Frontend | `feat(applications): create job application form #22` |
| 24 | Application Tracking for Job Seekers | `feat(applications): create job seeker application tracking #24` |

### Shared/Collaborative Issues - 3 Issues

| # | Issue Title | Assignees | Commit Message |
|---|-------------|-----------|----------------|
| 33 | Notification System | Musa & Shadman | `feat(notifications): create notification system for forum interactions #33` |
| 39 | Performance Optimization | Shadman & Ahbab | `perf: optimize application performance backend and frontend #39` |
| 40 | Deployment & Final Polish | All Team Members | `chore: prepare for deployment and final polish #40` |

---

## 📊 Summary Statistics

| Team Member | Solo Issues | Shared Issues | Total Issues | Total Commits |
|-------------|-------------|---------------|--------------|---------------|
| **Musa** | 9 | 2 | 11 | ~11 |
| **Shadman** | 8 | 2 | 10 | ~10 |
| **Ahbab** | 6 | 4 | 10 | ~10 |
| **Ishtiak** | 6 | 4 | 10 | ~10 |
| **Total** | 29 | 12* | 41* | ~41 |

*Note: Shared issues count multiple times in individual totals but once in overall total

---

## 📅 Suggested Sprint Planning

### Sprint 1 (Weeks 1-2): Milestone 1 - Issues #1-10
- Focus: Setup, Auth, Basic Profiles
- 10 issues

### Sprint 2 (Weeks 3-4): Milestone 1 - Issues #11-15
- Focus: Frontend Polish, Components
- 5 issues

### Sprint 3 (Weeks 5-6): Milestone 2 - Issues #16-22
- Focus: Jobs Core
- 7 issues
- Note: Start only after Milestone 1 completion sign-off.

### Sprint 4 (Weeks 7-8): Milestone 2 - Issues #23-28
- Focus: Applications & Matching
- 6 issues
- Note: Start only after Milestone 1 completion sign-off.

### Sprint 5 (Weeks 9-10): Milestone 3 - Issues #29-35
- Focus: Forum & Admin
- 7 issues
- Note: Start only after Milestone 2 completion sign-off.

### Sprint 6 (Weeks 11-12): Milestone 3 - Issues #36-40
- Focus: Testing, Docs, Deployment
- 5 issues
- Note: Start only after Milestone 2 completion sign-off.

---

## 🏷️ Git Branch Naming Examples

```
feature/1-monorepo-setup
feature/5-jwt-authentication
feature/16-jobs-schema
feature/21-applications-schema
feature/29-forum-schema
fix/6-login-validation
docs/38-api-documentation
test/36-backend-tests
perf/39-performance-optimization
```

---

| # | Issue Title | Assignee(s) |
|---|-------------|-------------|
| **Milestone 1: Core Foundation & Authentication** | | |
| 1 | Project Monorepo Setup | Musa |
| 2 | Docker Development Environment | Musa |
| 3 | Database Schema – Users & Roles | Musa |
| 4 | React Frontend Boilerplate | Ahbab & Ishtiak |
| 5 | JWT Authentication Backend | Musa |
| 6 | Registration & Login Frontend | Ahbab & Ishtiak |
| 7 | Profile Schema – Job Seeker | Shadman |
| 8 | Profile Schema – Employer | Shadman |
| 9 | Profile Schema – Mentor | Shadman |
| 10 | Skills Schema & Tagging | Musa |
| 11 | Profile Pages Frontend | Ahbab & Ishtiak |
| 12 | Role‑Based Dashboard Layouts | Ahbab & Ishtiak |
| 13 | Navigation Components | Ahbab |
| 14 | UI Component Library | Ishtiak |
| 15 | Form Components & Validation | Ahbab & Ishtiak |
| **Milestone 2: Job Portal Core** | | |
| 16 | Jobs Schema & CRUD Backend | musa |
| 17 | Job Posting Form Frontend | Ahbab |
| 18 | Job Listing & Filtering Backend | musa |
| 19 | Job Browser & Search Frontend | Ishtiak |
| 20 | Job Management for Employers | Ahbab & Ishtiak |
| 21 | Applications Schema & Apply Backend | Shadman |
| 22 | Job Application Form Frontend | Ishtiak |
| 23 | Applicant Management for Employers | Ahbab |
| 24 | Application Tracking for Job Seekers | Ishtiak |
| 25 | Job‑Skill Relationship Backend | Shadman |
| 26 | Skill Match Algorithm | Musa |
| 27 | Match Display Frontend | Ahbab |
| 28 | Job Recommendations Backend | Shadman |
| **Milestone 3: Mentorship & Finalization** | | |
| 29 | Forum Schema Backend | Musa |
| 30 | Forum API Endpoints | Musa |
| 31 | Forum UI – List & Detail | Ahbab |
| 32 | Mentor Dashboard – Forum Management | Ishtiak |
| 33 | Notification System | Musa & Shadman |
| 34 | Admin Dashboard Backend | Musa |
| 35 | Admin Dashboard Frontend | Ahbab |
| 36 | Testing – Backend Unit Tests | Shadman |
| 37 | Testing – Frontend Component Tests | Ishtiak |
| 38 | API Documentation | Musa |
| 39 | Performance Optimization | Shadman & Ahbab |
| 40 | Deployment & Final Polish | All Team Members |



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
