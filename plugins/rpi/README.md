# rpi

Runs [HumanLayer's RPI workflow](https://github.com/humanlayer/skills/tree/main/plugins/rpi) as a Factory Missions 2.0 Mission. The Mission orchestrator follows the `rpi` skill and starts one agent per phase. Each phase agent follows its phase skill, launches the research droids, interviews the user with `AskUser`, and stores RPI documents in the Mission's droid space under `rpi/<task-slug>/`.

Requires Missions 2.0, because the documents live in the Mission's shared space (`droid space`).

## Contents

| Path | What it is |
| --- | --- |
| `skills/rpi/` | Orchestrator skill: picks the task path and flow, launches phases, reviews between phases. Hand-written. |
| `skills/rpi-<phase>/` | Seven phase skills, each with create and iterate modes. Generated. |
| `output-styles/plain-and-brief.md` | "Plain and Brief" output style: short plain answers plus Orwell's six rules. Hand-written. Applies only to interactive CLI sessions, not Missions. |
| `skills/show-me/` | HumanLayer's `show-me` skill: diagrams, code-shape sketches, and HTML explainers. Copied verbatim from humanlayer/skills. |
| `skills/prose/` | Writing guidelines from the Plain and Brief output style, as a skill agents can invoke (`/prose`). Hand-maintained. |
| `skills/effect-program-design/` | Effect v4 program design skill. Copied verbatim from `~/projects/dotfiles`. |
| `droids/` | `codebase-locator`, `codebase-analyzer`, `codebase-pattern-finder`, `web-search-researcher`, `outline-implementer-agent`. Generated. |
| `shared/droid-space.md` | How phase agents read and write documents in the space. Copied into every phase skill. |
| `shared/mission-overrides.md` | How upstream RPI steps map to a Mission agent (AskUser, handoff, droids). Copied into every phase skill. |

## Install

```bash
droid plugin marketplace add ~/projects/slopfiles
droid plugin install rpi@slopfiles --scope user
```

## Use

Start `/missions` and ask the orchestrator to run RPI, for example: "Use the rpi skill to research, design, and implement retries for the task worker."

## Update From Upstream

Pull `~/projects/humanlayer-skills`, then regenerate the phase skills and droids:

```bash
python3 scripts/sync-rpi.py ~/projects/humanlayer-skills/plugins/rpi
```

Edit `shared/*.md`, `skills/rpi/SKILL.md`, `output-styles/`, or the templates in `scripts/sync-rpi.py`; generated files are overwritten on every sync.
