/**
 * Content Modal
 * A single factory powering both "What I'm Reading" and "What I'm Playing"
 * modals. Each instance is configured with its element ids, the global
 * data variable to display, and a by-line field name.
 */

(function () {
    'use strict';

    const { onReady } = SiteCore;

    /**
     * Wire one modal instance.
     * @param {{modalId: string, triggerId: string, closeBtnId: string,
     *          getData: () => Object, creditField: string}} config
     */
    function setupContentModal(config) {
        let data;
        try {
            data = config.getData();
        } catch (_) {
            data = undefined; // data file not loaded
        }
        if (typeof data === 'undefined') {
            console.warn('Modal data file not loaded; modal skipped');
            return;
        }

        const modal = document.getElementById(config.modalId);
        const trigger = document.getElementById(config.triggerId);
        const closeBtn = document.getElementById(config.closeBtnId);

        if (!modal || !trigger) {
            // Triggers are optional page features; missing ones are not errors.
            return;
        }

        populate(modal, data, config.creditField);

        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                close();
            }
        };

        function open(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', escapeHandler);

            const focusable = modal.querySelectorAll('button, a[href]');
            if (focusable.length > 0) focusable[0].focus();
        }

        function close() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escapeHandler);
        }

        trigger.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }

    /**
     * Fill the modal's content slots from the data object.
     */
    function populate(modal, data, creditField) {
        const title = modal.querySelector('.reading-book-title');
        const credit = modal.querySelector('.reading-author');
        const cover = modal.querySelector('.reading-cover');
        const note = modal.querySelector('.reading-note');

        if (title) title.textContent = data.title;
        if (credit) credit.textContent = `by ${data[creditField]}`;
        if (cover) {
            cover.src = data.cover;
            cover.alt = data.title;
        }
        if (note) note.textContent = data.note;
    }

    onReady(() => {
        setupContentModal({
            modalId: 'reading-modal',
            triggerId: 'readingLink',
            closeBtnId: 'close-reading-modal',
            getData: () => currentReading,
            creditField: 'author'
        });
        setupContentModal({
            modalId: 'playing-modal',
            triggerId: 'playingLink',
            closeBtnId: 'close-playing-modal',
            getData: () => currentPlaying,
            creditField: 'developer'
        });
    });
})();
