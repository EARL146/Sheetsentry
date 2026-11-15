# Deployment Notes — SheetSentry

## 1. Local Full-Stack Development (Frontend + Express API + MySQL 8 / phpMyAdmin)
- **Prerequisites**: Node.js `>= 18.x`, `npm`, and MySQL 8.0+ (`127.0.0.1:3306` + phpMyAdmin `http://localhost/phpmyadmin/`, or Docker Compose via `docker-compose.yml` mapped to `3308`/`8084`).
- **Commands**:
  - Install dependencies: `npm install`
  - Start Express Backend API (`http://127.0.0.1:4000`, connected to MySQL 8): `npm run server`
  - Start Vite Frontend Dev Server (`http://localhost:5173`, proxies `/api` to `127.0.0.1:4000`): `npm run dev`
  - Run automated tests (Vitest): `npm test`
  - Build production bundle: `npm run build`

## 2. Database Schema & Seeds Initialization (MySQL 8 / phpMyAdmin)
- Schema (`42` tables): `database/schema.sql` -> creates database `sheetsentry` (`utf8mb4_0900_ai_ci`).
- Seeds (`8` seeded accounts, plans, jobs, audit logs): `database/seeds.sql`.
- Inspect all tables live in phpMyAdmin at `http://localhost/phpmyadmin/` -> database `sheetsentry`.

## 3. Environment Variables Strategy
- Never commit `.env` files containing credentials.
- Copy `.env.example` to `.env` locally and set credentials as needed:
  - `PORT=4000`
  - `DB_ENGINE=mysql8`
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=3306`
  - `DB_NAME=sheetsentry`
  - `DB_USER=root`
  - `DB_PASSWORD=` *(set locally in gitignored `.env`)*
  - `PHPMYADMIN_URL=http://localhost/phpmyadmin`
  - `JWT_SECRET=` *(generated per environment)*
