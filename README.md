# NODUS Backend

## Project Overview

NODUS is a platform where users post real-world problems, AI enhances them, and the community submits and votes on solutions.

The backend provides:

- REST APIs for auth, solutions, AI, user profiles, and notifications
- Database management via MongoDB
- AI integration for problem refinement, matching, ranking, and hints
- JWT-based authentication and authorization
- Centralized error handling and input validation

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- TypeScript (strict mode)
- JWT + scrypt for auth
- dotenv for environment configuration
- Express middleware-based validation

---

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
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_REFRESH_TOKEN=your_jwt_refresh_token
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### 4) Run the Server

Development mode:

```bash
npm run dev
```

Type-check only:

```bash
npx tsc --noEmit
```

Clean build + run production:

```bash
npm run build
npm start
```

> `npm run build` runs `clean` first (removes `dist/`) then compiles TypeScript.

Server runs on:

```
http://localhost:3000
```

Health check:

```
GET http://localhost:5000/api/v1/health
```

---

## Project Structure

```
src/
  App.ts                  # Entry point — Express setup, DB, routes, error handlers
  config/
    env.ts                # Environment variables
    database.ts           # MongoDB connection
  controllers/
    auth.ts               # Auth request handlers
    solution.ts           # Solution request handlers
    aiController.ts       # AI request handlers
    userController.ts     # User profile request handlers
    notificationController.ts  # Notification request handlers
  middleware/
    auth.ts               # JWT verification, protects routes
    errorHandler.ts       # Centralized typed error handling
  models/
    User.ts               # Unified user schema (auth + profile)
    Solution.ts           # Solution schema
    problem.ts            # Problem schema
    Admin.ts              # Admin schema
    Notification.ts       # Notification schema
  routes/
    authRoutes.ts         # /api/v1/auth
    solutionRoutes.ts     # /api/v1/solutions
    aiRoutes.ts           # /api/v1/ai
    userRoutes.ts         # /api/v1/users
    notificationRoutes.ts # /api/v1/notifications
  services/
    authService.ts        # Auth business logic
    solutionService.ts    # Solution business logic
    refineService.ts      # AI refinement logic
    matchService.ts       # AI matching logic
    aiClient.ts           # AI provider client
    userService.ts        # User profile business logic
    notificationService.ts # Notification business logic + createNotification helper
  types/
    express.d.ts          # Express request type extensions (req.user)
  utils/
    tokenUtils.ts         # JWT generate/verify + cookie helpers
  validations/
    authSchema.ts         # Auth input validation
    solutionSchema.ts     # Solution input validation
    ai.validation.ts      # AI endpoint validation
    userSchema.ts         # User profile validation
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

> No auth header required for register and login.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register a new user |
| POST | `/api/v1/auth/login` | ❌ | Login and receive JWT |

#### POST /api/v1/auth/register

Request body:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "userId",
    "email": "user@example.com"
  }
}
```

#### POST /api/v1/auth/login

Request body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "userId",
    "email": "user@example.com"
  }
}
```

---

### Solutions

> All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/solutions` | ✅ | Submit a solution |
| GET | `/api/v1/solutions?problemId=<id>` | ✅ | Get solutions for a problem |
| GET | `/api/v1/solutions/:problemId` | ✅ | Get solutions for a problem |

#### POST /api/v1/solutions

Request body:

```json
{
  "problemId": "6802f1a57bb0a1a5f1c13e91",
  "content": "This is a solution with enough detail",
  "link": "https://example.com"
}
```

Validation:

- `problemId` — required, valid MongoDB ObjectId
- `content` — required, minimum 10 characters
- `link` — optional

Response:

```json
{
  "_id": "solutionId",
  "problemId": "6802f1a57bb0a1a5f1c13e91",
  "content": "This is a solution with enough detail",
  "link": "https://example.com",
  "createdBy": "userId",
  "votes": 0,
  "createdAt": "2026-04-26T00:00:00.000Z"
}
```

---

### AI

> All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/ai/enhance` | ✅ | Enhance/refine a problem with AI |
| GET | `/api/v1/ai/match/:problemId` | ✅ | Match candidate solvers for a problem |
| POST | `/api/v1/ai/rank-solutions/:problemId` | ✅ | Rank solutions for a problem |
| GET | `/api/v1/ai/hint/:problemId` | ✅ | Get an AI hint for a problem |

#### POST /api/v1/ai/enhance

Request body:

```json
{
  "title": "Need better onboarding",
  "description": "Users are dropping early and onboarding needs to be clearer.",
  "category": "product"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "refinedTitle": "Improved onboarding to reduce drop-off",
    "refinedDesc": "Enhanced problem statement with context and outcomes",
    "suggestedTags": ["onboarding", "ux"],
    "difficulty": "medium",
    "suggestedBudget": 100
  }
}
```

> Triggers an `ai_result_ready` notification for the user.

#### GET /api/v1/ai/match/:problemId

Response:

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "solverId": "solverId",
        "matchScore": 85,
        "reason": "Strong fit for required skills",
        "confidence": "High"
      }
    ],
    "topPick": "solverId"
  }
}
```

