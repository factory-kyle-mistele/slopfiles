# slopfiles

General-purpose skills that don't belong to the `rpi` plugin.

| Skill | What it does | Source |
| --- | --- | --- |
| `prose` | Writing guidelines for prose a person will read: short, plain answers with precise names, plus Orwell's six rules. Model-invocable. | Hand-maintained in this repo. |
| `effect-program-design` | Design, write, review, and test production Effect v4 programs. | `~/projects/dotfiles`; see its `ATTRIBUTION.md`. |
| `hunk-review` | Drives a live [Hunk](https://www.hunk.dev) diff review session from the CLI. | [modem-dev/hunk](https://github.com/modem-dev/hunk) `packages/hunk/skills/hunk-review` (MIT), plus an install reference. |
| `bro` | `/bro` restates the last message in plain language. User-invoked only. | [backnotprop/bro](https://github.com/backnotprop/bro) `skills/bro`, verbatim. |

## hunk-review

`SKILL.md` is ours and has two steps:

1. If `hunk` is not on PATH, install it with `references/install.md` (from https://www.hunk.dev/docs/start/install/).
2. Read and follow `references/hunk-review-skill.md`, the upstream skill copied verbatim from `packages/hunk/skills/hunk-review/SKILL.md` in modem-dev/hunk.

## Install

```bash
droid plugin marketplace add https://github.com/factory-kyle-mistele/slopfiles
droid plugin install slopfiles@slopfiles --scope user
```
