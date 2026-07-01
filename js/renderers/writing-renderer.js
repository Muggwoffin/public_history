/**
 * Writing Renderer
 * Renders the SELECTED WRITING section from the global `writing` data (writing.js).
 */

(function () {
    'use strict';

    const { el, link, renderList, ensureSectionContainer, registerRenderer } = SiteCore;

    function createArticleItem(article) {
        const logoDiv = el('div', { className: 'outlet-logo' });
        if (article.outletLogo) {
            logoDiv.appendChild(el('img', {
                attrs: {
                    src: article.outletLogo, alt: article.outlet || 'Outlet',
                    loading: 'lazy', decoding: 'async'
                }
            }));
        }

        const item = el('article', { className: 'writing-item' }, [
            logoDiv,
            el('h4', { className: 'writing-title', text: article.title }),
            el('p', { className: 'writing-meta', text: article.date }),
            el('p', { className: 'writing-excerpt', text: article.excerpt })
        ]);

        if (article.link) {
            item.appendChild(link(article.link, 'read-more', 'READ →'));
        }
        return item;
    }

    registerRenderer(() => writing, (writing) => {
        const container = ensureSectionContainer('selected-writing', 'writing-grid');
        if (!container) return;

        renderList(container, writing, createArticleItem, {
            className: 'no-writing',
            text: 'No articles available at this time.'
        });
    });
})();
