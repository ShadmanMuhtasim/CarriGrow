# CarriGrow – A Job Portal with Mentorship & Skill Development

Carrigrow is a web-based job portal designed to help job seekers find opportunities while also supporting career growth through community-driven mentorship and skill development. The platform connects job seekers with employers for job applications and allows experienced professionals to guide users through mentorship discussions and career advice. It also includes basic skill matching between job requirements and user skills, along with role-based dashboards for a smooth user experience.

---

## Team Members

1. **Muskikim Musa**
   - Role: Team Lead
   - Email: mustakim.official.0101@gmail.com
   - ID: 20230104122

2. **Shadman Muhtasim**
   - Role: Back-end Developer
   - Email: nksoag2006@gmail.com
   - ID: 20230104110

3. **Ahbab Hassan**
   - Role: Front-end Developer
   - Email: hasan100.official@gmail.com
   - ID: 20230104119

4. **Eastiak Ahmed**
   - Role: Front-end Developer
   - Email: easteak.cse.20230104123@aust.edu
   - ID: 20230104123

---

## Target Audience
- Job seekers (students, fresh graduates, professionals)
- Employers / recruiters
- Mentors (industry professionals)
- Platform admin / moderators

---

## Tech Stack
- **Backend:** Laravel (REST API)
- **Database:** MySQL
- **Frontend:** React.js, Tailwind CSS / Bootstrap
- **Rendering Method:** Client-Side Rendering (CSR)

---

## UI Design (Figma)
- Mock UI is designed using Figma to visualize the overall layout and user flow
- Figma Link: https://www.figma.com/design/EwX7w0HBjSka7mZpk0IIcZ/Carrigrow?node-id=1647-26119&p=f&t=zicFKz6xB1k8OGfI-0

---

## Project Features

### Core Features
- Multi-role authentication system (Job Seeker, Employer, Mentor, Admin)
- JWT-based login & registration
- User profile management with skill tagging
- Job listings and application system
- Mentorship forum for guidance, Q&A, and discussions
- Basic skill-matching between job requirements and user skills
- Role-based dashboards for different users

### Job Listings & Applications
- Employers can create and manage job posts
- Job seekers can browse jobs, view details, and apply
- Application workflow: Applied → Reviewed → Shortlisted / Rejected

### User Profile & Skill Tagging
- Job seekers can maintain profiles (education, experience, skills)
- Skills are stored as tags for matching and filtering
- Profile supports portfolio links (optional)

### Mentorship Forum
- Job seekers can post questions and request guidance
- Mentors can answer, comment, and share resources
- Forum supports discussion threads for community learning

### Skill Matching System
- Job posts include required skills
- User profiles contain skill tags
- System shows match score (e.g., 60% matched) and missing skills list

### Dashboards (Role-Based)
- **Job Seeker Dashboard:** profile completion, job application tracking, saved posts / mentorship activity (optional)
- **Employer Dashboard:** posted jobs management, applicant list viewing
- **Mentor Dashboard:** forum contributions, mentorship activity overview
- **Admin Dashboard:** user management, content moderation (optional)

---

## CRUD Operations
- Users (Job Seekers, Employers, Mentors, Admin)
- User Profiles
- Skills (tags)
- Job Posts
- Job Applications
- Mentorship Forum Posts
- Replies / Comments

---

## API Endpoints (Approximate)

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Users & Profiles
- `GET /users/{id}`
- `PUT /users/{id}`
- `GET /skills`
- `POST /users/{id}/skills`

### Jobs
- `POST /jobs` (employer creates job)
- `GET /jobs` (browse jobs + filters)
- `GET /jobs/{id}`
- `PUT /jobs/{id}` (update job)
- `DELETE /jobs/{id}` (delete job)

### Applications
- `POST /jobs/{id}/apply` (job seeker applies)
- `GET /applications` (role-based list)
- `GET /jobs/{id}/applications` (employer views applicants)
- `PUT /applications/{id}/status` (update status)

### Mentorship Forum
- `GET /forum/posts`
- `POST /forum/posts`
- `GET /forum/posts/{id}`
- `POST /forum/posts/{id}/replies`
- `DELETE /forum/posts/{id}` (admin/mod)

### Skill Matching
- `GET /jobs/{id}/match-score`

---

## Milestones

### Milestone 1: Core Foundation & Authentication
- Setup monorepo (Laravel backend + React frontend)
- Configure MySQL database
- Implement JWT-based authentication for all roles
- Create basic UI layout (Navbar, Sidebar, Role-based dashboards)
- Implement user profile + skill tagging system

### Milestone 2: Job Portal Core
- Employer job posting CRUD
- Job browsing + filtering + search
- Job application system
- Employer applicant management dashboard
- Application status tracking

### Milestone 3: Mentorship + Matching + Finalization
- Mentorship forum (posts + replies)
- Basic skill matching score + missing skills suggestion
- Admin moderation features (optional)
- Performance optimization
- Final testing, bug fixing, and deployment

---

# Starter Template Notes

This project follows a full-stack starter template layout with separate `client/`, `server/`, and (optional) `database/` directories.

## Project Structure

```
project-root/
├── client/    # Frontend application (React)
├── server/    # Backend application (Laravel API)
└── database/  # Migrations/seeders/SQL scripts (optional)
```

## Prerequisites
- PHP >= 8.1
- Composer
- Node.js >= 18
- npm or Yarn
- MySQL (or PostgreSQL / SQLite)

## Setup (Quick)
1) Backend:
- `cd server`
- `composer install`
- copy `.env.example` to `.env` and set DB credentials
- `php artisan key:generate`
- `php artisan migrate`
- `php artisan serve`

2) Frontend:
- `cd client`
- `npm install`
- `npm run dev`
