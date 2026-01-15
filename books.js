/**
 * Books Data
 * Stores published books for the BOOKS section
 *
 * DATA STRUCTURE:
 * - id: Unique identifier (string)
 * - title: Book title (string)
 * - publisher: Publisher name (string)
 * - year: Publication year (string or number)
 * - description: Short description (string)
 * - cover: Path to cover image (string)
 * - publisherLink: Link to publisher page (string or null)
 * - reviewsLink: Link to reviews (string or null)
 */

const books = [
    {
        id: 'hotel-lux-2024',
        title: 'Hotel Lux: An Intimate History of Communism\'s Forgotten Radicals',
        publisher: 'Footnote Press',
        year: '2024',
        description: 'Critically acclaimed book uncovering the intimate lives of international communists who lived in Moscow\'s Hotel Lux during the 1920s–1940s, revealing forgotten stories of idealism, love, betrayal, and terror. Shortlisted for Irish Book Awards 2024 (History Book of Year).',
        cover: 'images/book-cover-1.png',
        publisherLink: 'https://footnotepress.com',
        reviewsLink: null
    }
    // Add more books here
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = books;
}
