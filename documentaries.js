/**
 * Documentaries Data
 * Films and documentaries featuring historical consultation or participation
 *
 * DATA STRUCTURE:
 * - title: Documentary title (string)
 * - productionCompany: Production company name (string)
 * - year: Year of release (string)
 * - runtime: Runtime (string, optional)
 * - role: Role in production (string)
 * - description: Brief description (string)
 * - watchLink: URL to watch (string, optional)
 * - logo: Path to production company/documentary logo (string, optional)
 */

const documentaries = [
    {
        "title": "The Alpenpost: A Girls' Guide to Fighting Hitler & Stalin",
        "productionCompany": "Storyscape",
        "year": "2026",
        "broadcastDate": "March 2026",
        "commissioner": "BBC Radio 4",
        "runtime": "c. 30 mins",
        "role": "Researcher / Presenter",
        "description": "A child's eye view of the the anti-Nazi underground, told through the story of a remarkable handmade newspaper. Forthcoming on BBC Radio 4.",
        "logo": "images/documentary-logo-1.png",
        "watchLink": "https://www.bbc.co.uk/sounds/play/live/bbc_radio_fourfm"
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = documentaries;
}
