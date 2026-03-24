## Why

The Hugo theme (`extranix-options-search`) is a git submodule pinned to a specific commit. When fixes are pushed to the theme repo, the scheduled daily deployment still uses the old pinned commit. Since both repos are maintained by the same person and are tightly coupled, the submodule pin adds friction without providing safety.

## What Changes

- Add a step to the GitHub Actions workflow that updates the theme submodule to the latest commit from its default branch before building the Hugo site.
- The pinned submodule reference in the repo remains unchanged — the update happens only at deploy time.

## Capabilities

### New Capabilities
- `auto-theme-update`: Automatically fetch the latest theme commit during CI deployment, removing the need to manually bump the submodule pointer.

### Modified Capabilities

(none)

## Impact

- **File**: `.github/workflows/update.yml` — one new workflow step added after the checkout step.
- **Deployment behavior**: The deployed site will always reflect the latest theme, rather than the pinned submodule commit.
- **Local development**: No change — local builds still use whatever submodule commit is checked out.
