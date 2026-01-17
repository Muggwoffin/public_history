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
    title: 'Example Game',
    developer: 'Example Developer',
    cover: 'images/current-playing.jpg',
    note: 'A placeholder game entry. Update this from the admin panel.'
};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentPlaying;
}
