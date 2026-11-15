# Authentication & Role-Based Access Flow

This note documents the end-to-end authentication and role isolation model implemented across **01 Public Website**, **02 Customer Application**, and **03 Admin Console**, backed by the Express REST API (`http://127.0.0.1:4000`) and **MySQL 8 / phpMyAdmin** (`sheetsentry`, 42 tables).

Related notes: [[Application Architecture]], [[Database Design]], [[Security Design]], [[API Contract]].

---

## 1. Portal Role Boundaries

| Surface | URL Prefix | Allowed Access | Database Behavior |
| :--- | :--- | :--- | :--- |
| **01 Public Website** | `/`, `/features`, `/how-it-works`, `/pricing`, `/faq` | Unauthenticated visitors & signed-in users | App action buttons (`Try it free`, `Start for free`, pricing CTAs, Hero `View full validation report →`) route visitors to `/register` or `/login?next=...`. |
| **02 Customer App** | `/app/*` | **Authenticated Users (`USER` / `ADMIN`) only** via `CustomerLayout` guard | Every user receives a personal workspace (`workspaces`, `workspace_memberships`), Free subscription (`subscriptions`), default profile (`validation_profiles`), and persistent validation history (`uploaded_files`, `validation_jobs`, `validation_job_issues`). |
| **03 Admin Console** | `/admin/*` | **Static Design-Only Preview** (unauthenticated) OR signed-in **`ADMIN`** role | **Blocked (403 Role Boundary)** for signed-in Customer (`USER`) accounts so customers cannot access multi-tenant administrative controls. |

---

## 2. Authentication Endpoints & MySQL Persistence

1. **Account Creation (`POST /api/v1/auth/register`)**:
   - Validates email, full name, and password (`>= 8` characters).
   - Hashes password with `bcryptjs` (`10` salt rounds) and inserts row into `users` (`status = 'ACTIVE'`).
   - Provisions a dedicated tenant workspace in `workspaces` (`ws_...`), `workspace_memberships` (`role = 'OWNER'`), `subscriptions` (`plan_id = 'free'`), `subscription_usage_counters`, and default `Monthly sales` validation rules in `validation_profiles` / `validation_profile_versions` / `validation_rules`.
   - Generates a bearer session token, hashes it with SHA-256 into `user_sessions`, writes `USER_REGISTERED` to `audit_logs`, and signs the user straight into `/app/dashboard`.

2. **Sign In (`POST /api/v1/auth/login`)**:
   - Verifies credentials against `users.password_hash`, logs attempts in `login_attempts`, resolves `appRole` (`ADMIN` if linked in `admin_user_assignments`, otherwise `USER`), and creates a new SHA-256 hashed session row in `user_sessions`.
   - Seeded demo accounts (`password123` bcrypt hash in `database/seeds.sql`, viewable in phpMyAdmin):
     - Customer (`USER`): `olivia.lee@company.com`
     - Admin (`ADMIN` / `SUPER_ADMIN`): `marcus.chen@sheetsentry.io`

3. **Google Workspace SSO (`POST /api/v1/auth/oauth`)**:
   - Resolves or provisions user + `oauth_accounts` (`provider = 'GOOGLE'`) + starter workspace + `user_sessions` in MySQL.

4. **Session Hydration & Revocation (`GET /api/v1/auth/me`, `POST /api/v1/auth/logout`)**:
   - Frontend stores bearer token in `localStorage` (`sheetsentry_auth_token`) via `src/services/apiClient.ts` and hydrates workspace jobs (`GET /api/v1/jobs`) isolated strictly by `workspace_id`.
   - Sign out revokes `user_sessions.revoked_at = NOW()` and redirects cleanly to `/login`.
