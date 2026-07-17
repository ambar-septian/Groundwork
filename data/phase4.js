// Phase 4 — Evaluation & observability. Outlines with "full lesson coming"
// markers. This phase is deliberately emphasized: it is the skill that most
// separates a hire from a hobbyist.

module.exports = {
  id: "phase-4",
  number: 4,
  title: "Evaluation & Observability",
  tagline:
    "The differentiator phase: proving LLM systems work, catching regressions, and seeing inside them in production.",
  lessons: [
    {
      id: "p4-golden-datasets",
      number: "4.1",
      title: "Golden Datasets",
      status: "outline",
      objectives: [
        "Generalize the lesson-2.5 golden dataset from retrieval to any LLM task",
        "Source examples: hand-written, mined from production logs, and synthetic — and balance the three",
        "Design labels and rubrics that make grading tractable",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**What 'golden' means per task type**: exact expected output (classification, extraction), reference answers (Q&A), rubrics/criteria (open-ended generation), and expected trajectories (agents: which tools, in what order, with what final state).",
            "**Sourcing**: start with 20 hand-written cases from the spec; grow with mined production failures (every bug becomes a test case — the habit from 2.5); scale with synthetic generation, plus the review discipline that keeps synthetic data honest.",
            "**Coverage thinking**: happy paths, edge cases, adversarial inputs (injection attempts), out-of-scope inputs that should be refused — a test-pyramid mentality transplanted from ordinary software.",
            "**Dataset hygiene**: versioning in git, schema (JSONL conventions), splitting dev vs holdout so you don't overfit prompts to your own eval, and refreshing when the product changes.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p4-llm-judge",
      number: "4.2",
      title: "LLM-as-a-Judge",
      status: "outline",
      objectives: [
        "Use a model to grade outputs that have no single correct answer — without fooling yourself",
        "Write judge prompts with rubrics, and validate the judge against human labels",
        "Know the known biases (position, length, self-preference) and the mitigations",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**Why**: exact-match metrics can't grade summaries, answers, or agent transcripts; humans don't scale. A judge model scoring against a rubric is the industry-standard middle path.",
            "**Judge prompt anatomy**: the rubric (binary criteria beat 1–10 scales), the evidence (input, output, reference/context), chain-of-thought before verdict, and structured output (lesson 1.6) for the verdict itself.",
            "**Grading modes**: pointwise (score one output) vs pairwise (A vs B — more reliable for comparisons); direct fact-checking against retrieved context for groundedness (closing the loop with RAG).",
            "**Calibrating the judge**: label 30–50 cases yourself, measure judge-human agreement, iterate the rubric until agreement is high enough to trust — the judge is itself an LLM system that needs evaluation.",
            "**Bias catalogue & mitigations**: position bias (swap order and re-judge), length bias, self-preference (judge with a different model family than the one being judged), and cost control via cheap judges for bulk + strong judges for disagreements.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p4-eval-pipelines",
      number: "4.3",
      title: "Eval Pipelines",
      status: "outline",
      objectives: [
        "Assemble dataset + task-runner + graders + reporting into a repeatable eval harness",
        "Handle nondeterminism honestly: repeats, pass^k, and reading variance",
        "Choose tooling deliberately: your own ~200-line harness vs promptfoo/Braintrust/LangSmith",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**The architecture**: load cases → run the system under test (concurrently — the asyncio payoff from 0.3) → grade (exact/code/judge) → aggregate → report with per-case drill-down. One diagram, then code.",
            "**Nondeterminism**: run each case k times; report pass rate, not a single pass/fail; when flakiness itself is the bug you're measuring.",
            "**Comparing runs**: baseline vs candidate diffing (which cases flipped, not just the aggregate), cost/latency columns next to quality — the numbers a team actually decides with.",
            "**Build vs adopt**: what a minimal self-built harness looks like (you already wrote one in 2.5), and what promptfoo / Braintrust / LangSmith / OpenAI Evals add: UI, history, collaboration, CI integrations.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p4-regression-testing",
      number: "4.4",
      title: "Regression Testing for Prompts & Agents",
      status: "outline",
      objectives: [
        "Treat prompts and pipelines as code: every change runs the evals before it ships",
        "Set actionable gates in CI (thresholds, diffs) without flaky-test hell",
        "Extend regression testing to agents: trajectories, tool choices, and end states",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**Why prompts regress silently**: a wording tweak fixes one case and breaks five others; a provider model update shifts behavior under your feet. Version-pinned models + eval gates are the seatbelt.",
            "**CI mechanics**: evals on a schedule and on every prompt/pipeline PR; caching and sampling to keep cost/latency sane; failing the build on threshold breaches vs posting diffs for human review.",
            "**Agent-specific assertions**: did it call the right tools with valid arguments, stay under budget, reach the goal state, avoid forbidden actions? Trajectory evals vs outcome evals, and grading multi-step transcripts with a judge (4.2).",
            "**Model-upgrade playbooks**: how to evaluate a new model version against your suite before switching — the exact workflow teams run every time a provider ships a new generation.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
    {
      id: "p4-observability",
      number: "4.5",
      title: "Tracing & Observability",
      status: "outline",
      objectives: [
        "Instrument LLM apps with traces: every step, prompt, tool call, and token count, linked per request",
        "Monitor production: cost, latency, error and refusal rates, and quality drift",
        "Close the flywheel: production traces become eval cases",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**Why printf doesn't survive contact with agents**: a single request fans out into retrievals, tool calls, sub-agents. Traces (spans with parent/child structure — OpenTelemetry semantics) are the right shape; you already met the need in lesson 2.4's logging.",
            "**The LLM-native platforms**: LangSmith, Langfuse (open-source), Braintrust, Phoenix — what they add over raw OTel: prompt/response capture, token/cost accounting, eval integration, trace-to-dataset workflows.",
            "**Production dashboards that matter**: cost per request/user/feature, p50/p95 time-to-first-token, error & refusal rates, retrieval hit rates, guardrail trips. Alerting on drift, not just downtime.",
            "**Feedback loops**: user thumbs-down → trace → labeled eval case → regression suite (4.4). The flywheel that makes systems get better instead of just older.",
            "**Privacy & retention**: prompts contain user data; redaction, sampling, and retention policies belong in the design, not the postmortem.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
    },
  ],
};
