/**
 * Admin Panel - Content Boxes Manager
 * Manages reading.js and books.js via GitHub API
 */

// ============================================
// "WHAT I'M READING" EDITOR
// ============================================

/**
 * Initialize reading content editor
 */
function initReadingEditor() {
    const container = document.getElementById('reading-editor');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-section">
            <h2>What I'm Reading</h2>
            <p class="section-description">Update the current book featured in the "What I'm Reading" modal.</p>

            <form id="reading-form" class="content-form">
                <div class="form-group">
                    <label for="reading-title">Book Title *</label>
                    <input type="text" id="reading-title" required>
                </div>

                <div class="form-group">
                    <label for="reading-author">Author *</label>
                    <input type="text" id="reading-author" required>
                </div>

                <div class="form-group">
                    <label for="reading-cover">Cover Image Path *</label>
                    <input type="text" id="reading-cover" placeholder="images/current-reading.jpg" required>
                    <small>Upload image via Images tab, then paste path here</small>
                </div>

                <div class="form-group">
                    <label for="reading-note">Your Reflection (1-2 sentences) *</label>
                    <textarea id="reading-note" rows="3" required></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="load-reading-btn">Load Current</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('reading-form').addEventListener('submit', handleReadingSubmit);
    document.getElementById('load-reading-btn').addEventListener('click', loadReading);

    // Auto-load on init
    loadReading();
}

/**
 * Load current reading from GitHub
 */
async function loadReading() {
    try {
        const data = await fetchFileFromGitHub('reading.js');
        const readingData = parseReadingFile(data.content);

        AdminApp.fileCache['reading.js'] = {
            sha: data.sha,
            content: readingData
        };

        // Populate form
        document.getElementById('reading-title').value = readingData.title || '';
        document.getElementById('reading-author').value = readingData.author || '';
        document.getElementById('reading-cover').value = readingData.cover || '';
        document.getElementById('reading-note').value = readingData.note || '';

        showNotification('Reading content loaded');
    } catch (error) {
        console.error('Error loading reading:', error);
        showNotification('Error loading reading content: ' + error.message, 'error');
    }
}

/**
 * Parse reading.js file
 * Uses safe evaluation since reading.js contains a JavaScript object literal, not JSON
 */
function parseReadingFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+currentReading\s*=\s*({[\s\S]*?});/);
    if (match) {
        try {
            // Extract the object literal
            const objectLiteral = match[1];

            // Use Function constructor to safely evaluate the object literal
            // This works because the object is a pure data structure with no executable code
            const evalFunc = new Function('return ' + objectLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse object literal:', parseError);
            throw new Error('Invalid JavaScript object in reading.js');
        }
    }
    return {};
}

/**
 * Handle reading form submission
 */
async function handleReadingSubmit(e) {
    e.preventDefault();

    const readingData = {
        title: document.getElementById('reading-title').value,
        author: document.getElementById('reading-author').value,
        cover: document.getElementById('reading-cover').value,
        note: document.getElementById('reading-note').value
    };

    try {
        const content = generateReadingFileContent(readingData);
        const sha = AdminApp.fileCache['reading.js'].sha;

        await updateFileOnGitHub('reading.js', content, sha, 'Update current reading');
        showNotification('Reading content saved successfully!');
    } catch (error) {
        console.error('Error saving reading:', error);
        showNotification('Error saving: ' + error.message, 'error');
    }
}

/**
 * Generate reading.js file content
 */
function generateReadingFileContent(reading) {
    return `/**
 * Current Reading Data
 * Stores information about what Dr Casey is currently reading
 */

const currentReading = ${JSON.stringify(reading, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentReading;
}
`;
}

// ============================================
// BOOKS MANAGER
// ============================================

/**
 * Initialize books manager
 */
function initBooksManager() {
    const container = document.getElementById('books-manager');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-section">
            <div class="section-header">
                <h2>Books Manager</h2>
                <button id="add-book-btn" class="btn btn-primary">
                    <span>+ Add New Book</span>
                </button>
            </div>

            <div class="books-list" id="books-list">
                <p class="loading-message">Loading books...</p>
            </div>
        </div>

        <!-- Book Modal -->
        <div id="book-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="book-modal-title">Add New Book</h3>
                    <button class="modal-close" id="book-modal-close">&times;</button>
                </div>
                <form id="book-form">
                    <input type="hidden" id="book-id">

                    <div class="form-group">
                        <label for="book-title">Book Title *</label>
                        <input type="text" id="book-title" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="book-publisher">Publisher *</label>
                            <input type="text" id="book-publisher" required>
                        </div>
                        <div class="form-group">
                            <label for="book-year">Year *</label>
                            <input type="text" id="book-year" placeholder="2024" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="book-cover">Cover Image Path *</label>
                        <input type="text" id="book-cover" placeholder="images/book-cover-1.png" required>
                        <small>Upload image via Images tab, then paste path here</small>
                    </div>

                    <div class="form-group">
                        <label for="book-description">Description *</label>
                        <textarea id="book-description" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="book-publisher-link">Publisher Link</label>
                        <input type="url" id="book-publisher-link" placeholder="https://...">
                    </div>

                    <div class="form-group">
                        <label for="book-reviews-link">Reviews Link</label>
                        <input type="url" id="book-reviews-link" placeholder="https://...">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-book-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Book</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('add-book-btn').addEventListener('click', () => openBookModal());
    document.getElementById('book-form').addEventListener('submit', handleBookSubmit);
    document.getElementById('cancel-book-btn').addEventListener('click', closeBookModal);
    document.getElementById('book-modal-close').addEventListener('click', closeBookModal);

    loadBooks();
}

