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
        const subsectionHeading = Array.from(publicHistorySection.querySelectorAll('.subsection-heading'))
            .find(h3 => h3.textContent.includes('Documentaries'));

        if (!subsectionHeading) {
            console.warn('Documentaries subsection heading not found');
            return;
        }

        // Remove existing hardcoded documentaries
        let nextElement = subsectionHeading.nextElementSibling;
        while (nextElement && nextElement.classList.contains('media-item')) {
            const toRemove = nextElement;
            nextElement = nextElement.nextElementSibling;
            toRemove.remove();
        }

        // Render new documentaries
        renderDocumentaries(subsectionHeading);
    }

    /**
     * Render all documentaries
     * @param {HTMLElement} subsectionHeading - The subsection heading element
     */
    function renderDocumentaries(subsectionHeading) {
        if (documentaries.length === 0) {
            const noDocsMessage = document.createElement('p');
            noDocsMessage.className = 'no-documentaries';
            noDocsMessage.textContent = 'No documentaries available at this time.';
            subsectionHeading.insertAdjacentElement('afterend', noDocsMessage);
            return;
        }

        // Render each documentary
        documentaries.forEach(doc => {
            const docElement = createDocumentaryItem(doc);
            subsectionHeading.insertAdjacentElement('afterend', docElement);
        });
    }

    /**
     * Create a documentary item element
     * @param {Object} doc - Documentary data object
     * @returns {HTMLElement} - The documentary item element
     */
    function createDocumentaryItem(doc) {
        const item = document.createElement('div');
        item.className = 'media-item';

        // Logo (optional)
        if (doc.logo) {
            const logoDiv = document.createElement('div');
            logoDiv.className = 'documentary-logo';
            const logo = document.createElement('img');
            logo.src = doc.logo;
            logo.alt = doc.productionCompany || 'Documentary Logo';
            logoDiv.appendChild(logo);
            item.appendChild(logoDiv);
        }

        // Title
        const title = document.createElement('h3');
        title.className = 'media-title';
        title.textContent = doc.title;
        item.appendChild(title);

        // Meta (production company, year, runtime)
        const meta = document.createElement('p');
        meta.className = 'media-meta';
        let metaText = doc.productionCompany;
        if (doc.year) metaText += ' • ' + doc.year;
        if (doc.runtime) metaText += ' • ' + doc.runtime;
        meta.textContent = metaText;
        item.appendChild(meta);

        // Broadcast Date (optional)
        if (doc.broadcastDate) {
            const broadcast = document.createElement('p');
            broadcast.className = 'media-broadcast';
            broadcast.textContent = 'Broadcast: ' + doc.broadcastDate;
            item.appendChild(broadcast);
        }

        // Commissioner (optional)
        if (doc.commissioner) {
            const commissioner = document.createElement('p');
            commissioner.className = 'media-commissioner';
            commissioner.textContent = 'Commissioner: ' + doc.commissioner;
            item.appendChild(commissioner);
        }

        // Role
        if (doc.role) {
            const role = document.createElement('p');
            role.className = 'media-role';
            role.textContent = 'Role: ' + doc.role;
            item.appendChild(role);
        }

        // Description
        const description = document.createElement('p');
        description.className = 'media-description';
        description.textContent = doc.description;
        item.appendChild(description);

        // Watch/Listen link (optional)
        if (doc.watchLink) {
            const link = document.createElement('a');
            link.href = doc.watchLink;
            link.className = 'watch-link';
            link.textContent = 'WATCH/LISTEN →';
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
