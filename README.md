# madnesshub

A minimalist blogging platform built with Next.js, MongoDB, and Tailwind CSS.

---

## Demo Access

The database is pre-seeded with a demo admin account and three published posts.

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@madnesshub.com`   |
| Password | `Demo1234!`              |
| Username | `admin`                  |

### Demo posts

1. **The Future of AI: What Comes Next** — AI agents, multimodality, and personalization
2. **The Fall of Traditional Web Development** — Why the modern stack is fragmenting
3. **Game Design and Gamification: Lessons for Product Builders** — What games teach us about UX

---

## Tech Stack

| Layer       | Technology                      |
|-------------|---------------------------------|
| Framework   | Next.js 16 (App Router)         |
| Styling     | Tailwind CSS v4                 |
| Database    | MongoDB Atlas + Mongoose v9     |
| Auth        | Auth.js v5 (next-auth beta)     |
| Forms       | React Hook Form + Zod v4        |
| Markdown    | react-markdown                  |
| Dark mode   | next-themes                     |
| Deployment  | Vercel                          |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/madnesshub?...
AUTH_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))">
NEXTAUTH_URL=http://localhost:3000
```

### 3. Seed demo data (optional)

```bash
npm run seed
```

Populates the admin account and three demo blog posts. Safe to skip if you want to start fresh.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
madnesshub/
├── app/
│   ├── (auth)/              # Login and register pages
│   ├── blog/[slug]/         # Public post page
│   ├── dashboard/           # Authenticated writer dashboard
│   ├── profile/[username]/  # Author profile
│   ├── search/              # Search page
│   └── api/                 # REST API routes
├── components/              # Shared UI components
├── lib/                     # DB connection, auth config, validators, data helpers
├── models/                  # Mongoose schemas (User, Post)
└── scripts/seed.ts          # Demo data seeder
```

---

## Features

- Register, log in, log out
- Create, edit, and delete posts
- Save as draft or publish
- Markdown editor with live preview
- Public blog feed with search and tag filtering
- Author profile pages
- Estimated reading time
- Light / dark mode
- Fully responsive

---

## Deployment

Push to GitHub and import into [Vercel](https://vercel.com). Add the three environment variables (`MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`) in the Vercel project settings. Vercel auto-deploys on every push to `main`.
