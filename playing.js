/**
 * Current Playing Data
 * Stores information about what Dr Casey is currently playing
 *
 * DATA STRUCTURE:
 * - title: Game title (string)
 * - developer: Game developer (string)
 * - cover: Path to cover image (string)
 * - note: Short reflection or description (string, 1-2 sentences)
 */

const currentPlaying = {
    "title": "Final Fantasy VII Remake",
    "developer": "Square Enix",
    "cover": "images/current-playing.jpg",
    "note": "Took me a while to get around to this one, but it's excellent. "
};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentPlaying;
}
