/**
 * Scroll Reveal
 * Fades sections up as they enter the viewport, without layout shift.
 * Falls back to fully visible when IntersectionObserver is unavailable or
 * the visitor prefers reduced motion.
 */

(function () {
    'use strict';

    const { onReady, prefersReducedMotion } = SiteCore;

    onReady(() => {
        const sections = document.querySelectorAll('section');

        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            sections.forEach(section => { section.style.opacity = '1'; });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        sections.forEach(section => observer.observe(section));
    });
})();
