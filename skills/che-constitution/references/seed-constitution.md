# [PROJECT_NAME] Constitution

> 基础宪法（团队通用底版）。`[PROJECT_NAME]` 在项目实例化时替换；项目专属不变量追加到 Cross-Domain Invariants，不得削弱基础条款。

## Core Principles

### I. Subproject Scope Discipline

The repository is a monorepo with no root-level build system; each subproject under the approved layout (e.g. `services/backend`, `apps/web`) builds independently with its own toolchain. Commands, scripts, and dependency changes MUST run within the owning subproject directory. Root-level build configuration, cross-subproject imports, and shared artifacts outside the approved layout are PROHIBITED.

Rationale: independent build lifecycles keep blast radius small and let each subproject evolve tooling without breaking the others.

### II. Convention Reuse (NON-NEGOTIABLE)

Reuse existing patterns and conventions before introducing new ones; a second convention beside an existing one is PROHIBITED. Where an existing convention or governance artifact already answers the question, its answer binds and no local variant may be introduced.

Rationale: multiple frontend and backend subprojects share maintenance; divergent conventions multiply review and migration cost.

### III. Test-Verified Quality Gates

Verification by automated tests is REQUIRED; authoring order (TDD or not) is a technique detail, not a governance mandate.

- Production code changes MUST ship with tests covering the new or altered behavior; the criterion is coverage of the changed behavior by an executable test, not a coverage percentage.
- Refactors MUST be pinned by tests: restructuring that claims to preserve behavior REQUIRES tests pinning it. Changing what existing tests verify (assertions, fixtures, verification criteria) REQUIRES explicit user approval first; rewriting tests so a refactor passes is PROHIBITED.
- Bug fixes MUST begin from an automated test that fails against the defective code and MUST retain it as the regression guard. When the defect is not reachable from the test tiers, the exact reproduction attempted — or why it could not run — MUST be recorded instead of claimed.
- Every code change MUST be followed by re-running the automated tests covering the layers it can affect — the changed layer plus the downstream layers that consume it.
- Non-trivial behavioral changes MUST NOT be delivered without exercised proof (reproduction, smoke run, or targeted test). Deliveries MUST be complete end-to-end: no stubs, placeholders, narrowed tests, or silently reduced scope; blocked items state exactly what is missing and what was tried.

Rationale: gates exist to catch regressions before review, not to satisfy coverage metrics or to mandate one way of writing tests.

### IV. Governance Artifact Independence

Each governance artifact — this constitution, the records in `docs/adr/`, the workflow skills, the repository guides, the glossary — defines its own rules within its own scope and constrains the Agent directly and independently.

- No artifact derives binding force from another: normative designation, "strong reference" status, and delegated rule bodies between artifacts are PROHIBITED.
- Each artifact is self-sufficient: it answers the questions in its scope in full, or stays silent. An artifact MUST NOT restate another artifact's rules — duplication is what makes governance drift.
- Mentions of other artifacts are informational discovery aids only and carry no binding force. Discovery before technical work: the topic index in the root `AGENTS.md`; ADR loading via the project's designated ADR-loading skill.
- Artifacts SHOULD keep their scopes disjoint. On genuine conflict between artifacts, work MUST pause for user adjudication rather than silently preferring one.

Rationale: cross-referenced governance creates load-order coupling — an agent cannot know what binds without chasing a designation chain, and an edit in one artifact silently invalidates another. Self-sufficient artifacts are each independently complete, auditable, and amendable.

### V. Simplicity & Boring Technology

Correctness first, then maintainability six months out. Prefer boring, established solutions; refuse needless abstraction; delete dead weight. New dependencies, frameworks, or architectural patterns REQUIRE explicit justification against existing tooling. YAGNI applies: do not build for speculative future requirements.

Rationale: a shared monorepo is load-bearing; operational simplicity and predictable upgrades outrank novelty.

### VI. Project Boundary & External API Contract

A requirement's design and implementation scope is bounded by the current project — the code,
deployables, and data this project owns. Any system outside that boundary (another end, another
service, another team's system) is an external system by definition, even when one requirement
touches both sides. Cross-boundary interaction goes ONLY through explicitly exposed external
APIs, in both directions: when this project serves the outside, it exposes its own public API
for external callers; when this project depends on an external system, the default and
preferred channel is that system's public API. Implementing another system's behavior inside
this project, and reaching through an external system's internals (its database, internal
endpoints, private contracts) instead of its API, are PROHIBITED.

The boundary MUST be drawn at design time, when the requirement is discussed: the design/plan
MUST state what lies inside this project, which parts are external systems, and which exposed
API carries each cross-boundary interaction. The factual inventory of what lies inside is the
project's architecture profile (`docs/architecture.md`): components it lists are inside,
systems it does not list are external; until a profile exists, the repository layout itself is
the inventory, and producing the profile is part of boundary-drawing. A boundary decision that
adds, removes, or repurposes a component MUST reconcile the profile in the same change, via the
project's designated architecture-profile skill. Deferring the boundary decision until an
unknown boundary surfaces during implementation is PROHIBITED.

