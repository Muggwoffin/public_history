/**
 * Events Data
 * Stores upcoming and past events for the PUBLIC HISTORY section
 */

const events = [
    {
        "id": "the-long-view-kennan-institute-discussion",
        "title": "The Long View: Kennan Institute Discussion",
        "date": "2026-02-26",
        "time": "11:00",
        "timezone": "EST",
        "location": "Online",
        "badge": "Online",
        "description": "Discussing Hotel Lux as part of the Kennan Institute's Long View series.",
        "link": "https://www.kennaninstitute.org/longview"
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = events;
}
