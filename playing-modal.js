/**
 * Playing Modal
 * Populates "What I'm Playing" modal with data from playing.js
 */

(function() {
    'use strict';

    /**
     * Initialize the playing modal
     */
    function initPlayingModal() {
        if (typeof currentPlaying === 'undefined') {
            console.warn('Current playing data not loaded');
            return;
        }

        const modal = document.getElementById('playing-modal');
        const trigger = document.getElementById('playingLink');
        const closeBtn = document.getElementById('close-playing-modal');

        if (!modal || !trigger) {
            console.warn('Playing modal elements not found');
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
     * Populate modal with playing data
     * @param {HTMLElement} modal - The modal element
     */
    function populateModal(modal) {
        const title = modal.querySelector('.reading-book-title');
        const developer = modal.querySelector('.reading-author');
        const cover = modal.querySelector('.reading-cover');
        const note = modal.querySelector('.reading-note');

        if (title) title.textContent = currentPlaying.title;
        if (developer) developer.textContent = `by ${currentPlaying.developer}`;
        if (cover) {
            cover.src = currentPlaying.cover;
            cover.alt = currentPlaying.title;
        }
        if (note) note.textContent = currentPlaying.note;
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
        document.addEventListener('DOMContentLoaded', initPlayingModal);
    } else {
        initPlayingModal();
    }
})();
