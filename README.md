# Hospital Management System

A full-stack PERN application scaffold with:
- Client: React + Vite + Tailwind CSS
- Server: Node.js + Express + PostgreSQL

## Structure

- client/
  - src/
  - package.json
  - vite.config.js
  - tailwind.config.js
  - postcss.config.js
- server/
  - controllers/
  - models/
  - routes/
  - middleware/
  - config/
  - db.js
  - .env
  - server.js

## Run locally

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Environment
Update server/.env with your PostgreSQL credentials before running the backend.