> Triggers a `solution_matched` notification for the user.

---

### User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users/me` | ✅ | Get current user's profile |
| PUT | `/api/v1/users/me` | ✅ | Update current user's profile |
| GET | `/api/v1/users/:id` | ❌ | Get any user's public profile |

#### GET /api/v1/users/me

Response:

```json
{
  "_id": "userId",
  "email": "user@example.com",
  "displayName": "John Doe",
  "bio": "Building cool things",
  "avatarUrl": "https://example.com/avatar.png",
  "skills": ["TypeScript", "React"],
  "createdAt": "2026-04-26T00:00:00.000Z",
  "updatedAt": "2026-04-26T00:00:00.000Z"
}
```

#### PUT /api/v1/users/me

Request body (all fields optional):

```json
{
  "displayName": "John Doe",
  "bio": "Building cool things",
  "avatarUrl": "https://example.com/avatar.png",
  "skills": ["TypeScript", "React"]
}
```

Validation:

- `displayName` — max 50 characters
- `bio` — max 300 characters
- `skills` — array of strings, max 10 items

---

### Notifications

> All routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications` | ✅ | Get all notifications for current user |
| PATCH | `/api/v1/notifications/:id/read` | ✅ | Mark one notification as read |
| PATCH | `/api/v1/notifications/read-all` | ✅ | Mark all notifications as read |
| DELETE | `/api/v1/notifications/:id` | ✅ | Delete a notification |

#### GET /api/v1/notifications

Response:

```json
[
  {
    "_id": "notificationId",
    "userId": "userId",
    "type": "ai_result_ready",
    "message": "Your AI enhancement is ready.",
    "read": false,
    "createdAt": "2026-04-26T00:00:00.000Z"
  }
]
```

Notification types:

- `solution_matched` — a solution was matched to a problem
- `ai_result_ready` — AI result is ready
- `new_ranking` — a new ranking event
- `system` — general system notification

---

## Authentication Guide (For Frontend)

### How to authenticate

1. Call `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
2. Save the returned `token`
3. Include it in every protected request as a header:

```
Authorization: Bearer <token>
```

### Token storage recommendation

Store the JWT in an `httpOnly` cookie (set automatically by the server) or in memory. Avoid `localStorage` for security.

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "message": "Unauthorized"
}
```

Common status codes:

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Database Models

### User

| Field | Type | Notes |
|-------|------|-------|
| email | String | required, unique |
| password | String | hashed |
| displayName | String | max 50 chars |
| bio | String | max 300 chars |
| avatarUrl | String | optional |
| skills | String[] | max 10 items |
| createdAt | Date | auto |
| updatedAt | Date | auto |

### Solution

| Field | Type | Notes |
|-------|------|-------|
| problemId | ObjectId | ref: Problem |
| content | String | min 10 chars |
| link | String | optional |
| createdBy | ObjectId | ref: User |
| votes | Number | default 0 |
| createdAt | Date | auto |

### Notification

| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | ref: User |
| type | Enum | solution_matched, ai_result_ready, new_ranking, system |
| message | String | required |
| read | Boolean | default false |
| createdAt | Date | auto |

---

## Test Coverage

Integration tests cover:

| # | Test |
|---|------|
| 1 | POST /api/v1/auth/register |
| 2 | POST /api/v1/auth/login |
| 3 | POST /api/v1/solutions (protected) |
| 4 | GET /api/v1/solutions (protected) |
| 5 | POST /api/v1/ai/enhance (mocked AI client) |
| 6 | PATCH /api/v1/notifications/:id/read |
| 7 | PATCH /api/v1/notifications/read-all |
| 8 | DELETE /api/v1/notifications/:id |

Run tests:

```bash
npm test
```

---

## Development Rules

### Separation of Concerns

- Routes define endpoints only
- Controllers handle request/response flow
- Services hold business logic and DB access
- Models define schema and validation rules

### Error Handling

All errors are thrown as typed `HttpError` instances and handled centrally by `errorHandler.ts`. Controllers do not return raw error responses.

### Validation First

Validate all inputs before database writes. Reject invalid requests early with 400-level responses.

### Async/Await Only

Use `async/await` throughout. Never mix callbacks.

### No Hardcoding

All secrets and config live in `.env`. No hardcoded URLs or credentials.

---

## Team Workflow

### Branching

```bash
git checkout -b feature/your-feature-name
```

### Commits

```
feat: add notification read-all endpoint
fix: handle missing problemId in solution controller
chore: clean build script
docs: update README with full API reference
```

### Integration Rule

Verify all endpoints in Postman or Thunder Client before frontend integration. Share request/response contracts with the frontend team using this README.

---

## Current Branch Status

| Branch | Status |
|--------|--------|
| `main` | 🔒 Stable, untouched |
| `dev` | ✅ All features merged, tested, hardened |

