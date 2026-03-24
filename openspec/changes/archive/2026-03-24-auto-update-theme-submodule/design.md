## Context

The deployment workflow (`.github/workflows/update.yml`) runs daily and on push. It checks out the repo with `submodules: recursive`, which pins the theme to whatever commit SHA is recorded in the repo's tree. The theme repo (`hugo-theme-extranix-options-search`) is maintained by the same person and changes there should be reflected immediately in the next deploy.

## Goals / Non-Goals

**Goals:**
- Ensure the deployed site always uses the latest theme from the theme repo's default branch.
- Require zero manual intervention when a theme fix is pushed.

**Non-Goals:**
- Changing how the submodule works locally (developers still use the pinned commit).
- Adding version pinning, tagging, or release management to the theme.
- Automating submodule pointer bumps in the repo itself.

## Decisions

**Add `git submodule update --remote` step after checkout**

Place a single workflow step immediately after `actions/checkout@v4` that runs:
```
git submodule update --remote themes/extranix-options-search
```

Alternatives considered:
- *Dependabot / Renovate for submodule bumps*: Adds PR overhead for a tightly-coupled, single-maintainer setup. Rejected for being heavier than needed.
- *Replace submodule with git subtree or direct checkout*: Would change the local dev workflow. Not worth the disruption for this goal.
- *Workflow in theme repo that PRs a submodule bump*: Same PR overhead as Dependabot approach.

## Risks / Trade-offs

- **A broken theme commit deploys automatically** → Acceptable risk since the same maintainer controls both repos and can fix-forward quickly. If this becomes a problem later, branch protection or a build-test step in the theme repo can be added.
- **Local and deployed theme versions can diverge** → Already the case (local could be behind). No functional change in risk profile.
