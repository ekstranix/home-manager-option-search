# auto-theme-update Specification

## Purpose
TBD - created by archiving change auto-update-theme-submodule. Update Purpose after archive.
## Requirements
### Requirement: Theme submodule is updated to latest before build
The CI workflow SHALL update the `themes/extranix-options-search` submodule to the latest commit from its default branch before building the Hugo site.

#### Scenario: Theme has new commits since pinned reference
- **WHEN** the scheduled or push-triggered workflow runs and the theme repo has commits newer than the pinned submodule reference
- **THEN** the workflow fetches the latest commit from the theme's default branch and uses it for the Hugo build

#### Scenario: Theme has no new commits
- **WHEN** the workflow runs and the pinned submodule reference is already the latest commit on the theme's default branch
- **THEN** the workflow proceeds normally with no change in behavior

### Requirement: Update step runs before any build steps
The submodule update step SHALL execute after checkout and before any build or option-extraction steps.

#### Scenario: Step ordering in workflow
- **WHEN** the workflow executes
- **THEN** the submodule update step runs after `actions/checkout@v4` and before the first `extract-options` step

