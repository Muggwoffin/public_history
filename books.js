/**
 * Books Data
 * Stores published books for the BOOKS section
 */

const books = [
    {
        "id": "hotel-lux-an-intimate-history-of-communism-s-forgotten-radicals",
        "title": "Hotel Lux: An Intimate History of Communism's Forgotten Radicals",
        "publisher": "Footnote Press",
        "year": "2024",
        "cover": "images/book-cover-1.png",
        "description": "Critically acclaimed book uncovering the intimate lives of international communists who lived in Moscow's Hotel Lux during the 1920s and 940s, revealing forgotten stories of idealism, love, betrayal, and terror. Shortlisted for Irish Book Awards 2024 (History Book of Year). An Irish Times, Foreign Affairs and Big Issue Book of the Year.",
        "publisherLink": "https://footnotepress.com",
        "reviewsLink": null,
        "bookshopLink": "https://uk.bookshop.org/p/books/hotel-lux-an-intimate-history-of-communism-s-forgotten-radicals-maurice-j-casey/7664562?ean=9781804442227&next=t"
    }
];

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = books;
}
