/**
 * Resources Renderer
 * Renders the global `resources` data (resources.js) into the Tools page,
 * grouped by category, as compact cards. Each card links out to an in-repo
 * page or file. Text is inserted via SiteCore.el (textContent).
 */

(function () {
    'use strict';

    const { el, registerRenderer } = SiteCore;

    // Categories render in this order; any others follow, in first-seen order.
    const CATEGORY_ORDER = ['Bibliography', 'Reading guide', 'Dataset', 'Other'];
    const PLURAL = {
        'Bibliography': 'Bibliographies',
        'Reading guide': 'Reading guides',
        'Dataset': 'Datasets'
    };

    function card(item) {
        const top = el('div', {}, [el('h3', { className: 'res-title', text: item.title })]);
        if (item.source) top.appendChild(el('p', { className: 'res-source', text: item.source }));
        if (item.description) top.appendChild(el('p', { className: 'res-desc', text: item.description }));

        const foot = el('div', { className: 'res-foot' });
        if (item.format) foot.appendChild(el('span', { className: 'res-chip', text: item.format }));
        if (item.url) {
            const link = el('a', {
                className: 'res-link',
                text: (item.linkLabel || 'Download') + ' →',
                attrs: { href: item.url }
            });
            if (/^https?:/i.test(item.url)) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            foot.appendChild(link);
        }
        return el('div', { className: 'res-card' }, [top, foot]);
    }

    function grouped(items) {
        const buckets = {};
        items.forEach(item => {
            const key = item.category || 'Other';
            (buckets[key] = buckets[key] || []).push(item);
        });
        const ordered = [];
        CATEGORY_ORDER.forEach(cat => {
            if (buckets[cat]) { ordered.push([cat, buckets[cat]]); delete buckets[cat]; }
        });
        Object.keys(buckets).forEach(cat => ordered.push([cat, buckets[cat]]));
        return ordered;
    }

    registerRenderer(() => resources, (resources) => {
        const host = document.getElementById('resources-list');
        if (!host) return;
        host.textContent = '';
        if (!resources || resources.length === 0) return;

        grouped(resources).forEach(([category, items]) => {
            const head = el('div', { className: 'sechead' }, [
                el('p', { className: 'tools-kicker', text: PLURAL[category] || category }),
                el('span', { className: 'sec-count', text: items.length + (items.length === 1 ? ' item' : ' items') })
            ]);
            const grid = el('div', { className: 'res-grid' });
            items.forEach(item => grid.appendChild(card(item)));
            host.appendChild(el('div', { className: 'tools-section' }, [head, grid]));
        });
    });
})();
