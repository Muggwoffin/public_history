/**
 * Admin Panel - Landing Images Manager
 * Manages landing-config.js and image uploads for daily rotation
 */

// ============================================
// LANDING IMAGES MANAGER
// ============================================

/**
 * Initialize landing images manager
 */
function initLandingImagesManager() {
    const container = document.getElementById('landing-images-manager');
    if (!container) {
        console.error('Landing images manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Landing images manager already initialized');
        return;
    }

    console.log('Initializing landing images manager...');

    container.innerHTML = `
        <h2>Landing Images & Daily Rotation</h2>
        <p class="section-description">
            Manage rotating images for different sections of your site. Images rotate daily so all visitors see the same image each day.
        </p>

        <div id="image-boxes-container">
            <p class="loading-message">Loading image configuration...</p>
        </div>

        <div class="form-actions">
            <button type="button" class="btn btn-primary" id="add-image-box-btn">+ Add New Image Box</button>
            <button type="button" class="btn btn-secondary" id="save-landing-config-btn">Save Configuration</button>
        </div>

        <!-- Image Box Modal -->
        <div id="image-box-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Image Box</h3>
                    <button class="modal-close" id="image-box-modal-close">&times;</button>
                </div>
                <form id="image-box-form">
                    <div class="form-group">
                        <label for="box-name">Box Name (e.g., "hero", "about") *</label>
                        <input type="text" id="box-name" required pattern="[a-z0-9\\-]+" placeholder="lowercase-with-dashes">
                        <small>Use lowercase letters, numbers, and dashes only</small>
                    </div>

                    <div class="form-group">
                        <label for="box-rotation">Rotation Frequency *</label>
                        <select id="box-rotation" required>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-image-box-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Box</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBoxBtn = document.getElementById('add-image-box-btn');
    const imageBoxForm = document.getElementById('image-box-form');
    const cancelBoxBtn = document.getElementById('cancel-image-box-btn');
    const closeBoxBtn = document.getElementById('image-box-modal-close');
    const saveConfigBtn = document.getElementById('save-landing-config-btn');

    if (addBoxBtn) addBoxBtn.addEventListener('click', openImageBoxModal);
    if (imageBoxForm) imageBoxForm.addEventListener('submit', handleImageBoxSubmit);
    if (cancelBoxBtn) cancelBoxBtn.addEventListener('click', closeImageBoxModal);
    if (closeBoxBtn) closeBoxBtn.addEventListener('click', closeImageBoxModal);
    if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveLandingConfig);

    console.log('Landing images manager initialized, loading data...');

    loadLandingConfig();
}

/**
 * Load landing config from GitHub
 */
async function loadLandingConfig() {
    try {
        const data = await fetchFileFromGitHub('landing-config.js');
        const configData = parseLandingConfigFile(data.content);

        AdminApp.fileCache['landing-config.js'] = {
            sha: data.sha,
            content: configData
        };

        renderImageBoxes(configData);
    } catch (error) {
        console.error('Error loading landing config:', error);
        document.getElementById('image-boxes-container').innerHTML = `
            <p class="error-message">Error loading configuration. ${error.message}</p>
        `;
    }
}

/**
 * Parse landing-config.js file
 * Uses safe evaluation since landing-config.js contains a JavaScript object literal, not JSON
 */
function parseLandingConfigFile(base64Content) {
    const decoded = atob(base64Content);
    const match = decoded.match(/const\s+landingConfig\s*=\s*({[\s\S]*?});/);
    if (match) {
        try {
            // Extract the object literal
            const objectLiteral = match[1];

            // Use Function constructor to safely evaluate the object literal
            const evalFunc = new Function('return ' + objectLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse object literal:', parseError);
            throw new Error('Invalid JavaScript object in landing-config.js');
        }
    }
    return {};
}

/**
 * Render image boxes
 */
function renderImageBoxes(config) {
    const container = document.getElementById('image-boxes-container');
    let html = '';

    Object.keys(config).forEach(boxName => {
        const box = config[boxName];
        html += `
            <div class="image-box-card" data-box="${boxName}">
                <div class="image-box-header">
                    <h3>${boxName}</h3>
                    <div class="image-box-meta">
                        <span class="badge">Rotates: ${box.rotation}</span>
                        <button class="btn btn-sm btn-danger" onclick="deleteImageBox('${boxName}')">Delete Box</button>
                    </div>
                </div>

                <div class="images-grid" id="images-${boxName}">
                    ${box.images.map((img, idx) => renderImageThumbnail(img, boxName, idx)).join('')}
                </div>

                <div class="image-box-actions">
                    <input type="file" id="upload-${boxName}" accept="image/*" multiple style="display: none;">
                    <button class="btn btn-secondary" onclick="document.getElementById('upload-${boxName}').click()">
                        + Add Images
                    </button>
                </div>
            </div>
        `;
    });

    if (Object.keys(config).length === 0) {
        html = '<p class="empty-message">No image boxes configured. Click "Add New Image Box" to create one.</p>';
    }

    container.innerHTML = html;

    // Attach file upload listeners
    Object.keys(config).forEach(boxName => {
        const input = document.getElementById(`upload-${boxName}`);
        if (input) {
            input.addEventListener('change', (e) => handleImageUpload(e, boxName));
        }
    });
}

/**
 * Render image thumbnail
 */
function renderImageThumbnail(imagePath, boxName, index) {
    return `
        <div class="image-thumbnail">
            <img src="/${imagePath}" alt="Image ${index + 1}">
            <button class="image-delete-btn" onclick="deleteImage('${boxName}', ${index})" title="Delete">
                ×
            </button>
        </div>
    `;
}

/**
 * Handle image upload
 */
async function handleImageUpload(event, boxName) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    try {
        showNotification(`Uploading ${files.length} image(s)...`);

        const config = AdminApp.fileCache['landing-config.js'].content;

        for (const file of files) {
            const fileName = `landing/${boxName}/${Date.now()}-${file.name}`;
            const imagePath = `images/${fileName}`;

            // Upload image file
            await uploadImageFile(file, imagePath);

            // Add to config
            if (!config[boxName].images) {
                config[boxName].images = [];
            }
            config[boxName].images.push(imagePath);
        }

        // Re-render
        renderImageBoxes(config);
        showNotification('Images uploaded successfully!');

        // Clear input
        event.target.value = '';
    } catch (error) {
        console.error('Error uploading images:', error);
        showNotification('Error uploading images: ' + error.message, 'error');
    }
}

/**
 * Upload image file to GitHub
 */
async function uploadImageFile(file, path) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const base64Content = reader.result.split(',')[1];

                const response = await fetch(
                    `${AdminApp.apiBase}/repos/${AdminApp.repoOwner}/${AdminApp.repoName}/contents/${path}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${AdminApp.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Upload image: ${path}`,
                            content: base64Content,
                            branch: AdminApp.branch
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
    });
}

/**
 * Delete an image
 */
function deleteImage(boxName, index) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const config = AdminApp.fileCache['landing-config.js'].content;
    config[boxName].images.splice(index, 1);

    renderImageBoxes(config);
    showNotification('Image removed. Click "Save Configuration" to persist changes.');
}

/**
 * Delete an image box
 */
function deleteImageBox(boxName) {
    if (!confirm(`Are you sure you want to delete the "${boxName}" image box and all its images?`)) return;

    const config = AdminApp.fileCache['landing-config.js'].content;
    delete config[boxName];

    renderImageBoxes(config);
    showNotification('Image box removed. Click "Save Configuration" to persist changes.');
}

/**
 * Open image box modal
 */
function openImageBoxModal() {
    document.getElementById('image-box-modal').style.display = 'flex';
    document.getElementById('image-box-form').reset();
}

/**
 * Close image box modal
 */
function closeImageBoxModal() {
    document.getElementById('image-box-modal').style.display = 'none';
}

/**
 * Handle image box form submission
 */
function handleImageBoxSubmit(e) {
    e.preventDefault();

    const boxName = document.getElementById('box-name').value;
    const rotation = document.getElementById('box-rotation').value;

    const config = AdminApp.fileCache['landing-config.js'].content;

    if (config[boxName]) {
        showNotification('A box with this name already exists!', 'error');
        return;
    }

    config[boxName] = {
        images: [],
        rotation: rotation
    };

    renderImageBoxes(config);
    closeImageBoxModal();
    showNotification('Image box added. Click "Save Configuration" to persist changes.');
}

/**
 * Save landing config to GitHub
 */
async function saveLandingConfig() {
    try {
        const config = AdminApp.fileCache['landing-config.js'].content;
        const content = generateLandingConfigFileContent(config);
        const sha = AdminApp.fileCache['landing-config.js'].sha;

        await updateFileOnGitHub('landing-config.js', content, sha, 'Update landing images configuration');
        showNotification('Landing configuration saved successfully!');

        // Reload to get new SHA
        await loadLandingConfig();
    } catch (error) {
        console.error('Error saving landing config:', error);
        showNotification('Error saving configuration: ' + error.message, 'error');
    }
}

/**
 * Generate landing-config.js file content
 */
function generateLandingConfigFileContent(config) {
    return `/**
 * Landing Images Configuration
 * Controls rotating images for various sections of the site
 */

const landingConfig = ${JSON.stringify(config, null, 4)};

// Export for use in carousel script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = landingConfig;
}
`;
}

// Export functions
if (typeof window !== 'undefined') {
    window.initLandingImagesManager = initLandingImagesManager;
    window.deleteImage = deleteImage;
    window.deleteImageBox = deleteImageBox;
}
