# Notes App

Notes App backend — built with Node.js, Express, and MySQL. Currently early-stage, backend only.

## Where things stand

- Backend project set up
- Basic Express server running
- Basic routing done
- Env config added, with a `.env.example` for reference
- Backend tests added (Mocha, Chai, Supertest)
- Updated `.gitignore` for dev files
- CodeRabbit set up to auto review PRs on main/develop
- MySQL hooked up
- Schema created for users and notes tables
- User and Note models done (talks to the DB directly)

## Stack

**Backend**
- Node.js
- Express.js
- MySQL

**Testing**
- Mocha
- Chai
- Supertest

Frontend isn't in yet, will update this once it's added.

## Getting it running

```bash
cd backend
npm install
```

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

## Database Setup

The schema doesn't create a database for you — create one that matches the `DB_NAME` in your `.env` first, then run the schema against it.

Either via MySQL Workbench (create a schema named to match your `DB_NAME`, then run `backend/database/schema.sql` as a query), or via the CLI if you have it installed:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < backend/database/schema.sql
```

## Running the server

```bash
npm run dev
```

Runs on `http://localhost:5000` by default.

Run tests with:

```bash
npm test
```

## APIs so far

| Method | Endpoint      | What it does           |
| ------ | ------------- | ----------------------- |
| GET    | `/`           | Welcome message          |
| GET    | `/api/health` | Server health check      |

**GET /**
```json
{
  "message": "Welcome to Notes API"
}
```

**GET /api/health**
```json
{
  "success": true,
  "message": "Backend is running."
}
```

## What's next

- Logging + global error handling
- Expanded test coverage
- Frontend