# ⚡ Pulse - Production-Ready Social Media Application

A complete, high-performance Social Media Web Application built with **Node.js, Express, Mongoose**, and a responsive **Vanilla JavaScript/HTML5/CSS3** frontend. Features **Night Mode & Morning Mode** themes, **JWT authentication with Refresh Token rotation**, **Freeze/Unfreeze posts**, **Avatar uploads via Multer**, **Mongoose Hooks & Virtual Populate**, and **100% Vercel Serverless compatibility**.

---

## 🌟 Key Features

### Backend Features
- **Serverless Architecture**: Fully configured for Vercel Serverless Functions via `/api/index.js` and `vercel.json`.
- **Database Connection Caching**: Optimized MongoDB connection service (`src/config/db.js`) to re-use connections across serverless cold starts.
- **Security Suite**:
  - `Helmet` headers protection.
  - `CORS` configured with specific origin whitelist.
  - `express-rate-limit` rate limiters on auth & general API endpoints.
  - `Joi` request body validation.
  - `bcryptjs` password hashing.
- **Authentication**:
  - Signup with password confirmation.
  - Login, Logout, Token Refresh (`/api/auth/refresh`).
  - `/api/auth/me` current user endpoint.
  - Dual JWT Tokens: Short-lived Access Token (15m) + Long-lived Refresh Token (7d).
- **Mongoose Advanced Features**:
  - **Hooks (`pre`/`post`)**:
    - User pre-save hook for password hashing.
    - Post pre-delete hook (`findOneAndDelete`) to delete child comments automatically.
    - Comment post-save & post-remove hooks to keep `commentCount` updated on parent Post.
  - **Virtual Populate**: Dynamic comment populating on Post models without storing comment ID arrays.
  - **Parent-Child Relationships**: Clean hierarchy between Users, Posts, and Comments.
- **Post & Social System**:
  - Create, edit, and delete posts.
  - **Freeze / Unfreeze Toggle**: Post owners can freeze posts to temporarily lock new comments and likes.
  - **Likes & Unlikes Toggle**: Toggle like status dynamically.
  - **Comments System**: Threaded comments under posts.
  - **Pagination & Queries**: Pagination support (`page`, `limit`, `totalPages`, `hasMore`) with content search (`search`), tag filtering (`tag`), author filtering, and sorting (`latest`, `popular`, `oldest`).
- **Profile & File Upload**:
  - Profile update (name, bio).
  - Multer avatar disk upload with strict MIME type checking (`JPEG`, `PNG`, `WEBP`, `GIF`) and 5MB size limit. Dynamic path handling for local dev (`public/uploads`) and serverless environments (`/tmp/uploads`).
  - Shareable profile link functionality.

### Frontend Features
- **Zero Framework Vanilla JS**: Light weight, ultra-fast SPA architecture.
- **Night Mode & Morning Mode**: Sleek dark and light themes with persistent `localStorage` saving.
- **Dynamic API Service (`services/api.js`)**:
  - Manages JWT Tokens in `localStorage`.
  - Transparent 401 response interceptor that executes token refresh automatically and retries failed requests seamlessly.
  - Unified error and loading state management.
- **Rich Modern Aesthetics**: Glassmorphism cards, Google Font Inter, smooth micro-animations, mobile responsive layouts, toast alert notifications, skeleton/spinner loaders, and interactive post action buttons.

---

## 📁 Directory Structure

