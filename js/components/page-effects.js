/**
 * Page Effects
 * Presentation behaviours for main.html:
 *  - career timeline expand/collapse toggle
 *  - masthead entrance animation
 *  - fade-up-on-scroll for sections
 *  - sticky section navigation with scrollspy and reading progress
 *
 * Kept in an external file so the page can run under a Content Security
 * Policy without 'unsafe-inline' scripts. All motion respects
 * prefers-reduced-motion.
 */

(function () {
    'use strict';

    const { onReady, prefersReducedMotion } = SiteCore;

    function initTimelineToggle() {
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
    }

    function initMasthead() {
        const masthead = document.querySelector('.masthead');
        if (!masthead) return;

        if (prefersReducedMotion()) {
            masthead.classList.add('masthead-animate');
        } else {
            setTimeout(() => masthead.classList.add('masthead-animate'), 100);
        }
    }

    /**
     * Hero parallax: the green wedge, gold star, and name drift on separate
     * planes as the pointer moves, with slow easing for a premium feel.
     * Restricted to fine pointers (skips touch) and disabled for
     * reduced-motion. Returning the pointer settles everything back.
     */
    function initHeroParallax() {
        if (prefersReducedMotion()) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const hero = document.querySelector('.masthead');
        if (!hero) return;
        const wedge = hero.querySelector('.masthead-wedge');
        const star = hero.querySelector('.masthead-star');
        const content = hero.querySelector('.masthead-content');
        if (!wedge || !star) return;

        hero.addEventListener('pointermove', (e) => {
            const r = hero.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            wedge.style.transform = `translate(${px * 13}px, ${py * 10}px) rotate(${px * 0.6}deg)`;
            star.style.transform = `translate(${-px * 11}px, ${-py * 8}px)`;
            if (content) content.style.transform = `translate(${-px * 4}px, ${-py * 3}px)`;
        });

        hero.addEventListener('pointerleave', () => {
            wedge.style.transform = '';
            star.style.transform = '';
            if (content) content.style.transform = '';
        });
    }

    function initScrollAnimations() {
        const sections = document.querySelectorAll('section');

        // Without IntersectionObserver (or with reduced motion), show
        // everything immediately rather than risk hidden content.
        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            sections.forEach(section => {
                section.style.opacity = '1';
            });
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
    }

    /**
     * Sticky navigation: slides in once the visitor scrolls past the
     * masthead, tracks reading progress in a hairline, and marks the
     * section currently in view (scrollspy via aria-current).
     */
    function initStickyNav() {
        const nav = document.getElementById('site-nav');
        if (!nav) return;

        const progress = document.getElementById('scroll-progress');
        const masthead = document.querySelector('.masthead');
        const links = Array.from(nav.querySelectorAll('.site-nav-links a[href^="#"]'));
        const sections = links
            .map(link => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);

        // Reveal + progress. Scroll events are already coalesced to the
        // frame rate by the browser, and this handler only writes a class
        // and one transform, so no extra throttling is needed.
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
                        const matches = link.getAttribute('href') === '#' + entry.target.id;
                        if (matches) {
                            link.setAttribute('aria-current', 'true');
                        } else {
                            link.removeAttribute('aria-current');
                        }
                    });
                });
            }, { rootMargin: '-35% 0px -55% 0px' });
            sections.forEach(section => spy.observe(section));
        }
    }

    onReady(() => {
        initTimelineToggle();
        initMasthead();
        initHeroParallax();
        initScrollAnimations();
        initStickyNav();
    });
})();
