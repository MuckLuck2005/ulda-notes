# Production deployment

## Project type
ULDA Notes is a static landing page deployed via GitHub Pages.

## Infrastructure overview
The current implementation does not use an application server, database server, cache server or separate file storage service. The project consists of static files stored in the GitHub repository and published through GitHub Pages.

## Infrastructure components
- GitHub repository
- GitHub Pages
- Static files:
  - `index.html`
  - `css/style.css`
  - `js/main.js`
  - `assets/*`
- Documentation:
  - `docs/`
  - `generated-docs/`

## Hardware requirements
Since the project is a static website, minimal hardware resources are sufficient for local deployment preparation.

### Minimum requirements
- CPU: 1 core
- RAM: 1 GB
- Disk space: 1–2 GB free

### Recommended requirements
- CPU: 2 cores
- RAM: 2 GB
- Disk space: 5 GB free

## Required software
- Git
- Node.js 20+
- npm
- Modern web browser
- Access to GitHub repository settings

## Network requirements
- Internet connection for cloning and pushing the repository
- HTTPS access to GitHub and GitHub Pages
- Access to the public deployment URL

## Server and environment configuration
For the current version of the project, production hosting is provided by GitHub Pages. No dedicated web server or application server configuration is required.

### Required GitHub Pages settings
1. Open the repository on GitHub.
2. Go to **Settings**.
3. Open the **Pages** section.
4. In **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Save the settings.

## Code deployment procedure
1. Make sure the latest stable code is merged into the `main` branch.
2. Pull the latest version of the repository:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Install project dependencies:
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
6. Verify that GitHub Pages is configured correctly.
7. Wait until GitHub Pages publishes the latest version.

## Verification of successful deployment
A deployment is considered successful if:
- the GitHub Pages URL opens in the browser;
- the page loads without missing styles;
- JavaScript works correctly;
- navigation links scroll to the correct sections;
- images, icons and assets are displayed correctly;
- the public site returns a successful response.

## Deployment URL
The current production URL is expected to be:
`https://muckluck2005.github.io/ulda-notes/`

## Notes
- Database configuration is not required for the current project version.
- No data migration is required for the current project version.
- No separate cache layer is used.
