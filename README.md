# Notes App

Full-stack notes app — Node/Express/MySQL backend, React frontend, JWT auth.

## Stack

Node.js, Express, MySQL, JWT, Joi, Pino · React (Vite), React Router, Axios, Tiptap
Testing: Mocha, Chai, Supertest, Sinon (backend) · Jest, React Testing Library (frontend)

## Features

- Auth: register, login, logout, protected routes
- Notes: create/edit, search, rich text editor with images (2MB max per image, hover an inserted image and click ✕ to remove it), soft delete, restore, permanent delete
- Search: matches every word you type against a note's title and body, in any order, ignoring formatting debounced as you type
- Categories: per-user, create/delete your own, filter notes by category, live counts in the sidebar
- Trash: deleted notes stay in the sidebar until restored or permanently deleted
- Dark mode, responsive layout, user profile
- 106 backend tests, frontend component tests with Jest + React Testing Library

## Setup

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_URL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < database/schema.sql
```

> Already have a `notes_app` database from before? The `notes.content` column
> used to be `TEXT` (~64KB max), which silently truncated/rejected saves once
> a note had an embedded image. Run the one-time migration to widen it:
> ```bash
> mysql -u root -p notes_app < database/migrate_content_longtext.sql
> ```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000
```

## Running

Backend and frontend each need their own terminal, running at the same time.

```bash
# terminal 1 — backend
cd backend
npm run dev     # http://localhost:5000
```

```bash
# terminal 2 — backend tests
cd backend
npm test
```

```bash
# terminal 3 — frontend
cd frontend
npm run dev     # http://localhost:5173
```

```bash
# terminal 4 — frontend tests
cd frontend
npm test
```

## Code Quality

Static analysis via [SonarQube](https://www.sonarsource.com/products/sonarqube/) Community Build, run locally.

**Quality Gate: ✅ Passed**

- Reliability, Maintainability, and Security ratings tracked on every scan
- Regex backtracking risks removed, accessibility issues fixed (button semantics, keyboard support), and redundant string operations cleaned up across the frontend and backend
- Frontend test coverage can now be generated with `npm test -- --coverage` (from `frontend/`) and fed into SonarQube via `sonar.javascript.lcov.reportPaths` in `sonar-project.properties`; the Coverage condition can be re-added to the Quality Gate once that's wired in consistently

**Running the scan locally:**
```bash
# 1. Start SonarQube (if running via Docker)
docker start sonarqube   # or: docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# 2. From the project root, run the scanner
sonar-scanner -D"sonar.host.url=http://localhost:9000" -D"sonar.token=YOUR_TOKEN"
```
Generate a token from SonarQube under **My Account → Security → Generate Token**. Analysis config lives in `sonar-project.properties`.

## API

All `/api/notes`, `/api/categories`, `/api/users/me` routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Body |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` → `token` |
| POST | `/api/auth/logout` | — |
| GET | `/api/users/me` | — |
| POST | `/api/notes` | `{ title, content, category }` |
| GET | `/api/notes` | `?search=` `?category=` |
| GET / PUT / DELETE | `/api/notes/:id` | `{ title, content, category }` (PUT); DELETE moves the note to trash |
| GET | `/api/notes/trash` | → trashed notes |
| PATCH | `/api/notes/:id/restore` | — |
| DELETE | `/api/notes/:id/permanent` | — |
| GET | `/api/categories` | → `{ total, categories: [{id, name, slug, icon, count}] }` |
| POST | `/api/categories` | `{ name, icon }` |
| DELETE | `/api/categories/:id` | — |

A note's `category` is the matching category's `slug`. Deleting a category doesn't delete its notes — they just lose the tag.

Full request/response examples: Postman collection in `backend/postman/`.
