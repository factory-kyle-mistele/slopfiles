# slopfiles

General-purpose skills that don't belong to the `rpi` plugin.

| Skill | What it does | Source |
| --- | --- | --- |
| `prose` | Writing guidelines for prose a person will read: short, plain answers with precise names, plus Orwell's six rules. Model-invocable. | Hand-maintained in this repo. |
| `effect-program-design` | Design, write, review, and test production Effect v4 programs. | `~/projects/dotfiles`; see its `ATTRIBUTION.md`. |
| `hunk-review` | Drives a live [Hunk](https://www.hunk.dev) diff review session from the CLI. | [modem-dev/hunk](https://github.com/modem-dev/hunk) `.agents/skills/hunk-review` (MIT), plus local install references. |
| `bro` | `/bro` restates the last message in plain language. User-invoked only. | [backnotprop/bro](https://github.com/backnotprop/bro) `skills/bro`, verbatim. |

## hunk-review

`SKILL.md` is upstream's pointer file, copied verbatim with one added paragraph at the end. The pointer loads the real instructions from the installed `hunk` binary (`hunk skill show hunk-review`), so they always match the Hunk version.

- `references/install.md`: how to install Hunk when `hunk` is not on PATH, from https://www.hunk.dev/docs/start/install/.
- `references/hunk-review-skill.md`: verbatim copy of the published skill (https://www.hunk.dev/docs/hunk-review-skill.md), used only when Hunk can't be installed.

## Install

```bash
droid plugin marketplace add https://github.com/factory-kyle-mistele/slopfiles
droid plugin install slopfiles@slopfiles --scope user
```
