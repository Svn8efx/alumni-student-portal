# The Ledger — Alumni-Student Interaction Portal

A production-quality, full-stack web platform bridging alumni and current students through
mentorship, structured networking, job/internship postings, event hosting, a knowledge feed,
a discussion forum, direct messaging, and real-time notifications.

Built for the **Alumni-Student Interaction Portal** project proposal (K.R Mangalam University,
Department of CSE) — implementing every objective and feature listed in that report.

---

## 1. Tech Stack

| Layer          | Technology                                  |
|----------------|----------------------------------------------|
| Frontend       | React 18 (Vite) + Tailwind CSS + React Router |
| Backend        | Node.js + Express.js                         |
| Database       | MongoDB (Atlas) + Mongoose ODM                |
| Auth           | JWT + bcrypt (role-based: student/alumni/admin) |
| Real-time      | Socket.io (notifications & live messaging)    |
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
Socket.io runs alongside the HTTP server; each authenticated client joins a room named after
its own user ID, so the server can push notifications and messages to exactly one user without
a broadcast.

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
│   ├── server.js                    # app entry point (Express + Socket.io)
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/axios.js             # configured Axios instance + interceptors
    │   ├── context/AuthContext.jsx  # auth state, login/register/logout, socket
    │   ├── layouts/AppLayout.jsx    # sidebar + topbar shell for authenticated pages
    │   ├── components/              # ProtectedRoute, NotificationBell, RoleBadge
    │   ├── pages/                   # one file per route (Dashboard, Directory, Feed, ...)
    │   ├── App.jsx                  # route table
    │   ├── main.jsx                 # React root
    │   └── index.css                # Tailwind directives + design tokens
    ├── tailwind.config.js
    ├── vite.config.js
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
| bio, avatarUrl, branch, linkedinUrl | String | shared profile fields |
| currentYear, rollNumber | Number/String | student-only |
| graduationYear, company, designation, skills[], isMentorAvailable | mixed | alumni-only |
| isVerified, isActive | Boolean | admin-controlled account status |

### `Post` (Knowledge Feed)
author, content, type (`experience`/`advice`/`announcement`/`general`), tags[], likes[User], comments[{author, content, createdAt}]

### `ForumThread`
author, title, body, category (`placements`/`academics`/`career-advice`/`projects`/`general`), replies[{author, content}], isPinned, views

### `Connection` (Mentorship requests)
requester, receiver, status (`pending`/`accepted`/`rejected`), message. Unique index on `(requester, receiver)` prevents duplicate requests.

### `Message`
conversationId (sorted `userA_userB`), sender, receiver, content, isRead

### `Job`
postedBy, title, company, type (`internship`/`full-time`/`part-time`/`freelance`), location, description, applyLink, skillsRequired[], deadline, isActive

### `Event`
hostedBy, title, description, date, mode (`online`/`offline`/`hybrid`), location, registrations[User], capacity

### `Notification`
recipient, type (`connection_request`/`connection_accepted`/`new_message`/`new_job`/`new_event`/`post_comment`/`post_like`/`forum_reply`/`system`), message, link, relatedId, isRead

---

## 5. REST API Reference

Base URL: `/api`. All routes except `/auth/register` and `/auth/login` require
`Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a student/alumni account |
| POST | `/auth/login` | Public | Authenticate, returns JWT |
| GET | `/auth/me` | Private | Current user's profile |
| GET | `/users?role=&branch=&graduationYear=&company=&skill=&search=&page=&limit=` | Private | Directory search/filter |
| PUT | `/users/me` | Private | Update own profile |
| GET | `/users/:id` | Private | View a public profile |
| GET | `/users/admin/all` | Admin | List all accounts |
| PATCH | `/users/admin/:id` | Admin | Activate/deactivate, change role, verify |
| POST | `/connections` | Private | Send a connection/mentorship request |
| GET | `/connections?status=` | Private | List my connections |
| PATCH | `/connections/:id` | Private | Accept/reject a request |
| POST | `/posts` | Private | Create a feed post |
| GET | `/posts?type=&page=&limit=` | Private | Paginated feed |
| PATCH | `/posts/:id/like` | Private | Toggle like |
| POST | `/posts/:id/comments` | Private | Add a comment |
| DELETE | `/posts/:id` | Owner/Admin | Delete a post |
| POST | `/forum` | Private | Create a discussion thread |
| GET | `/forum?category=&page=&limit=` | Private | List threads |
| GET | `/forum/:id` | Private | Thread detail + replies |
| POST | `/forum/:id/replies` | Private | Reply to a thread |
| POST | `/jobs` | Alumni/Admin | Post a job/internship |
| GET | `/jobs?type=&search=&page=&limit=` | Private | Browse postings |
| PUT `/DELETE` | `/jobs/:id` | Owner/Admin | Edit/remove a posting |
| POST | `/events` | Alumni/Admin | Host an event |
| GET | `/events?when=upcoming|past` | Private | List events |
| PATCH | `/events/:id/register` | Private | Toggle registration |
| PUT `/DELETE` | `/events/:id` | Owner/Admin | Edit/cancel an event |
| POST | `/messages` | Private | Send a DM (requires accepted connection) |
| GET | `/messages` | Private | Inbox (conversation previews) |
| GET | `/messages/:userId` | Private | Full conversation with a user |
| GET | `/notifications` | Private | My notifications |
| PATCH | `/notifications/:id/read` | Private | Mark one as read |
| PATCH | `/notifications/read-all` | Private | Mark all as read |

**Socket.io events:** client emits `join(userId)` on connect; server emits `notification` and
`new_message` to that user's room.

---

## 6. UI Wireframes (key screens)

```
Landing               Login/Register          Dashboard (role-aware)
┌───────────────┐    ┌───────────────┐        ┌──────────────────────────┐
│ Logo   Sign in │    │    Logo       │        │ Sidebar │ Topbar + bell  │
│                │    │  Email        │        │  Nav    ├────────────────┤
│  Headline      │    │  Password     │        │  items  │ Stat  Stat     │
│  CTA buttons   │    │  [Sign in]    │        │         │ Stat  Stat     │
│                │    │               │        │         │ CTA banner     │
│  Feature cards │    │  Sign-up link │        │         │ Recent feed    │
└───────────────┘    └───────────────┘        └──────────────────────────┘

