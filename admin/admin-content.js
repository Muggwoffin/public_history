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
    if (!container) {
        console.error('Reading editor container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Reading editor already initialized');
        return;
    }

    console.log('Initializing reading editor...');

    container.innerHTML = `
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
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const form = document.getElementById('reading-form');
    const loadBtn = document.getElementById('load-reading-btn');

    if (form) {
        form.addEventListener('submit', handleReadingSubmit);
    }
    if (loadBtn) {
        loadBtn.addEventListener('click', loadReading);
    }

    console.log('Reading editor initialized, loading data...');

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
// PLAYING EDITOR
// ============================================

/**
 * Initialize playing content editor
 */
function initPlayingEditor() {
    const container = document.getElementById('playing-editor');
    if (!container) {
        console.error('Playing editor container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Playing editor already initialized');
        return;
    }

    console.log('Initializing playing editor...');

    container.innerHTML = `
        <h2>What I'm Playing</h2>
        <p class="section-description">Update the current game featured in the "What I'm Playing" modal.</p>

        <form id="playing-form" class="content-form">
            <div class="form-group">
                <label for="playing-title">Game Title *</label>
                <input type="text" id="playing-title" required>
            </div>

            <div class="form-group">
                <label for="playing-developer">Developer *</label>
                <input type="text" id="playing-developer" required>
            </div>

            <div class="form-group">
                <label for="playing-cover">Cover Image Path *</label>
                <input type="text" id="playing-cover" placeholder="images/current-playing.jpg" required>
                <small>Upload image via Images tab, then paste path here</small>
            </div>

            <div class="form-group">
                <label for="playing-note">Your Reflection (1-2 sentences) *</label>
                <textarea id="playing-note" rows="3" required></textarea>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="load-playing-btn">Load Current</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const form = document.getElementById('playing-form');
    const loadBtn = document.getElementById('load-playing-btn');

    if (form) {
        form.addEventListener('submit', handlePlayingSubmit);
    }
    if (loadBtn) {
        loadBtn.addEventListener('click', loadPlaying);
    }

    console.log('Playing editor initialized, loading data...');

    // Auto-load on init
    loadPlaying();
}

/**
 * Load current playing from GitHub
 */
async function loadPlaying() {
    try {
        const data = await fetchFileFromGitHub('playing.js');
        const playingData = parsePlayingFile(data.content);

        AdminApp.fileCache['playing.js'] = {
            sha: data.sha,
            content: playingData
        };

        // Populate form
        document.getElementById('playing-title').value = playingData.title || '';
        document.getElementById('playing-developer').value = playingData.developer || '';
        document.getElementById('playing-cover').value = playingData.cover || '';
        document.getElementById('playing-note').value = playingData.note || '';

        showNotification('Playing content loaded');
    } catch (error) {
        console.error('Error loading playing:', error);
        showNotification('Error loading playing content: ' + error.message, 'error');
    }
}

/**
 * Parse playing.js file
 * Uses safe evaluation since playing.js contains a JavaScript object literal, not JSON
 */
function parsePlayingFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+currentPlaying\s*=\s*({[\s\S]*?});/);
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
            throw new Error('Invalid JavaScript object in playing.js');
        }
    }
    return {};
}

/**
 * Handle playing form submission
 */
async function handlePlayingSubmit(e) {
    e.preventDefault();

    const playingData = {
        title: document.getElementById('playing-title').value,
        developer: document.getElementById('playing-developer').value,
        cover: document.getElementById('playing-cover').value,
        note: document.getElementById('playing-note').value
    };

    try {
        const content = generatePlayingFileContent(playingData);
        const sha = AdminApp.fileCache['playing.js'].sha;

        await updateFileOnGitHub('playing.js', content, sha, 'Update current playing');
        showNotification('Playing content saved successfully!');
    } catch (error) {
        console.error('Error saving playing:', error);
        showNotification('Error saving: ' + error.message, 'error');
    }
}

