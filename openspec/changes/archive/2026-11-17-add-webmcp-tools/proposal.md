# Proposal

## Why

Agents that help people write Home Manager configuration invent option names, and
this site already holds the canonical answer for roughly 3000 options per release.
Today an in browser agent can only reach that answer by scraping the DOM: find the
search input, type, wait for the debounce, read a table that is capped at 200 rows,
then click a row to open a jQuery modal. WebMCP lets the page declare the search and
lookup as tools instead, so the agent calls a schema checked function and gets
structured data.

## What Changes

- Add a WebMCP module loaded as progressive enhancement. It registers tools only
  when the browser exposes `document.modelContext` or `navigator.modelContext`, and
  does nothing in every other browser.
- Register `search_options`, which runs the existing search and returns a compact
  list of matching options.
- Register `get_option`, which returns one full option record by exact title.
- Load the module from this repository through the existing `custom_head_scripts`
  escape hatch, so the theme submodule stays untouched for this spike.
- Report the loaded release in tool results. Changing release is out of scope.

## Capabilities

### New Capabilities

- `webmcp-option-tools`: exposes Home Manager option search and lookup to browser
  agents through WebMCP tools, with graceful absence in browsers that do not
  implement the API.

### Modified Capabilities

None.

## Impact

- New file `static/js/webmcp.js`.
- One added line in `config.yaml` under `params.custom_head_scripts`.
- Reads the theme globals `allOptions`, `results`, and `searchOptions` from
  `script.js`, so it depends on the theme's current global surface.
- No build, data pipeline, CI, or runtime dependency changes.
- Experimental API surface: Chrome origin trial, feature gated, and not covered by
  any published standard yet.
