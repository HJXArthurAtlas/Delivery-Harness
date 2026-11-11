# ref.md
# compound — Conceptual Reference

Everything discussed, reasoned through, and decided in the original design session.
Use this to understand *why* the workflow is designed the way it is.

---

## The three concepts and their roles

Three separate paradigms brought together. They are compatible but not the same thing.

### 1. The SDD toolkit — Execution mechanism

**What it actually is:**
- A `specify` CLI that installs prompt template files into your project
- Slash commands: `/che-constitution` → `/che-intend` → `/che-clarify` → `/che-plan` (plan + task breakdown in one command) → `/che-implement`
- These are markdown prompt files the agent reads and executes — no API surface, no library

**What it does well:**
- Generates specs, plans, and task breakdowns from a feature description
- Drives the agentic implementation loop
- Works with 30+ AI coding agents (Claude Code, Copilot, Cursor, Gemini CLI, etc.)

**What it does not do:**
- Capture *why* something is being built or what its boundaries are
- Generate constraint-derived or negative test cases reliably
- Validate that implementation stayed within declared scope
- Persist memory across sessions (local memory files die between sessions)

**Known limitations in the toolkit's own templates:**

**P1. The auto-fill trap.** The `/che-intend` template instructs the agent to *"make informed guesses,"* use *"common patterns"* to *"fill gaps,"* and caps it at *"Maximum 3 [NEEDS CLARIFICATION] markers."* Where the description goes silent, the agent invents the goal — and the tool limits how often it has to admit it is guessing. This converts spec ambiguity directly into unsupervised model choices.

**P2. Internal contradictions across templates.** The toolkit's manifesto declares test-first development *"NON-NEGOTIABLE."* Its task template, shipped in the same repo in the same week, says *"Tests are OPTIONAL, only include them if explicitly requested."* Its implement template says *"Follow the TDD approach."* A goal-seeking model handed three contradictory rules picks one and improvises — the exact behavior the rigid method was supposed to prevent.

These are not bugs in our extension scope, but they explain why the unified spec's intent block + in-spec scenarios + gapfill are needed: they are the structural defense against templates that silently hedge.

**The key insight:**
The `/che-plan` task-generation output IS the "expectations" node in the Activated Thinker agentic loop model. The toolkit is what generates the right side of the intent/expectations diagram.

---

### 2. Intent + Expectations — Input quality layer

From the Activated Thinker framework (the agentic loop model):

```
YOU PROVIDE                 HARNESS RUNS THE LOOP
────────────                ──────────────────────────────
INTENT       ─────────────→ run work
(what the                        ↓
user wants)                 pull context
                                 ↓
EXPECTATIONS ─────────────→ validate → met? → merge
(what counts                     ↑ no ──────┘
as done)
```

**Intent** = the left side of the diagram. What you provide.
**Scenarios** = also what you provide. The toolkit generates *task-level* expectations from your intent, but `/che-intend` captures the user-level "done" boundary — Acceptance Scenarios and Edge Cases with stable `E#` IDs — inside the same `intent.md` that carries the intent. The validator consumes them from there.
**The harness** = runs the loop. Could be Claude Code, Copilot Workspace, Cursor, etc.

**Alternative framing: ICE in IDSD.** Kapil Viren Ahuja's "Intent-Driven Software Development" (IDSD) frames this layer as **ICE — Intent, Context, Expectations**:

| ICE leg | What it is | Who owns it |
|---|---|---|
| **Intent** | Goal + constraints + failure conditions | Human |
| **Context** | The surround (stack, codebase, prior decisions), fed progressively | Harness |
| **Expectations** | Success scenarios + boundary of done | Human |

The IDSD compartmentation rule originally put success scenarios in a separate file so the builder could not read the validator's checks. **This pack no longer does that.** Scenarios live in `intent.md` next to the intent; the accepted tradeoff is that the validation criteria are not secret from the builder. What is preserved is *independent judgment*: the validator (`/che-intentverify`) still judges through a sealed briefing and an independent checker (fresh context, ideally a different model) that never saw the builder's reasoning — the firewall moved from the file system to the dispatch boundary.

