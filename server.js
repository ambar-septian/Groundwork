const path = require("path");
const express = require("express");
const db = require("./db");
const curriculum = require("./data/curriculum");

const app = express();
app.use(express.json());

// The full curriculum, including authored lesson content.
app.get("/api/lessons", (req, res) => {
  res.json(curriculum);
});

// Which lessons are marked complete.
app.get("/api/progress", (req, res) => {
  res.json(db.getProgress());
});

// Upsert a lesson's completion state: { lessonId, complete }
app.post("/api/progress", (req, res) => {
  const { lessonId, complete } = req.body || {};
  if (typeof lessonId !== "string" || typeof complete !== "boolean") {
    return res
      .status(400)
      .json({ error: "Expected { lessonId: string, complete: boolean }" });
  }
  const known = curriculum.phases.some((phase) =>
    phase.lessons.some((lesson) => lesson.id === lessonId)
  );
  if (!known) {
    return res.status(404).json({ error: `Unknown lesson id: ${lessonId}` });
  }
  db.setProgress(lessonId, complete);
  res.json({ lessonId, complete });
});

app.use(express.static(path.join(__dirname, "public")));

// PORT comes from the environment so the same code runs locally and on
// Railway/Render, where the platform assigns the port.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Groundwork running at http://localhost:${port}`);
});
