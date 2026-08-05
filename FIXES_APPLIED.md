# Why login wasn't working — root causes & fixes

I ran the actual server and reproduced the problem instead of just reading the code. Here's exactly what was wrong.

## 1. Real bug: duplicate function crashed the server on every start (main cause)

`server/fallbackDb.js` declared `const getDoctorById = (id) => {...}` **twice** in the same file.
That's a JavaScript `SyntaxError`, so Node refused to even load the file:

```
SyntaxError: Identifier 'getDoctorById' has already been declared
```

Since `authController.js` requires `fallbackDb.js`, this crashed the server the instant you ran
`node server.js` / `npm start` — before it ever opened port 5000. So the frontend's login request
had nothing to talk to. It would fail silently or show a generic "Login failed" message, and
never navigate anywhere — exactly the symptom you described.

**Fix:** removed the duplicate declaration, keeping the more complete version (the one with the
sample-doctor fallback).

## 2. Fragile dependency: `bcrypt` (native binary)

`bcrypt` ships a compiled `.node` binary tied to your exact OS/CPU/Node version. It's one of the
most common reasons a Node project that works on one machine fails on another (or after copying a
`node_modules` folder around) — you'd see errors like `invalid ELF header` or install failures on
Windows without build tools.

**Fix:** replaced `bcrypt` with `bcryptjs` everywhere (`authController.js`, `doctorController.js`,
`patientController.js`, and `package.json`). It's a pure-JavaScript, drop-in-compatible
implementation — same API, zero native compilation, works identically on any machine.

## 3. Cleaned up

- Removed the committed `node_modules` folders (large, and can contain machine-specific binaries
  like the one above). Reinstall with `npm install` in both `server/` and `client/`.
- Removed a stray `debug-db.js` and any generated `fallback-db.json` test data.

## Verified working end-to-end

I actually ran both servers and hit the real endpoints:
- `POST /api/auth/register` → 201, user created
- `POST /api/auth/login` → 200, returns a JWT + user object for `patient`, `doctor` roles
- Invalid credentials → 401 as expected
- `npm run build` on the client completes with no errors

## How to run it yourself

```bash
# Terminal 1
cd server
npm install
npm start          # or: npm run dev (nodemon)

# Terminal 2
cd client
npm install
npm run dev
```

Open http://localhost:3000, register an account, then log in — you should land on the
matching dashboard (`/patient-dashboard`, `/doctor-dashboard`, or `/admin-dashboard`).

Note: the app works without Postgres too — if it can't reach the database configured in
`server/.env`, it automatically falls back to a local `server/fallback-db.json` file so you can
test login/register right away. If you do want real Postgres, make sure the `users`, `doctors`,
and `patients` tables exist and match `server/.env`.
