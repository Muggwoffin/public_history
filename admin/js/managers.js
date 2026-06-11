/**
 * Concrete Content Managers
 * Declarative configurations binding each site data file to the generic
 * CollectionManager / SingletonEditor. Adding a new content type means
 * adding a config here (plus a SiteData.FILES entry) — no new UI code.
 */

(function () {
    'use strict';

    /** The shared data store; created by app.js after login. */
    const store = () => AdminApp.dataStore;

    /** URL-safe slug for generated ids. */
    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const orNull = (value) => value || null;

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------

    const eventsManager = new CollectionManager({
        containerId: 'events-manager',
        title: 'Events Manager',
        noun: 'Event',
        fileKey: 'events',
        store,
        fields: [
            { name: 'title', label: 'Event Title', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'time', label: 'Time', type: 'time', required: true },
            { name: 'timezone', label: 'Timezone', required: true, placeholder: 'EST' },
            { name: 'location', label: 'Location / Venue', required: true, placeholder: 'e.g., Online, Sidney Sussex College, etc.' },
            {
                name: 'badge', label: 'Badge', type: 'select',
                options: [
                    { value: 'Online', label: 'Online' },
                    { value: 'Hybrid', label: 'Hybrid' },
                    { value: 'In-Person', label: 'In-Person' },
                    { value: '', label: 'None' }
                ]
            },
            { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true },
            { name: 'link', label: 'Registration / Info Link', type: 'url', placeholder: 'https://...' }
        ],
        summarize: (event) => ({
            title: event.title,
            meta: `${event.date} • ${event.time} ${event.timezone}${event.badge ? ' • ' + event.badge : ''}`,
            detail: event.location
        }),
        groupForDisplay: (items) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = items
                .filter(e => new Date(e.date + 'T00:00:00') >= today)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            const past = items
                .filter(e => new Date(e.date + 'T00:00:00') < today)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            const groups = [];
            if (upcoming.length) groups.push({ label: 'Upcoming Events', items: upcoming });
            if (past.length) groups.push({ label: 'Past Events', items: past, cssClass: 'past' });
            return groups;
        },
        buildItem: (values) => ({
            id: slugify(values.title),
            title: values.title,
            date: values.date,
            time: values.time,
            timezone: values.timezone,
            location: values.location,
            badge: values.badge,
            description: values.description,
            link: orNull(values.link)
        })
    });

    // ------------------------------------------------------------------
    // Books
    // ------------------------------------------------------------------

    const booksManager = new CollectionManager({
        containerId: 'books-manager',
        title: 'Books Manager',
        noun: 'Book',
        fileKey: 'books',
        store,
        fields: [
            { name: 'title', label: 'Book Title', required: true },
            { name: 'publisher', label: 'Publisher', required: true },
            { name: 'year', label: 'Year', required: true, placeholder: '2024' },
            { name: 'cover', label: 'Cover Image Path', required: true, placeholder: 'images/book-cover-1.png', help: 'Upload image via Images tab, then paste path here' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true },
            { name: 'publisherLink', label: 'Publisher Link', type: 'url', placeholder: 'https://...' },
            { name: 'reviewsLink', label: 'Reviews Link', type: 'url', placeholder: 'https://...' },
            { name: 'bookshopLink', label: 'Bookshop.org Purchase Link', type: 'url', placeholder: 'https://bookshop.org/...', help: 'Add Bookshop.org link for "Purchase Now" button' }
        ],
        summarize: (book) => ({
            title: book.title,
            meta: `${book.publisher}, ${book.year}`
        }),
        groupForDisplay: (items) => [{
            label: null,
            items: [...items].sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10))
        }],
        buildItem: (values) => ({
            id: slugify(values.title),
            title: values.title,
            publisher: values.publisher,
            year: values.year,
            cover: values.cover,
            description: values.description,
            publisherLink: orNull(values.publisherLink),
            reviewsLink: orNull(values.reviewsLink),
            bookshopLink: orNull(values.bookshopLink)
        })
    });

    // ------------------------------------------------------------------
    // Selected writing
    // ------------------------------------------------------------------

    const writingManager = new CollectionManager({
        containerId: 'writing-manager',
        title: 'Selected Writing Manager',
        noun: 'Article',
        fileKey: 'writing',
        store,
        fields: [
            { name: 'title', label: 'Article Title', required: true },
            { name: 'outlet', label: 'Outlet', required: true, placeholder: 'Publication Name' },
            { name: 'date', label: 'Date', required: true, placeholder: 'March 2024' },
            { name: 'excerpt', label: 'Excerpt/Summary', type: 'textarea', rows: 3, required: true, placeholder: '1-2 sentence summary' },
            { name: 'link', label: 'Article Link', type: 'url', required: true, placeholder: 'https://...' },
            { name: 'outletLogo', label: 'Outlet Logo Path', required: true, placeholder: 'images/outlet-logo-1.png', help: 'Upload image via Images tab, then paste path here' }
        ],
        summarize: (article) => ({
            title: article.title,
            meta: `${article.outlet} • ${article.date}`
        }),
        buildItem: (values) => ({
            title: values.title,
            outlet: values.outlet,
            date: values.date,
            excerpt: values.excerpt,
            link: values.link,
            outletLogo: values.outletLogo
        })
    });

    // ------------------------------------------------------------------
    // Documentaries
    // ------------------------------------------------------------------

    const documentariesManager = new CollectionManager({
        containerId: 'documentaries-manager',
        title: 'Documentaries Manager',
        noun: 'Documentary',
        fileKey: 'documentaries',
        store,
        fields: [
            { name: 'title', label: 'Documentary Title', required: true },
            { name: 'productionCompany', label: 'Production Company', required: true },
            { name: 'year', label: 'Year', required: true, placeholder: '2024' },
            { name: 'broadcastDate', label: 'Broadcast Date', placeholder: 'March 2024' },
            { name: 'commissioner', label: 'Commissioner', placeholder: 'BBC, RTE, etc.' },
            { name: 'runtime', label: 'Runtime', placeholder: '90 mins' },
            { name: 'role', label: 'Your Role', required: true, placeholder: 'Producer / Researcher / Historical Consultant' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true },
            { name: 'logo', label: 'Logo Image Path', placeholder: 'images/documentary-logo-1.png', help: 'Upload image via Images tab, then paste path here' },
            { name: 'watchLink', label: 'Watch/Listen Link', type: 'url', placeholder: 'https://...' }
        ],
        summarize: (doc) => ({
            title: doc.title,
            meta: `${doc.productionCompany} • ${doc.year}`
        }),
        groupForDisplay: (items) => [{
            label: null,
            items: [...items].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0))
        }],
        buildItem: (values) => ({
            title: values.title,
            productionCompany: values.productionCompany,
            year: values.year,
            broadcastDate: orNull(values.broadcastDate),
            commissioner: orNull(values.commissioner),
            runtime: orNull(values.runtime),
            role: values.role,
            description: values.description,
            logo: orNull(values.logo),
            watchLink: orNull(values.watchLink)
        })
    });

    // ------------------------------------------------------------------
    // Podcasts
    // ------------------------------------------------------------------

    const podcastsManager = new CollectionManager({
        containerId: 'podcasts-manager',
        title: 'Podcasts Manager',
        noun: 'Podcast',
        fileKey: 'podcasts',
        store,
        fields: [
            { name: 'title', label: 'Episode Title', required: true },
            { name: 'podcastName', label: 'Podcast Name', required: true, placeholder: 'Irish History Podcast' },
            { name: 'year', label: 'Year', required: true, placeholder: '2024' },
            { name: 'embedUrl', label: 'Podcast Embed URL', type: 'url', required: true, placeholder: 'https://embed.podcasts.apple.com/...', help: 'Get the embed URL from Apple Podcasts, Spotify, or other podcast platforms' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true }
        ],
        summarize: (podcast) => ({
            title: podcast.title,
            meta: `${podcast.podcastName} • ${podcast.year}`
        }),
        groupForDisplay: (items) => [{
            label: null,
            items: [...items].sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0))
        }],
        buildItem: (values) => ({
            title: values.title,
            podcastName: values.podcastName,
            year: values.year,
            embedUrl: values.embedUrl,
            description: values.description
        })
    });

    // ------------------------------------------------------------------
    // Career timeline (projects.js)
    // ------------------------------------------------------------------

    const timelineManager = new CollectionManager({
        containerId: 'timeline-manager',
        title: 'Timeline Manager',
        noun: 'Project',
        fileKey: 'projects',
        store,
        fields: [
            { name: 'title', label: 'Title', required: true },
            {
                name: 'type', label: 'Type', type: 'select', required: true,
                options: [
                    { value: 'book', label: 'Publication' },
                    { value: 'exhibition', label: 'Exhibition' },
                    { value: 'fellowship', label: 'Fellowship' },
                    { value: 'education', label: 'Education' },
                    { value: 'teaching', label: 'Teaching' },
                    { value: 'media', label: 'Media' },
                    { value: 'talk', label: 'Talk' }
                ]
            },
            {
                name: 'scope', label: 'Scope', type: 'select', required: true,
                options: [
                    { value: 'academic', label: 'Academic' },
                    { value: 'public', label: 'Public' },
                    { value: 'international', label: 'International' },
                    { value: 'national', label: 'National' }
                ]
            },
            { name: 'date', label: 'Display Date', required: true, placeholder: 'e.g., 2024, June 2025, 2018-2019' },
            { name: 'sortDate', label: 'Sort Date', type: 'date', required: true },
            { name: 'venue', label: 'Venue/Institution', placeholder: 'Optional' },
            { name: 'description', label: 'Description', type: 'textarea', rows: 4, required: true, placeholder: '1-2 sentence summary' },
            { name: 'link', label: 'Link URL', type: 'url', placeholder: 'https://example.com' }
        ],
        summarize: (project) => ({
            title: project.title,
            meta: `${project.type} • ${project.date}${project.venue ? ' • ' + project.venue : ''}`
        }),
        groupForDisplay: (items) => [{
            label: null,
            items: [...items].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
        }],
        buildItem: (values, existing) => ({
            id: existing ? existing.id : `project-${Date.now()}`,
            title: values.title,
            type: values.type,
            date: values.date,
            sortDate: values.sortDate,
            scope: values.scope,
            description: values.description,
            link: orNull(values.link),
            venue: orNull(values.venue)
        })
    });

    // ------------------------------------------------------------------
    // "What I'm Reading" / "What I'm Playing"
    // ------------------------------------------------------------------

    const readingEditor = new SingletonEditor({
        containerId: 'reading-editor',
        title: "What I'm Reading",
        description: 'Update the current book featured in the "What I\'m Reading" modal.',
        fileKey: 'reading',
        commitMessage: 'Update current reading',
        store,
        fields: [
            { name: 'title', label: 'Book Title', required: true },
            { name: 'author', label: 'Author', required: true },
            { name: 'cover', label: 'Cover Image Path', required: true, placeholder: 'images/current-reading.jpg', help: 'Upload image via Images tab, then paste path here' },
            { name: 'note', label: 'Your Reflection (1-2 sentences)', type: 'textarea', rows: 3, required: true }
        ]
    });

    const playingEditor = new SingletonEditor({
        containerId: 'playing-editor',
        title: "What I'm Playing",
        description: 'Update the current game featured in the "What I\'m Playing" modal.',
        fileKey: 'playing',
        commitMessage: 'Update current playing',
        store,
        fields: [
            { name: 'title', label: 'Game Title', required: true },
            { name: 'developer', label: 'Developer', required: true },
            { name: 'cover', label: 'Cover Image Path', required: true, placeholder: 'images/current-playing.png', help: 'Upload image via Images tab, then paste path here' },
            { name: 'note', label: 'Your Reflection (1-2 sentences)', type: 'textarea', rows: 3, required: true }
        ]
    });

    // Section initializers used by navigation (app.js)
    window.AdminManagers = {
        'events-manager': () => eventsManager.init(),
        'timeline': () => timelineManager.init(),
        'content-boxes': () => {
            readingEditor.init();
            playingEditor.init();
            booksManager.init();
            writingManager.init();
            documentariesManager.init();
            podcastsManager.init();
        }
    };
})();
