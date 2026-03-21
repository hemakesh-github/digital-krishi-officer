-- Run this as a PostgreSQL superuser (e.g. postgres), not as hemakesh.
-- Example (PowerShell, you will be prompted for postgres password):
--   psql -U postgres -h localhost -d postgres -f scripts/create_database_farmer_assist_m.sql

-- Create database owned by your app user (matches DATABASE_URL in .env)
CREATE DATABASE farmer_assist_m
    OWNER hemakesh
    ENCODING 'UTF8'
    TEMPLATE template0;

-- If you see "role hemakesh does not exist", create the user first:
-- CREATE USER hemakesh WITH PASSWORD 'your_password';
-- Then run CREATE DATABASE again.
