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
