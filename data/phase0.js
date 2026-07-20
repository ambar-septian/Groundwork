// Phase 0 — Python warmup. Deliberately lightweight: a few days of mapping
// idioms, not a course. Lessons are outlines ("full lesson coming") to be
// expanded later using the same block format as Phase 1/2.

module.exports = {
  id: "phase-0",
  number: 0,
  title: "Python Warmup",
  tagline:
    "A few days of idiom-mapping for an experienced engineer — not a Python course.",
  lightweight: true,
  lessons: [
    {
      id: "p0-idioms",
      number: "0.1",
      title: "Python Idioms, Mapped from Swift and JavaScript",
      status: "outline",
      objectives: [
        "Translate the Swift/JS constructs you use daily into idiomatic Python",
        "Know which Python habits matter for AI codebases specifically (dicts, comprehensions, dataclasses, type hints)",
        "Avoid the classic convert-from-Swift mistakes (mutability defaults, truthiness, duck typing)",
      ],
      body: [
        {
          p: "The translation table below is the working core of this lesson — keep it open in a tab for your first weeks of Python. Everything on the left is muscle memory for you; the right column is what your fingers should learn to type instead.",
        },
        {
          table: {
            caption: "Swift → Python: the constructs you use daily",
            head: ["Concept", "Swift", "Python"],
            rows: [
              ["Constant / variable", "`let x = 3` / `var y = 4`", "`x = 3` (no keyword; everything rebindable)"],
              ["Value type", "`struct User { let name: String }`", "`@dataclass` on `class User: name: str`"],
              ["Optional", "`var s: String?`", "`s: str | None = None`"],
              ["Unwrapping", "`if let s { use(s) }`", "`if s is not None: use(s)`"],
              ["Early exit", "`guard let u else { return }`", "`if u is None: return`"],
              ["Closure", "`{ $0 * 2 }`", "`lambda x: x * 2`"],
              ["Map / filter", "`items.map { $0.name }`", "`[i.name for i in items]`"],
              ["Dictionary", "`[String: Int]`", "`dict[str, int]` — the workhorse type of AI code"],
              ["Interface", "`protocol Fetcher { ... }`", "`class Fetcher(Protocol): ...` or duck typing"],
              ["Enum w/ values", "`enum Result { case ok(Data) }`", "union types: `Data | ApiError`, or `Enum`"],
              ["Error handling", "`throws` + `do { } catch { }`", "`raise` + `try: ... except ApiError:`"],
              ["String interp.", "`\"hi \\(name)\"`", "`f\"hi {name}\"`"],
              ["Nil", "`nil`", "`None`"],
              ["Package manifest", "`Package.swift`", "`pyproject.toml`"],
            ],
          },
        },
        {
          p: "The mapping you'll lean on most in AI work is `Codable` → **Pydantic**. Pydantic's `BaseModel` is the ecosystem's shared currency — structured LLM output (lesson 1.6), FastAPI request/response schemas, config files — so read this pair until it feels boring:",
        },
        {
          compare: {
            caption: "The same model, both worlds — Pydantic validates at runtime, which Codable leaves to the decoder",
            left: {
              label: "Swift — Codable",
              code: 'struct BugTriage: Codable {\n    let severity: String\n    let component: String\n    let isRegression: Bool\n}\n\nlet triage = try JSONDecoder()\n    .decode(\n        BugTriage.self,\n        from: data\n    )',
            },
            right: {
              label: "Python — Pydantic",
              code: 'from pydantic import BaseModel\n\nclass BugTriage(BaseModel):\n    severity: str\n    component: str\n    is_regression: bool\n\ntriage = (\n    BugTriage\n    .model_validate_json(raw)\n)',
            },
          },
        },
        { p: "Outline — the full lesson will additionally cover:" },
        {
          list: [
            "**Type hints**: Python's hints are optional and unenforced at runtime, but the AI ecosystem (Pydantic, FastAPI, LangChain) leans on them heavily — write them like you'd write Swift types.",
            "**Gotchas for Swift engineers**: mutable default arguments, everything-is-a-reference semantics, truthiness of empty collections, no access control keywords, exceptions instead of `Result` as the default error channel.",
            "**What to skip**: metaclasses, decorators-beyond-usage, packaging internals. You don't need them to ship AI features.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p0-environments",
      number: "0.2",
      title: "Environments & Package Management",
      status: "outline",
      objectives: [
        "Set up an isolated Python environment without fighting your system Python",
        "Pick one tool (uv) and know how pip/venv/poetry relate to it",
        "Pin dependencies so AI projects are reproducible",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**Why Python environments are a mess** compared to SwiftPM/npm: global site-packages, multiple interpreter versions, and why `pip install` into the system Python breaks things.",
            "**The one-tool answer: `uv`** — `uv venv`, `uv pip install`, `uv run`. Rust-fast, drop-in for pip, becoming the ecosystem default. Mental model: `uv` is your `npm`, `pyproject.toml` is your `package.json`.",
            "**Decoding other people's repos**: `requirements.txt` vs `pyproject.toml` vs `poetry.lock` vs `conda` — how to recognize each and get any repo running.",
            "**Reproducibility**: lockfiles, pinning `anthropic`/`openai` SDK versions (they move fast), and `.env` files for API keys (never commit them).",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p0-asyncio",
      number: "0.3",
      title: "asyncio vs Swift Concurrency",
      status: "outline",
      objectives: [
        "Map async/await in Python onto the Swift Concurrency model you already know",
        "Know where the models genuinely differ (event loop vs cooperative thread pool)",
        "Write concurrent LLM API calls — the main reason AI code is async at all",
      ],
      body: [
        {
          p: "The direct mapping first — most of Swift Concurrency transfers name-for-name, which makes the differences (below the table) the only part that needs real attention:",
        },
        {
          table: {
            caption: "Swift Concurrency → asyncio",
            head: ["Concept", "Swift", "Python (asyncio)"],
            rows: [
              ["Async function", "`func fetch() async -> Data`", "`async def fetch():`"],
              ["Awaiting", "`let d = await fetch()`", "`d = await fetch()`"],
              ["Parallel pair", "`async let a = f(); async let b = g()`", "`a, b = await asyncio.gather(f(), g())`"],
              ["Task group", "`withTaskGroup { ... }`", "`async with asyncio.TaskGroup() as tg:`"],
              ["Fire off a task", "`Task { await work() }`", "`asyncio.create_task(work())`"],
              ["Sleep", "`try await Task.sleep(for: .seconds(1))`", "`await asyncio.sleep(1)`"],
              ["Entry point", "`@main` + `async func main()`", "`asyncio.run(main())`"],
              ["Cancellation", "`task.cancel()` + `Task.checkCancellation()`", "`task.cancel()` + `except asyncio.CancelledError`"],
              ["Concurrency cap", "manual / `TaskGroup` throttling", "`asyncio.Semaphore(10)`"],
              ["Data-race safety", "actors + `Sendable` (compiler-checked)", "none — GIL + convention only"],
            ],
          },
        },
        { p: "Outline — the full lesson will additionally cover:" },
        {
          list: [
            "**The familiar part**: `async def` / `await` reads exactly like Swift. `asyncio.gather` ≈ `async let` + `await` on multiple tasks; `asyncio.TaskGroup` ≈ Swift's `withTaskGroup` (almost name-for-name).",
            "**The different part**: Python's event loop is single-threaded cooperative scheduling (closer to JS than Swift). No actors, no `Sendable` — data races are prevented by the GIL and convention, not the compiler.",
            "**The entry point**: `asyncio.run(main())` — there's no async `main` by default, and you can't `await` at the top level of a script.",
            "**Why AI code cares**: LLM calls are slow I/O. Firing 50 eval prompts concurrently with `gather` + an `AsyncAnthropic`/`AsyncOpenAI` client is the difference between 4 minutes and 10 seconds. Semaphores for rate-limit-friendly concurrency caps.",
            "**When not to bother**: scripts and notebooks are fine synchronous. Async matters for eval harnesses and serving, which is exactly where you'll meet it in Phases 2 and 4.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
  ],
};
