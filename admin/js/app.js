/**
 * Admin Panel Application
 * Orchestrates authentication, navigation, the dashboard, the main.html
 * content editor and image uploads. Content sections are delegated to
 * AdminManagers (collection/singleton managers), LandingImagesManager
 * and StatisticsDashboard.
 *
 * Security notes:
 *  - The GitHub token lives in sessionStorage (cleared when the browser
 *    session ends) and in the GitHubClient instance only.
 *  - All values written into main.html are HTML-escaped, and replacements
 *    use callback functions so "$" sequences in input cannot alter the
 *    replacement pattern.
 *  - Upload filenames are sanitized before becoming repository paths.
 */

/** Global application state shared with the manager modules. */
const AdminApp = {
    /** @type {GitHubClient|null} */
    client: null,
    /** @type {SiteData.Store|null} */
    dataStore: null
};

(function () {
    'use strict';

    const SESSION_KEYS = {
        token: 'github_token',
        repo: 'github_repo',
        branch: 'github_branch'
    };

    document.addEventListener('DOMContentLoaded', () => {
        const token = sessionStorage.getItem(SESSION_KEYS.token);
        const repo = sessionStorage.getItem(SESSION_KEYS.repo);
        const branch = sessionStorage.getItem(SESSION_KEYS.branch);

        if (token && repo && branch) {
            startSession(token, repo, branch);
        }
        initializeEventListeners();
    });

    function initializeEventListeners() {
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => switchSection(tab.dataset.section));
        });

        // Content editor
        document.getElementById('load-content-btn').addEventListener('click', loadContentForEditing);
        document.getElementById('save-content-btn').addEventListener('click', saveContent);

        // General image upload
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) uploadImage(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) uploadImage(e.target.files[0]);
        });

        // Quick uploads to fixed paths
        document.querySelectorAll('.quick-upload-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.parentElement.querySelector('.quick-upload-input').click();
            });
        });
        document.querySelectorAll('.quick-upload-input').forEach(input => {
            input.addEventListener('change', (e) => handleQuickUpload(e, input.dataset.target));
        });
    }

    // ============================================
    // AUTHENTICATION & SESSION
    // ============================================

    async function handleLogin() {
        const token = document.getElementById('pat-input').value.trim();
        const repo = document.getElementById('repo-input').value.trim();
        const branch = document.getElementById('branch-input').value.trim();
        const errorDiv = document.getElementById('login-error');

        errorDiv.style.display = 'none';

        if (!token || !repo || !branch) {
            showLoginError('Please fill in all fields.');
            return;
        }
        if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
            showLoginError('Repository must be in the form username/repository.');
            return;
        }

        try {
            const client = new GitHubClient(token, repo, branch);
            await client.validate();

            sessionStorage.setItem(SESSION_KEYS.token, token);
            sessionStorage.setItem(SESSION_KEYS.repo, repo);
            sessionStorage.setItem(SESSION_KEYS.branch, branch);

            document.getElementById('pat-input').value = '';
            startSession(token, repo, branch);
        } catch (error) {
            showLoginError(`Login failed: ${error.message}`);
        }
    }

    function showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function handleLogout() {
        sessionStorage.removeItem(SESSION_KEYS.token);
        sessionStorage.removeItem(SESSION_KEYS.repo);
        sessionStorage.removeItem(SESSION_KEYS.branch);
        sessionStorage.removeItem('analytics_api_key');
        AdminApp.client = null;
        AdminApp.dataStore = null;
        location.reload();
    }

    function startSession(token, repo, branch) {
        AdminApp.client = new GitHubClient(token, repo, branch);
        AdminApp.dataStore = new SiteData.Store(AdminApp.client);

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-screen').style.display = 'block';
        document.getElementById('repo-info').textContent = `${repo} (${branch})`;

        loadDashboard();
        loadContentForEditing();
        loadRecentImages();
    }

    // ============================================
    // NAVIGATION
    // ============================================

    function switchSection(sectionName) {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeTab) activeTab.classList.add('active');

        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(`${sectionName}-section`)
            || document.getElementById(sectionName);
        if (targetSection) targetSection.classList.add('active');

        // Lazily initialize manager-driven sections
        if (window.AdminManagers && AdminManagers[sectionName]) {
            AdminManagers[sectionName]();
        } else if (sectionName === 'landing-images') {
            LandingImagesManager.init();
        } else if (sectionName === 'statistics') {
            StatisticsDashboard.init();
        }
    }

    // ============================================
    // DASHBOARD
    // ============================================

    async function loadDashboard() {
        const { el } = AdminDom;
        const commitsList = document.getElementById('recent-commits');

        try {
            const commits = await AdminApp.client.recentCommits(5);
            AdminDom.clear(commitsList);

            commits.forEach(commit => {
                const date = new Date(commit.commit.author.date);
                commitsList.appendChild(el('div', { className: 'activity-item' }, [
                    el('strong', { text: commit.commit.message }),
                    el('time', { text: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` })
                ]));
            });

            await loadDashboardStats();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            AdminDom.clear(commitsList);
            commitsList.appendChild(el('p', {
                className: 'error-message', text: 'Failed to load recent commits'
            }));
        }
    }

    async function loadDashboardStats() {
        try {
            const projects = await AdminApp.dataStore.load('projects');
            document.getElementById('stat-projects').textContent = String(projects.length);
        } catch (error) {
            console.error('Failed to count projects:', error);
            document.getElementById('stat-projects').textContent = '?';
        }

        try {
            const images = await AdminApp.client.listDirectory('images');
            document.getElementById('stat-images').textContent =
                String(images.filter(f => f.type === 'file').length);
        } catch (_) {
            document.getElementById('stat-images').textContent = '0';
        }
    }

    // ============================================
    // CONTENT EDITOR (main.html)
    // ============================================

    /**
     * Declarative load/save rules for the editable fragments of main.html.
     * loadPattern's first capture group is shown in the form; save() returns
     * the updated HTML. Values are HTML-escaped before insertion and
     * replacements use callbacks, never replacement-string patterns.
     */
    const CONTENT_FIELDS = [
        {
            inputId: 'site-tagline',
            load: (html) => matchGroup(html, /<p class="masthead-subtitle">(.*?)<\/p>/, 1, decodeEntities),
            save: (html, value) => html.replace(
                /(<p class="masthead-subtitle">).*?(<\/p>)/,
                (m, p1, p2) => p1 + AdminDom.escapeHtml(value) + p2
            )
        },
        {
            inputId: 'about-text',
            load: (html) => matchGroup(html, /<p class="drop-cap">([\s\S]*?)<\/p>/, 1, decodeEntities),
            save: (html, value) => html.replace(
                /(<p class="drop-cap">)[\s\S]*?(<\/p>)/,
                (m, p1, p2) => p1 + AdminDom.escapeHtml(value) + p2
            )
        },
        {
            inputId: 'academic-email',
            load: (html) => matchGroup(html, /Academic Inquiries[\s\S]*?mailto:([^"]+)/, 1),
            save: (html, value) => html.replace(
                /(Academic Inquiries[\s\S]*?<a href="mailto:)[^"]+(">)[^<]+(<\/a>)/,
                (m, p1, p2, p3) => p1 + AdminDom.escapeHtml(value) + p2 + AdminDom.escapeHtml(value) + p3
            )
        },
        {
            inputId: 'institution-name',
            load: (html) => matchGroup(html, /<strong>Institution:<\/strong><br>\s*(.*?)<br>/, 1),
            save: (html, value) => html.replace(
                /(<strong>Institution:<\/strong><br>\s*).*?(<br>)/,
                (m, p1, p2) => p1 + AdminDom.escapeHtml(value) + p2
            )
        },
        {
            inputId: 'department-name',
            load: (html) => matchGroup(html, /<strong>Institution:<\/strong><br>\s*.*?<br>\s*(.*?)\s*<\/p>/, 1),
            save: (html, value) => html.replace(
                /(<strong>Institution:<\/strong><br>\s*.*?<br>\s*).*?(\s*<\/p>)/,
                (m, p1, p2) => p1 + AdminDom.escapeHtml(value) + p2
            )
        },
        {
            inputId: 'media-email',
            load: (html) => matchGroup(html, /Media (?:&amp;|&) Speaking[\s\S]*?mailto:([^"]+)/, 1),
            save: (html, value) => html.replace(
                /(Media (?:&amp;|&) Speaking[\s\S]*?<a href="mailto:)[^"]+(">)[^<]+(<\/a>)/,
                (m, p1, p2, p3) => p1 + AdminDom.escapeHtml(value) + p2 + AdminDom.escapeHtml(value) + p3
            )
        },
        socialLinkField('bluesky-url', 'Bluesky'),
        socialLinkField('knowledge-commons-url', 'Knowledge Commons'),
        socialLinkField('orcid-url', 'ORCID'),
        socialLinkField('linkedin-url', 'LinkedIn'),
        {
            inputId: 'substack-username',
            load: (html) => matchGroup(html, /src="https:\/\/([^.]+)\.substack\.com\/embed"/, 1),
            save: (html, value) => {
                if (!/^[a-zA-Z0-9-]+$/.test(value)) {
                    throw new Error('Substack username may only contain letters, numbers and hyphens');
                }
                return html.replace(
                    /src="https:\/\/[^.]+\.substack\.com\/embed"/,
                    () => `src="https://${value}.substack.com/embed"`
                );
            }
        }
    ];

    function socialLinkField(inputId, label) {
        return {
            inputId,
            load: (html) => {
                const value = matchGroup(
                    html,
                    new RegExp(`href="([^"#]+)"[^>]*class="social-link-block">${label}`),
                    1
                );
                return value;
            },
            save: (html, value) => {
                let parsed;
                try {
                    parsed = new URL(value);
                } catch (_) {
                    throw new Error(`${label} link must be a full URL`);
                }
                if (parsed.protocol !== 'https:') {
                    throw new Error(`${label} link must use https`);
                }
                return html.replace(
                    new RegExp(`(href=")[^"]+("[\\s\\S]{0,50}?class="social-link-block">${label})`),
                    (m, p1, p2) => p1 + AdminDom.escapeHtml(parsed.href) + p2
                );
            }
        };
    }

    function matchGroup(html, pattern, group, transform) {
        const match = html.match(pattern);
        if (!match) return null;
        const value = match[group].trim();
        return transform ? transform(value) : value;
    }

    /** Decode the small set of entities our own escaping produces. */
    function decodeEntities(text) {
        return text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&');
    }

    async function loadContentForEditing() {
        const statusDiv = document.getElementById('content-status');
        AdminDom.setStatus(statusDiv, 'Loading content...', 'info');

        try {
            const file = await AdminApp.client.getFile('main.html');
            CONTENT_FIELDS.forEach(field => {
                const value = field.load(file.content);
                if (value !== null) {
                    document.getElementById(field.inputId).value = value;
                }
            });
            AdminDom.setStatus(statusDiv, 'Content loaded successfully!', 'success');
        } catch (error) {
            AdminDom.setStatus(statusDiv, `Error: ${error.message}`, 'error');
        }
    }

    async function saveContent() {
        const statusDiv = document.getElementById('content-status');
        const saveBtn = document.getElementById('save-content-btn');

        saveBtn.disabled = true;
        AdminDom.setStatus(statusDiv, 'Saving changes...', 'info');

        try {
            const file = await AdminApp.client.getFile('main.html');
            let updatedHTML = file.content;

            CONTENT_FIELDS.forEach(field => {
                const value = document.getElementById(field.inputId).value.trim();
                if (value) {
                    updatedHTML = field.save(updatedHTML, value);
                }
            });

            await AdminApp.client.putFile(
                'main.html', updatedHTML, 'Update site content via admin panel'
            );
            AdminDom.setStatus(statusDiv, 'Changes saved successfully!', 'success');
        } catch (error) {
            AdminDom.setStatus(statusDiv, `Error saving: ${error.message}`, 'error');
        } finally {
            saveBtn.disabled = false;
        }
    }

    // ============================================
    // IMAGE UPLOAD
    // ============================================

    const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

    function validateImage(file, statusDiv) {
        if (!file.type.startsWith('image/')) {
            AdminDom.setStatus(statusDiv, 'Please select an image file', 'error');
            return false;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            AdminDom.setStatus(statusDiv, 'Image must be under 2MB', 'error');
            return false;
        }
        return true;
    }

    async function uploadImage(file) {
        const statusDiv = document.getElementById('upload-status');
        if (!validateImage(file, statusDiv)) return;

        AdminDom.setStatus(statusDiv, 'Uploading image...', 'info');
        try {
            const base64 = await LandingImagesManager.readFileAsBase64(file);
            const fileName = `upload-${Date.now()}-${LandingImagesManager.sanitizeFilename(file.name)}`;
            await AdminApp.client.putBase64(
                `images/${fileName}`, base64, `Upload image: ${fileName}`
            );
            AdminDom.setStatus(statusDiv, 'Image uploaded successfully!', 'success');
            await loadRecentImages();
        } catch (error) {
            AdminDom.setStatus(statusDiv, `Upload failed: ${error.message}`, 'error');
        }
    }

    async function handleQuickUpload(e, targetPath) {
        const file = e.target.files[0];
        if (!file) return;

        const statusDiv = document.getElementById('quick-upload-status');
        if (!validateImage(file, statusDiv)) return;

        AdminDom.setStatus(statusDiv, `Uploading to ${targetPath}...`, 'info');
        try {
            const base64 = await LandingImagesManager.readFileAsBase64(file);
            await AdminApp.client.putBase64(
                targetPath, base64, `Update ${targetPath} via admin panel`
            );
            AdminDom.setStatus(statusDiv, `Successfully uploaded to ${targetPath}!`, 'success');
            await loadRecentImages();
            e.target.value = '';
        } catch (error) {
            AdminDom.setStatus(statusDiv, `Upload failed: ${error.message}`, 'error');
        }
    }

    async function loadRecentImages() {
        const { el } = AdminDom;
        const container = document.getElementById('recent-images');

        try {
            const entries = await AdminApp.client.listDirectory('images');
            const imageFiles = entries.filter(
                f => f.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
            );

            AdminDom.clear(container);
            if (imageFiles.length === 0) {
                container.appendChild(el('p', {
                    className: 'help-text', text: 'No images uploaded yet'
                }));
                return;
            }

            imageFiles.slice(0, 12).forEach(img => {
                const copyBtn = el('button', {
                    className: 'btn btn-secondary copy-url-btn', text: 'Copy URL'
                });
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(`images/${img.name}`);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy URL'; }, 2000);
                });

                // raw.githubusercontent.com reflects uploads immediately,
                // before the GitHub Pages deployment catches up
                const imageUrl = 'https://raw.githubusercontent.com/'
                    + `${AdminApp.client.repo}/${AdminApp.client.branch}/images/`
                    + encodeURIComponent(img.name);

                container.appendChild(el('div', { className: 'image-item' }, [
                    el('img', {
                        attrs: { src: imageUrl, alt: img.name, loading: 'lazy' }
                    }),
                    el('div', { className: 'image-info' }, [
                        el('strong', { text: img.name }),
                        el('small', { text: `${Math.round(img.size / 1024)}KB` }),
                        copyBtn
                    ])
                ]));
            });
        } catch (error) {
            AdminDom.clear(container);
            container.appendChild(el('p', {
                className: 'error-message', text: `Failed to load images: ${error.message}`
            }));
        }
    }
})();
