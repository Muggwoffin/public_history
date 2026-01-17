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
        "title": "Documentary Title",
        "productionCompany": "Production Company",
        "year": "Year",
        "runtime": "Runtime",
        "role": "Producer / Researcher / Historical Consultant",
        "description": "Brief description of the documentary and your involvement. What historical questions does it explore? What makes it significant? How does it bring the past to contemporary audiences?",
        "watchLink": "#",
        "logo": "images/documentary-logo-1.png"
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = documentaries;
}
