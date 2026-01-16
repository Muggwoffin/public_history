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
        <h2>Landing Page Image Boxes</h2>
        <p class="section-description">
            Manage images for the 6 landing page boxes. Upload multiple images per box - they will rotate daily so all visitors see the same image each day.
        </p>

        <div id="image-boxes-container" class="landing-boxes-grid">
            <p class="loading-message">Loading image boxes...</p>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

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

    if (!config || Object.keys(config).length === 0) {
        container.innerHTML = '<p class="empty-message">No landing page boxes configured.</p>';
        return;
    }

    let html = '';

    // Render boxes in a specific order matching the landing page layout
    const boxOrder = ['about', 'contact', 'books', 'public-history', 'newsletter', 'selected-writing'];

    boxOrder.forEach(boxName => {
        const box = config[boxName];
        if (!box) return; // Skip if box doesn't exist in config

        const label = box.label || boxName;
        const imageCount = box.images ? box.images.length : 0;

        html += `
            <div class="landing-box-card" data-box="${boxName}">
                <div class="box-header">
                    <h3>${label}</h3>
                    <span class="box-badge">${imageCount} image${imageCount !== 1 ? 's' : ''} • ${box.rotation} rotation</span>
                </div>

                <div class="box-images-grid" id="images-${boxName}">
                    ${box.images && box.images.length > 0
                        ? box.images.map((img, idx) => renderImageThumbnail(img, boxName, idx)).join('')
                        : '<p class="no-images">No images yet. Click "Upload Images" to add some.</p>'}
                </div>

                <div class="box-actions">
                    <input type="file" id="upload-${boxName}" accept="image/*" multiple style="display: none;">
                    <button class="btn btn-primary btn-sm" onclick="document.getElementById('upload-${boxName}').click()">
                        📤 Upload Images
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Attach file upload listeners
    boxOrder.forEach(boxName => {
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
        showNotification(`Uploading ${files.length} image(s)...`, 'info');

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

        // Save config to GitHub
        await saveLandingConfigToGitHub(config);

        // Re-render
        renderImageBoxes(config);
        showNotification('Images uploaded and saved successfully!');

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
async function deleteImage(boxName, index) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
        const config = AdminApp.fileCache['landing-config.js'].content;
        config[boxName].images.splice(index, 1);

        // Save to GitHub immediately
        await saveLandingConfigToGitHub(config);

        renderImageBoxes(config);
        showNotification('Image deleted successfully!');
    } catch (error) {
        console.error('Error deleting image:', error);
        showNotification('Error deleting image: ' + error.message, 'error');
    }
}

/**
 * Save landing config to GitHub
 */
async function saveLandingConfigToGitHub(config) {
    try {
        const content = generateLandingConfigFileContent(config);
        const sha = AdminApp.fileCache['landing-config.js'].sha;

        const result = await updateFileOnGitHub('landing-config.js', content, sha, 'Update landing images configuration');

        // Update cache with new SHA
        AdminApp.fileCache['landing-config.js'].sha = result.sha || sha;
    } catch (error) {
        console.error('Error saving landing config:', error);
        throw error; // Re-throw so caller can handle
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
}
