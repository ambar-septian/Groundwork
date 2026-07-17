# Deploying Groundwork

This walks through putting Groundwork on the public internet so you can read
it from your phone — and, more importantly, teaches the shape of deploying
*any* Node server with a database. Every step explains **why**, not just what
to type. Both Railway and Render are covered; they're near-identical in
concept, so learn one and you've learned both.

The three ideas that matter:

1. **The platform builds and runs your repo.** You push to GitHub; the
   platform clones, runs `npm install`, then `npm start`. Your repo *is* the
   deployment artifact — no Docker, no server administration.
2. **The filesystem is disposable.** Every deploy starts from a fresh copy of
   your repo in a fresh container. Anything your app *wrote* to disk —
   including a SQLite file — is gone after the next deploy or restart, unless
   it lives on an attached **persistent volume**. This is the step everyone
   gets wrong once.
3. **The platform tells you your port.** It routes public HTTPS traffic to a
   port it chooses, communicated via the `PORT` environment variable. Your
   code must read it (`server.js` already does).

---

## Step 1 — Push the repo to GitHub

Why: the platform doesn't take file uploads; it watches a Git repo. This also
gets you continuous deployment for free — every future `git push` becomes a
deploy.

```bash
git init                      # if not already a repo
git add -A
git commit -m "Groundwork"
# create an empty repo on github.com first, then:
git remote add origin git@github.com:<you>/groundwork.git
git push -u origin main
```

Check that `.gitignore` excludes `node_modules/` and `*.db` — the platform
installs dependencies itself, and your local reading progress is not
something to publish.

---

## Step 2 — Create the service

### Railway

1. <https://railway.app> → sign in with GitHub → **New Project → Deploy from
   GitHub repo** → pick `groundwork`.
2. Railway detects a Node app (it sees `package.json`), runs `npm install`,
   and starts it with `npm start`. That's why `"start": "node server.js"`
   exists in `package.json` — it's the contract between you and the platform.

### Render

1. <https://render.com> → **New → Web Service** → connect the GitHub repo.
2. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
3. Instance type: the free tier works (note: free instances sleep when idle
   and take ~30s to wake — fine for a personal textbook).

**Why the build works with `better-sqlite3`:** it's a native module compiled
during `npm install`. Both platforms run installs on Linux with a toolchain
present, and prebuilt binaries exist for common Node versions, so this Just
Works — but it's why you occasionally see native-module build logs scroll by.

---

## Step 3 — Attach a persistent volume (the step that matters)

Here's the gotcha worth understanding once and never forgetting:

> A deploy = a brand-new container built from your repo. Your SQLite file is
> **not in your repo** (it's git-ignored, and created at runtime). So after
> every deploy, restart, or crash-recovery, the app starts with **no
> database** — and silently recreates an empty one. Everything *looks* fine;
> your progress is just gone. This is the classic "my data resets on every
> deploy" beginner incident, and it applies to any file-based state: SQLite,
> uploads, caches.

The fix is a **persistent volume**: a disk the platform stores *outside* the
container and mounts into it at a fixed path on every deploy. Files written
there survive.

Groundwork is already wired for this: `db.js` reads `DATA_DIR` and puts
`groundwork.db` there. You attach a volume, then point `DATA_DIR` at its
mount path.

### Railway

1. Open the project → your service → right-click canvas or **+ New** →
   **Volume** → attach it to the service.
2. Set the mount path to `/data`.
3. Service → **Variables** → add `DATA_DIR = /data`.
4. Redeploy.

### Render

1. Service → **Disks** → **Add Disk**. Name it, mount path `/data`, size 1 GB
   (SQLite for one user needs almost nothing).
2. **Environment** → add `DATA_DIR = /data`.
3. Save — Render redeploys automatically.
   (Note: attaching a disk on Render pins the service to a single instance
   and disables zero-downtime deploys. Irrelevant for a single-user app, but
   that constraint is *why* stateless-plus-external-database is the default
   architecture for bigger systems — a lesson in itself.)

### Verify it actually worked

1. Open the app, mark a lesson complete.
2. Trigger a redeploy (push a trivial commit, or use the platform's
   "Redeploy" button).
3. Reload the app. The lesson is still complete → the volume works. If
   progress reset, `DATA_DIR` isn't set or doesn't match the mount path —
   that's the failure signature to remember.

---

## Step 4 — How `PORT` fits in

The platform terminates HTTPS at its edge and proxies requests to your
process on a port *it* assigns, injected as the `PORT` env var. That's why
`server.js` says:

```js
const port = process.env.PORT || 3000;
```

Locally `PORT` is unset → you get 3000. Deployed, the platform's value wins.
Never hardcode a port in deployed code, and don't set `PORT` yourself on the
platform — it's reserved. (`DATA_DIR` is yours; `PORT` is theirs.)

---

## Step 5 — Get the URL, open it on your phone

- **Railway:** service → **Settings → Networking → Generate Domain** → you
  get `https://<something>.up.railway.app`.
- **Render:** the URL is on the service page: `https://<name>.onrender.com`.

Open it on your phone, then use "Add to Home Screen" (Safari share menu) so
it launches like an app. Since the server renders the same site everywhere
and progress lives server-side in SQLite, your phone and laptop share one
reading state — which is the whole point of having a real server instead of
localStorage.

---

## Ongoing workflow

- `git push` → automatic deploy. Lesson content is code (`data/*.js`), so
  filling in Phase 3 later is: edit, commit, push, refresh phone.
- Logs: both platforms stream `console.log` from the dashboard — first stop
  when something misbehaves.
- If progress ever resets after a redeploy: it's the volume/`DATA_DIR`
  wiring, not an app bug. (See Step 3's failure signature.)

## What you just learned, generalized

This is the same deployment shape you'll use for the portfolio projects in
Phase 5: a Git-driven build (`package.json` contract), stateless containers
with explicit persistent state (volume or managed database), configuration
through environment variables (`PORT`, `DATA_DIR` — later: API keys), and a
platform-issued HTTPS domain. Swap Express for FastAPI and SQLite for
Postgres and nothing conceptual changes.
