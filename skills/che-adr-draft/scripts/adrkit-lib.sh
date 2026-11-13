#!/bin/sh
# Shared resolution helpers for the adrkit extension scripts.
#
# Sourced by the command scripts, never executed directly.
#
# Every resolver here either yields a usable value or exits non-zero with a
# message naming exactly what is missing. That is the failure contract spike 008
# verified against a live project: never a silent success, never a fabricated
# payload, never an unhandled crash. Nothing here reaches the network or reads
# a credential.

# A dependency the command needs is absent.
ADRKIT_EXIT_MISSING=1
# The invocation itself was wrong. Matches `adr`'s own usage-error code.
ADRKIT_EXIT_USAGE=2

adrkit_fail() {
	printf 'adrkit: %s\n' "$1" >&2
	exit "${2:-$ADRKIT_EXIT_MISSING}"
}

# Run adrkit from PATH, propagating its exit code verbatim. `adrkit` uses 1 for
# "found something wrong" and 2 for "you invoked me wrong"; collapsing those
# would throw away the distinction the caller needs.
adrkit_cli() {
	command -v adrkit >/dev/null 2>&1 ||
		adrkit_fail "adrkit CLI not found on PATH; install it with 'npm install -g @adrkit/cli@0.20.0'"
	adrkit "$@"
}

# The ADR corpus. Absent is an error, not an empty corpus: a governance check
# that silently reports "0 decisions govern this" because it was looking in the
# wrong directory is exactly the failure ADR-0016 was written about. Read-only
# callers that need "no corpus yet" to mean an empty corpus use
# adrkit_resolve_readonly_corpus below instead.
adrkit_corpus_dir() {
	_adrkit_corpus="${ADRKIT_DIR:-docs/adr}"
	[ -d "$_adrkit_corpus" ] ||
		adrkit_fail "no ADR corpus at '$_adrkit_corpus' — point ADRKIT_DIR at the corpus directory, or create the first record with /che-adr-draft"
	printf '%s' "$_adrkit_corpus"
}

# Resolve the corpus for a read-only query (check.sh, context.sh) into the
# ADRKIT_CORPUS variable. Unlike adrkit_corpus_dir, a missing *default* corpus
# (docs/adr) resolves to a private empty stand-in directory instead of an
# error: a project that has not drafted its first ADR yet is in the normal
# fresh state, and the honest query result is "0 decisions govern this" — not
# a broken mechanical layer. The result still comes from the real CLI run
# against the stand-in, never from a hand-written payload; the stand-in is
# removed when the caller exits. Sets a variable instead of printing so the
# EXIT trap lives in the caller's shell — a command substitution would run it
# in a subshell and delete the directory immediately. An explicitly set
# ADRKIT_DIR that does not exist remains an error: "0 decisions" from a wrong
# configured path is the ADR-0016 failure mode.
adrkit_resolve_readonly_corpus() {
	if [ -z "${ADRKIT_DIR:-}" ] && [ ! -d docs/adr ]; then
		ADRKIT_CORPUS="$(mktemp -d "${TMPDIR:-/tmp}/adrkit-empty-corpus.XXXXXX")" ||
			adrkit_fail "cannot create an empty-corpus stand-in under ${TMPDIR:-/tmp}"
		trap 'rm -rf "$ADRKIT_CORPUS"' EXIT
		printf "adrkit: no corpus at 'docs/adr' yet — querying an empty stand-in corpus (0 decisions govern this); the first /che-adr-draft creates the real corpus\n" >&2
	else
		ADRKIT_CORPUS="$(adrkit_corpus_dir)"
	fi
}

# The current feature directory. Resolve through the external `che` CLI on
# PATH (published as @arthuratlas/che; same consumption model as `adrkit` above).
adrkit_feature_dir() {
	if [ -n "${ADRKIT_FEATURE_DIR:-}" ]; then
		[ -d "$ADRKIT_FEATURE_DIR" ] ||
			adrkit_fail "ADRKIT_FEATURE_DIR is set to '$ADRKIT_FEATURE_DIR', but that directory does not exist"
		printf '%s' "$ADRKIT_FEATURE_DIR"
		return 0
	fi

	command -v che >/dev/null 2>&1 ||
		adrkit_fail "che CLI not found on PATH; install it with 'npm install -g @arthuratlas/che@latest', or set ADRKIT_FEATURE_DIR"

	_adrkit_paths="$(che paths)" ||
		adrkit_fail "che feature resolution failed — run /che-intend first, or set ADRKIT_FEATURE_DIR"
	_adrkit_feature="$(printf '%s\n' "$_adrkit_paths" | sed -n 's/^FEATURE_DIR: *//p' | head -n 1)"

	[ -n "$_adrkit_feature" ] ||
		adrkit_fail "Resolver returned no FEATURE_DIR — run /che-intend first, or set ADRKIT_FEATURE_DIR"
	[ -d "$_adrkit_feature" ] ||
		adrkit_fail "Resolver returned FEATURE_DIR '$_adrkit_feature', but that directory does not exist"

	printf '%s' "$_adrkit_feature"
}

# The plan this extension governs. Required by every command that claims to act
# "on the plan" — without it there is nothing to be honest about.
adrkit_plan_path() {
	_adrkit_plan="$(adrkit_feature_dir)/plan.md"
	[ -f "$_adrkit_plan" ] ||
		adrkit_fail "no plan at '$_adrkit_plan' — run /che-plan first"
	printf '%s' "$_adrkit_plan"
}
