/**
 * Documentaries Renderer
 * Dynamically renders documentaries from documentaries.js
 */

(function() {
    'use strict';

    /**
     * Initialize documentaries rendering when DOM is ready
     */
    function initDocumentaries() {
        if (typeof documentaries === 'undefined') {
            console.warn('Documentaries data not loaded');
            return;
        }

        const publicHistorySection = document.getElementById('public-history');
        if (!publicHistorySection) {
            console.warn('Public History section not found');
            return;
        }

        // Find or create the documentaries container
        const subsectionHeading = Array.from(publicHistorySection.querySelectorAll('h3'))
            .find(h3 => h3.textContent.includes('Documentaries'));

        if (!subsectionHeading) {
            console.warn('Documentaries subsection heading not found');
            return;
        }

        // Find or create container
        let container = subsectionHeading.nextElementSibling;
        if (!container || !container.classList.contains('documentaries-container')) {
            container = document.createElement('div');
            container.className = 'documentaries-container';
            subsectionHeading.insertAdjacentElement('afterend', container);
        }

        // Render new documentaries
        renderDocumentaries(container);
    }

    /**
     * Render all documentaries
     * @param {HTMLElement} container - The container element
     */
    function renderDocumentaries(container) {
        container.innerHTML = '';

        if (documentaries.length === 0) {
            container.innerHTML = '<p class="no-documentaries">No documentaries available at this time.</p>';
            return;
        }

        // Render each documentary
        documentaries.forEach(doc => {
            container.appendChild(createDocumentaryItem(doc));
        });
    }

    /**
     * Create a documentary item element
     * @param {Object} doc - Documentary data object
     * @returns {HTMLElement} - The documentary item element
     */
    function createDocumentaryItem(doc) {
        const item = document.createElement('article');
        item.className = 'bauhaus-card';
        item.style.marginBottom = 'var(--space-6)';

        // Logo (optional)
        if (doc.logo) {
            const logo = document.createElement('img');
            logo.src = doc.logo;
            logo.alt = doc.productionCompany || 'Documentary Logo';
            logo.style.maxHeight = '60px';
            logo.style.marginBottom = 'var(--space-4)';
            item.appendChild(logo);
        }

        // Meta (production company, year, runtime)
        const meta = document.createElement('p');
        meta.className = 'card-meta';
        let metaText = doc.productionCompany;
        if (doc.year) metaText += ' • ' + doc.year;
        if (doc.runtime) metaText += ' • ' + doc.runtime;
        meta.textContent = metaText;
        item.appendChild(meta);

        // Title
        const title = document.createElement('h4');
        title.textContent = doc.title;
        item.appendChild(title);

        // Broadcast Date & Commissioner (optional)
        if (doc.broadcastDate || doc.commissioner) {
            const info = document.createElement('p');
            info.style.fontSize = '0.875rem';
            info.style.marginBottom = 'var(--space-3)';
            const parts = [];
            if (doc.broadcastDate) parts.push('Broadcast: ' + doc.broadcastDate);
            if (doc.commissioner) parts.push('Commissioner: ' + doc.commissioner);
            info.textContent = parts.join(' • ');
            item.appendChild(info);
        }

        // Role
        if (doc.role) {
            const role = document.createElement('p');
            role.style.fontSize = '0.875rem';
            role.style.fontWeight = '700';
            role.style.marginBottom = 'var(--space-3)';
            role.textContent = 'Role: ' + doc.role;
            item.appendChild(role);
        }

        // Description
        const description = document.createElement('p');
        description.className = 'card-description';
        description.textContent = doc.description;
        item.appendChild(description);

        // Watch/Listen link (optional)
        if (doc.watchLink) {
            const link = document.createElement('a');
            link.href = doc.watchLink;
            link.className = 'bauhaus-btn btn-red';
            link.innerHTML = '<span>Watch/Listen</span>';
            if (doc.watchLink !== '#') {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            item.appendChild(link);
        }

        return item;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDocumentaries);
    } else {
        initDocumentaries();
    }
})();
