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
          p: "Outline — the full lesson will cover, with side-by-side Swift/Python snippets:",
        },
        {
          list: [
            "**Core mappings**: `struct`/`class` → `dataclass`; protocols → `Protocol`/duck typing; optionals → `None` + `Optional[T]` hints; `guard let` → early `return`/`if x is None`; closures → lambdas and plain functions; `map`/`filter` → comprehensions (the idiomatic default in Python).",
            "**Type hints**: Python's hints are optional and unenforced at runtime, but the AI ecosystem (Pydantic, FastAPI, LangChain) leans on them heavily — write them like you'd write Swift types.",
            "**Pydantic in five minutes**: `BaseModel` as the ecosystem's `Codable`. You will see it everywhere — structured LLM output, API schemas, config.",
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
        { p: "Outline — the full lesson will cover:" },
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
