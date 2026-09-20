# VibeSpace Project Guide

This guide explains what VibeSpace does, how its parts work together, and how to demonstrate and test it without needing to understand the entire codebase first.

## 1. Product summary

VibeSpace is a social network where authenticated users can publish posts and temporary stories, react and comment, follow people, search the platform, discover hashtags, receive notifications, and chat in real time.

The frontend is a single-page Vanilla JavaScript application. The Express API owns authentication, authorization, validation, database operations, uploads, notifications, and chat events.

## 2. How the application works

### Request flow

1. The browser loads `public/index.html`, `public/css/style.css`, and `public/js/app.js`.
2. `public/js/services/api.js` sends requests to `/api`.
3. Protected requests include the JWT access token.
4. If an access token expires, the API client refreshes it and retries the original request.
5. Express applies security middleware, rate limits, and database connection handling.
6. Routes call controllers, controllers use Mongoose models, and standardized responses return to the browser.
7. The frontend updates cards, modals, badges, feeds, and toast messages without a full page reload.

### Main layers

| Layer | Responsibility | Location |
| --- | --- | --- |
| UI | Markup, responsive layout, modals, buttons, forms | `public/index.html`, `public/css/style.css` |
| Frontend controller | State, rendering, event handlers, optimistic updates | `public/js/app.js` |
| API client | Authenticated GET/POST/PUT/PATCH/DELETE/upload requests | `public/js/services/api.js` |
| Routes | URL definitions and middleware composition | `src/routes/` |
| Controllers | Validation-aware business operations | `src/controllers/` |
| Models | MongoDB schemas, indexes, and hooks | `src/models/` |
| Shared services | JWT, notifications, hashtags, response formatting | `src/utils/` |
| Real time | Chat connection and message events | `src/socket.js` |

## 3. Feature walkthrough

### Authentication

Users sign up with a name, email, and password. Passwords are hashed before storage. Login returns an access token and refresh token. The frontend stores the tokens, loads the current user, and automatically refreshes expired access tokens.

Logout revokes the refresh session. Protected routes use the auth middleware, so a user cannot create content or change another user's resources without authentication and ownership authorization.

### Profiles and follows

The profile modal displays identity, bio, avatar, post count, followers, and following counts. Users can update their profile, upload a validated avatar, follow or unfollow another user, and open follower/following lists.

Follow creation also feeds the notification system. A user is not notified about following themselves.

### Posts, comments, and replies

The post composer sends text, optional media, and extracted hashtags. Posts can be edited or deleted by their owners. Owners can freeze a post, which prevents new interaction according to the post rules.

Comments are stored with their parent post and optional parent comment. This supports replies. Comment creation, replies, comment likes, and deletions update the visible post card and can create notifications for the relevant owner.

### Post reactions

Each user has one active reaction per post. Selecting a reaction creates it, selecting another changes it, and selecting the current reaction removes it. The UI updates optimistically and restores the previous state if the request fails.

The backend keeps the legacy like endpoint and legacy likes data compatible while exposing the newer reaction counts and current-user reaction state.

### Stories

The Add Story button opens the native image/video picker. After selecting media, the user can preview it, add a caption, and publish it. A story is visible for 24 hours and is removed from active queries after expiration.

The story viewer supports:

- Next and previous stories
- Image and video playback
- Progress indicator
- View recording
- Owner-only viewer list
- Story reactions
- Owner-only deletion

Deleting a story calls `DELETE /api/stories/:id`. The controller requires both the story ID and the authenticated owner, so another user cannot delete it.

### Notifications

Notifications are persisted for reactions, comments, replies, follows, and direct messages. The navigation bell displays the unread count and opens a panel with timestamps and related links.

Users can mark one notification as read or mark all notifications as read. The notification service avoids self-notifications and supports deduplication for repeated events.

### Direct messaging

The chat panel creates or opens a conversation, loads message history, and sends messages through the chat API. Socket.IO provides real-time delivery and unread updates when the recipient is online.

### Global search

The search input uses a small debounce instead of sending a request for every keystroke. Results are separated into All, People, Posts, and Hashtags tabs. Results are bounded and paginated.

User results show identity and follow state. Post results reuse normal post rendering. Hashtag results link to hashtag pages.

### Hashtags and trending

Post creation and editing extract hashtags without changing the original text. Hashtags are normalized to lowercase, deduplicated, and stored in the post's searchable hashtag field.

The hashtag page provides:

