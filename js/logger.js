// @ts-check

/**
 * @typedef {"debug" | "info" | "warning" | "error" | "critical"} LogLevel
 */

/**
 * @typedef {Record<string, unknown>} LogContext
 */

/**
 * @typedef {{
 *   timestamp: string,
 *   level: LogLevel,
 *   module: string,
 *   message: string,
 *   errorId: string | null,
 *   sessionId: string,
 *   context: LogContext
 * }} LogEntry
 */

/**
 * @typedef {{
 *   setLevel: (level: string) => void,
 *   debug: (...args: unknown[]) => void,
 *   info: (...args: unknown[]) => void,
 *   warn: (...args: unknown[]) => void,
 *   error: (...args: unknown[]) => void
 * }} ExternalLogger
 */

/**
 * @typedef {{
 *   setLevel: (level: string) => LogLevel,
 *   getLevel: () => LogLevel,
 *   debug: (moduleName: string, message: string, context?: LogContext) => LogEntry,
 *   info: (moduleName: string, message: string, context?: LogContext) => LogEntry,
 *   warning: (moduleName: string, message: string, context?: LogContext) => LogEntry,
 *   error: (moduleName: string, message: string, context?: LogContext, errorId?: string | null) => LogEntry,
 *   critical: (moduleName: string, message: string, context?: LogContext, errorId?: string | null) => LogEntry,
 *   createErrorId: () => string,
 *   getLogs: () => LogEntry[],
 *   clearLogs: () => void
 * }} AppLogger
 */

/**
 * @typedef {Window & {
 *   log?: ExternalLogger,
 *   ULDA_LOGGER?: AppLogger
 * }} UldaWindow
 */

(function () {
    const appWindow = /** @type {UldaWindow} */ (window);

    const STORAGE_KEY = "ulda:logs";
    const LEVEL_KEY = "ulda:log-level";
    const SESSION_KEY = "ulda:session-id";
    const MAX_LOGS = 200;

    /** @type {LogLevel[]} */
    const LEVELS = ["debug", "info", "warning", "error", "critical"];

    /** @type {Record<LogLevel, "debug" | "info" | "warn" | "error">} */
    const LOGLEVEL_MAP = {
        debug: "debug",
        info: "info",
        warning: "warn",
        error: "error",
        critical: "error"
    };

    /**
     * @param {unknown} level
     * @returns {LogLevel}
     */
    function normalizeLevel(level) {
        const value = String(level || "").toLowerCase();

        if (LEVELS.includes(/** @type {LogLevel} */ (value))) {
            return /** @type {LogLevel} */ (value);
        }

        return "info";
    }

    /**
     * @returns {string}
     */
    function getSessionId() {
        const existing = sessionStorage.getItem(SESSION_KEY);

        if (existing) {
            return existing;
        }

        const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        sessionStorage.setItem(SESSION_KEY, generated);
        return generated;
    }

    /**
     * @returns {LogLevel}
     */
    function getConfiguredLevel() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get("logLevel");

        if (fromQuery) {
            return normalizeLevel(fromQuery);
        }

        const fromStorage = localStorage.getItem(LEVEL_KEY);

        if (fromStorage) {
            return normalizeLevel(fromStorage);
        }

        return "info";
    }

    /**
     * @param {unknown} level
     * @returns {LogLevel}
     */
    function setConfiguredLevel(level) {
        const normalized = normalizeLevel(level);

        localStorage.setItem(LEVEL_KEY, normalized);

        if (appWindow.log && typeof appWindow.log.setLevel === "function") {
            appWindow.log.setLevel(LOGLEVEL_MAP[normalized]);
        }

        return normalized;
    }

    /**
     * @returns {string}
     */
    function createErrorId() {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return `err-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    /**
     * @returns {LogEntry[]}
     */
    function getStoredLogs() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                return [];
            }

            return /** @type {LogEntry[]} */ (JSON.parse(raw));
        } catch (error) {
            console.error("Failed to read stored logs", error);
            return [];
        }
    }

    /**
     * @param {LogEntry[]} logs
     * @returns {void}
     */
    function saveStoredLogs(logs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
    }

    /**
     * @param {LogEntry} entry
     * @returns {void}
     */
    function appendStoredLog(entry) {
        const logs = getStoredLogs();
        logs.push(entry);
        saveStoredLogs(logs);
    }

    /**
     * @param {LogLevel} level
     * @param {string} moduleName
     * @param {string} message
     * @param {LogContext} context
     * @param {string | null} errorId
     * @returns {LogEntry}
     */
    function formatEntry(level, moduleName, message, context, errorId) {
        return {
            timestamp: new Date().toISOString(),
            level,
            module: moduleName || "app",
            message,
            errorId: errorId || null,
            sessionId: getSessionId(),
            context: context || {}
        };
    }

    /**
     * @param {LogEntry} entry
     * @returns {void}
     */
    function writeToConsole(entry) {
        const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}]`;
        const message = entry.errorId
            ? `${prefix} [${entry.errorId}] ${entry.message}`
            : `${prefix} ${entry.message}`;

        const hasContext = Object.keys(entry.context).length > 0;

        if (appWindow.log) {
            const method = LOGLEVEL_MAP[entry.level];

            if (hasContext) {
                appWindow.log[method](message, entry.context);
            } else {
                appWindow.log[method](message);
            }
            return;
        }

        if (entry.level === "warning") {
            hasContext ? console.warn(message, entry.context) : console.warn(message);
            return;
        }

        if (entry.level === "error" || entry.level === "critical") {
            hasContext ? console.error(message, entry.context) : console.error(message);
            return;
        }

        if (entry.level === "debug") {
            hasContext ? console.debug(message, entry.context) : console.debug(message);
            return;
        }

        hasContext ? console.info(message, entry.context) : console.info(message);
    }

    /**
     * @param {LogLevel} level
     * @param {string} moduleName
     * @param {string} message
     * @param {LogContext} [context={}]
     * @param {string | null} [errorId=null]
     * @returns {LogEntry}
     */
    function logEvent(level, moduleName, message, context = {}, errorId = null) {
        const entry = formatEntry(level, moduleName, message, context, errorId);

        writeToConsole(entry);
        appendStoredLog(entry);

        return entry;
    }

    /** @type {AppLogger} */
    const logger = {
        setLevel(level) {
            return setConfiguredLevel(level);
        },

        getLevel() {
            return getConfiguredLevel();
        },

        debug(moduleName, message, context = {}) {
            return logEvent("debug", moduleName, message, context);
        },

        info(moduleName, message, context = {}) {
            return logEvent("info", moduleName, message, context);
        },

        warning(moduleName, message, context = {}) {
            return logEvent("warning", moduleName, message, context);
        },

        error(moduleName, message, context = {}, errorId = null) {
            return logEvent("error", moduleName, message, context, errorId);
        },

        critical(moduleName, message, context = {}, errorId = null) {
            return logEvent("critical", moduleName, message, context, errorId);
        },

        createErrorId() {
            return createErrorId();
        },

        getLogs() {
            return getStoredLogs();
        },

        clearLogs() {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    setConfiguredLevel(getConfiguredLevel());
    appWindow.ULDA_LOGGER = logger;

    logger.info("app", "Logger initialized", {
        level: logger.getLevel()
    });
})();