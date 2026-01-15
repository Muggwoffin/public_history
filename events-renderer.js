/**
 * Events Renderer
 * Dynamically renders upcoming and past events from events.js
 */

(function() {
    'use strict';

    /**
     * Initialize events rendering when DOM is ready
     */
    function initEvents() {
        if (typeof events === 'undefined') {
            console.warn('Events data not loaded');
            return;
        }

        const container = document.querySelector('.events-calendar');
        if (!container) {
            console.warn('Events calendar container not found');
            return;
        }

        renderEvents(container);
    }

    /**
     * Render all events, sorted with upcoming first
     * @param {HTMLElement} container - The container element
     */
    function renderEvents(container) {
        // Clear any existing placeholder content
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p class="no-events">No upcoming events at this time. Check back soon!</p>';
            return;
        }

        // Get current date for comparison
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Separate upcoming and past events
        const upcomingEvents = [];
        const pastEvents = [];

        events.forEach(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate >= now) {
                upcomingEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });

        // Sort upcoming events (soonest first)
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Sort past events (most recent first)
        pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render upcoming events
        if (upcomingEvents.length > 0) {
            upcomingEvents.forEach(event => {
                container.appendChild(createEventCard(event, false));
            });
        }

        // Optionally render past events (uncomment if desired)
        /*
        if (pastEvents.length > 0) {
            const pastHeading = document.createElement('h4');
            pastHeading.className = 'past-events-heading';
            pastHeading.textContent = 'Past Events';
            container.appendChild(pastHeading);

            pastEvents.forEach(event => {
                container.appendChild(createEventCard(event, true));
            });
        }
        */
    }

    /**
     * Create an event card element
     * @param {Object} event - Event data object
     * @param {boolean} isPast - Whether this is a past event
     * @returns {HTMLElement} - The event card element
     */
    function createEventCard(event, isPast) {
        const card = document.createElement('div');
        card.className = 'event-card' + (isPast ? ' past-event' : '');

        // Event header with title and badge
        const header = document.createElement('div');
        header.className = 'event-header';

        const title = document.createElement('h4');
        title.className = 'event-title';
        title.textContent = event.title;

        header.appendChild(title);

        if (event.badge) {
            const badge = document.createElement('span');
            badge.className = 'event-badge';
            badge.textContent = event.badge;
            header.appendChild(badge);
        }

        card.appendChild(header);

        // Event details
        const details = document.createElement('div');
        details.className = 'event-details';

        // Date
        const dateP = document.createElement('p');
        dateP.className = 'event-date';
        const dateStrong = document.createElement('strong');
        dateStrong.textContent = `📅 ${formatDate(event.date)}`;
        dateP.appendChild(dateStrong);
        details.appendChild(dateP);

        // Time
        const timeP = document.createElement('p');
        timeP.className = 'event-time';
        const timeStrong = document.createElement('strong');
        timeStrong.textContent = `🕐 ${formatTime(event.time)} ${event.timezone}`;
        timeP.appendChild(timeStrong);
        details.appendChild(timeP);

        // Timezone converter link
        if (event.link && !isPast) {
            const tzNote = document.createElement('p');
            tzNote.className = 'event-timezone-note';
            const tzEm = document.createElement('em');
            const tzLink = document.createElement('a');
            tzLink.href = event.link;
            tzLink.target = '_blank';
            tzLink.rel = 'noopener noreferrer';
            tzLink.textContent = 'Convert to your timezone →';
            tzEm.appendChild(tzLink);
            tzNote.appendChild(tzEm);
            details.appendChild(tzNote);
        }

        card.appendChild(details);

        // Description
        const desc = document.createElement('p');
        desc.className = 'event-description';
        desc.textContent = event.description;
        card.appendChild(desc);

        // Link button (for upcoming events)
        if (event.link && !isPast) {
            const link = document.createElement('a');
            link.href = event.link;
            link.className = 'event-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'REGISTER →';
            card.appendChild(link);
        }

        return card;
    }

    /**
     * Format date as "Month Day, Year"
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {string} - Formatted date
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Format time from 24-hour to 12-hour format
     * @param {string} timeStr - Time string in HH:MM format
     * @returns {string} - Formatted time
     */
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEvents);
    } else {
        initEvents();
    }
})();
