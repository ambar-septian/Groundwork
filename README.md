# Groundwork

A self-contained textbook web app that teaches the path from senior software
engineer to **AI Engineer** (LLM / agentic focus). The lessons live inside the
app as real written content — explanations, runnable code examples, and
hands-on exercises. External links are optional "go deeper" references, never
the main content.

## Stack

- **Server:** Node.js + Express — owns the lesson content, serves it via an API
- **Database:** SQLite (`better-sqlite3`) — tracks which lessons you've completed
- **Frontend:** plain HTML/CSS/JS in `public/` — no build step

## Run locally

```bash
npm install
npm start
```

Open <http://localhost:3000>. Progress is stored in `groundwork.db` next to
the code (git-ignored).

Set `PORT` to change the port; set `DATA_DIR` to store the database somewhere
else (that's how the deployed version keeps progress on a persistent volume —
see [DEPLOY.md](DEPLOY.md)).

## Layout

```
server.js            Express app: /api/lessons, /api/progress, static frontend
db.js                SQLite setup + progress queries
data/curriculum.js   Single source of truth for content; one module per phase
data/phase0..5.js    Lesson content (Phases 1–2 fully authored; 0, 3–5 outlined)
public/              Frontend (index.html, styles.css, app.js)
DEPLOY.md            End-to-end guide to deploying this with a persistent disk
```

## Curriculum

| Phase | Topic | Depth today |
|---|---|---|
| 0 | Python warmup (idioms, environments, asyncio vs Swift Concurrency) | outline |
| 1 | LLM fundamentals (tokens, context, embeddings, Messages API, streaming, structured output) | **full** |
| 2 | RAG & retrieval (vector search, chunking, end-to-end pipeline, retrieval evals) | **full** |
| 3 | Agent frameworks (LangChain/LangGraph, tool use, agent patterns, MCP servers) | outline |
| 4 | Evaluation & observability (golden datasets, LLM-as-judge, eval pipelines, tracing) | outline |
| 5 | Portfolio projects (production RAG, evaluated agent, reusable eval pipeline) | outline |

Outlined phases render with a "full lesson coming" marker and will be filled
in phase by phase using the same lesson format. All content lives in the
`data/` modules — adding depth to a phase is an edit to one file.
