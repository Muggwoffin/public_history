/**
 * Books Renderer
 * Dynamically renders books from books.js
 */

(function() {
    'use strict';

    /**
     * Initialize books rendering when DOM is ready
     */
    function initBooks() {
        if (typeof books === 'undefined') {
            console.warn('Books data not loaded');
            return;
        }

        // PERF: Cache DOM queries
        const booksSection = document.getElementById('books');
        if (!booksSection) {
            console.warn('Books section not found');
            return;
        }

        // Find or create the books container
        let container = booksSection.querySelector('.books-container');
        if (!container) {
            // PERF: Cache content section query
            const contentSection = booksSection.querySelector('.content-section');
            const decorativeLine = contentSection.querySelector('.decorative-line-thin');

            container = document.createElement('div');
            container.className = 'books-container';

            if (decorativeLine && decorativeLine.nextSibling) {
                contentSection.insertBefore(container, decorativeLine.nextSibling);
            } else {
                contentSection.appendChild(container);
            }
        }

        renderBooks(container);
    }

    /**
     * Render all books, most recent first
     * @param {HTMLElement} container - The container element
     */
    function renderBooks(container) {
        container.innerHTML = '';

        if (books.length === 0) {
            container.innerHTML = '<p class="no-books">No books available at this time.</p>';
            return;
        }

        // Sort books by year (most recent first)
        const sortedBooks = [...books].sort((a, b) => {
            const yearA = parseInt(a.year, 10);
            const yearB = parseInt(b.year, 10);
            return yearB - yearA;
        });

        // Render each book
        sortedBooks.forEach(book => {
            container.appendChild(createBookItem(book));
        });
    }

    /**
     * Create a book item element
     * @param {Object} book - Book data object
     * @returns {HTMLElement} - The book item element
     */
    function createBookItem(book) {
        const item = document.createElement('div');
        item.className = 'book-item';

        const layout = document.createElement('div');
        layout.className = 'book-layout';

        // Book cover
        const cover = document.createElement('img');
        cover.src = book.cover;
        cover.alt = book.title;
        cover.className = 'book-cover';
        layout.appendChild(cover);

        // Book details
        const details = document.createElement('div');
        details.className = 'book-details';

        const title = document.createElement('h3');
        title.className = 'book-title';
        title.textContent = book.title;
        details.appendChild(title);

        const publisher = document.createElement('p');
        publisher.className = 'book-publisher';
        publisher.textContent = `${book.publisher}, ${book.year}`;
        details.appendChild(publisher);

        const description = document.createElement('p');
        description.className = 'book-description';
        description.textContent = book.description;
        details.appendChild(description);

        // Book links
        if (book.publisherLink || book.reviewsLink) {
            const links = document.createElement('div');
            links.className = 'book-links';

            if (book.publisherLink) {
                const pubLink = document.createElement('a');
                pubLink.href = book.publisherLink;
                pubLink.className = 'book-link';
                pubLink.target = '_blank';
                pubLink.rel = 'noopener noreferrer';
                pubLink.textContent = 'PUBLISHER →';
                links.appendChild(pubLink);
            }

            if (book.reviewsLink) {
                const revLink = document.createElement('a');
                revLink.href = book.reviewsLink;
                revLink.className = 'book-link';
                revLink.target = '_blank';
                revLink.rel = 'noopener noreferrer';
                revLink.textContent = 'REVIEWS →';
                links.appendChild(revLink);
            }

            details.appendChild(links);
        }

        layout.appendChild(details);
        item.appendChild(layout);

        return item;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBooks);
    } else {
        initBooks();
    }
})();
