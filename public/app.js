/* Groundwork frontend — plain JS, no build step.
 *
 * Loads the curriculum + progress, renders the chapter-spine TOC and the
 * reading pane, and keeps the URL hash (#/lesson/<id>) as the source of
 * truth for which lesson is open, so lessons are deep-linkable.
 */

(function () {
  "use strict";

  const state = {
    curriculum: null,
    progress: new Map(), // lessonId -> boolean
    progressAvailable: true,
    lessons: [], // flattened, in order
  };

  const $ = (sel) => document.querySelector(sel);

  // ── tiny rendering helpers ─────────────────────────────────────────

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // Inline formatting for prose strings: `code` and **bold**.
  function inline(s) {
    return escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  // ── data loading ───────────────────────────────────────────────────

  async function load() {
    // Lessons are essential; progress degrades gracefully.
    let lessonsError = null;
    try {
      const res = await fetch("/api/lessons");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.curriculum = await res.json();
    } catch (err) {
      lessonsError = err;
    }

    try {
      const res = await fetch("/api/progress");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      for (const row of rows) state.progress.set(row.lessonId, row.complete);
    } catch (err) {
      state.progressAvailable = false;
    }

    if (lessonsError) {
      $("#content").innerHTML =
        '<div class="error-banner">Could not load the curriculum (' +
        escapeHtml(lessonsError.message) +
        "). Check that the server is running, then reload.</div>";
      return;
    }

    state.lessons = state.curriculum.phases.flatMap((phase) =>
      phase.lessons.map((lesson) => ({ ...lesson, phase }))
    );

    renderToc();
    renderOverallProgress();
    route();
  }

  // ── progress ───────────────────────────────────────────────────────

  function isComplete(id) {
    return state.progress.get(id) === true;
  }

  async function setComplete(id, complete) {
    state.progress.set(id, complete); // optimistic
    renderToc();
    renderOverallProgress();
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: id, complete }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      state.progress.set(id, !complete); // roll back
      renderToc();
      renderOverallProgress();
      alert("Couldn't save progress — is the server reachable?");
    }
    renderLesson(currentLessonId());
  }

  function renderOverallProgress() {
    const total = state.lessons.length;
    const done = state.lessons.filter((l) => isComplete(l.id)).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $("#overall-progress-fill").style.width = pct + "%";
    $("#overall-progress-label").textContent = state.progressAvailable
      ? `${done} of ${total} · ${pct}%`
      : "progress unavailable";
  }

  // ── table of contents ──────────────────────────────────────────────

  function renderToc() {
    const active = currentLessonId();
    const html = state.curriculum.phases
      .map((phase) => {
        const done = phase.lessons.filter((l) => isComplete(l.id)).length;
        const pct = phase.lessons.length
          ? Math.round((done / phase.lessons.length) * 100)
          : 0;
        const items = phase.lessons
          .map((lesson) => {
            const complete = isComplete(lesson.id);
            return `
              <li class="toc-lesson">
                <a href="#/lesson/${lesson.id}"
                   class="${lesson.id === active ? "active" : ""}"
                   aria-current="${lesson.id === active ? "page" : "false"}">
                  <span class="toc-check ${complete ? "" : "todo"}" aria-hidden="true">${complete ? "●" : "○"}</span>
                  <span class="toc-num">${escapeHtml(lesson.number)}</span>
                  <span>${escapeHtml(lesson.title)}</span>
                </a>
              </li>`;
          })
          .join("");
        return `
          <section class="toc-phase">
            <div class="toc-phase-head">
              <div class="toc-phase-num" aria-hidden="true">${phase.number}</div>
              <div class="toc-phase-title">
                <h2>${escapeHtml(phase.title)}</h2>
                <div class="toc-phase-meta">
                  <span class="phase-progress-track" aria-hidden="true">
                    <span class="phase-progress-fill" style="display:block;width:${pct}%"></span>
                  </span>
                  <span>${done}/${phase.lessons.length}</span>
                  ${phase.lightweight ? '<span class="phase-tag">light</span>' : ""}
                </div>
              </div>
            </div>
            <ul class="toc-lessons">${items}</ul>
          </section>`;
      })
      .join("");
    $("#toc").innerHTML = html;
  }

  // ── lesson rendering ───────────────────────────────────────────────

  function renderBlock(block) {
    if (block.h) return `<h2>${inline(block.h)}</h2>`;
    if (block.p) return `<p>${inline(block.p)}</p>`;
    if (block.list) {
      const items = block.list.map((li) => `<li>${inline(li)}</li>`).join("");
      return `<ul>${items}</ul>`;
    }
    if (block.code) {
      const caption = block.caption
        ? `<div class="code-caption">${inline(block.caption)}</div>`
        : "";
      return `
        <figure class="code-block">
          <pre><code class="lang-${escapeHtml(block.lang || "text")}">${escapeHtml(block.code)}</code></pre>
          ${caption}
        </figure>`;
    }
    if (block.note) return `<aside class="note">${inline(block.note)}</aside>`;
    return "";
  }

  function renderLesson(id) {
    const idx = state.lessons.findIndex((l) => l.id === id);
    if (idx === -1) {
      // default to first incomplete lesson, else first lesson
      const next = state.lessons.find((l) => !isComplete(l.id)) || state.lessons[0];
      location.replace("#/lesson/" + next.id);
      return;
    }
    const lesson = state.lessons[idx];
    const phase = lesson.phase;
    const complete = isComplete(lesson.id);
    const prev = state.lessons[idx - 1];
    const next = state.lessons[idx + 1];

    const objectives = lesson.objectives
      ? `<section class="objectives" aria-label="Learning objectives">
           <h2>You'll learn</h2>
           <ul>${lesson.objectives.map((o) => `<li>${inline(o)}</li>`).join("")}</ul>
         </section>`
      : "";

    const outlineBanner =
      lesson.status === "outline"
        ? `<div class="outline-banner"><strong>Outline for now.</strong>
             This lesson is a structured summary — the full write-up lands in a later pass,
             in the same format as Phases 1 &amp; 2.</div>`
        : "";

    const body = (lesson.body || []).map(renderBlock).join("");

    const exercise = lesson.exercise
      ? `<section class="exercise" aria-label="Exercise">
           <h2>Exercise</h2>
           ${lesson.exercise.intro ? `<p class="exercise-intro">${inline(lesson.exercise.intro)}</p>` : ""}
           <ol>${(lesson.exercise.steps || []).map((s) => `<li>${inline(s)}</li>`).join("")}</ol>
         </section>`
      : "";

    const goDeeper =
      lesson.goDeeper && lesson.goDeeper.length
        ? `<section class="go-deeper">
             <h2>Go deeper <span class="optional-tag">(optional)</span></h2>
             <ul>${lesson.goDeeper
               .map(
                 (r) =>
                   `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.label)}</a></li>`
               )
               .join("")}</ul>
           </section>`
        : "";

    const pagerLink = (l, dir) =>
      l
        ? `<a class="pager-${dir}" href="#/lesson/${l.id}">
             <span class="pager-dir">${dir === "prev" ? "← Previous" : "Next →"}</span>
             <span class="pager-title">${escapeHtml(l.number)} · ${escapeHtml(l.title)}</span>
           </a>`
        : "<span></span>";

    $("#content").innerHTML = `
      <article>
        <p class="eyebrow">Phase ${phase.number} · ${escapeHtml(phase.title)} — Lesson ${escapeHtml(lesson.number)}</p>
        <h1 class="lesson-title">${escapeHtml(lesson.title)}</h1>
        ${outlineBanner}
        ${objectives}
        <div class="lesson-body">${body}</div>
        ${exercise}
        ${goDeeper}
        <footer class="lesson-footer">
          <button class="complete-toggle ${complete ? "done" : ""}"
                  id="complete-toggle"
                  ${state.progressAvailable ? "" : "disabled"}
                  aria-pressed="${complete}">
            <span class="dot" aria-hidden="true"></span>
            ${complete ? "Completed — tap to unmark" : "Mark complete"}
          </button>
          <nav class="pager" aria-label="Lesson navigation">
            ${pagerLink(prev, "prev")}
            ${pagerLink(next, "next")}
          </nav>
        </footer>
      </article>`;

    const toggle = $("#complete-toggle");
    if (toggle && state.progressAvailable) {
      toggle.addEventListener("click", () => setComplete(lesson.id, !complete));
    }

    document.title = `${lesson.number} ${lesson.title} — Groundwork`;
    renderToc(); // refresh active highlight
  }

  // ── routing ────────────────────────────────────────────────────────

  function currentLessonId() {
    const m = location.hash.match(/^#\/lesson\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function route() {
    const id = currentLessonId();
    renderLesson(id || "");
    closeSidebar();
    $("#lesson-pane").scrollTo?.(0, 0);
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);

  // ── mobile drawer ──────────────────────────────────────────────────

  const sidebar = $("#sidebar");
  const overlay = $("#sidebar-overlay");
  const menuToggle = $("#menu-toggle");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("visible"));
    menuToggle.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    overlay.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }
  menuToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });
  overlay.addEventListener("click", closeSidebar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  load();
})();
