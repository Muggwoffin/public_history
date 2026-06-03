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
            const contentSection = writingSection.querySelector('.content-section');
            container = document.createElement('div');
            container.className = 'writing-grid';
            contentSection.appendChild(container);
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
        item.className = 'writing-item';

        // Outlet logo
        const logoDiv = document.createElement('div');
        logoDiv.className = 'outlet-logo';

        if (article.outletLogo) {
            const logo = document.createElement('img');
            logo.src = article.outletLogo;
            logo.alt = article.outlet || 'Outlet';
            logoDiv.appendChild(logo);
        }
        item.appendChild(logoDiv);

        // Title
        const title = document.createElement('h4');
        title.className = 'writing-title';
        title.textContent = article.title;
        item.appendChild(title);

        // Meta (date)
        const meta = document.createElement('p');
        meta.className = 'writing-meta';
        meta.textContent = article.date;
        item.appendChild(meta);

        // Excerpt
        const excerpt = document.createElement('p');
        excerpt.className = 'writing-excerpt';
        excerpt.textContent = article.excerpt;
        item.appendChild(excerpt);

        // Read more link
        if (article.link) {
            const link = document.createElement('a');
            link.href = article.link;
            link.className = 'read-more';
            link.textContent = 'READ →';
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
