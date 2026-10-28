# Store RPI Documents in the Mission's Droid Space

Every RPI document lives in this Mission's shared droid space. That covers the original request, research questions, research, design discussion, PRD, TDD, and structure outline, plus the HTML mockups and diagrams that go with them. Never write RPI documents to `.agents/artifacts/`, the repository, or any other local folder.

Source code changes made during implementation still go in the repository working tree as usual. Only RPI documents live in the space.

## Find the Space

Your system prompt has a **Shared context space** section that names the space ID and the **Documents** directory, which holds the read-only local copy of the space. Use those values. If they are missing, run `droid space status`. If you still have no space, stop and report to the orchestrator that RPI needs a Missions 2.0 shared space. Do not create a space or fall back to local files.

## The Task Directory Is a Path Prefix in the Space

The orchestrator gives you a task path such as `rpi/task-retries/`. Wherever the RPI process says "task directory", use this prefix:

- Document path in the space: `rpi/<task-slug>/NN-<kind>-<description>.md`
- Local read-only copy: `<Documents directory>/rpi/<task-slug>/NN-<kind>-<description>.md`

Document paths are case-sensitive, relative, and forward-slash separated, with no leading `/`.

## Read Documents

Read, LS, Grep, and Glob work on the local copy, and the copy refreshes before each read. From a shell script, run `droid space sync <spaceId>` first. Before replacing a whole document, read it with `droid space doc get <spaceId> --path <path>` and keep the returned `id`, `version`, and body together.

## Choose the Next Number

List `<Documents directory>/rpi/<task-slug>/`, or run `droid space doc list <spaceId>`. Use the highest two-digit `NN-` prefix among the workflow documents plus one. Start at `01` when the task path is empty. Keep the existing path when you update a document.

## Create a Document

Write the body to a scratch file outside the local copy, then publish it:

```bash
scratch="$(mktemp -d)/doc.md"
# write the full body to "$scratch" with the Create tool or a heredoc
droid space doc write <spaceId> rpi/<task-slug>/NN-research-<description>.md --file "$scratch"
```

Never put a document body on the command line. Bodies are limited to 256 KiB. HTML mockups and diagrams are text documents, so publish them the same way with an `.html` path beside the workflow documents. PNG, JPEG, GIF, WEBP, and PDF files also publish with `doc write --file` when the path has the matching extension.

## Update a Document

For a targeted change, replace exact text:

```bash
droid space doc edit <spaceId> <path> --old-file <old.txt> --new-file <new.txt>
```

Use `--old` and `--new` only for short single-line text. The old text must match exactly once; include surrounding lines to make it unique.

To replace a whole body, read it with `doc get --path`, prepare the replacement from that exact body, and publish with the same read's ID and version:

```bash
droid space doc get <spaceId> --path <path>
droid space doc write <spaceId> <path> --document-id <id> --expected-version <version> --file <scratch>
```

Handle errors without overwriting someone else's work:

- `old_text_not_found`, `old_text_ambiguous`, `revision_conflict`, or `path_exists`: nothing was published. Read the document again, reconcile, and retry once.
- `unknown_outcome`: run `droid space sync <spaceId>`, read the document, and decide from what you see.
- `feature_disabled`, a 403 storage-policy denial, or `prem_host_unavailable`: stop and report the limitation to the orchestrator.

## Rules

- Never write under the Documents directory with file tools or shell commands; the next sync overwrites it. Change documents only with `droid space doc write` or `droid space doc edit`.
- Never delete documents.
- Keep secrets, credentials, and private scratch work out of documents.
- Running an RPI phase in this Mission authorizes publishing that phase's RPI documents to this Mission's space. It authorizes nothing else, such as other spaces or transcripts.

## Refer to Documents

Name documents by their space path, for example `rpi/task-retries/02-research-worker-retries.md`, and include the local copy path so a person can open it. Link mockups and diagrams by their space paths.

## Delegate with the Space Details

When you launch `codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, or `outline-implementer-agent`, put the space ID, the task path, and the local copy directory in the prompt. Only `outline-implementer-agent` may change documents; the research droids read them.
