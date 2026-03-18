-- Auto-create per-project databases on first PostgreSQL startup.
-- Add new CREATE DATABASE lines as you add sub-projects.
-- Note: These scripts only run when the data directory is empty (first init).
-- For subsequent databases, run CREATE DATABASE manually via:
--   docker exec -it minerva-postgres psql -U shinyq -c "CREATE DATABASE new_project;"

-- CREATE DATABASE project1;
-- CREATE DATABASE project2;
