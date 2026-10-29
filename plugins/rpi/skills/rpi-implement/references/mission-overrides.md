# Run an RPI Phase as a Mission Agent

The phase processes come from HumanLayer's RPI skill, which was written for a single interactive session. You run one phase as an agent in a Missions 2.0 Mission. When the process text conflicts with this file or `droid-space.md`, follow these files.

## Inputs from the Orchestrator

Your prompt gives you:

- **Task path**: the space path prefix, such as `rpi/task-retries/`. This is the task directory.
- **Mode**: `create` or `iterate`. Without one, iterate when the task path already holds this phase's document, otherwise create.
- **Flow**: the chosen workflow (design discussion, PRD then TDD, TDD, or research only). Carry it into frontmatter and the handoff.
- **Original request** and **user feedback**, when present.

Skip the upstream "Use the Task Directory" selection rules. The orchestrator already chose the task path.

## Fetch Referenced Tickets in Full

When the original request references a ticket or issue (Linear, GitHub, Jira, Sentry, or a pasted issue URL), fetch the whole issue with the matching connector, MCP tool, or `gh` before you write anything. The title and description are not enough; root-cause findings often live in the comments. Collect:

- The title, description, status, labels, and assignee.
- Every comment and reply, in order, with author and date.
- Screenshots and inline images. Download each one and publish it beside the request document as `NN-request-<description>-<n>.png` (or the matching extension), then link it.
- Attachments and linked documents or URLs (Notion, Google Docs, Slack threads, PRs, Sentry issues, logs). Fetch each one and summarize it, and keep the exact link.
- Related or duplicate issues the ticket links to.

Record all of this in the request document under a `## Ticket` section after the user's request. Quote comments verbatim instead of paraphrasing them. Add every URL to `## Source Pointers`. If a source cannot be fetched because the connector is missing, access is denied, or the image cannot be read, list it under `## Unfetched Sources` with the reason, and tell the orchestrator in the handoff.

## Talk to the User with AskUser

Wherever the process says to ask the user, interview them, wait for their answer, or get their approval, call `AskUser`. Ask one decision per call with its options and your recommendation, then wait for the answer before continuing. Present the context a question needs (diagram, code-shape options, quoted text) in your message just before the `AskUser` call. Do not answer on the user's behalf and do not ask the orchestrator to decide product or design choices.

## Use the Research Droids

Launch the bundled droids with the Task tool, using these `subagent_type` names: `codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, and `outline-implementer-agent`. Where the process mentions an Explore agent, use `explorer`. Run independent investigations in parallel by issuing several Task calls together. Droids cannot spawn their own subagents or ask the user questions, so keep their questions bounded and handle follow-ups yourself.

## Hand Off to the Orchestrator

The orchestrator, not the user, launches the next phase. Wherever a final-answer template shows a `<rpi-invocation>` command or says to run a command "here, after compaction, or in a new session", replace that block with:

```text
Next phase: rpi-<phase> (<create|iterate>), task path rpi/<task-slug>/, flow: <flow>
```

Wherever the process says to wait for the user's request to begin the next phase, finish this phase and hand off instead.

Wherever the process offers to open a document in VS Code, Cursor, or a browser, give the document's local copy path instead.

Finish by sending the orchestrator a handoff with `SendMessage` when that tool is available, and repeat the same handoff as your final response. Include:

1. The space paths of every document created or updated.
2. Decisions the user settled and approvals they gave.
3. Open questions that remain.
4. The recommended next phase in the format above, plus other valid choices from `workflow.md`.
5. For implementation phases, the changed files, checks run with results, commits made, and manual checks still pending.

## Stay in Your Phase

Do only this phase's work. If the user asks for a different phase, record what is settled in the current document and hand off with the requested phase as the next step.

Make commits only when the user, the orchestrator, or repository instructions ask for them.