```
.
├── api/
│   └── index.js                 # Vercel serverless function entry point
├── public/                      # Static frontend assets served by Vercel / Express
│   ├── css/
│   │   └── style.css            # Custom CSS design system with Night & Morning modes
│   ├── js/
│   │   ├── config.js            # Global API configuration
│   │   ├── services/
│   │   │   └── api.js           # Centralized API service with auth & auto-refresh
│   │   └── app.js               # Main Vanilla JS SPA controller & event handlers
│   ├── uploads/                 # Local directory for uploaded avatars
│   └── index.html               # Main SPA HTML structure
├── src/
│   ├── config/
│   │   ├── db.js                # Connection pooling for serverless MongoDB
│   │   └── env.js               # Environment variables configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication handlers
│   │   ├── userController.js    # User profile & avatar handlers
│   │   ├── postController.js    # Post CRUD, freeze, and like handlers
│   │   └── commentController.js # Comment handlers
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authorization protection
│   │   ├── errorMiddleware.js   # Global error handling middleware
│   │   ├── uploadMiddleware.js  # Multer upload & file validation
│   │   ├── validateMiddleware.js# Joi request validation middleware
│   │   └── rateLimitMiddleware.js# Express rate limiters
│   ├── models/
│   │   ├── User.js              # User schema with pre-save hash hook
│   │   ├── Post.js              # Post schema with virtual comments & pre-delete hook
│   │   └── Comment.js           # Comment schema with post commentCount hooks
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints (/api/auth)
│   │   ├── userRoutes.js        # User endpoints (/api/users)
│   │   ├── postRoutes.js        # Post endpoints (/api/posts)
│   │   ├── commentRoutes.js     # Comment endpoints (/api/posts/:postId/comments)
│   │   └── index.js             # Root API router aggregator
│   ├── utils/
│   │   ├── jwt.js               # JWT generator & verification helpers
│   │   ├── validators.js        # Joi validation schemas
│   │   └── responseHandler.js   # Standardized API response utilities
│   └── app.js                   # Express application setup
├── .env.example                 # Environment variables template
├── package.json                 # Node.js dependencies & scripts
├── server.js                    # Local development server entry point
├── vercel.json                  # Vercel deployment configuration
└── README.md                    # Documentation
```

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

### 1. Clone & Install Dependencies
```bash
cd "Social Media API"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` if necessary:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/social-media-db
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
NODE_ENV=development
```

### 3. Start Local Server
Run local development server:
```bash
npm start
```
Or with watch mode:
```bash
npm run dev
```

Visit the application in your browser at:
`http://localhost:3000`

---

## 🌐 How to Deploy to Vercel

This project is built from the ground up to be 100% compatible with Vercel's Serverless Platform.

### Step 1: Push to GitHub / GitLab / Bitbucket
Push the project repository to your Git provider.

### Step 2: Import Project into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New"** -> **"Project"** and import your repository.
3. Keep the default build settings (Vercel automatically detects `package.json` and static files in `public/`).

### Step 3: Configure Environment Variables on Vercel
In the Vercel project settings, add the following Environment Variables:
- `MONGODB_URI`: Your MongoDB Atlas URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`).
- `JWT_ACCESS_SECRET`: Secret key for access tokens.
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens.
- `JWT_ACCESS_EXPIRES_IN`: `15m`
- `JWT_REFRESH_EXPIRES_IN`: `7d`
- `NODE_ENV`: `production`

### Step 4: Deploy!
Click **Deploy**. Vercel will build your static assets and set up the `/api` serverless function handler (`api/index.js`).

---

## 🛠️ API Endpoint Summary

### Auth (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /login` - Log in user & retrieve tokens
- `POST /refresh` - Refresh access token via refresh token
- `POST /logout` - Revoke refresh token & log out
- `GET /me` - Get current authenticated user profile

### User Profile (`/api/users`)
- `PUT /profile` - Update profile name and bio
- `POST /avatar` - Upload avatar image (Multer multipart form)
- `GET /:id` - Get public profile & user stats

### Posts (`/api/posts`)
- `GET /` - Get paginated feed (supports `page`, `limit`, `search`, `tag`, `author`, `isFrozen`, `sortBy`)
- `GET /:id` - Get post details with populated author & comments
- `POST /` - Create a post
- `PUT /:id` - Update a post (owner only)
- `DELETE /:id` - Delete post & child comments (owner only)
- `PATCH /:id/freeze` - Toggle post freeze/unfreeze state (owner only)
- `POST /:id/like` - Toggle like/unlike status

### Comments (`/api/posts/:postId/comments`)
- `POST /` - Add a comment to a post
- `GET /` - Fetch comments for a post
- `DELETE /comments/:commentId` - Delete a comment (comment author or post owner)

---

## 🔒 Security Implementations

1. **Helmet**: Protects HTTP headers against common security vulnerabilities.
2. **CORS**: Enforces origin restrictions.
3. **Rate Limiting**: Limits auth requests to 20 per 15 min and general API requests to 300 per 15 min.
4. **Joi Data Validation**: Sanitizes and validates user input schemas before reaching database logic.
5. **Password Encryption**: Hashes passwords using bcrypt algorithm with salt factor 10.
6. **Token Security**: Uses short-lived access tokens and stateful refresh token verification.

---

## 📄 License
ISC License. Built for production demonstration and scalable web deployment.