/**
 * Generate playing.js file content
 */
function generatePlayingFileContent(playing) {
    return `/**
 * Current Playing Data
 * Stores information about what Dr Casey is currently playing
 *
 * DATA STRUCTURE:
 * - title: Game title (string)
 * - developer: Game developer (string)
 * - cover: Path to cover image (string)
 * - note: Short reflection or description (string, 1-2 sentences)
 */

const currentPlaying = ${JSON.stringify(playing, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = currentPlaying;
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
    if (!container) {
        console.error('Books manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Books manager already initialized');
        return;
    }

    console.log('Initializing books manager...');

    container.innerHTML = `
        <div class="section-header">
            <h2>Books Manager</h2>
            <button id="add-book-btn" class="btn btn-primary">
                <span>+ Add New Book</span>
            </button>
        </div>

        <div class="books-list" id="books-list">
            <p class="loading-message">Loading books...</p>
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

                    <div class="form-group">
                        <label for="book-bookshop-link">Bookshop.org Purchase Link</label>
                        <input type="url" id="book-bookshop-link" placeholder="https://bookshop.org/...">
                        <small>Add Bookshop.org link for "Purchase Now" button</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-book-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Book</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBtn = document.getElementById('add-book-btn');
    const bookForm = document.getElementById('book-form');
    const cancelBtn = document.getElementById('cancel-book-btn');
    const closeBtn = document.getElementById('book-modal-close');

    if (addBtn) addBtn.addEventListener('click', () => openBookModal());
    if (bookForm) bookForm.addEventListener('submit', handleBookSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBookModal);
    if (closeBtn) closeBtn.addEventListener('click', closeBookModal);

    console.log('Books manager initialized, loading data...');

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
        document.getElementById('book-bookshop-link').value = book.bookshopLink || '';
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
        reviewsLink: document.getElementById('book-reviews-link').value || null,
        bookshopLink: document.getElementById('book-bookshop-link').value || null
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

    const result = await updateFileOnGitHub('books.js', content, sha, 'Update books');

    // Update cache with new SHA to prevent SHA mismatch on subsequent saves
    AdminApp.fileCache['books.js'].sha = result.sha || sha;
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

// ============================================
// WRITING MANAGER
// ============================================

/**
 * Initialize writing manager
 */
function initWritingManager() {
    const container = document.getElementById('writing-manager');
    if (!container) {
        console.error('Writing manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Writing manager already initialized');
        return;
    }

    console.log('Initializing writing manager...');

    container.innerHTML = `
        <div class="section-header">
            <h2>Selected Writing Manager</h2>
            <button id="add-article-btn" class="btn btn-primary">
                <span>+ Add New Article</span>
            </button>
        </div>

        <div class="articles-list" id="articles-list">
            <p class="loading-message">Loading articles...</p>
        </div>

        <!-- Article Modal -->
        <div id="article-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="article-modal-title">Add New Article</h3>
                    <button class="modal-close" id="article-modal-close">&times;</button>
                </div>
                <form id="article-form">
                    <input type="hidden" id="article-id">

                    <div class="form-group">
                        <label for="article-title">Article Title *</label>
                        <input type="text" id="article-title" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="article-outlet">Outlet *</label>
                            <input type="text" id="article-outlet" placeholder="Publication Name" required>
                        </div>
                        <div class="form-group">
                            <label for="article-date">Date *</label>
                            <input type="text" id="article-date" placeholder="March 2024" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="article-excerpt">Excerpt/Summary *</label>
                        <textarea id="article-excerpt" rows="3" required placeholder="1-2 sentence summary"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="article-link">Article Link *</label>
                        <input type="url" id="article-link" placeholder="https://..." required>
                    </div>

                    <div class="form-group">
                        <label for="article-logo">Outlet Logo Path *</label>
                        <input type="text" id="article-logo" placeholder="images/outlet-logo-1.png" required>
                        <small>Upload image via Images tab, then paste path here</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-article-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Article</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBtn = document.getElementById('add-article-btn');
    const articleForm = document.getElementById('article-form');
    const cancelBtn = document.getElementById('cancel-article-btn');
    const closeBtn = document.getElementById('article-modal-close');

    if (addBtn) addBtn.addEventListener('click', () => openArticleModal());
    if (articleForm) articleForm.addEventListener('submit', handleArticleSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', closeArticleModal);
    if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);

    console.log('Writing manager initialized, loading data...');

    loadWriting();
}

/**
 * Load writing from GitHub
 */
async function loadWriting() {
    try {
        const data = await fetchFileFromGitHub('writing.js');
        const writingData = parseWritingFile(data.content);

        AdminApp.fileCache['writing.js'] = {
            sha: data.sha,
            content: writingData
        };

        renderArticlesList(writingData);
    } catch (error) {
        console.error('Error loading writing:', error);
        document.getElementById('articles-list').innerHTML = `
            <p class="error-message">Error loading articles. ${error.message}</p>
        `;
    }
}

/**
 * Parse writing.js file
 */
function parseWritingFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+writing\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
        try {
            const arrayLiteral = match[1];
            const evalFunc = new Function('return ' + arrayLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse array literal:', parseError);
            throw new Error('Invalid JavaScript array in writing.js');
        }
    }
    return [];
}

/**
 * Render articles list
 */
function renderArticlesList(writingData) {
    const container = document.getElementById('articles-list');

    if (writingData.length === 0) {
        container.innerHTML = '<p class="empty-message">No articles yet. Click "Add New Article" to create one.</p>';
        return;
    }

    let html = '';
    writingData.forEach((article, index) => {
        html += `
            <div class="book-row">
                <div class="book-info">
                    <h4>${article.title}</h4>
                    <p class="book-meta">${article.outlet} • ${article.date}</p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-sm btn-secondary" id="edit-article-${index}">Edit</button>
                    <button class="btn btn-sm btn-danger" id="delete-article-${index}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Attach listeners
    writingData.forEach((article, index) => {
        document.getElementById(`edit-article-${index}`).addEventListener('click', () => openArticleModal(article, index));
        document.getElementById(`delete-article-${index}`).addEventListener('click', () => deleteArticle(index));
    });
}

/**
 * Open article modal
 */
function openArticleModal(article = null, index = null) {
    const modal = document.getElementById('article-modal');
    const title = document.getElementById('article-modal-title');
    const form = document.getElementById('article-form');

    if (article) {
        title.textContent = 'Edit Article';
        document.getElementById('article-id').value = index;
        document.getElementById('article-title').value = article.title || '';
        document.getElementById('article-outlet').value = article.outlet || '';
        document.getElementById('article-date').value = article.date || '';
        document.getElementById('article-excerpt').value = article.excerpt || '';
        document.getElementById('article-link').value = article.link || '';
        document.getElementById('article-logo').value = article.outletLogo || '';
    } else {
        title.textContent = 'Add New Article';
        form.reset();
        document.getElementById('article-id').value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Close article modal
 */
function closeArticleModal() {
    document.getElementById('article-modal').style.display = 'none';
}

/**
 * Handle article form submission
 */
async function handleArticleSubmit(e) {
    e.preventDefault();

    const index = document.getElementById('article-id').value;
    const articleData = {
        title: document.getElementById('article-title').value,
        outlet: document.getElementById('article-outlet').value,
        date: document.getElementById('article-date').value,
        excerpt: document.getElementById('article-excerpt').value,
        link: document.getElementById('article-link').value,
        outletLogo: document.getElementById('article-logo').value
    };

    try {
        const writing = AdminApp.fileCache['writing.js'].content;

        if (index !== '') {
            writing[parseInt(index)] = articleData;
        } else {
            writing.push(articleData);
        }

        await saveWritingFile(writing);
        closeArticleModal();
        showNotification('Article saved successfully!');
        loadWriting();
    } catch (error) {
        console.error('Error saving article:', error);
        showNotification('Error saving article: ' + error.message, 'error');
    }
}

/**
 * Delete an article
 */
async function deleteArticle(index) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
        const writing = AdminApp.fileCache['writing.js'].content;
        writing.splice(index, 1);

        await saveWritingFile(writing);
        showNotification('Article deleted successfully!');
        loadWriting();
    } catch (error) {
        console.error('Error deleting article:', error);
        showNotification('Error deleting article: ' + error.message, 'error');
    }
}

/**
 * Save writing file to GitHub
 */
async function saveWritingFile(writing) {
    const content = generateWritingFileContent(writing);
    const sha = AdminApp.fileCache['writing.js'].sha;

    const result = await updateFileOnGitHub('writing.js', content, sha, 'Update writing');

    // Update cache with new SHA to prevent SHA mismatch on subsequent saves
    AdminApp.fileCache['writing.js'].sha = result.sha || sha;
}

/**
 * Generate writing.js file content
 */
function generateWritingFileContent(writing) {
    return `/**
 * Selected Writing Data
 * Articles, essays, and other writing for popular audiences
 *
 * DATA STRUCTURE:
 * - title: Article title (string)
 * - outlet: Publication outlet (string)
 * - date: Publication date (string, e.g., "March 2024")
 * - excerpt: Brief summary/excerpt (string, 1-2 sentences)
 * - link: URL to article (string)
 * - outletLogo: Path to outlet logo image (string)
 */

const writing = ${JSON.stringify(writing, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = writing;
}
`;
}

// ============================================
// DOCUMENTARIES MANAGER
// ============================================

/**
 * Initialize documentaries manager
 */
function initDocumentariesManager() {
    const container = document.getElementById('documentaries-manager');
    if (!container) {
        console.error('Documentaries manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Documentaries manager already initialized');
        return;
    }

    console.log('Initializing documentaries manager...');

    container.innerHTML = `
        <div class="section-header">
            <h2>Documentaries Manager</h2>
            <button id="add-documentary-btn" class="btn btn-primary">
                <span>+ Add New Documentary</span>
            </button>
        </div>

        <div class="documentaries-list" id="documentaries-list">
            <p class="loading-message">Loading documentaries...</p>
        </div>

        <!-- Documentary Modal -->
        <div id="documentary-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="documentary-modal-title">Add New Documentary</h3>
                    <button class="modal-close" id="documentary-modal-close">&times;</button>
                </div>
                <form id="documentary-form">
                    <input type="hidden" id="documentary-id">

                    <div class="form-group">
                        <label for="documentary-title">Documentary Title *</label>
                        <input type="text" id="documentary-title" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="documentary-company">Production Company *</label>
                            <input type="text" id="documentary-company" required>
                        </div>
                        <div class="form-group">
                            <label for="documentary-year">Year *</label>
                            <input type="text" id="documentary-year" placeholder="2024" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="documentary-broadcast">Broadcast Date</label>
                            <input type="text" id="documentary-broadcast" placeholder="March 2024">
                        </div>
                        <div class="form-group">
                            <label for="documentary-commissioner">Commissioner</label>
                            <input type="text" id="documentary-commissioner" placeholder="BBC, RTE, etc.">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="documentary-runtime">Runtime</label>
                        <input type="text" id="documentary-runtime" placeholder="90 mins">
                    </div>

                    <div class="form-group">
                        <label for="documentary-role">Your Role *</label>
                        <input type="text" id="documentary-role" placeholder="Producer / Researcher / Historical Consultant" required>
                    </div>

                    <div class="form-group">
                        <label for="documentary-description">Description *</label>
                        <textarea id="documentary-description" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="documentary-logo">Logo Image Path</label>
                        <input type="text" id="documentary-logo" placeholder="images/documentary-logo-1.png">
                        <small>Upload image via Images tab, then paste path here</small>
                    </div>

                    <div class="form-group">
                        <label for="documentary-link">Watch/Listen Link</label>
                        <input type="url" id="documentary-link" placeholder="https://...">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-documentary-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Documentary</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBtn = document.getElementById('add-documentary-btn');
    const documentaryForm = document.getElementById('documentary-form');
    const cancelBtn = document.getElementById('cancel-documentary-btn');
    const closeBtn = document.getElementById('documentary-modal-close');

    if (addBtn) addBtn.addEventListener('click', () => openDocumentaryModal());
    if (documentaryForm) documentaryForm.addEventListener('submit', handleDocumentarySubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDocumentaryModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDocumentaryModal);

    console.log('Documentaries manager initialized, loading data...');

    loadDocumentaries();
}

/**
 * Load documentaries from GitHub
 */
async function loadDocumentaries() {
    try {
        const data = await fetchFileFromGitHub('documentaries.js');
        const documentariesData = parseDocumentariesFile(data.content);

        AdminApp.fileCache['documentaries.js'] = {
            sha: data.sha,
            content: documentariesData
        };

        renderDocumentariesList(documentariesData);
    } catch (error) {
        console.error('Error loading documentaries:', error);
        document.getElementById('documentaries-list').innerHTML = `
            <p class="error-message">Error loading documentaries. ${error.message}</p>
        `;
    }
}

/**
 * Parse documentaries.js file
 */
function parseDocumentariesFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+documentaries\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
        try {
            const arrayLiteral = match[1];
            const evalFunc = new Function('return ' + arrayLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse array literal:', parseError);
            throw new Error('Invalid JavaScript array in documentaries.js');
        }
    }
    return [];
}

/**
 * Render documentaries list
 */
function renderDocumentariesList(documentariesData) {
    const container = document.getElementById('documentaries-list');

    if (documentariesData.length === 0) {
        container.innerHTML = '<p class="empty-message">No documentaries yet. Click "Add New Documentary" to create one.</p>';
        return;
    }

    // Sort by year descending
    const sorted = [...documentariesData].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    let html = '';
    sorted.forEach((doc, index) => {
        html += `
            <div class="book-row">
                <div class="book-info">
                    <h4>${doc.title}</h4>
                    <p class="book-meta">${doc.productionCompany} • ${doc.year}</p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-sm btn-secondary" id="edit-documentary-${index}">Edit</button>
                    <button class="btn btn-sm btn-danger" id="delete-documentary-${index}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Attach listeners
    sorted.forEach((doc, index) => {
        document.getElementById(`edit-documentary-${index}`).addEventListener('click', () => openDocumentaryModal(doc, index));
        document.getElementById(`delete-documentary-${index}`).addEventListener('click', () => deleteDocumentary(index));
    });
}

/**
 * Open documentary modal
 */
function openDocumentaryModal(documentary = null, index = null) {
    const modal = document.getElementById('documentary-modal');
    const title = document.getElementById('documentary-modal-title');
    const form = document.getElementById('documentary-form');

    if (documentary) {
        title.textContent = 'Edit Documentary';
        document.getElementById('documentary-id').value = index;
        document.getElementById('documentary-title').value = documentary.title || '';
        document.getElementById('documentary-company').value = documentary.productionCompany || '';
        document.getElementById('documentary-year').value = documentary.year || '';
        document.getElementById('documentary-broadcast').value = documentary.broadcastDate || '';
        document.getElementById('documentary-commissioner').value = documentary.commissioner || '';
        document.getElementById('documentary-runtime').value = documentary.runtime || '';
        document.getElementById('documentary-role').value = documentary.role || '';
        document.getElementById('documentary-description').value = documentary.description || '';
        document.getElementById('documentary-logo').value = documentary.logo || '';
        document.getElementById('documentary-link').value = documentary.watchLink || '';
    } else {
        title.textContent = 'Add New Documentary';
        form.reset();
        document.getElementById('documentary-id').value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Close documentary modal
 */
function closeDocumentaryModal() {
    document.getElementById('documentary-modal').style.display = 'none';
}

/**
 * Handle documentary form submission
 */
async function handleDocumentarySubmit(e) {
    e.preventDefault();

    const index = document.getElementById('documentary-id').value;
    const documentaryData = {
        title: document.getElementById('documentary-title').value,
        productionCompany: document.getElementById('documentary-company').value,
        year: document.getElementById('documentary-year').value,
        broadcastDate: document.getElementById('documentary-broadcast').value || null,
        commissioner: document.getElementById('documentary-commissioner').value || null,
        runtime: document.getElementById('documentary-runtime').value || null,
        role: document.getElementById('documentary-role').value,
        description: document.getElementById('documentary-description').value,
        logo: document.getElementById('documentary-logo').value || null,
        watchLink: document.getElementById('documentary-link').value || null
    };

    try {
        const documentaries = AdminApp.fileCache['documentaries.js'].content;

        if (index !== '') {
            documentaries[parseInt(index)] = documentaryData;
        } else {
            documentaries.push(documentaryData);
        }

        await saveDocumentariesFile(documentaries);
        closeDocumentaryModal();
        showNotification('Documentary saved successfully!');
        loadDocumentaries();
    } catch (error) {
        console.error('Error saving documentary:', error);
        showNotification('Error saving documentary: ' + error.message, 'error');
    }
}

/**
 * Delete a documentary
 */
async function deleteDocumentary(index) {
    if (!confirm('Are you sure you want to delete this documentary?')) return;

    try {
        const documentaries = AdminApp.fileCache['documentaries.js'].content;
        documentaries.splice(index, 1);

        await saveDocumentariesFile(documentaries);
        showNotification('Documentary deleted successfully!');
        loadDocumentaries();
    } catch (error) {
        console.error('Error deleting documentary:', error);
        showNotification('Error deleting documentary: ' + error.message, 'error');
    }
}

/**
 * Save documentaries file to GitHub
 */
async function saveDocumentariesFile(documentaries) {
    const content = generateDocumentariesFileContent(documentaries);
    const sha = AdminApp.fileCache['documentaries.js'].sha;

    const result = await updateFileOnGitHub('documentaries.js', content, sha, 'Update documentaries');

    // Update cache with new SHA to prevent SHA mismatch on subsequent saves
    AdminApp.fileCache['documentaries.js'].sha = result.sha || sha;
}

/**
 * Generate documentaries.js file content
 */
function generateDocumentariesFileContent(documentaries) {
    return `/**
 * Documentaries Data
 * Films and documentaries featuring historical consultation or participation
 *
 * DATA STRUCTURE:
 * - title: Documentary title (string)
 * - productionCompany: Production company name (string)
 * - year: Year of release (string)
 * - runtime: Runtime (string, optional)
 * - role: Role in production (string)
 * - description: Brief description (string)
 * - watchLink: URL to watch (string, optional)
 * - logo: Path to production company/documentary logo (string, optional)
 */

const documentaries = ${JSON.stringify(documentaries, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = documentaries;
}
`;
}

// ============================================
// PODCASTS MANAGER
// ============================================

/**
 * Initialize podcasts manager
 */
function initPodcastsManager() {
    const container = document.getElementById('podcasts-manager');
    if (!container) {
        console.error('Podcasts manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Podcasts manager already initialized');
        return;
    }

    console.log('Initializing podcasts manager...');

    container.innerHTML = `
        <div class="section-header">
            <h2>Podcasts Manager</h2>
            <button id="add-podcast-btn" class="btn btn-primary">
                <span>+ Add New Podcast</span>
            </button>
        </div>

        <div class="podcasts-list" id="podcasts-list">
            <p class="loading-message">Loading podcasts...</p>
        </div>

        <!-- Podcast Modal -->
        <div id="podcast-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="podcast-modal-title">Add New Podcast</h3>
                    <button class="modal-close" id="podcast-modal-close">&times;</button>
                </div>
                <form id="podcast-form">
                    <input type="hidden" id="podcast-id">

                    <div class="form-group">
                        <label for="podcast-title">Episode Title *</label>
                        <input type="text" id="podcast-title" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="podcast-name">Podcast Name *</label>
                            <input type="text" id="podcast-name" placeholder="Irish History Podcast" required>
                        </div>
                        <div class="form-group">
                            <label for="podcast-year">Year *</label>
                            <input type="text" id="podcast-year" placeholder="2024" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="podcast-embed">Podcast Embed URL *</label>
                        <input type="url" id="podcast-embed" placeholder="https://embed.podcasts.apple.com/..." required>
                        <small>Get the embed URL from Apple Podcasts, Spotify, or other podcast platforms</small>
                    </div>

                    <div class="form-group">
                        <label for="podcast-description">Description *</label>
                        <textarea id="podcast-description" rows="3" required></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-podcast-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Podcast</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBtn = document.getElementById('add-podcast-btn');
    const podcastForm = document.getElementById('podcast-form');
    const cancelBtn = document.getElementById('cancel-podcast-btn');
    const closeBtn = document.getElementById('podcast-modal-close');

    if (addBtn) addBtn.addEventListener('click', () => openPodcastModal());
    if (podcastForm) podcastForm.addEventListener('submit', handlePodcastSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', closePodcastModal);
    if (closeBtn) closeBtn.addEventListener('click', closePodcastModal);

    console.log('Podcasts manager initialized, loading data...');

    loadPodcasts();
}

/**
 * Load podcasts from GitHub
 */
async function loadPodcasts() {
    try {
        const data = await fetchFileFromGitHub('podcasts.js');
        const podcastsData = parsePodcastsFile(data.content);

        AdminApp.fileCache['podcasts.js'] = {
            sha: data.sha,
            content: podcastsData
        };

        renderPodcastsList(podcastsData);
    } catch (error) {
        console.error('Error loading podcasts:', error);
        document.getElementById('podcasts-list').innerHTML = `
            <p class="error-message">Error loading podcasts. ${error.message}</p>
        `;
    }
}

/**
 * Parse podcasts.js file
 */
function parsePodcastsFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+podcasts\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
        try {
            const arrayLiteral = match[1];
            const evalFunc = new Function('return ' + arrayLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse array literal:', parseError);
            throw new Error('Invalid JavaScript array in podcasts.js');
        }
    }
    return [];
}

/**
 * Render podcasts list
 */
function renderPodcastsList(podcastsData) {
    const container = document.getElementById('podcasts-list');

    if (podcastsData.length === 0) {
        container.innerHTML = '<p class="empty-message">No podcasts yet. Click "Add New Podcast" to create one.</p>';
        return;
    }

    // Sort by year descending
    const sorted = [...podcastsData].sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
    });

    let html = '';
    sorted.forEach((podcast, index) => {
        html += `
            <div class="book-row">
                <div class="book-info">
                    <h4>${podcast.title}</h4>
                    <p class="book-meta">${podcast.podcastName} • ${podcast.year}</p>
                </div>
                <div class="book-actions">
                    <button class="btn btn-sm btn-secondary" id="edit-podcast-${index}">Edit</button>
                    <button class="btn btn-sm btn-danger" id="delete-podcast-${index}">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Attach listeners
    sorted.forEach((podcast, index) => {
        document.getElementById(`edit-podcast-${index}`).addEventListener('click', () => openPodcastModal(podcast, index));
        document.getElementById(`delete-podcast-${index}`).addEventListener('click', () => deletePodcast(index));
    });
}

/**
 * Open podcast modal
 */
function openPodcastModal(podcast = null, index = null) {
    const modal = document.getElementById('podcast-modal');
    const title = document.getElementById('podcast-modal-title');
    const form = document.getElementById('podcast-form');

    if (podcast) {
        title.textContent = 'Edit Podcast';
        document.getElementById('podcast-id').value = index;
        document.getElementById('podcast-title').value = podcast.title || '';
        document.getElementById('podcast-name').value = podcast.podcastName || '';
        document.getElementById('podcast-year').value = podcast.year || '';
        document.getElementById('podcast-embed').value = podcast.embedUrl || '';
        document.getElementById('podcast-description').value = podcast.description || '';
    } else {
        title.textContent = 'Add New Podcast';
        form.reset();
        document.getElementById('podcast-id').value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Close podcast modal
 */
function closePodcastModal() {
    document.getElementById('podcast-modal').style.display = 'none';
}

/**
 * Handle podcast form submission
 */
async function handlePodcastSubmit(e) {
    e.preventDefault();

    const index = document.getElementById('podcast-id').value;
    const podcastData = {
        title: document.getElementById('podcast-title').value,
        podcastName: document.getElementById('podcast-name').value,
        year: document.getElementById('podcast-year').value,
        embedUrl: document.getElementById('podcast-embed').value,
        description: document.getElementById('podcast-description').value
    };

    try {
        const podcasts = AdminApp.fileCache['podcasts.js'].content;

        if (index !== '') {
            podcasts[parseInt(index)] = podcastData;
        } else {
            podcasts.push(podcastData);
        }

        await savePodcastsFile(podcasts);
        closePodcastModal();
        showNotification('Podcast saved successfully!');
        loadPodcasts();
    } catch (error) {
        console.error('Error saving podcast:', error);
        showNotification('Error saving podcast: ' + error.message, 'error');
    }
}

/**
 * Delete a podcast
 */
async function deletePodcast(index) {
    if (!confirm('Are you sure you want to delete this podcast?')) return;

    try {
        const podcasts = AdminApp.fileCache['podcasts.js'].content;
        podcasts.splice(index, 1);

        await savePodcastsFile(podcasts);
        showNotification('Podcast deleted successfully!');
        loadPodcasts();
    } catch (error) {
        console.error('Error deleting podcast:', error);
        showNotification('Error deleting podcast: ' + error.message, 'error');
    }
}

/**
 * Save podcasts file to GitHub
 */
async function savePodcastsFile(podcasts) {
    const content = generatePodcastsFileContent(podcasts);
    const sha = AdminApp.fileCache['podcasts.js'].sha;

    const result = await updateFileOnGitHub('podcasts.js', content, sha, 'Update podcasts');

    // Update cache with new SHA to prevent SHA mismatch on subsequent saves
    AdminApp.fileCache['podcasts.js'].sha = result.sha || sha;
}

/**
 * Generate podcasts.js file content
 */
function generatePodcastsFileContent(podcasts) {
    return `/**
 * Podcasts Data
 * Recent podcast appearances and interviews
 *
 * DATA STRUCTURE:
 * - title: Episode title (string)
 * - podcastName: Name of the podcast (string)
 * - year: Year of episode (string)
 * - embedUrl: Podcast embed URL (string)
 * - description: Brief description (string)
 */

const podcasts = ${JSON.stringify(podcasts, null, 4)};

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = podcasts;
}
`;
}

// Export functions
if (typeof window !== 'undefined') {
    window.initReadingEditor = initReadingEditor;
    window.initPlayingEditor = initPlayingEditor;
    window.initBooksManager = initBooksManager;
    window.initWritingManager = initWritingManager;
    window.initDocumentariesManager = initDocumentariesManager;
    window.initPodcastsManager = initPodcastsManager;
}
