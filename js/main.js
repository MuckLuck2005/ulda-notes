// @ts-check

/**
 * @typedef {Record<string, unknown>} MainLogContext
 */

/**
 * @typedef {{
 *   debug: (moduleName: string, message: string, context?: MainLogContext) => unknown,
 *   info: (moduleName: string, message: string, context?: MainLogContext) => unknown,
 *   warning: (moduleName: string, message: string, context?: MainLogContext) => unknown,
 *   error: (moduleName: string, message: string, context?: MainLogContext, errorId?: string | null) => unknown,
 *   critical: (moduleName: string, message: string, context?: MainLogContext, errorId?: string | null) => unknown,
 *   createErrorId: () => string
 * }} MainLogger
 */

/**
 * @typedef {Window & {
 *   ULDA_LOGGER?: MainLogger
 * }} MainWindow
 */

(function () {
    const appWindow = /** @type {MainWindow} */ (window);

    if (!appWindow.ULDA_LOGGER) {
        console.error("Logger is not initialized before main.js.");
        return;
    }

    /** @type {MainLogger} */
    const logger = appWindow.ULDA_LOGGER;

    /**
     * Returns all navigation links from the main page menu.
     * @returns {HTMLAnchorElement[]} Array of navigation links.
     */
    function getNavigationLinks() {
        return Array.from(
            /** @type {NodeListOf<HTMLAnchorElement>} */ (document.querySelectorAll(".main-nav a"))
        );
    }

    /**
     * Scrolls smoothly to a page section by its identifier.
     * @param {string} sectionId - Section identifier without the # symbol.
     * @returns {void}
     */
    function scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);

        if (!target) {
            logger.warning("navigation", "Target section not found", {
                sectionId
            });
            return;
        }

        logger.debug("navigation", "Scrolling to section", {
            sectionId
        });

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /**
     * Marks the current navigation link as active.
     * @param {string} sectionId - Active section identifier.
     * @returns {void}
     */
    function setActiveNavigationLink(sectionId) {
        const links = getNavigationLinks();

        links.forEach((link) => {
            const href = link.getAttribute("href");
            const isActive = href === `#${sectionId}`;

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    /**
     * Handles click on a navigation link.
     * @param {MouseEvent} event - Browser click event.
     * @param {HTMLAnchorElement} link - Clicked navigation link.
     * @returns {void}
     */
    function handleNavigationClick(event, link) {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) {
            logger.warning("navigation", "Navigation link does not contain valid hash target", {
                href
            });
            return;
        }

        event.preventDefault();

        const sectionId = href.slice(1);

        logger.info("navigation", "Navigation link clicked", {
            href,
            sectionId
        });

        scrollToSection(sectionId);
        setActiveNavigationLink(sectionId);
    }

    /**
     * Initializes interactive behavior of the landing page.
     * @returns {void}
     */
    function initializeLandingPage() {
        const links = getNavigationLinks();

        logger.info("app", "Application started", {
            linkCount: links.length,
            path: window.location.pathname
        });

        if (links.length === 0) {
            logger.warning("navigation", "No navigation links found on page");
        }

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                handleNavigationClick(event, link);
            });
        });
    }

    window.addEventListener("beforeunload", () => {
        logger.info("app", "Application session ended", {
            path: window.location.pathname
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
        try {
            initializeLandingPage();
        } catch (error) {
            const errorId = logger.createErrorId();

            logger.critical("app", "Critical initialization failure", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack || null : null
            }, errorId);

            throw error;
        }
    });
})();