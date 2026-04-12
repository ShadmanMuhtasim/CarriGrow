This directory is the Docker MySQL bootstrap source for CarriGrow.

Committed files:

- `00-schema.sql`: database schema baseline
- `10-reference-data.sql`: safe demo/reference data

Local-only files:

- Personal dumps/experiments should be kept outside this init folder.
- `01-xampp-export.sql` must not be placed here, otherwise MySQL init can break.

Notes:

- Docker mounts only `00-schema.sql` and `10-reference-data.sql` into MySQL init.
- This project is database-first only. The committed SQL files in this directory are the schema and reference-data source of truth.
- If you already started the stack once and want to re-run the init SQL, run `docker compose down -v` first.
- Keep committed SQL sanitized. Do not commit personal users, emails, passwords, or local test content.
