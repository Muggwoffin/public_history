/**
 * Landing Images Configuration
 * Controls rotating images for various sections of the site
 */

const landingConfig = {
    "about": {
        "images": [
            "images/landing/about/about1.jpg",
            "images/landing/about/1768649234584-Cover page 1.jpg",
            "images/landing/about/1768649236027-Torn photograph.jpg",
            "images/landing/about/1768649237050-Eva Lewinski.jpg"
        ],
        "rotation": "daily",
        "label": "About Box"
    },
    "contact": {
        "images": [
            "images/landing/contact/contact1.jpg"
        ],
        "rotation": "daily",
        "label": "Contact Box"
    },
    "books": {
        "images": [
            "images/landing/books/books1.jpg"
        ],
        "rotation": "daily",
        "label": "Books Box"
    },
    "public-history": {
        "images": [
            "images/landing/public-history/history1.jpg"
        ],
        "rotation": "daily",
        "label": "Public History Box"
    },
    "newsletter": {
        "images": [
            "images/landing/newsletter/newsletter1.jpg"
        ],
        "rotation": "daily",
        "label": "Newsletter Box"
    },
    "selected-writing": {
        "images": [
            "images/landing/selected-writing/writing1.jpg"
        ],
        "rotation": "daily",
        "label": "Selected Writing Box"
    }
};

// Export for use in carousel script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = landingConfig;
}
