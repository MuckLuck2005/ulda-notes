// @ts-check

/**
 * @typedef {Record<string, unknown>} ErrorHandlerContext
 */

/**
 * @typedef {{
 *   setLevel: (level: string) => string,
 *   getLevel: () => string,
 *   debug: (moduleName: string, message: string, context?: ErrorHandlerContext) => unknown,
 *   info: (moduleName: string, message: string, context?: ErrorHandlerContext) => unknown,
 *   warning: (moduleName: string, message: string, context?: ErrorHandlerContext) => unknown,
 *   error: (moduleName: string, message: string, context?: ErrorHandlerContext, errorId?: string | null) => unknown,
 *   critical: (moduleName: string, message: string, context?: ErrorHandlerContext, errorId?: string | null) => unknown,
 *   createErrorId: () => string
 * }} ErrorHandlerLogger
 */

/**
 * @typedef {Window & {
 *   ULDA_LOGGER?: ErrorHandlerLogger
 * }} ErrorHandlerWindow
 */

(function () {
    const appWindow = /** @type {ErrorHandlerWindow} */ (window);

    if (!appWindow.ULDA_LOGGER) {
        console.error("Logger is not initialized before error handler.");
        return;
    }

    /** @type {ErrorHandlerLogger} */
    const logger = appWindow.ULDA_LOGGER;

    const ERROR_MESSAGES = {
        uk: {
            generic: "Сталася помилка під час роботи сторінки.",
            resource: "Не вдалося завантажити один із ресурсів сторінки.",
            promise: "Виникла неочікувана помилка асинхронної операції.",
            action: "Спробуйте оновити сторінку. Якщо проблема повторюється, повідомте розробника.",
            copy: "Скопіювати код помилки",
            copied: "Код помилки скопійовано"
        },
        en: {
            generic: "An error occurred while the page was running.",
            resource: "A page resource could not be loaded.",
            promise: "An unexpected asynchronous error occurred.",
            action: "Try refreshing the page. If the issue persists, contact the developer.",
            copy: "Copy error code",
            copied: "Error code copied"
        }
    };

    /**
     * @returns {"uk" | "en"}
     */
    function getLanguage() {
        const pageLang = (document.documentElement.lang || "").toLowerCase();
        const browserLang = (navigator.language || "").toLowerCase();

        if (pageLang.startsWith("uk") || browserLang.startsWith("uk")) {
            return "uk";
        }

        return "en";
    }

    /**
     * @returns {{generic: string, resource: string, promise: string, action: string, copy: string, copied: string}}
     */
    function getMessages() {
        return ERROR_MESSAGES[getLanguage()];
    }

    /**
     * @param {unknown} error
     * @returns {string}
     */
    function getErrorText(error) {
        if (!error) {
            return "Unknown error";
        }

        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === "string") {
            return error;
        }

                try {
            return JSON.stringify(error);
        } catch {
            return "Unserializable error";
        }
    }

    /**
     * @param {string} message
     * @param {string} errorId
     * @returns {void}
     */
    function createBanner(message, errorId) {
        const messages = getMessages();
        let banner = /** @type {HTMLDivElement | null} */ (document.getElementById("app-error-banner"));

        if (!banner) {
            banner = document.createElement("div");
            banner.id = "app-error-banner";
            banner.setAttribute("role", "alert");
            banner.style.position = "fixed";
            banner.style.right = "16px";
            banner.style.bottom = "16px";
            banner.style.maxWidth = "420px";
            banner.style.padding = "16px";
            banner.style.background = "#7f1d1d";
            banner.style.color = "#ffffff";
            banner.style.borderRadius = "12px";
            banner.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
            banner.style.zIndex = "9999";
            banner.style.fontFamily = "Arial, sans-serif";
            banner.style.lineHeight = "1.5";
            banner.style.border = "1px solid rgba(255,255,255,0.15)";
            document.body.appendChild(banner);
        }

        banner.innerHTML = "";

        const title = document.createElement("strong");
        title.textContent = message;

        const description = document.createElement("p");
        description.textContent = messages.action;
        description.style.margin = "8px 0";

        const code = document.createElement("p");
        code.textContent = `Error ID: ${errorId}`;
        code.style.margin = "8px 0";
        code.style.fontSize = "14px";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = messages.copy;
        button.style.marginTop = "8px";
        button.style.padding = "8px 12px";
        button.style.border = "none";
        button.style.borderRadius = "8px";
        button.style.background = "#ffffff";
        button.style.color = "#7f1d1d";
        button.style.cursor = "pointer";
        button.style.fontWeight = "700";

        button.addEventListener("click", async () => {
            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                    await navigator.clipboard.writeText(errorId);
                    button.textContent = messages.copied;
                }
            } catch (clipboardError) {
                logger.warning("error-handler", "Failed to copy error ID", {
                    errorId,
                    clipboardError: getErrorText(clipboardError)
                });
            }
        });

        banner.appendChild(title);
        banner.appendChild(description);
        banner.appendChild(code);
        banner.appendChild(button);
    }

    /**
     * @param {Event} event
     * @returns {void}
     */
    function handleGlobalError(event) {
        const messages = getMessages();
        const errorId = logger.createErrorId();
        const errorEvent = /** @type {ErrorEvent} */ (event);
        const target = errorEvent.target;

        if (target instanceof HTMLImageElement || target instanceof HTMLScriptElement || target instanceof HTMLLinkElement) {
            logger.error("frontend", "Resource loading error", {
                errorId,
                tagName: target.tagName,
                source: "src" in target ? target.src : target.href
            }, errorId);

            createBanner(messages.resource, errorId);
            return;
        }

        logger.error("frontend", "Unhandled window error", {
            errorId,
            message: errorEvent.message || "Unknown error",
            source: errorEvent.filename || null,
            line: errorEvent.lineno || null,
            column: errorEvent.colno || null,
            stack: errorEvent.error instanceof Error ? errorEvent.error.stack || null : null
        }, errorId);

        createBanner(messages.generic, errorId);
    }

    /**
     * @param {PromiseRejectionEvent} event
     * @returns {void}
     */
    function handleUnhandledRejection(event) {
        const messages = getMessages();
        const errorId = logger.createErrorId();

        logger.error("frontend", "Unhandled promise rejection", {
            errorId,
            reason: getErrorText(event.reason)
        }, errorId);

        createBanner(messages.promise, errorId);
    }

    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    logger.info("app", "Global error handlers registered");
})();