- Hashtag name
- Post count
- Recent posts
- Popular posts
- Pagination
- Empty state

Trending hashtags use recent database activity rather than hardcoded values. The current scoring approach combines recent post volume, likes, comments, and reactions over a seven-day window.

## 4. Demonstration script

Use this sequence to present the project to someone unfamiliar with it:

1. Open the app and show the light/dark theme toggle.
2. Create a demo account or log in.
3. Update the profile name, bio, and avatar.
4. Create a text post with `#VibeSpace` and an image post.
5. Edit a post, freeze it, and show the post actions.
6. Add a comment and reply from a second account.
7. Open the reaction picker and demonstrate Like -> Haha -> remove.
8. Follow the second account and open the notification bell.
9. Create an image story, open it, view it, react to it, and delete it as the owner.
10. Send a direct message and show the conversation update.
11. Search for a user, post, and hashtag.
12. Open the hashtag page and show recent, popular, and trending results.

For a two-user demonstration, keep two browser profiles or an incognito window open so notifications, follows, comments, and messages can be seen from both sides.

## 5. Testing checklist

### Authentication and profiles

- [ ] Sign up with valid data.
- [ ] Reject invalid or duplicate signup data.
- [ ] Log in and refresh the page.
- [ ] Confirm a protected request works after access-token refresh.
- [ ] Log out and confirm protected actions require login.
- [ ] Update name and bio.
- [ ] Upload a valid avatar.
- [ ] Reject an invalid avatar type or oversized file.

### Posts and interactions

- [ ] Create text, image, and hashtag posts.
- [ ] Edit and delete an owned post.
- [ ] Freeze and unfreeze a post.
- [ ] Add a comment and reply.
- [ ] Like a comment and delete an owned comment.
- [ ] Add, change, and remove every post reaction type.
- [ ] Confirm reaction counts and current-user state.
- [ ] Confirm users do not receive notifications for their own actions.

### Stories

- [ ] Open Add Story and select an image.
- [ ] Open Add Story and select a video.
- [ ] Preview, cancel, and publish a story.
- [ ] Navigate next and previous.
- [ ] Confirm views and owner-only viewer access.
- [ ] Add and remove story reactions.
- [ ] Delete a story as its owner.
- [ ] Confirm another user cannot delete it.
- [ ] Confirm expired stories are not returned.

### Search, hashtags, and trending

- [ ] Search users by name.
- [ ] Search posts by content.
- [ ] Search hashtags.
- [ ] Confirm debounce behavior while typing.
- [ ] Test empty and invalid search results.
- [ ] Click a hashtag in a post.
- [ ] Open the hashtag page.
- [ ] Switch recent/popular sorting and paginate.
- [ ] Confirm trending values come from current database data.

### Notifications and chat

- [ ] Trigger a like/reaction notification.
- [ ] Trigger a comment and reply notification.
- [ ] Trigger a follow notification.
- [ ] Send a direct message.
- [ ] Open the notification panel and verify timestamps and links.
- [ ] Mark one notification as read.
- [ ] Mark all notifications as read.
- [ ] Verify unread counts update.
- [ ] Send and receive a real-time chat message.

### Responsive and regression checks

Test the main feed, modals, story viewer, search panel, chat, and notification panel at:

`320px`, `375px`, `425px`, `768px`, `1024px`, `1280px`, `1440px`, and `1920px`.

Confirm:

- No horizontal scrolling.
- No overlapping controls.
- Images and videos remain within their containers.
- Buttons are touch-friendly.
- Text wraps correctly.
- Browser console has no application errors.

## 6. Local verification

From the project root:

```bash
node --check public/js/app.js
node --check src/controllers/storyController.js
npm run build
```

Start the server and verify:

```text
GET http://localhost:3000/api/health
```

Expected response shape:

```json
{
  "status": "ok",
  "environment": "development"
}
```

## 7. Security and deployment notes

- Never commit `.env` or real secrets.
- Use long, unique JWT secrets in production.
- Set `CORS_ORIGIN` to the actual frontend origin instead of allowing every origin.
- Keep MongoDB network access restricted where possible.
- Upload validation limits MIME types and file sizes, but production media should use persistent object storage.
- Vercel serverless instances use `/tmp/uploads`, which is temporary and not suitable for permanent media storage.
- The application uses MongoDB indexes, bounded pagination, aggregation for trending, and rate limiting to reduce abusive or expensive requests.
