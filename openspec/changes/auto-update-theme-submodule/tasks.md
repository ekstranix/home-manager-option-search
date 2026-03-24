## 1. Workflow Update

- [x] 1.1 Add `git submodule update --remote themes/extranix-options-search` step to `.github/workflows/update.yml` immediately after the `actions/checkout@v4` step
- [x] 1.2 Verify the new step is positioned before all `extract-options` and `Build Hugo` steps
