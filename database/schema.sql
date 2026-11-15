-- =============================================================================
-- SheetSentry — Production Relational Database Schema (MySQL 8.0+ / phpMyAdmin)
-- Source of Truth: Figma "04 User and Admin Flows" (Node 136:1565 & Node 2:4)
-- Architecture Decision: InnoDB, utf8mb4, utf8mb4_0900_ai_ci
-- Total Tables: 42 across 7 Cohesive Architectural Domains
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `sheetsentry` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `sheetsentry`;

-- =============================================================================
-- DOMAIN 1: IDENTITY, AUTH & SESSIONS (8 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `login_attempts`;
DROP TABLE IF EXISTS `email_verification_tokens`;
DROP TABLE IF EXISTS `oauth_accounts`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `user_mfa_recovery_codes`;
DROP TABLE IF EXISTS `user_mfa_factors`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `users`;

-- 1. Users
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL COMMENT 'UUID v4',
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Argon2id or bcrypt hash; NULL for OAuth-only',
  `full_name` VARCHAR(160) NOT NULL,
  `status` ENUM('ACTIVE', 'LOCKED', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'PENDING',
  `failed_login_count` INT NOT NULL DEFAULT 0,
  `locked_until` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Core user accounts';

-- 2. User Sessions
CREATE TABLE `user_sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 of session bearer token',
  `ip_address` VARCHAR(45) NOT NULL COMMENT 'IPv4 or IPv6',
  `user_agent` TEXT DEFAULT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `revoked_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sessions_token_hash` (`token_hash`),
  KEY `idx_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Active web and API sessions';

-- 3. MFA Factors
CREATE TABLE `user_mfa_factors` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `factor_type` ENUM('TOTP', 'WEBAUTHN') NOT NULL,
  `secret_encrypted` TEXT NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mfa_user_id` (`user_id`),
  CONSTRAINT `fk_mfa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User two-factor authentication devices';

-- 4. MFA Recovery Codes
CREATE TABLE `user_mfa_recovery_codes` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `code_hash` VARCHAR(64) NOT NULL,
  `used_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mfa_rec_user` (`user_id`),
  CONSTRAINT `fk_mfa_rec_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='One-time recovery codes';

-- 5. Password Reset Tokens
CREATE TABLE `password_reset_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `consumed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pwd_reset_token` (`token_hash`),
  KEY `idx_pwd_reset_user` (`user_id`),
  CONSTRAINT `fk_pwd_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Password recovery tokens';

-- 6. OAuth Accounts
CREATE TABLE `oauth_accounts` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `provider` ENUM('GOOGLE', 'GITHUB', 'MICROSOFT') NOT NULL,
  `provider_account_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_oauth_provider_id` (`provider`, `provider_account_id`),
  KEY `idx_oauth_user` (`user_id`),
  CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Federated SSO linkages';

-- 7. Email Verification Tokens
CREATE TABLE `email_verification_tokens` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email_verify_token` (`token_hash`),
  KEY `idx_email_verify_user` (`user_id`),
  CONSTRAINT `fk_email_verify_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Signup email confirmation';

-- 8. Login Attempts
CREATE TABLE `login_attempts` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `outcome` ENUM('SUCCESS', 'INVALID_PASSWORD', 'MFA_FAILED', 'LOCKED') NOT NULL,
  `attempted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_attempts_email` (`email`, `attempted_at`),
  KEY `idx_login_attempts_ip` (`ip_address`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Brute force rate limiting and audit';

-- =============================================================================
-- DOMAIN 2: WORKSPACES, MEMBERSHIPS & API KEYS (4 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `workspace_api_keys`;
DROP TABLE IF EXISTS `workspace_invitations`;
DROP TABLE IF EXISTS `workspace_memberships`;
DROP TABLE IF EXISTS `workspaces`;

-- 9. Workspaces
CREATE TABLE `workspaces` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `owner_user_id` CHAR(36) NOT NULL,
  `default_currency` ENUM('USD', 'PHP') NOT NULL DEFAULT 'USD',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_workspaces_slug` (`slug`),
  KEY `idx_workspaces_owner` (`owner_user_id`),
  CONSTRAINT `fk_workspaces_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Multi-tenant workspace isolation';

-- 10. Workspace Memberships
CREATE TABLE `workspace_memberships` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role` ENUM('OWNER', 'ADMIN', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'EDITOR',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_workspace_user` (`workspace_id`, `user_id`),
  KEY `idx_memberships_user` (`user_id`),
  CONSTRAINT `fk_member_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Workspace role assignments';

-- 11. Workspace Invitations
CREATE TABLE `workspace_invitations` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'EDITOR',
  `token_hash` VARCHAR(64) NOT NULL,
  `invited_by_user_id` CHAR(36) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invitations_token` (`token_hash`),
  KEY `idx_invitations_workspace` (`workspace_id`),
  CONSTRAINT `fk_invite_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Pending workspace invites';

-- 12. Workspace API Keys
CREATE TABLE `workspace_api_keys` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `key_prefix` VARCHAR(16) NOT NULL COMMENT 'Display prefix e.g. ss_live_ab12',
  `key_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 of raw secret key',
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `revoked_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_keys_hash` (`key_hash`),
  KEY `idx_api_keys_workspace` (`workspace_id`),
  CONSTRAINT `fk_api_keys_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Programmatic API credentials';

-- =============================================================================
-- DOMAIN 3: PLANS, SUBSCRIPTIONS & MULTI-CURRENCY BILLING (6 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `refund_requests`;
DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `subscription_usage_counters`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `plans`;

-- 13. Plans
CREATE TABLE `plans` (
  `id` VARCHAR(32) NOT NULL COMMENT 'e.g. free, starter, pro',
  `name` VARCHAR(64) NOT NULL,
  `price_usd` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `price_php` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `max_file_size_mb` INT NOT NULL,
  `max_rows` INT NOT NULL,
  `monthly_validations_limit` INT NULL DEFAULT NULL COMMENT 'NULL for unlimited',
  `max_profiles` INT NOT NULL DEFAULT 1,
  `max_seats` INT NOT NULL DEFAULT 1,
  `retention_days` INT NOT NULL DEFAULT 7,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='SaaS subscription plans catalog';

-- 14. Subscriptions
CREATE TABLE `subscriptions` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `plan_id` VARCHAR(32) NOT NULL,
  `billing_currency` ENUM('USD', 'PHP') NOT NULL DEFAULT 'USD',
  `status` ENUM('ACTIVE', 'PAST_DUE', 'GRACE_PERIOD', 'CANCELED') NOT NULL DEFAULT 'ACTIVE',
  `current_period_start` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `current_period_end` TIMESTAMP NOT NULL,
  `downgrade_grace_until` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscription_workspace` (`workspace_id`),
  KEY `idx_sub_plan` (`plan_id`),
  CONSTRAINT `fk_sub_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Active customer subscription state';

-- 15. Subscription Usage Counters
CREATE TABLE `subscription_usage_counters` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `period_ym` CHAR(7) NOT NULL COMMENT 'Format YYYY-MM',
  `validations_used` INT NOT NULL DEFAULT 0,
  `storage_bytes_used` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usage_workspace_period` (`workspace_id`, `period_ym`),
  CONSTRAINT `fk_usage_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Monthly meter tracking';

-- 16. Invoices
CREATE TABLE `invoices` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `subscription_id` CHAR(36) NOT NULL,
  `currency` ENUM('USD', 'PHP') NOT NULL DEFAULT 'USD',
  `amount_total` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('PAID', 'OPEN', 'VOID', 'UNCOLLECTIBLE') NOT NULL DEFAULT 'OPEN',
  `issued_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoices_workspace` (`workspace_id`),
  CONSTRAINT `fk_invoice_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Billing invoices';

-- 17. Payment Transactions (Segregated Currency Ledger)
CREATE TABLE `payment_transactions` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `invoice_id` CHAR(36) DEFAULT NULL,
  `gateway` ENUM('STRIPE', 'PAYMONGO') NOT NULL,
  `currency` ENUM('USD', 'PHP') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `fx_rate_reference` DECIMAL(10, 4) NULL DEFAULT 55.0000 COMMENT 'Fixed reference 1 USD = 55 PHP',
  `status` VARCHAR(32) NOT NULL DEFAULT 'SETTLED',
  `external_reference` VARCHAR(120) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_workspace` (`workspace_id`),
  KEY `idx_transactions_currency` (`currency`, `created_at`),
  CONSTRAINT `fk_tx_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Segregated transaction ledger';

-- 18. Refund Requests
CREATE TABLE `refund_requests` (
  `id` CHAR(36) NOT NULL,
  `transaction_id` CHAR(36) NOT NULL,
  `currency` ENUM('USD', 'PHP') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `reason` TEXT NOT NULL,
  `initiated_by_admin_id` CHAR(36) NOT NULL,
  `approved_by_admin_id` CHAR(36) DEFAULT NULL,
  `requires_dual_approval` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('PENDING_SECOND_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSED') NOT NULL DEFAULT 'PENDING_SECOND_APPROVAL',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refund_transaction` (`transaction_id`),
  CONSTRAINT `fk_refund_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Dual-approval refund workflow (> $500)';

-- =============================================================================
-- DOMAIN 4: FILE UPLOADS, STORAGE & PREFLIGHT (6 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `quarantine_incidents`;
DROP TABLE IF EXISTS `storage_lifecycle_events`;
DROP TABLE IF EXISTS `upload_detected_columns`;
DROP TABLE IF EXISTS `upload_worksheets`;
DROP TABLE IF EXISTS `upload_preflight_checks`;
DROP TABLE IF EXISTS `uploaded_files`;

-- 19. Uploaded Files
CREATE TABLE `uploaded_files` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `uploaded_by_user_id` CHAR(36) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `extension` VARCHAR(16) NOT NULL,
  `size_bytes` BIGINT NOT NULL,
  `sha256_checksum` CHAR(64) NOT NULL,
  `storage_tier` ENUM('QUARANTINE', 'ACTIVE', 'ARCHIVE', 'PURGED') NOT NULL DEFAULT 'QUARANTINE',
  `legal_hold` TINYINT(1) NOT NULL DEFAULT 0,
  `retention_expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_files_workspace` (`workspace_id`),
  KEY `idx_files_checksum` (`sha256_checksum`),
  CONSTRAINT `fk_files_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Spreadsheet files repository';

-- 20. Upload Preflight Checks
CREATE TABLE `upload_preflight_checks` (
  `id` CHAR(36) NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `magic_bytes_hex` VARCHAR(24) NOT NULL,
  `magic_bytes_valid` TINYINT(1) NOT NULL,
  `detected_encoding` VARCHAR(32) NOT NULL,
  `detected_delimiter` VARCHAR(8) NOT NULL,
  `zip_expansion_ratio` DECIMAL(6, 2) NOT NULL DEFAULT 1.00,
  `av_scan_status` ENUM('CLEAN', 'INFECTED', 'SKIPPED') NOT NULL DEFAULT 'CLEAN',
  `inspected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_preflight_file` (`file_id`),
  CONSTRAINT `fk_preflight_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Pre-validation security checks';

-- 21. Upload Worksheets
CREATE TABLE `upload_worksheets` (
  `id` CHAR(36) NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `sheet_index` INT NOT NULL DEFAULT 0,
  `sheet_name` VARCHAR(160) NOT NULL,
  `row_count` INT NOT NULL DEFAULT 0,
  `column_count` INT NOT NULL DEFAULT 0,
  `header_row_index` INT NOT NULL DEFAULT 1,
  `is_selected` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_worksheets_file` (`file_id`),
  CONSTRAINT `fk_worksheets_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sheets within Excel or CSV workbooks';

-- 22. Upload Detected Columns
CREATE TABLE `upload_detected_columns` (
  `id` CHAR(36) NOT NULL,
  `worksheet_id` CHAR(36) NOT NULL,
  `column_index` INT NOT NULL,
  `header_name` VARCHAR(160) NOT NULL,
  `inferred_type` VARCHAR(32) NOT NULL,
  `null_ratio` DECIMAL(5, 4) NOT NULL DEFAULT 0.0000,
  `sample_values_json` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detected_cols_ws` (`worksheet_id`),
  CONSTRAINT `fk_cols_worksheet` FOREIGN KEY (`worksheet_id`) REFERENCES `upload_worksheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Schema inferred headers';

-- 23. Storage Lifecycle Events
CREATE TABLE `storage_lifecycle_events` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `from_tier` VARCHAR(32) NOT NULL,
  `to_tier` VARCHAR(32) NOT NULL,
  `actor_type` VARCHAR(32) NOT NULL,
  `occurred_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_storage_events_file` (`file_id`),
  CONSTRAINT `fk_storage_events_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Quarantine and retention lifecycle';

-- 24. Quarantine Incidents
CREATE TABLE `quarantine_incidents` (
  `id` CHAR(36) NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `threat_type` ENUM('ZIP_BOMB', 'FORMULA_INJECTION_MASS', 'MALWARE_SIGNATURE', 'MIME_SPOOF') NOT NULL,
  `severity` VARCHAR(16) NOT NULL DEFAULT 'CRITICAL',
  `resolution_status` VARCHAR(32) NOT NULL DEFAULT 'BLOCKED',
  `detected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quarantine_file` (`file_id`),
  CONSTRAINT `fk_quarantine_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Security threat log';

-- =============================================================================
-- DOMAIN 5: VALIDATION PROFILES, RULES & MAPPING (6 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `profile_templates_catalog`;
DROP TABLE IF EXISTS `rule_sandbox_runs`;
DROP TABLE IF EXISTS `column_mappings`;
DROP TABLE IF EXISTS `validation_rules`;
DROP TABLE IF EXISTS `validation_profile_versions`;
DROP TABLE IF EXISTS `validation_profiles`;

-- 25. Validation Profiles
CREATE TABLE `validation_profiles` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `target_domain` VARCHAR(64) NOT NULL DEFAULT 'Sales & Invoicing',
  `current_version` INT NOT NULL DEFAULT 1,
  `is_locked_by_downgrade` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_profiles_workspace` (`workspace_id`),
  CONSTRAINT `fk_profiles_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Named validation rule sets';

-- 26. Validation Profile Versions
CREATE TABLE `validation_profile_versions` (
  `id` CHAR(36) NOT NULL,
  `profile_id` CHAR(36) NOT NULL,
  `version_number` INT NOT NULL,
  `changelog_summary` TEXT DEFAULT NULL,
  `published_by_user_id` CHAR(36) NOT NULL,
  `published_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profile_version` (`profile_id`, `version_number`),
  CONSTRAINT `fk_version_profile` FOREIGN KEY (`profile_id`) REFERENCES `validation_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Immutable published rule versions';

-- 27. Validation Rules
CREATE TABLE `validation_rules` (
  `id` CHAR(36) NOT NULL,
  `profile_version_id` CHAR(36) NOT NULL,
  `target_field` VARCHAR(120) NOT NULL,
  `rule_type` ENUM('REQUIRED', 'DATA_TYPE', 'REGEX', 'UNIQUE', 'RANGE', 'ENUM', 'CROSS_COLUMN') NOT NULL,
  `severity` ENUM('CRITICAL', 'WARNING') NOT NULL,
  `blocks_processing` TINYINT(1) NOT NULL DEFAULT 0,
  `parameters_json` JSON DEFAULT NULL,
  `error_message_template` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rules_profile_version` (`profile_version_id`),
  CONSTRAINT `fk_rules_version` FOREIGN KEY (`profile_version_id`) REFERENCES `validation_profile_versions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Individual column validation checks';

-- 28. Column Mappings
CREATE TABLE `column_mappings` (
  `id` CHAR(36) NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `profile_version_id` CHAR(36) NOT NULL,
  `mapping_json` JSON NOT NULL,
  `unmapped_required_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mappings_file` (`file_id`),
  CONSTRAINT `fk_map_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Worksheet to rule field associations';

-- 29. Rule Sandbox Runs
CREATE TABLE `rule_sandbox_runs` (
  `id` CHAR(36) NOT NULL,
  `profile_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `sample_rows_json` JSON NOT NULL,
  `evaluation_output_json` JSON NOT NULL,
  `executed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sandbox_profile` (`profile_id`),
  CONSTRAINT `fk_sandbox_profile` FOREIGN KEY (`profile_id`) REFERENCES `validation_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Interactive rule builder evaluations';

-- 30. Profile Templates Catalog
CREATE TABLE `profile_templates_catalog` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `default_rules_json` JSON NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='System starter templates';

-- =============================================================================
-- DOMAIN 6: VALIDATION JOBS, RESULTS & REPORTS (4 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `dead_letter_queue_items`;
DROP TABLE IF EXISTS `validation_reports`;
DROP TABLE IF EXISTS `validation_job_issues`;
DROP TABLE IF EXISTS `validation_jobs`;

-- 31. Validation Jobs
CREATE TABLE `validation_jobs` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `file_id` CHAR(36) NOT NULL,
  `profile_version_id` CHAR(36) NOT NULL,
  `state` ENUM('UPLOADED', 'SCANNING', 'VALIDATING', 'SCORING', 'COMPLETED', 'FAILED', 'QUARANTINED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'UPLOADED',
  `total_rows_evaluated` INT NOT NULL DEFAULT 0,
  `critical_rows_count` INT NOT NULL DEFAULT 0,
  `warning_rows_count` INT NOT NULL DEFAULT 0,
  `data_quality_score` DECIMAL(5, 2) NULL DEFAULT NULL,
  `validation_grade` ENUM('A', 'B', 'C', 'FAIL', 'NA') NOT NULL DEFAULT 'NA',
  `processing_eligibility` ENUM('ELIGIBLE', 'REVIEW_REQUIRED', 'BLOCKED_CRITICAL') NOT NULL DEFAULT 'ELIGIBLE',
  `worker_node_id` VARCHAR(64) DEFAULT NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_workspace` (`workspace_id`),
  KEY `idx_jobs_file` (`file_id`),
  KEY `idx_jobs_state` (`state`),
  CONSTRAINT `fk_jobs_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jobs_file` FOREIGN KEY (`file_id`) REFERENCES `uploaded_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Validation job state machine';

-- 32. Validation Job Issues
CREATE TABLE `validation_job_issues` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `job_id` CHAR(36) NOT NULL,
  `rule_id` CHAR(36) DEFAULT NULL,
  `row_number` INT NOT NULL,
  `column_name` VARCHAR(160) NOT NULL,
  `severity` ENUM('CRITICAL', 'WARNING') NOT NULL,
  `raw_value_masked` VARCHAR(255) DEFAULT NULL,
  `formula_neutralized` TINYINT(1) NOT NULL DEFAULT 0,
  `message` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_job_issues_job` (`job_id`, `severity`),
  KEY `idx_job_issues_row` (`job_id`, `row_number`),
  CONSTRAINT `fk_issues_job` FOREIGN KEY (`job_id`) REFERENCES `validation_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cell-level issues identified';

-- 33. Validation Reports
CREATE TABLE `validation_reports` (
  `id` CHAR(36) NOT NULL,
  `job_id` CHAR(36) NOT NULL,
  `report_type` ENUM('SANITIZED_CSV', 'ERROR_ONLY_CSV', 'EXECUTIVE_SUMMARY_JSON') NOT NULL,
  `storage_key` VARCHAR(255) NOT NULL,
  `sha256_checksum` CHAR(64) NOT NULL,
  `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_job` (`job_id`),
  CONSTRAINT `fk_reports_job` FOREIGN KEY (`job_id`) REFERENCES `validation_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Exportable cleaned files & error logs';

-- 34. Dead Letter Queue Items
CREATE TABLE `dead_letter_queue_items` (
  `id` CHAR(36) NOT NULL,
  `job_id` CHAR(36) NOT NULL,
  `failure_code` VARCHAR(64) NOT NULL,
  `stack_trace_redacted` TEXT DEFAULT NULL,
  `memory_peak_mb` INT NOT NULL DEFAULT 0,
  `replayed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dlq_job` (`job_id`),
  CONSTRAINT `fk_dlq_job` FOREIGN KEY (`job_id`) REFERENCES `validation_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Failed job replay buffer';

-- =============================================================================
-- DOMAIN 7: ADMIN RBAC, AUDIT LOGS & OPERATIONS (8 TABLES)
-- =============================================================================

DROP TABLE IF EXISTS `workspace_webhooks`;
DROP TABLE IF EXISTS `external_service_connections`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `admin_ticket_access_grants`;
DROP TABLE IF EXISTS `admin_user_assignments`;
DROP TABLE IF EXISTS `admin_role_permissions`;
DROP TABLE IF EXISTS `admin_roles`;

-- 35. Admin Roles
CREATE TABLE `admin_roles` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Internal administrative roles';

-- 36. Admin Role Permissions
CREATE TABLE `admin_role_permissions` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `role_id` VARCHAR(32) NOT NULL,
  `permission_key` VARCHAR(96) NOT NULL,
  `is_granted` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_perm` (`role_id`, `permission_key`),
  CONSTRAINT `fk_perm_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='RBAC capability matrix';

-- 37. Admin User Assignments
CREATE TABLE `admin_user_assignments` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role_id` VARCHAR(32) NOT NULL,
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_user` (`user_id`),
  CONSTRAINT `fk_admin_assign_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_admin_assign_role` FOREIGN KEY (`role_id`) REFERENCES `admin_roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Admin staff assignments';

-- 38. Admin Ticket Access Grants
CREATE TABLE `admin_ticket_access_grants` (
  `id` CHAR(36) NOT NULL,
  `admin_user_id` CHAR(36) NOT NULL,
  `target_workspace_id` CHAR(36) NOT NULL,
  `support_ticket_id` VARCHAR(64) NOT NULL,
  `justification` TEXT NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_grants_ticket` (`support_ticket_id`),
  KEY `idx_grants_admin` (`admin_user_id`),
  CONSTRAINT `fk_grant_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grant_workspace` FOREIGN KEY (`target_workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Time-bound cell unmasking authorizations';

-- 39. Audit Logs
CREATE TABLE `audit_logs` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `actor_user_id` CHAR(36) DEFAULT NULL,
  `workspace_id` CHAR(36) DEFAULT NULL,
  `action_type` VARCHAR(96) NOT NULL,
  `target_entity_type` VARCHAR(64) NOT NULL,
  `target_entity_id` VARCHAR(64) NOT NULL,
  `support_ticket_id` VARCHAR(64) DEFAULT NULL,
  `metadata_json` JSON DEFAULT NULL,
  `prev_hash` CHAR(64) DEFAULT NULL COMMENT 'Cryptographic audit chain prev hash',
  `entry_hash` CHAR(64) DEFAULT NULL COMMENT 'SHA-256 of entry + prev_hash',
  `occurred_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_actor` (`actor_user_id`),
  KEY `idx_audit_workspace` (`workspace_id`),
  KEY `idx_audit_occurred` (`occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tamper-evident audit trail';

-- 40. System Settings
CREATE TABLE `system_settings` (
  `setting_key` VARCHAR(96) NOT NULL,
  `setting_value_json` JSON NOT NULL,
  `updated_by_admin_id` CHAR(36) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Global platform configuration';

-- 41. External Service Connections
CREATE TABLE `external_service_connections` (
  `id` VARCHAR(64) NOT NULL,
  `service_name` VARCHAR(120) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `status` ENUM('CONNECTED', 'DEGRADED', 'DISCONNECTED') NOT NULL DEFAULT 'CONNECTED',
  `last_ping_ms` INT NOT NULL DEFAULT 42,
  `checked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Azure and SaaS integration monitors';

-- 42. Workspace Webhooks
CREATE TABLE `workspace_webhooks` (
  `id` CHAR(36) NOT NULL,
  `workspace_id` CHAR(36) NOT NULL,
  `target_url` VARCHAR(500) NOT NULL,
  `signing_secret_hash` VARCHAR(64) NOT NULL,
  `events_json` JSON NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_webhooks_workspace` (`workspace_id`),
  CONSTRAINT `fk_webhooks_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Outbound validation event notifications';

SET FOREIGN_KEY_CHECKS = 1;
-- End of SheetSentry 42-Table Relational Schema
