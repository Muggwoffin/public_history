/**
 * Site Data Store
 * Reads and writes the site's data files (books.js, events.js, ...) through
 * a GitHubClient. Each data file declares a single `const <name> = <JSON>;`
 * so its payload can be extracted and parsed with JSON.parse.
 *
 * Security: no eval() / new Function(). The literal is located with a
 * string-aware bracket scanner and parsed strictly as JSON; anything that
 * is not pure JSON data is rejected.
 */

const SiteData = (function () {
    'use strict';

    /**
     * Registry of the data files the admin panel manages.
     * header: comment block written at the top of the generated file.
     * varName: the global the site reads; kind: 'array' | 'object'.
     */
    const FILES = {
        events: {
            path: 'events.js',
            varName: 'events',
            kind: 'array',
            header: 'Events Data\n * Stores upcoming and past events for the PUBLIC HISTORY section'
        },
        books: {
            path: 'books.js',
            varName: 'books',
            kind: 'array',
            header: 'Books Data\n * Stores published books for the BOOKS section'
        },
        writing: {
            path: 'writing.js',
            varName: 'writing',
            kind: 'array',
            header: 'Selected Writing Data\n * Articles, essays, and other writing for popular audiences'
        },
        documentaries: {
            path: 'documentaries.js',
            varName: 'documentaries',
            kind: 'array',
            header: 'Documentaries Data\n * Films and documentaries featuring historical consultation or participation'
        },
        podcasts: {
            path: 'podcasts.js',
            varName: 'podcasts',
            kind: 'array',
            header: 'Podcasts Data\n * Recent podcast appearances and interviews'
        },
        tools: {
            path: 'tools.js',
            varName: 'tools',
            kind: 'array',
            header: 'Tools Data\n * Research tools and resources shown on the Tools page (tools.html)'
        },
        resources: {
            path: 'resources.js',
            varName: 'resources',
            kind: 'array',
            header: 'Resources Data\n * Research resources (bibliographies, guides, datasets) shown on the Tools page'
        },
        projects: {
            path: 'projects.js',
            varName: 'timelineData',
            kind: 'array',
            header: 'Career Timeline Data for Dr. Maurice Casey\n * Managed via the admin panel Timeline Manager.\n * sortDate must be YYYY-MM-DD; data must remain valid JSON.'
        },
        reading: {
            path: 'reading.js',
            varName: 'currentReading',
            kind: 'object',
            header: 'Current Reading Data\n * Stores information about what Dr Casey is currently reading'
        },
        playing: {
            path: 'playing.js',
            varName: 'currentPlaying',
            kind: 'object',
            header: 'Current Playing Data\n * Stores information about what Dr Casey is currently playing'
        },
        landingConfig: {
            path: 'landing-config.js',
            varName: 'landingConfig',
            kind: 'object',
            header: 'Landing Images Configuration\n * Controls rotating images for various sections of the site'
        }
    };

    /**
     * Locate the data literal assigned to `const <varName> =` and return it
     * as a string. Uses a bracket-matching scan that understands string
     * escapes, so brackets inside string values cannot truncate the match.
     * @param {string} source - full file text
     * @param {string} varName
     * @returns {string} the literal, e.g. "[ ... ]" or "{ ... }"
     */
    function extractDataLiteral(source, varName) {
        const declaration = new RegExp('const\\s+' + varName + '\\s*=\\s*');
        const match = declaration.exec(source);
        if (!match) {
            throw new Error(`Could not find "const ${varName} =" in file`);
        }

        const start = match.index + match[0].length;
        const open = source[start];
        if (open !== '[' && open !== '{') {
            throw new Error(`Data for ${varName} must start with [ or {`);
        }
        const close = open === '[' ? ']' : '}';

        // In valid JSON, counting only the outer bracket kind is sufficient:
        // any closing bracket of that kind inside a nested structure has a
        // matching opener that was also counted.
        let depth = 0;
        let inString = false;
        for (let i = start; i < source.length; i++) {
            const ch = source[i];
            if (inString) {
                if (ch === '\\') i++; // skip escaped character
                else if (ch === '"') inString = false;
            } else if (ch === '"') {
                inString = true;
            } else if (ch === open) {
                depth++;
            } else if (ch === close) {
                depth--;
                if (depth === 0) {
                    return source.slice(start, i + 1);
                }
            }
        }
        throw new Error(`Unterminated data literal for ${varName}`);
    }

    /**
     * Parse a data file's text into its data payload (strict JSON).
     * @param {string} source
     * @param {{varName: string, kind: string}} fileDef
     * @returns {*}
     */
    function parseDataFile(source, fileDef) {
        const literal = extractDataLiteral(source, fileDef.varName);
        let data;
        try {
            data = JSON.parse(literal);
        } catch (e) {
            throw new Error(
                `${fileDef.path || fileDef.varName} does not contain valid JSON data. ` +
                'Re-save it via the admin panel or fix the file in the repository.'
            );
        }
        const isArray = Array.isArray(data);
        if (fileDef.kind === 'array' && !isArray) {
            throw new Error(`${fileDef.varName} must be an array`);
        }
        if (fileDef.kind === 'object' && (isArray || typeof data !== 'object' || data === null)) {
            throw new Error(`${fileDef.varName} must be an object`);
        }
        return data;
    }

    /**
     * Generate the full text of a data file.
     * @param {{varName: string, header: string}} fileDef
     * @param {*} data
     * @returns {string}
     */
    function generateDataFile(fileDef, data) {
        return `/**\n * ${fileDef.header}\n */\n\n`
            + `const ${fileDef.varName} = ${JSON.stringify(data, null, 4)};\n\n`
            + '// Export for use in main site\n'
            + "if (typeof module !== 'undefined' && module.exports) {\n"
            + `    module.exports = ${fileDef.varName};\n`
            + '}\n';
    }

    /**
     * Data access layer bound to a GitHubClient.
     */
    class Store {
        /** @param {GitHubClient} client */
        constructor(client) {
            this.client = client;
        }

        fileDef(key) {
            const def = FILES[key];
            if (!def) throw new Error(`Unknown data file: ${key}`);
            return def;
        }

        /**
         * Load and parse a data file.
         * @param {string} key - registry key, e.g. 'books'
         * @returns {Promise<*>}
         */
        async load(key) {
            const def = this.fileDef(key);
            const file = await this.client.getFile(def.path);
            return parseDataFile(file.content, def);
        }

        /**
         * Serialize and commit a data file.
         * @param {string} key
         * @param {*} data
         * @param {string} message - commit message
         * @returns {Promise<Object>}
         */
        save(key, data, message) {
            const def = this.fileDef(key);
            return this.client.putFile(def.path, generateDataFile(def, data), message);
        }
    }

    return { FILES, Store, extractDataLiteral, parseDataFile, generateDataFile };
})();
