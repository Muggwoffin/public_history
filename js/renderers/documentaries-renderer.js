/**
 * Documentaries Renderer
 * Renders the Documentaries & Film subsection of PUBLIC HISTORY from the
 * global `documentaries` data (documentaries.js).
 */

(function () {
    'use strict';

    const { el, link, findSubsectionHeading, registerRenderer } = SiteCore;

    function createDocumentaryItem(doc) {
        const item = el('div', { className: 'media-item' });

        if (doc.logo) {
            item.appendChild(el('div', { className: 'documentary-logo' }, [
                el('img', {
                    attrs: { src: doc.logo, alt: doc.productionCompany || 'Documentary Logo' }
                })
            ]));
        }

        item.appendChild(el('h3', { className: 'media-title', text: doc.title }));

        const metaParts = [doc.productionCompany, doc.year, doc.runtime].filter(Boolean);
        item.appendChild(el('p', { className: 'media-meta', text: metaParts.join(' • ') }));

        if (doc.broadcastDate) {
            item.appendChild(el('p', {
                className: 'media-broadcast',
                text: 'Broadcast: ' + doc.broadcastDate
            }));
        }
        if (doc.commissioner) {
            item.appendChild(el('p', {
                className: 'media-commissioner',
                text: 'Commissioner: ' + doc.commissioner
            }));
        }
        if (doc.role) {
            item.appendChild(el('p', { className: 'media-role', text: 'Role: ' + doc.role }));
        }

        item.appendChild(el('p', { className: 'media-description', text: doc.description }));

        if (doc.watchLink) {
            item.appendChild(link(doc.watchLink, 'watch-link', 'WATCH/LISTEN →'));
        }
        return item;
    }

    registerRenderer(() => documentaries, (documentaries) => {
        const heading = findSubsectionHeading('public-history', 'Documentaries');
        if (!heading) return;

        // Remove any previously rendered items (idempotent re-render)
        let next = heading.nextElementSibling;
        while (next && next.classList.contains('media-item')) {
            const toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
        }

        if (documentaries.length === 0) {
            heading.insertAdjacentElement('afterend', el('p', {
                className: 'no-documentaries',
                text: 'No documentaries available at this time.'
            }));
            return;
        }

        documentaries.forEach(doc => {
            heading.insertAdjacentElement('afterend', createDocumentaryItem(doc));
        });
    });
})();
