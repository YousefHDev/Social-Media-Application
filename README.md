# VibeSpace

VibeSpace is a full-stack social media platform built with Node.js, Express, MongoDB, Mongoose, and a responsive Vanilla JavaScript frontend. It combines a clean social feed with stories, reactions, hashtags, search, notifications, profiles, follows, and real-time messaging.

The project is designed to be easy to run locally, easy to demonstrate, and compatible with Vercel serverless deployment.

## Features

### Social feed

- Create, edit, and delete text and image posts.
- Freeze or unfreeze a post to control new interactions.
- Paginated feed with latest, oldest, and popular sorting.
- Post cards with authors, media, timestamps, reactions, comments, and hashtags.
- Threaded comments and replies.
- Comment likes, editing, and ownership-based deletion.

### Reactions

Users can have one reaction per post and can add, change, or remove it:

- Like
- Haha
- Sad
- Angry
- Wow

Reaction totals, individual counts, and the current user's reaction are returned by the API. Legacy like behavior remains supported for existing posts.

### Stories

- Create image or video stories.
- Stories expire automatically after 24 hours.
- Story progress, next/previous navigation, captions, and media preview.
- Story views and owner-only viewer lists.
- Story reactions.
- Owner-only story deletion.

### Discovery

- Global search for users, posts, and hashtags.
- Debounced search input with tabs, pagination, loading, empty, and error states.
- Normalized hashtags extracted from post content.
- Clickable hashtags and hashtag pages with recent and popular posts.
- Trending hashtags calculated from recent database activity.

### Profiles and social graph

- Signup, login, logout, and refresh-token authentication.
- Editable display name and bio.
- Avatar upload with file validation.
- Followers, following, follow/unfollow, and suggested people.
- Shareable profile views and profile statistics.

### Notifications and messaging

- Notifications for reactions, comments, replies, follows, and direct messages.
- Unread badge, notification panel, timestamps, related links, mark-read, and mark-all-read.
- Self-actions do not create notifications.
- Real-time direct messaging with Socket.IO.
- Conversation list, message history, unread counts, and message notifications.

### UI and security

- Responsive light and dark themes.
- Mobile-friendly navigation and touch controls.
- Skeleton loading states, toast messages, modals, and empty states.
- JWT access and refresh tokens with automatic access-token refresh.
- Helmet, CORS, rate limiting, Joi validation, bcrypt password hashing, ownership checks, and upload validation.

## Technology

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Fetch API
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT access and refresh tokens, bcryptjs
- **Real time:** Socket.IO
- **Uploads:** Multer
- **Validation and security:** Joi, Helmet, CORS, express-rate-limit
- **Deployment:** Vercel-compatible serverless entry point

## Quick start

### Requirements

- Node.js 18 or newer
- MongoDB locally or a MongoDB Atlas database

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env` and set at least:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/vibespace
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

For a separate frontend or production deployment, configure `CLIENT_URL` and `CORS_ORIGIN` as well.

### Run

```bash
npm start
```

Development watch mode:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm start` | Start the production-style local server |
| `npm run dev` | Start the server with Node watch mode |
| `npm run build` | Run the repository build step |

Health check:

```text
GET http://localhost:3000/api/health
```

## API overview

All API routes are prefixed with `/api`.

| Area | Main endpoints |
| --- | --- |
| Auth | `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me` |
| Users | `/users/:id`, `/users/profile`, `/users/avatar` |
| Follows | `/users/:id/follow`, `/users/:id/followers`, `/users/:id/following` |
| Posts | `/posts`, `/posts/:id`, `/posts/:id/like`, `/posts/:id/reaction`, `/posts/:id/freeze` |
| Comments | `/posts/:postId/comments`, `/comments/:commentId/replies`, `/comments/:commentId/like` |
| Stories | `/stories`, `/stories/:id/view`, `/stories/:id/reaction`, `/stories/:id/viewers`, `/stories/:id` |
| Search | `/search?q=...&type=all|users|posts|hashtags` |
| Hashtags | `/hashtags/:tag`, `/hashtags/trending` |
| Notifications | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` |
| Chat | `/chat/conversations`, `/chat/conversations/:id/messages` |

See [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) for the complete feature explanation, architecture notes, and presentation/testing walkthrough.

## Project structure

```text
api/index.js                 Vercel serverless entry point
public/
  index.html                 Main application shell
  css/style.css              Responsive design system and themes
  js/app.js                  Frontend state, rendering, and event handlers
  js/services/api.js         Centralized authenticated API client
src/
  app.js                     Express app, middleware, routes, static files
  config/                    Environment and MongoDB connection setup
  controllers/               Feature request handlers
  middleware/                Auth, validation, uploads, errors, rate limits
  models/                    Mongoose data models
  routes/                    API route definitions
  utils/                     JWT, validation, hashtags, notifications, responses
  socket.js                  Socket.IO chat events
docs/
  PROJECT_GUIDE.md           Feature, architecture, and demo guide
server.js                    Local server entry point
vercel.json                  Vercel rewrites
.env.example                 Environment variable template
```

## Deployment

1. Push the project to GitHub.
2. Import it into Vercel.
3. Add `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, and the correct CORS/client URLs.
4. Deploy.

The application uses local disk storage for development uploads and `/tmp/uploads` in Vercel serverless execution. For durable production media, connect the upload layer to a persistent object-storage provider.

## Documentation

- [Project feature and testing guide](docs/PROJECT_GUIDE.md)
- [Environment template](.env.example)

## License

This project currently uses the license value declared in `package.json` (`ISC`).
