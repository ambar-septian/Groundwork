// Phase 5 — Portfolio projects. Outlines with "full lesson coming" markers.
// These three map directly to what AI-engineer job postings ask for; the iOS
// differentiator is called out where it applies.

module.exports = {
  id: "phase-5",
  number: 5,
  title: "Portfolio Projects",
  tagline:
    "Three build-and-ship projects that map to real job postings — with your native iOS/macOS edge on top.",
  lessons: [
    {
      id: "p5-rag-system",
      number: "5.1",
      title: "Project 1: A Production RAG System with Retrieval Evaluation",
      status: "outline",
      objectives: [
        "Ship a deployed RAG product over a non-trivial corpus, not a notebook demo",
        "Demonstrate eval-driven iteration: baseline → measured improvements → report",
        "Produce the artifacts a hiring engineer actually inspects: repo, eval numbers, design writeup",
      ],
      body: [
        { p: "Outline — the full project spec will cover:" },
        {
          list: [
            "**Scope**: pick a corpus with real texture (e.g. Swift Evolution proposals + release notes — your domain advantage). Ingestion with structure-aware chunking, hybrid retrieval + reranking, grounded generation with citations, streaming API.",
            "**The eval story is the point**: a golden dataset (2.5/4.1), recall@k + MRR baseline, at least two measured improvements with before/after numbers, and answer-quality judging (4.2). The README leads with the numbers table.",
            "**Production trimmings**: tracing (4.5), cost/latency budgets, ingestion refresh, honest failure handling — the refusal path tested, injection attempted and defended.",
            "**Deployment**: the Node/Express + volume skills from this app's own DEPLOY.md, reapplied (or FastAPI — same shapes).",
            "**Differentiator**: a native SwiftUI client consuming your streaming API — citations rendered as tappable sources; nobody else's portfolio has this.",
          ],
        },
        {
          note: "Full project spec coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p5-agent",
      number: "5.2",
      title: "Project 2: An LLM Agent with Tool Use & Failure-Mode Evaluation",
      status: "outline",
      objectives: [
        "Build an agent that does real multi-step work with 3–5 well-designed tools",
        "Engineer the unglamorous parts: budgets, checkpoints, human confirmation for destructive actions",
        "Evaluate trajectories, not just outcomes — and document the failure modes you found",
      ],
      body: [
        { p: "Outline — the full project spec will cover:" },
        {
          list: [
            "**Candidate scopes** (pick one with verifiable outcomes): a release-notes agent that reads merged PRs and drafts notes; a triage agent over crash reports; a codebase-Q&A agent with file tools. Verifiability is what makes the eval story possible.",
            "**Architecture**: single agent with tools (3.3's strong default), LangGraph state machine with checkpointing, max-iteration/token budgets, and an interrupt point before any mutating action.",
            "**Tool design** per 3.2: sharp schemas, informative errors, idempotency. One MCP-packaged tool (3.4) to show protocol fluency.",
            "**The failure-mode eval is the headline**: a trajectory eval suite (4.4) — right tools called, budget respected, goal state reached — plus a taxonomy of observed failures (looping, wrong-tool, hallucinated arguments, premature stop) with frequencies and mitigations. This section is what separates you from every 'I built an agent' repo.",
            "**Differentiator**: drive it from a macOS menu-bar app or iOS client with human-approval push notifications for gated actions.",
          ],
        },
        {
          note: "Full project spec coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p5-eval-pipeline",
      number: "5.3",
      title: "Project 3: A Reusable LLM Evaluation Pipeline",
      status: "outline",
      objectives: [
        "Package the eval skills from Phase 4 into a tool other engineers could adopt",
        "Support the full grading spectrum: exact, code-based, and calibrated LLM-as-judge",
        "Prove it on projects 1 and 2 — dogfooding is the demo",
      ],
      body: [
        { p: "Outline — the full project spec will cover:" },
        {
          list: [
            "**Shape**: a CLI + library (Python) — `eval run suite.yaml` — with JSONL datasets, pluggable task runners, graders (exact / code / judge with rubric), k-repeats for nondeterminism, and a diff command comparing two runs case-by-case.",
            "**Judge calibration built in** (4.2): a `calibrate` subcommand measuring judge-human agreement on a labeled sample, because an uncalibrated judge is a random number generator with confidence.",
            "**CI story** (4.4): GitHub Action, threshold gates, markdown report on the PR. Cost controls: concurrency limits, caching, sampling.",
            "**Dogfood**: wire it into Project 1 (retrieval + answer quality) and Project 2 (trajectories). The README shows real regressions it caught.",
            "**Why this project matters most**: it demonstrates the Phase-4 differentiator directly — you don't just build LLM systems, you can prove they work. That sentence is the interview.",
          ],
        },
        {
          note: "Full project spec coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
  ],
};
