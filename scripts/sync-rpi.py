#!/usr/bin/env python3
"""Generate the rpi Droid plugin from HumanLayer's upstream rpi plugin.

Regenerates phase skills (SKILL.md + references/) and droids/. The orchestrator
skill's SKILL.md (skills/rpi/SKILL.md), shared/*.md, output-styles/, and the
show-me and effect-program-design skills are hand-maintained
and only copied, never generated.

Usage: python3 scripts/sync-rpi.py [path/to/humanlayer-skills/plugins/rpi]
"""

import json
import re
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLUGIN = REPO / "plugins" / "rpi"
SHARED = PLUGIN / "shared"
DEFAULT_UPSTREAM = Path.home() / "projects" / "humanlayer-skills" / "plugins" / "rpi"

INTERVIEW_NOTE = (
    "This phase is an interview. Run every question through `AskUser`, one decision "
    "per call, and wait for each answer. Approvals the process requires also go through `AskUser`."
)

PHASES = [
    {
        "name": "rpi-research-questions",
        "title": "Research Questions",
        "summary": "writes focused research questions about the current system, plus the original request document",
        "modes": [("create", "create-research-questions"), ("iterate", "iterate-research-questions")],
        "note": "Create mode starts a task: save the original request from your prompt with the request template, then the questions. Ask the user to confirm or refine the question scope with `AskUser` before handing off.",
    },
    {
        "name": "rpi-research",
        "title": "Research",
        "summary": "answers the research questions from live code, tests, and docs using the research droids",
        "modes": [("create", "create-research"), ("iterate", "iterate-research")],
        "note": "Fan out to the research droids in parallel, then verify their findings against live code before writing.",
    },
    {
        "name": "rpi-design-discussion",
        "title": "Design Discussion",
        "summary": "settles product and technical choices with the user in one design discussion document",
        "modes": [("create", "create-design-discussion"), ("iterate", "iterate-design-discussion")],
        "note": INTERVIEW_NOTE,
    },
    {
        "name": "rpi-prd",
        "title": "PRD",
        "summary": "interviews the user to define the product problem, success measure, and solution in a PRD",
        "modes": [("create", "create-prd"), ("iterate", "iterate-prd")],
        "note": INTERVIEW_NOTE,
    },
    {
        "name": "rpi-tdd",
        "title": "TDD",
        "summary": "interviews the user to settle system design and then program design in a technical design document",
        "modes": [("create", "create-tdd"), ("iterate", "iterate-tdd")],
        "note": INTERVIEW_NOTE + " Get separate approvals for System Design and Program Design.",
    },
    {
        "name": "rpi-structure-outline",
        "title": "Structure Outline",
        "summary": "writes an ordered implementation outline with phases, affected files, and checks",
        "modes": [("create", "create-structure-outline"), ("iterate", "iterate-structure-outline")],
        "note": "Ask the user to review the scope and phase order with `AskUser` before handing off.",
    },
    {
        "name": "rpi-implement",
        "title": "Implementation",
        "summary": "implements the agreed change from the outline or design documents, or applies implementation feedback",
        "modes": [("implement", "implement-outline"), ("iterate", "iterate-implementation")],
        "note": (
            "Code changes go in the repository working tree. Launch `outline-implementer-agent` for the code, "
            "passing the space ID, task path, and local copy directory. Update outline checkboxes and phase "
            "markers with `droid space doc edit`. Ask the user for manual verification results with `AskUser` "
            "when the process pauses for them."
        ),
    },
]

SHARED_REFS = ["workflow.md", "show-me.md"]

DROID_TOOLS = {
    "codebase-locator": '["Read", "Grep", "Glob", "LS", "Execute"]',
    "codebase-analyzer": '["Read", "Grep", "Glob", "LS", "Execute"]',
    "codebase-pattern-finder": '["Read", "Grep", "Glob", "LS", "Execute"]',
    "web-search-researcher": '["WebSearch", "FetchUrl", "Read", "Grep", "Glob", "LS", "Execute"]',
    "outline-implementer-agent": None,  # all tools
}

