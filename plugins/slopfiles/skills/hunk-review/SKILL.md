---
name: hunk-review
description: Interacts with live Hunk diff review sessions via CLI. Inspects review focus, navigates files, hunks, and exact lines, reloads session contents, adds inline review comments, and paints attention marks on character ranges. Use when the user has a Hunk session running or wants to review diffs interactively.
---

# hunk-review

1. Check that Hunk is installed with `command -v hunk`. If it prints nothing, Hunk isn't installed: ask the user, then install it by following `references/install.md`.
2. Read `references/hunk-review-skill.md` and follow it. That file is the upstream `hunk-review` skill, copied verbatim from [modem-dev/hunk](https://github.com/modem-dev/hunk/blob/main/packages/hunk/skills/hunk-review/SKILL.md) (`packages/hunk/skills/hunk-review/SKILL.md`).
