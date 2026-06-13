# Value Autocomplete Performance Plan

## Goal

Improve Tokenami token value autocomplete latency by avoiding TypeScript's original completion provider when the plugin can produce token value completions directly.

## Slices

- S1: Build direct value completion data from Tokenami config and use it in value completion contexts.
- S2: Preserve fallback behavior for non-Tokenami value contexts and add focused regression coverage.
- S3: Run quality gates, review the performance-sensitive path, and polish the draft PR.