DROID_DESCRIPTIONS = {}

READER_SPACE_NOTE = """
## Mission Droid Space

RPI documents live in the Mission's droid space, not the repository. The parent gives you the space ID, the task path (for example `rpi/task-retries/`), and the local copy directory. Read documents from the local copy with your normal read tools. Never write, edit, or delete documents, and never write under the local copy directory. Report findings in your final response; the parent agent writes the documents.
"""

IMPLEMENTER_SPACE_NOTE = """
## Mission Droid Space

RPI documents live in the Mission's droid space, not the repository. The parent gives you the space ID, the task path (for example `rpi/task-retries/`), and the local copy directory. Code changes go in the repository working tree as usual.

- Read documents from the local copy directory with your normal read tools. Never write under it with file tools or shell commands.
- Update progress markers in the outline with `droid space doc edit <spaceId> <document path> --old "<exact line>" --new "<updated line>"`. The old text must match exactly once; include more of the line to make it unique. Use `--old-file` and `--new-file` for multi-line text.
- On `old_text_not_found`, `old_text_ambiguous`, or `revision_conflict`, nothing was published. Read the document again and retry once. On `unknown_outcome`, run `droid space sync <spaceId>` and read before deciding.
- Never delete documents or create new RPI documents. Report anything else that needs recording to the parent.
"""

SKILL_TEMPLATE = """---
name: {name}
description: Run the RPI {title} phase as a Missions 2.0 agent. This phase {summary}, storing documents in the Mission's droid space. Use when a Mission orchestrator tells you to follow {name}.
---

# RPI: {title}

You are one phase agent in an RPI Mission. This phase {summary}. Run only this phase, then hand off to the orchestrator.

`$SKILLBASE` means the directory containing this `SKILL.md`.

## Before You Start

1. Read `$SKILLBASE/references/rpi-skill.md` in full. It is HumanLayer's original `rpi` skill, copied verbatim, and its rules for documents, frontmatter, numbering, next steps, and subagents still apply.
2. Read `$SKILLBASE/references/droid-space.md` and `$SKILLBASE/references/mission-overrides.md` in full. They override `rpi-skill.md` and the process wherever those talk about task directories, saving files, asking the user, subagents, or next commands.
3. Take the task path, mode, flow, original request, and user feedback from your prompt.
4. Confirm the space ID and Documents directory from the **Shared context space** section of your system prompt. Stop and report if there is none.

## Run the Process

{mode_table}

Without a mode in your prompt, {mode_default}

Follow the selected process in order. Read `$SKILLBASE/references/workflow.md` when choosing the next phase.

{note}

## Store Documents in the Droid Space

- Publish every RPI document with `droid space doc write <spaceId> rpi/<task-slug>/<file> --file <scratch>`, writing the body to a scratch file outside the local copy first.
- Update documents with `droid space doc edit`, or with `doc get --path` followed by `doc write --document-id --expected-version`.
- Read documents from the local copy at `<Documents directory>/rpi/<task-slug>/`, and never write under it.
- Never use `.agents/artifacts/` or the repository for RPI documents.

## Hand Off

Send the orchestrator the handoff described in `mission-overrides.md` with `SendMessage`, and repeat it as your final response.
"""


def mode_table(modes):
    rows = ["| Mode | Process |", "| --- | --- |"]
    for mode, step in modes:
        rows.append(f"| `{mode}` | `$SKILLBASE/references/{step}/process.md` |")
    return "\n".join(rows)


def mode_default(phase):
    first, second = phase["modes"][0][0], phase["modes"][1][0]
    if phase["name"] == "rpi-implement":
        return f"use `{second}` when the prompt carries feedback on code already implemented, otherwise `{first}`."
    return f"use `{second}` when the task path already holds this phase's document, otherwise `{first}`."


