// @flow
"use strict";

const CookieConsent = require("./cookieconsent");
const CookieManager = require("./cookieManager");
const Utils = require("./utils");
const defaultOptions = require("./defaultOptions");


class CookiesICGC {

	gaIds: Array<String>;
	areCookiesEnabled: boolean;
	cookiesEnabledHandler: Function;
	cookiesDisabledHandler: Function;

	/**
	 * A `CookiesICGC` object represents the object that manages the cookie consent under the European GDPR law
	 * disabling Google Analytics cookies if needed
	 *
	 * @param {String} domain The domain that sets the cookie.
	 * @param {Array<String>} gaIds An array with the Google Analytics ids
	 * @param {Object} options Optional options
	 * @example
	 * var cookies = new CookiesICGC("www.instamaps.cat", ["UA-12345678-1"], {position: "top", content { message: "Vols cookies?" }});
	 */
	constructor(domain: String, gaIds: Array<String>, options: ?Object) {

		const mainOptions = Utils.deepMerge({}, defaultOptions, options);

		mainOptions.cookie.domain = domain;
		mainOptions.onInitialise = () => {

			this.onInit();

		};
		mainOptions.onStatusChange = () => {

			this.onChange();

		};
		mainOptions.onResetConfig =  () => {

			this.onResetConfig();

		};

		this.areCookiesEnabled = false;
		this.gaDisablePrefix = "ga-disable-";
		this.gaIds = gaIds;
		this.cookiesEnabledHandler = null;
		this.cookiesDisabledHandler = null;
		this.cookieConsent = new CookieConsent(mainOptions);

		this.onInit();

		if (!this.hasAnswered()) {

			this.cookieConsent.createPopup();

		} else {

			this.cookieConsent.createConfigButton();

		}

	}

	/**
	 * Callback called when the cookie consent has been initialized.
	 * Enables or disables the cookies depending on if the user has consented or not
	 */
	onInit() {

		if (this.hasConsented()) {

			this.enableCookies();

		} else {

			this.disableCookies();

		}

		this.cookieConsent.onInit();

	}

	/**
	 * Callback called when the cookie consent status has changed.
	 * Enables the cookies if needed
	 */
	onChange() {

		if (this.hasConsented()) {

			CookieManager.setCookie("gaEnable", "true", 365);
			this.enableCookies();

			if (this.cookiesEnabledHandler) {

				this.cookiesEnabledHandler();

			}

		} else if (this.cookiesDisabledHandler) {

			this.cookiesDisabledHandler();

		}

	}

	/**
	 * Callback called when the cookie config has been reset.
	 * Disables the cookies
	 */
	onResetConfig() {

		this.deleteCookies();
		this.cookieConsent.createPopup();

	}

	/**
	 * Checks if the user has consented
	 * @returns {boolean}
	 */
	hasConsented() {

		return this.cookieConsent.hasConsented();

	}

	/**
	 * Checks if the user has answered
	 * @returns {boolean}
	 */
	hasAnswered() {

		return this.cookieConsent.hasAnswered();

	}

	setCookiesEnabledHandler(callback: Function) {

		this.cookiesEnabledHandler = callback;

	}

	enableCookies() {

		this.areCookiesEnabled = true;
		this.enableGA();

	}

	setCookiesDisabledHandler(callback: Function) {

		this.cookiesDisabledHandler = callback;

	}

	deleteCookies() {

		const activeCookies = CookieManager.getAllCookies();
		Object.keys(activeCookies).forEach(
			(item) => {

				CookieManager.deleteCookie(item);

			}
		);

	}

	disableCookies() {

		this.disableGA();

		this.areCookiesEnabled = false;

	}

	areCookiesEnabled() {

		return this.areCookiesEnabled;

	}

	enableGA() {

		this.changeGAStatusToDisabled(false);

		CookieManager.setCookie("gaEnable", "true", 365);

	}

	disableGA() {

		this.changeGAStatusToDisabled(true);

		if (CookieManager.hasCookie("gaEnable")) {

			CookieManager.setCookie("gaEnable", "false", 365);

		}

	}

	changeGAStatusToDisabled(shouldDisable: boolean) {

		this.gaIds.forEach(gaId => {

			// eslint-disable-next-line no-undef
			window[`${this.gaDisablePrefix}${gaId}`] = shouldDisable;

		});

	}

}

module.exports = CookiesICGC;
