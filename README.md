# cricsheet-mcp

A small Model Context Protocol (MCP) server that loads cricsheet match data and exposes tools for stats.

## Setup

```bash
npm install
npm run build
```

## Running

- Development (auto-reload via `tsx`):
  ```bash
  npm run dev
  ```

- Production (build + run):
  ```bash
  npm run build
  npm start
  ```

## Claude Desktop

The repo includes `claude_desktop_config.json` configured to point to the built server at `dist/index.js`.

## Data

Match JSON data should live under `data/`.

## Notes

- If `data/` is empty, run the `download_cricket_data` tool via MCP or add JSON manually.
