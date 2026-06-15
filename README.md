# Homehub

Personal dashboard with site health monitoring. Single Go binary, ~10MB, ~15MB RAM.

## Quick start

```bash
cp config.example.json config.json   # edit config.json to add your own sites
make build
./homehub
# → http://localhost:8080
```

## Edit mode

Click the edit icon (bottom-right) to enter layout configuration mode:
- **Drag** cards to reorder
- **Add** sites via the dashed "ADD SERVICE" button in each category
- **Delete** user-added sites via the × button
- Click **Save Layout** or the check button to exit

All customizations are saved per-browser (localStorage). The server-side `config.json` defines the default layout.

## Config

Edits to `config.json` are picked up automatically — no restart needed.

- `search.engines` — search engines switchable by typing the prefix (e.g. `/g` for Google)
- `categories[].apps[].icon` — any [Material Symbol](https://fonts.google.com/icons) name
- `categories[].apps[].label` — short uppercase label shown below the card title
- `theme` — CSS color values applied as design tokens

### Icon reference

Common Material Symbols: `dns`, `security`, `deployed_code`, `live_tv`, `tv`, `movie`, `play_circle`, `cloud`, `storage`, `home_iot_device`, `public`, `rss_feed`, `download`, `bookmark`, `code`, `terminal`, `database`, `hub`, `router`, `wifi`, `settings`, `monitoring`, `analytics`

## Build

```bash
make build        # frontend + Go binary
make dev          # dev mode with hot reload (Vite proxy to Go backend)
make build-linux  # cross-compile for Proxmox
```

## Docker

```bash
docker build -t homehub .
docker run -d -p 8080:8080 -v ./config.json:/config.json homehub
```

## Architecture

```
Browser                       Go binary (~10MB, ~15MB RAM)
  │                                    │
  ├─ GET / ──────────────────────────► serves embedded React SPA
  ├─ GET /api/config ────────────────► returns config.json (live-reloaded)
  ├─ GET /api/status ────────────────► returns health check results
  │                                    │
  │                              health checker goroutine (60s interval)
  │                              concurrent HEAD requests to all sites
```

- **Go** backend — single static binary, no runtime dependencies
- **React** frontend — embedded in the binary at compile time via `//go:embed`
- **config.json** — server-side canonical config, re-read on every request
- **localStorage** — per-browser drag order, user-added sites, theme preference
