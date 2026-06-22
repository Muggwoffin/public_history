/**
 * Tools Renderer
 * Renders the Tools page (tools.html) from the global `tools` data (tools.js).
 * Each tool becomes a self-contained block: a feature card with download
 * actions, a "what's inside" grid, a folder tree and a get-started list.
 *
 * All text is set via SiteCore.el (textContent), so data stays markup-safe.
 */

(function () {
    'use strict';

    const { el, renderList, registerRenderer } = SiteCore;
    const SVGNS = 'http://www.w3.org/2000/svg';

    function svg(tag, attrs) {
        const node = document.createElementNS(SVGNS, tag);
        Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
        return node;
    }

    // Decorative network constellation — a hub with four linked nodes and a
    // gold star at the centre. Purely illustrative (aria-hidden).
    function buildMotif() {
        const s = svg('svg', {
            viewBox: '0 0 150 150', width: '120', height: '120',
            class: 'tool-motif-svg', 'aria-hidden': 'true', focusable: 'false'
        });
        const nodes = [[34, 34], [122, 42], [26, 106], [118, 114]];
        nodes.forEach(([x, y]) => s.appendChild(svg('line', {
            x1: 75, y1: 74, x2: x, y2: y, class: 'tool-motif-spoke'
        })));
        [[34, 34, 122, 42], [34, 34, 26, 106], [122, 42, 118, 114]].forEach(([x1, y1, x2, y2]) =>
            s.appendChild(svg('line', { x1, y1, x2, y2, class: 'tool-motif-web' })));
        nodes.forEach(([cx, cy]) => s.appendChild(svg('circle', {
            cx, cy, r: 7.5, class: 'tool-motif-node'
        })));
        s.appendChild(svg('circle', { cx: 75, cy: 74, r: 13, class: 'tool-motif-hub' }));
        const star = svg('text', { x: 75, y: 79.5, 'text-anchor': 'middle', class: 'tool-motif-star' });
        star.textContent = '★';
        s.appendChild(star);
        return s;
    }

    function actionLink(href, className, text, newTab) {
        const a = el('a', { className, attrs: { href } });
        if (newTab) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        if (text.star) {
            a.appendChild(el('span', { className: 'tool-btn-star', text: '★', attrs: { 'aria-hidden': 'true' } }));
        }
        a.appendChild(document.createTextNode(text.label));
        return a;
    }

    function kicker(text) {
        return el('p', { className: 'tools-kicker', text });
    }

    function featureCard(tool) {
        const head = el('div', { className: 'tool-feature-head' }, [
            el('h2', { className: 'tool-name', text: tool.name }),
            el('span', { className: 'tool-version', text: 'v' + tool.version })
        ]);

        const metaText = [tool.license + ' licence'].concat(tool.plugins).join('  ·  ');

        const actions = el('div', { className: 'tool-actions' }, [
            actionLink(tool.downloadUrl, 'tool-btn tool-btn--primary',
                { star: true, label: 'Download vault · .zip' }, false),
            actionLink(tool.repoUrl, 'tool-btn tool-btn--ghost',
                { star: false, label: 'View on GitHub →' }, true)
        ]);

        const body = el('div', { className: 'tool-feature-body' }, [
            head,
            el('p', { className: 'tool-desc', text: tool.description }),
            el('p', { className: 'tool-meta', text: metaText }),
            actions
        ]);

        return el('div', { className: 'tool-feature' }, [
            el('div', { className: 'tool-feature-motif' }, [buildMotif()]),
            body
        ]);
    }

    function insideCard(item) {
        return el('div', { className: 'tools-inside-card' }, [
            el('span', { className: 'tools-inside-star', text: '★', attrs: { 'aria-hidden': 'true' } }),
            el('h3', { className: 'tools-inside-title', text: item.title }),
            el('p', { className: 'tools-inside-text', text: item.text })
        ]);
    }

    function treeRow(node) {
        return el('div', {
            className: 'tools-tree-row depth-' + node.depth + ' is-' + node.kind
        }, [
            el('span', { className: 'tools-tree-label', text: node.label })
        ]);
    }

    function stepItem(text, index) {
        return el('div', { className: 'tools-step' }, [
            el('span', { className: 'tools-step-num', text: String(index + 1) }),
            el('p', { className: 'tools-step-text', text })
        ]);
    }

    function buildTool(tool) {
        const insideGrid = el('div', { className: 'tools-inside-grid' });
        tool.inside.forEach(item => insideGrid.appendChild(insideCard(item)));

        const tree = el('div', { className: 'tools-tree' });
        tool.structure.forEach(node => tree.appendChild(treeRow(node)));

        const steps = el('div', { className: 'tools-steps' });
        tool.steps.forEach((text, i) => steps.appendChild(stepItem(text, i)));

        const columns = el('div', { className: 'tools-columns' }, [
            el('div', {}, [kicker('How it’s organised'), tree]),
            el('div', {}, [kicker('Get started'), steps])
        ]);

        return el('article', { className: 'tool-block' }, [
            featureCard(tool),
            el('div', { className: 'tools-section' }, [kicker('What’s inside'), insideGrid]),
            el('div', { className: 'tools-section' }, [columns])
        ]);
    }

    registerRenderer(() => tools, (tools) => {
        const container = document.getElementById('tools-list');
        if (!container) return;

        renderList(container, tools, buildTool, {
            className: 'tools-empty',
            text: 'No tools are available at this time.'
        });
    });
})();
