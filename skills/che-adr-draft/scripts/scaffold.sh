#!/bin/sh
# che-adr-scaffold — allocate one schema-valid ADR record without requiring
# a plan artifact.
#
# draft.sh insists on a plan because "draft an ADR from the plan" is its
# command contract, and scaffolding an empty record with no source artifact
# would be the fabricated-success failure the extension exists to prevent.
# But two other writers legitimately allocate records when the plan is not
# the source at all: che-grill-with-docs (pre-plan, source is the
# settled interview) and che-writeback (post-implement, source is a
# session correction being elevated). Both need the same deterministic half
# of draft.sh's job — allocate the next corpus id, write a schema-valid draft
# at the right path — while the body stays the calling skill's judgment.
# That is this entry point. Like draft.sh, it writes at most one new file
# and never edits an existing record.
set -eu
. "$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)/adrkit-lib.sh"

# A write may legitimately be the very first record in the corpus, unlike the
# read commands' "absent corpus is an error" contract: create the directory
# and let the CLI allocate inside it.
mkdir -p "${ADRKIT_DIR:-docs/adr}"
adrkit_corpus="$(adrkit_corpus_dir)"

adrkit_title="$*"
if [ -z "$adrkit_title" ]; then
	adrkit_fail "scaffold needs a title — e.g. .agents/skills/che-adr-draft/scripts/scaffold.sh Adopt Postgres for the read model" "$ADRKIT_EXIT_USAGE"
fi

adrkit_cli new "$adrkit_title" --status draft --dir "$adrkit_corpus" --json
