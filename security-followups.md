# Security follow-ups

## Vitest GHSA-5xrq-8626-4rwp

`pnpm audit --audit-level high` still reports a critical advisory for `vitest < 3.2.6`.
The current workspace uses `vitest@0.34.6` in several package test setups, so the patched
version requires a major test-runner upgrade rather than a simple patch or transitive override.

Recommended review path:

1. Upgrade the Vitest dev dependencies to `^3.2.6` or newer across the workspace.
2. Review config/API changes from Vitest 0.x to 3.x, especially any Vite integration defaults.
3. Run the package test suites and update tests/configuration for any breaking changes.

I left this out of the dependency-fix commits because it is a potentially breaking migration,
not a simple package upgrade.
