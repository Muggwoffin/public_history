/**
 * Podcasts Data
 * Recent podcast appearances and interviews
 *
 * DATA STRUCTURE:
 * - title: Episode title (string)
 * - podcastName: Name of the podcast (string)
 * - year: Year of episode (string)
 * - embedUrl: Podcast embed URL (string)
 * - description: Brief description (string)
 */

const podcasts = [
    {
        title: 'Hotel Lux: An Intimate History of Communism\'s',
        podcastName: 'Irish History Podcast',
        year: '2024',
        embedUrl: 'https://embed.podcasts.apple.com/gb/podcast/hotel-lux-an-intimate-history-of-communisms/id401651007?i=1000671202117',
        description: 'A discussion of the Hotel Lux in Moscow and the revolutionary families who intersected there during the tumultuous 1920s.'
    },
    {
        title: 'Special Episode: Gavin Arthur with Maurice Casey',
        podcastName: 'Bad Gays',
        year: '2024',
        embedUrl: 'https://embed.podcasts.apple.com/gb/podcast/special-episode-gavin-arthur-with-maurice-casey/id1455620224?i=1000712193181',
        description: 'Exploring the life of Gavin Arthur, grandson of President Chester A. Arthur, who became a bohemian astrologer and countercultural figure in San Francisco.'
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = podcasts;
}
