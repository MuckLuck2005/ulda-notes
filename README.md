# ULDA Notes

ULDA Notes is a bachelor project repository for a secure private notes web application.

## Project description
The project is a web application for creating and storing private notes with a focus on secure authorization and data protection.

## Technologies
- Node.js
- MySQL
- JavaScript

## Repository structure
- `src/` — application source code
- `db/` — database schema and related files
- `docs/` — project documentation
- `tests/` — test files
- `.env.example` — example environment variables
- `.gitignore` — ignored files and folders
- `LICENSE` — project license

## Status
Project repository prepared for further development and academic use.

## Documentation rules

All public JavaScript functions in this project should be documented using JSDoc comments.

When updating or adding code, contributors should:
- describe the purpose of each public function;
- document parameters with `@param`;
- document return values with `@returns`;
- keep comments up to date when logic changes;
- verify documentation quality before commit.

Useful commands:
```bash
npm run docs:generate
npm run docs:archive
npm run docs:check
```