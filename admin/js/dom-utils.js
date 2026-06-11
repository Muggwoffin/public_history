/**
 * Admin DOM Utilities
 * Safe element construction and user feedback helpers.
 *
 * Security: all dynamic/user-controlled text must go through textContent
 * (via el()/setText) — innerHTML is only ever used with static markup
 * that contains no interpolated data.
 */

const AdminDom = (function () {
    'use strict';

    /**
     * Create an element with optional class, text, attributes and children.
     * Text is assigned via textContent, never parsed as HTML.
     * @param {string} tag
     * @param {{className?: string, text?: string, attrs?: Object}} [options]
     * @param {(HTMLElement|string)[]} [children] - strings become text nodes
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
        children.forEach(child => {
            node.appendChild(
                typeof child === 'string' ? document.createTextNode(child) : child
            );
        });
        return node;
    }

    /**
     * Remove all children from a node.
     * @param {HTMLElement} node
     */
    function clear(node) {
        node.textContent = '';
    }

    /**
     * Escape text for safe insertion into an HTML document as text content.
     * Used when writing user input into main.html source.
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Set a status message element's text and style class.
     * @param {HTMLElement|string} target - element or its id
     * @param {string} message
     * @param {'info'|'success'|'error'|''} type
     */
    function setStatus(target, message, type = '') {
        const node = typeof target === 'string' ? document.getElementById(target) : target;
        if (!node) return;
        node.textContent = message;
        node.className = 'status-message' + (type ? ' ' + type : '');
        if (type === 'success') {
            setTimeout(() => {
                node.className = 'status-message';
                node.textContent = '';
            }, 3000);
        }
    }

    /**
     * Show a transient toast-style notification.
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    function showNotification(message, type = 'success') {
        let notification = document.getElementById('global-notification');
        if (!notification) {
            notification = el('div', { attrs: { id: 'global-notification' } });
            notification.style.cssText = [
                'position: fixed', 'top: 20px', 'right: 20px',
                'padding: 15px 20px', 'border-radius: 4px', 'color: white',
                'font-weight: 500', 'z-index: 10000',
                'box-shadow: 0 4px 6px rgba(0,0,0,0.1)',
                'transition: opacity 0.3s ease'
            ].join(';');
            document.body.appendChild(notification);
        }

        const colors = { success: '#28a745', error: '#dc3545', info: '#17a2b8' };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.style.opacity = '1';
        notification.style.display = 'block';
        notification.textContent = message;

        clearTimeout(notification._hideTimer);
        notification._hideTimer = setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    /**
     * Ask the user to confirm a destructive action.
     * @param {string} message
     * @returns {boolean}
     */
    function confirmAction(message) {
        return window.confirm(message);
    }

    return { el, clear, escapeHtml, setStatus, showNotification, confirmAction };
})();
