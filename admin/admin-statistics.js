/**
 * Admin Panel - Site Statistics
 * Display analytics data from external service (Google Analytics, Plausible, etc.)
 */

// ============================================
// SITE STATISTICS
// ============================================

/**
 * Initialize statistics dashboard
 */
function initStatisticsDashboard() {
    const container = document.getElementById('statistics-dashboard');
    if (!container) return;

    container.innerHTML = `
        <div class="admin-section">
            <h2>Site Statistics</h2>
            <p class="section-description">
                View visitor analytics for your site. Configure your analytics provider below.
            </p>

            <!-- Analytics Configuration -->
            <div class="analytics-config">
                <h3>Analytics Configuration</h3>
                <form id="analytics-config-form" class="config-form">
                    <div class="form-group">
                        <label for="analytics-provider">Analytics Provider</label>
                        <select id="analytics-provider">
                            <option value="">-- Select Provider --</option>
                            <option value="ga4">Google Analytics 4</option>
                            <option value="plausible">Plausible</option>
                            <option value="fathom">Fathom</option>
                            <option value="custom">Custom API</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="analytics-site-id">Site ID / Property ID</label>
                        <input type="text" id="analytics-site-id" placeholder="e.g., G-XXXXXXXXXX">
                    </div>

                    <div class="form-group">
                        <label for="analytics-api-key">API Key (if required)</label>
                        <input type="password" id="analytics-api-key" placeholder="Your API key">
                        <small>API key stored locally, not committed to repository</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="load-analytics-btn">Load Saved Config</button>
                        <button type="button" class="btn btn-primary" id="save-analytics-btn">Save Config</button>
                        <button type="button" class="btn btn-primary" id="fetch-stats-btn">Fetch Statistics</button>
                    </div>
                </form>
            </div>

            <!-- Statistics Display -->
            <div class="statistics-display" id="statistics-display">
                <div class="stats-placeholder">
                    <p>Configure your analytics provider above and click "Fetch Statistics" to view data.</p>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners
    document.getElementById('load-analytics-btn').addEventListener('click', loadAnalyticsConfig);
    document.getElementById('save-analytics-btn').addEventListener('click', saveAnalyticsConfig);
    document.getElementById('fetch-stats-btn').addEventListener('click', fetchStatistics);

    // Load saved config
    loadAnalyticsConfig();
}

/**
 * Load analytics config from localStorage
 */
function loadAnalyticsConfig() {
    const provider = localStorage.getItem('analytics_provider');
    const siteId = localStorage.getItem('analytics_site_id');
    const apiKey = localStorage.getItem('analytics_api_key');

    if (provider) document.getElementById('analytics-provider').value = provider;
    if (siteId) document.getElementById('analytics-site-id').value = siteId;
    if (apiKey) document.getElementById('analytics-api-key').value = apiKey;

    if (provider && siteId) {
        showNotification('Analytics configuration loaded');
    }
}

/**
 * Save analytics config to localStorage
 */
function saveAnalyticsConfig() {
    const provider = document.getElementById('analytics-provider').value;
    const siteId = document.getElementById('analytics-site-id').value;
    const apiKey = document.getElementById('analytics-api-key').value;

    if (!provider || !siteId) {
        showNotification('Please select a provider and enter a site ID', 'error');
        return;
    }

    localStorage.setItem('analytics_provider', provider);
    localStorage.setItem('analytics_site_id', siteId);
    localStorage.setItem('analytics_api_key', apiKey);

    showNotification('Analytics configuration saved');
}

/**
 * Fetch statistics from analytics provider
 */
async function fetchStatistics() {
    const provider = localStorage.getItem('analytics_provider');
    const siteId = localStorage.getItem('analytics_site_id');
    const apiKey = localStorage.getItem('analytics_api_key');

    if (!provider || !siteId) {
        showNotification('Please configure analytics provider first', 'error');
        return;
    }

    const display = document.getElementById('statistics-display');
    display.innerHTML = '<p class="loading-message">Fetching statistics...</p>';

    try {
        let stats;

        switch (provider) {
            case 'ga4':
                stats = await fetchGoogleAnalytics(siteId, apiKey);
                break;
            case 'plausible':
                stats = await fetchPlausible(siteId, apiKey);
                break;
            case 'fathom':
                stats = await fetchFathom(siteId, apiKey);
                break;
            case 'custom':
                stats = await fetchCustomAnalytics(siteId, apiKey);
                break;
            default:
                throw new Error('Unknown provider');
        }

        renderStatistics(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        display.innerHTML = `
            <div class="error-message">
                <h3>Error Fetching Statistics</h3>
                <p>${error.message}</p>
                <p class="small">Note: You need to configure CORS and API access for your analytics provider. This is a placeholder implementation.</p>
            </div>
        `;
    }
}

/**
 * Fetch Google Analytics 4 data
 * NOTE: This is a placeholder - actual implementation requires OAuth2 flow
 */
async function fetchGoogleAnalytics(propertyId, apiKey) {
    // Placeholder implementation
    // Real implementation would use Google Analytics Data API v1
    // https://developers.google.com/analytics/devguides/reporting/data/v1

    // For demonstration, return mock data
    return getMockStatistics();
}

/**
 * Fetch Plausible Analytics data
 */
async function fetchPlausible(siteId, apiKey) {
    // Plausible API: https://plausible.io/docs/stats-api

    const response = await fetch(`https://plausible.io/api/v1/stats/aggregate?site_id=${siteId}&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Plausible data');
    }

    const data = await response.json();

    return {
        totalVisitors: data.results.visitors.value,
        totalPageviews: data.results.pageviews.value,
        bounceRate: data.results.bounce_rate.value,
        avgDuration: data.results.visit_duration.value,
        referrers: [],
        countries: []
    };
}

