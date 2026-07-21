# Task brief — open-source community baseline

**Owner:** Hermes Agent
**Date:** 2026-07-21
**Related issue:** #25
**Branch:** `docs/25-open-source-community`

## Objective

Establish the community and policy baseline for the now-public TypeMCP repository without changing package runtime behavior.

## Included

- Structured bug and feature GitHub issue forms, contact routing, and a pull-request template.
- Code of Conduct, Security Policy, Support guide, public contribution guidance, and an operations checklist.
- Label taxonomy additions for community, security, dependencies, compatibility, and missing information.
- Accurate status for the public repository, its branch-protection policy, and reporting channels.

## Excluded

- Publishing npm packages, version changes, runtime code changes, or enabling Discussions without a maintainer-support decision.
- Claiming a working private security or Code of Conduct reporting channel before one is configured and monitored.

## Verification

- `biome check .` validates repository formatting, including YAML forms.
- A deterministic Markdown-link scan confirms local Markdown targets exist.
- GitHub labels referenced by issue forms are checked against the repository.
- The repository is public and Issues are enabled. GitHub topic and vulnerability-reporting settings remain pending because the available token cannot access their settings endpoints; the operations checklist records them transparently.

## Operations handoff

Before representing the project as accepting private reports, configure GitHub private vulnerability reporting or publish a monitored private contact, then update `SECURITY.md`, the Code of Conduct, and issue-form routing together. Continue to audit public history, Actions logs, releases, issue/PR bodies, and npm metadata for sensitive content.
