# Social Media API & Frontend Deployment Guide

This guide provides step-by-step instructions for configuring, running, and deploying the Social Media API & Frontend application to **Vercel** with **MongoDB Atlas**.

---

## 1. Required Environment Variables

### Backend Environment Variables (Add to Vercel Project Settings)

| Variable Name | Description | Example / Value | Required |
| --- | --- | --- | --- |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` | Yes |
| `JWT_SECRET` | Primary JWT Secret key | `a_long_random_secure_secret_key` | Yes |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | `a_long_random_secure_access_secret_key` | Yes |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `a_long_random_secure_refresh_secret_key` | Yes |
| `CLIENT_URL` | Frontend origin URL for CORS | `https://your-app.vercel.app` (or `*` for initial setup) | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | `https://your-app.vercel.app` (or `*`) | Optional |
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Local server port | `3000` | Optional (default: 3000) |

### Frontend Environment Variables (If deployed separately)

| Variable Name | Description | Example / Value |
| --- | --- | --- |
| `VITE_API_URL` / `ENV_API_URL` | Deployed backend API base URL | `https://your-backend-api.vercel.app/api` |

---

## 2. Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Local Environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `MONGO_URI` in `.env` with your MongoDB Atlas connection string.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - Server running at: `http://localhost:3000`
   - Health check endpoint: `http://localhost:3000/api/health`
   - Static Web Application: `http://localhost:3000`

---

## 3. MongoDB Atlas Configuration

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create or select your Cluster (e.g. `Cluster0`).
3. Navigate to **Network Access** under Security:
   - Click **Add IP Address**.
   - Add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel's dynamic serverless IP ranges can access the database.
4. Navigate to **Database Access**:
   - Create a database user with read & write permissions.
5. Get your connection string:
   - Click **Connect** -> **Drivers** (Node.js).
   - Format: `mongodb+srv://<username>:<password>@cluster0.a4hy0id.mongodb.net/social-media-db?retryWrites=true&w=majority`
   - Set this string in Vercel as `MONGO_URI`.

---

## 4. Deploying to Vercel

### Option A: Monorepo / Single Application Deployment (Recommended)

Since this project serves both the static frontend (`public/`) and Express API endpoints (`/api/*`), deploying as a single Vercel project is recommended:

1. Push your code to GitHub (ensure `.env` is ignored by `.gitignore`).
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Framework Preset: **Other** or **Express.js**.
5. Root Directory: `./` (leave default).
6. **Environment Variables**: Add `MONGO_URI`, `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, `CLIENT_URL=*`.
7. Click **Deploy**.

### Option B: Separate Frontend & Backend Deployments

If you deploy frontend and backend separately:
1. **Deploy Backend first**: Set Root Directory to backend folder, configure backend env vars, and deploy. Note your backend URL (e.g. `https://social-media-api.vercel.app`).
2. **Deploy Frontend**: Set `VITE_API_URL` or `window.ENV_API_URL` to `https://social-media-api.vercel.app/api`.
3. **Update Backend CORS**: Change `CLIENT_URL` in backend Vercel settings to your frontend URL (`https://your-frontend.vercel.app`) and redeploy backend.

---

## 5. Testing the Deployed API

1. **Verify Health Endpoint**:
   ```bash
   curl https://YOUR-VERCEL-APP.vercel.app/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-09-07T20:15:00.000Z",
     "uptime": 12.34,
     "environment": "production"
   }
   ```

2. **Test User Registration / Login**:
   Open `https://YOUR-VERCEL-APP.vercel.app` in a web browser, test creating an account and logging in.

---

## 6. Architectural Caveats & Known Limitations

### File Uploads & Ephemeral Disk Storage
- **Current Setup**: Avatars are saved via `multer.diskStorage` to `/tmp/uploads` on Vercel or `public/uploads` locally.
- **Limitation**: Vercel Serverless Functions have ephemeral (temporary) filesystems. Files written to `/tmp` are wiped when serverless instances spin down or recycle.
- **Production Recommendation**: Integrate persistent cloud storage such as **Cloudinary** (using `multer-storage-cloudinary`) or **AWS S3** (using `@aws-sdk/client-s3` or `multer-s3`) so user uploads persist permanently across all serverless instances.

### Socket.IO & Real-Time WebSockets
- **Current Setup**: Socket.IO is fully integrated in `src/socket.js` for real-time 1-to-1 chat, typing indicators, and online presence. It works perfectly in local development using `server.js`.
- **Limitation**: Vercel Serverless Functions execute as stateless HTTP invocations; they do not maintain long-lived TCP/WebSocket connections. Socket.IO will **not** function in Vercel's serverless runtime — the `/api/index.js` handler is HTTP-only.
- **Production Recommendation**: For persistent WebSocket support on Vercel, use a dedicated WebSocket provider such as **Pusher**, **Ably**, or **Supabase Realtime**, or host the Node.js server (including Socket.IO) on a persistent platform like **Render** or **Railway**.

---

## 7. Common Deployment Errors & Solutions

| Issue | Cause | Solution |
| --- | --- | --- |
| `Database Connection Failure` / `MongooseServerSelectionError` | MongoDB Atlas IP address restriction or invalid URI. | Go to MongoDB Atlas -> Network Access -> Add `0.0.0.0/0`. Check password encoding in `MONGO_URI`. |
| `CORS Error: Not allowed by CORS` | Request origin does not match `CLIENT_URL`. | Update `CLIENT_URL` or `CORS_ORIGIN` in Vercel environment variables to match your exact frontend origin. |
| `404 Not Found` on `/api/...` | Incorrect `vercel.json` rewrites. | Verify `vercel.json` contains rewrites mapping `/api/(.*)` to `/api/index.js`. |
| `Uploaded avatar missing after some time` | Ephemeral `/tmp` storage on Vercel. | Use Cloudinary or AWS S3 for persistent image storage. |
