/**
 * Books Renderer
 * Renders the BOOKS section from the global `books` data (books.js).
 */

(function () {
    'use strict';

    const { el, link, renderList, ensureSectionContainer, registerRenderer } = SiteCore;

    function createBookItem(book) {
        const details = el('div', { className: 'book-details' }, [
            el('h3', { className: 'book-title', text: book.title }),
            el('p', { className: 'book-publisher', text: `${book.publisher}, ${book.year}` }),
            el('p', { className: 'book-description', text: book.description })
        ]);

        // Press and reader pull-quotes (optional per book)
        if (Array.isArray(book.reviews) && book.reviews.length > 0) {
            const reviews = el('div', { className: 'book-reviews' });
            book.reviews.forEach(review => {
                if (!review || !review.quote) return;
                const quote = el('blockquote', { className: 'book-review' }, [
                    el('p', {
                        className: 'book-review-quote',
                        text: '“' + review.quote + '”'
                    })
                ]);
                if (review.source) {
                    quote.appendChild(el('cite', {
                        className: 'book-review-source', text: review.source
                    }));
                }
                reviews.appendChild(quote);
            });
            if (reviews.childElementCount > 0) details.appendChild(reviews);
        }

        const links = el('div', { className: 'book-links' });
        if (book.publisherLink) {
            links.appendChild(link(book.publisherLink, 'book-link', 'PUBLISHER →'));
        }
        if (book.reviewsLink) {
            links.appendChild(link(book.reviewsLink, 'book-link', 'REVIEWS →'));
        }
        if (book.bookshopLink) {
            const bookshopLink = link(book.bookshopLink, 'book-link bookshop-link', '');
            bookshopLink.appendChild(el('span', {
                className: 'bookshop-content',
                text: '📚 PURCHASE ON BOOKSHOP.ORG →'
            }));
            links.appendChild(bookshopLink);
        }
        if (links.childElementCount > 0) {
            details.appendChild(links);
        }

        const cover = el('img', {
            className: 'book-cover',
            attrs: {
                src: book.cover, alt: book.title,
                loading: 'lazy', decoding: 'async'
            }
        });

        return el('div', { className: 'book-item' }, [
            el('div', { className: 'book-layout' }, [cover, details])
        ]);
    }

    registerRenderer(() => books, (books) => {
        const container = ensureSectionContainer('books', 'books-container');
        if (!container) return;

        const sorted = [...books].sort(
            (a, b) => parseInt(b.year, 10) - parseInt(a.year, 10)
        );
        renderList(container, sorted, createBookItem, {
            className: 'no-books',
            text: 'No books available at this time.'
        });
    });
})();
