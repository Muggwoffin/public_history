/**
 * Career Timeline Data for Dr. Maurice Casey
 *
 * DATA STRUCTURE:
 * Each project object contains:
 * - id: Unique identifier (string)
 * - title: Project/achievement title (string)
 * - type: Category - 'book', 'exhibition', 'fellowship', 'teaching', 'media', 'talk' (string)
 * - date: Display date (string) - e.g., "2024", "2018-2019", "June 2025"
 * - sortDate: Date for sorting in YYYY-MM-DD format (string)
 * - scope: Audience/reach - 'academic', 'public', 'international', 'national' (string)
 * - description: 1-2 sentence summary (string)
 * - link: Optional URL for more details (string or null)
 * - venue: Optional location/institution (string or null)
 *
 * TO ADD A NEW ITEM:
 * Copy an existing object, update the fields, and add it to the array.
 * Make sure sortDate is in YYYY-MM-DD format for proper chronological ordering.
 */

const timelineData = [
    // Books & Publications
    {
        id: 'hotel-lux-2024',
        title: 'Hotel Lux: An Intimate History of Communism\'s Forgotten Radicals',
        type: 'book',
        date: '2024',
        sortDate: '2024-01-01',
        scope: 'international',
        description: 'First English-language account of the Communist International\'s Moscow dormitory, drawing on 25+ archives in multiple languages. Shortlisted for Irish Book Awards 2024 (History Book of Year).',
        link: 'https://footnotepress.com',
        venue: 'Footnote Press'
    },

    // Fellowships & Awards
    {
        id: 'cambridge-fellowship-2025',
        title: 'Horkan Visiting Fellow',
        type: 'fellowship',
        date: 'Early 2025',
        sortDate: '2025-01-01',
        scope: 'international',
        description: 'Visiting fellowship at Sidney Sussex College, Cambridge University, pursuing research on interwar radicalism and intimate history.',
        link: null,
        venue: 'Sidney Sussex College, Cambridge University'
    },
    {
        id: 'qub-researcher-2024',
        title: 'Visiting Researcher',
        type: 'fellowship',
        date: '2024-Present',
        sortDate: '2024-01-01',
        scope: 'academic',
        description: 'Research fellowship at Queen\'s University Belfast, teaching in the MA in Public History program and supervising postgraduate and undergraduate students.',
        link: null,
        venue: 'Queen\'s University Belfast'
    },
    {
        id: 'award-2023',
        title: 'Competitive Research Prize',
        type: 'fellowship',
        date: '2023',
        sortDate: '2023-01-01',
        scope: 'academic',
        description: 'Awarded competitive prize recognizing excellence in historical research and public engagement.',
        link: null,
        venue: null
    },
    {
        id: 'fulbright-2018',
        title: 'Fulbright Scholar',
        type: 'fellowship',
        date: '2018-2019',
        sortDate: '2018-09-01',
        scope: 'international',
        description: 'Fulbright scholarship to Stanford University, conducting archival research on early twentieth-century revolutionary politics and transnational radical networks.',
        link: null,
        venue: 'Stanford University'
    },
    {
        id: 'award-2018',
        title: 'Academic Achievement Award',
        type: 'fellowship',
        date: '2018',
        sortDate: '2018-06-01',
        scope: 'academic',
        description: 'Recognized for outstanding contributions to historical scholarship and innovative research methodologies.',
        link: null,
        venue: null
    },
    {
        id: 'award-2017',
        title: 'Early Career Research Prize',
        type: 'fellowship',
        date: '2017',
        sortDate: '2017-01-01',
        scope: 'academic',
        description: 'Awarded prize for exceptional early career research in twentieth-century European history.',
        link: null,
        venue: null
    },

    // Exhibitions
    {
        id: 'revolutionary-routes-2022',
        title: 'Revolutionary Routes: Ireland and the Black Atlantic',
        type: 'exhibition',
        date: '2022',
        sortDate: '2022-01-01',
        scope: 'public',
        description: 'Curated exhibition exploring connections between Irish revolutionary politics and Black Atlantic radical movements, bringing archival research to public audiences.',
        link: 'https://epicchq.com',
        venue: 'EPIC Irish Emigration Museum, Dublin'
    },
    {
        id: 'out-in-world-2021',
        title: 'Out in the World: Ireland\'s LGBTQ+ Diaspora',
        type: 'exhibition',
        date: '2021',
        sortDate: '2021-01-01',
        scope: 'public',
        description: 'Groundbreaking exhibition documenting Ireland\'s LGBTQ+ diaspora experience, combining personal narratives with historical research and visual storytelling.',
        link: 'https://epicchq.com',
        venue: 'EPIC Irish Emigration Museum, Dublin'
    },

    // Teaching
    {
        id: 'digital-pasts-2024',
        title: 'Digital Technologies and Digital Pasts',
        type: 'teaching',
        date: '2024',
        sortDate: '2024-01-01',
        scope: 'academic',
        description: 'Designed and taught innovative module exploring the intersection of digital humanities and historical practice for MA students in Public History.',
        link: null,
        venue: 'Queen\'s University Belfast'
    },
    {
        id: 'ma-public-history',
        title: 'MA in Public History Teaching',
        type: 'teaching',
        date: '2024-Present',
        sortDate: '2024-01-01',
        scope: 'academic',
        description: 'Teaching undergraduate and postgraduate courses in public history, supervising MA dissertations and undergraduate research projects on diverse topics in twentieth-century history.',
        link: null,
        venue: 'Queen\'s University Belfast'
    },

    // Media & Public Engagement
    {
        id: 'talks-summer-2025',
        title: 'Public Lecture Series',
        type: 'talk',
        date: 'June-July 2025',
        sortDate: '2025-06-01',
        scope: 'public',
        description: 'Series of invited talks on Hotel Lux and interwar radical history, engaging diverse audiences with accessible historical narratives.',
        link: null,
        venue: 'Various venues'
    },
    {
        id: 'media-appearances-2024',
        title: 'Media Appearances & Press Coverage',
        type: 'media',
        date: '2024',
        sortDate: '2024-01-01',
        scope: 'public',
        description: 'Featured in The Irish Times, The Guardian, Publishers\' Weekly, History Today, History Ireland, Jacobin, Tribune, Meduza, and Monocle discussing Hotel Lux and radical history.',
        link: null,
        venue: 'International media outlets'
    },
    {
        id: 'radio-appearances',
        title: 'Radio & Broadcast Media',
        type: 'media',
        date: '2024',
        sortDate: '2024-06-01',
        scope: 'public',
        description: 'Radio appearances on RTÉ Radio One, Newstalk, BBC Radio 4, and TG4, bringing historical research to wider audiences through accessible broadcast discussions.',
        link: null,
        venue: 'National and international broadcasters'
    }
];

// Export for use in timeline.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = timelineData;
}
