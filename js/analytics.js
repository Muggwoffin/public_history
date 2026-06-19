/**
 * Google Analytics (GA4) initialisation.
 *
 * Kept in an external, same-origin file on purpose: it lets the page's
 * Content Security Policy stay strict — script-src needs only 'self' plus
 * the Google Tag loader, with no 'unsafe-inline'. The gtag.js loader is
 * added in the page <head>; this file sets up the data layer and config.
 *
 * To change the property, update the measurement ID in both the loader
 * <script> tag and the config() call below.
 */

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Consent Mode v2 — deny everything by default until the visitor chooses.
// This must run before config() (and before gtag.js processes any hit).
// While denied, GA4 sends only cookieless, modelled pings — no cookies.
gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
});

// Restore a previously granted choice so returning visitors aren't re-asked.
if (/(?:^|; )mjc_consent=granted(?:;|$)/.test(document.cookie)) {
    gtag('consent', 'update', { analytics_storage: 'granted' });
}

gtag('js', new Date());
gtag('config', 'G-BQBYCGSSWC');

/**
 * Consent-gated custom-event helper.
 *
 * Components call window.trackEvent('name', { ... }) for interaction events
 * (section views, the Tetris easter egg). Events are only sent once the
 * visitor has actively granted analytics consent, so nothing fires before
 * "Accept". Returns true when the event was sent, letting callers avoid
 * marking something as reported while consent is still pending.
 */
window.trackEvent = function (name, params) {
    if (typeof window.gtag !== 'function') return false;
    if (!/(?:^|; )mjc_consent=granted(?:;|$)/.test(document.cookie)) return false;
    window.gtag('event', name, params || {});
    return true;
};
