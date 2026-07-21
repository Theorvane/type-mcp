# Task brief — <short title>

**Owner:** <name/agent>

**Date:** YYYY-MM-DD

**Status:** proposed | in-progress | review | complete

**Related plan:** `docs/planning/<file>#task-n`

## Objective

<State one observable outcome.>

## Scope

**In:**
- <exact behavior/file boundary>

**Out:**
- <explicit non-goal>

## Acceptance criteria

- [ ] <behavioral criterion>
- [ ] <error or edge criterion>
- [ ] <verification criterion>

## Files

- Create: `<path>`
- Modify: `<path>`
- Test: `<path>`
- Docs: `<path>`

## Red → green evidence

| Stage | Command | Result / expected reason |
| --- | --- | --- |
| Red | `<focused test command>` | `<missing behavior failure>` |
| Green | `<focused test command>` | `<pass count>` |
| Regression | `<affected suite command>` | `<pass count>` |

## Risks and boundaries

- <input validation / compatibility / transport / package-boundary consideration>

## Review handoff

- Spec review: pending | approved | findings
- Quality review: pending | approved | findings
- Final checks: `<commands>`
