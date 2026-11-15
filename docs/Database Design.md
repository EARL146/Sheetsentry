# Database Design — MySQL 8 & phpMyAdmin Specification

## 1. Engine & Administration Decision
- **Database Engine**: **MySQL 8.0+** (`InnoDB`, character set `utf8mb4`, collation `utf8mb4_0900_ai_ci`).
- **Administration Interface**: **phpMyAdmin** (`http://localhost/phpmyadmin/` — all 42 tables loaded and verified in database `sheetsentry`).
- **Physical Migration Script**: `database/schema.sql` (Contains all 42 tables, complete foreign keys, unique indexes, cascade rules, and comments).
- **Physical Seed Script**: `database/seeds.sql` (Contains bcrypt-hashed demo fixtures for 8 users, plans, subscriptions, files, preflight records, validation rules, `JOB-2026-8941` & `JOB-2026-8940`, segregated transactions, and external connections).
- **Backend Driver & Switching**: `src/server/database/mysqlClient.ts` (`MysqlDatabaseClient` using `mysql2/promise`) wired via `src/server/database/dbInterface.ts` (`DB_ENGINE=mysql8` live pool when running Express server; isolated `InMemoryDatabaseClient` under hermetic Vitest tests). Local connection parameters are configured exclusively via gitignored `.env` (see `.env.example` for template keys).

## 2. Reconciled 42-Table Inventory Across 7 Domains (from `136:1565`)
*(Resolves Conflict CR-003: `122:2` claimed 32 tables, while `136:1565` defines the complete 42-table relational inventory.)*

### Domain 1: Identity, Auth & Sessions (8 Tables)
1. `users` (`id CHAR(36) PK`, `email VARCHAR(255) UNIQUE`, `password_hash VARCHAR(255)`, `full_name`, `status ENUM('ACTIVE','LOCKED','SUSPENDED','PENDING')`, `failed_login_count INT`, `locked_until TIMESTAMP NULL`, `created_at`, `updated_at`)
2. `user_sessions` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `token_hash VARCHAR(64) UNIQUE`, `ip_address VARCHAR(45)`, `user_agent TEXT`, `expires_at TIMESTAMP`, `revoked_at TIMESTAMP NULL`)
3. `user_mfa_factors` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `factor_type ENUM('TOTP','WEBAUTHN')`, `secret_encrypted TEXT`, `is_verified TINYINT(1)`)
4. `user_mfa_recovery_codes` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `code_hash VARCHAR(64)`, `used_at TIMESTAMP NULL`)
5. `password_reset_tokens` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `token_hash VARCHAR(64) UNIQUE`, `expires_at TIMESTAMP`, `consumed_at TIMESTAMP NULL`)
6. `oauth_accounts` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `provider ENUM('GOOGLE','GITHUB','MICROSOFT')`, `provider_account_id VARCHAR(191)`)
7. `email_verification_tokens` (`id CHAR(36) PK`, `user_id CHAR(36) FK`, `token_hash VARCHAR(64) UNIQUE`, `expires_at TIMESTAMP`)
8. `login_attempts` (`id BIGINT AUTO_INCREMENT PK`, `email VARCHAR(255)`, `ip_address VARCHAR(45)`, `outcome ENUM('SUCCESS','INVALID_PASSWORD','MFA_FAILED','LOCKED')`, `attempted_at TIMESTAMP`)

### Domain 2: Workspaces, Memberships & API Keys (4 Tables)
9. `workspaces` (`id CHAR(36) PK`, `name VARCHAR(160)`, `slug VARCHAR(160) UNIQUE`, `owner_user_id CHAR(36) FK`, `default_currency ENUM('USD','PHP')`, `created_at`)
10. `workspace_memberships` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `user_id CHAR(36) FK`, `role ENUM('OWNER','ADMIN','EDITOR','VIEWER')`, `UNIQUE(workspace_id, user_id)`)
11. `workspace_invitations` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `email VARCHAR(255)`, `role VARCHAR(32)`, `token_hash VARCHAR(64)`, `expires_at TIMESTAMP`)
12. `workspace_api_keys` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `name VARCHAR(120)`, `key_prefix VARCHAR(16)`, `key_hash VARCHAR(64) UNIQUE`, `last_used_at TIMESTAMP NULL`, `revoked_at TIMESTAMP NULL`)

