# Design

## Context

See `proposal.md` for motivation and `specs/webmcp-option-tools/spec.md` for the
behavior contract. The constraints that shape this design:

- All page JavaScript lives in the theme submodule `themes/extranix-options-search`,
  in `static/js/script.js` (476 lines, classic script, top level `var` globals) and
  `layouts/index.html`. This repository has no `layouts/` and no `static/js/`.
- The theme loads one data file per page load, `data/options-<release>.json`, about
  1.4 MB, through an `XMLHttpRequest`, then builds a JsSearch index and calls
  `docOnload()`.
- The escape hatch `params.custom_head_scripts` in `config.yaml` is injected into
  `<head>` and is already used for analytics. It is the only extension point that
  does not require a theme change.
- The theme submodule is not checked out in this working tree; the local site build
  needs `git submodule update --init` first.

Relevant theme globals after load: `allOptions` (array of records), `results` (last
search result array), `currentSet`, `search`, `searchInput`, `releaseSelect`, and
`searchOptions(query)`, which fills `results` and re-renders the table.

## Goals / Non-Goals

**Goals:**

- Prove the WebMCP API works against this data with the least possible blast radius.
- Keep every change inside this repository, so the spike is one revert away.
- Reuse the theme's real ranking rather than writing a second search.

**Non-Goals:**

- Reusable theme feature, published origin trial token, documentation page.
- Switching release from inside a tool.
- Automated browser test harness for the API.

## Decisions

### Placement: this repository, not the theme

A new `static/js/webmcp.js` is added here and loaded with one extra line in
`params.custom_head_scripts`. Hugo merges site `static/` over theme `static/`, so the
file serves at `/js/webmcp.js`.

Alternatives: putting the module in the theme is the architecturally right home, but
needs a commit and push in another repository plus a submodule bump before anything
can be tested. Copying `layouts/index.html` into this repository also works but forks
a 183 line layout that then drifts from the theme.

### Reuse `searchOptions` and let the tool drive the visible table

`execute` sets `searchInput.value` to the query, then calls `window.searchOptions(query)`
and slices `window.results`. This keeps a single ranking implementation, and it makes
the agent's action visible: the page shows the same result table a human would get.
The alternative, calling `search.search(query)` directly, avoids touching the UI but
skips the title and description sort that `searchOptions` applies, so the agent and
the human would see different orders.

### Register early, await readiness inside `execute`

Tools are registered as soon as the module runs. Each `execute` awaits a promise that
resolves when `window.allOptions` exists. The promise polls every 100 ms and gives up
after 15 seconds, resolving anyway, so a failed data request produces an empty answer
instead of a hanging tool call. Registering only after the data loads would hide the
tools from an agent that arrives during the initial 1.4 MB fetch, and the agent may
not revisit.

### Two tools, compact by default

`search_options` returns at most 25 records with title, type, default, declaration
names, a first sentence description of at most 200 characters with newlines
collapsed, and a permalink. `get_option` returns the full record for an exact title.
Descriptions in the source data run to several paragraphs, so a naive twenty record
search would return thousands of tokens for no benefit.

### Return JSON text

`execute` returns a JSON string, which is stable to parse and easy to eyeball in
DevTools. Results also carry the loaded release and the option count. Each record's
permalink is `?option=<title>&release=<release>`. The theme's own search is substring
based and ignores punctuation, so `?query=` cannot isolate one option: a query of
`programs.git.enable` matches twenty rows. The module therefore reads the `option`
parameter itself, waits for the data, and renders that single record. This lookup
sits outside the WebMCP feature check so the permalink works in every browser.

### Detect both API names

`document.modelContext` is the current name and `navigator.modelContext` appears in
older material. The module uses whichever exists and returns silently when neither
does.

## Risks / Trade-offs

- [API churn while the trial runs] -> all API contact is confined to one file, so
  adapting costs an edit in `webmcp.js` and nothing else.
- [Coupling to theme globals] -> `allOptions`, `results` and `searchOptions` are
  undocumented internals. A theme refactor can break the tools silently, and nothing
  on the page notices. Acceptable for a spike; a theme feature would need a documented
  seam.
- [Prompt injection from upstream documentation text] -> both tools set
  `untrustedContentHint`, output is JSON with HTML kept out, and descriptions are
  truncated to a single sentence.
- [No visible effect for almost all visitors] -> expected. Without the origin trial
  token the tools exist only for users on Chrome 149 or later with
  `chrome://flags/#enable-webmcp-testing` enabled.
- [Local data files stop at 24.05 while `config.yaml` lists 26.05] -> the tools report
  whatever release the page loaded. A release whose data file is missing leaves the
  page without data and the tools resolve after the timeout with an empty answer.

## Migration Plan

Add the file and the config line, then verify with `hugo server`. Reverting is deleting
the file and the line. Nothing is deployed by merging; the GitHub workflow builds and
publishes `pages-<branch>` as before.

## Open Questions

- Whether the spike earns a theme implementation with a documented seam and a params
  toggle. Deferrable, and it does not change the specs or the tasks here.
