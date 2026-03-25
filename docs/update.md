# Update procedure

## Purpose
This document describes the production update procedure for the ULDA Notes project.

## Project type
ULDA Notes is currently deployed as a static site through GitHub Pages. Because of this, the update procedure does not require application server restart, database migration or cache invalidation.

## Preparation before update
Before updating the production version, the release engineer should:

1. Review the list of planned changes.
2. Identify the target commit, branch or release tag.
3. Verify that the `main` branch contains the intended production-ready state.
4. Confirm that GitHub Pages settings are still correct.
5. If needed, notify stakeholders about the upcoming update.

## Backup before update
Before deployment, create a backup of the current stable state.

Recommended actions:
1. Save the currently deployed commit hash or stable tag.
2. Create a ZIP archive of the current repository.
3. Keep a copy of:
   - `README.md`
   - `docs/`
   - `generated-docs.zip`
   - important configuration files

## Compatibility checks
Before updating the production version, verify that:
1. Dependencies are installed correctly:
   ```bash
   npm install
   ```
2. Project validation succeeds:
   ```bash
   npm run check
   ```
3. Documentation generation still works if the update affects documented code:
   ```bash
   npm run docs:generate
   ```

## Update process
Perform the update in the following order:

1. Switch to the main branch:
   ```bash
   git checkout main
   ```
2. Pull the latest code:
   ```bash
   git pull origin main
   ```
3. Install or refresh dependencies:
   ```bash
   npm install
   ```
4. Run validation checks:
   ```bash
   npm run check
   ```
5. Optionally preview the production-like version locally:
   ```bash
   npm run prod:preview
   ```
6. Push the final validated version to the production branch if required.
7. Wait for GitHub Pages to publish the new version.

## Post-update verification
After the update, verify the following:

- the public GitHub Pages URL opens successfully;
- the page structure is loaded correctly;
- styles are applied correctly;
- JavaScript behavior works;
- navigation links scroll to the expected sections;
- images, icons and documentation links are accessible.

## Downtime planning
For the current project version, planned downtime is usually not required because the deployment target is GitHub Pages and the project is static. However, a short publication delay may occur while GitHub Pages applies the update.

## Rollback procedure
If the update is unsuccessful, perform the following rollback steps:

1. Identify the previous stable commit or tag.
2. Revert the repository state to the last stable version.
3. Push the reverted version to the deployment branch.
4. Wait for GitHub Pages to publish the restored version.
5. Verify that the public site works correctly.

## Notes
- No database migration is required in the current project version.
- No application service restart is required.
- No cache service reset is required.
