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
    },
    {
        "id": "first-add-oats-then-kill-hitler-a-recipe-for-resistance-in-underground-europe-1920s-1940s",
        "title": "First Add Oats, Then Kill Hitler: A Recipe for Resistance in Underground Europe, 1920s-1940s",
        "date": "2026-02-20",
        "time": "16:00",
        "timezone": "GMT",
        "location": "01/003, 27 University Square, QUB",
        "badge": "In-Person",
        "description": "A paper on my new project examining the ISK.",
        "link": null
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = events;
}
