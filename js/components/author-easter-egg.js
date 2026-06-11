/**
 * Author Photo Easter Egg
 * Mirage shimmer effect that swaps the author photo with an alternate
 * image (data-alt-src) on click or keyboard activation.
 */

(function () {
    'use strict';

    const { onReady } = SiteCore;

    const ANIMATION_DURATION = 700; // ms
    const SWAP_TIMING = ANIMATION_DURATION / 2;

    function initEasterEgg() {
        const authorImg = document.querySelector('.author-photo-img');
        const container = document.querySelector('.author-photo-container');

        if (!authorImg || !authorImg.hasAttribute('data-alt-src')) return;

        let isAnimating = false;

        function swapImages() {
            const currentSrc = authorImg.getAttribute('src');
            authorImg.setAttribute('src', authorImg.getAttribute('data-alt-src'));
            authorImg.setAttribute('data-alt-src', currentSrc);
        }

        function handleActivation() {
            if (isAnimating) return;
            isAnimating = true;
            authorImg.classList.add('mirage-transition');
            setTimeout(swapImages, SWAP_TIMING);
            setTimeout(() => {
                authorImg.classList.remove('mirage-transition');
                isAnimating = false;
            }, ANIMATION_DURATION);
        }

        authorImg.addEventListener('click', handleActivation);
        authorImg.style.cursor = 'pointer';

        if (container) {
            container.setAttribute('tabindex', '0');
            container.setAttribute('role', 'button');
            container.setAttribute('aria-label', 'Click to see an alternate photo');
            container.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActivation();
                }
            });
        }
    }

    onReady(initEasterEgg);
})();