/**
 * Fetch Fathom Analytics data
 */
async function fetchFathom(siteId, apiKey) {
    // Fathom API: https://usefathom.com/api

    // Placeholder - implement based on Fathom API docs
    return getMockStatistics();
}

/**
 * Fetch from custom analytics API
 */
async function fetchCustomAnalytics(endpoint, apiKey) {
    // Custom implementation - depends on your API structure
    return getMockStatistics();
}

/**
 * Get mock statistics data
 */
function getMockStatistics() {
    return {
        totalVisitors: 12453,
        totalPageviews: 34721,
        bounceRate: 42.3,
        avgDuration: 245,
        referrers: [
            { source: 'Google Search', visitors: 5234, percentage: 42 },
            { source: 'Direct', visitors: 3456, percentage: 28 },
            { source: 'Twitter', visitors: 2100, percentage: 17 },
            { source: 'Facebook', visitors: 1200, percentage: 10 },
            { source: 'Other', visitors: 463, percentage: 3 }
        ],
        countries: [
            { country: 'United States', visitors: 4500 },
            { country: 'United Kingdom', visitors: 3200 },
            { country: 'Ireland', visitors: 1800 },
            { country: 'Canada', visitors: 1200 },
            { country: 'Australia', visitors: 900 },
            { country: 'Germany', visitors: 853 }
        ]
    };
}

/**
 * Render statistics
 */
function renderStatistics(stats) {
    const display = document.getElementById('statistics-display');

    display.innerHTML = `
        <!-- Key Metrics -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${formatNumber(stats.totalVisitors)}</div>
                <div class="stat-label">Total Visitors</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatNumber(stats.totalPageviews)}</div>
                <div class="stat-label">Total Pageviews</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.bounceRate}%</div>
                <div class="stat-label">Bounce Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatDuration(stats.avgDuration)}</div>
                <div class="stat-label">Avg. Duration</div>
            </div>
        </div>

        <!-- Referrers Table -->
        <div class="stats-section">
            <h3>Top Referrers</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Visitors</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.referrers.map(ref => `
                        <tr>
                            <td>${ref.source}</td>
                            <td>${formatNumber(ref.visitors)}</td>
                            <td>
                                <div class="percentage-bar">
                                    <div class="percentage-fill" style="width: ${ref.percentage}%"></div>
                                    <span>${ref.percentage}%</span>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Countries Table -->
        <div class="stats-section">
            <h3>Top Countries</h3>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Country</th>
                        <th>Visitors</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.countries.map(country => `
                        <tr>
                            <td>${country.country}</td>
                            <td>${formatNumber(country.visitors)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <p class="stats-footer">Data for last 30 days • <a href="#" onclick="fetchStatistics()">Refresh</a></p>
    `;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format duration in seconds to readable format
 */
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

// Export function
if (typeof window !== 'undefined') {
    window.initStatisticsDashboard = initStatisticsDashboard;
}
