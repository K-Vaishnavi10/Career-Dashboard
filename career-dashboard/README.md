# AI-Powered Career Dashboard

Full-stack hackathon project — React (Vite) frontend + Node.js/Express backend.

## Features Implemented
- Resume Score & ATS Score (PDF/DOCX parsing + heuristic NLP scoring)
- Resume–Job Match Score (TF-IDF/keyword overlap matching, missing-keyword suggestions)
- GitHub Score (live GitHub REST API analysis: repos, stars, languages, activity)
- LinkedIn Score (manual structured-input scoring — see note below on LinkedIn API limits)
- Coding Profile Score (LeetCode GraphQL, Codeforces REST API, CodeChef unofficial API)
- Overall Employability Score (weighted aggregation across all sub-scores)
- AI-style personalized action plan (weakest-area prioritized recommendations)

## Project Structure
```
career-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/upload.js
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Scoring & analysis logic
│   │   ├── utils/textExtractor.js
│   │   └── server.js
│   ├── uploads/                # Resume file storage (gitignored)
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js       # Axios API wrapper
    │   ├── components/         # Reusable UI (ScoreBadge)
    │   ├── pages/               # One page per analyzer + Overall dashboard
    │   ├── ScoreContext.jsx    # Shares scores across pages
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Optional: add a GitHub Personal Access Token to .env to raise GitHub API rate limits
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173, proxies /api to backend
```

Open http://localhost:5173 in your browser.

## Authentication (Google & GitHub OAuth)

All `/api/*` analyzer endpoints (everything except `/api/auth/*` and `/api/health`) now require
a logged-in user. Auth uses Passport.js OAuth strategies + stateless JWTs (no server-side
sessions), so the token is just stored in the browser's `localStorage` and sent as a
`Bearer` header on every request.

### 0. Set up MongoDB

The app needs a running MongoDB instance to store logged-in users.

- **Local**: install MongoDB Community Server and run it, or `docker run -d -p 27017:27017 mongo`.
  Default connection string: `mongodb://127.0.0.1:27017/career-dashboard`.
- **Atlas (free tier, no local install)**: create a cluster at https://www.mongodb.com/cloud/atlas,
  add a database user, allow your IP, and copy the connection string
  (`mongodb+srv://<user>:<password>@<cluster>.mongodb.net/career-dashboard`).

Set it in `backend/.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/career-dashboard
```

If `MONGODB_URI` is missing or unreachable, the rest of the app (resume/GitHub/coding analyzers)
still runs fine — only login (`/api/auth/*`) depends on MongoDB, and the server logs a clear
warning instead of crashing.

### 1. Create OAuth credentials

**Google** — https://console.cloud.google.com/apis/credentials
- Create an OAuth 2.0 Client ID (type: Web application)
- Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
- Copy the Client ID and Client Secret

**GitHub** — https://github.com/settings/developers → "New OAuth App"
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
- Copy the Client ID and generate a Client Secret

### 2. Configure backend/.env
```
JWT_SECRET=some_long_random_string
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...
```
Note: `GITHUB_OAUTH_CLIENT_ID/SECRET` (login) is separate from `GITHUB_TOKEN` (the personal
access token used by the GitHub *Analyzer* feature to read repo data) — they serve different
purposes and can be set independently.

### 3. Auth flow
1. User clicks "Continue with Google/GitHub" on `/login` → browser navigates to
   `GET /api/auth/google` or `/api/auth/github`.
2. Passport redirects to the provider's consent screen, then back to
   `/api/auth/{provider}/callback`.
3. Backend upserts the user into MongoDB (`backend/src/models/User.model.js`) and issues a JWT, redirecting the browser to
   `http://localhost:5173/oauth-callback?token=...`.
4. The frontend's `OAuthCallbackPage` stores the token in `localStorage` and redirects into
   the dashboard. The Axios client (`frontend/src/api/client.js`) attaches the token to every
   subsequent request automatically.
5. Unauthenticated visits to any dashboard route redirect to `/login`
   (`frontend/src/auth/ProtectedRoute.jsx`). A 401 response from the API also bounces the user
   back to `/login` and clears the stale token.

### Auth endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/auth/google | Starts Google OAuth flow |
| GET | /api/auth/google/callback | Google OAuth redirect target |
| GET | /api/auth/github | Starts GitHub OAuth flow |
| GET | /api/auth/github/callback | GitHub OAuth redirect target |
| GET | /api/auth/me | Returns the current user (requires `Authorization: Bearer <token>`) |
| POST | /api/auth/logout | No-op endpoint for symmetry (JWTs are stateless; logout just discards the token client-side) |

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/resume/analyze | Upload resume (multipart `resume` field) → Resume + ATS score |
| POST | /api/jd-match | `{ resumeText, jdText }` → Match score + keyword gaps |
| GET | /api/github/:username | GitHub profile analysis |
| POST | /api/linkedin/analyze | Manual LinkedIn profile data → score |
| POST | /api/coding/analyze | `{ leetcodeUsername, codeforcesHandle, codechefUsername }` → coding score |
| POST | /api/overall | All sub-scores → Overall Employability Score + action plan |

## Notes & Limitations
- **LinkedIn**: There is no public, ToS-compliant API for scraping arbitrary LinkedIn profiles.
  This project uses a manual structured-input form (or LinkedIn's own "Get a copy of your data"
  export) instead of live scraping, to stay compliant and reliable for a demo.
- **CodeChef**: No official public API exists; the app uses a best-effort community API
  (`codechef-api.vercel.app`) with graceful fallback if it's unavailable.
- **GitHub rate limits**: Unauthenticated requests are limited to 60/hour. Add a
  `GITHUB_TOKEN` in `backend/.env` to raise this to 5,000/hour.

## Score Formulas
See inline comments in `backend/src/services/*.service.js` for exact weightages used in each
scoring formula (Resume, ATS, JD Match, GitHub, LinkedIn, Coding, Overall).
