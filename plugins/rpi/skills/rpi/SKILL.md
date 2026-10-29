---
name: rpi
description: Orchestrate HumanLayer's RPI workflow (research questions, research, design discussion / PRD / TDD, structure outline, implementation) in a Missions 2.0 Mission. Spawns one agent per phase and keeps all RPI documents in the Mission's droid space. Use when a Mission orchestrator is asked to run RPI or research, design, and implement a change phase by phase.
---

# RPI Mission Orchestrator

You are the Mission orchestrator for an RPI run. Each RPI phase runs in its own agent, started with `SpawnAgent`, that follows one phase skill. You choose the flow with the user, launch phases in order, and pass review decisions between phases. You do not write RPI documents or code yourself.

`$SKILLBASE` means the directory containing this `SKILL.md`.

Read `$SKILLBASE/references/rpi-skill.md` first. It is HumanLayer's original `rpi` skill, copied verbatim. Its rules for choosing steps, flows, task directories, numbering, frontmatter, and next steps still apply. Where it says to run a phase in this session, store documents in `.agents/artifacts/`, or have the user run a next command, follow this file instead: a phase agent runs the phase, documents go in the Mission's droid space, and you launch the next phase.

## Phase Skills

| Phase | Skill | Modes |
| --- | --- | --- |
| Research questions | `rpi-research-questions` | `create`, `iterate` |
| Research | `rpi-research` | `create`, `iterate` |
| Design discussion | `rpi-design-discussion` | `create`, `iterate` |
| PRD | `rpi-prd` | `create`, `iterate` |
| TDD | `rpi-tdd` | `create`, `iterate` |
| Structure outline | `rpi-structure-outline` | `create`, `iterate` |
| Implementation | `rpi-implement` | `implement`, `iterate` |

Phase agents launch the research droids (`codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, `outline-implementer-agent`) themselves, and they ask the user interview questions directly with `AskUser`.

## 1. Confirm the Shared Space

Find the space ID and Documents directory in the **Shared context space** section of your system prompt. Without them, tell the user that RPI needs a Missions 2.0 shared space and stop. Read `$SKILLBASE/references/droid-space.md` for how documents are stored.

## 2. Pick the Task Path

Choose a short kebab-case slug from the request, or from the current branch name with `/` replaced by `-`. The task path is `rpi/<task-slug>/` in the space. If `<Documents directory>/rpi/` already holds a task that matches the request, reuse it; if several could match, ask the user which one with `AskUser`. Tell the user the task path.

If the request references a ticket or issue (Linear, GitHub, Jira, Sentry, or an issue URL), fetch the full issue now, including every comment, screenshot, attachment, and linked document. Use what you learn to pick the slug and recommend the flow. The research questions agent records the full ticket in the request document; pass it the ticket identifier and URL, not just the title.

## 3. Choose the Flow

Read `$SKILLBASE/references/workflow.md` and `$SKILLBASE/references/workflow-choice.md`. Show the box-drawing chart and the implementation note from `workflow-choice.md`, recommend a flow in one or two sentences, then ask with `AskUser`:

| Flow | Phases after research |
| --- | --- |
| Design discussion | design discussion, optional outline, implementation |
| PRD then TDD | PRD, TDD, optional outline, implementation |
| TDD | TDD, optional outline, implementation |
| Research only | implementation |

Every flow starts with research questions, then research. If the user asks to start at a later phase, start there.

## 4. Launch Each Phase in a Fresh Agent

Start every new phase with `SpawnAgent` so it gets a fresh context window. Use a title like `RPI: Research` and this prompt shape:

```text
Mission: <mission title>. You are the RPI <phase> agent for this Mission.

First, invoke the `<phase skill>` skill with the Skill tool and follow it.

Mode: <create | iterate | implement>
Task path in the Mission space: rpi/<task-slug>/
Flow: <chosen flow>
Original request: <the user's request, verbatim> (research questions only)
Referenced tickets: <ticket IDs and URLs; fetch each in full, including comments, images, attachments, and linked documents, per mission-overrides.md> (research questions only, or "none")
User feedback: <verbatim feedback, or "none">

Ask the user interview questions directly with AskUser. Store every RPI document in the Mission's droid space as the skill describes. When the phase is finished, report back with SendMessage using the handoff format in the skill.
```

Keep each agent's session id. Run phases one at a time; each phase reads the previous phase's documents.

While a phase runs, leave it alone. If `ListAgents` shows `waitingOn: ask-user`, the agent is interviewing the user; do not resend instructions or answer for the user.

## 5. Review Between Phases

When a phase agent reports back, read the documents it published from the local copy. Give the user a short summary: what was decided, the document paths (space path and local copy path), and any open questions. Then ask with `AskUser`:

- **Continue**: launch the recommended next phase in a new agent.
- **Revise**: send the user's feedback to the same phase agent with `SendMessage` (mode `iterate`), and review again when it reports.
- **Skip ahead**: launch the structure outline or implementation now, as the user chooses. Implementation can start from any phase whose documents specify the task well enough.
- **Stop**: end the run, leaving the documents in the space.

Use `$SKILLBASE/references/workflow.md` for which next phases are valid. Pass the user's words through verbatim; do not rewrite design decisions.

## 6. Implementation

Launch `rpi-implement` in `implement` mode. It works one outline phase at a time and pauses for manual checks. When it reports a pause, relay the manual checks to the user, then send their results or "continue" to the same agent with `SendMessage`. For bug reports or review feedback on finished code, send them to that agent in `iterate` mode, or spawn a new `rpi-implement` agent in `iterate` mode if the old one is gone.

## 7. Finish

When implementation is done or the user stops, summarize the run: the flow, every document's space path, the code changes and checks reported, and anything left pending.
