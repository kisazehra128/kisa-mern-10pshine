# Notes App

Backend for a MERN Notes Application. Early development.

## Stack

**Backend:** Node.js, Express, MySQL
**Auth:** bcrypt, JWT
**Validation:** Joi
**Logging:** Pino (`pino`, `pino-http`, `pino-pretty`)
**Testing:** Mocha, Chai, Supertest, Sinon, Proxyquire, Postman

## Where things stand

- Express server, routing, env config, `.gitignore`, CodeRabbit on PRs
- MySQL connected — schema, User model, Note model
- Auth done — register, login, logout, JWT, protected routes
- Notes CRUD done — create/read/update/delete, search, scoped per user
- Structured logging (Pino) — every request logged, `Authorization` header redacted
- Centralized error handling — consistent JSON errors, no leaked stack traces
- Joi request validation — bad input rejected with `400` before hitting the DB
- 61 automated tests: integration tests (real Express app + real MySQL, self-cleaning) and unit tests (Sinon/Proxyquire-mocked DB layer)
- Postman collection for manual testing

Frontend not started yet.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

Create the database and apply the schema (name must match `DB_NAME`):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < backend/database/schema.sql
```

Or run `backend/database/schema.sql` in MySQL Workbench.

> No separate test database yet — tests run against the same DB and clean up their own data in an `after()` hook.

## Running

```bash
npm run dev     # http://localhost:5000
npm test        # 61 tests — see .mocharc.json for config
```

## API Reference

All `/api/notes` and `/api/users/me` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Status codes |
| ------ | -------- | ------------ | ------------- |
| GET | `/` | Welcome message | 200 |
| GET | `/api/health` | Health check | 200 |
| POST | `/api/auth/register` | Create user — `{ name, email, password }` | 201 · 409 dup email · 400 invalid |
| POST | `/api/auth/login` | Log in — `{ email, password }` → returns `token` | 200 · 401 bad credentials |
| POST | `/api/auth/logout` | Blacklists current token | 200 · 401 |
| GET | `/api/users/me` | Current user's profile | 200 · 401 |
| POST | `/api/notes` | Create note — `{ title, content }` | 201 · 400 invalid title · 401 |
| GET | `/api/notes` | List user's notes, optional `?search=` | 200 · 400 bad search · 401 |
| GET | `/api/notes/:id` | Get one note | 200 · 404 · 401 |
| PUT | `/api/notes/:id` | Update note — `{ title, content }` | 200 · 400 · 404 · 401 |
| DELETE | `/api/notes/:id` | Delete note | 200 · 404 · 401 |

Notes are always scoped to the logged-in user — trying to access another user's note returns `404`, not `403`.

### Example: register / login

**POST /api/auth/register** → `201`
```json
{
  "message": "user registered",
  "user": { "id": 1, "name": "Test User", "email": "test@example.com" }
}
```

**POST /api/auth/login** → `200`
```json
{
  "message": "logged in",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Test User", "email": "test@example.com" }
}
```

### Example: a note

```json
{
  "id": 1,
  "user_id": 1,
  "title": "My first note",
  "content": "some content",
  "created_at": "2026-07-28T12:00:00.000Z",
  "updated_at": "2026-07-28T12:00:00.000Z"
}
```
`POST /api/notes` returns this wrapped as `{ "message": "note created", "note": {...} }`. `GET /api/notes` returns `{ "notes": [...] }`. `GET /api/notes/:id` returns `{ "note": {...} }`.

Full request/response bodies for every endpoint are in the Postman collection.

## Postman

Files in `postman/`: `Notes-App.postman_collection.json` + `Notes-App-Local.postman_environment.json` (sets `baseUrl` to `localhost:5000`). Import both, select the environment, start the server, run requests in order.

## What's next

- Frontend: React setup, auth pages, notes dashboard (will need CORS enabled on the backend)