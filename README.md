# Notes App

Backend foundation for a MERN Notes Application, built as part of the 10P Shine internship. This project is in early development.

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
- User authentication done — register, login, JWT, protected routes
- Postman collection added for manually testing all endpoints

## Stack

**Backend**
- Node.js
- Express.js
- MySQL

**Auth**
- bcrypt (password hashing)
- jsonwebtoken (JWT)

**Testing**
- Mocha
- Chai
- Supertest
- Postman (manual API testing)

Frontend isn't in yet, will update this once it's added.

## Getting it running

```bash
cd backend
npm install
```

## Environment Setup

```bash
cp .env.example .env
```

Fill in the values in `.env`, including a secure random string for `JWT_SECRET`.

## Database Setup

In `.env`, set `DB_NAME` to whatever you want your database to be called. Then create a database with that same name and apply the schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notes_app;"
mysql -u root -p notes_app < backend/database/schema.sql
```
*(replace `notes_app` in both commands with whatever you set `DB_NAME` to)*

Alternatively, run `backend/database/schema.sql` in MySQL Workbench against a database named to match `DB_NAME`.

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

| Method | Endpoint             | What it does                          | Auth required |
| ------ | -------------------- | -------------------------------------- | -------------- |
| GET    | `/`                   | Welcome message                        | No             |
| GET    | `/api/health`         | Server health check                    | No             |
| POST   | `/api/auth/register`  | Create a new user                      | No             |
| POST   | `/api/auth/login`     | Log in, get back a JWT                 | No             |
| GET    | `/api/users/me`       | Get the logged-in user's profile       | Yes            |

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

**POST /api/auth/register**

Body:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "user registered",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**POST /api/auth/login**

Body:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "logged in",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**GET /api/users/me**

Requires an `Authorization: Bearer <token>` header, using the token from login.

Response:
```json
{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "created_at": "2026-07-28T12:00:00.000Z"
  }
}
```

## Testing the API manually (Postman)

All endpoints above were manually verified with Postman against the running local server, alongside the automated Mocha/Chai/Supertest suite.

Collection and environment files are in `postman/`:
- `Notes-App.postman_collection.json` — one request per endpoint
- `Notes-App-Local.postman_environment.json` — sets `baseUrl` to `http://localhost:5000`

To use them:
1. Import both files into Postman (`File > Import`)
2. Select `Notes App - Local` from the environment dropdown
3. Start the server with `npm run dev`
4. Run the requests in order: Welcome → Health Check → Register → Login → Get Current User

## What's next

- Logging + global error handling
- Expanded test coverage
- Frontend