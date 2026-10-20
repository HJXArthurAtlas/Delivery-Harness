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

# Resolve the CLI once. ADRKIT_CLI is an explicit opt-in override. Next comes
# an @adrkit/cli installed as an omp plugin dependency (git/npm plugin install
# puts its `adrkit` bin in the scope's plugins node_modules/.bin; the
# project-scoped root is cwd-relative because the corpus itself is). The
# fallback is the pack-bundled adrkit 0.20.0 runtime, never a PATH install.
_adrkit_cli_resolved=''

adrkit_resolve_cli() {
	if [ -n "$_adrkit_cli_resolved" ]; then
		return 0
	fi

	if [ -n "${ADRKIT_CLI:-}" ]; then
		[ -e "$ADRKIT_CLI" ] ||
			adrkit_fail "ADRKIT_CLI is set to '$ADRKIT_CLI', but nothing exists at that path"
		_adrkit_cli_resolved="$ADRKIT_CLI"
		return 0
	fi

	if [ -x ".omp/plugins/node_modules/.bin/adrkit" ]; then
		_adrkit_cli_resolved=".omp/plugins/node_modules/.bin/adrkit"
		return 0
	fi
	if [ -n "${HOME:-}" ] && [ -x "$HOME/.omp/plugins/node_modules/.bin/adrkit" ]; then
		_adrkit_cli_resolved="$HOME/.omp/plugins/node_modules/.bin/adrkit"
		return 0
	fi

	_adrkit_cli_resolved="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)/../../ncw-adrkit-draft/scripts/adr.mjs"
	[ -f "$_adrkit_cli_resolved" ] ||
		adrkit_fail "pack-bundled adrkit runtime is missing at '$_adrkit_cli_resolved' — reinstall the complete pack"
}

# Run the resolved CLI, propagating its exit code verbatim. `adr` uses 1 for
# "found something wrong" and 2 for "you invoked me wrong"; collapsing those
# would throw away the distinction the caller needs.
adrkit_cli() {
	adrkit_resolve_cli
	case "$_adrkit_cli_resolved" in
	*.js | *.mjs | *.cjs)
		command -v node >/dev/null 2>&1 ||
			adrkit_fail "'$_adrkit_cli_resolved' needs node to run, but node is not on PATH"
		node "$_adrkit_cli_resolved" "$@"
		;;
	*)
		"$_adrkit_cli_resolved" "$@"
		;;
	esac
}

# The ADR corpus. Absent is an error, not an empty corpus: a governance check
# that silently reports "0 decisions govern this" because it was looking in the
# wrong directory is exactly the failure ADR-0016 was written about.
adrkit_corpus_dir() {
	_adrkit_corpus="${ADRKIT_DIR:-docs/adr}"
	[ -d "$_adrkit_corpus" ] ||
		adrkit_fail "no ADR corpus at '$_adrkit_corpus' — point ADRKIT_DIR at the corpus directory, or create the first record with /ncw-adrkit-draft"
	printf '%s' "$_adrkit_corpus"
}

# The current feature directory. Resolve through the pack's bundled speckit
# helper.
adrkit_feature_dir() {
	if [ -n "${ADRKIT_FEATURE_DIR:-}" ]; then
		[ -d "$ADRKIT_FEATURE_DIR" ] ||
			adrkit_fail "ADRKIT_FEATURE_DIR is set to '$ADRKIT_FEATURE_DIR', but that directory does not exist"
		printf '%s' "$ADRKIT_FEATURE_DIR"
		return 0
	fi

	_adrkit_scripts_dir="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
	_adrkit_prereq="$_adrkit_scripts_dir/../../ncw-speckit-analyze/scripts/check_prerequisites.py"
	[ -f "$_adrkit_prereq" ] ||
		adrkit_fail "pack feature resolver is missing at '$_adrkit_prereq' — reinstall the pack, or set ADRKIT_FEATURE_DIR"
	command -v python3 >/dev/null 2>&1 ||
		adrkit_fail "pack feature resolver needs python3 on PATH, or set ADRKIT_FEATURE_DIR"

	_adrkit_paths="$(python3 "$_adrkit_prereq" --paths-only)" ||
		adrkit_fail "pack feature resolver failed — run /ncw-speckit-specify first, or set ADRKIT_FEATURE_DIR"
	_adrkit_feature="$(printf '%s\n' "$_adrkit_paths" | sed -n 's/^FEATURE_DIR: *//p' | head -n 1)"

	[ -n "$_adrkit_feature" ] ||
		adrkit_fail "Resolver returned no FEATURE_DIR — run /ncw-speckit-specify first, or set ADRKIT_FEATURE_DIR"
	[ -d "$_adrkit_feature" ] ||
		adrkit_fail "Resolver returned FEATURE_DIR '$_adrkit_feature', but that directory does not exist"

	printf '%s' "$_adrkit_feature"
}

# The plan this extension governs. Required by every command that claims to act
# "on the plan" — without it there is nothing to be honest about.
adrkit_plan_path() {
	_adrkit_plan="$(adrkit_feature_dir)/plan.md"
	[ -f "$_adrkit_plan" ] ||
		adrkit_fail "no plan at '$_adrkit_plan' — run /ncw-speckit-plan first"
	printf '%s' "$_adrkit_plan"
}
