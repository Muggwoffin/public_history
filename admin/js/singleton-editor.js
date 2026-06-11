/**
 * Singleton Editor
 * Generic form editor for data files holding a single object
 * ("What I'm Reading" / "What I'm Playing"). Counterpart to
 * CollectionManager for non-array data.
 */

class SingletonEditor {
    /**
     * @param {Object} config
     * @param {string} config.containerId
     * @param {string} config.title
     * @param {string} config.description
     * @param {string} config.fileKey - SiteData.FILES key
     * @param {Array<Object>} config.fields - {name, label, type, required?, placeholder?, help?, rows?}
     * @param {string} config.commitMessage
     * @param {() => *} config.store - returns the SiteData.Store to use
     */
    constructor(config) {
        this.config = config;
        this.initialized = false;
    }

    get store() {
        return this.config.store();
    }

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

        this.form = el('form', { className: 'content-form' });
        this.fieldInputs = {};

        this.config.fields.forEach(field => {
            const fieldId = `${this.config.containerId}-${field.name}`;
            const input = field.type === 'textarea'
                ? el('textarea', { attrs: { id: fieldId, rows: String(field.rows || 3) } })
                : el('input', { attrs: { id: fieldId, type: field.type || 'text' } });
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
            this.form.appendChild(group);
        });

        const loadBtn = el('button', {
            className: 'btn btn-secondary', text: 'Load Current', attrs: { type: 'button' }
        });
        loadBtn.addEventListener('click', () => this.load());

        this.form.appendChild(el('div', { className: 'form-actions' }, [
            loadBtn,
            el('button', {
                className: 'btn btn-primary', text: 'Save Changes', attrs: { type: 'submit' }
            })
        ]));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        AdminDom.clear(container);
        container.appendChild(el('h2', { text: this.config.title }));
        container.appendChild(el('p', {
            className: 'section-description', text: this.config.description
        }));
        container.appendChild(this.form);
    }

    async load() {
        try {
            const data = await this.store.load(this.config.fileKey);
            this.config.fields.forEach(field => {
                this.fieldInputs[field.name].value = data[field.name] || '';
            });
            AdminDom.showNotification(`${this.config.title} content loaded`);
        } catch (error) {
            console.error(`Error loading ${this.config.title}:`, error);
            AdminDom.showNotification(`Error loading content: ${error.message}`, 'error');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const data = {};
        this.config.fields.forEach(field => {
            data[field.name] = this.fieldInputs[field.name].value.trim();
        });

        try {
            await this.store.save(this.config.fileKey, data, this.config.commitMessage);
            AdminDom.showNotification(`${this.config.title} saved successfully!`);
        } catch (error) {
            console.error(`Error saving ${this.config.title}:`, error);
            AdminDom.showNotification(`Error saving: ${error.message}`, 'error');
        }
    }
}
