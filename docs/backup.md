# Backup procedure

## Purpose
This document describes the backup strategy and restoration process for the ULDA Notes project.

## Project type
ULDA Notes is currently a static site deployed through GitHub Pages. The project does not use a separate application server or database in the current implementation, so backup procedures are focused on source code, configuration and generated artifacts.

## Backup strategy
The project uses repository-based backup combined with release-oriented archives.

Main principles:
- keep the GitHub repository as the primary source of truth;
- create backup archives before major updates;
- preserve stable tags and commit hashes;
- store generated documentation separately when needed.

## What should be backed up
The following items should be backed up:

### Source code
- all project files in the repository
- `index.html`
- `css/`
- `js/`
- `assets/`

### Documentation
- `README.md`
- `docs/`
- `generated-docs/`
- `generated-docs.zip`

### Configuration
- `package.json`
- `package-lock.json`
- `jsdoc.json`
- `eslint.config.mjs`
- `stylelint.config.mjs`
- `.htmlhintrc`
- `tsconfig.json`

### Release information
- stable tags
- release commit hashes
- deployment URL reference

## Types of backups
For this project the following backup types are recommended:

- **Full backup** — full ZIP archive of the repository
- **Incremental backup** — archive only files changed since the previous stable release
- **Differential backup** — archive files changed since the last full backup

For student project usage, a full backup before every major update is sufficient.

## Backup frequency
Recommended backup schedule:
- before every production update;
- before major documentation changes;
- before repository restructuring;
- after creating important stable tags.

## Storage and retention
Backups should be stored in at least one additional location outside the working directory.

Recommended storage options:
- local archive folder on the workstation;
- cloud storage;
- external drive;
- GitHub repository history and tags.

Recommended retention:
- keep at least the latest 3 full backups;
- keep backups associated with stable tags;
- keep the latest generated documentation archive.

## Backup procedure
Perform backups in the following order:

1. Make sure the repository is in a clean state:
   ```bash
   git status
   ```
2. Save the current stable tag or commit hash:
   ```bash
   git log --oneline -1
   git tag
   ```
3. Create or update the generated documentation archive if needed:
   ```bash
   npm run docs:generate
   npm run docs:archive
   ```
4. Create a ZIP archive of the repository.
5. Save the archive in a separate safe location.
6. Record the backup date and associated commit/tag.

## Integrity verification
To verify that the backup is usable:
- make sure the ZIP archive opens correctly;
- verify that key files are present;
- verify that documentation files are included;
- compare the backup commit hash or tag with the production version;
- optionally extract the archive and run:
  ```bash
  npm install
  npm run check
  ```

## Restore procedure
### Full restore
1. Extract the saved backup archive.
2. Open the restored project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run validation:
   ```bash
   npm run check
   ```
5. If needed, redeploy the restored version to GitHub Pages.

### Selective restore
If only specific files are needed:
1. Open the backup archive.
2. Extract the required files or folders.
3. Replace the corresponding files in the working copy.
4. Run `npm run check` to verify consistency.

## Restore testing
After restoration, verify:
- the site opens locally;
- navigation works correctly;
- styles and assets are loaded;
- generated documentation is accessible if restored;
- the public deployment can be reproduced if needed.

## Automation notes
Backup automation can be implemented later through scripts placed in `docs/scripts/`. For the current project version, manual backup before each major deployment is acceptable.

## Notes
- Database backup is not required in the current implementation.
- User data backup is not required because the current project is static.
- System log backup is not required for the current hosting model.
