/**
 * Timeline Toggle
 * Expand/collapse control for the career timeline on main.html.
 * External file so the page runs without inline scripts (CSP).
 */

(function () {
    'use strict';

    const { onReady } = SiteCore;

    onReady(() => {
        const toggle = document.getElementById('timeline-toggle');
        const content = document.getElementById('timeline-content');
        if (!toggle || !content) return;

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            content.classList.toggle('collapsed', isExpanded);
            toggle.setAttribute('aria-expanded', String(!isExpanded));
            toggle.querySelector('.toggle-text').textContent =
                isExpanded ? 'View Timeline' : 'Collapse Timeline';
        });
    });
})();
