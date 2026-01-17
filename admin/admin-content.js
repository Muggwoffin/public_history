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

// Export functions
if (typeof window !== 'undefined') {
    window.initReadingEditor = initReadingEditor;
    window.initPlayingEditor = initPlayingEditor;
    window.initBooksManager = initBooksManager;
    window.initWritingManager = initWritingManager;
}
