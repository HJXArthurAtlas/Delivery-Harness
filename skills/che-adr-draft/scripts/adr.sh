#!/bin/sh
# Pack-local adrkit CLI entry point for cross-skill lint and migration flows.
set -eu
. "$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)/adrkit-lib.sh"

adrkit_cli "$@"
