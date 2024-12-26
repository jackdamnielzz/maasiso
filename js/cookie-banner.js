class CookieConsent {
    constructor() {
        this.cookieName = 'consent_status';
        this.cookieExpiry = 365; // 1 year as specified in cookiebeleid.html
        this.initializeBanner();
        this.initializeModal();
        this.checkCookieConsent();
    }

    initializeBanner() {
        const bannerHTML = `
            <div class="cookie-banner" id="cookieBanner">
                <div class="cookie-banner__content">
                    <div class="cookie-banner__text">
                        <h3>Cookie-instellingen</h3>
                        <p>Wij gebruiken cookies om uw ervaring te verbeteren en onze website te optimaliseren. U kunt kiezen welke cookies u wilt accepteren. Lees meer in ons <a href="/cookiebeleid.html">cookiebeleid</a>.</p>
                    </div>
                    <div class="cookie-banner__actions">
                        <button class="cookie-banner__button cookie-banner__button--accept" id="acceptAllCookies">Alle cookies accepteren</button>
                        <button class="cookie-banner__button cookie-banner__button--settings" id="openCookieSettings">Cookie-instellingen</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);

        document.getElementById('acceptAllCookies').addEventListener('click', () => this.acceptAllCookies());
        document.getElementById('openCookieSettings').addEventListener('click', () => this.openSettings());
    }

    initializeModal() {
        const modalHTML = `
            <div class="cookie-settings-modal" id="cookieSettingsModal">
                <div class="cookie-settings-modal__content">
                    <div class="cookie-settings-modal__header">
                        <h3>Cookie-instellingen</h3>
                        <button class="cookie-settings-modal__close" id="closeCookieSettings">&times;</button>
                    </div>
                    <div class="cookie-settings-modal__options">
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <h4 class="cookie-option__title">Noodzakelijke cookies</h4>
                                <p class="cookie-option__description">Deze cookies zijn essentieel voor het functioneren van de website. Ze onthouden bijvoorbeeld uw taalvoorkeuren en of u bent ingelogd.</p>
                            </div>
                            <label class="cookie-option__toggle">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-option__toggle-slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <h4 class="cookie-option__title">Analytische cookies</h4>
                                <p class="cookie-option__description">We gebruiken analytische cookies om te begrijpen hoe bezoekers onze website gebruiken. Deze informatie helpt ons de website te verbeteren.</p>
                            </div>
                            <label class="cookie-option__toggle">
                                <input type="checkbox" id="analyticsCookies">
                                <span class="cookie-option__toggle-slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option__info">
                                <h4 class="cookie-option__title">Functionele cookies</h4>
                                <p class="cookie-option__description">Deze cookies onthouden uw voorkeuren en helpen bij het personaliseren van uw websitebezoek.</p>
                            </div>
                            <label class="cookie-option__toggle">
                                <input type="checkbox" id="functionalCookies">
                                <span class="cookie-option__toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="cookie-settings-modal__actions">
                        <button class="cookie-banner__button cookie-banner__button--settings" id="saveCookieSettings">Instellingen opslaan</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('closeCookieSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveCookieSettings').addEventListener('click', () => this.saveSettings());

        // Close modal when clicking outside
        document.getElementById('cookieSettingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'cookieSettingsModal') {
                this.closeSettings();
            }
        });

        // Load saved preferences
        const savedConsent = this.getCookie(this.cookieName);
        if (savedConsent) {
            const preferences = JSON.parse(savedConsent);
            document.getElementById('analyticsCookies').checked = preferences.analytics;
            document.getElementById('functionalCookies').checked = preferences.functional;
        }
    }

    checkCookieConsent() {
        const consent = this.getCookie(this.cookieName);
        if (!consent) {
            document.getElementById('cookieBanner').classList.add('visible');
        }
    }

    acceptAllCookies() {
        const preferences = {
            necessary: true,
            analytics: true,
            functional: true
        };
        this.setConsent(preferences);
        this.hideBanner();
        this.applyPreferences(preferences);
    }

    openSettings() {
        document.getElementById('cookieSettingsModal').classList.add('visible');
    }

    closeSettings() {
        document.getElementById('cookieSettingsModal').classList.remove('visible');
    }

    saveSettings() {
        const preferences = {
            necessary: true, // Always enabled
            analytics: document.getElementById('analyticsCookies').checked,
            functional: document.getElementById('functionalCookies').checked
        };
        this.setConsent(preferences);
        this.closeSettings();
        this.hideBanner();
        this.applyPreferences(preferences);
    }

    setConsent(preferences) {
        this.setCookie(this.cookieName, JSON.stringify(preferences), this.cookieExpiry);
    }

    hideBanner() {
        document.getElementById('cookieBanner').classList.remove('visible');
    }

    applyPreferences(preferences) {
        // Apply analytics cookies preference
        if (preferences.analytics) {
            // Initialize Google Analytics
            if (typeof ga === 'undefined') {
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                
                ga('create', 'UA-XXXXX-Y', 'auto'); // Replace with your GA ID
                ga('send', 'pageview');
            }
        } else {
            // Remove analytics cookies
            this.deleteCookie('_ga');
            this.deleteCookie('_gid');
        }

        // Apply functional cookies preference
        if (preferences.functional) {
            // Initialize functional cookies
        } else {
            // Remove functional cookies
            this.deleteCookie('language_pref');
        }
    }

    // Cookie utility functions
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
});
