# Levi Developer Control Panel Deployment

This guide deploys the dashboard as a PWA and connects the backend API + database.

## 1) Database on Supabase
1. Create a new Supabase project.
2. Copy the Postgres connection string from Project Settings.
3. Save it as `DATABASE_URL` for the backend.
4. Run migrations once the backend is deployed (see backend section).

## 2) Backend on Render
1. Create a new Render Web Service.
2. Connect the `backend` folder repo.
3. Set the build command to: `npm install`.
4. Set the start command to: `npm start`.
5. Add environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN` (use `http://localhost:5173,https://levi-control-panel.vercel.app`)
- `PUBLIC_BASE_URL` (your Render backend URL)
- `REDIS_URL` (optional, for queues)
- `API_MONITOR_ENABLED` (optional)
- `API_MONITOR_SCHEDULE` (optional)
- `STORAGE_PROVIDER` (`local` or `s3`)
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` (only if using S3)
6. After the service is live, run migrations:
- Trigger a one-off Render shell or local command with the same `DATABASE_URL`.
- Command: `npm run migrate`.
7. Confirm the health endpoint:
- `GET /api/health-check` should return OK.

## 3) Frontend on Vercel
1. Create a new Vercel project for the `frontend` folder.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable:
- `VITE_API_BASE_URL` = `https://levi-control-panel-api.onrender.com`.
6. Deploy and verify the dashboard loads.

## 4) Enable PWA Install
1. Open the deployed dashboard in Chrome.
2. Use the browser Install prompt or the Settings page button.
3. The app will install as a mobile-ready PWA.

## 5) Smoke Test Checklist
1. Login and load the dashboard.
2. Register an API and confirm uptime checks.
3. Trigger a bot run or automation.
4. Upload a file and confirm it appears in the Files page.
5. Verify live logs update via Socket.io.
