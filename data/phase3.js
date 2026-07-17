// Phase 3 — Agent frameworks. Outlines with "full lesson coming" markers,
// to be expanded later in the same block format as Phase 1/2.

module.exports = {
  id: "phase-3",
  number: 3,
  title: "Agent Frameworks",
  tagline:
    "From single calls to systems that decide, act, and loop — orchestration, tools, patterns, and MCP.",
  lessons: [
    {
      id: "p3-langchain-langgraph",
      number: "3.1",
      title: "Orchestration with LangChain & LangGraph",
      status: "outline",
      objectives: [
        "Know what orchestration frameworks actually buy you over the bare SDK calls from Phase 1",
        "Rebuild the Phase 2 RAG pipeline in LangChain and judge the trade-off yourself",
        "Model an agent as a graph in LangGraph: state, nodes, edges, and checkpoints",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**What frameworks solve**: provider abstraction, composition of steps, retries, streaming plumbing, tracing hooks — and what they cost: indirection, churny APIs, harder debugging. You've built RAG bare, so you can evaluate this trade honestly.",
            "**LangChain in one sitting**: chat models, prompt templates, output parsers, and LCEL composition. Rebuilding lesson 2.4's pipeline in ~20 lines.",
            "**LangGraph as the serious tool**: agents as state machines — a `State` dict, nodes as functions, conditional edges for loops. Why 'graph with cycles' is the right abstraction for agents when 'chain' stops being enough.",
            "**Persistence & human-in-the-loop**: checkpointers, interrupts, resuming a run — the features that separate demos from products.",
            "**When to skip frameworks entirely**: the (strong) case for plain Python + the SDK for simple pipelines, and the signals that you've grown into needing a graph.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
      goDeeper: [
        { label: "LangGraph docs", url: "https://langchain-ai.github.io/langgraph/" },
      ],
    },
    {
      id: "p3-tool-use",
      number: "3.2",
      title: "Tool Use (Function Calling)",
      status: "outline",
      objectives: [
        "Define tools with JSON schemas and run the tool-use loop by hand once",
        "Design tool interfaces the model can actually use well (naming, descriptions, error returns)",
        "Handle parallel tool calls, tool errors, and the security posture of executing model-chosen actions",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**The mechanism**: you send tool definitions (name, description, JSON Schema input); the model replies with `stop_reason: \"tool_use\"` and structured arguments; your code executes and sends back a `tool_result`; loop until `end_turn`. The model never runs anything — it only asks.",
            "**The bare loop in Python** against the Anthropic Messages API — written once by hand, exactly like the bare RAG pipeline, so SDK tool-runners and framework agents demystify themselves.",
            "**Tool design as API design**: descriptions are prompts; enums beat free strings; return informative errors (`is_error: true`) so the model can self-correct; fewer, sharper tools beat many vague ones.",
            "**Parallel tool calls** and multi-tool results in one turn; timeouts and idempotency for tools with side effects.",
            "**Security**: model-chosen arguments are untrusted input. Validation, allow-lists, human confirmation for destructive actions, and why 'the model as confused deputy' is the threat model.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
      goDeeper: [
        {
          label: "Anthropic docs — tool use",
          url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
        },
      ],
    },
    {
      id: "p3-agent-patterns",
      number: "3.3",
      title: "Agent Patterns: Single-Agent, Multi-Agent, Planning & Reflection",
      status: "outline",
      objectives: [
        "Recognize the standard agent architectures and the problems each actually fits",
        "Understand planning and reflection loops, and their cost/latency/reliability price",
        "Know why 'a single agent with good tools' is the strong default and multi-agent is a scaling decision",
      ],
      body: [
        { p: "Outline — the full lesson will cover:" },
        {
          list: [
            "**The agent loop** distilled: model → tool calls → observations → model, until done. Everything else is variations.",
            "**Single agent with tools**: the workhorse. Context management across many tool calls (compaction, lesson 1.2 applied), stop conditions, and budget guards (max iterations, max tokens).",
            "**Planning patterns**: plan-then-execute vs interleaved (ReAct-style) reasoning; when an explicit plan artifact helps (long tasks, user visibility) and when it's ceremony.",
            "**Reflection loops**: generate → critique → revise, self-consistency, and verifier models. Where reflection measurably helps (code, math) vs where it just doubles cost.",
            "**Multi-agent**: orchestrator/sub-agent architectures, parallel fan-out for independent subtasks, shared context via files vs message passing — and the honest failure modes: cost multiplication, error compounding, and debugging pain. Anthropic's own guidance: use the simplest pattern that works.",
            "**Durability**: long-running agents need checkpointing, resumability, and human interrupt points — connecting back to LangGraph (3.1) and forward to evaluation (Phase 4).",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
      goDeeper: [
        {
          label: "Anthropic — Building effective agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
    {
      id: "p3-mcp-server",
      number: "3.4",
      title: "Building Your Own MCP Server",
      status: "outline",
      objectives: [
        "Formalize what you already know from using MCP: the protocol's actual moving parts",
        "Build and test a working MCP server exposing tools over stdio and HTTP transports",
        "Design MCP tools that compose well with hosts (Claude Desktop/Code, IDEs) you already use",
      ],
      body: [
        {
          p: "You've used MCP hands-on already — this lesson turns familiarity into architecture. Outline — the full lesson will cover:",
        },
        {
          list: [
            "**The model**: hosts, clients, servers; tools, resources, prompts as the three primitives; capability negotiation at initialization. MCP as 'USB-C for tools' — one server, every host.",
            "**MCP vs plain tool use** (3.2): tool use is you wiring functions into *your* app; MCP packages tools behind a protocol so *any* host can discover and call them. When each is the right layer.",
            "**Build one**: a Python (FastMCP) server exposing 2–3 real tools — e.g. querying this course's own SQLite progress database — with typed parameters and docstrings-as-descriptions.",
            "**Transports**: stdio for local (how Claude Desktop launches servers) vs streamable HTTP for remote; where auth lives (OAuth for remote servers) and why local stdio sidesteps it.",
            "**Testing & debugging**: the MCP Inspector, logging, and the classic failure modes (schema mismatches, servers that block the event loop).",
            "**Design taste**: granularity of tools, safe defaults, read-only vs mutating tools, and descriptions written for the model — the same lessons as 3.2, applied at protocol level.",
          ],
        },
        {
          note: "Full lesson coming — this outline is the skeleton it will be built on.",
        },
      ],
      goDeeper: [
        { label: "Model Context Protocol docs", url: "https://modelcontextprotocol.io/" },
      ],
    },
  ],
};
