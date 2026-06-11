/**
 * Landing Images Carousel
 * Rotates images on a fixed daily/weekly schedule based on the global
 * `landingConfig` data (landing-config.js). Elements opt in with a
 * data-carousel="<boxName>" attribute.
 */

(function () {
    'use strict';

    const { registerRenderer } = SiteCore;

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    /**
     * Deterministic rotation period number for a frequency.
     * @param {string} frequency - "daily" or "weekly"
     */
    function getRotationPeriod(frequency) {
        const now = Date.now();
        if (frequency === 'weekly') return Math.floor(now / (7 * MS_PER_DAY));
        if (frequency === 'daily') return Math.floor(now / MS_PER_DAY);
        return 0;
    }

    function rotateImage(boxName, config) {
        const element = document.querySelector(`[data-carousel="${boxName}"]`);
        if (!element) return; // Carousel targets are optional

        const period = getRotationPeriod(config.rotation || 'daily');
        const imagePath = config.images[period % config.images.length];

        if (element.tagName === 'IMG') {
            element.src = imagePath;
        } else {
            element.style.backgroundImage = `url('${imagePath}')`;
        }
    }

    registerRenderer(() => landingConfig, (landingConfig) => {
        Object.keys(landingConfig).forEach(boxName => {
            const config = landingConfig[boxName];
            if (config.images && config.images.length > 0) {
                rotateImage(boxName, config);
            }
        });
    });
})();
