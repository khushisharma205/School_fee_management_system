
# School_fee_management_system

## Render deployment

This repository deploys as two Render services and uses a separately hosted
MySQL database.

### Backend web service

In the Render backend service settings, use:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/`

Set the database environment variables on the backend service using either:

- `DATABASE_URL` (or `MYSQL_URL`) containing the external MySQL connection URL,
  or
- `DB_HOST`, `DB_PORT` (optional; defaults to `3306`), `DB_USER`, `DB_PASSWORD`,
  and `DB_NAME`

Use the database provider's **external/public host**, not `localhost` or a
private host that Render cannot reach. Set `DB_SSL=true` when the provider
requires TLS, and set `DB_SSL_CA` if it provides a CA certificate. Also set
`JWT_SECRET` to a long, random secret. Never commit database credentials or
JWT secrets to the repository.

Before logging in, connect a MySQL client to that same production database and
run `backend/sql/schema.sql`. It creates tables and sample records but does not
drop or recreate the database. Do not run it against a database containing data
you need without first taking a backup.

### Frontend static site

Create a Render Static Site using:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

The frontend defaults to
`https://school-fee-management-system-iqni.onrender.com/api` for the API. To use
a different backend URL, set `VITE_API_BASE_URL` to the full API base URL,
including `/api`, in the static site's environment settings, then trigger a new
frontend deploy. Vite embeds this value at build time.

### Deploy and verify

Push the desired commit to `main`, then in Render deploy the latest commit for
both services (or enable automatic deploys). Confirm the backend responds at
`/` and verify its service logs show a successful database connection when a
login request is made. A login attempt with a nonexistent email should return
HTTP 401; HTTP 500 indicates a backend/database configuration error. Check the
backend logs for the MySQL error code and message.

For local frontend development, put
`VITE_API_BASE_URL=http://localhost:5000/api` in the ignored
`frontend/.env.local` file to send API requests to the local backend.
