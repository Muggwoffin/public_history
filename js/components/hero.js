/**
 * Hero
 * Behaviour for the main.html masthead: the entrance animation, and a
 * pointer parallax in which the wedge, star, and name drift on separate
 * planes with slow easing. Parallax is restricted to fine pointers
 * (skips touch) and disabled under prefers-reduced-motion.
 */

(function () {
    'use strict';

    const { onReady, prefersReducedMotion } = SiteCore;

    function initEntrance() {
        const masthead = document.querySelector('.masthead');
        if (!masthead) return;

        if (prefersReducedMotion()) {
            masthead.classList.add('masthead-animate');
        } else {
            setTimeout(() => masthead.classList.add('masthead-animate'), 100);
        }
    }

    function initParallax() {
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

    onReady(() => {
        initEntrance();
        initParallax();
    });
})();