Example: a requirement affects both the member-operations console and the driver app. For the
loyalty project — which owns only the member-operations console — the driver app is an external
system; the loyalty backend MUST expose an API for the driver-side system to consume, and MUST
NOT implement driver-app behavior inside loyalty.

Rationale: a requirement is an end-to-end flow that may span several projects and systems, but
requirement and design discussions always take place inside one specific project — the project
boundary is inherent to the workflow, so the design makes the flow's cross-project seams
explicit instead of assuming the whole flow fits one project. Respecting the system boundary
also keeps ownership, deployment, and release lifecycles decoupled. Cross-boundary work left
implicit is discovered late, when it is most expensive to undo; and without this standing
context, design discussions — notably those with an agent — drift into misunderstandings and
unnecessary questions, re-deriving what is in scope on every turn instead of treating the
boundary as a given. Anchoring on a maintained architecture profile makes the boundary
checkable: "what is inside" becomes a lookup against an inventory that loads with every
session, not a judgment re-made in each discussion.

## Cross-Domain Invariants

These invariants bind directly. No dedicated governance artifact carries them yet; each MAY migrate to a dedicated artifact once one exists, as a pure relocation that MUST NOT change meaning (see Governance). Projects extend this section with their own invariants; base invariants MUST NOT be weakened by project additions.

### Security
- Authorization decisions live ONLY in the backend; frontend hiding of buttons or menu items is UX, never a security boundary.
- Sensitive fields (phone, ID number, bank card, credentials) MUST NOT be written to logs or returned to ends that do not need them; masking follows the existing end conventions.
- SQL MUST be composed with bound parameters; string-concatenated values into SQL are PROHIBITED.
- Secrets MUST NOT appear in source, tests, docs, comments, commit messages, or log output; anything shipped to the browser is public, so a secret value in frontend env files is PROHIBITED.

### Performance & Integration
- Remote clients MUST declare explicit timeouts and bounded retries; unbounded waits and unbounded retry loops are PROHIBITED.
- Independent external calls within one request SHOULD run concurrently or be consolidated; a sequential chain of independent remote calls REQUIRES justification in the change description.
- Frontend large lists MUST use pagination or virtualization; rendering unbounded datasets into the DOM is PROHIBITED. Imports at function granularity where the library supports it; pulling a whole library for a single helper is PROHIBITED.

### Toolchain
- Toolchain versions are pinned by lock files and those pins are authoritative: builds MUST NOT drift from the locked toolchain.

### Language
All output — conversation and artifacts alike — is written in Simplified Chinese, except established technical terms kept in English (API, REST, GraphQL, etc.).

## Governance

This constitution supersedes conflicting ad-hoc practices within its own scope. Amendments follow this procedure:

1. Draft the amendment with a Sync Impact Report (version change, modified / added / removed sections, deferred items).
2. Version MUST increment per semantic versioning: MAJOR for backward-incompatible governance or principle removals/redefinitions, MINOR for new principles or materially expanded guidance, PATCH for clarifications and non-semantic refinements. Relocating an invariant between this constitution and another governance artifact is MAJOR only when the invariant set changes; a pure relocation that preserves every invariant is not.
3. Ratification and amendment dates MUST be ISO format (YYYY-MM-DD).
4. `LAST_AMENDED_DATE` updates on every accepted amendment; unresolved placeholders MUST be marked `TODO(<FIELD>): explanation` and listed in the Sync Impact Report.
5. The Sync Impact Report is scratch material for human review and MUST NOT be committed inside this file.

Compliance review: every change touching areas this constitution governs (subproject layout, conventions, testing gates, toolchain pins, the cross-domain invariants) MUST verify compliance with it; other governance artifacts carry their own compliance expectations in their own text. Complexity deviating from Principle V MUST be justified in the change description.

### Amendment Log

| Version | Date | Summary |
| --- | --- | --- |
| 1.0.0 | TODO(RATIFIED_DATE) | Base constitution extracted from the team's shared lineage (freight-mono v2.0.1 principles, de-projectized; generic invariants promoted). Project-specific invariants extend this file; `[PROJECT_NAME]` replaced on instantiation. |
| 1.1.0 | 2026-10-28 | Added Principle VI (Project Boundary & External API Contract): design/implementation scope bounded by the current project; cross-boundary interaction only via exposed external APIs in both directions; boundary drawn at design time, anchored on the architecture profile (`docs/architecture.md`) and reconciled on boundary changes. |

**Version**: 1.1.0 | **Ratified**: TODO(RATIFIED_DATE) | **Last Amended**: 2026-10-28
