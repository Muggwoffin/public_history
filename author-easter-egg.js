/**
 * Author Photo Easter Egg
 * Adds a mirage shimmer effect and image swap on click
 */

(function() {
    'use strict';

    const ANIMATION_DURATION = 700; // milliseconds
    const SWAP_TIMING = ANIMATION_DURATION / 2; // Swap at 50% of animation

    /**
     * Initialize the Easter egg
     */
    function initEasterEgg() {
        const authorImg = document.querySelector('.author-photo-img');
        const container = document.querySelector('.author-photo-container');

        if (!authorImg) {
            console.warn('Author photo not found for Easter egg');
            return;
        }

        // Ensure data-alt-src attribute exists
        if (!authorImg.hasAttribute('data-alt-src')) {
            console.warn('Author photo missing data-alt-src attribute');
            return;
        }

        let isAnimating = false;

        /**
         * Handle the click/activation event
         */
        function handleActivation() {
            if (isAnimating) return;

            isAnimating = true;

            // Add the mirage transition class
            authorImg.classList.add('mirage-transition');

            // Swap images at 50% of animation
            setTimeout(() => {
                swapImages();
            }, SWAP_TIMING);

            // Remove animation class when done
            setTimeout(() => {
                authorImg.classList.remove('mirage-transition');
                isAnimating = false;
            }, ANIMATION_DURATION);
        }

        /**
         * Swap the src and data-alt-src attributes
         */
        function swapImages() {
            const currentSrc = authorImg.getAttribute('src');
            const altSrc = authorImg.getAttribute('data-alt-src');

            authorImg.setAttribute('src', altSrc);
            authorImg.setAttribute('data-alt-src', currentSrc);
        }

        // Click handler
        authorImg.addEventListener('click', handleActivation);
        authorImg.style.cursor = 'pointer';

        // Keyboard accessibility
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEasterEgg);
    } else {
        initEasterEgg();
    }
})();
