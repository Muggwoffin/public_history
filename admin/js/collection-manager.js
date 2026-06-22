/**
 * Collection Manager
 * Generic, configuration-driven CRUD UI for an array-based data file
 * (events, books, writing, documentaries, podcasts, timeline projects).
 *
 * A concrete manager supplies a config object only — no per-collection
 * UI or persistence code (open/closed principle). All list rows and the
 * edit form are built with DOM APIs; data is never parsed as HTML.
 *
 * Rows are mapped back to entries by their index in the ORIGINAL data
 * array (not the display-sorted order), so edit/delete always target the
 * intended item regardless of display sorting.
 */

class CollectionManager {
    /**
     * @param {Object} config
     * @param {string} config.containerId - host element id
     * @param {string} config.title - section heading
     * @param {string} config.noun - singular item name, e.g. "Book"
     * @param {string} config.fileKey - SiteData.FILES key
     * @param {Array<Object>} config.fields - form field definitions:
     *        {name, label, type, required?, placeholder?, help?, options?, rows?}
     * @param {(item: Object) => {title: string, meta: string}} config.summarize
     * @param {(items: Array) => Array<{label: string|null, items: Array}>}
     *        [config.groupForDisplay] - optional display grouping/sorting
     * @param {(values: Object, existing: Object|null) => Object} config.buildItem
     * @param {() => *} [config.store] - returns the SiteData.Store to use
     */
    constructor(config) {
        this.config = config;
        this.items = [];
        this.initialized = false;
    }

    get store() {
        return this.config.store();
    }

