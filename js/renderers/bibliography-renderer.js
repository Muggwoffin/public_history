/**
 * Bibliography Renderer
 * Renders a single bibliography (chosen by ?slug=) from the global
 * `bibliographies` data (bibliographies.js) into bibliography.html: a
 * masthead, the intro/provisos, a live text filter, a "suggest an
 * addition" mailto action, and the sections as hanging-indent lists.
 *
 * Entry text between *asterisks* renders as <em> (used for book and
 * journal titles). Each entry gets a stable id and a § anchor link so
 * individual citations can be linked to directly. All text reaches the
 * DOM via textContent (SiteCore.el / text nodes) — never innerHTML.
 */

(function () {
    'use strict';

    const { el, onReady } = SiteCore;

    function slugFromQuery() {
        const m = window.location.search.match(/[?&]slug=([^&]+)/);
        return m ? decodeURIComponent(m[1]) : null;
    }

    function slugify(text) {
        return text.toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .split('-').slice(0, 5).join('-');
    }

    /** Append `text` to `parent`, rendering *segments* between asterisks as <em>. */
    function renderRich(parent, text) {
        const parts = String(text).split('*');
        parts.forEach((part, i) => {
            if (part === '') return;
            if (i % 2 === 1) {
                parent.appendChild(el('em', { text: part }));
            } else {
                parent.appendChild(document.createTextNode(part));
            }
        });
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

        // Toolbar: filter, then jump links + suggest action + live count
        const filter = el('input', {
            className: 'bib-filter',
            attrs: { type: 'search', placeholder: 'Filter by author, title or keyword…', 'aria-label': 'Filter entries' }
        });
        const count = el('span', { className: 'bib-count' });
        const jump = el('nav', { className: 'bib-jump', attrs: { 'aria-label': 'Jump to section' } });
        const toolbarRow = el('div', { className: 'bib-toolbar-row' }, [jump, count]);
        if (bib.contactEmail) {
            const subject = encodeURIComponent('Suggestion for bibliography: ' + bib.title);
            toolbarRow.insertBefore(el('a', {
                className: 'bib-suggest',
                text: 'Suggest an addition →',
                attrs: { href: 'mailto:' + bib.contactEmail + '?subject=' + subject }
            }), count);
        }
        host.appendChild(el('div', { className: 'bib-toolbar' }, [filter, toolbarRow]));

        const usedIds = {};
        const sections = [];
        let total = 0;

        bib.sections.forEach((section, i) => {
            const id = 'bib-section-' + (i + 1);
            const list = el('ul', { className: 'bib-list' });

            section.entries.forEach(text => {
                let entryId = 'e-' + slugify(text.replace(/[*—]/g, ' '));
                if (usedIds[entryId]) {
                    usedIds[entryId] += 1;
                    entryId += '-' + usedIds[entryId];
                } else {
                    usedIds[entryId] = 1;
                }

                const span = el('span', { className: 'bib-entry-text' });
                renderRich(span, text);

                const anchor = el('a', {
                    className: 'bib-anchor',
                    text: '§',
                    attrs: { href: '#' + entryId, 'aria-label': 'Link to this entry' }
                });

                list.appendChild(el('li', {
                    className: 'bib-entry',
                    attrs: { id: entryId }
                }, [span, anchor]));
            });

            // A <div>, not <section>: style.css hides bare <section>s until
            // scroll-reveal marks them visible, and these are created after
            // scroll-reveal has already scanned the page.
            const wrap = el('div', { className: 'bib-section', attrs: { id } }, [
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
                    const textEl = li.querySelector('.bib-entry-text') || li;
                    const match = !q || textEl.textContent.toLowerCase().indexOf(q) !== -1;
                    li.hidden = !match;
                    if (match) { visible++; shown++; }
                });
                s.wrap.hidden = shown === 0;
            });
            setCount(visible);
        });
    });
})();
