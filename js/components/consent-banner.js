/**
 * Consent banner (GA Consent Mode v2).
 *
 * Self-contained vanilla module (no SiteCore dependency) so it can run on
 * both the landing page and the portfolio page. Analytics defaults to
 * denied (set in analytics.js); this banner flips analytics_storage to
 * granted only when the visitor accepts, and remembers the choice in a
 * first-party cookie (strictly necessary, so allowed without consent).
 *
 * The site uses no advertising, so ad_* signals stay denied throughout.
 */

(function () {
    'use strict';

    var COOKIE = 'mjc_consent';
    var MAX_AGE = 60 * 60 * 24 * 180; // 180 days

    function getConsent() {
        var m = document.cookie.match(/(?:^|; )mjc_consent=([^;]+)/);
        return m ? m[1] : null;
    }

    function setConsent(value) {
        document.cookie = COOKIE + '=' + value + '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax';
    }

    function applyConsent(value) {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                analytics_storage: value === 'granted' ? 'granted' : 'denied'
            });
        }
    }

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    }

    ready(function () {
        if (getConsent()) return; // visitor already decided

        var banner = el('div', 'consent-banner');
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Analytics consent');

        var msg = el('p', 'consent-text',
            "This site uses Google Analytics to understand how it's used. " +
            'Enable analytics cookies?');

        var actions = el('div', 'consent-actions');
        var decline = el('button', 'consent-btn consent-decline', 'Decline');
        var accept = el('button', 'consent-btn consent-accept', 'Accept');

        function choose(value) {
            setConsent(value);
            applyConsent(value);
            banner.classList.remove('consent-show');
            banner.classList.add('consent-hide');
            setTimeout(function () { banner.remove(); }, 350);
        }

        accept.addEventListener('click', function () { choose('granted'); });
        decline.addEventListener('click', function () { choose('denied'); });

        actions.appendChild(decline);
        actions.appendChild(accept);
        banner.appendChild(msg);
        banner.appendChild(actions);
        document.body.appendChild(banner);

        // Slide in on the next frame so the transition runs
        requestAnimationFrame(function () { banner.classList.add('consent-show'); });
        accept.focus();
    });
})();
