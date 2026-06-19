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
gtag('js', new Date());
gtag('config', 'G-BQBYCGSSWC');
