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
    const content = atob(data.content);

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
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
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

        // Extract about text (between <p class="drop-cap"> tags)
        const aboutMatch = mainHTML.content.match(/<p class="drop-cap">([\s\S]*?)<\/p>/);
        if (aboutMatch) {
            document.getElementById('about-text').value = aboutMatch[1].trim();
            updateMarkdownPreview();
        }

        // Extract contact email (this is a placeholder - adjust based on your HTML structure)
        const emailMatch = mainHTML.content.match(/mailto:([^"]+)/);
        if (emailMatch) {
            document.getElementById('contact-email').value = emailMatch[1];
        }

        // Extract site tagline (from masthead-subtitle)
        const taglineMatch = mainHTML.content.match(/<div class="masthead-subtitle">(.*?)<\/div>/);
        if (taglineMatch) {
            document.getElementById('site-tagline').value = taglineMatch[1].trim();
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

        // Update about text
        const aboutText = document.getElementById('about-text').value.trim();
        updatedHTML = updatedHTML.replace(
            /<p class="drop-cap">[\s\S]*?<\/p>/,
            `<p class="drop-cap">${aboutText}</p>`
        );

        // Update tagline
        const tagline = document.getElementById('site-tagline').value.trim();
        updatedHTML = updatedHTML.replace(
            /<div class="masthead-subtitle">.*?<\/div>/,
            `<div class="masthead-subtitle">${tagline}</div>`
        );

        // Update contact email (if exists in format)
        const email = document.getElementById('contact-email').value.trim();
        if (email) {
            updatedHTML = updatedHTML.replace(
                /mailto:[^"]+/g,
                `mailto:${email}`
            );
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
        'book': 'Book',
        'exhibition': 'Exhibition',
        'fellowship': 'Fellowship',
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

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
