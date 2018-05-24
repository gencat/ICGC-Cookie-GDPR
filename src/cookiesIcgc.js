// @flow
"use strict";

const Cookieconsent = require("./cookieconsent");
const CookieManager = require("./cookieManager");
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
		
		const mainOptions = Object.assign({}, defaultOptions, options);

		mainOptions.cookie.domain = domain;
		mainOptions.onInitialise = this.onInit;
		mainOptions.onStatusChange = this.onChange;
		mainOptions.onRevokeChoice = this.onRevoke;
		mainOptions.onPopupOpen = this.onOpen;

		this.areCookiesEnabled = false;
		this.gaDisablePrefix = "ga-disable-";
		this.gaIds = gaIds;
		this.cookiesEnabledHandler = null;
		this.cookiesDisabledHandler = null;
		this.cookieconsent = new Cookieconsent(mainOptions);
		
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

	}

	/**
	 * Callback called when the cookie consent status has changed.
	 * Enables the cookies if needed
	 */
	onChange() {

		if (this.hasConsented()) {
		
			this.enableCookies();

		}

	}

	/**
	 * Callback called when the cookie consent has been revoked.
	 * Disables the cookies
	 */
	onRevoke() {

		this.disableCookies();

	}

	/**
	 * Callback called when the cookie consent popup open.
	 * Show the popup
	 */
	onOpen() {

		this.disableCookies();

	}

	/**
	 * Checks if the user has consented
	 * @returns {boolean}
	 */
	hasConsented() {

		const type = this.cookieconsent.options.type;
		const didConsent = this.cookieconsent.hasConsented();

		return type == 'opt-in' && didConsent

	}

	setCookiesEnableHandler(callback: Function){
		this.cookiesEnabledHandler = callback;
	}

	enableCookies() {
		this.areCookiesEnabled = true;
		if("true" === CookieManager.getCookie("gaEnable")){
			this.enableGA();
		}
		if(this.cookiesEnabledHandler){
			this.cookiesEnabledHandler();
		}
	}

 	setCookiesDisabledHandler(callback: Function){
		this.cookiesDisabledHandler = callback;
	}

	disableCookies() {

		const activeCookies = CookieManager.getAllCookies();
		this.disableGA();

		Object.keys(activeCookies).forEach(
			function(item) {
				CookieManager.deleteCookie(item);
			}
		);

		this.areCookiesEnabled = false;

		this.cookiesDisabledHandler();

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

		CookieManager.setCookie("gaEnable", "false", 365);

	}

	changeGAStatusToDisabled(shouldDisable: boolean) {

		this.gaIds.forEach(gaId => {

			window[`${this.gaDisablePrefix}${gaId}`] = shouldDisable;

		});

	}
	
}

module.exports = CookiesICGC;
