/**
 * Hero Star
 * The gold hero star is a quiet easter egg: activating it (click, Enter,
 * or Space) cycles the name and subtitle through language variants.
 * English is the initial, source-of-truth state already in the HTML, so
 * the page degrades to plain English without JavaScript.
 *
 * Cycle order: English → Irish → Russian → Esperanto → English …
 */

(function () {
    'use strict';

    const { onReady } = SiteCore;

    const VARIANTS = [
        { lang: 'en', name: 'Maurice J. Casey', subtitle: 'Historian & Writer' },
        { lang: 'ga', name: "Muiris S. O'Cathasaigh", subtitle: 'Staire & Scríbhneoir' },
        { lang: 'ru', name: 'Морис Дж. Кейси', subtitle: 'Историк и писатель' },
        { lang: 'eo', name: 'Maurice J. Casey', subtitle: 'Historiisto kaj Verkisto' }
    ];

    onReady(() => {
        const star = document.querySelector('.masthead-star');
        const title = document.querySelector('.masthead-title');
        const subtitle = document.querySelector('.masthead-subtitle');
        if (!star || !title || !subtitle) return;

        // Promote the decorative star to an interactive, focusable control
        star.removeAttribute('aria-hidden');
        star.setAttribute('role', 'button');
        star.setAttribute('tabindex', '0');
        star.setAttribute('aria-label', 'Show the name in another language');

        let index = 0;
        let switching = false;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function apply(variant) {
            title.textContent = variant.name;
            title.setAttribute('lang', variant.lang);
            subtitle.textContent = variant.subtitle;
            subtitle.setAttribute('lang', variant.lang);
        }

        function cycle() {
            if (switching) return;
            index = (index + 1) % VARIANTS.length;
            const variant = VARIANTS[index];

            if (reduceMotion) {
                apply(variant);
                return;
            }

            // Clear the entrance animation so its forwards-fill no longer
            // pins opacity, letting the opacity transition take over.
            title.style.animation = 'none';
            subtitle.style.animation = 'none';

            switching = true;
            title.style.opacity = '0';
            subtitle.style.opacity = '0';

            // Swap the text while invisible, then fade back in
            setTimeout(() => {
                apply(variant);
                title.style.opacity = '1';
                subtitle.style.opacity = '1';
                switching = false;
            }, 280);
        }

        star.addEventListener('click', cycle);
        star.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cycle();
            }
        });
    });
})();
