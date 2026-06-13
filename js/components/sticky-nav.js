/**
 * Sticky Navigation
 * Reveals the section nav once the visitor scrolls past the masthead,
 * tracks reading progress in a hairline, and marks the section currently
 * in view via aria-current (scrollspy).
 */

(function () {
    'use strict';

    const { onReady } = SiteCore;

    onReady(() => {
        const nav = document.getElementById('site-nav');
        if (!nav) return;

        const progress = document.getElementById('scroll-progress');
        const masthead = document.querySelector('.masthead');
        const links = Array.from(nav.querySelectorAll('.site-nav-links a[href^="#"]'));
        const sections = links
            .map(link => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);

        // Reveal + progress. Scroll events are already coalesced to the frame
        // rate by the browser, and this handler only writes a class and one
        // transform, so no extra throttling is needed.
        function update() {
            const threshold = masthead
                ? masthead.offsetTop + masthead.offsetHeight - 80
                : 240;
            nav.classList.toggle('site-nav--visible', window.scrollY > threshold);

            if (progress) {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
                progress.style.transform = `scaleX(${ratio})`;
            }
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();

        // Scrollspy: highlight the link for the section in the viewport band
        if (sections.length > 0) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    links.forEach(link => {
                        if (link.getAttribute('href') === '#' + entry.target.id) {
                            link.setAttribute('aria-current', 'true');
                        } else {
                            link.removeAttribute('aria-current');
                        }
                    });
                });
            }, { rootMargin: '-35% 0px -55% 0px' });
            sections.forEach(section => spy.observe(section));
        }
    });
})();
