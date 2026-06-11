/**
 * Events Renderer
 * Renders Upcoming Events in PUBLIC HISTORY from the global `events`
 * data (events.js). Past events are filtered out.
 */

(function () {
    'use strict';

    const { el, link, renderList, registerRenderer } = SiteCore;

    /**
     * Format YYYY-MM-DD as "Month Day, Year".
     * @param {string} dateStr
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    /**
     * Format HH:MM (24h) as h:MM AM/PM.
     * @param {string} timeStr
     */
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function createEventCard(event) {
        const header = el('div', { className: 'event-header' }, [
            el('h4', { className: 'event-title', text: event.title })
        ]);
        if (event.badge) {
            header.appendChild(el('span', { className: 'event-badge', text: event.badge }));
        }

        const details = el('div', { className: 'event-details' }, [
            el('p', { className: 'event-date' }, [
                el('strong', { text: `📅 ${formatDate(event.date)}` })
            ]),
            el('p', { className: 'event-time' }, [
                el('strong', { text: `🕐 ${formatTime(event.time)} ${event.timezone}` })
            ])
        ]);

        const card = el('div', { className: 'event-card' }, [header, details]);
        card.appendChild(el('p', { className: 'event-description', text: event.description }));

        if (event.link) {
            card.appendChild(link(event.link, 'event-link', 'REGISTER →'));
        }
        return card;
    }

    registerRenderer(() => events, (events) => {
        const container = document.querySelector('.events-calendar');
        if (!container) {
            console.warn('Events calendar container not found');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = events
            .filter(event => {
                const eventDate = new Date(event.date + 'T00:00:00');
                return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        renderList(container, upcoming, createEventCard, {
            className: 'no-events',
            text: 'No upcoming events at this time. Check back soon!'
        });
    });
})();
