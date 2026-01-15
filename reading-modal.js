/**
 * Reading Modal
 * Populates "What I'm Reading" modal with data from reading.js
 */

(function() {
    'use strict';

    /**
     * Initialize the reading modal
     */
    function initReadingModal() {
        if (typeof currentReading === 'undefined') {
            console.warn('Current reading data not loaded');
            return;
        }

        const modal = document.getElementById('reading-modal');
        const trigger = document.getElementById('readingLink');
        const closeBtn = document.getElementById('close-reading-modal');

        if (!modal || !trigger) {
            console.warn('Reading modal elements not found');
            return;
        }

        // Populate modal with data
        populateModal(modal);

        // Open modal
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Focus trap
            const focusableElements = modal.querySelectorAll('button, a[href]');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        });

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal);
            });
        }

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal(modal);
            }
        });
    }

    /**
     * Populate modal with reading data
     * @param {HTMLElement} modal - The modal element
     */
    function populateModal(modal) {
        const title = modal.querySelector('.reading-book-title');
        const author = modal.querySelector('.reading-author');
        const cover = modal.querySelector('.reading-cover');
        const note = modal.querySelector('.reading-note');

        if (title) title.textContent = currentReading.title;
        if (author) author.textContent = `by ${currentReading.author}`;
        if (cover) {
            cover.src = currentReading.cover;
            cover.alt = currentReading.title;
        }
        if (note) note.textContent = currentReading.note;
    }

    /**
     * Close the modal
     * @param {HTMLElement} modal - The modal element
     */
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReadingModal);
    } else {
        initReadingModal();
    }
})();
