# Performance profiling and optimization

## Purpose
This document describes the profiling methodology, baseline metrics, detected hot spots, applied optimizations and comparison of results before and after optimization in the ULDA Notes project.

## Project type
ULDA Notes is a static client-side web project. Because of this, the performance analysis focuses on:
- browser-side JavaScript execution
- DOM interaction
- rendering behavior
- localStorage access
- memory usage in the browser

Database profiling is not applicable for the current project version.

## Profiling tools
The following tools were used:
- Chrome DevTools Performance panel — CPU/runtime profiling
- Chrome DevTools Memory panel — memory usage analysis
- Lighthouse — page performance audit
- `performance.now()` — custom timing of key operations

## Key performance metrics
The following metrics were selected as important for the project:
- page load responsiveness
- JavaScript execution time
- navigation interaction time
- repeated DOM query performance
- logging write performance
- logging read performance
- serialization overhead for error/log payloads
- browser memory stability during repeated interactions

## Test scenarios
Three datasets were used:

### Small dataset
- `?profile=1&dataset=small`

### Medium dataset
- `?profile=1&dataset=medium`

### Large dataset
- `?profile=1&dataset=large`

## Custom benchmark setup
The project includes `js/performance.js`, which runs a custom benchmark suite and measures:
- `navigation-query`
- `navigation-state-update`
- `logger-write`
- `logger-read`
- `error-serialization`

The suite is executed only when the `profile=1` query parameter is present.

## Baseline profiling methodology
The following sequence was used before optimization:

1. Run the project locally:
   ```bash
   npm run dev
   ```
2. Open the application with one of the profiling datasets:
   ```text
   http://localhost:3000/?profile=1&dataset=medium
   ```
3. Record baseline timings shown by the on-page performance panel.
4. Open Chrome DevTools Performance panel and record the interaction.
5. Open Chrome DevTools Memory panel and inspect memory behavior.
6. Run Lighthouse and save the baseline performance score if needed.

## Baseline results before optimization

### Dataset: small
- navigation-query: **0.3 ms**
- navigation-state-update: **0.1 ms**
- logger-write: **0.7 ms**
- logger-read: **0.8 ms**
- error-serialization: **0.1 ms**

### Dataset: medium
- navigation-query: **0.3 ms**
- navigation-state-update: **0.4 ms**
- logger-write: **16.2 ms**
- logger-read: **10.7 ms**
- error-serialization: **0.2 ms**

### Dataset: large
- navigation-query: **0.8 ms**
- navigation-state-update: **1.2 ms**
- logger-write: **100.6 ms**
- logger-read: **54.4 ms**
- error-serialization: **0.5 ms**

## Identified hot spots before optimization
The following hot spots were identified before optimization:
1. `logger-write`
2. `logger-read`
3. `navigation-state-update`

An additional noticeable operation was `navigation-query`, but its impact was lower than the logging subsystem.

## Identified performance problems
The following problems were identified:
- repeated DOM queries increased execution time;
- repeated writes to `localStorage` were expensive;
- repeated reads from `localStorage` together with `JSON.parse()` created additional overhead;
- the logging subsystem became the dominant bottleneck for medium and large datasets.

## Applied optimizations
The following optimizations were implemented:

1. **Logging write optimization**  
   Instead of writing every log entry directly to `localStorage`, logs were first cached in memory and persisted later. This significantly reduced repeated write overhead.

2. **Logging read optimization**  
   Repeated reading and reparsing of stored logs was removed. The system now uses an in-memory cache for log retrieval, reducing repeated `JSON.parse()` overhead.

3. **Navigation DOM query optimization**  
   Navigation links were cached instead of querying the DOM repeatedly with `querySelectorAll()`.

## Reprofiling after optimization
The same methodology was repeated after applying the optimizations:
1. The same datasets were used.
2. The same benchmark suite was executed.
3. The results were compared to the baseline measurements.

## Results after optimization

### Dataset: small
- navigation-query: **0.2 ms**
- navigation-state-update: **0.2 ms**
- logger-write: **0.3 ms**
- logger-read: **0 ms**
- error-serialization: **0.2 ms**

### Dataset: medium
- navigation-query: **0.3 ms**
- navigation-state-update: **0.4 ms**
- logger-write: **0.3 ms**
- logger-read: **0 ms**
- error-serialization: **0.2 ms**

### Dataset: large
- navigation-query: **1.0 ms**
- navigation-state-update: **1.2 ms**
- logger-write: **2.1 ms**
- logger-read: **0.3 ms**
- error-serialization: **0.9 ms**

## Comparison before and after optimization
The following formula was used:

```text
improvement % = ((before - after) / before) * 100
```

### navigation-query
- small: `((0.3 - 0.2) / 0.3) * 100 = 33.33%`
- medium: `((0.3 - 0.3) / 0.3) * 100 = 0%`
- large: `((0.8 - 1.0) / 0.8) * 100 = -25%`

### navigation-state-update
- small: `((0.1 - 0.2) / 0.1) * 100 = -100%`
- medium: `((0.4 - 0.4) / 0.4) * 100 = 0%`
- large: `((1.2 - 1.2) / 1.2) * 100 = 0%`

### logger-write
- small: `((0.7 - 0.3) / 0.7) * 100 = 57.14%`
- medium: `((16.2 - 0.3) / 16.2) * 100 = 98.15%`
- large: `((100.6 - 2.1) / 100.6) * 100 = 97.91%`

### logger-read
- small: `((0.8 - 0.0) / 0.8) * 100 = 100%`
- medium: `((10.7 - 0.0) / 10.7) * 100 = 100%`
- large: `((54.4 - 0.3) / 54.4) * 100 = 99.45%`

### error-serialization
- small: `((0.1 - 0.2) / 0.1) * 100 = -100%`
- medium: `((0.2 - 0.2) / 0.2) * 100 = 0%`
- large: `((0.5 - 0.9) / 0.5) * 100 = -80%`

## Analysis of the results
The optimization produced the largest positive effect in the logging subsystem.

The most important improvements were:
- `logger-write`: about **98% improvement** for medium and large datasets
- `logger-read`: about **99–100% improvement**

This confirms that the primary performance bottlenecks were related to repeated logging operations and repeated access to `localStorage`.

The navigation-related measurements did not improve as strongly as the logging subsystem. Some values remained nearly unchanged, and some minor regressions appeared in very small absolute timings. These fluctuations are likely influenced by measurement noise and browser runtime variability, because the measured values are very small.

## New hot spots after optimization
After optimization, the logging subsystem is no longer the main bottleneck.

The remaining relative hot spots are:
1. `navigation-state-update`
2. `navigation-query`
3. `error-serialization`

However, their absolute execution times remain low and do not currently present a major usability issue for the project.

## Conclusion
The ULDA Notes project was profiled using browser-based tools and a custom benchmark suite implemented with `performance.now()`.

Baseline profiling showed that the largest bottlenecks were:
- writing logs,
- reading logs,
- repeated navigation-related DOM operations.

To address these issues, the following optimizations were implemented:
- in-memory caching of logs,
- delayed persistence to `localStorage`,
- caching of navigation links.

Repeated profiling showed that the most significant improvements were achieved for the logging subsystem, where execution time was reduced by approximately **98–100%** for medium and large datasets. After optimization, the dominant hot spots shifted to relatively lightweight DOM and serialization operations, whose absolute cost remains low.

Therefore, the implemented optimizations significantly improved the performance of the most expensive operations in the project and reduced the impact of logging on the responsiveness of the application.