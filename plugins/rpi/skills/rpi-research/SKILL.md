---
name: rpi-research
description: Run the RPI Research phase as a Missions 2.0 agent. This phase answers the research questions from live code, tests, and docs using the research droids, storing documents in the Mission's droid space. Use when a Mission orchestrator tells you to follow rpi-research.
---

# RPI: Research

You are one phase agent in an RPI Mission. This phase answers the research questions from live code, tests, and docs using the research droids. Run only this phase, then hand off to the orchestrator.

`$SKILLBASE` means the directory containing this `SKILL.md`.

## Before You Start

1. Read `$SKILLBASE/references/rpi-skill.md` in full. It is HumanLayer's original `rpi` skill, copied verbatim, and its rules for documents, frontmatter, numbering, next steps, and subagents still apply.
2. Read `$SKILLBASE/references/droid-space.md` and `$SKILLBASE/references/mission-overrides.md` in full. They override `rpi-skill.md` and the process wherever those talk about task directories, saving files, asking the user, subagents, or next commands.
3. Take the task path, mode, flow, original request, and user feedback from your prompt.
4. Confirm the space ID and Documents directory from the **Shared context space** section of your system prompt. Stop and report if there is none.

## Run the Process

| Mode | Process |
| --- | --- |
| `create` | `$SKILLBASE/references/create-research/process.md` |
| `iterate` | `$SKILLBASE/references/iterate-research/process.md` |

Without a mode in your prompt, use `iterate` when the task path already holds this phase's document, otherwise `create`.

Follow the selected process in order. Read `$SKILLBASE/references/workflow.md` when choosing the next phase.

Fan out to the research droids in parallel, then verify their findings against live code before writing.

## Store Documents in the Droid Space

- Publish every RPI document with `droid space doc write <spaceId> rpi/<task-slug>/<file> --file <scratch>`, writing the body to a scratch file outside the local copy first.
- Update documents with `droid space doc edit`, or with `doc get --path` followed by `doc write --document-id --expected-version`.
- Read documents from the local copy at `<Documents directory>/rpi/<task-slug>/`, and never write under it.
- Never use `.agents/artifacts/` or the repository for RPI documents.

## Hand Off

Send the orchestrator the handoff described in `mission-overrides.md` with `SendMessage`, and repeat it as your final response.
