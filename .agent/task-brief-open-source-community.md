# Task brief — open-source community baseline

**Owner:** Hermes Agent
**Date:** 2026-07-21
**Related issue:** #25
**Branch:** `docs/25-open-source-community`

## Objective

Prepare the repository for a safe public open-source launch without changing package runtime behavior or repository visibility before the baseline is reviewed and merged.

## Included

- Structured bug and feature GitHub issue forms, contact routing, and a pull-request template.
- Code of Conduct, Security Policy, Support guide, public contribution guidance, and a launch checklist.
- Label taxonomy additions for community, security, dependencies, compatibility, and missing information.
- Public repository topics when GitHub allows the setting for this repository.

## Excluded

- Changing visibility to public before the baseline PR, CI, and secret/history review pass.
- Publishing npm packages, version changes, runtime code changes, or enabling Discussions without a maintainer-support decision.

## Verification

- `biome check .` validates repository formatting, including YAML forms.
- A deterministic Markdown-link scan confirms local Markdown targets exist.
- GitHub community profile is rechecked after this PR reaches `main`.
- GitHub topics and private vulnerability reporting are configured when the repository settings API permits them; current private-repo API attempts return 404 and remain launch-checklist tasks.

## Launch handoff

After merge, verify community health, enable private vulnerability reporting, protect `main` with the verified `verify` check, then perform the secret/history review before public visibility is changed.
