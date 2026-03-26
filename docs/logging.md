# Logging and error handling

## Purpose
This document describes the logging and error-handling approach used in the ULDA Notes project.

## Project type
ULDA Notes is a static client-side web project. Because of this, logging is implemented on the frontend side in the browser environment.

## Logging library
The project uses `loglevel` as the base logging library. A custom wrapper in `js/logger.js` extends it with:
- unified log formatting;
- custom level mapping;
- error identifiers;
- session identifiers;
- localStorage persistence.

## Logging levels
The following levels are used in the project:
- `DEBUG` — detailed diagnostic information
- `INFO` — normal application events
- `WARNING` — suspicious but non-critical situations
- `ERROR` — functional errors
- `CRITICAL` — critical failures that prevent correct operation

## Log format
Each log entry includes:
- timestamp
- level
- module name
- message
- error ID (when applicable)
- session ID
- contextual information

## Log handlers
For the current project version, two log handlers are used:
1. **Console output** — for development-time diagnostics
2. **localStorage storage** — for preserving recent logs between sessions

## Log rotation
Because the project runs in the browser, file-based rotation is not applicable in the usual server-side form. As an alternative, a rotation-like mechanism is implemented by keeping only the latest 200 log entries in localStorage.

## Configurable minimum log level
The minimum log level can be changed without rebuilding the project.

Supported configuration methods:
1. URL parameter:
   `?logLevel=debug`
2. localStorage value:
   `ulda:log-level`

Default log level:
- `info`

## Logged events
The project logs:
- logger initialization
- application startup
- application session end
- navigation clicks
- smooth scroll actions
- missing target sections
- resource loading errors
- unhandled JavaScript errors
- unhandled Promise rejections
- 404 page opening

## Error handling strategy
The project includes:
- global `window.error` handling
- global `window.unhandledrejection` handling
- unique error IDs
- localized user-facing error messages
- contextual details in logs
- error banner for end users
- custom `404.html` page

## User-facing error messages
User-facing messages:
- avoid unnecessary technical details;
- explain that an issue occurred;
- suggest refreshing the page;
- provide an option to report the issue;
- show the generated error ID.

## Localization
Error messages are localized for:
- Ukrainian
- English

## Key files
- `js/logger.js`
- `js/error-handler.js`
- `js/main.js`
- `404.html`

## Notes
For the current project type:
- file-based server log handlers are not used;
- server-side 500 error pages are not applicable;
- the implemented browser-based logging strategy is an adapted solution for a static frontend project.
