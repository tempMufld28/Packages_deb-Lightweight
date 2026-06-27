<h1 align="center">Lightweight-apps</h1>
<p align="center"><strong>Turn any webpage into a lightweight desktop app — Windows &amp; Linux, ~5&nbsp;MB each</strong></p>
<div align="center">
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/releases" target="_blank">
    <img alt="GitHub downloads" src="https://img.shields.io/github/downloads/tempMufld28/Packages_deb-Lightweight/total.svg?style=flat-square"></a>
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/commits" target="_blank">
    <img alt="GitHub commit" src="https://img.shields.io/github/commit-activity/m/tempMufld28/Packages_deb-Lightweight?style=flat-square"></a>
    <a href="https://github.com/tempMufld28/Packages_deb-Lightweight/issues?q=is%3Aissue+is%3Aclosed" target="_blank">
    <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/tempMufld28/Packages_deb-Lightweight.svg?style=flat-square"></a>
</div>

## What is this?

A hard fork of [Pake](https://github.com/tw93/Pake) focused on a leaner, opinionated distribution model:

- **Windows & Linux only** — macOS support has been completely removed. No Apple certificates, no notarization, no universal binaries. This keeps CI fast and the codebase simple.
- **~5 MB per app** — built with Tauri v2 (Rust) on the system webview (WebView2 on Windows, WebKitGTK on Linux), roughly 20× smaller than Electron.
- **Curated app roster** — 8 popular web apps packaged with correct User-Agent spoofing and bundle identifiers: WhatsApp, Spotify, Teams, YT Music, Twitch, Outlook, Office365, Telegram.
- **`.deb` + `.rpm` + `.msi`** — AppImage dropped, RPM added. Three installer formats total.
- **Dynamic download site** — a GitHub Pages site (`/pages`) auto-resolves the right installer for the visitor's OS from the latest release assets.

> **Linux DRM note:** Spotify and YT Music on Linux use WebKitGTK, which has no native Widevine support. Premium / DRM-protected playback will be unavailable on Linux builds. Windows builds work fully via WebView2.

## Download

Ready-made installers for all 8 apps are on the **[GitHub Releases](https://github.com/tempMufld28/Packages_deb-Lightweight/releases)** page, or visit the **[download site](https://tempMufld28.github.io/Packages_deb-Lightweight/)** which auto-detects your OS.

| App       | Windows (.msi) | Linux (.deb) | Linux (.rpm) |
| --------- | -------------- | ------------ | ------------ |
| WhatsApp  | ✅             | ✅           | ✅           |
| Spotify   | ✅             | ✅ ⚠️        | ✅ ⚠️        |
| Teams     | ✅             | ✅           | ✅           |
| YT Music  | ✅             | ✅ ⚠️        | ✅ ⚠️        |
| Twitch    | ✅             | ✅           | ✅           |
| Outlook   | ✅             | ✅           | ✅           |
| Office365 | ✅             | ✅           | ✅           |
| Telegram  | ✅             | ✅           | ✅           |

⚠️ = degraded DRM playback on Linux (no Widevine in WebKitGTK).

## Command-Line Packaging

![Pake](https://raw.githubusercontent.com/tw93/static/main/pake/pake1.gif)

```bash
# Install CLI
pnpm install -g pake-cli

# Basic usage - automatically fetches website icon
pake https://github.com --name GitHub

# Advanced usage with custom options
pake https://weekly.tw93.fun --name Weekly --width 1200 --height 800
```

First-time packaging requires environment setup and may be slower; subsequent builds are fast. For complete parameter documentation, see [CLI Usage Guide](docs/cli-usage.md).

## Development

Requires Rust `>=1.85` and Node `>=22`. Platform prerequisites:

- **Windows**: Visual Studio Build Tools with MSVC
- **Linux**: `build-essential`, `libwebkit2gtk-4.1`, and companion libraries (see `.github/actions/setup-env/action.yml` for the full apt list)

```bash
# Install dependencies
pnpm i

# Local development
pnpm run dev

# Build application
pnpm run build

# Build CLI (regenerates dist/cli.js)
pnpm run cli:build
```

For style customization, feature enhancement, and advanced features, see [Advanced Usage Documentation](docs/advanced-usage.md).

## Release & CI

| Workflow               | Purpose                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `release.yml`          | Triggered by `V*` tags. Builds 8 apps × 2 OS in parallel (16 jobs), uploads `.msi`/`.deb`/`.rpm` to the GitHub Release. |
| `deploy-pages.yml`     | Deploys the `/pages` download site to GitHub Pages on every push to `main` that touches `pages/**`.                     |
| `quality-and-test.yml` | Auto-format, Rust quality checks, and CLI/build validation across Linux and Windows.                                    |
| `npm-publish.yml`      | Publishes `pake-cli` to npm via Trusted Publishing on `V*` tags.                                                        |

### Version management

Four files must stay in sync for every release:

| File                        | Field                        |
| --------------------------- | ---------------------------- |
| `package.json`              | `"version"`                  |
| `src-tauri/Cargo.toml`      | `version` under `[package]`  |
| `src-tauri/Cargo.lock`      | `version` for package `pake` |
| `src-tauri/tauri.conf.json` | `"version"`                  |

Tag format: `V0.x.x` (uppercase V).

## Download Site (`/pages`)

The `pages/` directory contains a static site served by GitHub Pages:

- `pages/index.html` — landing page with per-app download cards
- `pages/download-resolver.js` — fetches the latest GitHub Release assets, detects the visitor's OS, and routes Windows → `.msi`, Linux → `.deb` by default

Deployment is automated via `.github/workflows/deploy-pages.yml`. To enable it, set **Settings → Pages → Source: GitHub Actions** (no branch selection needed — the workflow handles it).

## Acknowledgements

This project is a hard fork of [Pake](https://github.com/tw93/Pake) by [Tw93](https://github.com/Tw93). The original Tauri-based packaging mechanism, injected JS/CSS, and CLI design are all his work. Lightweight-apps narrows the scope to Windows & Linux and rebrands the distribution.

## License

GPL-3.0, see [LICENSE](./LICENSE) and the [Pake Output Exception](./LICENSE-EXCEPTION); apps you build with this tool are entirely yours to use and distribute. This fork is renamed to avoid confusion with the original Pake project.
