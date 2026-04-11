-- CarriGrow runtime schema sync (non-destructive)
-- Purpose: align existing Docker MySQL volumes with new schema additions
-- Date: 2026-04-11

SET @has_forum_posts_deleted_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'deleted_at'
);
SET @sql := IF(
  @has_forum_posts_deleted_at = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL AFTER `updated_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_deleted_at_index := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND INDEX_NAME = 'forum_posts_deleted_at_index'
);
SET @sql := IF(
  @has_forum_posts_deleted_at_index = 0,
  'CREATE INDEX `forum_posts_deleted_at_index` ON `forum_posts` (`deleted_at`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_type := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'type'
);
SET @sql := IF(
  @has_forum_posts_type = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `type` enum(''question'',''discussion'',''resource'') NOT NULL DEFAULT ''discussion'' AFTER `content`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_views_count := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'views_count'
);
SET @sql := IF(
  @has_forum_posts_views_count = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `views_count` int(10) unsigned NOT NULL DEFAULT 0 AFTER `type`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_replies_count := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'replies_count'
);
SET @sql := IF(
  @has_forum_posts_replies_count = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `replies_count` int(10) unsigned NOT NULL DEFAULT 0 AFTER `views_count`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_likes_count := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'likes_count'
);
SET @sql := IF(
  @has_forum_posts_likes_count = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `likes_count` int(10) NOT NULL DEFAULT 0 AFTER `replies_count`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_is_pinned := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'is_pinned'
);
SET @sql := IF(
  @has_forum_posts_is_pinned = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `is_pinned` tinyint(1) NOT NULL DEFAULT 0 AFTER `likes_count`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_is_solved := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'is_solved'
);
SET @sql := IF(
  @has_forum_posts_is_solved = 0,
  'ALTER TABLE `forum_posts` ADD COLUMN `is_solved` tinyint(1) NOT NULL DEFAULT 0 AFTER `is_pinned`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `forum_posts`
SET `status` = 'published'
WHERE `status` NOT IN ('published', 'hidden', 'deleted');

SET @status_is_enum := (
  SELECT DATA_TYPE = 'enum'
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND COLUMN_NAME = 'status'
  LIMIT 1
);
SET @sql := IF(
  @status_is_enum = 1,
  'SELECT 1',
  'ALTER TABLE `forum_posts` MODIFY COLUMN `status` enum(''published'',''hidden'',''deleted'') NOT NULL DEFAULT ''published'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_type_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND INDEX_NAME = 'forum_posts_type_index'
);
SET @sql := IF(
  @has_forum_posts_type_index = 0,
  'CREATE INDEX `forum_posts_type_index` ON `forum_posts` (`type`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_is_pinned_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND INDEX_NAME = 'forum_posts_is_pinned_index'
);
SET @sql := IF(
  @has_forum_posts_is_pinned_index = 0,
  'CREATE INDEX `forum_posts_is_pinned_index` ON `forum_posts` (`is_pinned`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_is_solved_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND INDEX_NAME = 'forum_posts_is_solved_index'
);
SET @sql := IF(
  @has_forum_posts_is_solved_index = 0,
  'CREATE INDEX `forum_posts_is_solved_index` ON `forum_posts` (`is_solved`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_posts_likes_count_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_posts'
    AND INDEX_NAME = 'forum_posts_likes_count_index'
);
SET @sql := IF(
  @has_forum_posts_likes_count_index = 0,
  'CREATE INDEX `forum_posts_likes_count_index` ON `forum_posts` (`likes_count`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_replies_is_solution := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_replies'
    AND COLUMN_NAME = 'is_solution'
);
SET @sql := IF(
  @has_forum_replies_is_solution = 0,
  'ALTER TABLE `forum_replies` ADD COLUMN `is_solution` tinyint(1) NOT NULL DEFAULT 0 AFTER `content`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_forum_replies_is_solution_index := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'forum_replies'
    AND INDEX_NAME = 'forum_replies_is_solution_index'
);
SET @sql := IF(
  @has_forum_replies_is_solution_index = 0,
  'CREATE INDEX `forum_replies_is_solution_index` ON `forum_replies` (`is_solution`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `forum_post_votes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `direction` enum('up','down') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `forum_post_votes_post_id_user_id_unique` (`post_id`,`user_id`),
  KEY `forum_post_votes_user_id_index` (`user_id`),
  KEY `forum_post_votes_direction_index` (`direction`),
  CONSTRAINT `forum_post_votes_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_post_votes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `actor_id` bigint(20) unsigned DEFAULT NULL,
  `type` enum('forum_new_reply_to_post','forum_solution_marked','forum_question_in_expertise','forum_mention') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `post_id` bigint(20) unsigned DEFAULT NULL,
  `reply_id` bigint(20) unsigned DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_index` (`user_id`),
  KEY `notifications_actor_id_index` (`actor_id`),
  KEY `notifications_type_index` (`type`),
  KEY `notifications_read_at_index` (`read_at`),
  KEY `notifications_user_id_read_at_index` (`user_id`,`read_at`),
  KEY `notifications_post_id_index` (`post_id`),
  KEY `notifications_reply_id_index` (`reply_id`),
  KEY `notifications_created_at_index` (`created_at`),
  CONSTRAINT `notifications_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_reply_id_foreign` FOREIGN KEY (`reply_id`) REFERENCES `forum_replies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `content_reports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `content_type` enum('forum_post','forum_reply') NOT NULL,
  `content_id` bigint(20) unsigned NOT NULL,
  `reported_by` bigint(20) unsigned DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('pending','approved','removed') NOT NULL DEFAULT 'pending',
  `reviewed_by` bigint(20) unsigned DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `content_reports_content_type_content_id_index` (`content_type`,`content_id`),
  KEY `content_reports_status_index` (`status`),
  KEY `content_reports_reported_by_index` (`reported_by`),
  KEY `content_reports_reviewed_by_index` (`reviewed_by`),
  CONSTRAINT `content_reports_reported_by_foreign` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `content_reports_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_reports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `type` enum('weekly','monthly','custom') NOT NULL,
  `status` enum('ready','processing') NOT NULL DEFAULT 'ready',
  `generated_by` bigint(20) unsigned DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_reports_type_index` (`type`),
  KEY `admin_reports_status_index` (`status`),
  KEY `admin_reports_generated_by_index` (`generated_by`),
  KEY `admin_reports_generated_at_index` (`generated_at`),
  CONSTRAINT `admin_reports_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
