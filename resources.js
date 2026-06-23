/**
 * Resources Data
 * Lightweight research resources shown on the Tools page (tools.html),
 * grouped by category and rendered by resources-renderer.js. Distinct from
 * tools.js (rich vault/software entries) so this stays a simple flat list.
 *
 * DATA STRUCTURE (per resource):
 * - category:    Grouping label, e.g. "Bibliography" / "Reading guide" / "Dataset"
 * - title:       Resource title (string)
 * - source:      Where it's drawn from (string, optional)
 * - format:      Short format/type chip, e.g. "Web list" / "PDF · 18 pp" / ".ris"
 * - description: One- or two-line summary (string)
 * - url:         Link target (in-repo path or full URL)
 * - linkLabel:   Action verb, e.g. "View" / "Download" (defaults to "Download")
 */

const resources = [
    {
        "category": "Bibliography",
        "title": "Comintern-Era Memoirs & Autobiographies",
        "source": "Curated & annotated",
        "format": "Web list",
        "description": "Autobiography and memoir by international activists who spent time in the Soviet Union, 1919–1943 — published works plus archival and unpublished sources.",
        "url": "bibliography.html?slug=comintern-memoirs",
        "linkLabel": "View"
    }
];

// Export for tooling/tests; ignored by the browser.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = resources;
}
