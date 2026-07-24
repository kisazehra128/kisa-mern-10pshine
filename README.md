```markdown
# Notes App

A full-stack MERN Notes Application built as part of the 10P Shine internship.

## Overview

This repository contains the backend for a Notes application. The project is in early development, with the initial Express server, routing, environment configuration, and testing infrastructure in place. Frontend, database integration, and authentication will be added in subsequent phases.

## Progress

- Backend project setup completed
- Express.js server configured
- Basic routing implemented
- Environment configuration added, with an example `.env` file for reference
- Backend tests added (Mocha, Chai, Supertest)
- Local ignore rules (`.gitignore`) expanded for development
- Automated review rules configured for key branches

## Technology Stack

**Backend**
- Node.js
- Express.js

**Testing**
- Mocha
- Chai
- Supertest

Frontend framework, database, and authentication are not yet integrated and will be documented here once added.

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

Minimum required variable:

```
PORT=5000
```

### Running the Server

```bash
npm run dev
```

The server runs on `http://localhost:5000` by default.

### Running Tests

```bash
npm test
```

## API Endpoints

| Method | Endpoint       | Description                   |
|--------|----------------|--------------------------------|
| GET    | `/`            | Returns a welcome message      |
| GET    | `/api/health`  | Returns server health status   |

### Example Responses

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

## Roadmap

- Database integration
- User authentication
- Notes CRUD API
- Frontend implementation
```