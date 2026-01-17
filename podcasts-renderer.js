/**
 * Podcasts Renderer
 * Dynamically renders podcast appearances from podcasts.js
 */

(function() {
    'use strict';

    /**
     * Initialize podcasts rendering when DOM is ready
     */
    function initPodcasts() {
        if (typeof podcasts === 'undefined') {
            console.warn('Podcasts data not loaded');
            return;
        }

        const publicHistorySection = document.getElementById('public-history');
        if (!publicHistorySection) {
            console.warn('Public History section not found');
            return;
        }

        // Find or create the podcasts container
        const subsectionHeading = Array.from(publicHistorySection.querySelectorAll('.subsection-heading'))
            .find(h3 => h3.textContent.includes('Podcast'));

        if (!subsectionHeading) {
            console.warn('Podcasts subsection heading not found');
            return;
        }

        // Remove existing hardcoded podcasts
        let nextElement = subsectionHeading.nextElementSibling;
        while (nextElement && nextElement.classList.contains('podcast-embed')) {
            const toRemove = nextElement;
            nextElement = nextElement.nextElementSibling;
            toRemove.remove();
        }

        // Render new podcasts
        renderPodcasts(subsectionHeading);
    }

    /**
     * Render all podcasts
     * @param {HTMLElement} subsectionHeading - The subsection heading element
     */
    function renderPodcasts(subsectionHeading) {
        if (podcasts.length === 0) {
            const noPodcastsMessage = document.createElement('p');
            noPodcastsMessage.className = 'no-podcasts';
            noPodcastsMessage.textContent = 'No podcast appearances available at this time.';
            subsectionHeading.insertAdjacentElement('afterend', noPodcastsMessage);
            return;
        }

        // Render each podcast in reverse order (newest first at the top)
        podcasts.slice().reverse().forEach(podcast => {
            const podcastElement = createPodcastItem(podcast);
            subsectionHeading.insertAdjacentElement('afterend', podcastElement);
        });
    }

    /**
     * Create a podcast item element
     * @param {Object} podcast - Podcast data object
     * @returns {HTMLElement} - The podcast item element
     */
    function createPodcastItem(podcast) {
        const item = document.createElement('div');
        item.className = 'podcast-embed';

        // Title
        const title = document.createElement('h4');
        title.className = 'podcast-title';
        title.textContent = podcast.title;
        item.appendChild(title);

        // Meta (podcast name and year)
        const meta = document.createElement('p');
        meta.className = 'podcast-meta';
        meta.textContent = `${podcast.podcastName} • ${podcast.year}`;
        item.appendChild(meta);

        // Embed iframe
        if (podcast.embedUrl) {
            const iframe = document.createElement('iframe');
            iframe.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
            iframe.frameBorder = '0';
            iframe.height = '175';
            iframe.style.width = '100%';
            iframe.style.maxWidth = '660px';
            iframe.style.overflow = 'hidden';
            iframe.style.borderRadius = '10px';
            iframe.sandbox = 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation';
            iframe.src = podcast.embedUrl;
            item.appendChild(iframe);
        }

        // Description
        const description = document.createElement('p');
        description.className = 'podcast-description';
        description.textContent = podcast.description;
        item.appendChild(description);

        return item;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPodcasts);
    } else {
        initPodcasts();
    }
})();
