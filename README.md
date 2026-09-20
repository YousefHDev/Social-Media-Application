

# 🌌 VibeSpace

### A Modern Full-Stack Social Media Platform

**Share your vibe. Connect with the world.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-4f46e5?style=for-the-badge)](https://social-media-application-7jyg.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

[Live Demo](https://social-media-application-7jyg.vercel.app/) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-overview) • [Deployment](#-deployment)

---

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="3px">

</div>

## 📖 About VibeSpace

**VibeSpace** is a production-ready, full-stack social media platform that brings people together through shared moments, stories, and conversations. Built with modern web technologies and designed for scale, it delivers a seamless social experience with real-time messaging, rich interactions, and a beautiful responsive interface.

Whether you're sharing a quick thought, posting a story, or chatting with friends in real-time — VibeSpace provides a smooth, fast, and delightful experience.

<div align="center">

### 🎬 **[Try the Live Demo →](https://social-media-application-7jyg.vercel.app/)**

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 📱 Social Feed
- ✍️ Create, edit, and delete posts
- 🖼️ Text and image posts
- ❄️ Freeze/unfreeze posts to control interactions
- 📊 Paginated feed (latest, oldest, popular)
- 🎨 Rich post cards with media and metadata
- 💬 Threaded comments and replies
- ❤️ Comment likes, editing, and deletion

### 😊 Reactions
- 👍 Like
- 😂 Haha
- 😢 Sad
- 😡 Angry
- 😮 Wow

*One reaction per user — add, change, or remove anytime.*

### 📸 Stories
- 🎥 Image and video stories
- ⏰ Auto-expire after 24 hours
- 📊 Progress bar with navigation
- 👀 Story views and viewer lists
- 💫 Story reactions
- 🗑️ Owner-only deletion

</td>
<td width="50%" valign="top">

### 🔍 Discovery
- 🌐 Global search (users, posts, hashtags)
- ⚡ Debounced search with tabs
- 🏷️ Normalized hashtags
- 🔗 Clickable hashtags & pages
- 📈 Trending hashtags engine

### 👥 Social Graph
- 🔐 JWT authentication (access + refresh)
- 👤 Editable profiles
- 🖼️ Avatar upload with validation
- 🤝 Follow / unfollow system
- 💡 Suggested people

### 🔔 Notifications & Chat
- 🔔 Real-time notifications
- 📬 Unread badge & panel
- 💌 Direct messaging (Socket.IO)
- 💬 Conversation list & history
- ✅ Mark-read & mark-all-read

</td>
</tr>
</table>

### 🎨 UI & Security

| Feature | Description |
|---------|-------------|
| 🌗 **Themes** | Responsive light & dark modes |
| 📱 **Responsive** | Mobile-first with touch controls |
| ⚡ **UX** | Skeleton loaders, toasts, modals |
| 🔒 **Security** | Helmet, CORS, rate limiting, Joi validation |
| 🔑 **Auth** | bcrypt hashing + JWT rotation |
| 🛡️ **Protection** | Ownership checks & upload validation |

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/bcryptjs-338033?style=flat-square) |
| **Real-time** | ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white) |
| **Uploads** | ![Multer](https://img.shields.io/badge/Multer-FF6B6B?style=flat-square) |
| **Security** | ![Joi](https://img.shields.io/badge/Joi-4B8BBE?style=flat-square) ![Helmet](https://img.shields.io/badge/Helmet-000000?style=flat-square) |
| **Deploy** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

</div>

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** `18+` — [Download](https://nodejs.org/)
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vibespace.git
cd vibespace

# Install dependencies
npm install
```

### ⚙️ Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/vibespace

# JWT Secrets (use long random strings in production)
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (for separate frontend deployments)
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 🎯 Run the Application

```bash
# Production-style local server
npm start

# Development mode with watch
npm run dev
```

🌐 **Open** → [http://localhost:3000](http://localhost:3000)

### 🩺 Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptime": 12.34,
  "environment": "development"
}
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm start` | Run production-style server |
| `npm run dev` | Run with Node watch mode |
| `npm run build` | Execute build step |

---

## 🌐 API Overview

All endpoints are prefixed with `/api`.

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Revoke refresh token |
| `GET` | `/auth/me` | Get current user profile |

</details>

<details>
<summary><b>👤 Users & Social Graph</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/:id` | Get public profile |
| `PUT` | `/users/profile` | Update profile |
| `POST` | `/users/avatar` | Upload avatar |
| `POST` | `/users/:id/follow` | Follow / unfollow user |
| `GET` | `/users/:id/followers` | List followers |
| `GET` | `/users/:id/following` | List following |

</details>

<details>
<summary><b>📝 Posts & Comments</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/posts` | Paginated feed |
| `POST` | `/posts` | Create a post |
| `GET` | `/posts/:id` | Get post details |
| `PUT` | `/posts/:id` | Update post (owner) |
| `DELETE` | `/posts/:id` | Delete post (owner) |
| `POST` | `/posts/:id/like` | Toggle like |
| `POST` | `/posts/:id/reaction` | Add/change reaction |
| `PATCH` | `/posts/:id/freeze` | Toggle freeze state |
| `GET` | `/posts/:postId/comments` | Get comments |
| `POST` | `/posts/:postId/comments` | Add comment |
| `POST` | `/comments/:commentId/replies` | Reply to comment |
| `POST` | `/comments/:commentId/like` | Like a comment |

</details>

<details>
<summary><b>📸 Stories</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stories` | Get active stories |
| `POST` | `/stories` | Create story |
| `POST` | `/stories/:id/view` | Mark as viewed |
| `POST` | `/stories/:id/reaction` | React to story |
| `GET` | `/stories/:id/viewers` | List viewers (owner) |
| `DELETE` | `/stories/:id` | Delete story (owner) |

</details>

<details>
<summary><b>🔍 Search & Discovery</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/search?q=...&type=all\|users\|posts\|hashtags` | Global search |
| `GET` | `/hashtags/:tag` | Hashtag feed |
| `GET` | `/hashtags/trending` | Trending hashtags |

</details>

<details>
<summary><b>🔔 Notifications & Chat</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications` | List notifications |
| `PATCH` | `/notifications/:id/read` | Mark as read |
| `PATCH` | `/notifications/read-all` | Mark all as read |
| `GET` | `/chat/conversations` | List conversations |
| `GET` | `/chat/conversations/:id/messages` | Get messages |

</details>

📚 **Full documentation:** [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md)

---

## 📁 Project Structure

```text
vibespace/
│
├── 📄 api/
│   └── index.js                 # Vercel serverless entry point
│
├── 🎨 public/
│   ├── index.html               # Main application shell
│   ├── css/
│   │   └── style.css            # Responsive design system
│   └── js/
│       ├── app.js               # Frontend state & rendering
│       └── services/
│           └── api.js           # Authenticated API client
│
├── ⚙️ src/
│   ├── app.js                   # Express app & middleware
│   ├── socket.js                # Socket.IO chat events
│   ├── config/                  # Env & DB setup
│   ├── controllers/             # Feature handlers
│   ├── middleware/              # Auth, validation, uploads
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # API routes
│   └── utils/                   # Helpers & utilities
│
├── 📚 docs/
│   └── PROJECT_GUIDE.md         # Complete guide
│
├── server.js                    # Local server entry
├── vercel.json                  # Vercel config
├── .env.example                 # Env template
└── package.json
```

---

## ☁️ Deployment

### 🚀 Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vibespace)

**Step-by-step:**

1. **Push** your code to GitHub
2. **Import** the repository into [Vercel](https://vercel.com/new)
3. **Add** the following environment variables:

   ```env
   MONGO_URI=mongodb+srv://...
   JWT_ACCESS_SECRET=your_secret
   JWT_REFRESH_SECRET=your_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   ```

4. **Deploy** 🎉

### 🗄️ MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Under **Network Access** → Add `0.0.0.0/0` (allow all for serverless)
3. Under **Database Access** → Create a user with read/write permissions
4. Copy the connection string into `MONGO_URI`

### ⚠️ Known Limitations

> **📁 File Storage:** Vercel uses ephemeral `/tmp` storage. For production, integrate **Cloudinary**, **AWS S3**, or **Supabase Storage** for persistent media.
>
> **🔌 WebSockets:** Socket.IO works in local/server deployments. For Vercel serverless, use **Pusher**, **Ably**, or **Supabase Realtime**.

---

## 🧪 Testing the Live Demo

<table>
<tr>
<td>

### 🔗 **[Live Demo](https://social-media-application-7jyg.vercel.app/)**

**Try these features:**

- ✅ Create an account
- ✅ Post a text or image update
- ✅ Add reactions & comments
- ✅ Follow other users
- ✅ Upload a story
- ✅ Search hashtags
- ✅ Send direct messages
- ✅ Toggle dark mode

</td>
<td>

### 📸 **Screenshots**

> *Coming soon — screenshots of the feed, stories, chat, and profile pages.*

</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

### 📝 Commit Convention

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting |
| `refactor:` | Code restructuring |
| `perf:` | Performance |
| `test:` | Testing |
| `chore:` | Maintenance |

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using **Node.js**, **Express**, and **MongoDB**
- Icons by [Shields.io](https://shields.io/)
- Deployed on [Vercel](https://vercel.com/)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)

---

<div align="center">

### ⭐ If you like this project, give it a star!

**Made with 💜 by [Your Name](https://github.com/YOUR_USERNAME)**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit-4f46e5?style=for-the-badge)](https://social-media-application-7jyg.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/YOUR_USERNAME)

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="3px">

</div>
```


