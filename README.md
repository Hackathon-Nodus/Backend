# NODUS Backend Team Onboarding Guide

## Project Overview

NODUS is a platform where users post real-world problems, AI enhances them, and the community submits and votes on solutions.

The backend provides:

- REST APIs
- Database management
- AI integration points
- Core business logic

## Tech Stack

- Node.js + Express.js (API server)
- MongoDB + Mongoose (database)
- TypeScript (type-safe backend code)
- dotenv (environment configuration)
- Optional validation libraries: Zod / Joi

## Getting Started

### 1) Clone the Repository

```bash
git clone https://github.com/Hackathon-Nodus/Backend.git
cd Backend
```

### 2) Install Dependencies

```bash
npm install
```

### 3) Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 4) Run the Server

Development mode:

```bash
npm run dev
```
# Authentication API Documentation

Base URL: `http://localhost:<PORT>/api/v1/auth`

---

## Endpoints

### 1. Register User

Creates a new user account.

- **URL:** `/register`
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field      | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| `name`     | string | Yes      | User's full name     |
| `email`    | string | Yes      | User's email address |
| `password` | string | Yes      | User's password      |

#### Example Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Type-check only:

```bash
npx tsc --noEmit
```

Build + run production bundle:

```bash
npm run build
npm start
```

Server runs on:

```text
http://localhost:5000
```

## Project Structure

```text
src/
  controllers/     # Request handlers
  models/          # Mongoose schemas
  routes/          # API route definitions
  services/        # Domain/services logic
  middleware/      # Validation/auth/error middleware
  config/          # DB and environment config
  validations/     # Request validators
  types/           # Shared TS types
```

## API Structure

All endpoints are prefixed with:

- `/api/v1`

Current route mounting in this codebase:

- Solution routes: `/api/v1/solutions`
- Auth routes: `/api/v1/auth`
- Health check: `/api/v1/health`

## Solutions API

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/solutions | Submit solution |
| GET | /api/v1/solutions/:problemId | Get solutions for a problem |

### POST /api/v1/solutions

Request body:

```json
{
  "problemId": "6802f1a57bb0a1a5f1c13e91",
  "content": "This is a solution with enough detail",
  "link": "https://example.com"
}
```

Validation rules:

- `problemId` is required and must be a valid ObjectId
- `content` is required and must be at least 10 characters
- `link` is optional

## Database Models

### Problem (planned/related)

- id
- title
- description
- category
- difficulty
- status (open/solved)
- createdAt

### Solution (implemented)

- id
- problemId (ObjectId, ref: Problem)
- content (min length: 10)
- link (optional)
- votes (default: 0)
- createdAt

## Development Rules

### 1) Separation of Concerns

- Routes define endpoints
- Controllers handle request/response flow
- Services hold data-access business logic
- Models define schema rules

### 2) Validation First

- Validate all inputs before database writes
- Reject invalid requests early with 400-level responses

### 3) Async/Await Only

- Prefer async/await for all async operations
- Use try/catch in controllers and return consistent error responses

### 4) No Hardcoding

- Keep secrets/config in `.env`
- Avoid hardcoded external URLs and credentials

### 5) Keep It Modular

- Prefer feature-driven files and isolated responsibilities
- Keep features easy to test and evolve independently

## Team Workflow

### Branching

```bash
git checkout -b feature/your-feature-name
```

### Commits

Use clear commit messages:

- `feat: add solution submission API`
- `fix: handle missing problemId`
- `docs: add backend onboarding guide`

### Integration Rule

Backend should be stable before frontend integration:

- Verify endpoints in Postman/Thunder Client
- Share request/response contract with frontend

## Testing APIs

Tools:

- Postman
- Thunder Client

## Hackathon Strategy

- Build core features first
- Avoid overengineering
- Prioritize stability, speed, and clear API behavior

## Definition of Done

Backend is ready when:

- Problems API works
- Solutions API works
- Voting works
- AI enhancement works
- No crashes and consistent API responses

## Final Note

Frontend plugs into backend. Keep backend predictable, stable, and clean.
