# API Contract — 28 Reconciled Route Groups

Reference: Figma Node `136:1683` (*SheetSentry Reconciled REST API Architecture — 28 Route Groups*).
Implementation Status: **Phase 3 Backend Foundation Implemented & Verified** (`src/server/app.ts`, `src/server/routes/*`, `src/server/middleware/*`, with 6 automated API tests in `src/server/__tests__/api.test.ts`). In addition, the frontend is backed by both live-compatible endpoints and reactive state mock fallbacks.

## Domain A: Identity, Auth & Workspaces (Groups 01–07)
1. **01. `/api/v1/auth`**: `POST /login`, `POST /register`, `POST /logout`, `POST /refresh`, `POST /magic-link`
2. **02. `/api/v1/auth/mfa`**: `POST /setup`, `POST /verify`, `POST /recovery-code`
3. **03. `/api/v1/auth/password`**: `POST /forgot`, `POST /reset`, `PUT /change`
4. **04. `/api/v1/users/me`**: `GET /`, `PATCH /`, `DELETE /` (GDPR erasure request)
5. **05. `/api/v1/workspaces`**: `GET /`, `POST /`, `PATCH /:workspaceId`
6. **06. `/api/v1/workspaces/:id/members`**: `GET /`, `POST /invite`, `PATCH /:memberId/role`, `DELETE /:memberId`
7. **07. `/api/v1/api-keys`**: `GET /`, `POST /`, `DELETE /:keyId`

## Domain B: Uploads, Preflight & Validation Profiles (Groups 08–14)
8. **08. `/api/v1/uploads/presign`**: `POST /` (validates quota & file size ceiling before issuing upload token)
9. **09. `/api/v1/uploads/:id/preflight`**: `POST /inspect` (magic-byte check, zip-bomb ratio, worksheet list, encoding)
10. **10. `/api/v1/uploads/:id/preview`**: `GET /` (returns top 50 rows with neutralized formula strings)
11. **11. `/api/v1/uploads/:id/mapping`**: `PUT /` (saves source-to-target column mapping)
12. **12. `/api/v1/profiles`**: `GET /`, `POST /`, `GET /:profileId`, `PATCH /:profileId`, `DELETE /:profileId`
13. **13. `/api/v1/profiles/:id/rules`**: `GET /`, `POST /`, `PUT /:ruleId`, `DELETE /:ruleId`
14. **14. `/api/v1/profiles/:id/sandbox`**: `POST /evaluate` (stateless 5-row sandbox test evaluation)

## Domain C: Validation Jobs, Results, Reports & Billing (Groups 15–21)
15. **15. `/api/v1/jobs`**: `GET /`, `POST /` (enqueue validation run), `GET /:jobId`, `POST /:jobId/cancel`, `POST /:jobId/retry`
16. **16. `/api/v1/jobs/:id/results`**: `GET /summary` (DQS, Grade, Eligibility), `GET /issues` (paginated cell errors & warnings)
17. **17. `/api/v1/reports`**: `GET /`, `POST /:jobId/export` (`SANITIZED_CSV`, `ERROR_ONLY_CSV`, `EXECUTIVE_JSON`)
18. **18. `/api/v1/billing/plans`**: `GET /` (returns active plan tiers in `USD` and `PHP`)
19. **19. `/api/v1/billing/subscription`**: `GET /`, `POST /checkout`, `POST /change-tier`, `POST /cancel`
20. **20. `/api/v1/billing/invoices`**: `GET /`, `GET /:invoiceId/download`
21. **21. `/api/v1/webhooks`**: `GET /`, `POST /`, `POST /:webhookId/test`, `DELETE /:webhookId`

## Domain D: Admin Governance, SecOps, Ledger & Operations (Groups 22–28)
22. **22. `/api/v1/admin/overview`**: `GET /kpis`, `GET /throughput`
23. **23. `/api/v1/admin/tenants`**: `GET /`, `GET /:userId`, `POST /:userId/ticket-access` (requires `ticketId` to unmask metadata/cells)
24. **24. `/api/v1/admin/pipeline`**: `GET /workers`, `GET /dlq`, `POST /dlq/:jobId/replay`, `POST /uploads/:id/quarantine`
25. **25. `/api/v1/admin/ledger`**: `GET /transactions` (`?currency=USD|PHP`), `POST /refunds/initiate`, `POST /refunds/:id/approve` (dual-admin check for `> $500`)
26. **26. `/api/v1/admin/storage`**: `GET /buckets`, `POST /lifecycle/purge`, `POST /uploads/:id/legal-hold`
27. **27. `/api/v1/admin/security`**: `GET /audit-logs`, `GET /threat-events`, `GET /rbac-matrix`, `PATCH /rbac-matrix`
28. **28. `/api/v1/admin/operations`**: `GET /connections`, `POST /connections/:id/ping`, `PATCH /system-settings`
