# Beaubook Merchant Dashboard

A merchant dashboard for managing bookings, staff, leave, schedules, and customers — backed by a real database.

## Architecture

- **Frontend**: React (Create React App) — `src/`
- **Backend**: Node.js + Express API — `server/`
- **Database**: PostgreSQL (via [Prisma](https://www.prisma.io/)) — schema in `server/prisma/schema.prisma`

The frontend talks to the backend through `/api/*` routes, proxied to `http://localhost:4000` during development (see the `proxy` field in `package.json`).

## Requirements

- Node.js 16+ (download at nodejs.org)
- npm (comes with Node.js)
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project) — get a `DATABASE_URL` connection string

## Quick Start

### 1. Backend

```
cd server
npm install
```

Create `server/.env`:

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
PORT=4000
```

Set up the database and seed demo data:

```
npx prisma migrate dev --name init
npm run prisma:seed
```

Start the API:

```
npm run dev
   → Listens on http://localhost:4000
```

### 2. Frontend

In a separate terminal, from the project root:

```
npm install
npm start
   → Opens at http://localhost:3000
```

Both the backend and frontend need to be running for the app to work.

### Useful backend commands

```
npm run prisma:studio   # browse/edit the database with a GUI
```

## Deploy

The frontend (`npm run build`) can be deployed anywhere static sites are hosted (e.g. Vercel). The backend (`server/`) needs a Node.js host with access to your PostgreSQL database (e.g. Railway, Render, Fly.io) — set `DATABASE_URL` as an environment variable there, and point the frontend's API calls at the deployed backend URL.
