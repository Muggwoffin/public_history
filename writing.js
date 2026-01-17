/**
 * Selected Writing Data
 * Articles, essays, and other writing for popular audiences
 *
 * DATA STRUCTURE:
 * - title: Article title (string)
 * - outlet: Publication outlet (string)
 * - date: Publication date (string, e.g., "March 2024")
 * - excerpt: Brief summary/excerpt (string, 1-2 sentences)
 * - link: URL to article (string)
 * - outletLogo: Path to outlet logo image (string)
 */

const writing = [
    {
        title: 'Article Title for Popular Outlet',
        outlet: 'Outlet Name',
        date: 'Date Published',
        excerpt: 'Brief excerpt or summary of the article...',
        link: '#',
        outletLogo: 'images/outlet-logo-1.png'
    },
    {
        title: 'Another Article Title',
        outlet: 'Outlet Name',
        date: 'Date Published',
        excerpt: 'Brief excerpt or summary...',
        link: '#',
        outletLogo: 'images/outlet-logo-2.png'
    },
    {
        title: 'Third Article Title',
        outlet: 'Outlet Name',
        date: 'Date Published',
        excerpt: 'Brief excerpt or summary...',
        link: '#',
        outletLogo: 'images/outlet-logo-3.png'
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = writing;
}
