/**
 * Bibliography Renderer
 * Renders a single bibliography (chosen by ?slug=) from the global
 * `bibliographies` data (bibliographies.js) into bibliography.html: a
 * masthead, the intro/provisos, a live text filter, and the sections as
 * hanging-indent lists. All text is inserted via SiteCore.el (textContent).
 */

(function () {
    'use strict';

    const { el, onReady } = SiteCore;

    function slugFromQuery() {
        const m = window.location.search.match(/[?&]slug=([^&]+)/);
        return m ? decodeURIComponent(m[1]) : null;
    }

    function buildMasthead(head, bib) {
        head.appendChild(el('p', { className: 'tools-kicker', text: 'Bibliography' }));
        head.appendChild(el('h1', { className: 'bib-title', text: bib.title }));
        if (bib.subtitle) {
            head.appendChild(el('p', { className: 'bib-subtitle', text: bib.subtitle }));
        }
        head.appendChild(el('div', { className: 'tools-ornament', attrs: { 'aria-hidden': 'true' } }, [
            el('span', { className: 'tools-ornament-line' }),
            el('span', { className: 'tools-ornament-star', text: '★' }),
            el('span', { className: 'tools-ornament-line' })
        ]));
    }

    onReady(() => {
        const host = document.getElementById('bibliography');
        const head = document.getElementById('bib-masthead');
        if (!host || !head) return;

        let data;
        try { data = bibliographies; } catch (_) { data = undefined; }
        if (typeof data === 'undefined') {
            host.appendChild(el('p', { className: 'bib-error', text: 'The bibliography data failed to load.' }));
            return;
        }

        const slug = slugFromQuery();
        const bib = (slug && data.find(b => b.slug === slug)) || data[0];
        if (!bib) {
            host.appendChild(el('p', { className: 'bib-empty', text: 'Bibliography not found.' }));
            return;
        }

        document.title = bib.title + ' — Maurice J. Casey';
        buildMasthead(head, bib);

        host.appendChild(el('a', { className: 'bib-back', text: '← Back to Tools', attrs: { href: 'tools.html' } }));

        (bib.intro || []).forEach(paragraph => {
            host.appendChild(el('p', { className: 'bib-intro-p', text: paragraph }));
        });

        // Toolbar: filter + live count + section jump links
        const filter = el('input', {
            className: 'bib-filter',
            attrs: { type: 'search', placeholder: 'Filter by author, title or keyword…', 'aria-label': 'Filter entries' }
        });
        const count = el('span', { className: 'bib-count' });
        const jump = el('nav', { className: 'bib-jump', attrs: { 'aria-label': 'Jump to section' } });
        host.appendChild(el('div', { className: 'bib-toolbar' }, [
            filter,
            el('div', { className: 'bib-toolbar-row' }, [jump, count])
        ]));

        const sections = [];
        let total = 0;
        bib.sections.forEach((section, i) => {
            const id = 'bib-section-' + (i + 1);
            const list = el('ul', { className: 'bib-list' });
            section.entries.forEach(text => list.appendChild(el('li', { className: 'bib-entry', text })));
            const wrap = el('section', { className: 'bib-section', attrs: { id } }, [
                el('h2', { className: 'bib-section-title', text: section.title }),
                list
            ]);
            host.appendChild(wrap);
            sections.push({ wrap, list });
            total += section.entries.length;
            jump.appendChild(el('a', { text: section.title, attrs: { href: '#' + id } }));
        });

        if (bib.acknowledgements) {
            host.appendChild(el('div', { className: 'bib-ack' }, [
                el('h2', { className: 'bib-section-title', text: 'Acknowledgements' }),
                el('p', { text: bib.acknowledgements })
            ]));
        }

        function setCount(visible) {
            count.textContent = visible === total
                ? total + ' works'
                : visible + ' of ' + total + ' works';
        }
        setCount(total);

        filter.addEventListener('input', () => {
            const q = filter.value.trim().toLowerCase();
            let visible = 0;
            sections.forEach(s => {
                let shown = 0;
                Array.from(s.list.children).forEach(li => {
                    const match = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
                    li.hidden = !match;
                    if (match) { visible++; shown++; }
                });
                s.wrap.hidden = shown === 0;
            });
            setCount(visible);
        });
    });
})();
