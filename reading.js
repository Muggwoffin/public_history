/**
 * Current Reading Data
 * Stores information about what Dr Casey is currently reading
 */

const currentReading = {
    "title": "Indignity: A Life Reimagined",
    "author": "Lea Ypi",
    "cover": "images/current-reading.jpg",
    "note": "Ypi back with a banger. An imaginative take on how we write historical biography."
};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentReading;
}
