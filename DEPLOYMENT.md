# Deployment Guide: MySQLFreeDatabase + Render

This project is ready to deploy as two Render services:

- `inventory-ahmad-api`: Node.js/Express backend.
- `inventory-ahmad-frontend`: Vite/React static site.

The database is external MySQL, such as MySQLFreeDatabase.

## 1. Create The MySQL Database

Create a MySQLFreeDatabase database and keep these values:

- Host
- Port, usually `3306`
- Database name
- Username
- Password

Do not commit these values to the repository.

## 2. Deploy With Render Blueprint

1. Push this repository to GitHub or GitLab.
2. In Render, create a new Blueprint from the repository.
3. Render will read `render.yaml` and create:
   - a Node web service for `backend`
   - a static site for `frontend`
4. Fill the backend secret environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_SSL=false` for MySQLFreeDatabase unless your provider explicitly requires SSL
   - `CORS_ORIGIN=https://your-frontend.onrender.com`
5. Fill the frontend environment variable:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

The backend start command runs database migrations automatically:

```bash
npm run migrate && npm start
```

## 3. Seed Initial Users Once

After the first backend deploy succeeds, seed the database once:

```bash
cd backend
NODE_ENV=production npm run seed
```

If you run the seed more than once, duplicate seed rows are ignored.

Seeded login password:

```text
password123
```

Seeded users:

- `admin@example.com`
- `inventory@example.com`
- `accountant@example.com`

Change these passwords immediately after deployment.

## 4. Manual Render Setup Values

If you do not use the Blueprint, configure services manually.

Backend web service:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm run migrate && npm start`
- Health check path: `/health`

Frontend static site:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/*` -> `/index.html`

## 5. Environment Variables

Backend:

```text
NODE_ENV=production
TRUST_PROXY=true
DB_HOST=<mysqlfreedatabase-host>
DB_PORT=3306
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_SSL=false
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend.onrender.com
CORS_ALLOW_NO_ORIGIN=false
```

Frontend:

```text
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

## 6. Production Checks

After deployment:

1. Open `https://your-backend.onrender.com/health`.
2. Confirm it returns `API is healthy`.
3. Open the frontend URL.
4. Log in as admin.
5. Create one category/item/driver to confirm the API, CORS, and MySQL credentials are correct.

If login requests fail in the browser but `/health` works, check `CORS_ORIGIN` exactly matches the frontend origin, including `https://` and no trailing slash.
