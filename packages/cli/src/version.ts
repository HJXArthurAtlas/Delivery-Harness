// CLI version, declared once and re-exported by index.ts. Kept in its own
// module so pack.ts / self-update.ts can import it without an ESM cycle
// through the entry module. Must equal packages/cli/package.json#version
// (test-che-cli.sh enforces parity).
export const CLI_VERSION = '0.5.0';
