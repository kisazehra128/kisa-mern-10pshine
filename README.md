# Notes App

Backend for a MERN Notes App, built as part of my 10P Shine internship. Still early on, so a lot of this is bare bones for now.

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

Auth and frontend aren't in yet, will update this once they're added.

## Getting it running

```
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000` by default.

Run tests with:

```
npm test
```

## APIs so far

| Method | Endpoint      | What it does           |
| ------ | ------------- | ----------------------- |
| GET    | `/`           | Welcome message          |
| GET    | `/api/health` | Server health check      |

**GET /**
```
{
  "message": "Welcome to Notes API"
}
```

**GET /api/health**
```
{
  "success": true,
  "message": "Backend is running."
}
```

## What's next

- User authentication
- Notes CRUD API
- Frontend