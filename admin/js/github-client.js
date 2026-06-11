/**
 * GitHub API Client
 * Single point of access to the GitHub REST API. Owns the token, the
 * target repository/branch, UTF-8-safe base64 transcoding and per-path
 * SHA tracking, so callers never deal with raw fetch or encodings.
 */

class GitHubClient {
    /**
     * @param {string} token - Personal access token (kept in memory only)
     * @param {string} repo - "owner/name"
     * @param {string} branch
     */
    constructor(token, repo, branch) {
        this.token = token;
        this.repo = repo;
        this.branch = branch;
        this.apiBase = 'https://api.github.com';
        /** @type {Map<string, string>} path -> last known blob SHA */
        this.shaCache = new Map();
    }

    /**
     * Perform an authenticated API request.
     * @param {string} endpoint - path beginning with '/'
     * @param {string} [method]
     * @param {Object|null} [body]
     * @returns {Promise<Object>}
     */
    async request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(this.apiBase + endpoint, options);
        if (!response.ok) {
            let message = `GitHub API request failed (HTTP ${response.status})`;
            try {
                const error = await response.json();
                if (error.message) message = error.message;
            } catch (_) { /* non-JSON error body */ }
            throw new Error(message);
        }
        return response.json();
    }

    /**
     * Validate the token and repository by fetching repo metadata.
     * @returns {Promise<Object>}
     */
    validate() {
        return this.request(`/repos/${this.repo}`);
    }

    /**
     * Fetch a text file. Returns decoded UTF-8 content and records its SHA.
     * @param {string} path
     * @returns {Promise<{content: string, sha: string}>}
     */
    async getFile(path) {
        const data = await this.request(
            `/repos/${this.repo}/contents/${path}?ref=${this.branch}`
        );
        const content = GitHubClient.decodeBase64Utf8(data.content);
        this.shaCache.set(path, data.sha);
        return { content, sha: data.sha };
    }

    /**
     * Create or update a text file. Uses the cached SHA when updating;
     * fetches the current SHA first when none is cached.
     * @param {string} path
     * @param {string} content - plain text (UTF-8)
     * @param {string} message - commit message
     * @returns {Promise<Object>}
     */
    async putFile(path, content, message) {
        return this.putBase64(path, GitHubClient.encodeBase64Utf8(content), message);
    }

    /**
     * Create or update a binary file from base64 content.
     * @param {string} path
     * @param {string} base64 - base64-encoded bytes
     * @param {string} message - commit message
     * @returns {Promise<Object>}
     */
    async putBase64(path, base64, message) {
        let sha = this.shaCache.get(path);
        if (!sha) {
            // The file may exist without having been read this session
            try {
                const existing = await this.request(
                    `/repos/${this.repo}/contents/${path}?ref=${this.branch}`
                );
                sha = existing.sha;
            } catch (_) {
                sha = undefined; // new file
            }
        }

        const body = { message, content: base64, branch: this.branch };
        if (sha) body.sha = sha;

        const response = await this.request(
            `/repos/${this.repo}/contents/${path}`, 'PUT', body
        );
        this.shaCache.set(path, response.content.sha);
        return response;
    }

    /**
     * List a directory's entries.
     * @param {string} path
     * @returns {Promise<Array>}
     */
    listDirectory(path) {
        return this.request(`/repos/${this.repo}/contents/${path}?ref=${this.branch}`);
    }

    /**
     * Most recent commits on the branch.
     * @param {number} [count]
     * @returns {Promise<Array>}
     */
    recentCommits(count = 5) {
        return this.request(
            `/repos/${this.repo}/commits?sha=${this.branch}&per_page=${count}`
        );
    }

    /**
     * Decode GitHub's base64 file content as UTF-8.
     * @param {string} base64
     * @returns {string}
     */
    static decodeBase64Utf8(base64) {
        const binary = atob(base64.replace(/\n/g, ''));
        const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
        return new TextDecoder('utf-8').decode(bytes);
    }

    /**
     * Encode text as base64 of its UTF-8 bytes.
     * @param {string} text
     * @returns {string}
     */
    static encodeBase64Utf8(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach(b => { binary += String.fromCharCode(b); });
        return btoa(binary);
    }
}
