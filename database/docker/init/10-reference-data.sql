-- CarriGrow database-first reference data.
-- Sample login password for all demo users: password

START TRANSACTION;

INSERT INTO `skills` (`id`, `name`, `category`, `created_at`, `updated_at`) VALUES
  (1, 'Laravel', 'framework', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (2, 'PHP', 'programming_language', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (3, 'MySQL', 'database', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (4, 'React', 'framework', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (5, 'TypeScript', 'programming_language', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (6, 'JavaScript', 'programming_language', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 'Bootstrap', 'framework', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (8, 'REST API Design', 'backend', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (9, 'JWT Authentication', 'backend', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (10, 'Git', 'tooling', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (11, 'Problem Solving', 'soft_skill', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (12, 'Communication', 'soft_skill', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (13, 'Mentorship', 'soft_skill', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (14, 'Interview Preparation', 'career', '2026-03-11 00:00:00', '2026-03-11 00:00:00');

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES
  (1, 'Admin 1', 'admin1@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'admin', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (2, 'Admin 2', 'admin2@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'admin', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (3, 'Admin 3', 'admin3@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'admin', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (4, 'Admin 4', 'admin4@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'admin', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (5, 'Sample Employer', 'employer@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'employer', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (6, 'Sample Mentor', 'mentor@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'mentor', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 'Sample Job Seeker', 'jobseeker@carrigrow.com', NULL, '$2y$10$HZlOKht2jTV4nUJWppM8H.nDMHqYuEmX7.70CaNTMdb7VyApGmnjO', 'job_seeker', 'active', NULL, '2026-03-11 00:00:00', '2026-03-11 00:00:00');

INSERT INTO `employer_profiles` (
  `id`, `user_id`, `company_name`, `company_website`, `company_logo_url`, `company_description`,
  `industry`, `company_size`, `founded_year`, `headquarters_location`, `contact_email`,
  `contact_phone`, `created_at`, `updated_at`
) VALUES
  (
    1, 5, 'Sample Company', 'https://example.com', 'https://example.com/logo.png',
    'Demo employer profile for local development.',
    'Software', '51-200', 2018, 'Dhaka, Bangladesh', 'hr@example.com',
    '+8801700000000', '2026-03-11 00:00:00', '2026-03-11 00:00:00'
  );

INSERT INTO `mentor_profiles` (
  `id`, `user_id`, `current_position`, `company`, `years_of_experience`, `expertise_areas`, `bio`,
  `linkedin_url`, `calendly_link`, `availability`, `mentorship_areas`, `hourly_rate`, `created_at`, `updated_at`
) VALUES
  (
    1, 6, 'Senior Software Engineer', 'CareerBridge Ltd', 8,
    '["Laravel","System Design","Interview Coaching"]',
    'Guides early-career developers through job search and portfolio building.',
    'https://linkedin.com/in/samplementor',
    'https://calendly.com/samplementor/30min',
    '["Sat 10:00-12:00","Mon 20:00-22:00"]',
    '["Career Strategy","Resume Review","Mock Interview"]',
    25.00, '2026-03-11 00:00:00', '2026-03-11 00:00:00'
  );

INSERT INTO `job_seeker_profiles` (
  `id`, `user_id`, `phone`, `location`, `bio`, `education`, `experience`, `resume_url`, `portfolio_url`,
  `linkedin_url`, `github_url`, `date_of_birth`, `gender`, `created_at`, `updated_at`
) VALUES
  (
    1, 7, '+8801800000000', 'Dhaka, Bangladesh',
    'Aspiring software engineer looking for internship and entry-level roles.',
    '["BSc in CSE - AUST (2023-2027)"]',
    '["Built Laravel+React portfolio projects","Completed API-focused academic project"]',
    'https://example.com/resume.pdf',
    'https://portfolio.example.com',
    'https://linkedin.com/in/example',
    'https://github.com/example',
    '2003-06-15',
    'male',
    '2026-03-11 00:00:00',
    '2026-03-11 00:00:00'
  );

INSERT INTO `skill_user` (`user_id`, `skill_id`, `proficiency_level`, `created_at`, `updated_at`) VALUES
  (7, 1, 'advanced', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 3, 'intermediate', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 4, 'intermediate', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 11, 'advanced', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (7, 12, 'advanced', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (6, 1, 'expert', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (6, 8, 'expert', '2026-03-11 00:00:00', '2026-03-11 00:00:00'),
  (6, 14, 'advanced', '2026-03-11 00:00:00', '2026-03-11 00:00:00');

COMMIT;
