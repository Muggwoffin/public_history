/**
 * Admin Panel Logic
 * Manages GitHub API authentication and content operations
 */

// ============================================
// GLOBAL STATE
// ============================================

const AdminApp = {
    token: null,
    repo: null,
    branch: null,
    repoOwner: null,
    repoName: null,
    apiBase: 'https://api.github.com',
    currentProjects: [],
    fileCache: {}
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const savedToken = sessionStorage.getItem('github_token');
    const savedRepo = sessionStorage.getItem('github_repo');
    const savedBranch = sessionStorage.getItem('github_branch');

    if (savedToken && savedRepo && savedBranch) {
        AdminApp.token = savedToken;
        AdminApp.repo = savedRepo;
        AdminApp.branch = savedBranch;
        [AdminApp.repoOwner, AdminApp.repoName] = savedRepo.split('/');
        showAdminPanel();
    }

    initializeEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', handleLogin);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSection(tab.dataset.section));
    });

    // Content editor
    document.getElementById('load-content-btn').addEventListener('click', loadContentForEditing);
    document.getElementById('save-content-btn').addEventListener('click', saveContent);
    document.getElementById('about-text').addEventListener('input', updateMarkdownPreview);

    // Image upload
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Quick upload buttons
    document.querySelectorAll('.quick-upload-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.parentElement.querySelector('.quick-upload-input');
            input.click();
        });
    });

    document.querySelectorAll('.quick-upload-input').forEach(input => {
        input.addEventListener('change', (e) => handleQuickUpload(e, input.dataset.target));
    });

    // Timeline manager
    document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
    document.getElementById('reload-timeline-btn').addEventListener('click', loadTimelineProjects);
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
    document.getElementById('cancel-project-btn').addEventListener('click', closeProjectModal);
    document.getElementById('modal-close').addEventListener('click', closeProjectModal);
    document.getElementById('modal-overlay').addEventListener('click', closeProjectModal);
}

// ============================================
// AUTHENTICATION
// ============================================

