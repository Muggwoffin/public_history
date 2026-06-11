/**
 * Statistics Dashboard
 * Optional visitor-analytics view. Only Plausible has a live integration;
 * other providers show sample data until configured.
 *
 * The provider/site-id are kept in localStorage; the API key is kept in
 * sessionStorage so it does not persist beyond the browser session.
 */

const StatisticsDashboard = (function () {
    'use strict';

    let initialized = false;
    let displayEl = null;
    let inputs = null;

    function init() {
        const container = document.getElementById('statistics-dashboard');
        if (!container) {
            console.error('Statistics dashboard container not found');
            return;
        }
        if (initialized) return;
        initialized = true;

        buildLayout(container);
        loadConfig();
    }

    function buildLayout(container) {
        const { el } = AdminDom;

        const providerSelect = el('select', { attrs: { id: 'analytics-provider' } });
        [
            { value: '', label: '-- Select Provider --' },
            { value: 'ga4', label: 'Google Analytics 4 (sample data)' },
            { value: 'plausible', label: 'Plausible' },
            { value: 'fathom', label: 'Fathom (sample data)' }
        ].forEach(opt => {
            providerSelect.appendChild(el('option', { text: opt.label, attrs: { value: opt.value } }));
        });

        const siteIdInput = el('input', {
            attrs: { id: 'analytics-site-id', type: 'text', placeholder: 'e.g., mauricejcasey.com' }
        });
        const apiKeyInput = el('input', {
            attrs: {
                id: 'analytics-api-key', type: 'password', placeholder: 'Your API key',
                autocomplete: 'off'
            }
        });
        inputs = { provider: providerSelect, siteId: siteIdInput, apiKey: apiKeyInput };

        const saveBtn = el('button', {
            className: 'btn btn-primary', text: 'Save Config', attrs: { type: 'button' }
        });
        saveBtn.addEventListener('click', saveConfig);

        const fetchBtn = el('button', {
            className: 'btn btn-primary', text: 'Fetch Statistics', attrs: { type: 'button' }
        });
        fetchBtn.addEventListener('click', fetchStatistics);

        const form = el('form', { className: 'config-form' }, [
            fieldGroup('Analytics Provider', providerSelect),
            fieldGroup('Site ID / Property ID', siteIdInput),
            fieldGroup('API Key (if required)', apiKeyInput,
                'API key is kept only for this browser session and never committed to the repository.'),
            el('div', { className: 'form-actions' }, [saveBtn, fetchBtn])
        ]);
        form.addEventListener('submit', (e) => e.preventDefault());

        displayEl = el('div', {
            className: 'statistics-display'
        }, [
            el('div', { className: 'stats-placeholder' }, [
                el('p', { text: 'Configure your analytics provider above and click "Fetch Statistics" to view data.' })
            ])
        ]);

        AdminDom.clear(container);
        container.appendChild(el('h2', { text: 'Site Statistics' }));
        container.appendChild(el('p', {
            className: 'section-description',
            text: 'View visitor analytics for your site. Configure your analytics provider below.'
        }));
        container.appendChild(el('div', { className: 'analytics-config' }, [
            el('h3', { text: 'Analytics Configuration' }), form
        ]));
        container.appendChild(displayEl);

        function fieldGroup(label, input, help) {
            const group = el('div', { className: 'form-group' }, [
                el('label', { text: label, attrs: { for: input.id } }),
                input
            ]);
            if (help) group.appendChild(el('small', { text: help }));
            return group;
        }
    }

    function loadConfig() {
        inputs.provider.value = localStorage.getItem('analytics_provider') || '';
        inputs.siteId.value = localStorage.getItem('analytics_site_id') || '';
        inputs.apiKey.value = sessionStorage.getItem('analytics_api_key') || '';
    }

    function saveConfig() {
        if (!inputs.provider.value || !inputs.siteId.value) {
            AdminDom.showNotification('Please select a provider and enter a site ID', 'error');
            return;
        }
        localStorage.setItem('analytics_provider', inputs.provider.value);
        localStorage.setItem('analytics_site_id', inputs.siteId.value);
        sessionStorage.setItem('analytics_api_key', inputs.apiKey.value);
        AdminDom.showNotification('Analytics configuration saved');
    }

    async function fetchStatistics() {
        const provider = inputs.provider.value;
        const siteId = inputs.siteId.value;
        const apiKey = inputs.apiKey.value;

        if (!provider || !siteId) {
            AdminDom.showNotification('Please configure analytics provider first', 'error');
            return;
        }

        AdminDom.clear(displayEl);
        displayEl.appendChild(AdminDom.el('p', {
            className: 'loading-message', text: 'Fetching statistics...'
        }));

        try {
            const stats = provider === 'plausible'
                ? await fetchPlausible(siteId, apiKey)
                : sampleStatistics();
            renderStatistics(stats, provider !== 'plausible');
        } catch (error) {
            console.error('Error fetching statistics:', error);
            const { el } = AdminDom;
            AdminDom.clear(displayEl);
            displayEl.appendChild(el('div', { className: 'error-message' }, [
                el('h3', { text: 'Error Fetching Statistics' }),
                el('p', { text: error.message }),
                el('p', {
                    className: 'small',
                    text: 'Note: your analytics provider must allow API access from the browser (CORS).'
                })
            ]));
        }
    }

    async function fetchPlausible(siteId, apiKey) {
        const url = 'https://plausible.io/api/v1/stats/aggregate'
            + `?site_id=${encodeURIComponent(siteId)}`
            + '&period=30d&metrics=visitors,pageviews,bounce_rate,visit_duration';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) throw new Error('Failed to fetch Plausible data');

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

    function sampleStatistics() {
        return {
            totalVisitors: 12453,
            totalPageviews: 34721,
            bounceRate: 42.3,
            avgDuration: 245,
            referrers: [
                { source: 'Google Search', visitors: 5234, percentage: 42 },
                { source: 'Direct', visitors: 3456, percentage: 28 },
                { source: 'Social Media', visitors: 3300, percentage: 27 },
                { source: 'Other', visitors: 463, percentage: 3 }
            ],
            countries: [
                { country: 'United States', visitors: 4500 },
                { country: 'United Kingdom', visitors: 3200 },
                { country: 'Ireland', visitors: 1800 }
            ]
        };
    }

    function renderStatistics(stats, isSample) {
        const { el } = AdminDom;
        AdminDom.clear(displayEl);

        if (isSample) {
            displayEl.appendChild(el('p', {
                className: 'help-text',
                text: 'Showing sample data — this provider does not have a live integration yet.'
            }));
        }

        const statCard = (value, label) => el('div', { className: 'stat-card' }, [
            el('div', { className: 'stat-value', text: value }),
            el('div', { className: 'stat-label', text: label })
        ]);

        displayEl.appendChild(el('div', { className: 'stats-grid' }, [
            statCard(Number(stats.totalVisitors).toLocaleString(), 'Total Visitors'),
            statCard(Number(stats.totalPageviews).toLocaleString(), 'Total Pageviews'),
            statCard(`${stats.bounceRate}%`, 'Bounce Rate'),
            statCard(formatDuration(stats.avgDuration), 'Avg. Duration')
        ]));

        if (stats.referrers.length > 0) {
            displayEl.appendChild(buildTable('Top Referrers',
                ['Source', 'Visitors', 'Percentage'],
                stats.referrers.map(ref => [
                    ref.source,
                    Number(ref.visitors).toLocaleString(),
                    `${ref.percentage}%`
                ])
            ));
        }
        if (stats.countries.length > 0) {
            displayEl.appendChild(buildTable('Top Countries',
                ['Country', 'Visitors'],
                stats.countries.map(c => [c.country, Number(c.visitors).toLocaleString()])
            ));
        }

        displayEl.appendChild(el('p', {
            className: 'stats-footer', text: 'Data for last 30 days'
        }));
    }

    function buildTable(title, headers, rows) {
        const { el } = AdminDom;
        return el('div', { className: 'stats-section' }, [
            el('h3', { text: title }),
            el('table', { className: 'stats-table' }, [
                el('thead', {}, [
                    el('tr', {}, headers.map(h => el('th', { text: h })))
                ]),
                el('tbody', {}, rows.map(cells =>
                    el('tr', {}, cells.map(cell => el('td', { text: cell })))
                ))
            ])
        ]);
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}m ${secs}s`;
    }

    return { init };
})();
