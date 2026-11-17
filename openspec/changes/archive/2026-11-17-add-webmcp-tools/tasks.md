# Tasks

## 1. Local environment

- [x] 1.1 Run `git submodule update --init themes/extranix-options-search` and verify `ls themes/extranix-options-search/layouts` shows `index.html`
- [x] 1.2 Run `hugo server` and verify the site loads at `localhost:1313` with the option table filled and no console errors
- [x] 1.3 In DevTools run `typeof document.modelContext` and `typeof navigator.modelContext`, record which is available, and if both are `undefined` enable `chrome://flags/#enable-webmcp-testing` and re-check

## 2. Module and wiring

- [x] 2.1 Create `static/js/webmcp.js` that resolves the model context from `document.modelContext` or `navigator.modelContext` and returns silently when absent, and verify a page load with the API unavailable produces no console output and an unchanged table
- [x] 2.2 Add the `<script defer src="js/webmcp.js"></script>` line to `params.custom_head_scripts` in `config.yaml` and verify the served page source and `curl -s localhost:1313/js/webmcp.js` both show the module
- [x] 2.3 Add the readiness promise that resolves when `window.allOptions` exists, polls every 100 ms, and gives up after 15 seconds, and verify with a temporary `console.log` that it resolves after the data request completes and does not block rendering

## 3. Tools

- [x] 3.1 Register `search_options` with a required `query`, optional `limit` between 1 and 25 defaulting to 10, set the search input, call `window.searchOptions(query)`, and verify `executeTool` with `hyprland` returns at most 10 records in the same order the page table shows
- [x] 3.2 Build the compact record shape (title, type, default, declaration names, first sentence description capped at 200 characters, permalink) and verify a returned record has no HTML markup and no newlines
- [x] 3.3 Register `get_option` with an exact `title` and verify `executeTool` for `programs.git.enable` returns the full record and that an invented title returns an explicit not found result
- [x] 3.4 Include the loaded release and the option count in the JSON envelope of both tools and verify against `document.getElementById('releaseSelect').value`
- [x] 3.5 Set `readOnlyHint: true` and `untrustedContentHint: true` on both tools and verify `await document.modelContext.getTools()` shows both annotations

## 4. Integration checks

- [x] 4.1 Verify a normal human search still works for three queries, that the table, result count, and modal all behave as before, and that the agent triggered search shows its query in the search input
- [x] 4.2 Verify a returned permalink opens the site with that option as the only result row

## Workflow follow-up

- Archive the change after review.
