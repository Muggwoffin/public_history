/**
 * Landing Images Manager
 * Manages landing-config.js image rotations and uploads images to
 * images/landing/<box>/. All UI is DOM-built; filenames are sanitized
 * before being used as repository paths.
 */

const LandingImagesManager = (function () {
    'use strict';

    const BOX_ORDER = ['about', 'contact', 'books', 'public-history', 'newsletter', 'selected-writing'];

    let initialized = false;
    let config = null;
    let gridEl = null;

    function store() {
        return AdminApp.dataStore;
    }

    function init() {
        const container = document.getElementById('landing-images-manager');
        if (!container) {
            console.error('Landing images manager container not found');
            return;
        }
        if (initialized) return;
        initialized = true;

        const { el } = AdminDom;
        gridEl = el('div', {
            className: 'landing-boxes-grid',
            attrs: { id: 'image-boxes-container' }
        }, [el('p', { className: 'loading-message', text: 'Loading image boxes...' })]);

        AdminDom.clear(container);
        container.appendChild(el('h2', { text: 'Landing Page Image Boxes' }));
        container.appendChild(el('p', {
            className: 'section-description',
            text: 'Manage images for the 6 landing page boxes. Upload multiple images per box - '
                + 'they will rotate daily so all visitors see the same image each day.'
        }));
        container.appendChild(gridEl);

        load();
    }

    async function load() {
        try {
            config = await store().load('landingConfig');
            render();
        } catch (error) {
            console.error('Error loading landing config:', error);
            AdminDom.clear(gridEl);
            gridEl.appendChild(AdminDom.el('p', {
                className: 'error-message',
                text: `Error loading configuration: ${error.message}`
            }));
        }
    }

    function render() {
        const { el } = AdminDom;
        AdminDom.clear(gridEl);

        if (!config || Object.keys(config).length === 0) {
            gridEl.appendChild(el('p', {
                className: 'empty-message', text: 'No landing page boxes configured.'
            }));
            return;
        }

        BOX_ORDER.forEach(boxName => {
            const box = config[boxName];
            if (!box) return;
            gridEl.appendChild(renderBox(boxName, box));
        });
    }

    function renderBox(boxName, box) {
        const { el } = AdminDom;
        const images = box.images || [];

        const imagesGrid = el('div', { className: 'box-images-grid' });
        if (images.length === 0) {
            imagesGrid.appendChild(el('p', {
                className: 'no-images',
                text: 'No images yet. Click "Upload Images" to add some.'
            }));
        } else {
            images.forEach((imagePath, index) => {
                imagesGrid.appendChild(renderThumbnail(boxName, imagePath, index));
            });
        }

        const fileInput = el('input', {
            attrs: { type: 'file', accept: 'image/*', multiple: '' }
        });
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => handleUpload(e, boxName));

        const uploadBtn = el('button', {
            className: 'btn btn-primary btn-sm', text: '📤 Upload Images'
        });
        uploadBtn.addEventListener('click', () => fileInput.click());

        const card = el('div', { className: 'landing-box-card' }, [
            el('div', { className: 'box-header' }, [
                el('h3', { text: box.label || boxName }),
                el('span', {
                    className: 'box-badge',
                    text: `${images.length} image${images.length !== 1 ? 's' : ''} • ${box.rotation} rotation`
                })
            ]),
            imagesGrid,
            el('div', { className: 'box-actions' }, [fileInput, uploadBtn])
        ]);
        card.dataset.box = boxName;
        return card;
    }

    function renderThumbnail(boxName, imagePath, index) {
        const { el } = AdminDom;

        const deleteBtn = el('button', {
            className: 'image-delete-btn', text: '×', attrs: { title: 'Delete' }
        });
        deleteBtn.addEventListener('click', () => deleteImage(boxName, index));

        return el('div', { className: 'image-thumbnail' }, [
            el('img', {
                attrs: {
                    // Image lives in the same repo; resolve relative to admin/
                    src: '../' + imagePath,
                    alt: `Image ${index + 1}`,
                    loading: 'lazy'
                }
            }),
            deleteBtn
        ]);
    }

    /**
     * Restrict a client filename to safe path characters.
     */
    function sanitizeFilename(name) {
        const base = name.split(/[\\/]/).pop();
        return base.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^[.-]+/, '') || 'image';
    }

    async function handleUpload(event, boxName) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        try {
            AdminDom.showNotification(`Uploading ${files.length} image(s)...`, 'info');

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`"${file.name}" is not an image file`);
                }
                const imagePath = `images/landing/${boxName}/${Date.now()}-${sanitizeFilename(file.name)}`;
                const base64 = await readFileAsBase64(file);
                await AdminApp.client.putBase64(imagePath, base64, `Upload image: ${imagePath}`);

                if (!config[boxName].images) config[boxName].images = [];
                config[boxName].images.push(imagePath);
            }

            await store().save('landingConfig', config, 'Update landing images configuration');
            render();
            AdminDom.showNotification('Images uploaded and saved successfully!');
        } catch (error) {
            console.error('Error uploading images:', error);
            AdminDom.showNotification(`Error uploading images: ${error.message}`, 'error');
        } finally {
            event.target.value = '';
        }
    }

    async function deleteImage(boxName, index) {
        if (!AdminDom.confirmAction('Are you sure you want to delete this image?')) return;

        try {
            config[boxName].images.splice(index, 1);
            await store().save('landingConfig', config, 'Update landing images configuration');
            render();
            AdminDom.showNotification('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            AdminDom.showNotification(`Error deleting image: ${error.message}`, 'error');
            await load();
        }
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(file);
        });
    }

    return { init, sanitizeFilename, readFileAsBase64 };
})();
