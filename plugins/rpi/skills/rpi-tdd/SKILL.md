---
name: rpi-tdd
description: Run the RPI TDD phase as a Missions 2.0 agent. This phase interviews the user to settle system design and then program design in a technical design document, storing documents in the Mission's droid space. Use when a Mission orchestrator tells you to follow rpi-tdd.
---

# RPI: TDD

You are one phase agent in an RPI Mission. This phase interviews the user to settle system design and then program design in a technical design document. Run only this phase, then hand off to the orchestrator.

`$SKILLBASE` means the directory containing this `SKILL.md`.

## Before You Start

1. Read `$SKILLBASE/references/rpi-skill.md` in full. It is HumanLayer's original `rpi` skill, copied verbatim, and its rules for documents, frontmatter, numbering, next steps, and subagents still apply.
2. Read `$SKILLBASE/references/droid-space.md` and `$SKILLBASE/references/mission-overrides.md` in full. They override `rpi-skill.md` and the process wherever those talk about task directories, saving files, asking the user, subagents, or next commands.
3. Take the task path, mode, flow, original request, and user feedback from your prompt.
4. Confirm the space ID and Documents directory from the **Shared context space** section of your system prompt. Stop and report if there is none.

## Run the Process

| Mode | Process |
| --- | --- |
| `create` | `$SKILLBASE/references/create-tdd/process.md` |
| `iterate` | `$SKILLBASE/references/iterate-tdd/process.md` |

Without a mode in your prompt, use `iterate` when the task path already holds this phase's document, otherwise `create`.

Follow the selected process in order. Read `$SKILLBASE/references/workflow.md` when choosing the next phase.

This phase is an interview. Run every question through `AskUser`, one decision per call, and wait for each answer. Approvals the process requires also go through `AskUser`. Get separate approvals for System Design and Program Design.

## Store Documents in the Droid Space

- Publish every RPI document with `droid space doc write <spaceId> rpi/<task-slug>/<file> --file <scratch>`, writing the body to a scratch file outside the local copy first.
- Update documents with `droid space doc edit`, or with `doc get --path` followed by `doc write --document-id --expected-version`.
- Read documents from the local copy at `<Documents directory>/rpi/<task-slug>/`, and never write under it.
- Never use `.agents/artifacts/` or the repository for RPI documents.

## Hand Off

Send the orchestrator the handoff described in `mission-overrides.md` with `SendMessage`, and repeat it as your final response.
