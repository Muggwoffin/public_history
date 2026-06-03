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
        const subsectionHeading = Array.from(publicHistorySection.querySelectorAll('h3'))
            .find(h3 => h3.textContent.includes('Podcast'));

        if (!subsectionHeading) {
            console.warn('Podcasts subsection heading not found');
            return;
        }

        // Find or create container
        let container = subsectionHeading.nextElementSibling;
        if (!container || !container.classList.contains('podcasts-container')) {
            container = document.createElement('div');
            container.className = 'podcasts-container';
            subsectionHeading.insertAdjacentElement('afterend', container);
        }

        // Render new podcasts
        renderPodcasts(container);
    }

    /**
     * Render all podcasts
     * @param {HTMLElement} container - The container element
     */
    function renderPodcasts(container) {
        container.innerHTML = '';

        if (podcasts.length === 0) {
            container.innerHTML = '<p class="no-podcasts">No podcast appearances available at this time.</p>';
            return;
        }

        // Render each podcast (newest first)
        podcasts.forEach(podcast => {
            container.appendChild(createPodcastItem(podcast));
        });
    }

    /**
     * Create a podcast item element
     * @param {Object} podcast - Podcast data object
     * @returns {HTMLElement} - The podcast item element
     */
    function createPodcastItem(podcast) {
        const item = document.createElement('article');
        item.className = 'academia-card';
        item.style.marginBottom = 'var(--space-6)';

        // Meta (podcast name and year)
        const meta = document.createElement('p');
        meta.className = 'card-meta';
        meta.textContent = `${podcast.podcastName} • ${podcast.year}`;
        item.appendChild(meta);

        // Title
        const title = document.createElement('h4');
        title.style.fontFamily = 'var(--font-display)';
        title.style.fontStyle = 'italic';
        title.style.color = 'var(--walnut)';
        title.textContent = podcast.title;
        item.appendChild(title);

        // Description
        const description = document.createElement('p');
        description.className = 'card-description';
        description.textContent = podcast.description;
        item.appendChild(description);

        // Embed iframe
        if (podcast.embedUrl) {
            const iframe = document.createElement('iframe');
            iframe.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
            iframe.frameBorder = '0';
            iframe.height = '175';
            iframe.style.width = '100%';
            iframe.style.maxWidth = '660px';
            iframe.style.overflow = 'hidden';
            iframe.style.border = '1px solid var(--linen)';
            iframe.style.boxShadow = 'var(--shadow-soft)';
            iframe.style.marginTop = 'var(--space-4)';
            iframe.sandbox = 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation';
            iframe.src = podcast.embedUrl;
            item.appendChild(iframe);
        }

        return item;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPodcasts);
    } else {
        initPodcasts();
    }
})();
