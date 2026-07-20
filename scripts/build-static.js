// Build a fully static version of Groundwork into docs/ for GitHub Pages.
//
// Pages can't run the Express server or SQLite, so this build inlines the
// curriculum into the page and swaps the progress API for localStorage via a
// small fetch shim. The frontend code itself is unchanged — same app.js.
//
// Run with:  npm run build:static   (then commit docs/ and push)

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const curriculum = require(path.join(root, "data", "curriculum"));

const css = fs.readFileSync(path.join(root, "public", "styles.css"), "utf8");
const appJs = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
let html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");

// The app's CSS switches themes via prefers-color-scheme only. Static hosts
// are fine with that, so no extra theme plumbing is needed here.

// localStorage-backed stand-in for the two progress endpoints, plus the
// inlined curriculum for /api/lessons.
const shim = `
// Static build: no server. Curriculum is inlined; progress lives in
// localStorage in this browser only.
window.__GW_DATA__ = ${JSON.stringify(curriculum)};
(function () {
  var KEY = "groundwork-progress";
  function readRows() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (url === "/api/lessons") {
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve(window.__GW_DATA__); } });
    }
    if (url === "/api/progress" && (!opts || !opts.method || opts.method === "GET")) {
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve(readRows()); } });
    }
    if (url === "/api/progress" && opts && opts.method === "POST") {
      var body = JSON.parse(opts.body);
      var rows = readRows().filter(function (r) { return r.lessonId !== body.lessonId; });
      rows.push({ lessonId: body.lessonId, complete: body.complete, updatedAt: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(rows));
      return Promise.resolve({ ok: true, json: function () { return Promise.resolve(body); } });
    }
    return realFetch(url, opts);
  };
})();
`;

html = html
  .replace(
    '<link rel="stylesheet" href="styles.css" />',
    "<style>\n" + css + "\n</style>"
  )
  .replace(
    '<script src="app.js"></script>',
    "<script>\n" + shim + "\n</script>\n<script>\n" + appJs + "\n</script>"
  )
  .replace(
    '<div class="layout">',
    '<div class="static-note">Static edition — progress is saved in this browser only.</div>\n  <div class="layout">'
  )
  .replace(
    "</head>",
    "<style>.static-note{font-family:var(--sans);font-size:0.75rem;color:var(--ink-soft);background:var(--note-bg);border-bottom:1px solid var(--line);padding:0.45rem 1.25rem;}</style>\n</head>"
  );

const outDir = path.join(root, "docs");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
// Pages runs Jekyll by default, which can mangle files; .nojekyll disables it.
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");

console.log(
  "Wrote docs/index.html (" +
    Math.round(fs.statSync(path.join(outDir, "index.html")).size / 1024) +
    " KB) — commit docs/ and enable GitHub Pages from the /docs folder."
);
