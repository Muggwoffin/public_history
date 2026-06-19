/**
 * Section-view analytics.
 *
 * Sends a `view_section` event the first time each main <section> scrolls into
 * view. Routed through window.trackEvent (defined in analytics.js), so events
 * fire only once analytics consent is granted; a section seen before consent
 * stays unmarked and can still report if the visitor later accepts and reaches
 * it. The negative bottom rootMargin fires the event when the section's top
 * passes the upper 60% of the viewport, which behaves consistently for both
 * short and very tall sections (where 50% would never be visible at once).
 */
(function () {
    'use strict';

    if (typeof SiteCore === 'undefined' || !('IntersectionObserver' in window)) return;

    SiteCore.onReady(function () {
        var sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        var sent = {};
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                if (sent[id]) return;
                if (window.trackEvent &&
                    window.trackEvent('view_section', { section_id: id })) {
                    sent[id] = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -40% 0px' });

        sections.forEach(function (section) { observer.observe(section); });
    });
})();
