/**
 * Admin Panel - Events Manager
 * Manages events.js via GitHub API
 */

// ============================================
// EVENTS MANAGER
// ============================================

/**
 * Initialize events management tab
 */
function initEventsManager() {
    const container = document.getElementById('events-manager');
    if (!container) {
        console.error('Events manager container not found');
        return;
    }

    // Check if already initialized
    if (container.dataset.initialized === 'true') {
        console.log('Events manager already initialized');
        return;
    }

    console.log('Initializing events manager...');

    container.innerHTML = `
        <div class="section-header">
            <h2>Events Manager</h2>
            <button id="add-event-btn" class="btn btn-primary">
                <span>+ Add New Event</span>
            </button>
        </div>

        <div class="events-list" id="events-list">
            <p class="loading-message">Loading events...</p>
        </div>

        <!-- Event Modal -->
        <div id="event-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="event-modal-title">Add New Event</h3>
                    <button class="modal-close" id="event-modal-close">&times;</button>
                </div>
                <form id="event-form">
                    <input type="hidden" id="event-id">

                    <div class="form-group">
                        <label for="event-title">Event Title *</label>
                        <input type="text" id="event-title" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="event-date">Date (YYYY-MM-DD) *</label>
                            <input type="date" id="event-date" required>
                        </div>
                        <div class="form-group">
                            <label for="event-time">Time (HH:MM) *</label>
                            <input type="time" id="event-time" required>
                        </div>
                        <div class="form-group">
                            <label for="event-timezone">Timezone *</label>
                            <input type="text" id="event-timezone" placeholder="EST" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="event-location">Location / Venue *</label>
                        <input type="text" id="event-location" placeholder="e.g., Online, Sidney Sussex College, etc." required>
                    </div>

                    <div class="form-group">
                        <label for="event-badge">Badge</label>
                        <select id="event-badge">
                            <option value="Online">Online</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="In-Person">In-Person</option>
                            <option value="">None</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="event-description">Description *</label>
                        <textarea id="event-description" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="event-link">Registration / Info Link</label>
                        <input type="url" id="event-link" placeholder="https://...">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-event-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Event</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mark as initialized
    container.dataset.initialized = 'true';

    // Attach event listeners
    const addBtn = document.getElementById('add-event-btn');
    const eventForm = document.getElementById('event-form');
    const cancelBtn = document.getElementById('cancel-event-btn');
    const closeBtn = document.getElementById('event-modal-close');

    if (addBtn) addBtn.addEventListener('click', () => openEventModal());
    if (eventForm) eventForm.addEventListener('submit', handleEventSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEventModal);
    if (closeBtn) closeBtn.addEventListener('click', closeEventModal);

    console.log('Events manager initialized, loading data...');

    // Load events
    loadEvents();
}

/**
 * Load events from GitHub
 */
async function loadEvents() {
    try {
        const data = await fetchFileFromGitHub('events.js');
        const eventsData = parseEventsFile(data.content);

        AdminApp.fileCache['events.js'] = {
            sha: data.sha,
            content: eventsData
        };

        renderEventsList(eventsData);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('events-list').innerHTML = `
            <p class="error-message">Error loading events. ${error.message}</p>
        `;
    }
}

/**
 * Parse events.js file content
 * Uses safe evaluation since events.js contains a JavaScript array literal, not JSON
 */
function parseEventsFile(base64Content) {
    const decoded = atob(base64Content);
    // Extract the events array from the file
    const match = decoded.match(/const\s+events\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
        try {
            // Extract the array literal
            const arrayLiteral = match[1];

            // Use Function constructor to safely evaluate the array literal
            const evalFunc = new Function('return ' + arrayLiteral);
            return evalFunc();
        } catch (parseError) {
            console.error('Failed to parse array literal:', parseError);
            throw new Error('Invalid JavaScript array in events.js');
        }
    }
    return [];
}

/**
 * Render events list
 */
function renderEventsList(eventsData) {
    const container = document.getElementById('events-list');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Separate upcoming and past
    const upcoming = eventsData.filter(e => new Date(e.date) >= now);
    const past = eventsData.filter(e => new Date(e.date) < now);

    // Sort
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';

    if (upcoming.length > 0) {
        html += '<h3 class="events-section-title">Upcoming Events</h3>';
        upcoming.forEach((event, index) => {
            html += renderEventRow(event, index, false);
        });
    }

    if (past.length > 0) {
        html += '<h3 class="events-section-title">Past Events</h3>';
        past.forEach((event, index) => {
            html += renderEventRow(event, index + upcoming.length, true);
        });
    }

    if (eventsData.length === 0) {
        html = '<p class="empty-message">No events yet. Click "Add New Event" to create one.</p>';
    }

    container.innerHTML = html;

    // Attach row event listeners
    eventsData.forEach((event, index) => {
        const editBtn = document.getElementById(`edit-event-${index}`);
        const deleteBtn = document.getElementById(`delete-event-${index}`);

        if (editBtn) editBtn.addEventListener('click', () => openEventModal(event, index));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteEvent(index));
    });
}

/**
 * Render a single event row
 */
function renderEventRow(event, index, isPast) {
    return `
        <div class="event-row ${isPast ? 'past' : ''}">
            <div class="event-info">
                <h4>${event.title}</h4>
                <p class="event-meta">
                    ${new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    • ${event.time} ${event.timezone}
                    ${event.badge ? ` • <span class="badge">${event.badge}</span>` : ''}
                </p>
                <p class="event-location">${event.location}</p>
            </div>
            <div class="event-actions">
                <button class="btn btn-sm btn-secondary" id="edit-event-${index}">Edit</button>
                <button class="btn btn-sm btn-danger" id="delete-event-${index}">Delete</button>
            </div>
        </div>
    `;
}

/**
 * Open event modal (for add or edit)
 */
function openEventModal(event = null, index = null) {
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('event-modal-title');
    const form = document.getElementById('event-form');

    if (event) {
        // Edit mode
        title.textContent = 'Edit Event';
        document.getElementById('event-id').value = index;
        document.getElementById('event-title').value = event.title || '';
        document.getElementById('event-date').value = event.date || '';
        document.getElementById('event-time').value = event.time || '';
        document.getElementById('event-timezone').value = event.timezone || '';
        document.getElementById('event-location').value = event.location || '';
        document.getElementById('event-badge').value = event.badge || '';
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-link').value = event.link || '';
    } else {
        // Add mode
        title.textContent = 'Add New Event';
        form.reset();
        document.getElementById('event-id').value = '';
    }

    modal.style.display = 'flex';
}

/**
 * Close event modal
 */
function closeEventModal() {
    document.getElementById('event-modal').style.display = 'none';
    document.getElementById('event-form').reset();
}

/**
 * Handle event form submission
 */
async function handleEventSubmit(e) {
    e.preventDefault();

    const index = document.getElementById('event-id').value;
    const eventData = {
        id: document.getElementById('event-title').value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: document.getElementById('event-title').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        timezone: document.getElementById('event-timezone').value,
        location: document.getElementById('event-location').value,
        badge: document.getElementById('event-badge').value,
        description: document.getElementById('event-description').value,
        link: document.getElementById('event-link').value || null
    };

    try {
        const events = AdminApp.fileCache['events.js'].content;

        if (index !== '') {
            // Update existing
            events[parseInt(index)] = eventData;
        } else {
            // Add new
            events.push(eventData);
        }

        await saveEventsFile(events);
        closeEventModal();
        showNotification('Event saved successfully!');
        loadEvents();
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Error saving event: ' + error.message, 'error');
    }
}

/**
 * Delete an event
 */
async function deleteEvent(index) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const events = AdminApp.fileCache['events.js'].content;
        events.splice(index, 1);

        await saveEventsFile(events);
        showNotification('Event deleted successfully!');
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Error deleting event: ' + error.message, 'error');
    }
}

/**
 * Save events file to GitHub
 */
async function saveEventsFile(events) {
    const content = generateEventsFileContent(events);
    const sha = AdminApp.fileCache['events.js'].sha;

    await updateFileOnGitHub('events.js', content, sha, 'Update events');
}

/**
 * Generate events.js file content
 */
function generateEventsFileContent(events) {
    const header = `/**
 * Events Data
 * Stores upcoming and past events for the PUBLIC HISTORY section
 */

const events = `;

    const footer = `;

// Export for use in main site
if (typeof module !== 'undefined' && module.exports) {
    module.exports = events;
}
`;

    return header + JSON.stringify(events, null, 4) + footer;
}

// Export for use in main admin.js
if (typeof window !== 'undefined') {
    window.initEventsManager = initEventsManager;
}
