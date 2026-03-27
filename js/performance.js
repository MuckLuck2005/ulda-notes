// @ts-check

/**
 * @typedef {Record<string, unknown>} PerfContext
 */

/**
 * @typedef {{
 *   debug: (moduleName: string, message: string, context?: PerfContext) => unknown,
 *   info: (moduleName: string, message: string, context?: PerfContext) => unknown,
 *   warning: (moduleName: string, message: string, context?: PerfContext) => unknown,
 *   error: (moduleName: string, message: string, context?: PerfContext, errorId?: string | null) => unknown,
 *   critical: (moduleName: string, message: string, context?: PerfContext, errorId?: string | null) => unknown,
 *   createErrorId: () => string,
 *   getLogs: () => unknown[],
 *   clearLogs: () => void
 * }} PerfSuiteLogger
 */

/**
 * @typedef {Window & {
 *   ULDA_LOGGER?: PerfSuiteLogger,
 *   ULDA_PERFORMANCE_RESULTS?: {
 *     dataset: string,
 *     iterations: number,
 *     results: Array<{ name: string, durationMs: number }>
 *   }
 * }} PerfSuiteWindow
 */

(function () {
    const appWindow = /** @type {PerfSuiteWindow} */ (window);

    if (!appWindow.ULDA_LOGGER) {
        console.error("Logger is not initialized before performance.js.");
        return;
    }

    /** @type {PerfSuiteLogger} */
    const logger = appWindow.ULDA_LOGGER;

    /** @type {Record<string, number>} */
    const DATASETS = {
        small: 25,
        medium: 150,
        large: 600
    };

    /**
     * @returns {string}
     */
    function getDatasetName() {
        const params = new URLSearchParams(window.location.search);
        const dataset = (params.get("dataset") || "medium").toLowerCase();

        return Object.prototype.hasOwnProperty.call(DATASETS, dataset)
            ? dataset
            : "medium";
    }

    /**
     * @returns {boolean}
     */
    function shouldRunPerformanceSuite() {
        const params = new URLSearchParams(window.location.search);
        return params.get("profile") === "1";
    }

    /**
     * @param {string} benchmarkName
     * @param {() => void} callback
     * @returns {number}
     */
    function measure(benchmarkName, callback) {
        const start = performance.now();
        callback();
        const end = performance.now();
        const durationMs = Number((end - start).toFixed(3));

        logger.info("performance", "Benchmark completed", {
            benchmarkName,
            durationMs
        });

        return durationMs;
    }

    /**
     * @param {number} iterations
     * @returns {number}
     */
    function benchmarkNavigationQuery(iterations) {
        return measure("navigation-query", () => {
            for (let index = 0; index < iterations; index += 1) {
                document.querySelectorAll(".main-nav a");
            }
        });
    }

    /**
     * @param {number} iterations
     * @returns {number}
     */
    function benchmarkNavigationStateUpdate(iterations) {
        const links = /** @type {NodeListOf<HTMLAnchorElement>} */ (
            document.querySelectorAll(".main-nav a")
        );

        return measure("navigation-state-update", () => {
            for (let index = 0; index < iterations; index += 1) {
                links.forEach((link, linkIndex) => {
                    if (linkIndex === index % Math.max(links.length, 1)) {
                        link.setAttribute("aria-current", "page");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            }
        });
    }

    /**
     * @param {number} iterations
     * @returns {number}
     */
    function benchmarkLoggerWrites(iterations) {
        logger.clearLogs();

        return measure("logger-write", () => {
            for (let index = 0; index < iterations; index += 1) {
                logger.debug("performance", "Synthetic log entry", {
                    index,
                    type: "write-benchmark"
                });
            }
        });
    }

    /**
     * @param {number} iterations
     * @returns {number}
     */
    function benchmarkLoggerReads(iterations) {
        return measure("logger-read", () => {
            for (let index = 0; index < iterations; index += 1) {
                logger.getLogs();
            }
        });
    }

    /**
     * @param {number} iterations
     * @returns {number}
     */
    function benchmarkErrorSerialization(iterations) {
        return measure("error-serialization", () => {
            for (let index = 0; index < iterations; index += 1) {
                JSON.stringify({
                    message: "Synthetic error payload",
                    code: `E-${index}`,
                    path: window.location.pathname,
                    context: {
                        index,
                        section: `section-${index % 5}`,
                        severity: "warning"
                    }
                });
            }
        });
    }

    /**
     * @param {string} dataset
     * @param {number} iterations
     * @param {Array<{ name: string, durationMs: number }>} results
     * @returns {void}
     */
    function renderResults(dataset, iterations, results) {
        let panel = /** @type {HTMLDivElement | null} */ (
            document.getElementById("performance-results-panel")
        );

        if (!panel) {
            panel = document.createElement("div");
            panel.id = "performance-results-panel";
            panel.style.position = "fixed";
            panel.style.left = "16px";
            panel.style.bottom = "16px";
            panel.style.maxWidth = "420px";
            panel.style.padding = "16px";
            panel.style.background = "#0f172a";
            panel.style.color = "#ffffff";
            panel.style.borderRadius = "12px";
            panel.style.boxShadow = "0 10px 24px rgba(0,0,0,0.25)";
            panel.style.zIndex = "9999";
            panel.style.fontFamily = "Arial, sans-serif";
            panel.style.fontSize = "14px";
            panel.style.lineHeight = "1.5";
            document.body.appendChild(panel);
        }

        const rows = results
            .map((item) => `<li><strong>${item.name}</strong>: ${item.durationMs} ms</li>`)
            .join("");

        panel.innerHTML = `
            <strong>Performance profile</strong>
            <p style="margin: 8px 0;">Dataset: <strong>${dataset}</strong><br>Iterations: <strong>${iterations}</strong></p>
            <ul style="margin: 8px 0 0 18px; padding: 0;">
                ${rows}
            </ul>
        `;
    }

    /**
     * @returns {void}
     */
    function runPerformanceSuite() {
        const dataset = getDatasetName();
        const iterations = DATASETS[dataset];

        logger.info("performance", "Performance suite started", {
            dataset,
            iterations
        });

        /** @type {Array<{ name: string, durationMs: number }>} */
        const results = [
            {
                name: "navigation-query",
                durationMs: benchmarkNavigationQuery(iterations)
            },
            {
                name: "navigation-state-update",
                durationMs: benchmarkNavigationStateUpdate(iterations)
            },
            {
                name: "logger-write",
                durationMs: benchmarkLoggerWrites(iterations)
            },
            {
                name: "logger-read",
                durationMs: benchmarkLoggerReads(iterations)
            },
            {
                name: "error-serialization",
                durationMs: benchmarkErrorSerialization(iterations)
            }
        ];

        appWindow.ULDA_PERFORMANCE_RESULTS = {
            dataset,
            iterations,
            results
        };

        logger.info("performance", "Performance suite finished", {
            dataset,
            iterations,
            results
        });

        renderResults(dataset, iterations, results);
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (!shouldRunPerformanceSuite()) {
            return;
        }

        window.setTimeout(() => {
    runPerformanceSuite();
}, 300);
    });
})();