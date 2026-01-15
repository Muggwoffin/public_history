/**
 * Landing Images Carousel
 * Rotates images daily based on landing-config.js
 */

(function() {
    'use strict';

    /**
     * Initialize image rotation
     */
    function initCarousel() {
        if (typeof landingConfig === 'undefined') {
            console.warn('Landing config not loaded');
            return;
        }

        Object.keys(landingConfig).forEach(boxName => {
            const config = landingConfig[boxName];
            if (config.images && config.images.length > 0) {
                rotateImage(boxName, config);
            }
        });
    }

    /**
     * Rotate image for a specific box
     * @param {string} boxName - The name of the box/section
     * @param {Object} config - The configuration object
     */
    function rotateImage(boxName, config) {
        const imageIndex = getImageIndex(boxName, config);
        const imagePath = config.images[imageIndex];

        // Find the element to update
        // This is a placeholder - adjust selectors based on your HTML structure
        const element = document.querySelector(`[data-carousel="${boxName}"]`);

        if (!element) {
            console.warn(`Carousel element for "${boxName}" not found. Add data-carousel="${boxName}" attribute to your element.`);
            return;
        }

        // Update the image
        if (element.tagName === 'IMG') {
            element.src = imagePath;
        } else {
            element.style.backgroundImage = `url('${imagePath}')`;
        }
    }

    /**
     * Get the current image index based on rotation frequency
     * @param {string} boxName - The name of the box/section
     * @param {Object} config - The configuration object
     * @returns {number} - The image index to use
     */
    function getImageIndex(boxName, config) {
        const images = config.images;
        const rotation = config.rotation || 'daily';

        // Get current rotation period
        const period = getRotationPeriod(rotation);

        // Calculate index based on period
        const index = period % images.length;

        return index;
    }

    /**
     * Get the current rotation period number
     * @param {string} frequency - "daily" or "weekly"
     * @returns {number} - The period number
     */
    function getRotationPeriod(frequency) {
        const now = new Date();

        if (frequency === 'daily') {
            // Days since epoch
            const msPerDay = 24 * 60 * 60 * 1000;
            return Math.floor(now.getTime() / msPerDay);
        } else if (frequency === 'weekly') {
            // Weeks since epoch
            const msPerWeek = 7 * 24 * 60 * 60 * 1000;
            return Math.floor(now.getTime() / msPerWeek);
        }

        return 0;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
})();