def copy_refs(upstream_refs, dest, steps):
    refs = dest / "references"
    if refs.exists():
        shutil.rmtree(refs)
    refs.mkdir(parents=True)
    for step in steps:
        shutil.copytree(upstream_refs / step, refs / step)
    for name in SHARED_REFS:
        shutil.copy2(upstream_refs / name, refs / name)
    for shared in sorted(SHARED.glob("*.md")):
        shutil.copy2(shared, refs / shared.name)
    shutil.copy2(upstream_refs.parent / "SKILL.md", refs / "rpi-skill.md")


def build_phase(upstream_refs, phase):
    dest = PLUGIN / "skills" / phase["name"]
    steps = [step for _, step in phase["modes"]]
    # iterate-implementation and iterate-research-questions read sibling steps via $SKILLBASE
    copy_refs(upstream_refs, dest, steps)
    (dest / "SKILL.md").write_text(
        SKILL_TEMPLATE.format(
            name=phase["name"],
            title=phase["title"],
            summary=phase["summary"],
            mode_table=mode_table(phase["modes"]),
            mode_default=mode_default(phase),
            note=phase["note"],
        )
    )


def build_orchestrator(upstream_refs):
    refs = PLUGIN / "skills" / "rpi" / "references"
    if refs.exists():
        shutil.rmtree(refs)
    refs.mkdir(parents=True)
    for name in ["workflow.md", "workflow-choice.md"]:
        shutil.copy2(upstream_refs / name, refs / name)
    shutil.copy2(SHARED / "droid-space.md", refs / "droid-space.md")
    shutil.copy2(upstream_refs.parent / "SKILL.md", refs / "rpi-skill.md")


def convert_droid(src, dest_dir):
    text = src.read_text()
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not match:
        raise SystemExit(f"no frontmatter in {src}")
    front, body = match.groups()
    name = re.search(r"^name:\s*(.+)$", front, re.M).group(1).strip()
    desc = DROID_DESCRIPTIONS.get(name)
    if desc is None:
        desc = re.search(r'^description:\s*"?(.*?)"?\s*$', front, re.M).group(1).replace('\\"', '"')
    tools = DROID_TOOLS[name]

    body = re.sub(r"\bWebFetch\b", "FetchUrl", body)
    body = re.sub(r"\bBash\b", "Execute", body)
    if name == "outline-implementer-agent":
        body = body.replace(
            "1. Discover all workflow documents: `ls -La <task-directory>`",
            "1. Discover all workflow documents: list `<local copy directory>/<task path>`",
        )
        body = body.replace(
            "Use the Edit tool to make these updates.",
            "Make these updates with `droid space doc edit` (see Mission Droid Space below).",
        )
        body = body.replace(
            "3. Update checkboxes in the outline using Edit",
            "3. Update checkboxes in the outline using `droid space doc edit`",
        )
        body = body.rstrip() + "\n" + IMPLEMENTER_SPACE_NOTE
    else:
        body = body.rstrip() + "\n" + READER_SPACE_NOTE

    lines = ["---", f"name: {name}", f"description: {json.dumps(desc, ensure_ascii=False)}", "model: inherit"]
    if tools:
        lines.append(f"tools: {tools}")
    lines.append("---")
    (dest_dir / f"{name}.md").write_text("\n".join(lines) + "\n\n" + body.lstrip("\n"))


def main():
    upstream = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_UPSTREAM
    upstream_refs = upstream / "skills" / "rpi" / "references"
    if not upstream_refs.is_dir():
        raise SystemExit(f"upstream references not found: {upstream_refs}")

    for phase in PHASES:
        build_phase(upstream_refs, phase)
    build_orchestrator(upstream_refs)

    droids = PLUGIN / "droids"
    if droids.exists():
        shutil.rmtree(droids)
    droids.mkdir(parents=True)
    for src in sorted((upstream / "agents").glob("*.md")):
        convert_droid(src, droids)

    print(f"generated {len(PHASES)} phase skills and {len(list(droids.glob('*.md')))} droids in {PLUGIN}")


if __name__ == "__main__":
    main()
