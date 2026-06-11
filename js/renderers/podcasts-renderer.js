/**
 * Podcasts Renderer
 * Renders the Recent Podcast Appearances subsection of PUBLIC HISTORY from
 * the global `podcasts` data (podcasts.js).
 *
 * Embed URLs are restricted to https: origins and the iframe is sandboxed.
 */

(function () {
    'use strict';

    const { el, findSubsectionHeading, registerRenderer } = SiteCore;

    /**
     * Only allow https embed URLs; anything else is dropped.
     * @param {string} url
     * @returns {string|null}
     */
    function safeEmbedUrl(url) {
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.protocol === 'https:' ? parsed.href : null;
        } catch (_) {
            return null;
        }
    }

    function createPodcastItem(podcast) {
        const item = el('div', { className: 'podcast-embed' }, [
            el('h4', { className: 'podcast-title', text: podcast.title }),
            el('p', {
                className: 'podcast-meta',
                text: `${podcast.podcastName} • ${podcast.year}`
            })
        ]);

        const embedUrl = podcast.embedUrl ? safeEmbedUrl(podcast.embedUrl) : null;
        if (embedUrl) {
            const iframe = el('iframe', {
                attrs: {
                    src: embedUrl,
                    title: `${podcast.podcastName}: ${podcast.title}`,
                    height: '175',
                    frameborder: '0',
                    loading: 'lazy',
                    allow: 'autoplay *; encrypted-media *; fullscreen *; clipboard-write',
                    sandbox: 'allow-forms allow-popups allow-same-origin allow-scripts ' +
                        'allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
                }
            });
            iframe.style.width = '100%';
            iframe.style.maxWidth = '660px';
            iframe.style.overflow = 'hidden';
            iframe.style.borderRadius = '10px';
            item.appendChild(iframe);
        }

        item.appendChild(el('p', { className: 'podcast-description', text: podcast.description }));
        return item;
    }

    registerRenderer(() => podcasts, (podcasts) => {
        const heading = findSubsectionHeading('public-history', 'Podcast');
        if (!heading) return;

        // Remove any previously rendered items (idempotent re-render)
        let next = heading.nextElementSibling;
        while (next && next.classList.contains('podcast-embed')) {
            const toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
        }

        if (podcasts.length === 0) {
            heading.insertAdjacentElement('afterend', el('p', {
                className: 'no-podcasts',
                text: 'No podcast appearances available at this time.'
            }));
            return;
        }

        // Insert in reverse order so the newest entry ends up at the top
        podcasts.slice().reverse().forEach(podcast => {
            heading.insertAdjacentElement('afterend', createPodcastItem(podcast));
        });
    });
})();