**The gap the base workflow leaves:**
The base workflow asks "what do you want to build?" but doesn't structure:
- Scope boundaries (what should NOT be touched)
- Constraints (technical, UX, performance limits) — directional, unconditional, in business language
- Failure conditions (binary, post-output, observable)
- User-observable acceptance and edge scenarios with stable IDs

These are the things that prevent AI overreach and define what "done" really means.

**Our single committed requirement artifact** fills this gap:
- `{task_dir}/intent.md` — goal, why now, in/out scope, constraints, failure conditions (the intent block) PLUS User Stories with prioritized Acceptance Scenarios, Edge Cases, Functional Requirements, Success Criteria — one requirement source of truth with a stable global `E#` ID sequence

(It lives in the task directory — the `specs/NNN-{slug}/` directory that `che paths` reports as `FEATURE_DIR`.) The builder reads `intent.md`; the validator reads the same file through a sealed briefing.

---

### 3. Compound Engineering — Memory layer

From a discussion in the #gen-ai-wtf Slack channel about "compound engineering" (kenkyee, Ricardo Costeira), aligned with Every's `/ce-compound` plugin pattern (Kevin Rose, Dan Shipper).

**Core concept:**
Self-documenting code + AI planning notes + user correction notes all committed to the repo as durable context. Similar to Architecture Decision Records (ADRs) but extended to include AI-specific learnings.

**The problem it solves:**
Claude Code's memory files are stored locally, not permanently in the project's `.claude` folder. This means:
- Memory is lost when you switch machines
- Teammates don't benefit from corrections you made
- A new AI session starts with zero context about past mistakes
- Settled architectural decisions get re-debated on every session

**The compound store (committed, version-controlled):**
```
docs/
├── adr/              ← settled architecture decisions (shared adrkit corpus)
├── corrections/      ← what AI did wrong + derived rule to avoid repeat
└── patterns/         ← reusable implementation patterns for this codebase
specs/<task-dir>/
└── compound.md       ← per-feature record of this feature's store contributions
```
(Settled ADRs live in the shared adrkit corpus at `docs/adr/` —
same schema as `/che-adr-draft`, validated by `.agents/skills/che-adr-draft/scripts/adr.sh lint`.)

**The compounding effect:**
Each feature run writes back learnings — corrections and patterns to `docs/corrections/` and `docs/patterns/`, ADRs to the shared adrkit corpus (`docs/adr/`).
The next feature loads these artifacts before starting.
Over time: fewer loop iterations, fewer corrections, faster merge.

In v0.2 we expose this as two separate commands (the extension system does not support subactions):
- `/che-load` — pull store into agent context at the start of a feature
- `/che-retro` — persist learnings after intentverify passes

---

## How the three concepts connect

They map onto specific parts of the Activated Thinker / ICE diagram:

| Concept | Role in the loop |
|---|---|
| Compound store | `pull context` step — loaded before every loop iteration via `/che-load` |
| Intent block (in unified intent.md) | `INTENT` node — what you provide on the left (goal + constraints + failure conditions) |
| Spec scenarios (Acceptance + Edge, `E#` IDs, same intent.md) | `EXPECTATIONS` node — what you provide on the right |
| Generated tasks | Task-level expectations the harness loops against |
| `/che-implement` | The harness — runs work → validate → loop |
| Intentverify | Validates the `met?` decision beyond just tests (L3) |
| Compound retro | Updates compound store after loop exits, via `/che-retro` |

**The summary in one sentence:**
We are automating the SDD workflow with a smarter single input (intent + scenarios in one spec), making its outputs more complete (gapfill), and making the whole system compound over time (compound engineering store).

---

## Key design decisions made in the session

### The toolkit is not a programmatic dependency
The toolkit exposes no API or library. Its integration surface is slash command prompt templates installed into the project via the `specify` CLI.

This means the extension is not code that calls the toolkit — it is additional prompt templates that sit alongside the toolkit's own templates and extend the workflow before and after the toolkit's steps.

### Compound store must be committed, not local
The most critical architectural decision.

The toolkit and its harnesses store agent memory locally. This breaks across sessions, machines, and team members.

