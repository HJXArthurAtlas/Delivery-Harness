# Script Language Analysis

Date: 2026-10-21

## Summary

Shell and Python form the standalone scripting core. The adrkit JavaScript bundle has been removed in favor of external `@adrkit/cli`.

| Language | Files | Physical lines | Primary role |
|---|---:|---:|---|
| Python 3 | 14 | 3,201 | Spec-kit prerequisite checks, feature-path resolution, template setup |
| POSIX `sh` | 8 | 360 | adrkit command wrappers and shared CLI/feature resolvers |
| Bash | 7 | 650 | Compound gates, test runners, Git commit hook |
| **Total** | **29** | **4,211** | |

Scope: standalone runtime scripts, tests, and the Git hook. Markdown examples, JSON configuration, and external packages under `node_modules` are excluded. Physical lines include code, comments, and blank lines.

## Key observations

- **Python accounts for 76.0%** of standalone script lines; POSIX `sh` accounts for 8.5%, and Bash for 15.4%.
- **No standalone JavaScript file remains.** Bash test runners still embed small Node.js programs for JSON assertions, plus Python assertions for template contracts.
- **Python is standard-library-only** based on its imports. Seven scripts have `python3` shebangs; the other seven are imported `common.py` helpers.
- **Two shell dialects are intentional:**
  - adrkit wrappers use `#!/bin/sh`; preserve POSIX compatibility.
  - Tests, compound gates, and the commit hook require Bash, including Bash-specific features such as process substitution and `BASH_SOURCE`.
- **External runtime:** adrkit skills require `@adrkit/cli` 0.20.0 with `adrkit` on `PATH`. If unavailable, the skills and resolver direct the user to `npm install -g @adrkit/cli@0.20.0`; no override or plugin-binary fallback is used.
- **Other runtime requirements:** Node.js **>=22**, Bash, POSIX shell/core utilities, and `python3` for the relevant skills. Python-dependent tests skip when `python3` is unavailable; Node and the npm-installed adrkit CLI are mandatory for the full repository test suite.

## Duplication profile

Checksums confirm exact copies of:

- `common.py`: **7 copies**
- `check_prerequisites.py`: **5 copies**
- `adrkit-lib.sh`: **3 copies**

This matches the pack's self-contained-per-skill script distribution model. It is nevertheless the main maintenance hotspot: fixes to these helpers must be propagated to every copy.

## adrkit-lib.sh

`adrkit-lib.sh` (77 lines, POSIX `sh`, three verbatim copies under `skills/ncw-adrkit-{check,context,draft}/scripts/`) is the shared helper library for the adrkit command scripts. It is sourced, never executed directly.

| Item | Purpose |
|---|---|
| `ADRKIT_EXIT_MISSING=1` / `ADRKIT_EXIT_USAGE=2` | Exit-code constants; 2 deliberately matches `adr`'s usage-error code |
| `adrkit_fail` | Fail-fast printer — every resolver either yields a usable value or exits non-zero naming exactly what is missing (no silent success, no fabricated payload) |
| `adrkit_cli` | Locates `adrkit` on `PATH`, errors with the `npm install -g @adrkit/cli@0.20.0` hint if absent; propagates the CLI's exit code verbatim so 1 ("found something wrong") vs 2 ("invoked wrong") stays distinguishable |
| `adrkit_corpus_dir` | Resolves the ADR corpus (`$ADRKIT_DIR` or default `docs/adr`); a missing directory is an error, not an empty corpus — a governance check silently reporting "0 decisions" was the ADR-0016 failure it guards against |
| `adrkit_feature_dir` | Resolves the current feature directory: `$ADRKIT_FEATURE_DIR` override first, else delegates to the pack-bundled `ncw-speckit-analyze/scripts/check_prerequisites.py --paths-only` (needs `python3`), extracting `FEATURE_DIR:` from its output |
| `adrkit_plan_path` | `<feature_dir>/plan.md`, required by anything claiming to act "on the plan" |

Design contract per the header: every resolver either yields a usable value or exits non-zero with a message naming exactly what is missing; nothing reaches the network or reads a credential.
