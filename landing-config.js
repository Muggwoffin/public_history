/**
 * Landing Images Configuration
 * Controls rotating images for the 6 landing page boxes
 *
 * DATA STRUCTURE:
 * Each key represents a section/box with:
 * - images: Array of image paths (array of strings)
 * - rotation: Rotation frequency - "daily", "weekly" (string)
 * - label: Display name for admin panel (string)
 *
 * The carousel script uses date-based logic to ensure
 * all visitors see the same image on a given day.
 */

const landingConfig = {
    about: {
        images: [
            'images/landing/about/about1.jpg'
        ],
        rotation: 'daily',
        label: 'About Box'
    },
    contact: {
        images: [
            'images/landing/contact/contact1.jpg'
        ],
        rotation: 'daily',
        label: 'Contact Box'
    },
    books: {
        images: [
            'images/landing/books/books1.jpg'
        ],
        rotation: 'daily',
        label: 'Books Box'
    },
    'public-history': {
        images: [
            'images/landing/public-history/history1.jpg'
        ],
        rotation: 'daily',
        label: 'Public History Box'
    },
    newsletter: {
        images: [
            'images/landing/newsletter/newsletter1.jpg'
        ],
        rotation: 'daily',
        label: 'Newsletter Box'
    },
    'selected-writing': {
        images: [
            'images/landing/selected-writing/writing1.jpg'
        ],
        rotation: 'daily',
        label: 'Selected Writing Box'
    }
};

// Export for use in carousel script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = landingConfig;
}
