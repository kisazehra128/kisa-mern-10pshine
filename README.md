# Notes App

Full-stack notes app — Node/Express/MySQL backend, React frontend, JWT auth.

## Stack

Node.js, Express, MySQL, JWT, Joi, Pino · React (Vite), React Router, Axios, Tiptap
Testing: Mocha, Chai, Supertest, Sinon

## Features

- Auth: register, login, logout, protected routes
- Notes: full CRUD, search, rich text editor
- Categories: per-user, create/delete your own, filter notes by category, live counts in the sidebar
- Confirm dialogs on all deletes (no browser popups)
- Dark mode, responsive layout, user profile
- 95 backend tests

## Setup

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, FRONTEND_URL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < database/schema.sql
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000
```

## Running

```bash
# backend
npm run dev     # http://localhost:5000
npm test

# frontend (separate terminal)
npm run dev     # http://localhost:5173
```

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
| GET / PUT / DELETE | `/api/notes/:id` | `{ title, content, category }` (PUT) |
| GET | `/api/categories` | → `{ total, categories: [{id, name, slug, icon, count}] }` |
| POST | `/api/categories` | `{ name, icon }` |
| DELETE | `/api/categories/:id` | — |

A note's `category` is the matching category's `slug`. Deleting a category doesn't delete its notes — they just lose the tag.

Full request/response examples: Postman collection in `backend/postman/`.

## What's next

PR #8 — `feature/project-finalization`
- SonarQube fixes
- Bug fixes
- Code cleanup
- Optional: export/import notes

