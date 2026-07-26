# The Ledger — Alumni-Student Interaction Portal

A production-quality, full-stack web platform bridging alumni and current students through
mentorship, structured networking, job/internship postings, event hosting, a knowledge feed,
a discussion forum, real-time direct messaging, and live notifications.

Built for the **Alumni-Student Interaction Portal** project proposal (K.R Mangalam University,
Department of CSE) — implementing every objective and feature listed in that report, then
taken considerably further: a live deployment, a polished dark theme, authenticated real-time
messaging with WhatsApp-style deletes, full content moderation, and a hardened Socket.io layer.

---

## 🔴 Live Demo

- **Frontend:** [alumni-student-portal.vercel.app](https://alumni-student-portal.vercel.app)
- **Backend API:** [alumni-student-portal.onrender.com](https://alumni-student-portal.onrender.com)
- **Repository:** this repo, deployed automatically on every push to `main`

> The backend is on Render's free tier, which sleeps after inactivity — the very first
> request after a quiet period can take up to ~50 seconds to wake up. Everything after that
> is instant.

---

## ✨ Feature Enhancements

Beyond the original project proposal, the platform has gone through several rounds of polish.
Highlights, grouped by area:

### Visual & Experience
- **Signature dark theme (now the only theme)** — the navy/brass "ledger" look proved so much
  stronger than the light variant that the app is now dark-only: `class="dark"` is set on
  `<html>` itself, so pages paint dark from the very first frame with no white flash.
- **Living ambient background** — four blurred brass/blue glow blobs drift and breathe very
  slowly behind every page (GPU-composited transform/opacity animation, so scrolling stays
  smooth; honors `prefers-reduced-motion`), alongside the WebGL aurora (`SoftAurora`, built
  on the `ogl` library) on the Landing, Login, and Register pages.
- **Unified app chrome** — the sidebar and topbar share one deep-navy frame with consistent
  hairline borders, both pinned so navigation, the notification bell, and sign-out are always
  visible. Nav items brighten on hover with a brass indicator bar that grows in and stays lit
  on the active page. The clickable logo returns to the Dashboard, and a brass graduation-cap
  favicon marks the tab.
- **Redesigned Login & Register** — from plain centered forms into rich two-column layouts
  (headline + stats on one side, form on the other), matching the Landing page's structure.
- **Glassmorphism cards site-wide** — the shared `.card` class uses a frosted-glass treatment
  (translucent fill + backdrop blur) with gently rounded corners, applied automatically on
  every page.
- **Toast notifications & styled confirm dialogs** — custom `ToastContext` and
  `ConfirmContext` replace native browser alerts/confirms everywhere (deletes, saves, errors).
- **Brass loading spinner** — a shared SVG `Spinner` component with per-page labels on every
  data-driven page (session, dashboard, feed, directory, connections, messages, conversation,
  jobs, events, forum, thread, admin); dashboard stat cards pulse "Loading…" instead of
  flashing fake zeros.
- **Metal role seals** — a translucent **gold** seal for alumni and a matching **platinum**
  seal for students, used consistently across directory, feed, forum, messages, and
  connections. Student directory cards carry the same icon treatment as alumni cards.

### Directory & Discovery
- **Mentor availability badge** — alumni who opt in via their profile show a brass
  "🤝 Open to mentor" pill on their directory card, so students can instantly spot who to
  approach (the platform's core purpose, finally visible).
- **LinkedIn on cards** — profiles with a LinkedIn URL get a click-through icon on their
  directory card.
- **Real connection status on every card** — Connect, Request sent (with one-click cancel),
  Respond in Connections, or Connected (with a message shortcut).

### Profile & Account
- **Live directory-card preview** — the Profile page renders an exact replica of your
  Directory card that updates as you type, sticky beside the edit form on desktop.
- **Change password** — a dedicated card on the Profile page; requires the current password,
  confirms the new one twice, and re-hashes via the existing bcrypt pre-save hook.

### Messaging
- **WhatsApp-style chat bubbles** — asymmetric bubble tails, inline timestamps, brass
  own-messages vs. grey incoming, a pill-shaped input, and a circular send button.
- **Delete for everyone** — senders can delete their own messages; the message becomes an
  italic *"This message was deleted"* tombstone for **both** parties in real time over the
  socket, and its content is genuinely wiped from the database.
- **Role badges in messaging** — inbox rows and the conversation header show who you're
  talking to, and the inbox preview handles deleted last-messages gracefully.
- **Full-width layouts** — Feed, Messages, and Conversation use the full content width like
  the Forum, instead of a cramped left-pinned column.

### Connections
- **Cancel pending requests** — a `DELETE /connections/:id` endpoint plus cancel buttons in
  both the Directory card and the Connections page's Sent Requests tab.
- **Reordered Connections tabs** — My Connections first and shown by default, then Incoming,
  then Sent.

### Real-time
- **Job & event notifications** — posting a job notifies every active student live; hosting
  an event notifies all active users. The bell lights up in real time with no refresh.

---

## 🔧 Bug Fixes & Hardening

Real bugs found, diagnosed, and fixed along the way:

- **Socket rooms were unauthenticated** *(security)* — any client could emit `join` with an
  arbitrary user id and silently receive that user's private notifications and messages.
  Socket.io now verifies the JWT in the connection handshake and joins each socket to the
  room of its *verified* user; the client-claimed `join` event was removed entirely.
- **Register/login returned a stripped-down profile** — only a handful of fields came back,
  so freshly registered users saw an empty Profile page (and empty directory preview) until
  a hard refresh re-fetched `/auth/me`. Both endpoints now return the full sanitized profile.
- **Rejected connections were a dead end** — after a rejection, the pair could never connect
  again: the Directory still showed a "Connect" button that always failed. Rejected requests
  can now be re-sent in either direction, reusing the same document to respect the unique
  `(requester, receiver)` index.
- **Job/event notification types existed but never fired** — the `new_job`/`new_event` enum
  values were defined in the Notification schema but no controller ever sent them.
- **Deleting a message tripped schema validation** — wiping a deleted message's content
  collided with `content: required`; it is now conditionally required (`!isDeleted`), so
  tombstones remain valid documents.
- **Empty numeric fields broke profile saves** — submitting an unselected year sent `''`
  into a Mongoose `Number` cast; empty `currentYear`/`graduationYear` are now stripped
  from the payload.
- **False "No posts yet" flash** — the Dashboard had no loading state, so the empty-feed
  message (and zeroed stat cards) appeared before data arrived.
- **Native widgets ignored the theme** — dropdown option lists rendered white-on-white
  (unreadable) and number inputs showed clunky spinner arrows; both are now styled directly
  in `index.css`.
- **Sidebar and topbar scrolled away** — the app shell now pins both, so navigation, the
  notification bell, and sign-out are always visible.

---

## 1. Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Frontend       | React 18 (Vite) + Tailwind CSS + React Router |
| Backend        | Node.js + Express.js                         |
| Database       | MongoDB (Atlas) + Mongoose ODM                |
| Auth           | JWT + bcrypt (role-based: student/alumni/admin) |
| Real-time      | Socket.io (JWT-authenticated notifications & live messaging) |
| Visual effects | `ogl` (WebGL aurora on public pages)          |
| Frontend host  | Vercel                                        |
| Backend host   | Render                                        |

---

## 2. System Architecture

```
┌─────────────────────┐        HTTPS / REST        ┌──────────────────────┐
│   React SPA (Vite)  │ ─────────────────────────▶ │   Express REST API   │
│   Vercel-hosted     │ ◀───────────────────────── │   Render-hosted      │
│                     │        WebSocket (Socket.io)│                      │
│                     │ ◀═══════════════════════════│                      │
└─────────────────────┘                             └──────────┬───────────┘
                                                                │ Mongoose
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │   MongoDB Atlas       │
                                                     │  (Users, Posts,       │
                                                     │  Connections, Jobs,   │
                                                     │  Events, Messages,    │
                                                     │  Notifications,       │
                                                     │  ForumThreads)        │
                                                     └──────────────────────┘
```

**Request flow:** the SPA attaches a JWT (issued at login/register) to every API call via an
Axios interceptor. Express middleware (`protect`) verifies the token and loads the user;
`authorize(...roles)` gates role-restricted routes (e.g. only `alumni`/`admin` can post jobs).

**Real-time flow:** Socket.io runs alongside the HTTP server. The client sends its JWT in the
socket handshake; a server-side middleware verifies it and joins the socket to a room named
after the *verified* user's id. The server can then push `notification`, `new_message`, and
`message_deleted` events to exactly one user — and no client can subscribe to another user's
room, because room membership is derived from the signed token rather than anything the
client claims.

---

## 3. Folder Structure

```
alumni-portal/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # Mongoose schemas (User, Post, Connection, ...)
│   ├── middleware/                  # authMiddleware.js, errorMiddleware.js
│   ├── controllers/                 # business logic per resource
│   ├── routes/                      # Express routers per resource
│   ├── utils/                       # generateToken.js, notify.js, seed.js
│   ├── server.js                    # app entry point (Express + JWT-authenticated Socket.io)
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/favicon.svg           # brass graduation-cap tab icon
    ├── src/
    │   ├── api/axios.js             # configured Axios instance + interceptors
    │   ├── context/AuthContext.jsx  # auth state, login/register/logout, socket
    │   ├── context/ToastContext.jsx # toast notification system
    │   ├── context/ConfirmContext.jsx # styled confirm dialogs
    │   ├── hooks/useDarkMode.js     # enforces the permanent dark theme
    │   ├── layouts/AppLayout.jsx    # pinned navy chrome: sidebar, topbar, ambient glows
    │   ├── components/              # ProtectedRoute, NotificationBell, RoleBadge,
    │   │                            # Spinner, SoftAurora (WebGL aurora)
    │   ├── pages/                   # one file per route (Dashboard, Directory, Feed, ...)
    │   ├── App.jsx                  # route table
    │   ├── main.jsx                 # React root
    │   └── index.css                # Tailwind directives + design tokens + animations
    ├── tailwind.config.js
    ├── vite.config.js
    ├── vercel.json                  # SPA rewrite so client routes survive a page refresh
    ├── package.json
    └── .env.example
```

---

## 4. Database Schema (MongoDB / Mongoose)

### `User`
| Field | Type | Notes |
|---|---|---|
| name, email, password | String | password bcrypt-hashed, `select: false` by default |
| role | enum | `student` \| `alumni` \| `admin` |
| bio, avatarUrl, branch, linkedinUrl, skills[] | mixed | shared profile fields (skills available to every role) |
| currentYear, rollNumber | Number/String | student-only |
| graduationYear, company, designation, isMentorAvailable | mixed | alumni-only |
| isVerified, isActive | Boolean | admin-controlled account status |

### `Post` (Knowledge Feed)
author, content, type (`experience`/`advice`/`announcement`/`general`), tags[], likes[User],
comments[{author, content, createdAt}]. Both posts and individual comments can be deleted by
their owner or an admin.

### `ForumThread`
author, title, body, category (`placements`/`academics`/`career-advice`/`projects`/`general`),
replies[{author, content}], isPinned, views. Thread listings return a computed `repliesCount`
via aggregation rather than the full replies array, keeping the list endpoint lightweight.
Threads and individual replies can be deleted by their owner or an admin.

### `Connection` (Mentorship requests)
requester, receiver, status (`pending`/`accepted`/`rejected`), message. A unique index on
`(requester, receiver)` prevents duplicates; a rejected request can be re-sent (the same
document is reset to `pending`, in either direction). Pending requests can be cancelled by
their sender, which deletes the document.

### `Message`
conversationId (sorted `userA_userB`), sender, receiver, content, isRead, **isDeleted**.
Deleting a message (sender-only) wipes its content and flags it, leaving a tombstone that
both parties see — content is conditionally required so tombstones remain valid documents.

### `Job`
postedBy, title, company, type (`internship`/`full-time`/`part-time`/`freelance`), location, description, applyLink, skillsRequired[], deadline, isActive

### `Event`
hostedBy, title, description, date, mode (`online`/`offline`/`hybrid`), location, registrations[User], capacity

### `Notification`
recipient, type (`connection_request`/`connection_accepted`/`new_message`/`new_job`/`new_event`/`post_comment`/`post_like`/`forum_reply`/`system`), message, link, relatedId, isRead.
`new_job` fires to every active student when an opportunity is posted; `new_event` fires to
all active users when an event is hosted.

---

## 5. REST API Reference

Base URL: `/api`. All routes except `/auth/register` and `/auth/login` require
`Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a student/alumni account (returns the full profile + JWT) |
| POST | `/auth/login` | Public | Authenticate (returns the full profile + JWT) |
| GET | `/auth/me` | Private | Current user's profile |
| GET | `/users?role=&branch=&graduationYear=&company=&skill=&search=&page=&limit=` | Private | Directory search/filter |
| PUT | `/users/me` | Private | Update own profile |
| PUT | `/users/me/password` | Private | Change own password (requires current password) |
| GET | `/users/:id` | Private | View a public profile |
| GET | `/users/admin/all` | Admin | List all accounts |
| PATCH | `/users/admin/:id` | Admin | Activate/deactivate, change role, verify |
| POST | `/connections` | Private | Send a connection/mentorship request (re-sendable after rejection) |
| GET | `/connections?status=` | Private | List my connections |
| PATCH | `/connections/:id` | Private | Accept/reject a request |
| DELETE | `/connections/:id` | Requester | Cancel a pending request you sent |
| POST | `/posts` | Private | Create a feed post |
| GET | `/posts?type=&page=&limit=` | Private | Paginated feed |
| PATCH | `/posts/:id/like` | Private | Toggle like |
| POST | `/posts/:id/comments` | Private | Add a comment |
| DELETE | `/posts/:id/comments/:commentId` | Owner/Admin | Delete a comment |
| DELETE | `/posts/:id` | Owner/Admin | Delete a post |
| POST | `/forum` | Private | Create a discussion thread |
| GET | `/forum?category=&page=&limit=` | Private | List threads (with `repliesCount`) |
| GET | `/forum/:id` | Private | Thread detail + replies |
| POST | `/forum/:id/replies` | Private | Reply to a thread |
| DELETE | `/forum/:id/replies/:replyId` | Owner/Admin | Delete a reply |
| DELETE | `/forum/:id` | Owner/Admin | Delete a thread |
| POST | `/jobs` | Alumni/Admin | Post a job/internship (notifies all active students) |
| GET | `/jobs?type=&search=&page=&limit=` | Private | Browse postings |
| PUT `/DELETE` | `/jobs/:id` | Owner/Admin | Edit/remove a posting |
| POST | `/events` | Alumni/Admin | Host an event (notifies all active users) |
| GET | `/events?when=upcoming|past` | Private | List events |
| PATCH | `/events/:id/register` | Private | Toggle registration |
| PUT `/DELETE` | `/events/:id` | Owner/Admin | Edit/cancel an event |
| POST | `/messages` | Private | Send a DM (requires accepted connection) |
| DELETE | `/messages/:id` | Sender | Delete a message for everyone (tombstone) |
| GET | `/messages` | Private | Inbox (conversation previews) |
| GET | `/messages/:userId` | Private | Full conversation with a user |
| GET | `/notifications` | Private | My notifications |
| PATCH | `/notifications/:id/read` | Private | Mark one as read |
| PATCH | `/notifications/read-all` | Private | Mark all as read |

**Socket.io events:** the client connects with its JWT in the handshake (`auth: { token }`);
the server verifies it and joins the socket to the verified user's private room. Server → client
events: `notification`, `new_message`, and `message_deleted`.

---

## 6. Design System

A deliberately academic "ledger/register" aesthetic rather than a generic SaaS look — now a
committed, dark-only theme:

- **Colors:** near-black navy (`#0c1220`) backgrounds, ivory paper text (`#f6f3ec`), and warm
  brass (`#cda23f`) as the primary interactive accent (buttons, active states, highlights),
  with moss green for verified/success states.
- **Type:** Source Serif 4 for display headings (evokes a printed register/diploma), Inter for
  body and UI text, IBM Plex Mono for identifiers (roll numbers, timestamps).
- **Surfaces & atmosphere:** glassmorphism cards (translucent fill + backdrop blur + soft
  shadow) with gently rounded corners; slow-drifting ambient glow blobs behind the content;
  a WebGL aurora on the public pages; one continuous navy chrome frame (sidebar + topbar)
  with hairline borders.
- **Signature element:** the `RoleBadge` "wax-seal" tag used everywhere a person appears —
  a **gold** seal for alumni and a **platinum** seal for students — plus the brass
  "Open to mentor" pill on mentoring alumni's directory cards.
- **Motion:** a shared brass SVG spinner for loading states, pulsing stat placeholders, a
  brass indicator bar on sidebar nav (grows on hover, lit on the active page), and
  WhatsApp-style chat bubbles with live delete tombstones. All ambient animation is
  transform/opacity-only and honors `prefers-reduced-motion`.
- **Dark implementation:** `class="dark"` on `<html>` plus a set of global overrides in
  `index.css` that rebalance the light-mode utility classes wherever they appear — verified
  with scripted contrast-ratio checks (WCAG AA, 4.5:1). Native widgets (dropdown option
  lists, number inputs) are styled directly so they match the theme.

---

## 7. Running Locally

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # optional: creates the sample accounts below
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

### Demo accounts (live site)
Password for both: `Passw0rd!`

| Email | Role |
|---|---|
| ram@krmu.edu.in | alumni |
| sam@krmu.edu.in | student |

### Admin access
An **admin** role provides the full moderation console (verify/deactivate accounts, delete
any post, comment, thread, or reply). On a **local** setup, `npm run seed` creates
`admin@krmu.edu.in` with the default password above. On the **live deployment**, the admin
account uses a private password that is not published — this README (and its git history)
are public, and printed admin credentials would hand full destructive access to anyone.

---

## 8. Deployment

### Backend → Render
1. Push the `backend/` folder to a GitHub repository (or the whole monorepo).
2. In Render: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `.env.example` (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
   `CLIENT_URL` = your Vercel URL — no trailing slash, `NODE_ENV=production`).
5. Deploy. Note the resulting URL, e.g. `https://alumni-portal-api.onrender.com`.

### Frontend → Vercel
1. In Vercel: **New Project**, import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
4. Deploy. Update the backend's `CLIENT_URL` env var to match the deployed Vercel URL exactly
   (no trailing slash), then redeploy the backend so CORS allows it.

### MongoDB Atlas
1. Create a free M0 cluster, add a database user, and allow network access from `0.0.0.0/0`
   (or Render's static egress IPs, if configured).
2. Copy the connection string into `MONGO_URI`, replacing `<username>`/`<password>`.

---

## 9. Notes for the Faculty Demonstration

- Role-based dashboards: log in as the demo `student` and `alumni` accounts to show the
  different views (mentorship CTA for students, "post opportunity" CTA for alumni); the
  Admin Console is shown live with the privately-held admin credentials.
- Suggested live-demo path: register a student → browse the Directory (note the mentor
  badges and LinkedIn links) → send a connection request (cancel and re-send it to show the
  full request lifecycle) → log in as the alumnus → accept it → exchange messages (delete
  one to show the live "This message was deleted" tombstone appear on both screens) → post
  a job and watch the student's notification bell light up in real time → host an event and
  see everyone notified.
- Admins can delete any post, comment, forum thread, or reply directly from the UI — useful to
  demonstrate the platform's content moderation story.
- The codebase is intentionally documented with inline comments explaining *why*, not just
  *what*, to support the project report's methodology section (Phase 2–5 deliverables).