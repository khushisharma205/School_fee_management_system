
# School_fee_management_system

## Render deployment

Configure the backend service with either a MySQL `DATABASE_URL` (or `MYSQL_URL`)
or the individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`
variables, plus `JWT_SECRET`. Set `DB_SSL=true` when the MySQL provider requires
TLS, and set `DB_SSL_CA` if it requires a provider CA certificate.
Set `FRONTEND_URL` to `https://school-fee-management-system-frontend.onrender.com`
if the frontend uses a different origin from the default.

Apply `backend/sql/schema.sql` to the database selected by `DB_NAME` before
using login. The schema creates tables and seed data without dropping or
recreating the database. If login still returns HTTP 500 after deployment,
check the backend service logs for database connection or missing-table errors.

For local frontend development, set `VITE_API_BASE_URL=http://localhost:5000/api`
in `frontend/.env.local` to send API requests to the local backend. The checked-in
frontend configuration otherwise defaults to the deployed API URL.
