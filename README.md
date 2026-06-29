# 🍿 PhilixMate — Never Watch Movies Alone Again

**PhilixMate** is a full-stack, enterprise-grade movie companion matching platform designed to connect moviegoers. Whether looking for a solo date or a group of movie enthusiasts to watch the latest blockbusters, PhilixMate automatically groups users into secure rooms based on movie selections, theater locations, dates, times, and match intents.

---

## 🚀 Key Features

* **Intelligent Auto-Matching Engine**: Matches users based on movie, cinema, date, time, match type (Solo/Group), and intent (Friendship/Date).
* **Women-Only Safety Toggle**: Female users can enable a toggle to restrict their matches exclusively to other female users for maximum comfort and security.
* **Stateless Private Chat**: Polling-based (every 2.5s) live chat built to run on serverless platforms (e.g. Vercel) without persistent WebSockets.
* **Secure Modular Authentication**: Secure user registration, login, forgotten password resets (via real SMTP email), and JWT active session rotation.
* **Premium Enterprise Design System**: Modern, responsive React UI built with Outfitters typography, dark mode aesthetics, and micro-animations.

---

## 📁 Repository Structure

PhilixMate is organized as a clean monorepo:

```
philixmate/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations & env loaders
│   │   ├── modules/         # Modular service boundaries (auth, matching, chat, profiles, etc.)
│   │   ├── utils/           # Shared helper routines & utilities
│   │   └── app.js           # Main Express configuration
│   ├── tests/               # Backend unit and integration test suites
│   ├── utils/               # Scripts, database seeding, & email services
│   ├── server.js            # Local Node.js entry point
│   ├── vercel.json          # Deployment routing configuration
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── core/            # Global Axios client & Auth context providers
│   │   ├── features/        # Feature domains (authentication, matching, profile, chat)
│   │   ├── services/        # API client integrations & development authentication bypass
│   │   └── shared/          # Reusable components, icons, and UI tokens
│   ├── index.html           # Main entry document
│   ├── vite.config.js       # Vite bundler options
│   ├── vercel.json          # SPA rewrite rules
│   └── .env.example
├── package.json             # Monorepo task configurations
└── README.md
```

---

## 🛠️ Local Development Setup

### Prerequisite Environment Variables
Before running the services, create local `.env` files in both subfolders by copying the provided `.env.example` templates.

#### 1. Backend Service
```bash
cd backend
npm install
npm run dev         # Runs on http://localhost:5000
```
*Make sure to configure `MONGO_URI`, `JWT_SECRET`, and your SMTP settings in `backend/.env`.*

#### 2. Frontend Application
```bash
cd ../frontend
npm install
npm run dev         # Runs on http://localhost:3000
```
*By default, the Vite dev server will proxy requests to the backend on port 5000.*

---

## 🧪 Running Unit Tests

Verify everything is working using the local node test suites:

* **Backend Tests**:
  ```bash
  npm --prefix backend run test
  ```
* **Frontend Tests**:
  ```bash
  node frontend/src/services/devAuth.test.js
  ```

---

## 🌐 Deployment to Vercel

Both the frontend and backend are configured to deploy seamlessly to Vercel:

1. **Backend API**:
   - Set **Root Directory** to `backend`.
   - Set env variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, and SMTP settings.
2. **Frontend UI**:
   - Set **Root Directory** to `frontend`.
   - Preset: **Vite**.
   - Set env variables: `VITE_API_URL` (points to your deployed backend URL).
