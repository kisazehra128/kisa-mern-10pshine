# Notes App

Full-stack Node.js/Express/MySQL + React notes application with per-user authentication.

## Stack

**Backend:** Node.js, Express, MySQL
**Auth:** bcrypt, JWT
**Validation:** Joi
**Logging:** Pino (`pino`, `pino-http`, `pino-pretty`)
**Testing (backend):** Mocha, Chai, Supertest, Sinon, Proxyquire, Postman
**Frontend:** React (Vite), React Router, Axios
**Version control:** Git, feature-branch workflow, CodeRabbit on PRs

## Where things stand

**Backend**
- Express server, routing, env config, `.gitignore`, CodeRabbit on PRs
- MySQL connected — schema, User model, Note model
- Auth done — register, login, logout, JWT, protected routes
- Notes CRUD done — create/read/update/delete, search, scoped per user
- Structured logging (Pino) — every request logged, `Authorization` header redacted
- Centralized error handling — consistent JSON errors, no leaked stack traces
- Joi request validation — bad input rejected with `400` before hitting the DB
- CORS enabled for the frontend origin
- 61 automated tests: integration (real Express app + real MySQL, self-cleaning) and unit (Sinon/Proxyquire-mocked DB layer)
- Postman collection for manual testing

**Frontend**
- React app scaffolded with Vite
- Signup and Login pages, wired to the real backend (JWT stored client-side, attached to every request via an axios interceptor)
- Protected routing — `/dashboard` requires a valid token, redirects to `/login` otherwise
- Dashboard — fetches and displays the logged-in user's real notes from the backend, with debounced search wired to the API's `?search=` param
- Dark mode toggle, persisted across sessions
- Pixel-art visual design, custom color palette

**Not built yet**
- Creating, editing, or deleting notes from the UI (backend endpoints already support all of this — see API reference below)
- Rich text editing
- Category filtering (sidebar categories are currently visual only)
- User profile screen

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_URL
```

Create the database and apply the schema (name must match `DB_NAME`):
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < database/schema.sql
```
Or run `database/schema.sql` in MySQL Workbench.

> No separate test database yet — tests run against the same DB and clean up their own data in an `after()` hook.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_URL at the backend, defaults to http://localhost:5000
```

## Running

```bash
# backend — from backend/
npm run dev     # http://localhost:5000
npm test        # 61 tests — see .mocharc.json for config

# frontend — from frontend/, in a separate terminal
npm run dev     # http://localhost:5173
```

Both need to be running at the same time for the frontend to work — the backend serves the API, the frontend consumes it.

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

Files in `backend/postman/`: `Notes-App.postman_collection.json` + `Notes-App-Local.postman_environment.json` (sets `baseUrl` to `localhost:5000`). Import both, select the environment, start the server, run requests in order.

## Branching

Feature branches off `develop`, merged via PR. Branch list so far:
- `feature/backend/project-setup`
- `feature/backend/database-and-auth-setup`
- `feature/backend/authentication`
- `feature/backend/notes-management`
- `feature/backend/logging-testing`
- `feature/frontend/frontend-auth-dashboard` — React setup, login/signup, dashboard, routing, API integration

## What's next

- Notes editor
- Project finalization