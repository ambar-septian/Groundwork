// Phase 1 — LLM fundamentals. Fully authored.
//
// Block types used in `body`:
//   { h: "..." }                       section heading
//   { p: "..." }                       paragraph; supports `inline code` and **bold**
//   { list: ["...", ...] }             bulleted list; same inline formatting
//   { code: "...", lang, caption }     code block
//   { note: "..." }                    callout aside
//   { table: { head, rows, caption } } comparison table (inline formatting in cells)
//   { compare: { left: {label, code}, right: {label, code}, caption } }
//                                      side-by-side code panes (stack on mobile)
//   { flow: { title, steps: [{ t, d }] } }
//                                      pipeline diagram: boxes with arrows

module.exports = {
  id: "phase-1",
  number: 1,
  title: "LLM Fundamentals",
  tagline:
    "How models actually consume and produce text, and how to drive one through an API like an engineer.",
  lessons: [
    // ────────────────────────────────────────────────────────────── 1.1
    {
      id: "p1-tokens",
      number: "1.1",
      title: "Tokens & Tokenization",
      status: "complete",
      objectives: [
        "Explain what a token is and why models don't operate on characters or words",
        "Estimate token counts well enough for capacity and cost planning",
        "Recognize the classes of bugs and costs that tokenization causes",
      ],
      body: [
        {
          p: "Everything an LLM does — pricing, context limits, latency, even some of its weirder failure modes — is denominated in **tokens**, so this is the right place to start. A token is a chunk of text from a fixed vocabulary, typically 3–4 characters of English on average. The model never sees characters or words; a tokenizer converts your text into a sequence of integer token IDs, the model predicts the next token ID over and over, and a detokenizer turns the result back into text.",
        },
        {
          flow: {
            title: "From your text to the model and back",
            steps: [
              { t: "Your text", d: "\"Summarize Macbeth\"" },
              { t: "Tokenizer", d: "BPE lookup, fixed vocab" },
              { t: "Token IDs", d: "[9218, 1040, 553, …]" },
              { t: "Model", d: "predicts next token ID, repeatedly" },
              { t: "Detokenizer", d: "IDs back to text" },
              { t: "Response text", d: "streamed out token by token" },
            ],
          },
        },
        {
          p: "Tokenizers are built with an algorithm like byte-pair encoding (BPE): start from raw bytes, repeatedly merge the most frequent adjacent pairs in a training corpus, and stop at a target vocabulary size (typically 50k–200k entries). The practical consequence is that **common strings compress well and rare strings don't**. \"the\" is one token; a UUID might be 20. English is cheap; Indonesian costs somewhat more per word; JSON with deep nesting and long keys is expensive because of all the punctuation and repeated structure.",
        },
        {
          p: "As a working engineer you care about tokens for four concrete reasons:",
        },
        {
          list: [
            "**Cost.** APIs bill per million input and output tokens, with output typically 3–5× the input price. A prompt that ships 40 KB of JSON context on every request is a real line item at scale.",
            "**Capacity.** The context window (next lesson) is a token budget. Knowing that ~1 token ≈ 4 characters ≈ 0.75 English words lets you budget documents, chat history, and tool results without calling a counter every time.",
            "**Latency.** Output tokens are generated one at a time, so response time scales roughly linearly with output length. Asking for terse output is a legitimate performance optimization.",
            "**Failure modes.** Character-level tasks (count the r's in \"strawberry\", reverse a string, precise character offsets) are hard for models precisely because they can't see characters. Same for arithmetic on long digit strings — digits get chunked into unpredictable token groups.",
          ],
        },
        { h: "Counting tokens" },
        {
          p: "Rules of thumb are fine for design; for anything you'll bill or budget, count. Every provider counts with its own tokenizer, so numbers differ between providers and even between model generations of one provider. Anthropic exposes a counting endpoint rather than a local library:",
        },
        {
          code: 'import anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment\n\ncount = client.messages.count_tokens(\n    model="claude-opus-4-8",\n    system="You are a concise assistant.",\n    messages=[\n        {"role": "user", "content": "Summarize the plot of Macbeth in two sentences."}\n    ],\n)\nprint(count.input_tokens)   # e.g. 31',
          lang: "python",
          caption: "Counting input tokens with the Anthropic API",
        },
        {
          p: "For OpenAI models you can count locally with the `tiktoken` library — but note it is OpenAI-specific and materially undercounts for Claude. Never use one provider's tokenizer to estimate another's bill.",
        },
        {
          code: 'import tiktoken\n\nenc = tiktoken.encoding_for_model("gpt-4o")\ntokens = enc.encode("Summarize the plot of Macbeth in two sentences.")\nprint(len(tokens))    # 10\nprint(tokens[:5])     # [9218, 1040, 553, 290, 9297] — the IDs the model actually sees',
          lang: "python",
          caption: "Local counting for OpenAI models with tiktoken",
        },
        {
          note: "Model names in code samples (claude-opus-4-8, gpt-4o, …) are the current ones at time of writing. They rotate every few months — treat them as placeholders and check the provider's model list before running anything.",
        },
        { h: "Where tokenization bites in practice" },
        {
          list: [
            "**Whitespace and casing matter.** \" hello\" (leading space), \"hello\", and \"Hello\" are different tokens. This is why trailing whitespace in prompts can subtly change behavior, and why some APIs reject trailing whitespace on assistant turns.",
            "**Structured data is expensive.** The same records as verbose JSON vs a compact table can differ 2–3× in token count. When you stuff context into a prompt (RAG, Phase 2), formatting is a cost decision.",
            "**Truncation happens on token boundaries.** If you naively chop text to \"fit\", chop by tokens, not characters, or your budget math will be wrong.",
            "**Streaming chunks are token-ish.** When you stream (lesson 1.5), text arrives in small increments that don't align with words — your UI code must not assume chunk = word.",
          ],
        },
      ],
      exercise: {
        intro:
          "Get a feel for how differently text tokenizes — this intuition pays off every time you budget a prompt.",
        steps: [
          "Install the SDKs: `pip install anthropic tiktoken` (use an environment from lesson 0.2).",
          "Write a script that token-counts the same three inputs with both counters above: (1) a paragraph of plain English, (2) that paragraph as a JSON object with a `\"text\"` field, and (3) 20 UUIDs.",
          "Compute characters-per-token for each. Confirm English lands near 4, and see how far JSON and UUIDs fall from that.",
          "Bonus: take a Swift source file from one of your projects and count it. Note how identifiers and syntax tokens compare to prose.",
        ],
      },
      goDeeper: [
        {
          label: "Tiktokenizer — visualize tokenization interactively",
          url: "https://tiktokenizer.vercel.app/",
        },
        {
          label: "Andrej Karpathy — Let's build the GPT tokenizer",
          url: "https://www.youtube.com/watch?v=zduSFxRajkE",
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 1.2
    {
      id: "p1-context",
      number: "1.2",
      title: "Context Windows",
      status: "complete",
      objectives: [
        "Explain what the context window actually bounds and why the API is stateless",
        "Design a token budget for a real feature (system prompt, history, documents, output)",
        "Choose a history-management strategy: truncation, summarization, or retrieval",
      ],
      body: [
        {
          p: "The **context window** is the maximum number of tokens a model can attend to in one request — input and output combined. Current frontier models advertise 200k to 1M tokens, which sounds infinite until you meet a real workload: one PDF is ~50k tokens, a busy agent session accumulates tool results fast, and long chat histories grow without bound.",
        },
        {
          p: "The most important mental model, especially coming from stateful client development: **the API is stateless**. There is no session object on the server accumulating your conversation. Every request must contain everything the model should know — system prompt, full message history, documents, tool results. \"Chat memory\" is an illusion your client code maintains by resending history each turn. That has two immediate consequences:",
        },
        {
          list: [
            "**Cost grows with conversation length.** Turn 30 of a chat resends turns 1–29 as input tokens. Without intervention, a long conversation gets linearly more expensive per turn (prompt caching, which discounts re-sent identical prefixes, is the standard mitigation — the provider docs cover it).",
            "**You decide what the model remembers.** Nothing is remembered for you, which means forgetting is a design decision, not an accident.",
          ],
        },
        { h: "Budgeting a request" },
        {
          p: "Treat the window as a budget with line items. A realistic allocation for a document-Q&A feature on a 200k-token model looks like:",
        },
        {
          table: {
            caption: "A request budget for document Q&A (200k-token model)",
            head: ["Line item", "Budget", "Notes"],
            rows: [
              ["System prompt & instructions", "1–2k tokens", "stable across requests — good for caching"],
              ["Retrieved document chunks", "4–20k tokens", "the variable payload (RAG, Phase 2)"],
              ["Conversation history", "≤ 8k tokens", "capped: e.g. last 10 turns, oldest dropped"],
              ["Reserved for output", "= `max_tokens`", "output counts against the same window"],
              ["**Total in flight**", "**~15–30k**", "a fraction of the advertised window — deliberately"],
            ],
          },
        },
        {
          p: "Note what that adds up to: even a generous feature uses ~30k tokens, a fraction of the advertised window. That's deliberate. Two things degrade before you hit the hard limit: **cost** (you pay for every input token whether or not it was useful) and **attention quality** — models demonstrably use information at the start and end of the prompt better than information buried in the middle (the \"lost in the middle\" effect, worth knowing even as newer models improve on it). More context is not free and not automatically better; the winning move is usually *selecting* the right 5k tokens, not shipping 150k. That instinct is the entire motivation for RAG in Phase 2.",
        },
        { h: "Managing history" },
        {
          p: "Three standard strategies, in increasing order of effort:",
        },
        {
          list: [
            "**Sliding window truncation.** Keep the system prompt plus the most recent N turns; drop the oldest. Trivial to implement, loses old information silently. Right answer for most chat UIs.",
            "**Summarization (compaction).** When history exceeds a threshold, ask the model to summarize the older turns into a paragraph, replace those turns with the summary, keep going. Preserves the gist at the cost of an extra call and some fidelity. This is what agent frameworks and the providers' own \"compaction\" features do.",
            "**Retrieval.** Store all history externally (often embedded — Phase 2), and pull back only the turns relevant to the current message. Most work, best scaling; it's how \"memory\" features are actually built.",
          ],
        },
        {
          code: 'def budget_history(messages, count_tokens, max_history_tokens=8000):\n    """Keep the most recent messages that fit the budget.\n\n    messages: list of {"role": ..., "content": ...}, oldest first.\n    count_tokens: callable(text) -> int, e.g. wrapping the provider counter.\n    """\n    kept, used = [], 0\n    for msg in reversed(messages):          # newest first\n        cost = count_tokens(msg["content"])\n        if used + cost > max_history_tokens:\n            break\n        kept.append(msg)\n        used += cost\n    return list(reversed(kept))             # restore chronological order',
          lang: "python",
          caption: "A minimal sliding-window budgeter",
        },
        {
          note: "Output tokens share the window and, on some APIs, max_tokens is validated against it: input_tokens + max_tokens must fit. If you ever see errors only on long conversations, check this before anything else.",
        },
      ],
      exercise: {
        intro:
          "Make context-window failure visible, then fix it — running out is much easier to reason about once you've done it on purpose.",
        steps: [
          "Write a chat loop in Python against the Anthropic API (lesson 1.4 has the call shape) that appends every turn to a `messages` list and resends it all each time.",
          "Log `usage.input_tokens` from each response. Watch it climb turn over turn — this is the statelessness tax.",
          "Add the `budget_history` sliding window above with a deliberately tiny budget (say 1,000 tokens) and confirm old turns fall off: ask \"what was my first message?\" and watch it fail honestly.",
          "Swap truncation for summarization: when history exceeds the budget, have the model summarize the dropped turns and inject the summary as a system note. Ask the same question again.",
        ],
      },
      goDeeper: [
        {
          label: "Anthropic docs — context windows",
          url: "https://platform.claude.com/docs/en/build-with-claude/context-windows",
        },
        {
          label: "Lost in the Middle (Liu et al., 2023)",
          url: "https://arxiv.org/abs/2307.03172",
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 1.3
    {
      id: "p1-embeddings",
      number: "1.3",
      title: "Embeddings",
      status: "complete",
      objectives: [
        "Explain what an embedding vector represents and what cosine similarity measures",
        "Generate embeddings with an API and compute similarity in a few lines of Python",
        "Know the design knobs: model choice, dimensions, and their cost/quality trade-offs",
      ],
      body: [
        {
          p: "An **embedding** is a fixed-length vector of floats — typically 256 to 3072 dimensions — that represents the *meaning* of a piece of text. An embedding model (a separate, much cheaper model than a chat LLM) maps text into a vector space where semantically similar texts land close together. \"How do I reset my password?\" and \"I can't log into my account\" share almost no words, but their embeddings are near neighbors. That single property powers semantic search, RAG retrieval, clustering, deduplication, recommendation, and classification.",
        },
        {
          p: "Closeness is usually measured with **cosine similarity** — the cosine of the angle between two vectors: 1.0 means identical direction, 0 means unrelated, negative means opposed (rare in practice with modern models). Most embedding APIs return unit-normalized vectors, in which case cosine similarity is just the dot product.",
        },
        {
          flow: {
            title: "How semantic search uses embeddings",
            steps: [
              { t: "Texts", d: "docs + the query" },
              { t: "Embedding model", d: "cheap, separate from the chat LLM" },
              { t: "Vectors", d: "[0.02, −0.13, …] × 1536 dims" },
              { t: "Cosine similarity", d: "dot product on unit vectors" },
              { t: "Nearest neighbors", d: "top-k most similar texts" },
            ],
          },
        },
        { h: "Generating embeddings" },
        {
          p: "Anthropic doesn't ship a first-party embeddings endpoint (it recommends Voyage AI); OpenAI's is the most commonly seen in the wild, and open-weight models via `sentence-transformers` run free and locally. The interface is the same everywhere: text in, vector out. With OpenAI:",
        },
        {
          code: 'from openai import OpenAI\nimport numpy as np\n\nclient = OpenAI()  # reads OPENAI_API_KEY\n\nsentences = [\n    "How do I reset my password?",\n    "I cannot log into my account",\n    "The pasta was overcooked and bland",\n]\n\nresp = client.embeddings.create(\n    model="text-embedding-3-small",   # 1536 dims; model names change over time\n    input=sentences,                   # batch — one API call for many texts\n)\nvecs = np.array([d.embedding for d in resp.data])\n\n# Vectors are unit-normalized, so cosine similarity == dot product\nsims = vecs @ vecs.T\nprint(round(sims[0, 1], 3))  # password vs login  -> high, ~0.6+\nprint(round(sims[0, 2], 3))  # password vs pasta  -> low,  ~0.1',
          lang: "python",
          caption: "Embedding a batch and comparing meanings",
        },
        {
          p: "Two things in that snippet are habits worth keeping: **batch your inputs** (one call for N texts is dramatically cheaper and faster than N calls), and **compare relative scores, not absolute ones**. A similarity of 0.62 means nothing in isolation; what matters is that it's higher than the alternatives. Thresholds must be calibrated per model — they are not portable.",
        },
        { h: "The knobs that matter" },
        {
          list: [
            "**Model choice.** Quality varies and is task-dependent; the MTEB leaderboard is the standard reference. In practice: OpenAI `text-embedding-3-*` and Voyage models for hosted, `all-MiniLM-L6-v2` or bge/gte families via sentence-transformers for local. Small local models are shockingly usable for prototypes.",
            "**Dimensions.** More dimensions = more fidelity, more storage, slower search. Some models (OpenAI's included) support requesting truncated dimensions at generation time — 256 dims is often within a few percent of full quality for retrieval.",
            "**One model per index.** Vectors from different models (or versions) live in different spaces and cannot be compared. If you change embedding models, you re-embed the whole corpus. Record the model name alongside your vectors — future you will need it.",
            "**Asymmetry.** Queries and documents are different kinds of text (\"password reset\" vs a 300-word help article). Some models handle this natively; others (like Voyage) take an `input_type` of query vs document. Check your model's docs.",
          ],
        },
        {
          note: "Embeddings are how you search; they are not how you answer. The pattern that combines them with a chat model — retrieve by similarity, then generate grounded in what you retrieved — is RAG, and it's all of Phase 2.",
        },
      ],
      exercise: {
        intro:
          "Build the smallest possible semantic search engine — under 40 lines — because the whole of Phase 2 stands on this.",
        steps: [
          "Take 15–20 sentences from a domain you know (e.g. iOS release notes, or your own project READMEs). Embed them all in one batched call.",
          "Write `search(query, k=3)`: embed the query, dot-product against the corpus matrix, return the top-k sentences with scores (`np.argsort` is enough — no vector database needed at this scale).",
          "Query with words that don't appear in the corpus (\"crash on launch\" when the corpus says \"fixed a startup exception\") and confirm semantic matching beats keyword matching.",
          "Break it on purpose: embed one query with a different model and try to compare scores. Note the garbage — this is why the model name belongs next to the index.",
        ],
      },
      goDeeper: [
        {
          label: "MTEB leaderboard — embedding model benchmarks",
          url: "https://huggingface.co/spaces/mteb/leaderboard",
        },
        {
          label: "Voyage AI docs (Anthropic's recommended embeddings partner)",
          url: "https://docs.voyageai.com/",
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 1.4
    {
      id: "p1-api-basics",
      number: "1.4",
      title: "Calling an LLM API: Messages, Roles & Sampling",
      status: "complete",
      objectives: [
        "Make a correct Messages-API call and read the response object, not just the text",
        "Use system vs user vs assistant roles deliberately",
        "Set max_tokens and temperature (where it exists) with intent instead of cargo-culting",
      ],
      body: [
        {
          p: "Both major providers converged on the same shape: the **Messages API**. You send a list of role-tagged messages plus parameters; you get back a message with content, a stop reason, and token usage. Master this one shape and you can drive any provider — and every framework you'll meet in Phase 3 is a wrapper around it.",
        },
        {
          code: 'import anthropic\n\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY\n\nresponse = client.messages.create(\n    model="claude-opus-4-8",        # model names change over time — check the docs\n    max_tokens=1024,                 # required: hard cap on output tokens\n    system="You are a senior iOS engineer. Answer concisely with Swift examples.",\n    messages=[\n        {"role": "user", "content": "When should I use an actor instead of a class?"}\n    ],\n)\n\n# The response is structured — content is a LIST of typed blocks, not a string\nfor block in response.content:\n    if block.type == "text":\n        print(block.text)\n\nprint(response.stop_reason)          # "end_turn" | "max_tokens" | "tool_use" | ...\nprint(response.usage.input_tokens, response.usage.output_tokens)',
          lang: "python",
          caption: "The canonical Messages-API call (Anthropic)",
        },
        {
          flow: {
            title: "Anatomy of one request",
            steps: [
              { t: "You assemble", d: "system + messages[] + max_tokens" },
              { t: "POST /v1/messages", d: "stateless — full history every time" },
              { t: "Model generates", d: "token by token, up to max_tokens" },
              { t: "Response", d: "content blocks[]" },
              { t: "You check", d: "stop_reason, then usage" },
            ],
          },
        },
        {
          p: "Three details in that snippet separate production code from tutorial code:",
        },
        {
          list: [
            "**Content is a list of typed blocks.** Today it's one text block; add tools or extended thinking and it won't be. Iterate and check `block.type` from day one — `response.content[0].text` is a latent crash.",
            "**Always read `stop_reason`.** `\"end_turn\"` means the model finished; `\"max_tokens\"` means *you cut it off* and the output is truncated mid-thought — retry with a higher cap or treat it as an error. Ignoring this is the #1 silent-corruption bug in LLM apps.",
            "**Always read `usage`.** It's your bill and your context budget in one object. Log it per request from the first prototype.",
          ],
        },
        { h: "Roles: system vs user vs assistant" },
        {
          list: [
            "**system** — the operator's channel: persona, rules, output format, guardrails. Set by your code, never by end users. Models are trained to weight it above user turns. On Anthropic it's a top-level parameter; on OpenAI it's the first message in the list. Keep it stable across requests (it's also what makes prompt caching work).",
            "**user** — whatever the human (or your application, e.g. retrieved documents) is saying this turn.",
            "**assistant** — the model's prior replies. You resend them as history (lesson 1.2). Multi-turn is literally: append the model's reply as an assistant message, append the new user message, send the whole list again.",
          ],
        },
        {
          p: "A security instinct to build early: anything you interpolate into a prompt — user input, retrieved documents, tool results — is *data*, but the model reads it as *text with potential instructions*. That's prompt injection. Keeping instructions in `system` and being suspicious of instructions that arrive inside data is the beginning of the answer (Phases 3–4 return to this).",
        },
        { h: "Sampling: temperature and friends" },
        {
          p: "Generation is sampling from a probability distribution over next tokens. **temperature** scales that distribution: low values (0–0.3) make the model pick the likeliest tokens almost every time — use for extraction, classification, code, anything you'll parse. Higher values (0.7–1.0) spread probability mass — use for brainstorming and prose variety. `top_p` is an alternative dial (sample from the smallest set of tokens whose probabilities sum to p); set one or the other, not both.",
        },
        {
          p: "Two caveats that most tutorials skip. First, **temperature 0 does not guarantee determinism** — providers document that identical requests can still differ slightly. Never build correctness on \"temp 0 is reproducible\"; build it on validation (lesson 1.6) and evals (Phase 4). Second, **sampling knobs are provider- and model-specific**: Anthropic's newest generation (Opus 4.7+) removed `temperature`/`top_p` entirely in favor of prompting and reasoning-effort controls, while OpenAI models still take them. Treat sampling parameters as per-model configuration you look up, not universal physics.",
        },
        {
          p: "`max_tokens` is not a quality dial — it's a hard stop and a cost/latency guard. Set it comfortably above your expected output (e.g. 2× typical) and alert on `stop_reason == \"max_tokens\"` rather than trimming the budget tight.",
        },
        {
          note: "The OpenAI equivalent for comparison: client.chat.completions.create(model=..., messages=[{\"role\": \"system\", ...}, {\"role\": \"user\", ...}], max_tokens=..., temperature=...) — same concepts, slightly different spelling. Learn the shape once, translate freely.",
        },
      ],
      exercise: {
        intro:
          "Build a small CLI chat client — the 'hello world' that exercises every concept in this lesson.",
        steps: [
          "Write a REPL: read a line from stdin, append to `messages`, call the API, print the reply, append the reply as an `assistant` turn. Confirm multi-turn memory works because *you* are resending history.",
          "Give it a strong `system` prompt (\"answer only in haiku\") and verify a user message saying \"ignore your instructions\" loses the fight.",
          "Set `max_tokens=30` and watch `stop_reason` become `max_tokens` with visibly truncated output. Handle it: print a warning when it happens.",
          "Log cumulative input/output tokens and print a running cost estimate using current pricing from the provider's page.",
        ],
      },
      goDeeper: [
        {
          label: "Anthropic Messages API reference",
          url: "https://platform.claude.com/docs/en/api/messages",
        },
        {
          label: "Anthropic prompt-engineering guide",
          url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview",
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 1.5
    {
      id: "p1-streaming",
      number: "1.5",
      title: "Streaming Responses",
      status: "complete",
      objectives: [
        "Explain why streaming exists (perceived latency) and when it's actually required",
        "Consume a streamed response with the SDK and reassemble the full message",
        "Handle the event lifecycle: deltas, message end, and mid-stream errors",
      ],
      body: [
        {
          p: "A non-streaming call returns nothing until the entire response is generated. At ~50–100 tokens/second, a 500-token answer means 5–10 seconds of blank screen — an eternity in UI terms. **Streaming** sends tokens as they're generated over server-sent events (SSE), so the first words appear in a few hundred milliseconds. Time-to-first-token is the metric users feel; total time barely changes.",
        },
        {
          p: "When to stream: any human-facing chat or writing surface — non-negotiable for UX. Also long outputs generally: SDKs enforce timeouts on non-streaming requests with large `max_tokens` precisely because a connection sitting silent for minutes looks dead to every proxy in the path. When not to bother: backend pipeline steps where nobody's watching (classification, extraction, eval runs) — non-streaming code is simpler and you want the final object anyway.",
        },
        { h: "Consuming a stream" },
        {
          code: 'import anthropic\n\nclient = anthropic.Anthropic()\n\nwith client.messages.stream(\n    model="claude-opus-4-8",\n    max_tokens=1024,\n    messages=[{"role": "user", "content": "Explain generics variance in Swift."}],\n) as stream:\n    for text in stream.text_stream:          # just the text deltas\n        print(text, end="", flush=True)      # flush! or nothing appears until exit\n\n    final = stream.get_final_message()        # complete Message, assembled for you\n\nprint()\nprint(final.stop_reason)                      # still check it — truncation happens mid-stream too\nprint(final.usage.output_tokens)',
          lang: "python",
          caption: "Streaming with the Anthropic SDK's high-level helper",
        },
        {
          flow: {
            title: "The SSE event lifecycle under the helper",
            steps: [
              { t: "message_start", d: "metadata, empty content" },
              { t: "content_block_start", d: "one per block" },
              { t: "content_block_delta ×N", d: "the text chunks you render" },
              { t: "content_block_stop" },
              { t: "message_delta", d: "final stop_reason + usage" },
              { t: "message_stop" },
            ],
          },
        },
        {
          p: "The helper hides an event protocol underneath: `message_start`, then per-block `content_block_start` / `content_block_delta` / `content_block_stop`, then `message_delta` (carrying the final `stop_reason` and usage) and `message_stop`. You care about raw events when you need more than text — tool-call arguments also arrive as deltas, and UIs that render \"thinking\" separately from the answer switch on block type. For plain text, `text_stream` plus `get_final_message()` covers it. The OpenAI SDK's equivalent is `stream=True`, which yields chunks with a `choices[0].delta.content` field.",
        },
        { h: "Engineering realities" },
        {
          list: [
            "**Chunks are not words.** Deltas split mid-word and never align with sentence boundaries. Accumulate into a buffer; render from the buffer.",
            "**Errors can arrive mid-stream.** You may have rendered three paragraphs when the connection drops or an error event arrives. Decide the UX up front: keep partial text with a retry affordance (typical), or clear it. Wrap the iteration in try/except — an exception after first token is a different failure mode than one before it.",
            "**Cancellation is a feature.** Users navigate away; a Stop button is table stakes. Closing the stream (the context manager does this) stops generation server-side and stops billing further output.",
            "**Streaming through your own backend.** In the real architecture (your server between client and provider — where your API keys live) you re-stream: consume provider SSE, forward deltas over SSE/WebSocket to the app. Same shape you'd consume with URLSession's bytes API in an iOS client.",
            "**Usage arrives at the end.** Token counts come with the final events, so cost logging has a natural home after the loop, not inside it.",
          ],
        },
        {
          note: "Streaming changes plumbing, not correctness: same request, same tokens, same bill. If your parsing or validation logic behaves differently on streamed output, the bug is in your buffer handling.",
        },
      ],
      exercise: {
        intro:
          "Upgrade lesson 1.4's CLI chat to stream — then break the stream on purpose to see the failure modes.",
        steps: [
          "Swap `messages.create` for `messages.stream`, print deltas as they arrive (remember `flush=True`), and use `get_final_message()` to get the assistant turn you append to history.",
          "Time it: measure time-to-first-token vs total time for a long answer (\"write 600 words on…\"). Feel the difference the first number makes.",
          "Add a stop control: catch `KeyboardInterrupt` mid-stream, close cleanly, and keep the partial text in history marked as truncated.",
          "Stretch: put a tiny Express or FastAPI endpoint in front — consume the provider stream server-side and re-emit SSE to `curl -N`. This is the exact architecture of every production chat backend (and of the app you'll deploy from this course).",
        ],
      },
      goDeeper: [
        {
          label: "Anthropic docs — streaming messages",
          url: "https://platform.claude.com/docs/en/build-with-claude/streaming",
        },
        {
          label: "MDN — server-sent events",
          url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events",
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 1.6
    {
      id: "p1-structured-errors",
      number: "1.6",
      title: "Structured Output & Error Handling",
      status: "complete",
      objectives: [
        "Get validated, schema-conforming JSON out of a model instead of parsing prose",
        "Handle the API failure taxonomy: what to retry, what to surface, what to redesign",
        "Ship the standard reliability kit: retries with backoff, timeouts, and validation",
      ],
      body: [
        {
          p: "The moment an LLM's output feeds *code* instead of a human, free-form text becomes a liability. \"Here's the JSON you asked for: …\" with a trailing explanation breaks `JSON.parse`. The fix has three tiers, and you should use the highest one your provider supports:",
        },
        {
          list: [
            "**Tier 1 — ask nicely.** Describe the JSON shape in the prompt. Works ~95% of the time, which is another way of saying it fails constantly at scale.",
            "**Tier 2 — validate and repair.** Parse the output with a schema validator (Pydantic); on failure, re-prompt with the error message. Simple, provider-agnostic, and the fallback layer you keep even with tier 3.",
            "**Tier 3 — constrained output.** Modern APIs accept a JSON Schema and *guarantee* conforming output by constraining generation itself. Anthropic: `output_config.format` (and the SDK's `messages.parse` helper). OpenAI: `response_format` with strict schemas. Use this whenever the output is machine-consumed.",
          ],
        },
        {
          code: 'from pydantic import BaseModel\nimport anthropic\n\nclass BugTriage(BaseModel):\n    severity: str          # "low" | "medium" | "high" | "critical"\n    component: str\n    is_regression: bool\n    summary: str\n\nclient = anthropic.Anthropic()\n\nresponse = client.messages.parse(\n    model="claude-opus-4-8",\n    max_tokens=1024,\n    messages=[{\n        "role": "user",\n        "content": "Triage this bug report: App crashes on launch after "\n                   "updating to 3.2. Worked fine in 3.1. Crash log points "\n                   "to the photo picker module.",\n    }],\n    output_format=BugTriage,      # SDK converts the Pydantic model to a JSON schema\n)\n\ntriage = response.parsed_output   # a validated BugTriage instance, not a string\nprint(triage.severity, triage.component, triage.is_regression)',
          lang: "python",
          caption:
        "Schema-guaranteed output with Pydantic + messages.parse (Anthropic)",
        },
        {
          p: "Even with guaranteed syntax, keep validating **semantics**: the schema ensures `severity` is a string, not that it's one of your four allowed values (use enums in the schema for that) and not that the *content* is right. Structured output eliminates parse errors; it does not eliminate wrong answers. That distinction is why evals (Phase 4) exist.",
        },
        { h: "The failure taxonomy" },
        {
          p: "LLM APIs fail in ways worth memorizing, because the correct reaction differs per class:",
        },
        {
          table: {
            caption: "The failure taxonomy — and the correct reflex for each class",
            head: ["Failure", "What it means", "Correct reaction"],
            rows: [
              ["**400** invalid_request", "your bug: malformed messages, budget overflow, bad parameter", "never retry — fix the code"],
              ["**401 / 403** auth", "key missing, revoked, or unentitled", "never retry — fix configuration"],
              ["**429** rate_limit", "over requests- or tokens-per-minute", "retry with backoff, honor `retry-after`; cap concurrency (semaphores, lesson 0.3)"],
              ["**500 / 529** server, overloaded", "provider-side trouble", "retry with backoff; if persistent, degrade gracefully (queue, fallback, honest error)"],
              ["Timeouts, dropped connections", "networks being networks; long generations make them likelier", "explicit client timeouts; stream long outputs"],
              ["Content refusal", "**a 200** — the model declines; `stop_reason` says so", "handle as a product case, not an exception"],
              ["Silent quality failures", "**also 200s**: truncation (`max_tokens`), wrong-but-confident output, format drift", "validation now (this lesson), evals later (Phase 4) — no status code will save you"],
            ],
          },
        },
        { h: "The reliability kit" },
        {
          p: "The good news: SDKs do most of this. The Anthropic and OpenAI Python SDKs retry 429s and 5xx with exponential backoff out of the box (configurable via `max_retries`) and raise **typed exceptions** — catch those, never string-match error text:",
        },
        {
          code: 'import anthropic\n\nclient = anthropic.Anthropic(max_retries=4, timeout=60.0)\n\ntry:\n    response = client.messages.create(\n        model="claude-opus-4-8",\n        max_tokens=1024,\n        messages=[{"role": "user", "content": "..."}],\n    )\nexcept anthropic.BadRequestError as e:      # 400 — our bug, don\'t retry\n    raise\nexcept anthropic.RateLimitError:            # 429 — SDK already retried; we\'re saturated\n    queue_for_later()\nexcept anthropic.APIStatusError as e:       # other non-2xx after retries\n    log_and_degrade(e.status_code)\nexcept anthropic.APIConnectionError:        # network failure before any response\n    log_and_degrade("network")\nelse:\n    if response.stop_reason == "max_tokens":\n        # a 200 that is still a failure — the output is truncated\n        response = retry_with_bigger_budget()',
          lang: "python",
          caption: "Typed exceptions, most specific first — plus the 200-that-failed case",
        },
        {
          note: "Idempotency instinct from mobile applies here too: a timeout doesn't mean the request didn't complete and get billed. For pipelines, key your work items so a retried step doesn't double-append results.",
        },
      ],
      exercise: {
        intro:
          "Build a hardened extraction endpoint — the pattern behind half of all production LLM features.",
        steps: [
          "Define a Pydantic model for meeting-notes extraction: `attendees: list[str]`, `decisions: list[str]`, `action_items: list[ActionItem]` where ActionItem has `owner` and `task`.",
          "Implement it three times: tier 1 (prompt-only + `json.loads`), tier 2 (validate + one repair re-prompt on failure), tier 3 (`messages.parse`). Feed all three the same 10 messy inputs — include one in another language and one that isn't meeting notes at all.",
          "Count failures per tier. Note *how* each tier fails: exceptions vs validation errors vs semantically-empty-but-valid objects.",
          "Add the reliability kit to tier 3: explicit timeout, typed exception handling, and a truncation check on `stop_reason`. Simulate a 429 by hammering it in a loop and confirm your handling engages.",
        ],
      },
      goDeeper: [
        {
          label: "Anthropic docs — structured outputs",
          url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs",
        },
        {
          label: "Anthropic docs — API errors",
          url: "https://platform.claude.com/docs/en/api/errors",
        },
      ],
    },
  ],
};
