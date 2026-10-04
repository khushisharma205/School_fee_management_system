
# School_fee_management_system

## Render deployment

Configure the backend service with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
and `JWT_SECRET`. Set `FRONTEND_URL` to
`https://school-fee-management-system-frontend.onrender.com` if the frontend
uses a different origin from the default.

Apply `backend/sql/schema.sql` to the database selected by `DB_NAME` before
using login. The schema creates tables and seed data without dropping or
recreating the database. If login still returns HTTP 500 after deployment,
check the backend service logs for database connection or missing-table errors.