Directory                              Feed / Forum
┌───────────────────────────┐         ┌───────────────────────────┐
│ Search bar   [All|Alumni] │         │ Composer (content + type) │
│ ┌────┐ ┌────┐ ┌────┐      │         ├───────────────────────────┤
│ │card│ │card│ │card│      │         │ Post: author, body,       │
│ │name│ │name│ │name│      │         │ like / comment counts     │
│ │role│ │role│ │role│      │         ├───────────────────────────┤
│ │[Connect]                │         │ Post ...                  │
└───────────────────────────┘         └───────────────────────────┘

Messages (conversation)               Jobs / Events (card grid)
┌───────────────────────────┐         ┌───────────────────────────┐
│ ← Name                    │         │ [Filter chips]            │
│  ...bubble...   bubble... │         │ ┌──────────┐ ┌──────────┐ │
│  bubble...   ...bubble... │         │ │ Job card │ │ Job card │ │
├───────────────────────────┤         │ │ [Apply]  │ │ [Apply]  │ │
│ [ input.......... ] [Send]│         │ └──────────┘ └──────────┘ │
└───────────────────────────┘         └───────────────────────────┘
```

All layouts collapse to a single column on mobile; the sidebar becomes a bottom tab bar below
the `md` breakpoint (see `AppLayout.jsx`).

---

## 7. Design System

A deliberately academic "ledger/register" aesthetic rather than a generic SaaS look:

- **Colors:** deep ink-navy (`#131d30`) for chrome and headers, warm brass (`#cda23f`) as the
  single accent (seals, CTAs, highlights), ivory paper background (`#f6f3ec`), moss green for
  verified/success states.
- **Type:** Source Serif 4 for display headings (evokes a printed register/diploma), Inter for
  body and UI text, IBM Plex Mono for identifiers (roll numbers, timestamps).
- **Signature element:** the `RoleBadge` "wax-seal" tag used everywhere a person appears
  (directory, feed, forum, connections) — a small, consistent visual cue for who's alumni,
  student, or admin.

---

## 8. Running Locally

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # optional: creates demo accounts (see below)
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

### Demo accounts (after `npm run seed`)
All passwords: `Passw0rd!`

| Email | Role |
|---|---|
| admin@krmu.edu.in | admin |
| priyanshu.alumni@krmu.edu.in | alumni |
| aradhana.alumni@krmu.edu.in | alumni |
| sarthak.student@krmu.edu.in | student |
| anish.student@krmu.edu.in | student |

---

## 9. Deployment

### Backend → Render
1. Push the `backend/` folder to a GitHub repository (or the whole monorepo).
2. In Render: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `.env.example` (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
   `CLIENT_URL` = your Vercel URL, `NODE_ENV=production`).
5. Deploy. Note the resulting URL, e.g. `https://alumni-portal-api.onrender.com`.

### Frontend → Vercel
1. In Vercel: **New Project**, import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
4. Deploy. Update the backend's `CLIENT_URL` env var to match the deployed Vercel URL, then
   redeploy the backend so CORS allows it.

### MongoDB Atlas
1. Create a free M0 cluster, add a database user, and allow network access from `0.0.0.0/0`
   (or Render's static egress IPs, if configured).
2. Copy the connection string into `MONGO_URI`, replacing `<username>`/`<password>`.

---

## 10. Notes for the Faculty Demonstration

- Role-based dashboards: log in as the seeded `student`, `alumni`, and `admin` accounts to
  show the different views (mentorship CTA for students, "post opportunity" CTA for alumni,
  the Admin Console for moderation).
- Suggested live-demo path: Register a student → browse Directory → send a connection request
  → log in as the alumnus → accept it → send a message → post a job → log in as the student →
  view the job → check notifications throughout.
- The codebase is intentionally documented with inline comments explaining *why*, not just
  *what*, to support the project report's methodology section (Phase 2–5 deliverables).
