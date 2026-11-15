-- =============================================================================
-- SheetSentry — Demo Seed Data for MySQL 8.0+ / phpMyAdmin
-- Matches Official Figma Screens (Nodes 3:65, 4:51, 4:430, 25:2, 114:2, 118:74)
-- =============================================================================

USE `sheetsentry`;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Plans
INSERT INTO `plans` (`id`, `name`, `price_usd`, `price_php`, `max_file_size_mb`, `max_rows`, `monthly_validations_limit`, `max_profiles`, `max_seats`, `retention_days`) VALUES
('free', 'Free', 0.00, 0.00, 10, 1000, 3, 1, 1, 7),
('starter', 'Starter', 5.00, 275.00, 25, 10000, 50, 3, 3, 30),
('pro', 'Pro', 12.00, 660.00, 100, 100000, NULL, 10, 10, 90)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `price_usd`=VALUES(`price_usd`), `price_php`=VALUES(`price_php`);

-- 2. Insert Users (demo password for seeded fixtures: password123)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `status`) VALUES
('usr_olivia_01', 'olivia@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Olivia Lee', 'ACTIVE'),
('usr_marcus_02', 'marcus@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Marcus Chen', 'ACTIVE'),
('usr_ava_03', 'ava@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Ava Santos', 'ACTIVE'),
('usr_noah_04', 'noah@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Noah Patel', 'ACTIVE'),
('usr_mia_05', 'mia@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Mia Garcia', 'ACTIVE'),
('usr_ethan_06', 'ethan@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Ethan Kim', 'ACTIVE'),
('usr_sofia_07', 'sofia@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Sofia Reyes', 'ACTIVE'),
('usr_liam_08', 'liam@sheetsentry.io', '$2b$10$.aCn3NV1UlGNaDyybh.7X.wsyVJxQ6NtGDNd667DU9JdLODdubbFa', 'Liam Wong', 'ACTIVE')
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`), `full_name`=VALUES(`full_name`);

-- 3. Insert Admin Roles & Assignments
INSERT INTO `admin_roles` (`id`, `name`, `description`) VALUES
('SUPER_ADMIN', 'Super Admin', 'Full control over tenants, settings, RBAC, and encryption keys'),
('PLATFORM_OPS', 'Operations Lead', 'Deployment management, job replay, worker cluster monitoring'),
('SECOPS_AUDITOR', 'Compliance Auditor', 'Audit log inspection, GDPR/SOC2 reports, quarantine approvals'),
('BILLING_ADMIN', 'Billing Admin', 'Invoicing, refund approvals, ledger inspection, FX calibration'),
('SUPPORT_L2', 'Support Specialist', 'Customer issue resolution, ticket-gated row unmasking')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `admin_user_assignments` (`id`, `user_id`, `role_id`) VALUES
('adm_assign_01', 'usr_marcus_02', 'SUPER_ADMIN'),
('adm_assign_02', 'usr_ava_03', 'BILLING_ADMIN'),
('adm_assign_03', 'usr_noah_04', 'SECOPS_AUDITOR'),
('adm_assign_04', 'usr_mia_05', 'SUPPORT_L2')
ON DUPLICATE KEY UPDATE `role_id`=VALUES(`role_id`);

-- 4. Insert Workspaces
INSERT INTO `workspaces` (`id`, `name`, `slug`, `owner_user_id`, `default_currency`) VALUES
('ws_olivia_01', 'Olivia\'s workspace', 'olivias-workspace', 'usr_olivia_01', 'USD')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `workspace_memberships` (`id`, `workspace_id`, `user_id`, `role`) VALUES
('mem_01', 'ws_olivia_01', 'usr_olivia_01', 'OWNER')
ON DUPLICATE KEY UPDATE `role`=VALUES(`role`);

-- 5. Insert Subscriptions
INSERT INTO `subscriptions` (`id`, `workspace_id`, `plan_id`, `billing_currency`, `status`, `current_period_start`, `current_period_end`) VALUES
('sub_olivia_01', 'ws_olivia_01', 'starter', 'USD', 'ACTIVE', '2026-11-01 00:00:00', '2026-12-01 00:00:00')
ON DUPLICATE KEY UPDATE `plan_id`=VALUES(`plan_id`), `status`=VALUES(`status`);

INSERT INTO `subscription_usage_counters` (`id`, `workspace_id`, `period_ym`, `validations_used`, `storage_bytes_used`) VALUES
('use_01', 'ws_olivia_01', '2026-11', 32, 1480000000)
ON DUPLICATE KEY UPDATE `validations_used`=VALUES(`validations_used`);

-- 6. Insert Uploaded Files & Preflight Checks
INSERT INTO `uploaded_files` (`id`, `workspace_id`, `uploaded_by_user_id`, `original_filename`, `mime_type`, `extension`, `size_bytes`, `sha256_checksum`, `storage_tier`, `retention_expires_at`) VALUES
('file_sales_nov', 'ws_olivia_01', 'usr_olivia_01', 'sales_nov.csv', 'text/csv', '.csv', 245000, 'a7f34b9d09c3e21894d8b9f1a234e567890abcdef1234567890abcdef1234567', 'ACTIVE', '2026-12-11 00:00:00'),
('file_customers_q4', 'ws_olivia_01', 'usr_olivia_01', 'customers_q4.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx', 1250000, 'b8e45c0e10d4f32905e9c0a2b345f678901bcdef2345678901bcdef2345678', 'ACTIVE', '2026-12-11 00:00:00')
ON DUPLICATE KEY UPDATE `original_filename`=VALUES(`original_filename`);

INSERT INTO `upload_preflight_checks` (`id`, `file_id`, `magic_bytes_hex`, `magic_bytes_valid`, `detected_encoding`, `detected_delimiter`, `zip_expansion_ratio`, `av_scan_status`) VALUES
('pre_01', 'file_sales_nov', '4F72646572', 1, 'UTF-8', ',', 1.00, 'CLEAN'),
('pre_02', 'file_customers_q4', '504B0304', 1, 'UTF-8', ',', 3.42, 'CLEAN')
ON DUPLICATE KEY UPDATE `magic_bytes_valid`=VALUES(`magic_bytes_valid`);

-- 7. Insert Validation Profiles & Rules
INSERT INTO `validation_profiles` (`id`, `workspace_id`, `name`, `target_domain`, `current_version`) VALUES
('prof_sales_01', 'ws_olivia_01', 'Monthly sales', 'Sales & Invoicing', 1),
('prof_crm_02', 'ws_olivia_01', 'Customer master', 'CRM & Contacts', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `validation_profile_versions` (`id`, `profile_id`, `version_number`, `changelog_summary`, `published_by_user_id`) VALUES
('ver_sales_01', 'prof_sales_01', 1, 'Initial sales schema with required Order ID, Email format, and Amount positive checks', 'usr_olivia_01')
ON DUPLICATE KEY UPDATE `changelog_summary`=VALUES(`changelog_summary`);

INSERT INTO `validation_rules` (`id`, `profile_version_id`, `target_field`, `rule_type`, `severity`, `blocks_processing`, `parameters_json`, `error_message_template`) VALUES
('rule_01', 'ver_sales_01', 'Order ID', 'REQUIRED', 'CRITICAL', 1, '{"allowEmpty": false}', 'Order ID is mandatory'),
('rule_02', 'ver_sales_01', 'Order ID', 'UNIQUE', 'CRITICAL', 1, '{}', 'Duplicate order ID detected'),
('rule_03', 'ver_sales_01', 'Customer Email', 'REQUIRED', 'WARNING', 0, '{"allowEmpty": false}', 'Missing customer email'),
('rule_04', 'ver_sales_01', 'Customer Email', 'REGEX', 'WARNING', 0, '{"pattern": "^[^@]+@[^@]+\\\\.[^@]+$"}', 'Invalid email address format'),
('rule_05', 'ver_sales_01', 'Amount', 'RANGE', 'CRITICAL', 1, '{"min": 0.01}', 'Amount must be greater than zero')
ON DUPLICATE KEY UPDATE `target_field`=VALUES(`target_field`);

-- 8. Insert Validation Jobs & Issues
INSERT INTO `validation_jobs` (`id`, `workspace_id`, `file_id`, `profile_version_id`, `state`, `total_rows_evaluated`, `critical_rows_count`, `warning_rows_count`, `data_quality_score`, `validation_grade`, `processing_eligibility`) VALUES
('JOB-2026-8941', 'ws_olivia_01', 'file_sales_nov', 'ver_sales_01', 'COMPLETED', 1250, 0, 20, 98.40, 'A', 'ELIGIBLE'),
('JOB-2026-8940', 'ws_olivia_01', 'file_customers_q4', 'ver_sales_01', 'COMPLETED', 3480, 12, 74, 94.20, 'B', 'REVIEW_REQUIRED')
ON DUPLICATE KEY UPDATE `data_quality_score`=VALUES(`data_quality_score`), `processing_eligibility`=VALUES(`processing_eligibility`);

INSERT INTO `validation_job_issues` (`id`, `job_id`, `rule_id`, `row_number`, `column_name`, `severity`, `raw_value_masked`, `formula_neutralized`, `message`) VALUES
(1, 'JOB-2026-8941', 'rule_03', 14, 'Customer Email', 'WARNING', '***@***.com', 0, 'Missing customer email'),
(2, 'JOB-2026-8941', 'rule_03', 42, 'Customer Email', 'WARNING', '***@***.com', 0, 'Missing customer email'),
(3, 'JOB-2026-8941', 'rule_02', 108, 'Order ID', 'WARNING', 'ORD-9842', 0, 'Duplicate order ID ORD-9842'),
(4, 'JOB-2026-8941', 'rule_04', 195, 'Order Date', 'WARNING', '2026/31/02', 0, 'Invalid date value')
ON DUPLICATE KEY UPDATE `message`=VALUES(`message`);

-- 9. Insert Segregated Ledger Payment Transactions (Matches AdminPaymentsLedgerPage)
INSERT INTO `payment_transactions` (`id`, `workspace_id`, `gateway`, `currency`, `amount`, `fx_rate_reference`, `status`, `external_reference`) VALUES
('pay_99201_usd', 'ws_olivia_01', 'STRIPE', 'USD', 12.00, 55.0000, 'SETTLED', 'ch_3N1f9kL8'),
('pay_99202_usd', 'ws_olivia_01', 'STRIPE', 'USD', 12.00, 55.0000, 'SETTLED', 'ch_3N1f9kL9'),
('pay_99203_usd', 'ws_olivia_01', 'STRIPE', 'USD', 5.00, 55.0000, 'SETTLED', 'ch_3N1f9kLA'),
('pay_99204_php', 'ws_olivia_01', 'PAYMONGO', 'PHP', 660.00, 55.0000, 'SETTLED', 'pay_mnl_8820'),
('pay_99205_php', 'ws_olivia_01', 'PAYMONGO', 'PHP', 660.00, 55.0000, 'SETTLED', 'pay_mnl_8821')
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

-- 10. Insert External Service Connections (Matches Connections Popover Node 25:2 / 21:905)
INSERT INTO `external_service_connections` (`id`, `service_name`, `category`, `status`, `last_ping_ms`) VALUES
('conn_mysql', 'Azure MySQL Flexible Server', 'Database Engine', 'CONNECTED', 14),
('conn_blob', 'Azure Blob Storage', 'Object Storage', 'CONNECTED', 38),
('conn_redis', 'Azure Managed Redis', 'Cache & Rate Limiting', 'CONNECTED', 4),
('conn_bus', 'Azure Service Bus', 'Async Worker Queue', 'CONNECTED', 22)
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

SET FOREIGN_KEY_CHECKS = 1;
-- End of Seed Script