The compound store is version-controlled and committed: artifacts live in `docs/adr/`, `docs/corrections/`, and `docs/patterns/`, while each feature's contribution record lives beside its spec at `specs/<task-dir>/compound.md`. It is treated as a first-class repo artifact — because that is exactly what it is.

### One requirement artifact; independence at the dispatch boundary (supersedes the v0.2 file split)
IDSD's original compartmentation principle kept success scenarios out of the artifact the builder reads, because LLMs reward-hack — the builder will optimize for the scenarios the validator checks. v0.2 shipped that as two files: `/che-intend` wrote `intent.md` (intent + generated specification) and a separate `/che-expectations` wrote the validator-only `expectations.md`.

**Current design (single-artifact model):** the expectations phase is retired. `/che-intend` drafts the Acceptance Scenarios and Edge Cases in the same interview and writes them into `intent.md` with a global stable `E#` ID sequence (never renumbered, never reused). There is one requirement source of truth, one forward stage chain, and no second spec writer — `/che-clarify` is the only later writer, and it integrates answers directly into the spec sections.

What the merge gives up — the validation criteria are no longer hidden from the builder — was an accepted tradeoff. What it keeps is **independent judgment**: `/che-intentverify` and `/che-planverify` still extract the locked intent, the scenarios, and the diff (or plan) into a sealed briefing and hand it to an independent checker (fresh context at minimum, a different model when available) that never saw the builder's or planner's reasoning. The compartmentation that remains real is the briefing firewall, not file visibility. Hard compartmentation (separate agents, encrypted evals) remains deferred until there is evidence the briefing firewall is being gamed.

### Plan and tasks are one command (artifacts stay separate)
v0.2 shipped plan→tasks as two commands with the adr-check gate between them. The gate was never a compartmentation requirement — plan and tasks are both dev-side outputs and no firewall exists between them — so the split only bought a resumable checkpoint at the cost of an extra command trigger and a full context reload. The merged `/che-plan` generates `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, **and** `tasks.md` in one run (Phase 0 research → Phase 1 design → Phase 2 task generation); the artifacts remain separate files with unchanged templates and state stages. The ADR gate moved into `/che-planverify`: its deterministic mechanical layer runs the shared `che-adr-check/scripts/check.sh` against the gapfilled plan/tasks surface and seals the governing ADRs into the briefing as facts for the checker's P3e judgment. `/che-adr-check` remains as an on-demand read-only diagnostic with no gate effect; the machine-enforced `adr_gate` (default block) consumes the planverify report (`adr_status` + spec/plan/tasks SHA-256). Independent judgment is unaffected: it lives in planverify (semantic + P3e) and intentverify, not in the plan→tasks boundary.

### Compound load and retro are two separate commands (extension-system convention)
v0.1 drafts considered a single `compound` command with `load` and `retro` subactions, matching Every's `/ce-compound` shape. When we ran the first live install test in v0.2, we discovered the extension system does not support subactions — each slash command must be its own file (the bundled git extension exposes its `commit`, `feature`, `initialize`, `remote`, and `validate` commands as five separate files, not one with subactions). We split accordingly: `/che-load` and `/che-retro` are two halves of one mechanism, registered separately. The compartmentation and semantics are unchanged; only the surface shape differs.

### The unified spec (intent sections + scenarios) is the gapfill input
The toolkit generates tasks (task-level expectations) from a feature description. But it generates primarily happy-path tasks.

The unified spec's **out-of-scope** and **constraints** sections, plus the **Edge Cases** (and the Acceptance Scenarios the tasks must demonstrate), are the inputs that `/che-gapfill` uses to generate the missing tests — constraint violation checks, scope regression checks, negative paths.

Without these sections, gapfill has no reference to know what constraints exist, what's out of scope, or which `E#` scenarios still lack a task.

### Validation Level 3 (Intent Verify)
Most harnesses validate at:
- L1: Tests pass, build is clean
- L2: Output matches the spec

L3 is new: did the implementation **stay within the unified spec's declared scope and constraints, and satisfy the spec's Acceptance Scenarios and Edge Cases**?

This requires comparing the git diff against the spec's out-of-scope and constraints sections, and against the spec's `E#` scenarios — something that requires a separate LLM call, not just test execution.

