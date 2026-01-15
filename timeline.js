/**
 * Interactive Timeline Component
 * Renders and filters career timeline data
 */

class Timeline {
    constructor(data, containerId) {
        this.data = data;
        this.container = document.getElementById(containerId);
        this.currentFilter = 'all';

        if (!this.container) {
            console.error(`Timeline container with id "${containerId}" not found`);
            return;
        }

        this.init();
    }

    init() {
        // Sort data by date (most recent first)
        this.sortedData = [...this.data].sort((a, b) => {
            return new Date(b.sortDate) - new Date(a.sortDate);
        });

        this.render();
        this.attachEventListeners();
    }

    render() {
        // Clear container
        this.container.innerHTML = '';

        // Create filter controls
        const filterSection = this.createFilterControls();
        this.container.appendChild(filterSection);

        // Get filtered data
        const filteredData = this.getFilteredData();

        // Create timeline list
        const timelineList = document.createElement('div');
        timelineList.className = 'timeline-list';
        timelineList.setAttribute('role', 'list');

        if (filteredData.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'timeline-empty';
            emptyMessage.textContent = 'No items match the selected filter.';
            timelineList.appendChild(emptyMessage);
        } else {
            filteredData.forEach((item, index) => {
                const timelineItem = this.createTimelineItem(item, index);
                timelineList.appendChild(timelineItem);
            });
        }

        this.container.appendChild(timelineList);
    }

    createFilterControls() {
        const filterSection = document.createElement('div');
        filterSection.className = 'timeline-filters';
        filterSection.setAttribute('role', 'navigation');
        filterSection.setAttribute('aria-label', 'Timeline filters');

        const filterTitle = document.createElement('h3');
        filterTitle.className = 'timeline-filters-title';
        filterTitle.textContent = 'Filter by Type:';
        filterSection.appendChild(filterTitle);

        const filterButtons = document.createElement('div');
        filterButtons.className = 'timeline-filter-buttons';

        const filters = [
            { value: 'all', label: 'All' },
            { value: 'book', label: 'Books' },
            { value: 'exhibition', label: 'Exhibitions' },
            { value: 'fellowship', label: 'Fellowships & Awards' },
            { value: 'education', label: 'Education' },
            { value: 'teaching', label: 'Teaching' },
            { value: 'media', label: 'Media' },
            { value: 'talk', label: 'Talks' }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'timeline-filter-btn';
            button.dataset.filter = filter.value;
            button.textContent = filter.label;
            button.setAttribute('aria-pressed', this.currentFilter === filter.value);

            if (this.currentFilter === filter.value) {
                button.classList.add('active');
            }

            filterButtons.appendChild(button);
        });

        filterSection.appendChild(filterButtons);
        return filterSection;
    }

    createTimelineItem(item, index) {
        const timelineItem = document.createElement('article');
        timelineItem.className = 'timeline-item';
        timelineItem.dataset.type = item.type;
        timelineItem.setAttribute('role', 'listitem');

        // Add staggered animation delay
        timelineItem.style.animationDelay = `${index * 0.05}s`;

        // Timeline marker (dot)
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.setAttribute('aria-hidden', 'true');

        // Timeline content
        const content = document.createElement('div');
        content.className = 'timeline-content';

        // Header section
        const header = document.createElement('div');
        header.className = 'timeline-header';

        const date = document.createElement('time');
        date.className = 'timeline-date';
        date.dateTime = item.sortDate;
        date.textContent = item.date;

        const typeBadge = document.createElement('span');
        typeBadge.className = `timeline-badge timeline-badge-${item.type}`;
        typeBadge.textContent = this.formatType(item.type);

        const scopeBadge = document.createElement('span');
        scopeBadge.className = `timeline-scope timeline-scope-${item.scope}`;
        scopeBadge.textContent = this.formatScope(item.scope);

        header.appendChild(date);
        header.appendChild(typeBadge);
        header.appendChild(scopeBadge);

        // Title
        const title = document.createElement('h3');
        title.className = 'timeline-title';

        if (item.link) {
            const titleLink = document.createElement('a');
            titleLink.href = item.link;
            titleLink.textContent = item.title;
            titleLink.target = '_blank';
            titleLink.rel = 'noopener noreferrer';
            title.appendChild(titleLink);
        } else {
            title.textContent = item.title;
        }

        // Venue (if exists)
        let venue = null;
        if (item.venue) {
            venue = document.createElement('p');
            venue.className = 'timeline-venue';
            venue.textContent = item.venue;
        }

        // Description
        const description = document.createElement('p');
        description.className = 'timeline-description';
        description.textContent = item.description;

        // Assemble content
        content.appendChild(header);
        content.appendChild(title);
        if (venue) content.appendChild(venue);
        content.appendChild(description);

        // Assemble item
        timelineItem.appendChild(marker);
        timelineItem.appendChild(content);

        return timelineItem;
    }

    getFilteredData() {
        if (this.currentFilter === 'all') {
            return this.sortedData;
        }
        return this.sortedData.filter(item => item.type === this.currentFilter);
    }

    attachEventListeners() {
        // Filter button clicks
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('timeline-filter-btn')) {
                this.handleFilterClick(e.target);
            }
        });

        // Keyboard navigation for filter buttons
        const filterButtons = this.container.querySelectorAll('.timeline-filter-btn');
        filterButtons.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' && filterButtons[index + 1]) {
                    filterButtons[index + 1].focus();
                } else if (e.key === 'ArrowLeft' && filterButtons[index - 1]) {
                    filterButtons[index - 1].focus();
                }
            });
        });
    }

    handleFilterClick(button) {
        const filterValue = button.dataset.filter;

        if (filterValue === this.currentFilter) {
            return; // Already active
        }

        // Update active state
        const allButtons = this.container.querySelectorAll('.timeline-filter-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        // Update filter
        this.currentFilter = filterValue;

        // Re-render timeline
        this.render();

        // Announce to screen readers
        this.announceFilterChange(filterValue);
    }

    announceFilterChange(filterValue) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';

        const count = this.getFilteredData().length;
        const filterLabel = filterValue === 'all' ? 'all items' : `${this.formatType(filterValue)} items`;
        announcement.textContent = `Showing ${count} ${filterLabel}`;

        this.container.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => announcement.remove(), 1000);
    }

    formatType(type) {
        const typeLabels = {
            'book': 'Book',
            'exhibition': 'Exhibition',
            'fellowship': 'Fellowship',
            'education': 'Education',
            'teaching': 'Teaching',
            'media': 'Media',
            'talk': 'Talk'
        };
        return typeLabels[type] || type;
    }

    formatScope(scope) {
        const scopeLabels = {
            'academic': 'Academic',
            'public': 'Public',
            'international': 'International',
            'national': 'National'
        };
        return scopeLabels[scope] || scope;
    }
}

// Initialize timeline when DOM is ready (or immediately if already loaded)
function initTimeline() {
    if (typeof timelineData !== 'undefined') {
        new Timeline(timelineData, 'timeline-container');
    } else {
        console.error('Timeline data not found. Make sure projects.js is loaded before timeline.js');
    }
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeline);
} else {
    // DOM already loaded, initialize immediately
    initTimeline();
}
