/**
 * Page Effects
 * Presentation behaviours for main.html that were previously inline:
 *  - career timeline expand/collapse toggle
 *  - masthead entrance animation
 *  - fade-up-on-scroll for sections
 *
 * Kept in an external file so the page can run under a Content Security
 * Policy without 'unsafe-inline' scripts.
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

    function initScrollAnimations() {
        const sections = document.querySelectorAll('section');

        if (prefersReducedMotion()) {
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

    onReady(() => {
        initTimelineToggle();
        initMasthead();
        initScrollAnimations();
    });
})();