### Domain 3: Plans, Subscriptions, Usage & Multi-Currency Billing (6 Tables)
13. `plans` (`id VARCHAR(32) PK`, `name VARCHAR(64)`, `price_usd DECIMAL(10,2)`, `price_php DECIMAL(10,2)`, `max_file_size_mb INT`, `max_rows INT`, `monthly_validations_limit INT NULL`, `max_seats INT`, `retention_days INT`)
14. `subscriptions` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK UNIQUE`, `plan_id VARCHAR(32) FK`, `billing_currency ENUM('USD','PHP')`, `status ENUM('ACTIVE','PAST_DUE','GRACE_PERIOD','CANCELED')`, `current_period_start TIMESTAMP`, `current_period_end TIMESTAMP`, `downgrade_grace_until TIMESTAMP NULL`)
15. `subscription_usage_counters` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `period_ym CHAR(7)`, `validations_used INT`, `storage_bytes_used BIGINT`, `UNIQUE(workspace_id, period_ym)`)
16. `invoices` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `subscription_id CHAR(36) FK`, `currency ENUM('USD','PHP')`, `amount_total DECIMAL(12,2)`, `status ENUM('PAID','OPEN','VOID','UNCOLLECTIBLE')`, `issued_at TIMESTAMP`)
17. `payment_transactions` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `invoice_id CHAR(36) FK`, `gateway ENUM('STRIPE','PAYMONGO')`, `currency ENUM('USD','PHP')`, `amount DECIMAL(12,2)`, `fx_rate_reference DECIMAL(10,4) NULL`, `status VARCHAR(32)`, `created_at TIMESTAMP`)
18. `refund_requests` (`id CHAR(36) PK`, `transaction_id CHAR(36) FK`, `currency ENUM('USD','PHP')`, `amount DECIMAL(12,2)`, `reason TEXT`, `initiated_by_admin_id CHAR(36) FK`, `approved_by_admin_id CHAR(36) FK NULL`, `requires_dual_approval TINYINT(1)`, `status ENUM('PENDING_SECOND_APPROVAL','APPROVED','REJECTED','PROCESSED')`)

### Domain 4: File Uploads, Storage & Preflight (6 Tables)
19. `uploaded_files` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `uploaded_by_user_id CHAR(36) FK`, `original_filename VARCHAR(255)`, `mime_type VARCHAR(120)`, `extension VARCHAR(16)`, `size_bytes BIGINT`, `sha256_checksum CHAR(64)`, `storage_tier ENUM('QUARANTINE','ACTIVE','ARCHIVE','PURGED')`, `legal_hold TINYINT(1)`, `retention_expires_at TIMESTAMP`, `created_at`)
20. `upload_preflight_checks` (`id CHAR(36) PK`, `file_id CHAR(36) FK UNIQUE`, `magic_bytes_hex VARCHAR(24)`, `magic_bytes_valid TINYINT(1)`, `detected_encoding VARCHAR(32)`, `detected_delimiter VARCHAR(8)`, `zip_expansion_ratio DECIMAL(6,2)`, `av_scan_status ENUM('CLEAN','INFECTED','SKIPPED')`, `inspected_at TIMESTAMP`)
21. `upload_worksheets` (`id CHAR(36) PK`, `file_id CHAR(36) FK`, `sheet_index INT`, `sheet_name VARCHAR(160)`, `row_count INT`, `column_count INT`, `header_row_index INT`, `is_selected TINYINT(1)`)
22. `upload_detected_columns` (`id CHAR(36) PK`, `worksheet_id CHAR(36) FK`, `column_index INT`, `header_name VARCHAR(160)`, `inferred_type VARCHAR(32)`, `null_ratio DECIMAL(5,4)`, `sample_values_json JSON`)
23. `storage_lifecycle_events` (`id BIGINT AUTO_INCREMENT PK`, `file_id CHAR(36) FK`, `from_tier VARCHAR(32)`, `to_tier VARCHAR(32)`, `actor_type VARCHAR(32)`, `occurred_at TIMESTAMP`)
24. `quarantine_incidents` (`id CHAR(36) PK`, `file_id CHAR(36) FK`, `threat_type ENUM('ZIP_BOMB','FORMULA_INJECTION_MASS','MALWARE_SIGNATURE','MIME_SPOOF')`, `severity VARCHAR(16)`, `resolution_status VARCHAR(32)`, `detected_at TIMESTAMP`)

### Domain 5: Validation Profiles, Rules & Mapping (6 Tables)
25. `validation_profiles` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `name VARCHAR(160)`, `target_domain VARCHAR(64)`, `current_version INT`, `is_locked_by_downgrade TINYINT(1)`, `created_at`)
26. `validation_profile_versions` (`id CHAR(36) PK`, `profile_id CHAR(36) FK`, `version_number INT`, `changelog_summary TEXT`, `published_by_user_id CHAR(36) FK`, `published_at TIMESTAMP`, `UNIQUE(profile_id, version_number)`)
27. `validation_rules` (`id CHAR(36) PK`, `profile_version_id CHAR(36) FK`, `target_field VARCHAR(120)`, `rule_type ENUM('REQUIRED','DATA_TYPE','REGEX','UNIQUE','RANGE','ENUM','CROSS_COLUMN')`, `severity ENUM('CRITICAL','WARNING')`, `blocks_processing TINYINT(1)`, `parameters_json JSON`, `error_message_template VARCHAR(255)`)
28. `column_mappings` (`id CHAR(36) PK`, `file_id CHAR(36) FK`, `profile_version_id CHAR(36) FK`, `mapping_json JSON`, `unmapped_required_count INT`, `created_at`)
29. `rule_sandbox_runs` (`id CHAR(36) PK`, `profile_id CHAR(36) FK`, `user_id CHAR(36) FK`, `sample_rows_json JSON`, `evaluation_output_json JSON`, `executed_at TIMESTAMP`)
30. `profile_templates_catalog` (`id VARCHAR(64) PK`, `name VARCHAR(160)`, `category VARCHAR(64)`, `default_rules_json JSON`)

### Domain 6: Validation Jobs, Results & Reports (4 Tables)
31. `validation_jobs` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `file_id CHAR(36) FK`, `profile_version_id CHAR(36) FK`, `state ENUM('UPLOADED','SCANNING','VALIDATING','SCORING','COMPLETED','FAILED','QUARANTINED','CANCELLED','EXPIRED')`, `total_rows_evaluated INT`, `critical_rows_count INT`, `warning_rows_count INT`, `data_quality_score DECIMAL(5,2) NULL`, `validation_grade ENUM('A','B','C','FAIL','NA')`, `processing_eligibility ENUM('ELIGIBLE','REVIEW_REQUIRED','BLOCKED_CRITICAL')`, `worker_node_id VARCHAR(64)`, `retry_count INT DEFAULT 0`, `started_at TIMESTAMP NULL`, `completed_at TIMESTAMP NULL`)
32. `validation_job_issues` (`id BIGINT AUTO_INCREMENT PK`, `job_id CHAR(36) FK`, `rule_id CHAR(36) FK`, `row_number INT`, `column_name VARCHAR(160)`, `severity ENUM('CRITICAL','WARNING')`, `raw_value_masked VARCHAR(255)`, `formula_neutralized TINYINT(1)`, `message VARCHAR(255)`, `INDEX idx_job_severity (job_id, severity)`)
33. `validation_reports` (`id CHAR(36) PK`, `job_id CHAR(36) FK`, `report_type ENUM('SANITIZED_CSV','ERROR_ONLY_CSV','EXECUTIVE_SUMMARY_JSON')`, `storage_key VARCHAR(255)`, `sha256_checksum CHAR(64)`, `generated_at TIMESTAMP`)
34. `dead_letter_queue_items` (`id CHAR(36) PK`, `job_id CHAR(36) FK UNIQUE`, `failure_code VARCHAR(64)`, `stack_trace_redacted TEXT`, `memory_peak_mb INT`, `replayed_at TIMESTAMP NULL`)

### Domain 7: Admin RBAC, Audit Logs & Operations (8 Tables)
35. `admin_roles` (`id VARCHAR(32) PK`, `name VARCHAR(64)`, `description TEXT`) — 6 core roles: `SUPER_ADMIN`, `PLATFORM_OPS`, `SECOPS_AUDITOR`, `BILLING_ADMIN`, `SUPPORT_L2`, `SUPPORT_READ_ONLY`
36. `admin_role_permissions` (`id BIGINT AUTO_INCREMENT PK`, `role_id VARCHAR(32) FK`, `permission_key VARCHAR(96)`, `is_granted TINYINT(1)`)
37. `admin_user_assignments` (`id CHAR(36) PK`, `user_id CHAR(36) FK UNIQUE`, `role_id VARCHAR(32) FK`, `assigned_at TIMESTAMP`)
38. `admin_ticket_access_grants` (`id CHAR(36) PK`, `admin_user_id CHAR(36) FK`, `target_workspace_id CHAR(36) FK`, `support_ticket_id VARCHAR(64)`, `justification TEXT`, `expires_at TIMESTAMP`, `created_at TIMESTAMP`)
39. `audit_logs` (`id BIGINT AUTO_INCREMENT PK`, `actor_user_id CHAR(36) NULL`, `workspace_id CHAR(36) NULL`, `action_type VARCHAR(96)`, `target_entity_type VARCHAR(64)`, `target_entity_id VARCHAR(64)`, `support_ticket_id VARCHAR(64) NULL`, `metadata_json JSON`, `prev_hash CHAR(64)`, `entry_hash CHAR(64)`, `occurred_at TIMESTAMP`)
40. `system_settings` (`setting_key VARCHAR(96) PK`, `setting_value_json JSON`, `updated_by_admin_id CHAR(36) FK`, `updated_at TIMESTAMP`)
41. `external_service_connections` (`id VARCHAR(64) PK`, `service_name VARCHAR(120)`, `category VARCHAR(64)`, `status ENUM('CONNECTED','DEGRADED','DISCONNECTED')`, `last_ping_ms INT`, `checked_at TIMESTAMP`)
42. `workspace_webhooks` (`id CHAR(36) PK`, `workspace_id CHAR(36) FK`, `target_url VARCHAR(500)`, `signing_secret_hash VARCHAR(64)`, `events_json JSON`, `is_active TINYINT(1)`)
