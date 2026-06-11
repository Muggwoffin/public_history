/**
 * Site Core
 * Shared kernel for the public site: DOM-ready scheduling, safe element
 * construction, and list-rendering helpers used by every section renderer.
 *
 * All user-visible content is inserted via textContent (never innerHTML),
 * so data files can hold arbitrary text without risk of markup injection.
 */

const SiteCore = (function () {
    'use strict';

    /**
     * Run a callback once the DOM is ready (immediately if it already is).
     * @param {Function} fn
     */
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    /**
     * Create an element with optional class, text and attributes.
     * Text is always assigned via textContent.
     * @param {string} tag
     * @param {{className?: string, text?: string, attrs?: Object}} [options]
     * @param {HTMLElement[]} [children]
     * @returns {HTMLElement}
     */
    function el(tag, options = {}, children = []) {
        const node = document.createElement(tag);
        if (options.className) node.className = options.className;
        if (options.text !== undefined && options.text !== null) {
            node.textContent = options.text;
        }
        if (options.attrs) {
            Object.entries(options.attrs).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    node.setAttribute(name, value);
                }
            });
        }
        children.forEach(child => node.appendChild(child));
        return node;
    }

    /**
     * Create a link. External links (anything but "#" or relative anchors)
     * open in a new tab with rel="noopener noreferrer".
     * @param {string} href
     * @param {string} className
     * @param {string} text
     * @returns {HTMLAnchorElement}
     */
    function link(href, className, text) {
        const a = el('a', { className, text, attrs: { href } });
        if (href && href !== '#') {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        return a;
    }

    /**
     * Whether the visitor prefers reduced motion.
     * @returns {boolean}
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Replace a container's content with one element per item, or an
     * empty-state message when there are no items.
     * @param {HTMLElement} container
     * @param {Array} items
     * @param {(item: Object) => HTMLElement} createItem
     * @param {{className: string, text: string}} emptyState
     */
    function renderList(container, items, createItem, emptyState) {
        container.textContent = '';
        if (!items || items.length === 0) {
            container.appendChild(el('p', {
                className: emptyState.className,
                text: emptyState.text
            }));
            return;
        }
        items.forEach(item => container.appendChild(createItem(item)));
    }

    /**
     * Find (or create directly after the decorative line) a container
     * inside a top-level section. Used by renderers whose markup is
     * fully dynamic.
     * @param {string} sectionId
     * @param {string} containerClass
     * @returns {HTMLElement|null}
     */
    function ensureSectionContainer(sectionId, containerClass) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Section "${sectionId}" not found`);
            return null;
        }
        let container = section.querySelector('.' + containerClass);
        if (container) return container;

        const contentSection = section.querySelector('.content-section');
        if (!contentSection) return null;

        container = el('div', { className: containerClass });
        const decorativeLine = contentSection.querySelector('.decorative-line-thin');
        if (decorativeLine && decorativeLine.nextSibling) {
            contentSection.insertBefore(container, decorativeLine.nextSibling);
        } else {
            contentSection.appendChild(container);
        }
        return container;
    }

    /**
     * Find a subsection heading within a section by partial text match.
     * @param {string} sectionId
     * @param {string} headingText
     * @returns {HTMLElement|null}
     */
    function findSubsectionHeading(sectionId, headingText) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Section "${sectionId}" not found`);
            return null;
        }
        const heading = Array.from(section.querySelectorAll('.subsection-heading'))
            .find(h => h.textContent.includes(headingText));
        if (!heading) {
            console.warn(`Subsection heading "${headingText}" not found in #${sectionId}`);
        }
        return heading || null;
    }

    /**
     * Register a renderer that depends on a data variable declared by one
     * of the data files. The data is supplied as a lazy getter (data files
     * use top-level `const`, which is in script scope but not on `window`).
     * Logs a warning instead of throwing when the data file failed to load.
     * @param {() => *} getData - e.g. () => books
     * @param {(data: *) => void} init
     */
    function registerRenderer(getData, init) {
        onReady(() => {
            let data;
            try {
                data = getData();
            } catch (_) {
                data = undefined; // data file not loaded
            }
            if (typeof data === 'undefined') {
                console.warn('A data file failed to load; renderer skipped');
                return;
            }
            init(data);
        });
    }

    return {
        onReady,
        el,
        link,
        prefersReducedMotion,
        renderList,
        ensureSectionContainer,
        findSubsectionHeading,
        registerRenderer
    };
})();