/**
 * Load books from GitHub
 */
async function loadBooks() {
    try {
        const data = await fetchFileFromGitHub('books.js');
        const booksData = parseBooksFile(data.content);

        AdminApp.fileCache['books.js'] = {
            sha: data.sha,
            content: booksData
        };

        renderBooksList(booksData);
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById('books-list').innerHTML = `
            <p class="error-message">Error loading books. ${error.message}</p>
        `;
    }
}

/**
 * Parse books.js file
 * Uses safe evaluation since books.js contains a JavaScript array literal, not JSON
 */
function parseBooksFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+books\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
        try {
            // Extract the array literal
            const arrayLiteral = match[1];

            // Use Function constructor to safely evaluate the array literal
            const evalFunc = new Function('return ' + arrayLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse array literal:', parseError);
            throw new Error('Invalid JavaScript array in books.js');
        }
    }
    return [];
}

/**
 * Render books list
 */
function renderBooksList(booksData) {
    const container = document.getElementById('books-list');

    if (booksData.length === 0) {
        container.innerHTML = '<p class="empty-message">No books yet. Click "Add New Book" to create one.</p>';
        return;
    }

    // Sort by year descending
    const sorted = [...booksData].sort((a, b) => parseInt(b.year) - parseInt(a.year));

    let html = '';
    sorted.forEach((book, index) => {
        html += `
            <div class="book-row">
                <div class="book-info">
                    <h4>${book.title}</h4>
                    <p class="book-meta">${book.publisher}, ${book.year}</p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-sm btn-secondary" id="edit-book-${index}">Edit</button>
                    <button class="btn btn-sm btn-danger" id="delete-book-${index}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Attach listeners
    sorted.forEach((book, index) => {
        document.getElementById(`edit-book-${index}`).addEventListener('click', () => openBookModal(book, index));
        document.getElementById(`delete-book-${index}`).addEventListener('click', () => deleteBook(index));
    });
}

/**
 * Open book modal
 */
function openBookModal(book = null, index = null) {
    const modal = document.getElementById('book-modal');
    const title = document.getElementById('book-modal-title');
    const form = document.getElementById('book-form');

    if (book) {
        title.textContent = 'Edit Book';
        document.getElementById('book-id').value = index;
        document.getElementById('book-title').value = book.title || '';
        document.getElementById('book-publisher').value = book.publisher || '';
        document.getElementById('book-year').value = book.year || '';
        document.getElementById('book-cover').value = book.cover || '';
        document.getElementById('book-description').value = book.description || '';
        document.getElementById('book-publisher-link').value = book.publisherLink || '';
        document.getElementById('book-reviews-link').value = book.reviewsLink || '';
    } else {
        title.textContent = 'Add New Book';
        form.reset();
        document.getElementById('book-id').value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Close book modal
 */
function closeBookModal() {
    document.getElementById('book-modal').style.display = 'none';
}

/**
 * Handle book form submission
 */
async function handleBookSubmit(e) {
    e.preventDefault();

    const index = document.getElementById('book-id').value;
    const bookData = {
        id: document.getElementById('book-title').value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: document.getElementById('book-title').value,
        publisher: document.getElementById('book-publisher').value,
        year: document.getElementById('book-year').value,
        cover: document.getElementById('book-cover').value,
        description: document.getElementById('book-description').value,
        publisherLink: document.getElementById('book-publisher-link').value || null,
        reviewsLink: document.getElementById('book-reviews-link').value || null
    };

    try {
        const books = AdminApp.fileCache['books.js'].content;

        if (index !== '') {
            books[parseInt(index)] = bookData;
        } else {
            books.push(bookData);
        }

        await saveBooksFile(books);
        closeBookModal();
        showNotification('Book saved successfully!');
        loadBooks();
    } catch (error) {
        console.error('Error saving book:', error);
        showNotification('Error saving book: ' + error.message, 'error');
    }
}

/**
 * Delete a book
 */
async function deleteBook(index) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const books = AdminApp.fileCache['books.js'].content;
        books.splice(index, 1);

        await saveBooksFile(books);
        showNotification('Book deleted successfully!');
        loadBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('Error deleting book: ' + error.message, 'error');
    }
}

/**
 * Save books file to GitHub
 */
async function saveBooksFile(books) {
    const content = generateBooksFileContent(books);
    const sha = AdminApp.fileCache['books.js'].sha;

    await updateFileOnGitHub('books.js', content, sha, 'Update books');
}

/**
 * Generate books.js file content
 */
function generateBooksFileContent(books) {
    return `/**
 * Books Data
 * Stores published books for the BOOKS section
 */

const books = ${JSON.stringify(books, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = books;
}
`;
}

// Export functions
if (typeof window !== 'undefined') {
    window.initReadingEditor = initReadingEditor;
    window.initBooksManager = initBooksManager;
}
