# Install Hunk

Source: https://www.hunk.dev/docs/start/install/ (Hunk is MIT-licensed, by Modem Labs).

Hunk is not installed when `hunk` is not on PATH (`command -v hunk` prints nothing). Ask the user before installing it, then use the first method that fits the machine.

Hunk ships prebuilt binaries for macOS (arm64, x64), Linux (arm64, x64; glibc), and Windows (x64). On x86-64 it needs a CPU with SSE4.2.

## macOS and Linux: install script (default)

```bash
curl -fsSL https://hunk.dev/install.sh | sh
hunk --version
```

The script installs into `~/.hunk` (binary at `~/.hunk/bin/hunk`, with the bundled agent skills beside it) and adds `~/.hunk/bin` to PATH in the shell startup file. A shell that is already running won't see the new PATH, so call `~/.hunk/bin/hunk` directly or start a new shell.

Useful options:

| Option | Effect |
| --- | --- |
| `HUNK_VERSION=0.19.0` (or `sh -s -- 0.19.0`) | Install an exact release. |
| `HUNK_INSTALL_DIR=<dir>` | Install into a dedicated directory instead of `~/.hunk`. |
| `--no-modify-path` (or `HUNK_NO_MODIFY_PATH=1`) | Leave shell startup files alone. |
| `--force` | Install even though another Hunk exists. The installer refuses a second install by default and lists the competing paths. |

## Other methods

| Method | Command | Notes |
| --- | --- | --- |
| Homebrew | `brew install hunk` | Remove the old `modem-dev/tap/hunk` formula first if present. |
| npm | `npm install --global hunkdiff` | Needs Node.js 22+. Exposes `hunk` and `hunkdiff`. Works on Windows. |
| mise | `mise use -g hunk` | macOS, Linux, and Windows (mise 2026.8.6+ on Windows). |
| Nix | `nix build` in a Hunk clone | See the repository's `nix/README.md`. |

## Verify

```bash
hunk --help              # prints "Usage: hunk <command> [options]"
hunk skill show hunk-review
```

If the shell can't find `hunk`, add the global npm, Homebrew, mise, or `~/.hunk/bin` directory to PATH and open a new shell.

## Update

On Hunk 0.20 and newer, `hunk update` moves npm, Homebrew, and install-script installs to the newest release (`hunk update --check` only checks). mise and Nix installs update through their own tools (`mise up hunk`, your Nix configuration).

## When Hunk can't be installed

`references/hunk-review-skill.md` is a copy of the published skill (https://www.hunk.dev/docs/hunk-review-skill.md). It tracks the newest Hunk release, so prefer `hunk skill show hunk-review` whenever Hunk is installed.