The intentverify prompt specifically checks:
1. Were any out-of-scope items touched? (BLOCKED if yes)
2. Were any constraints violated? (BLOCKED if yes)
3. Were any failure conditions tripped? (BLOCKED if yes)
4. Do the scenarios pass? (REVIEW if uncertain)

### Extension, not fork; extension, not harness
Built as a community extension using the official extension mechanism (`extension.yml` + command templates + `specify extension add`).

This means:
- Zero dependency on the toolkit's internals — extension templates are standalone markdown files
- Publishable to the community catalog
- Installable with one command
- Works with any harness the toolkit supports (not just Claude Code)

We are an **extension**, not a harness. Kapil's Garura is a harness — it owns context assembly, eval compartmentation, and checkpointing end to end. We sit on top of an existing harness (whichever the user drives) and inject the missing intent/expectations/compound discipline. The README will state this positioning in one line.

---

## The Friends listing approach

The community site has four contribution types:
- Extensions — commands, hooks, capabilities (requires full extension.yml + catalog PR)
- Presets — template and terminology overrides
- Walkthroughs — end-to-end SDD scenarios
- **Friends** — projects that extend or build on the base toolkit (just a README entry + link)

**Strategy:** Submit to Friends first (lower friction, immediate visibility), then upgrade to verified extension after battle-testing on 2-3 real features.

Existing Friends entries for reference format:
- cc-spex: Claude Code plugin with composable traits on top of the toolkit
- VS Code extension with visual orchestrator
- VS Code extension with GUI
- Community-maintained Claude Code / Copilot CLI plugin

---

## Positioning and content angle

**One-line description:**
"A compound-engineering extension that adds intent-driven scoping (ICE), compound engineering memory, and intent verify validation to the SDD workflow."

**The story for GDE content:**
- The base workflow generates task-level expectations but misses intent (scope, constraints, non-goals) and user-level scenarios
- The Activated Thinker / IDSD model shows why: intent and expectations are separate inputs the human must provide; this pack captures both in one interview
- Compound engineering solves the memory problem that the toolkit and harnesses leave unsolved
- This extension wires all three together as a publishable extension

**What makes it novel:**
- Intent Verify (L3 validation) — not done by any existing extension
- Compound store as committed repo artifacts — solves the local-memory limitation
- One requirement artifact (intent + scenarios with stable `E#` IDs in `intent.md`), with validator independence preserved by the sealed-briefing firewall — not file hiding
- Gapfill driven by the spec's intent sections + scenarios — not generic, purpose-built

---

## Slash commands reference

| Command | Phase | What it does |
|---|---|---|
| `/che-constitution` | Init | Create project governing principles |
| `/che-intend` | Spec | Capture intent (goal, constraints, failure conditions) + draft acceptance/edge scenarios (`E#` IDs) into one unified spec |
| `/che-clarify` | Spec | Clarify underspecified areas |
| `/che-plan` | Plan | Generate implementation plan + task breakdown in one command (= task-level expectations) |
| `/che-implement` | Implement | Execute tasks via agentic loop |
| `/che-analyze` | Optional | Cross-artifact consistency check |
| quality-checklist generation | Optional | Generate quality checklists (not shipped in this pack) |
| tasks-to-issues conversion | Optional | Convert tasks to GitHub issues (not shipped in this pack) |
| `/che-load` | **Extension** | Load ADRs, corrections, patterns into context (this extension) |
| `/che-retro` | **Extension** | Persist learnings back to compound store (this extension) |
| `/che-gapfill` | **Extension** | Fill generated-task gaps with constraint/negative tests (this extension) |
| `/che-intentverify` | **Extension** | L3 scope and constraint validation (this extension) |

---

## Sources and references

- Activated Thinker framework: Kapil Viren Ahuja's IDSD / ICE pieces on Activated Thinker (Medium)
- Compound engineering concept: #gen-ai-wtf Slack thread — @kenkyee and @Ricardo Costeira discussion on self-documenting code + ADRs + AI correction notes
- Every's compound engineering plugin: https://every.to/guides/compound-engineering
