/**
 * Events Data
 * Stores upcoming and past events for the PUBLIC HISTORY section
 *
 * DATA STRUCTURE:
 * - title: Event title (string)
 * - date: Event date in YYYY-MM-DD format (string)
 * - time: Event time in HH:MM 24-hour format (string)
 * - timezone: Timezone abbreviation (string, e.g., "EST", "GMT", "PST")
 * - location: Venue or "Online" (string)
 * - description: Brief description of the event (string)
 * - link: Registration or info link (string or null)
 * - badge: Badge label like "Online", "Hybrid", "In-Person" (string)
 */

const events = [
    {
        id: 'kennan-institute-2026',
        title: 'The Long View: Kennan Institute Discussion',
        date: '2026-02-26',
        time: '14:00',
        timezone: 'EST',
        location: 'Online',
        description: 'Join Dr Casey for a discussion on the intersection of labor history and modern political movements at the Kennan Institute\'s Long View series.',
        link: 'https://www.timeanddate.com/worldclock/converter.html?iso=20260226T190000&p1=263',
        badge: 'Online'
    }
    // Add more events here
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = events;
}
