/**
 * Landing Images Configuration
 * Controls rotating images for various sections of the site
 *
 * DATA STRUCTURE:
 * Each key represents a section/box with:
 * - images: Array of image paths (array of strings)
 * - rotation: Rotation frequency - "daily", "weekly" (string)
 *
 * The carousel script uses localStorage and date-based logic
 * to ensure all visitors see the same image on a given day.
 */

const landingConfig = {
    hero: {
        images: [
            'images/landing/hero/hero1.jpg',
            'images/landing/hero/hero2.jpg',
            'images/landing/hero/hero3.jpg'
        ],
        rotation: 'daily'
    },
    about: {
        images: [
            'images/landing/about/about1.jpg',
            'images/landing/about/about2.jpg'
        ],
        rotation: 'daily'
    }
    // Add more image boxes as needed
};

// Export for use in carousel script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = landingConfig;
}