    /** Build static UI once and load data. Safe to call repeatedly. */
    init() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`${this.config.title}: container not found`);
            return;
        }
        if (this.initialized) return;
        this.initialized = true;

        this.buildLayout(container);
        this.load();
    }

    buildLayout(container) {
        const { el } = AdminDom;

        this.listEl = el('div', { className: 'items-list' }, [
            el('p', { className: 'loading-message', text: `Loading ${this.config.title.toLowerCase()}...` })
        ]);

        const addBtn = el('button', {
            className: 'btn btn-primary',
            text: `+ Add New ${this.config.noun}`
        });
        addBtn.addEventListener('click', () => this.openModal(null));

        const reloadBtn = el('button', {
            className: 'btn btn-secondary',
            text: 'Reload'
        });
        reloadBtn.addEventListener('click', () => this.load());

        this.modal = this.buildModal();

        AdminDom.clear(container);
        container.appendChild(el('div', { className: 'section-header' }, [
            el('h2', { text: this.config.title }),
            el('div', { className: 'book-actions' }, [reloadBtn, addBtn])
        ]));
        container.appendChild(this.listEl);
        container.appendChild(this.modal);
    }

    buildModal() {
        const { el } = AdminDom;

        this.form = el('form');
        this.fieldInputs = {};
        this.config.fields.forEach(field => {
            this.form.appendChild(this.buildField(field));
        });

        const cancelBtn = el('button', {
            className: 'btn btn-secondary', text: 'Cancel', attrs: { type: 'button' }
        });
        cancelBtn.addEventListener('click', () => this.closeModal());
        this.form.appendChild(el('div', { className: 'form-actions' }, [
            cancelBtn,
            el('button', {
                className: 'btn btn-primary',
                text: `Save ${this.config.noun}`,
                attrs: { type: 'submit' }
            })
        ]));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        const closeBtn = el('button', {
            className: 'modal-close', text: '×', attrs: { type: 'button', 'aria-label': 'Close' }
        });
        closeBtn.addEventListener('click', () => this.closeModal());

        this.modalTitle = el('h3', { text: `Add New ${this.config.noun}` });

        const modal = el('div', { className: 'modal' }, [
            el('div', { className: 'modal-content' }, [
                el('div', { className: 'modal-header' }, [this.modalTitle, closeBtn]),
                this.form
            ])
        ]);
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'flex-start';
        return modal;
    }

    buildField(field) {
        const { el } = AdminDom;
        const fieldId = `${this.config.containerId}-${field.name}`;

        // Custom widget field: the config supplies a factory returning
        // { element, get, set }. Stored as the field's "control" so
        // openModal/readFormValues drive it via set()/get(), not .value.
        if (field.type === 'widget') {
            const widget = field.widget();
            this.fieldInputs[field.name] = widget;
            const group = el('div', { className: 'form-group' }, [
                el('label', { text: field.label + (field.required ? ' *' : '') }),
                widget.element
            ]);
            if (field.help) group.appendChild(el('small', { text: field.help }));
            return group;
        }

        let input;
        if (field.type === 'textarea') {
            input = el('textarea', {
                attrs: { id: fieldId, rows: String(field.rows || 3) }
            });
        } else if (field.type === 'select') {
            input = el('select', { attrs: { id: fieldId } });
            field.options.forEach(opt => {
                input.appendChild(el('option', { text: opt.label, attrs: { value: opt.value } }));
            });
        } else {
            input = el('input', {
                attrs: { id: fieldId, type: field.type || 'text' }
            });
        }
        if (field.required) input.required = true;
        if (field.placeholder) input.setAttribute('placeholder', field.placeholder);
        this.fieldInputs[field.name] = input;

        const group = el('div', { className: 'form-group' }, [
            el('label', {
                text: field.label + (field.required ? ' *' : ''),
                attrs: { for: fieldId }
            }),
            input
        ]);
        if (field.help) group.appendChild(el('small', { text: field.help }));
        return group;
    }

    async load() {
        try {
            this.items = await this.store.load(this.config.fileKey);
            this.renderList();
        } catch (error) {
            console.error(`Error loading ${this.config.title}:`, error);
            AdminDom.clear(this.listEl);
            this.listEl.appendChild(AdminDom.el('p', {
                className: 'error-message',
                text: `Error loading ${this.config.title.toLowerCase()}: ${error.message}`
            }));
        }
    }

    renderList() {
        const { el } = AdminDom;
        AdminDom.clear(this.listEl);

        if (this.items.length === 0) {
            this.listEl.appendChild(el('p', {
                className: 'empty-message',
                text: `No ${this.config.title.toLowerCase()} yet. Click "Add New ${this.config.noun}" to create one.`
            }));
            return;
        }

        const groups = this.config.groupForDisplay
            ? this.config.groupForDisplay(this.items)
            : [{ label: null, items: this.items }];

        groups.forEach(group => {
            if (group.label) {
                this.listEl.appendChild(el('h3', {
                    className: 'events-section-title', text: group.label
                }));
            }
            group.items.forEach(item => {
                // Map display item back to its position in the source array
                const originalIndex = this.items.indexOf(item);
                this.listEl.appendChild(this.buildRow(item, originalIndex, group.cssClass));
            });
        });
    }

    buildRow(item, index, extraClass) {
        const { el } = AdminDom;
        const summary = this.config.summarize(item);

        const editBtn = el('button', { className: 'btn btn-sm btn-secondary', text: 'Edit' });
        editBtn.addEventListener('click', () => this.openModal(index));

        const deleteBtn = el('button', { className: 'btn btn-sm btn-danger', text: 'Delete' });
        deleteBtn.addEventListener('click', () => this.deleteItem(index));

        const info = el('div', { className: 'book-info' }, [
            el('h4', { text: summary.title }),
            el('p', { className: 'book-meta', text: summary.meta })
        ]);
        if (summary.detail) {
            info.appendChild(el('p', { className: 'event-location', text: summary.detail }));
        }

        return el('div', { className: 'book-row' + (extraClass ? ' ' + extraClass : '') }, [
            info,
            el('div', { className: 'book-actions' }, [editBtn, deleteBtn])
        ]);
    }

    openModal(index) {
        this.editingIndex = index;
        this.form.reset();

        if (index !== null) {
            this.modalTitle.textContent = `Edit ${this.config.noun}`;
            const item = this.items[index];
            this.config.fields.forEach(field => {
                const control = this.fieldInputs[field.name];
                const value = field.fromItem
                    ? field.fromItem(item)
                    : item[field.name];
                if (control && typeof control.set === 'function') {
                    control.set(value);
                } else {
                    control.value = value !== null && value !== undefined
                        ? String(value) : '';
                }
            });
        } else {
            this.modalTitle.textContent = `Add New ${this.config.noun}`;
            // form.reset() clears inputs/selects; widget fields need an
            // explicit reset to their empty state.
            this.config.fields.forEach(field => {
                const control = this.fieldInputs[field.name];
                if (control && typeof control.set === 'function') {
                    control.set(field.empty !== undefined ? field.empty : []);
                }
            });
        }
        this.modal.style.display = 'flex';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.editingIndex = null;
    }

    readFormValues() {
        const values = {};
        this.config.fields.forEach(field => {
            const control = this.fieldInputs[field.name];
            values[field.name] = typeof control.get === 'function'
                ? control.get()
                : control.value.trim();
        });
        return values;
    }

    async handleSubmit(e) {
        e.preventDefault();
        const index = this.editingIndex;
        const existing = index !== null ? this.items[index] : null;
        const item = this.config.buildItem(this.readFormValues(), existing);

        if (index !== null) {
            this.items[index] = item;
        } else {
            this.items.push(item);
        }

        try {
            await this.persist(
                `${index !== null ? 'Update' : 'Add'} ${this.config.noun.toLowerCase()}: ${item.title || ''}`
            );
            this.closeModal();
            AdminDom.showNotification(`${this.config.noun} saved successfully!`);
        } catch (error) {
            console.error(`Error saving ${this.config.noun}:`, error);
            AdminDom.showNotification(`Error saving: ${error.message}`, 'error');
            await this.load(); // restore state from repository
        }
    }

    async deleteItem(index) {
        if (!AdminDom.confirmAction(`Are you sure you want to delete this ${this.config.noun.toLowerCase()}?`)) {
            return;
        }
        const removed = this.items.splice(index, 1)[0];
        try {
            await this.persist(`Delete ${this.config.noun.toLowerCase()}: ${removed.title || ''}`);
            AdminDom.showNotification(`${this.config.noun} deleted successfully!`);
        } catch (error) {
            console.error(`Error deleting ${this.config.noun}:`, error);
            AdminDom.showNotification(`Error deleting: ${error.message}`, 'error');
            await this.load();
        }
    }

    async persist(message) {
        await this.store.save(this.config.fileKey, this.items, message);
        this.renderList();
    }
}
