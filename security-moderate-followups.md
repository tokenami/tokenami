# Moderate Security Follow-ups

## `auto` / Octokit ReDoS advisories

`pnpm audit --audit-level moderate` still reports three Octokit advisories through the release tooling stack:

- `@octokit/request` (`GHSA-rmvr-2pp2-xj38`)
- `@octokit/request-error` (`GHSA-xx4v-prfh-6cgc`)
- `@octokit/plugin-paginate-rest` (`GHSA-h5c3-5r3r-rr8q`)

The vulnerable paths come from `auto` / `@auto-it/core`:

```text
auto@11.3.6
└─ @auto-it/core@11.3.6
   ├─ @octokit/core@3.6.0
   ├─ @octokit/request@5.6.3
   ├─ @octokit/request-error@2.1.0
   └─ @octokit/rest@18.12.0
      └─ @octokit/plugin-paginate-rest@2.21.3
```

The current stable `auto` release is still `11.3.6`, so there is no simple parent-package upgrade that moves this dependency family forward.

The patched Octokit versions are major-version upgrades relative to the versions used by `@auto-it/core`:

- `@octokit/request`: `5.x` -> `8.4.1+`
- `@octokit/request-error`: `2.x` -> `5.1.1+`
- `@octokit/plugin-paginate-rest`: `2.x` -> `9.2.2+`

I do not recommend forcing these with pnpm overrides. They sit under the release automation path, and overriding them would mix incompatible Octokit major versions under `@octokit/core@3` / `@octokit/rest@18`.

Recommended review path:

1. Decide whether to keep `auto` as the release tool.
2. If keeping `auto`, wait for or contribute an upstream `@auto-it/core` release that upgrades to a patched Octokit stack, then upgrade `auto` normally.
3. If replacing `auto`, migrate release automation to a maintained tool with patched GitHub API dependencies, then remove `auto` and `@auto-it/*`.
4. Re-run `pnpm audit --audit-level moderate` after the release-tool decision.
