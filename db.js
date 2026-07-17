// SQLite setup for progress tracking.
//
// DATA_DIR matters for deployment: on Railway/Render the app's filesystem is
// wiped on every deploy, so the database must live on a persistent volume.
// Point DATA_DIR at the volume's mount path (e.g. /data) and progress
// survives redeploys. Locally it defaults to the project directory.
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dataDir = process.env.DATA_DIR || __dirname;
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "groundwork.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    lesson_id  TEXT PRIMARY KEY,
    complete   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const getAllStmt = db.prepare(
  "SELECT lesson_id, complete, updated_at FROM progress"
);
const upsertStmt = db.prepare(`
  INSERT INTO progress (lesson_id, complete, updated_at)
  VALUES (@lessonId, @complete, datetime('now'))
  ON CONFLICT(lesson_id) DO UPDATE SET
    complete = excluded.complete,
    updated_at = excluded.updated_at
`);

module.exports = {
  getProgress() {
    return getAllStmt.all().map((row) => ({
      lessonId: row.lesson_id,
      complete: row.complete === 1,
      updatedAt: row.updated_at,
    }));
  },
  setProgress(lessonId, complete) {
    upsertStmt.run({ lessonId, complete: complete ? 1 : 0 });
  },
};
