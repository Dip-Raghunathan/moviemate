# MovieMate — Full Stack MVP

"Never Watch Movies Alone Again." Auto-matches moviegoers into private rooms by movie, cinema, date, time, match type, and intent — then opens a real chat room.

## What's actually implemented

- **Auth**: Signup, Login, Logout, Forgot/Reset Password (real email via SMTP), JWT-based sessions.
- **Input validation**: every route that accepts a body/param/query is validated server-side with `express-validator` (`backend/middleware/validators.js`) — required fields, email format, password length, age range (16–100), gender enum, strict `YYYY-MM-DD` / `HH:mm` formats, Mongo ID format on route params, message length caps. Validation errors return a clean `400` with a readable message instead of leaking a raw Mongoose error.
- **Auto-matching engine** (server-side, no manual room picking):
  - **Solo Match** (2 people) — choose **Friendship** (anyone) or **Date** (strict opposite-gender 1-on-1).
  - **Group Match** (4 people) — always Friendship-style, mixed genders, no dating.
  - **Women-only safety toggle** — available to female users on Friendship rooms (Solo or Group). When on, they only match into all-female rooms. Has no effect on Date (already opposite-gender) and has no effect for male users.
  - Rooms auto-lock to `FULL` at capacity and reopen to `OPEN` if someone leaves.
- **Private chat** — polling-based (every ~2.5s), not Socket.io, because the project is deployed on Vercel's serverless functions, which can't hold a persistent WebSocket connection open. This was a deliberate trade-off, not an oversight — see "Why polling, not Socket.io" below.
- **Profile** — view/edit basics, default women-only preference.
- **Coming soon placeholders (UI only, not implemented)**: ID Verification, Ratings.

## Folder structure

```
moviemate/
  backend/
    api/index.js        <- Vercel serverless entry point
    config/db.js
    controllers/         <- auth, room (matching), chat, user
    middleware/           <- JWT auth guard, error handler, input validators
    models/               <- User, Room, Message (Mongoose)
    routes/
    utils/                <- matchingEngine.js (the core logic), email, JWT helper, seed.js (test data)
    server.js             <- local dev entry point
    vercel.json
    .env.example
  frontend/
    src/
      pages/              <- Home, Login, Signup, Dashboard, Matching, Chat, Profile, etc.
      components/         <- Navbar, ProtectedRoute
      context/AuthContext.jsx
      services/            <- api.js (axios), authService, roomService, chatService, userService
    vercel.json            <- SPA rewrite rule
    .env.example
```

## Why polling, not Socket.io

Vercel serverless functions are short-lived and stateless — they spin up per-request and shut down, so they can't hold a long-lived WebSocket connection the way Socket.io needs. Given the choice (made earlier in this build) to deploy on Vercel, the chat instead polls `GET /api/rooms/:id/messages?after=<timestamp>` every ~2.5 seconds. It feels "real-time enough" for a movie-companion chat and needs zero extra infrastructure.

If you later want true real-time chat, the cleanest path is deploying the backend on Render or Railway instead (both support persistent connections) and re-introducing Socket.io — the Message/Room models don't need to change, only the transport layer.

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI (MongoDB Atlas), JWT_SECRET, SMTP_* values
npm install
npm run dev          # starts on http://localhost:5000
```

### Test data (optional but recommended)

To avoid manually signing up several accounts just to test matching, run:

```bash
npm run seed
```

This wipes Users/Rooms/Messages in your connected database and creates 8 test users (all with password `password123`) plus 5 pre-built rooms covering every matching scenario:

| Login | Scenario |
|---|---|
| `alex@test.com` | Friendship Solo, **open** (1/2) — log in as a *second* test user with different creds and start a Friendship Solo match for the same movie/cinema/date/time to see auto-join in action |
| `mike@test.com` / `tom@test.com` | Friendship Solo, **full** (2/2), with chat history already in the room |
| `nina@test.com` | Date intent, **open** (1/2) — waiting for a male match; log in as `alex` or `tom` and start a Date match for the same show to see opposite-gender pairing work |
| `priya@test.com` / `emma@test.com` | Women-only Friendship Solo, **full** (2/2) — confirms men never enter this room |
| `john@test.com` / `sarah@test.com` | Group Friendship, **open** (2/4) — log in as two more users and Group Match the same show to fill it to 4 |

**MongoDB Atlas (free tier)**: create a free cluster at mongodb.com/cloud/atlas, create a DB user, allow network access from anywhere (0.0.0.0/0) for simplicity in dev, then copy the connection string into `MONGO_URI`.

**SMTP for password reset emails**: any SMTP provider works (Gmail with an App Password, SendGrid, Mailtrap for testing, or Resend's SMTP relay at smtp.resend.com). Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000, proxies /api to localhost:5000
```

Open `http://localhost:3000`.

## Deploying to Vercel (free)

You'll deploy **two separate Vercel projects** — one for backend, one for frontend — since they have different build configs.

### Backend

1. Push the `backend/` folder to its own GitHub repo (or use Vercel's monorepo root-directory setting).
2. In Vercel: New Project → import the repo → set **Root Directory** to `backend`.
3. Add environment variables in Vercel's dashboard (Settings → Environment Variables): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (set this to your frontend's Vercel URL once you have it), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
4. Deploy. Your API will be live at `https://<your-backend>.vercel.app/api/...`.

### Frontend

1. Push `frontend/` to its own repo (or set Root Directory to `frontend` in the same monorepo).
2. In Vercel: New Project → import → set **Root Directory** to `frontend`. Framework preset: Vite.
3. Add environment variable: `VITE_API_URL=https://<your-backend>.vercel.app/api`.
4. Deploy. Then go back to the backend project's env vars and set `CLIENT_URL` to this frontend's URL (for CORS), then redeploy the backend.

## Database models (MongoDB)

- **User**: name, email, password (hashed), age, gender (`male`/`female`, required & fixed), favoriteGenres, profilePicture, moviesAttended, isPro, womenOnlyMode, password reset fields.
- **Room**: movie, cinema, date, time, matchType (`solo`/`group`), intent (`friendship`/`date`), womenOnly, capacity, status (`open`/`full`), members[] (user ref + their gender at join time).
- **Message**: room ref, sender ref (null for system messages), senderName, text, isSystem, createdAt (used as timestamp).

## Matching rules (exact spec implemented)

| Match Type | Intent options | Gender behavior |
|---|---|---|
| Solo (2) | Friendship | Anyone matches anyone. Female users can opt into a women-only room. |
| Solo (2) | Date | Strict opposite-gender pairing only. |
| Group (4) | Friendship only | Mixed genders. Female users can opt into a women-only room. |

This logic lives in one place: `backend/utils/matchingEngine.js`, function `findOrCreateRoom`. It was unit-tested against 14 scenarios (opposite-gender Date matching, women-only exclusion of men, group always being friendship, capacity locking) before being wired into the API.

## What's intentionally NOT built (per your original AI prompt)

- ID Verification / Verified Badge — UI placeholder only.
- User Ratings & Reviews — UI placeholder only.
- Real Socket.io — replaced with polling for Vercel compatibility (see above).
