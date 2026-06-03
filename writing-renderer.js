/**
 * Writing Renderer
 * Dynamically renders writing articles from writing.js
 */

(function() {
    'use strict';

    /**
     * Initialize writing rendering when DOM is ready
     */
    function initWriting() {
        if (typeof writing === 'undefined') {
            console.warn('Writing data not loaded');
            return;
        }

        const writingSection = document.getElementById('selected-writing');
        if (!writingSection) {
            console.warn('Writing section not found');
            return;
        }

        // Find or create the writing container
        let container = writingSection.querySelector('.writing-grid');
        if (!container) {
            container = document.createElement('div');
            container.className = 'writing-grid grid';
            writingSection.appendChild(container);
        }

        renderWriting(container);
    }

    /**
     * Render all writing articles
     * @param {HTMLElement} container - The container element
     */
    function renderWriting(container) {
        container.innerHTML = '';

        if (writing.length === 0) {
            container.innerHTML = '<p class="no-writing">No articles available at this time.</p>';
            return;
        }

        // Render each article
        writing.forEach(article => {
            container.appendChild(createArticleItem(article));
        });
    }

    /**
     * Create an article item element
     * @param {Object} article - Article data object
     * @returns {HTMLElement} - The article item element
     */
    function createArticleItem(article) {
        const item = document.createElement('article');
        item.className = 'academia-card col-4';

        // Outlet logo
        if (article.outletLogo) {
            const logo = document.createElement('img');
            logo.src = article.outletLogo;
            logo.alt = article.outlet || 'Outlet';
            logo.style.maxHeight = '40px';
            logo.style.marginBottom = 'var(--space-4)';
            item.appendChild(logo);
        }

        // Meta (date)
        const meta = document.createElement('p');
        meta.className = 'card-meta';
        meta.textContent = article.date;
        item.appendChild(meta);

        // Title
        const title = document.createElement('h4');
        title.style.fontFamily = 'var(--font-display)';
        title.style.fontStyle = 'italic';
        title.style.color = 'var(--walnut)';
        title.textContent = article.title;
        item.appendChild(title);

        // Excerpt
        const excerpt = document.createElement('p');
        excerpt.className = 'card-description';
        excerpt.textContent = article.excerpt;
        item.appendChild(excerpt);

        // Read more link
        if (article.link) {
            const link = document.createElement('a');
            link.href = article.link;
            link.className = 'academia-btn btn-primary';
            link.textContent = 'Read Article';
            if (article.link !== '#') {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            item.appendChild(link);
        }

        return item;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWriting);
    } else {
        initWriting();
    }
})();