async function handleLogin() {
    const token = document.getElementById('pat-input').value.trim();
    const repo = document.getElementById('repo-input').value.trim();
    const branch = document.getElementById('branch-input').value.trim();
    const errorDiv = document.getElementById('login-error');

    if (!token || !repo || !branch) {
        errorDiv.textContent = 'Please fill in all fields.';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate token by making a test API call
    try {
        const [owner, name] = repo.split('/');
        const response = await fetch(`${AdminApp.apiBase}/repos/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token or repository');
        }

        // Save credentials
        AdminApp.token = token;
        AdminApp.repo = repo;
        AdminApp.branch = branch;
        AdminApp.repoOwner = owner;
        AdminApp.repoName = name;

        sessionStorage.setItem('github_token', token);
        sessionStorage.setItem('github_repo', repo);
        sessionStorage.setItem('github_branch', branch);

        showAdminPanel();
    } catch (error) {
        errorDiv.textContent = `Login failed: ${error.message}`;
        errorDiv.style.display = 'block';
    }
}

function handleLogout() {
    sessionStorage.clear();
    AdminApp.token = null;
    AdminApp.repo = null;
    AdminApp.branch = null;
    location.reload();
}

function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'block';
    document.getElementById('repo-info').textContent = `${AdminApp.repo} (${AdminApp.branch})`;

    // Load initial data
    loadDashboard();
    loadContentForEditing();
    loadRecentImages();
    loadTimelineProjects();
}

// ============================================
// GITHUB API OPERATIONS
// ============================================

async function githubAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `token ${AdminApp.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${AdminApp.apiBase}${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return await response.json();
}

async function getFile(path) {
    if (AdminApp.fileCache[path]) {
        return AdminApp.fileCache[path];
    }

    const data = await githubAPI(`/repos/${AdminApp.repo}/contents/${path}?ref=${AdminApp.branch}`);
    // Properly decode UTF-8 content
    const content = decodeURIComponent(escape(atob(data.content)));

    AdminApp.fileCache[path] = {
        content,
        sha: data.sha
    };

    return AdminApp.fileCache[path];
}

async function updateFile(path, content, message) {
    const fileData = await getFile(path);

    const response = await githubAPI(`/repos/${AdminApp.repo}/contents/${path}`, 'PUT', {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: fileData.sha,
        branch: AdminApp.branch
    });

    // Update cache
    AdminApp.fileCache[path] = {
        content,
        sha: response.content.sha
    };

    return response;
}

async function createFile(path, content, message) {
    const response = await githubAPI(`/repos/${AdminApp.repo}/contents/${path}`, 'PUT', {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: AdminApp.branch
    });

    return response;
}

async function getRecentCommits() {
    return await githubAPI(`/repos/${AdminApp.repo}/commits?sha=${AdminApp.branch}&per_page=5`);
}

async function listDirectory(path) {
    return await githubAPI(`/repos/${AdminApp.repo}/contents/${path}?ref=${AdminApp.branch}`);
}

// ============================================
// NAVIGATION
// ============================================

function switchSection(sectionName) {
    // Update tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update sections - try with -section suffix first (old sections), then without (new sections)
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    let targetSection = document.getElementById(`${sectionName}-section`);
    if (!targetSection) {
        targetSection = document.getElementById(sectionName);
    }

    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Initialize new admin sections when needed
    switch(sectionName) {
        case 'events-manager':
            if (typeof initEventsManager === 'function') initEventsManager();
            break;
        case 'content-boxes':
            if (typeof initReadingEditor === 'function') initReadingEditor();
            if (typeof initPlayingEditor === 'function') initPlayingEditor();
            if (typeof initBooksManager === 'function') initBooksManager();
            if (typeof initWritingManager === 'function') initWritingManager();
            if (typeof initDocumentariesManager === 'function') initDocumentariesManager();
            if (typeof initPodcastsManager === 'function') initPodcastsManager();
            break;
        case 'landing-images':
            if (typeof initLandingImagesManager === 'function') initLandingImagesManager();
            break;
        case 'statistics':
            if (typeof initStatisticsDashboard === 'function') initStatisticsDashboard();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    try {
        // Load recent commits
        const commits = await getRecentCommits();
        const commitsList = document.getElementById('recent-commits');
        commitsList.innerHTML = '';

        commits.slice(0, 5).forEach(commit => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            const date = new Date(commit.commit.author.date);
            item.innerHTML = `
                <strong>${commit.commit.message}</strong>
                <time>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</time>
            `;
            commitsList.appendChild(item);
        });

        // Load stats
        await loadDashboardStats();
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        document.getElementById('recent-commits').innerHTML = '<p class="error-message">Failed to load recent commits</p>';
    }
}

async function loadDashboardStats() {
    try {
        // Count timeline projects
        const projectsFile = await getFile('projects.js');
        const projectsMatch = projectsFile.content.match(/const timelineData = \[([\s\S]*?)\];/);
        if (projectsMatch) {
            const projectsStr = '[' + projectsMatch[1] + ']';
            const projects = eval(projectsStr);
            document.getElementById('stat-projects').textContent = projects.length;
        }

        // Count images
        try {
            const images = await listDirectory('images');
            document.getElementById('stat-images').textContent = images.filter(f => f.type === 'file').length;
        } catch (e) {
            document.getElementById('stat-images').textContent = '0';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// ============================================
// CONTENT EDITOR
// ============================================

async function loadContentForEditing() {
    const statusDiv = document.getElementById('content-status');
    statusDiv.textContent = 'Loading content...';
    statusDiv.className = 'status-message info';

    try {
        const mainHTML = await getFile('main.html');
        const content = mainHTML.content;

        // General Settings
        const taglineMatch = content.match(/<div class="masthead-subtitle">(.*?)<\/div>/);
        if (taglineMatch) document.getElementById('site-tagline').value = taglineMatch[1].trim();

        const aboutMatch = content.match(/<p class="drop-cap">([\s\S]*?)<\/p>/);
        if (aboutMatch) document.getElementById('about-text').value = aboutMatch[1].trim();

        const archiveGuideMatch = content.match(/class="reading-link archive-link"[^>]*href="([^"]+)"/);
        if (archiveGuideMatch && archiveGuideMatch[1] !== 'YOUR_GOOGLE_DOC_URL_HERE') {
            document.getElementById('archive-food-guide-url').value = archiveGuideMatch[1];
        }

        const whatsReadingMatch = content.match(/id="readingLink"[^>]*href="([^"#]+)"/);
        if (whatsReadingMatch && whatsReadingMatch[1] !== '#') {
            document.getElementById('whats-reading-url').value = whatsReadingMatch[1];
        }

        // Contact Information
        const academicEmailMatch = content.match(/Academic Inquiries[\s\S]*?mailto:([^"]+)/);
        if (academicEmailMatch) document.getElementById('academic-email').value = academicEmailMatch[1];

        const institutionMatch = content.match(/<strong>Institution:<\/strong><br>\s*(.*?)<br>/);
        if (institutionMatch) document.getElementById('institution-name').value = institutionMatch[1].trim();

        const departmentMatch = content.match(/<strong>Institution:<\/strong><br>\s*.*?<br>\s*(.*?)\s*<\/p>/);
        if (departmentMatch) document.getElementById('department-name').value = departmentMatch[1].trim();

        const mediaEmailMatch = content.match(/Media & Speaking[\s\S]*?mailto:([^"]+)/);
        if (mediaEmailMatch) document.getElementById('media-email').value = mediaEmailMatch[1];

        const blueskyMatch = content.match(/href="([^"#]+)"[^>]*class="social-link-block">Bluesky/);
        if (blueskyMatch && blueskyMatch[1] !== '#') document.getElementById('bluesky-url').value = blueskyMatch[1];

        const knowledgeCommonsMatch = content.match(/href="([^"#]+)"[^>]*class="social-link-block">Knowledge Commons/);
        if (knowledgeCommonsMatch && knowledgeCommonsMatch[1] !== '#') document.getElementById('knowledge-commons-url').value = knowledgeCommonsMatch[1];

        const orcidMatch = content.match(/href="([^"#]+)"[^>]*class="social-link-block">ORCID/);
        if (orcidMatch && orcidMatch[1] !== '#') document.getElementById('orcid-url').value = orcidMatch[1];

        const linkedinMatch = content.match(/href="([^"#]+)"[^>]*class="social-link-block">LinkedIn/);
        if (linkedinMatch && linkedinMatch[1] !== '#') document.getElementById('linkedin-url').value = linkedinMatch[1];

        // Newsletter
        const substackMatch = content.match(/src="https:\/\/([^.]+)\.substack\.com\/embed"/);
        if (substackMatch) document.getElementById('substack-username').value = substackMatch[1];

        // Podcasts
        const podcastMatches = content.matchAll(/<div class="podcast-embed">\s*<h4 class="podcast-title">(.*?)<\/h4>\s*<p class="podcast-meta">(.*?)<\/p>\s*<iframe[^>]*src="([^"]+)"[\s\S]*?<p class="podcast-description">(.*?)<\/p>/g);
        const podcasts = Array.from(podcastMatches);

        if (podcasts[0]) {
            document.getElementById('podcast1-title').value = podcasts[0][1].trim();
            document.getElementById('podcast1-meta').value = podcasts[0][2].trim();
            document.getElementById('podcast1-embed').value = podcasts[0][3].trim();
            document.getElementById('podcast1-description').value = podcasts[0][4].trim();
        }
        if (podcasts[1]) {
            document.getElementById('podcast2-title').value = podcasts[1][1].trim();
            document.getElementById('podcast2-meta').value = podcasts[1][2].trim();
            document.getElementById('podcast2-embed').value = podcasts[1][3].trim();
            document.getElementById('podcast2-description').value = podcasts[1][4].trim();
        }

        // Documentaries
        const docMatches = content.matchAll(/<div class="media-item">[\s\S]*?<h3 class="media-title">(.*?)<\/h3>\s*<p class="media-meta">(.*?)<\/p>\s*<p class="media-role">Role: (.*?)<\/p>\s*<p class="media-description">(.*?)<\/p>\s*<a href="([^"]+)"/g);
        const docs = Array.from(docMatches);

        if (docs[0]) {
            document.getElementById('doc1-title').value = docs[0][1].trim();
            document.getElementById('doc1-meta').value = docs[0][2].trim();
            document.getElementById('doc1-role').value = docs[0][3].trim();
            document.getElementById('doc1-description').value = docs[0][4].trim();
            if (docs[0][5] !== '#') document.getElementById('doc1-watch-url').value = docs[0][5];
        }
        if (docs[1]) {
            document.getElementById('doc2-title').value = docs[1][1].trim();
            document.getElementById('doc2-meta').value = docs[1][2].trim();
            document.getElementById('doc2-role').value = docs[1][3].trim();
            document.getElementById('doc2-description').value = docs[1][4].trim();
            if (docs[1][5] !== '#') document.getElementById('doc2-watch-url').value = docs[1][5];
        }

        statusDiv.textContent = 'Content loaded successfully!';
        statusDiv.className = 'status-message success';
        setTimeout(() => statusDiv.className = 'status-message', 3000);
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status-message error';
    }
}

async function saveContent() {
    const statusDiv = document.getElementById('content-status');
    const saveBtn = document.getElementById('save-content-btn');

    saveBtn.disabled = true;
    statusDiv.textContent = 'Saving changes...';
    statusDiv.className = 'status-message info';

    try {
        const mainHTML = await getFile('main.html');
        let updatedHTML = mainHTML.content;

        // General Settings
        const tagline = document.getElementById('site-tagline').value.trim();
        updatedHTML = updatedHTML.replace(/<div class="masthead-subtitle">.*?<\/div>/, `<div class="masthead-subtitle">${tagline}</div>`);

        const aboutText = document.getElementById('about-text').value.trim();
        updatedHTML = updatedHTML.replace(/<p class="drop-cap">[\s\S]*?<\/p>/, `<p class="drop-cap">${aboutText}</p>`);

        const archiveGuideUrl = document.getElementById('archive-food-guide-url').value.trim();
        if (archiveGuideUrl) {
            updatedHTML = updatedHTML.replace(/(class="reading-link archive-link"[^>]*href=")[^"]+/, `$1${archiveGuideUrl}`);
        }

        const whatsReadingUrl = document.getElementById('whats-reading-url').value.trim();
        if (whatsReadingUrl) {
            updatedHTML = updatedHTML.replace(/(id="readingLink"[^>]*href=")[^"#]+/, `$1${whatsReadingUrl}`);
        }

        // Contact Information
        const academicEmail = document.getElementById('academic-email').value.trim();
        if (academicEmail) {
            updatedHTML = updatedHTML.replace(/(Academic Inquiries[\s\S]*?<a href="mailto:)([^"]+)(">)([^<]+)(<\/a>)/, `$1${academicEmail}$3${academicEmail}$5`);
        }

        const institution = document.getElementById('institution-name').value.trim();
        const department = document.getElementById('department-name').value.trim();
        if (institution && department) {
            updatedHTML = updatedHTML.replace(/(<strong>Institution:<\/strong><br>\s*)(.*?)(<br>\s*)(.*?)(\s*<\/p>)/, `$1${institution}$3${department}$5`);
        }

        const mediaEmail = document.getElementById('media-email').value.trim();
        if (mediaEmail) {
            updatedHTML = updatedHTML.replace(/(Media & Speaking[\s\S]*?<a href="mailto:)([^"]+)(">)([^<]+)(<\/a>)/, `$1${mediaEmail}$3${mediaEmail}$5`);
        }

        const blueskyUrl = document.getElementById('bluesky-url').value.trim();
        if (blueskyUrl) {
            updatedHTML = updatedHTML.replace(/(href=")[^"]+("[\s\S]{0,50}?class="social-link-block">Bluesky)/, `$1${blueskyUrl}$2`);
        }

        const knowledgeCommonsUrl = document.getElementById('knowledge-commons-url').value.trim();
        if (knowledgeCommonsUrl) {
            updatedHTML = updatedHTML.replace(/(href=")[^"]+("[\s\S]{0,50}?class="social-link-block">Knowledge Commons)/, `$1${knowledgeCommonsUrl}$2`);
        }

        const orcidUrl = document.getElementById('orcid-url').value.trim();
        if (orcidUrl) {
            updatedHTML = updatedHTML.replace(/(href=")[^"]+("[\s\S]{0,50}?class="social-link-block">ORCID)/, `$1${orcidUrl}$2`);
        }

        const linkedinUrl = document.getElementById('linkedin-url').value.trim();
        if (linkedinUrl) {
            updatedHTML = updatedHTML.replace(/(href=")[^"]+("[\s\S]{0,50}?class="social-link-block">LinkedIn)/, `$1${linkedinUrl}$2`);
        }

        // Newsletter
        const substackUsername = document.getElementById('substack-username').value.trim();
        if (substackUsername) {
            updatedHTML = updatedHTML.replace(/src="https:\/\/[^.]+\.substack\.com\/embed"/, `src="https://${substackUsername}.substack.com/embed"`);
        }

        // Podcasts
        const podcast1Title = document.getElementById('podcast1-title').value.trim();
        const podcast1Meta = document.getElementById('podcast1-meta').value.trim();
        const podcast1Embed = document.getElementById('podcast1-embed').value.trim();
        const podcast1Desc = document.getElementById('podcast1-description').value.trim();

        if (podcast1Title && podcast1Embed) {
            const podcast1Pattern = /(<div class="podcast-embed">\s*<h4 class="podcast-title">).*?(<\/h4>\s*<p class="podcast-meta">).*?(<\/p>\s*<iframe[^>]*src=")([^"]+)("[\s\S]*?<p class="podcast-description">).*?(<\/p>)/;
            updatedHTML = updatedHTML.replace(podcast1Pattern, `$1${podcast1Title}$2${podcast1Meta}$3${podcast1Embed}$5${podcast1Desc}$6`);
        }

        const podcast2Title = document.getElementById('podcast2-title').value.trim();
        const podcast2Meta = document.getElementById('podcast2-meta').value.trim();
        const podcast2Embed = document.getElementById('podcast2-embed').value.trim();
        const podcast2Desc = document.getElementById('podcast2-description').value.trim();

        if (podcast2Title && podcast2Embed) {
            const podcasts = updatedHTML.match(/<div class="podcast-embed">/g);
            if (podcasts && podcasts.length >= 2) {
                const parts = updatedHTML.split(/<div class="podcast-embed">/);
                const podcast2Pattern = /(\s*<h4 class="podcast-title">).*?(<\/h4>\s*<p class="podcast-meta">).*?(<\/p>\s*<iframe[^>]*src=")([^"]+)("[\s\S]*?<p class="podcast-description">).*?(<\/p>)/;
                parts[2] = parts[2].replace(podcast2Pattern, `$1${podcast2Title}$2${podcast2Meta}$3${podcast2Embed}$5${podcast2Desc}$6`);
                updatedHTML = parts.join('<div class="podcast-embed">');
            }
        }

        // Documentaries
        const doc1Title = document.getElementById('doc1-title').value.trim();
        const doc1Meta = document.getElementById('doc1-meta').value.trim();
        const doc1Role = document.getElementById('doc1-role').value.trim();
        const doc1Desc = document.getElementById('doc1-description').value.trim();
        const doc1WatchUrl = document.getElementById('doc1-watch-url').value.trim();

        if (doc1Title) {
            const doc1Pattern = /(<div class="media-item">[\s\S]*?<h3 class="media-title">).*?(<\/h3>\s*<p class="media-meta">).*?(<\/p>\s*<p class="media-role">Role: ).*?(<\/p>\s*<p class="media-description">).*?(<\/p>\s*<a href=")([^"]+)/;
            updatedHTML = updatedHTML.replace(doc1Pattern, `$1${doc1Title}$2${doc1Meta}$3${doc1Role}$4${doc1Desc}$5${doc1WatchUrl || '#'}`);
        }

        const doc2Title = document.getElementById('doc2-title').value.trim();
        const doc2Meta = document.getElementById('doc2-meta').value.trim();
        const doc2Role = document.getElementById('doc2-role').value.trim();
        const doc2Desc = document.getElementById('doc2-description').value.trim();
        const doc2WatchUrl = document.getElementById('doc2-watch-url').value.trim();

        if (doc2Title) {
            const mediaDivs = updatedHTML.match(/<div class="media-item">/g);
            if (mediaDivs && mediaDivs.length >= 2) {
                const parts = updatedHTML.split(/<div class="media-item">/);
                const doc2Pattern = /([\s\S]*?<h3 class="media-title">).*?(<\/h3>\s*<p class="media-meta">).*?(<\/p>\s*<p class="media-role">Role: ).*?(<\/p>\s*<p class="media-description">).*?(<\/p>\s*<a href=")([^"]+)/;
                parts[2] = parts[2].replace(doc2Pattern, `$1${doc2Title}$2${doc2Meta}$3${doc2Role}$4${doc2Desc}$5${doc2WatchUrl || '#'}`);
                updatedHTML = parts.join('<div class="media-item">');
            }
        }

        // Commit changes
        await updateFile('main.html', updatedHTML, 'Update site content via admin panel');

        statusDiv.textContent = 'Changes saved successfully!';
        statusDiv.className = 'status-message success';
    } catch (error) {
        statusDiv.textContent = `Error saving: ${error.message}`;
        statusDiv.className = 'status-message error';
    } finally {
        saveBtn.disabled = false;
    }
}

function updateMarkdownPreview() {
    const text = document.getElementById('about-text').value;
    const preview = document.getElementById('markdown-preview');

    // Simple markdown rendering (bold, italic, links)
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');

    preview.innerHTML = html || '<p class="help-text">Type in the About section to see preview</p>';
}

// ============================================
// IMAGE UPLOAD
// ============================================

function handleFileDrop(e) {
    e.preventDefault();
    document.getElementById('dropzone').classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadImage(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        uploadImage(files[0]);
    }
}

async function uploadImage(file) {
    const statusDiv = document.getElementById('upload-status');

    // Validate file
    if (!file.type.startsWith('image/')) {
        statusDiv.textContent = 'Please select an image file';
        statusDiv.className = 'status-message error';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        statusDiv.textContent = 'Image must be under 2MB';
        statusDiv.className = 'status-message error';
        return;
    }

    statusDiv.textContent = 'Uploading image...';
    statusDiv.className = 'status-message info';

    try {
        // Read file as base64
        const base64 = await readFileAsBase64(file);
        const fileName = `upload-${Date.now()}-${file.name}`;
        const path = `images/${fileName}`;

        // Upload to GitHub
        await createFile(path, base64, `Upload image: ${fileName}`);

        statusDiv.textContent = 'Image uploaded successfully!';
        statusDiv.className = 'status-message success';

        // Reload images list
        await loadRecentImages();
    } catch (error) {
        statusDiv.textContent = `Upload failed: ${error.message}`;
        statusDiv.className = 'status-message error';
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleQuickUpload(e, targetPath) {
    const file = e.target.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('quick-upload-status');

    // Validate file
    if (!file.type.startsWith('image/')) {
        statusDiv.textContent = 'Please select an image file';
        statusDiv.className = 'status-message error';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        statusDiv.textContent = 'Image must be under 2MB';
        statusDiv.className = 'status-message error';
        return;
    }

    statusDiv.textContent = `Uploading to ${targetPath}...`;
    statusDiv.className = 'status-message info';

    try {
        // Read file as base64
        const base64 = await readFileAsBase64(file);

        // Check if file exists and get SHA if it does
        let sha = null;
        try {
            const existingFile = await githubAPI(`/repos/${AdminApp.repo}/contents/${targetPath}?ref=${AdminApp.branch}`);
            sha = existingFile.sha;
        } catch (e) {
            // File doesn't exist, that's fine
        }

        // Upload or update file
        const body = {
            message: `Update ${targetPath} via admin panel`,
            content: base64,
            branch: AdminApp.branch
        };
        if (sha) body.sha = sha;

        await githubAPI(`/repos/${AdminApp.repo}/contents/${targetPath}`, 'PUT', body);

        statusDiv.textContent = `Successfully uploaded to ${targetPath}!`;
        statusDiv.className = 'status-message success';

        // Reload images list
        await loadRecentImages();

        // Reset the input
        e.target.value = '';
    } catch (error) {
        statusDiv.textContent = `Upload failed: ${error.message}`;
        statusDiv.className = 'status-message error';
    }
}

async function loadRecentImages() {
    const container = document.getElementById('recent-images');

    try {
        const images = await listDirectory('images');
        const imageFiles = images.filter(f => f.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name));

        if (imageFiles.length === 0) {
            container.innerHTML = '<p class="help-text">No images uploaded yet</p>';
            return;
        }

        container.innerHTML = '';

        imageFiles.slice(0, 12).forEach(img => {
            const div = document.createElement('div');
            div.className = 'image-item';

            const imageUrl = `https://raw.githubusercontent.com/${AdminApp.repo}/${AdminApp.branch}/images/${img.name}`;

            div.innerHTML = `
                <img src="${imageUrl}" alt="${img.name}" loading="lazy">
                <div class="image-info">
                    <strong>${img.name}</strong>
                    <small>${Math.round(img.size / 1024)}KB</small>
                    <button class="btn btn-secondary copy-url-btn" data-url="images/${img.name}">Copy URL</button>
                </div>
            `;

            container.appendChild(div);
        });

        // Add copy listeners
        document.querySelectorAll('.copy-url-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.url);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy URL', 2000);
            });
        });
    } catch (error) {
        container.innerHTML = `<p class="error-message">Failed to load images: ${error.message}</p>`;
    }
}

// ============================================
// TIMELINE MANAGER
// ============================================

async function loadTimelineProjects() {
    const container = document.getElementById('projects-list');
    const statusDiv = document.getElementById('timeline-status');

    container.innerHTML = '<p class="loading">Loading timeline projects...</p>';

    try {
        const projectsFile = await getFile('projects.js');

        // Parse the projects array from JavaScript file
        const projectsMatch = projectsFile.content.match(/const timelineData = \[([\s\S]*?)\];/);

        if (!projectsMatch) {
            throw new Error('Could not find timelineData in projects.js');
        }

        // Safely evaluate the array
        const projectsStr = '[' + projectsMatch[1] + ']';
        AdminApp.currentProjects = eval(projectsStr);

        // Render projects
        container.innerHTML = '';

        if (AdminApp.currentProjects.length === 0) {
            container.innerHTML = '<p class="help-text">No projects yet. Click "Add New Project" to get started.</p>';
            return;
        }

        AdminApp.currentProjects.forEach((project, index) => {
            const card = createProjectCard(project, index);
            container.appendChild(card);
        });

        statusDiv.textContent = 'Timeline loaded successfully!';
        statusDiv.className = 'status-message success';
        setTimeout(() => statusDiv.className = 'status-message', 3000);
    } catch (error) {
        container.innerHTML = `<p class="error-message">Failed to load timeline: ${error.message}</p>`;
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.index = index;

    card.innerHTML = `
        <div class="project-header">
            <div>
                <div class="project-meta">
                    <span class="project-badge badge-${project.type}">${formatType(project.type)}</span>
                    <span class="project-date">${project.date}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                ${project.venue ? `<p class="project-venue">${project.venue}</p>` : ''}
            </div>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-actions">
            <button class="btn btn-secondary edit-project-btn" data-index="${index}">Edit</button>
            <button class="btn btn-danger delete-project-btn" data-index="${index}">Delete</button>
        </div>
    `;

    // Add event listeners
    card.querySelector('.edit-project-btn').addEventListener('click', () => openProjectModal(index));
    card.querySelector('.delete-project-btn').addEventListener('click', () => deleteProject(index));

    return card;
}

function formatType(type) {
    const labels = {
        'book': 'Publication',
        'exhibition': 'Exhibition',
        'fellowship': 'Fellowship',
        'education': 'Education',
        'teaching': 'Teaching',
        'media': 'Media',
        'talk': 'Talk'
    };
    return labels[type] || type;
}

function openProjectModal(index = null) {
    const modal = document.getElementById('project-modal');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('project-form');
    const title = document.getElementById('modal-title');

    form.reset();

    if (index !== null) {
        // Edit mode
        title.textContent = 'Edit Project';
        const project = AdminApp.currentProjects[index];

        document.getElementById('project-index').value = index;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-type').value = project.type;
        document.getElementById('project-scope').value = project.scope;
        document.getElementById('project-date').value = project.date;
        document.getElementById('project-sortdate').value = project.sortDate;
        document.getElementById('project-venue').value = project.venue || '';
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-link').value = project.link || '';
    } else {
        // Add mode
        title.textContent = 'Add New Project';
        document.getElementById('project-index').value = '';
    }

    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('project-modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
}

async function handleProjectSubmit(e) {
    e.preventDefault();

    const statusDiv = document.getElementById('timeline-status');
    const index = document.getElementById('project-index').value;

    // Get form data
    const newProject = {
        id: `project-${Date.now()}`,
        title: document.getElementById('project-title').value.trim(),
        type: document.getElementById('project-type').value,
        date: document.getElementById('project-date').value.trim(),
        sortDate: document.getElementById('project-sortdate').value,
        scope: document.getElementById('project-scope').value,
        description: document.getElementById('project-description').value.trim(),
        link: document.getElementById('project-link').value.trim() || null,
        venue: document.getElementById('project-venue').value.trim() || null
    };

    // Update or add project
    if (index !== '') {
        AdminApp.currentProjects[parseInt(index)] = newProject;
    } else {
        AdminApp.currentProjects.push(newProject);
    }

    // Save to GitHub
    statusDiv.textContent = 'Saving project...';
    statusDiv.className = 'status-message info';

    try {
        const updatedJS = generateProjectsJS(AdminApp.currentProjects);
        await updateFile('projects.js', updatedJS, `${index !== '' ? 'Update' : 'Add'} project: ${newProject.title}`);

        closeProjectModal();
        await loadTimelineProjects();

        statusDiv.textContent = 'Project saved successfully!';
        statusDiv.className = 'status-message success';
    } catch (error) {
        statusDiv.textContent = `Error saving project: ${error.message}`;
        statusDiv.className = 'status-message error';
    }
}

async function deleteProject(index) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    const statusDiv = document.getElementById('timeline-status');
    const project = AdminApp.currentProjects[index];

    AdminApp.currentProjects.splice(index, 1);

    statusDiv.textContent = 'Deleting project...';
    statusDiv.className = 'status-message info';

    try {
        const updatedJS = generateProjectsJS(AdminApp.currentProjects);
        await updateFile('projects.js', updatedJS, `Delete project: ${project.title}`);

        await loadTimelineProjects();

        statusDiv.textContent = 'Project deleted successfully!';
        statusDiv.className = 'status-message success';
    } catch (error) {
        statusDiv.textContent = `Error deleting project: ${error.message}`;
        statusDiv.className = 'status-message error';
    }
}

function generateProjectsJS(projects) {
    // Generate the JavaScript file content with proper formatting
    let js = `/**
 * Career Timeline Data for Dr. Maurice Casey
 *
 * DATA STRUCTURE:
 * Each project object contains:
 * - id: Unique identifier (string)
 * - title: Project/achievement title (string)
 * - type: Category - 'book', 'exhibition', 'fellowship', 'teaching', 'media', 'talk' (string)
 * - date: Display date (string) - e.g., "2024", "2018-2019", "June 2025"
 * - sortDate: Date for sorting in YYYY-MM-DD format (string)
 * - scope: Audience/reach - 'academic', 'public', 'international', 'national' (string)
 * - description: 1-2 sentence summary (string)
 * - link: Optional URL for more details (string or null)
 * - venue: Optional location/institution (string or null)
 *
 * TO ADD A NEW ITEM:
 * Copy an existing object, update the fields, and add it to the array.
 * Make sure sortDate is in YYYY-MM-DD format for proper chronological ordering.
 */

const timelineData = [\n`;

    projects.forEach((project, index) => {
        js += `    {\n`;
        js += `        id: '${project.id}',\n`;
        js += `        title: '${project.title.replace(/'/g, "\\'")}',\n`;
        js += `        type: '${project.type}',\n`;
        js += `        date: '${project.date}',\n`;
        js += `        sortDate: '${project.sortDate}',\n`;
        js += `        scope: '${project.scope}',\n`;
        js += `        description: '${project.description.replace(/'/g, "\\'")}',\n`;
        js += `        link: ${project.link ? `'${project.link}'` : 'null'},\n`;
        js += `        venue: ${project.venue ? `'${project.venue.replace(/'/g, "\\'")}'` : 'null'}\n`;
        js += `    }${index < projects.length - 1 ? ',' : ''}\n`;
    });

    js += `];\n\n`;
    js += `// Export for use in timeline.js\n`;
    js += `if (typeof module !== 'undefined' && module.exports) {\n`;
    js += `    module.exports = timelineData;\n`;
    js += `}\n`;

    return js;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Fetch file from GitHub (wrapper for new admin extensions)
 * @param {string} path - File path relative to repo root
 * @returns {Promise<{content: string, sha: string}>}
 */
async function fetchFileFromGitHub(path) {
    const data = await githubAPI(`/repos/${AdminApp.repo}/contents/${path}?ref=${AdminApp.branch}`);
    return {
        content: data.content, // Base64 encoded
        sha: data.sha
    };
}

/**
 * Update file on GitHub (wrapper for new admin extensions)
 * @param {string} path - File path relative to repo root
 * @param {string} content - New file content (plain text)
 * @param {string} sha - Current file SHA
 * @param {string} message - Commit message
 * @returns {Promise<object>}
 */
async function updateFileOnGitHub(path, content, sha, message) {
    const response = await githubAPI(`/repos/${AdminApp.repo}/contents/${path}`, 'PUT', {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: sha,
        branch: AdminApp.branch
    });

    // Update cache
    AdminApp.fileCache[path] = {
        content,
        sha: response.content.sha
    };

    return response;
}

/**
 * Show notification message to user
 * @param {string} message - Notification text
 * @param {string} type - Notification type: 'success', 'error', or 'info'
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('global-notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'global-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Set color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.opacity = '1';
    notification.textContent = message;
    notification.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
