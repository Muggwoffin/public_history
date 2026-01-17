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
        "title": "Who are the Irish? ",
        "outlet": "The Guardian",
        "date": "25 September 2024",
        "excerpt": "The far right demands a pure Irishness. But our island story has long been interwoven with other ethnicities and diasporas",
        "link": "https://www.theguardian.com/commentisfree/2024/sep/25/who-are-the-irish-history-shows-weve-been-a-mixed-bunch-for-centuries",
        "outletLogo": "images/outlet-logo-1.png"
    },
    {
        "title": "Fellow Travellers",
        "outlet": "Times Literary Supplement",
        "date": "3 October 2025",
        "excerpt": "On Lenin, Mao, Fidel and Warren Beatty",
        "link": "https://www.the-tls.com/history/twentieth-century-onwards-history/three-revolutions-simon-hall-book-review-maurice-j-casey",
        "outletLogo": "images/outlet-logo-2.png"
    },
    {
        "title": "Third Article Title",
        "outlet": "Outlet Name",
        "date": "Date Published",
        "excerpt": "Brief excerpt or summary...",
        "link": "#",
        "outletLogo": "images/outlet-logo-3.png"
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = writing;
}
