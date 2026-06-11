/**
 * Interactive Timeline Component
 * Renders and filters career timeline data (global `timelineData` from
 * projects.js). Filtering toggles visibility rather than re-rendering.
 */

(function () {
    'use strict';

    const { el, registerRenderer } = SiteCore;

    const TYPE_LABELS = {
        book: 'Publication',
        exhibition: 'Exhibition',
        fellowship: 'Fellowship',
        education: 'Education',
        teaching: 'Teaching',
        media: 'Media',
        talk: 'Talk'
    };

    const SCOPE_LABELS = {
        academic: 'Academic',
        public: 'Public',
        international: 'International',
        national: 'National'
    };

    const FILTERS = [
        { value: 'all', label: 'All' },
        { value: 'book', label: 'Publications' },
        { value: 'exhibition', label: 'Exhibitions' },
        { value: 'fellowship', label: 'Fellowships & Awards' },
        { value: 'education', label: 'Education' },
        { value: 'teaching', label: 'Teaching' },
        { value: 'media', label: 'Media' },
        { value: 'talk', label: 'Talks' }
    ];

    class Timeline {
        constructor(data, containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`Timeline container with id "${containerId}" not found`);
                return;
            }
            this.currentFilter = 'all';
            this.sortedData = [...data].sort(
                (a, b) => new Date(b.sortDate) - new Date(a.sortDate)
            );
            this.render();
            this.attachEventListeners();
        }

        render() {
            this.container.textContent = '';

            const filterSection = this.createFilterControls();
            this.container.appendChild(filterSection);
            this.filterButtons = filterSection.querySelectorAll('.timeline-filter-btn');

            this.timelineList = el('div', {
                className: 'timeline-list',
                attrs: { role: 'list' }
            });
            this.sortedData.forEach((item, index) => {
                this.timelineList.appendChild(this.createTimelineItem(item, index));
            });
            this.container.appendChild(this.timelineList);

            this.timelineItems = this.timelineList.querySelectorAll('.timeline-item');
            this.applyFilter();
        }

        createFilterControls() {
            const buttons = el('div', { className: 'timeline-filter-buttons' });
            FILTERS.forEach(filter => {
                const button = el('button', {
                    className: 'timeline-filter-btn',
                    text: filter.label,
                    attrs: { 'aria-pressed': String(this.currentFilter === filter.value) }
                });
                button.dataset.filter = filter.value;
                if (this.currentFilter === filter.value) button.classList.add('active');
                buttons.appendChild(button);
            });

            return el('div', {
                className: 'timeline-filters',
                attrs: { role: 'navigation', 'aria-label': 'Timeline filters' }
            }, [
                el('h3', { className: 'timeline-filters-title', text: 'Filter by Type:' }),
                buttons
            ]);
        }

        createTimelineItem(item, index) {
            const date = el('time', { className: 'timeline-date', text: item.date });
            date.dateTime = item.sortDate;

            const header = el('div', { className: 'timeline-header' }, [
                date,
                el('span', {
                    className: `timeline-badge timeline-badge-${item.type}`,
                    text: TYPE_LABELS[item.type] || item.type
                }),
                el('span', {
                    className: `timeline-scope timeline-scope-${item.scope}`,
                    text: SCOPE_LABELS[item.scope] || item.scope
                })
            ]);

            const title = el('h3', { className: 'timeline-title' });
            if (item.link) {
                title.appendChild(SiteCore.link(item.link, '', item.title));
            } else {
                title.textContent = item.title;
            }

            const content = el('div', { className: 'timeline-content' }, [header, title]);
            if (item.venue) {
                content.appendChild(el('p', { className: 'timeline-venue', text: item.venue }));
            }
            content.appendChild(el('p', {
                className: 'timeline-description',
                text: item.description
            }));

            const timelineItem = el('article', {
                className: 'timeline-item',
                attrs: { role: 'listitem' }
            }, [
                el('div', { className: 'timeline-marker', attrs: { 'aria-hidden': 'true' } }),
                content
            ]);
            timelineItem.dataset.type = item.type;
            timelineItem.style.animationDelay = `${index * 0.05}s`;
            return timelineItem;
        }

        applyFilter() {
            if (!this.timelineItems) return;

            let visibleCount = 0;
            this.timelineItems.forEach(item => {
                const matches = this.currentFilter === 'all'
                    || item.dataset.type === this.currentFilter;
                item.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });

            let emptyMessage = this.timelineList.querySelector('.timeline-empty');
            if (visibleCount === 0) {
                if (!emptyMessage) {
                    this.timelineList.appendChild(el('p', {
                        className: 'timeline-empty',
                        text: 'No items match the selected filter.'
                    }));
                }
            } else if (emptyMessage) {
                emptyMessage.remove();
            }
        }

        attachEventListeners() {
            // Event delegation: one listener for all filter buttons
            this.container.addEventListener('click', (e) => {
                if (e.target.classList.contains('timeline-filter-btn')) {
                    this.handleFilterClick(e.target);
                }
            });

            this.container.addEventListener('keydown', (e) => {
                if (!e.target.classList.contains('timeline-filter-btn')) return;
                const buttons = Array.from(this.filterButtons);
                const index = buttons.indexOf(e.target);
                if (e.key === 'ArrowRight' && buttons[index + 1]) {
                    buttons[index + 1].focus();
                } else if (e.key === 'ArrowLeft' && buttons[index - 1]) {
                    buttons[index - 1].focus();
                }
            });
        }

        handleFilterClick(button) {
            const filterValue = button.dataset.filter;
            if (filterValue === this.currentFilter) return;

            this.filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            this.currentFilter = filterValue;
            this.applyFilter();
            this.announceFilterChange(filterValue);
        }

        announceFilterChange(filterValue) {
            const count = filterValue === 'all'
                ? this.sortedData.length
                : this.sortedData.filter(item => item.type === filterValue).length;
            const filterLabel = filterValue === 'all'
                ? 'all items'
                : `${TYPE_LABELS[filterValue] || filterValue} items`;

            const announcement = el('div', {
                className: 'sr-only',
                text: `Showing ${count} ${filterLabel}`,
                attrs: { role: 'status', 'aria-live': 'polite' }
            });
            this.container.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    registerRenderer(() => timelineData, (data) => {
        new Timeline(data, 'timeline-container');
    });
})();
