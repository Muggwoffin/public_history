/**
 * Current Reading Data
 * Stores information about what Dr Casey is currently reading
 *
 * DATA STRUCTURE:
 * - title: Book title (string)
 * - author: Book author (string)
 * - cover: Path to cover image (string)
 * - note: Short reflection or description (string, 1-2 sentences)
 */

const currentReading = {
    title: 'The Years of Rice and Salt',
    author: 'Kim Stanley Robinson',
    cover: 'images/current-reading.jpg',
    note: 'A fascinating alternate history exploring what the world might have looked like without European colonialism. Robinson\'s attention to detail and deep historical research makes this a thought-provoking read.'
};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentReading;
}
