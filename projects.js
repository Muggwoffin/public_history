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
    {
        id: 'ba-trinity-2011-2015',
        title: 'BA in English Literature and History',
        type: 'education',
        date: '2011-2015',
        sortDate: '2011-09-01',
        scope: 'academic',
        description: 'First Class Honours degree exploring the intersections of literature and history, culminating in a dissertation on gay rights in the Republic of Ireland during a period of social change, 1973–1990.',
        link: null,
        venue: 'Trinity College Dublin'
    },
    {
        id: 'mphil-cambridge-2015-2016',
        title: 'MPhil in Modern European History',
        type: 'education',
        date: '2015-2016',
        sortDate: '2015-09-01',
        scope: 'academic',
        description: 'Distinction-level research on Irish sympathisers with the Soviet Union\'s \'Great Experiment\', 1917–1938, establishing expertise in transnational radical politics.',
        link: null,
        venue: 'Hughes Hall, University of Cambridge'
    },
    {
        id: 'dphil-oxford-2016-2020',
        title: 'DPhil in History',
        type: 'education',
        date: '2016-2020',
        sortDate: '2016-09-01',
        scope: 'academic',
        description: 'Doctoral research examining Irish women and radical internationalism from suffrage to antifascism, 1916–1939, tracing transnational networks of feminist and socialist activism.',
        link: null,
        venue: 'Jesus College, University of Oxford'
    },
    {
        id: 'teaching-oxford-hertford-2017',
        title: 'Nationalism, Politics and Culture in Modern Ireland',
        type: 'teaching',
        date: '2017',
        sortDate: '2017-01-01',
        scope: 'academic',
        description: 'Co-taught Oxford tutorial course examining Irish nationalism\'s development through political, cultural, and social lenses.',
        link: null,
        venue: 'Hertford College, Oxford'
    },
    {
        id: 'teaching-oxford-blackfriars-2019-2020',
        title: '20th Century British History Course',
        type: 'teaching',
        date: '2019-2020',
        sortDate: '2019-09-01',
        scope: 'academic',
        description: 'Designed and taught course covering political, social, and cultural transformations in 20th-century Britain.',
        link: null,
        venue: 'Blackfriars College, Oxford'
    },
    {
        id: 'teaching-bath-2020',
        title: 'Irish Nationalisms Course',
        type: 'teaching',
        date: '2020',
        sortDate: '2020-01-01',
        scope: 'academic',
        description: 'Designed and delivered course examining diverse forms of Irish nationalism from the 19th century to the present for North American study abroad students.',
        link: null,
        venue: 'Advanced Studies in England, Bath'
    },
    {
        id: 'teaching-qub-2022-2025',
        title: 'Irish History and Public History Teaching',
        type: 'teaching',
        date: '2022-2025',
        sortDate: '2022-09-01',
        scope: 'academic',
        description: 'Teaching on undergraduate and MA modules covering Irish history, public history methods, and transnational approaches to the past.',
        link: null,
        venue: 'Queen\'s University Belfast'
    },
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
    {
        id: 'moscow-visiting-2018',
        title: 'Visiting Researcher, MGIMO Moscow',
        type: 'fellowship',
        date: '2018',
        sortDate: '2018-01-01',
        scope: 'international',
        description: 'Archival research in Moscow examining Irish-Soviet connections and the lives of international communists in the Comintern.',
        link: null,
        venue: 'MGIMO, Moscow'
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
        id: 'fulbright-2018',
        title: 'Fulbright Scholar',
        type: 'fellowship',
        date: '2018-2019',
        sortDate: '2018-09-01',
        scope: 'international',
        description: 'Year-long fellowship at the Centre for Russian, East European and Euasian Studies, developing research on transnational radical movements and the Comintern.',
        link: null,
        venue: 'Stanford University'
    },
    {
        id: 'epic-historian-2020-2022',
        title: 'Historian in Residence',
        type: 'fellowship',
        date: '2020-2022',
        sortDate: '2020-01-01',
        scope: 'public',
        description: 'Joint appointment with the Irish Department of Foreign Affairs to develop major public-facing exhibitions exploring Irish diaspora histories, including LGBTQ+ and Black Atlantic themes.',
        link: 'https://epicchq.com',
        venue: 'EPIC The Irish Emigration Museum, Dublin'
    },
    {
        id: 'qub-queer-ni-2022-2025',
        title: 'Research Fellow: Queer Northern Ireland Project',
        type: 'fellowship',
        date: '2022-2025',
        sortDate: '2022-01-01',
        scope: 'academic',
        description: 'Three-year AHRC-funded project researching sexuality before liberation in Northern Ireland, combining archival research with oral history and public engagement.',
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
        id: 'boston-college-2023',
        title: 'Visiting Researcher, Boston College',
        type: 'fellowship',
        date: '2023',
        sortDate: '2023-01-01',
        scope: 'international',
        description: 'QUB North American Mobility Fund fellowship for research collaboration with leading scholars in Irish and diaspora studies.',
        link: null,
        venue: 'Boston College, Massachusetts'
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
        id: 'cambridge-fellowship-2025',
        title: 'Horkan Visiting Fellow',
        type: 'fellowship',
        date: 'Early 2025',
        sortDate: '2025-01-01',
        scope: 'international',
        description: 'Prestigious visiting fellowship including delivery of the inaugural Horkan Lecture on intimate histories of communism.',
        link: null,
        venue: 'Sidney Sussex College, Cambridge University'
    },
    {
        id: 'project-1768570314633',
        title: 'Principal Investigator: AHRC Catalyst Grant',
        type: 'fellowship',
        date: '2025-2028',
        sortDate: '2025-01-01',
        scope: 'international',
        description: 'Leading a major AHRC-funded research project exploring anti-Nazi exiles in Britain during the 1920s-1940s.',
        link: null,
        venue: 'Queen\'s University Belfast'
    },
    {
        id: 'pub-tcd-journal-2015',
        title: 'Contesting the Legacy of Ireland\'s Role in Empire',
        type: 'book',
        date: '2015',
        sortDate: '2015-01-01',
        scope: 'academic',
        description: 'Early research article examining contested narratives of Irish involvement in British imperial projects.',
        link: null,
        venue: 'Trinity College Dublin Histories and Humanities Journal'
    },
    {
        id: 'pub-gay-activism-2018',
        title: 'Radical Politics and Gay Activism in Ireland, 1974–1990',
        type: 'book',
        date: '2018',
        sortDate: '2018-01-01',
        scope: 'academic',
        description: 'Peer-reviewed article examining the intersection of left-wing politics and gay rights activism during Ireland\'s social transformation.',
        link: null,
        venue: 'Irish Studies Review'
    },
    {
        id: 'pub-votes-to-revolution-2021',
        title: 'From Votes for Women to World Revolution',
        type: 'book',
        date: '2021',
        sortDate: '2021-01-01',
        scope: 'academic',
        description: 'Chapter tracing the journeys of Irish suffragettes who became committed communists, exploring continuities and ruptures between feminist and socialist movements.',
        link: null,
        venue: 'The Politics of Women\'s Suffrage (University of London Press)'
    },
    {
        id: 'pub-david-fitzgerald-2022',
        title: 'The Transnational Life of David Fitzgerald',
        type: 'book',
        date: '2022',
        sortDate: '2022-01-01',
        scope: 'academic',
        description: 'Chapter examining the international radical career of Irish communist David Fitzgerald across multiple continents.',
        link: null,
        venue: 'Bread Not Profits (Umiskin Press)'
    },
    {
        id: 'pub-mary-mooney-2023',
        title: 'Mary Mooney and the Scottsboro Boys',
        type: 'book',
        date: '2023',
        sortDate: '2023-01-01',
        scope: 'academic',
        description: 'Chapter profiling Irish communist Mary Mooney\'s activism in the international campaign to defend the Scottsboro Boys in 1930s America.',
        link: null,
        venue: 'She Who Struggles (Pluto Press)'
    },
    {
        id: 'pub-irish-latvian-couple-2023',
        title: 'The Transnational Intimacies of an Irish–Latvian Couple, 1916–1921',
        type: 'book',
        date: 'November 2023',
        sortDate: '2023-11-01',
        scope: 'academic',
        description: 'Peer-reviewed article analyzing how an Irish revolutionary and Latvian socialist navigated political commitments and personal relationships across borders during the revolutionary period.',
        link: null,
        venue: 'Contemporary European History'
    },
    {
        id: 'pub-african-diaspora-2024',
        title: 'African Diaspora Politics and the Dublin Theatre Stage, 1830s–1930s',
        type: 'book',
        date: '2024',
        sortDate: '2024-01-01',
        scope: 'academic',
        description: 'Chapter examining how African diaspora politics played out on Dublin stages across a century, challenging narratives of Ireland as racially homogeneous.',
        link: null,
        venue: 'Irish People of Colour anthology'
    },
    {
        id: 'hotel-lux-2024',
        title: 'Hotel Lux: An Intimate History of Communism\'s Forgotten Radicals',
        type: 'book',
        date: '2024',
        sortDate: '2024-01-01',
        scope: 'international',
        description: 'Critically acclaimed book uncovering the intimate lives of international communists who lived in Moscow\'s Hotel Lux during the 1920s–1940s, revealing forgotten stories of idealism, love, betrayal, and terror. Shortlisted for Irish Book Awards 2024 (History Book of Year).',
        link: 'https://footnotepress.com',
        venue: 'Footnote Press'
    },
    {
        id: 'pub-queer-esotericism-2025',
        title: 'Esotericism and Queer Sexuality in an Irish Social Circle, 1890s–1920s',
        type: 'book',
        date: 'March 2025',
        sortDate: '2025-03-01',
        scope: 'academic',
        description: 'Peer-reviewed article exploring connections between esoteric thought and queer sexuality in Irish literary and political circles, examining how figures navigated identity before modern gay liberation.',
        link: null,
        venue: 'History Workshop Journal'
    },
    {
        id: 'out-in-world-2021',
        title: 'Out in the World: Ireland\'s LGBTQ+ Diaspora',
        type: 'exhibition',
        date: '2021',
        sortDate: '2021-01-01',
        scope: 'public',
        description: 'First major exhibition and digital resource documenting Irish LGBTQ+ diaspora experiences across the globe, combining archival research with contemporary testimonies.',
        link: 'https://epicchq.com',
        venue: 'EPIC Irish Emigration Museum, Dublin'
    },
    {
        id: 'revolutionary-routes-2022',
        title: 'Revolutionary Routes: Ireland and the Black Atlantic',
        type: 'exhibition',
        date: '2022',
        sortDate: '2022-01-01',
        scope: 'public',
        description: 'Groundbreaking exhibition uncovering connections between Irish emigrants and Black Atlantic radical politics, from abolitionism to civil rights, challenging dominant narratives of Irish-American history.',
        link: 'https://epicchq.com',
        venue: 'EPIC Irish Emigration Museum, Dublin'
    },
    {
        id: 'media-suffragettes-communists-2018',
        title: 'The Suffragettes Who Became Communists',
        type: 'media',
        date: '2018',
        sortDate: '2018-01-01',
        scope: 'public',
        description: 'Popular history article exploring the radical trajectories of women who moved from fighting for votes to fighting for world revolution.',
        link: null,
        venue: 'History Today'
    },
    {
        id: 'media-franchise-league-2019',
        title: 'The Irish Women\'s Franchise League and the World Revolution',
        type: 'media',
        date: '2019',
        sortDate: '2019-01-01',
        scope: 'national',
        description: 'Article examining how Irish suffragettes\' internationalist visions extended from feminist organizing to global revolutionary movements.',
        link: null,
        venue: 'History Ireland'
    },
    {
        id: 'media-tribune-columnist-2020',
        title: 'Tribune\'s First Women\'s Columnist',
        type: 'media',
        date: '2020',
        sortDate: '2020-01-01',
        scope: 'public',
        description: 'Profile of an overlooked pioneer in socialist feminist journalism and her contributions to 20th-century radical politics.',
        link: null,
        venue: 'Tribune Magazine'
    },
    {
        id: 'media-dear-comrade-2021',
        title: 'Radical Objects: \'Dear Comrade Angela\'',
        type: 'media',
        date: '2021',
        sortDate: '2021-01-01',
        scope: 'public',
        description: 'Object-focused essay using personal letters to explore the intimate dimensions of communist organizing and transnational solidarity.',
        link: null,
        venue: 'History Workshop Online'
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
    },
    {
        id: 'talk-dublin-festival-2021',
        title: 'LGBTQ+ History and Public History',
        type: 'talk',
        date: 'October 2021',
        sortDate: '2021-10-01',
        scope: 'public',
        description: 'Panel discussion on the challenges and opportunities of presenting LGBTQ+ histories in museums and public spaces.',
        link: null,
        venue: 'Dublin Festival of History'
    },
    {
        id: 'talk-resistance-festival-2022',
        title: 'Migration and Museums',
        type: 'talk',
        date: 'September 2022',
        sortDate: '2022-09-01',
        scope: 'public',
        description: 'Public talk examining how museums can tell more inclusive and challenging stories about migration, race, and resistance.',
        link: null,
        venue: 'Resistance Cultures Festival, Dublin'
    },
    {
        id: 'talk-rural-queer-2022',
        title: 'Queer History Workshop',
        type: 'talk',
        date: 'November 2022',
        sortDate: '2022-11-01',
        scope: 'national',
        description: 'Interactive workshop exploring methods and sources for uncovering queer histories in rural Northern Ireland.',
        link: null,
        venue: 'Rural Queer Lives Festival, Ulster Folk Museum'
    },
    {
        id: 'talk-boston-college-2023',
        title: 'Irish Studies Seminar',
        type: 'talk',
        date: 'September 2023',
        sortDate: '2023-09-01',
        scope: 'international',
        description: 'Research presentation exploring Irish connections to international communist movements and the Comintern.',
        link: null,
        venue: 'Boston College, Massachusetts'
    },
    {
        id: 'talk-georgetown-2023',
        title: 'Global Irish Studies Seminar',
        type: 'talk',
        date: 'October 2023',
        sortDate: '2023-10-01',
        scope: 'international',
        description: 'Presentation on transnational approaches to Irish history and the importance of global perspectives on Irish radical politics.',
        link: null,
        venue: 'Georgetown University, Washington DC'
    },
    {
        id: 'talk-oxford-modern-history-2024',
        title: 'Intimate History of the Comintern\'s Moscow Dormitory',
        type: 'talk',
        date: 'January 2024',
        sortDate: '2024-01-01',
        scope: 'international',
        description: 'Seminar presentation on the methodology and findings of Hotel Lux research, examining how intimate life shaped international communist politics.',
        link: null,
        venue: 'Oxford Modern History Seminar'
    },
    {
        id: 'talk-horkan-lecture-2025',
        title: 'Inaugural Horkan Lecture',
        type: 'talk',
        date: 'February 2025',
        sortDate: '2025-02-01',
        scope: 'international',
        description: 'Prestigious inaugural lecture series exploring intimate histories of international communism through the lens of Hotel Lux.',
        link: null,
        venue: 'Sidney Sussex College, Cambridge'
    },
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
    }
];

// Export for use in timeline.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = timelineData;
}
