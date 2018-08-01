"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
	if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
		module.exports = f();
	} else if (typeof define === "function" && define.amd) {
		define([], f);
	} else {
		var g;if (typeof window !== "undefined") {
			g = window;
		} else if (typeof global !== "undefined") {
			g = global;
		} else if (typeof self !== "undefined") {
			g = self;
		} else {
			g = this;
		}g.icgc = f();
	}
})(function () {
	var define, module, exports;return function () {
		function r(e, n, t) {
			function o(i, f) {
				if (!n[i]) {
					if (!e[i]) {
						var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
					}var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
						var n = e[i][1][r];return o(n || r);
					}, p, p.exports, r, e, n, t);
				}return n[i].exports;
			}for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
				o(t[i]);
			}return o;
		}return r;
	}()({ 1: [function (require, module, exports) {
			module.exports = {
				"version": "0.0.1"
			};
		}, {}], 2: [function (require, module, exports) {
			//      
			"use strict";

			var CookieManager = function CookieManager() {};

			CookieManager.getCookie = function getCookie(name) {

				// eslint-disable-next-line no-undef
				var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
				return v ? v[2] : null;
			};

			CookieManager.hasCookie = function hasCookie(name) {

				return CookieManager.getCookie(name) !== null;
			};

			/**
   	 * Set the cookie value
   	 * @param {String} name The name of the cookie.
   	 * @param {String} value The value of the cookie.
   	 * @param {String} days The numbers of days to expire the cookie.
   	 */
			CookieManager.setCookie = function setCookie(name, value, days, domain, path) {

				var d = new Date();
				d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
				var cookie = name + "=" + value + ";expires=" + d.toGMTString();
				if (path) {

					cookie += ";path=" + path;
				} else {

					cookie += ";path=/";
				}
				if (domain) {

					cookie += ";domain=" + domain;
				}

				// eslint-disable-next-line no-undef
				document.cookie = cookie;
			};

			/**
   	 * Delete the cookies
   	 * @param {String} name The name of the cookie.
   	 */
			CookieManager.deleteCookie = function deleteCookie(name, domain, path) {

				this.setCookie(name, "", -1, domain, path);
			};

			/**
   	 * Get all cookies
   	 * @returns {Object}
   	 */
			CookieManager.getAllCookies = function getAllCookies() {

				var cookies = {};

				// eslint-disable-next-line no-undef
				document.cookie.split(";").forEach(function (item) {

					var cookie = item.split("=");
					cookies[cookie[0]] = cookie[1];
				});
				return cookies;
			};

			module.exports = CookieManager;
		}, {}], 3: [function (require, module, exports) {
			//      
			"use strict";

			var defaultOptions = require("./defaultOptions");
			var cookieManager = require("./cookieManager");
			var Utils = require("./utils");
			var Popup = require("./popup");

			var Cookieconsent = function Cookieconsent(options) {

				this.status = {
					deny: "deny",
					allow: "allow"
				};

				// set options back to default options
				this.options = defaultOptions;

				// merge in user options
				if (Utils.isPlainObject(options)) {

					_extends(this.options, options);
				}

				// eslint-disable-next-line no-warning-comments
				// TODO: navigator and document shouldn't be used here
				// eslint-disable-next-line no-undef
				this.options.userAgent = navigator.userAgent;
				this.options.isMobile = Utils.isMobile(this.options.userAgent);
			};

			Cookieconsent.prototype.createPopup = function createPopup() {
				var this$1 = this;

				return new Promise(function (resolve) {

					var popup = new Popup(this$1.options);
					popup.setAllowHandler(function () {

						this$1.setStatus(this$1.status.allow);
						popup.close();
					});

					popup.setDenyHandler(function () {

						this$1.setStatus(this$1.status.deny);
						popup.close();
					});

					resolve(popup);
				});
			};

			// returns true if the cookie has a valid value
			Cookieconsent.prototype.hasAnswered = function hasAnswered() {

				return Object.keys(this.status).indexOf(this.getStatus()) >= 0;
			};

			// returns true if the cookie indicates that consent has been given
			Cookieconsent.prototype.hasConsented = function hasConsented() {

				var val = this.getStatus();
				return val === this.status.allow;
			};

			Cookieconsent.prototype.setStatus = function setStatus(status) {

				var c = this.options.cookie;
				var value = cookieManager.getCookie(c.name);
				var chosenBefore = Object.keys(this.status).indexOf(value) >= 0;

				// if `status` is valid
				if (Object.keys(this.status).indexOf(status) >= 0) {

					cookieManager.setCookie(c.name, status, c.expiryDays, c.domain, c.path);

					this.createConfigButton();
					this.options.onStatusChange.call(this, status, chosenBefore);
				} else {

					this.clearStatus();
				}
			};

			Cookieconsent.prototype.getStatus = function getStatus() {

				return cookieManager.getCookie(this.options.cookie.name);
			};

			Cookieconsent.prototype.clearStatus = function clearStatus() {

				var c = this.options.cookie;
				cookieManager.deleteCookie(c.name, c.domain, c.path);
			};

			Cookieconsent.prototype.onInit = function onInit() {

				if (this.hasAnswered()) {

					this.createConfigButton();
				}
			};

			Cookieconsent.prototype.createConfigButton = function createConfigButton() {
				var this$1 = this;

				var id = this.options.configBtnSelector;
				var buttonHTML = this.options.configBtn;
				// eslint-disable-next-line no-undef
				var parent = document.body;
				var btnClass = "config-popup";

				if (id.trim() !== "") {

					// eslint-disable-next-line no-undef
					var divElem = document.querySelector(id);
					// eslint-disable-next-line no-undef
					parent = !divElem ? document.body : divElem;
					btnClass = "";
				}

				buttonHTML = buttonHTML.replace("{{config-text}}", this.options.content.config);
				buttonHTML = buttonHTML.replace("{{config-class}}", btnClass);
				// eslint-disable-next-line no-undef
				var elem = document.createElement("div");
				elem.id = "cc-config-parent";
				elem.innerHTML = buttonHTML;
				parent.appendChild(elem);

				// eslint-disable-next-line no-undef
				document.querySelector(".cc-config").addEventListener("click", function () {
					return this$1.onResetConfig();
				});
			};

			Cookieconsent.prototype.removeConfigButton = function removeConfigButton() {

				// eslint-disable-next-line no-undef
				var btn = document.querySelector("#cc-config-parent");

				if (btn) {

					btn.remove();
				}
			};

			Cookieconsent.prototype.onResetConfig = function onResetConfig() {

				this.removeConfigButton();
				this.options.onResetConfig();
			};

			module.exports = Cookieconsent;
		}, { "./cookieManager": 2, "./defaultOptions": 5, "./popup": 7, "./utils": 8 }], 4: [function (require, module, exports) {
			//      
			"use strict";

			var CookieConsent = require("./cookieconsent");
			var CookieManager = require("./cookieManager");
			var Utils = require("./utils");
			var defaultOptions = require("./defaultOptions");

			var CookiesICGC = function CookiesICGC(domain, gaIds, options) {
				var this$1 = this;

				var mainOptions = Utils.deepMerge({}, defaultOptions, options);

				mainOptions.cookie.domain = domain;
				mainOptions.onInitialise = function () {

					this$1.onInit();
				};
				mainOptions.onStatusChange = function () {

					this$1.onChange();
				};
				mainOptions.onResetConfig = function () {

					this$1.onResetConfig();
				};

				this.areCookiesEnabled = false;
				this.gaDisablePrefix = "ga-disable-";
				this.gaIds = gaIds;
				this.cookiesEnabledHandler = null;
				this.cookiesDisabledHandler = null;
				this.removeGACookies = mainOptions.removeGACookies;
				this.cookieConsent = new CookieConsent(mainOptions);

				this.onInit();

				if (!this.hasAnswered()) {

					this.cookieConsent.createPopup();
				}
			};

			/**
   	 * Callback called when the cookie consent has been initialized.
   	 * Enables or disables the cookies depending on if the user has consented or not
   	 */
			CookiesICGC.prototype.onInit = function onInit() {

				if (this.hasConsented()) {

					this.enableCookies();
				} else {

					this.disableCookies();
				}

				this.cookieConsent.onInit();
			};

			/**
   	 * Callback called when the cookie consent status has changed.
   	 * Enables the cookies if needed
   	 */
			CookiesICGC.prototype.onChange = function onChange() {

				if (this.hasConsented()) {

					CookieManager.setCookie("gaEnable", "true", 365);
					this.enableCookies();
				} else {

					this.disableCookies();
				}
			};

			/**
   	 * Callback called when the cookie config has been reset.
   	 * Disables the cookies
   	 */
			CookiesICGC.prototype.onResetConfig = function onResetConfig() {

				this.deleteCookies();
				this.cookieConsent.createPopup();
			};

			/**
   	 * Checks if the user has consented
   	 * @returns {boolean}
   	 */
			CookiesICGC.prototype.hasConsented = function hasConsented() {

				return this.cookieConsent.hasConsented();
			};

			/**
   	 * Checks if the user has answered
   	 * @returns {boolean}
   	 */
			CookiesICGC.prototype.hasAnswered = function hasAnswered() {

				return this.cookieConsent.hasAnswered();
			};

			CookiesICGC.prototype.setCookiesEnabledHandler = function setCookiesEnabledHandler(callback) {

				this.cookiesEnabledHandler = callback;
			};

			CookiesICGC.prototype.enableCookies = function enableCookies() {

				this.areCookiesEnabled = true;

				if (this.removeGACookies) {

					this.enableGA();
				}

				if (this.cookiesEnabledHandler) {

					this.cookiesEnabledHandler();
				}
			};

			CookiesICGC.prototype.setCookiesDisabledHandler = function setCookiesDisabledHandler(callback) {

				this.cookiesDisabledHandler = callback;
			};

			CookiesICGC.prototype.deleteCookies = function deleteCookies() {

				var activeCookies = CookieManager.getAllCookies();
				Object.keys(activeCookies).forEach(function (item) {

					CookieManager.deleteCookie(item);
				});
			};

			CookiesICGC.prototype.disableCookies = function disableCookies() {

				if (this.removeGACookies) {

					this.disableGA();
				}

				this.areCookiesEnabled = false;

				if (this.cookiesDisabledHandler) {

					this.cookiesDisabledHandler();
				}
			};

			CookiesICGC.prototype.areCookiesEnabled = function areCookiesEnabled() {

				return this.areCookiesEnabled;
			};

			CookiesICGC.prototype.enableGA = function enableGA() {

				this.changeGAStatusToDisabled(false);

				CookieManager.setCookie("gaEnable", "true", 365);
			};

			CookiesICGC.prototype.disableGA = function disableGA() {

				this.changeGAStatusToDisabled(true);

				if (CookieManager.hasCookie("gaEnable")) {

					CookieManager.setCookie("gaEnable", "false", 365);
				}
			};

			CookiesICGC.prototype.changeGAStatusToDisabled = function changeGAStatusToDisabled(shouldDisable) {
				var this$1 = this;

				this.gaIds.forEach(function (gaId) {

					// eslint-disable-next-line no-undef
					window["" + this$1.gaDisablePrefix + gaId] = shouldDisable;
				});
			};

			module.exports = CookiesICGC;
		}, { "./cookieManager": 2, "./cookieconsent": 3, "./defaultOptions": 5, "./utils": 8 }], 5: [function (require, module, exports) {
			//      
			"use strict";

			module.exports = {

				// optional (expecting a HTML element) if passed, the popup is appended to this element. default is `document.body`
				container: null,

				// defaults cookie options - it is RECOMMENDED to set these values to correspond with your server
				cookie: {
					// This is the name of this cookie - you can ignore this
					name: "cookieconsentICGC_status",

					// This is the url path that the cookie 'name' belongs to. The cookie can only be read at this location
					path: "/",

					// This is the domain that the cookie 'name' belongs to. The cookie can only be read on this domain.
					//  - Guide to cookie domains - http://erik.io/blog/2014/03/04/definitive-guide-to-cookie-domains/
					domain: "file",

					// The cookies expire date, specified in days (specify -1 for no expiry)
					expiryDays: 365
				},

				// each item defines the inner text for the element that it references
				content: {
					header: "Cookies utilitzades a la web!",
					message: "Utilitzem galetes per distingir-vos d'altres usuaris en els nostres webs, per millorar la informació i els serveis que us oferim, i per facilitar-vos l'accés. Per a més informació, consulteu la ",
					allow: "Acceptar",
					deny: "Rebutjar",
					link: "política de galetes",
					href: "http://www.icgc.cat/L-ICGC/Sobre-l-ICGC/Politiques/Politica-de-proteccio-de-dades-personals/Politica-de-galetes-cookies",
					close: "&#x274c;",
					config: "Configurar cookies"
				},

				// This is the HTML for the elements above. The string {{header}} will be replaced with the equivalent text below.
				// You can remove "{{header}}" and write the content directly inside the HTML if you want.
				//
				//  - ARIA rules suggest to ensure controls are tabbable (so the browser can find the first control),
				//    and to set the focus to the first interactive control (http://w3c.github.io/aria-in-html/)
				elements: {
					header: "<span class=\"cc-header\">{{header}}</span>&nbsp;",
					message: "<span id=\"cookieconsent:desc\" class=\"cc-message\">{{message}}</span>",
					messagelink: "<span id=\"cookieconsent:desc\" class=\"cc-message\">{{message}} <a aria-label=\"learn more about cookies\" role=button tabindex=\"0\" class=\"cc-link\" href=\"{{href}}\" rel=\"noopener noreferrer nofollow\" target=\"_blank\">{{link}}</a></span>",
					allow: "<a aria-label=\"allow cookies\" role=button tabindex=\"0\"  class=\"cc-btn cc-allow\">{{allow}}</a>",
					deny: "<a aria-label=\"deny cookies\" role=button tabindex=\"0\" class=\"cc-btn cc-deny\">{{deny}}</a>",
					link: "<a aria-label=\"learn more about cookies\" role=button tabindex=\"0\" class=\"cc-link\" href=\"{{href}}\" target=\"_blank\">{{link}}</a>",
					close: "<span aria-label=\"dismiss cookie message\" role=button tabindex=\"0\" class=\"cc-close\">{{close}}</span>"
				},

				// The placeholders {{classes}} and {{children}} both get replaced during initialisation:
				//  - {{classes}} is where additional classes get added
				//  - {{children}} is where the HTML children are placed
				window: "<div role=\"dialog\" aria-live=\"polite\" aria-label=\"cookieconsent\" aria-describedby=\"cookieconsent:desc\" class=\"cc-window {{classes}}\"><!--googleoff: all-->{{children}}<!--googleon: all--></div>",

				// This is the html for the config button. This only shows up after the user has selected their level of consent
				// It must include the cc-config class
				configBtn: "<div class=\"cc-config {{config-class}}\"><img src=\"https://gencat.github.io/ICGC-Cookie-GDPR/dist/cookie-icon-24.png\" style=\"margin-right: 5px;\"/>{{config-text}}</div>",

				// This is the element selector where the config button will be added
				configBtnSelector: "",

				// define types of 'compliance' here. '{{value}}' strings in here are linked to `elements`
				compliance: "<div class=\"cc-compliance cc-highlight\">{{deny}}{{allow}}</div>",

				// define layout layouts here
				layouts: {
					// the 'block' layout tend to be for square floating popups
					"basic": "{{messagelink}}{{compliance}}",
					"basic-close": "{{messagelink}}{{compliance}}{{close}}",
					"basic-header": "{{header}}{{message}}{{link}}{{compliance}}"
				},

				// default layout (see above)
				layout: "basic",

				// this refers to the popup windows position. we currently support:
				//  - banner positions: top, bottom
				//  - floating positions: top-left, top-right, bottom-left, bottom-right
				//
				// adds a class `cc-floating` or `cc-banner` which helps when styling
				position: "bottom", // default position is 'bottom'

				// Available styles
				//    -block (default, no extra classes)
				//    -edgeless
				//    -classic
				// use your own style name and use `.cc-theme-STYLENAME` class in CSS to edit.
				// Note: style "wire" is used for the configurator, but has no CSS styles of its own, only palette is used.
				theme: "block",

				// if you want custom colours, pass them in here. this object should look like this.
				// ideally, any custom colours/themes should be created in a separate style sheet, as this is more efficient.
				//   {
				//     popup: {background: '#000000', text: '#fff', link: '#fff'},
				//     button: {background: 'transparent', border: '#f8e71c', text: '#f8e71c'},
				//     highlight: {background: '#f8e71c', border: '#f8e71c', text: '#000000'},
				//   }
				// `highlight` is optional and extends `button`. if it exists, it will apply to the first button
				// only background needs to be defined for every element. if not set, other colors can be calculated from it
				palette: {
					popup: { background: "#222222" },
					button: { background: "#00b050" }
				},
				// Set this value to true if you need the Google Analytics cookies
				// to be disabled. Analytics can be anonimized so the cookies
				// don't have to be disabled. Take into account that if this value
				// is set to false (as it is by default), you should configure
				// google analytics to be anonimized
				removeGACookies: false
			};
		}, {}], 6: [function (require, module, exports) {
			//      
			"use strict";

			var version = require("../package.json").version;
			var CookiesICGC = require("./cookiesIcgc");

			module.exports = {
				version: version,
				CookiesICGC: CookiesICGC
			};

			/**
    * The version of the project in use as specified in `package.json`,
    * `CHANGELOG.md`, and the GitHub release.
    *
    * @var {string} version
    */
		}, { "../package.json": 1, "./cookiesIcgc": 4 }], 7: [function (require, module, exports) {
			//      
			"use strict";

			var Utils = require("./utils");

			var Popup = function Popup(options, statusList) {

				this.statusList = statusList;
				this.allowHandler = null;
				this.denyHandler = null;

				if (this.options) {

					this.destroy(); // already rendered
				}

				// set options back to default options
				this.options = options;

				// the full markup either contains the wrapper or it does not (for multiple instances)
				var cookiePopup = this.options.window.replace("{{classes}}", this.getPopupClasses().join(" ")).replace("{{children}}", this.getPopupInnerMarkup());

				this.element = this.appendMarkup(cookiePopup);

				this.open();
			};

			Popup.prototype.destroy = function destroy() {

				// eslint-disable-next-line no-undef
				document.querySelector(".cc-allow").removeEventListener("click", this.allowHandler);
				// eslint-disable-next-line no-undef
				document.querySelector(".cc-deny").removeEventListener("click", this.denyHandler);
				this.allowHandler = null;
				this.denyHandler = null;

				if (this.element && this.element.parentNode) {

					this.element.parentNode.removeChild(this.element);
				}
				this.element = null;

				this.options = null;
			};

			Popup.prototype.open = function open() {

				if (!this.element) {

					return;
				}

				if (!this.isOpen()) {

					this.element.style.display = "";

					Utils.removeClass(this.element, "cc-invisible");

					if (this.options.onPopupOpen) {

						this.options.onPopupOpen();
					}
				}

				return this;
			};

			Popup.prototype.close = function close() {

				if (!this.element) {

					return;
				}

				if (this.isOpen()) {

					this.element.style.display = "none";

					if (this.options.onPopupClose) {

						this.options.onPopupClose();
					}
				}

				return this;
			};

			Popup.prototype.isOpen = function isOpen() {

				return this.element && this.element.style.display === "" && !Utils.hasClass(this.element, "cc-invisible");
			};

			Popup.prototype.getPositionClasses = function getPositionClasses() {

				var positions = this.options.position.split("-"); // top, bottom, left, right
				var classes = [];

				// top, left, right, bottom
				positions.forEach(function (cur) {

					classes.push("cc-" + cur);
				});

				return classes;
			};

			Popup.prototype.getPopupClasses = function getPopupClasses() {

				var opts = this.options;
				var positionStyle = opts.position === "top" || opts.position === "bottom" ? "banner" : "floating";

				if (opts.isMobile) {

					positionStyle = "floating";
				}

				var classes = ["cc-" + positionStyle, // floating or banner
				"cc-type-opt-in", // add the compliance type
				"cc-theme-" + opts.theme];

				if (opts.static) {

					classes.push("cc-static");
				}

				classes.push.apply(classes, this.getPositionClasses());

				// we only add extra styles if `palette` has been set to a valid value
				this.attachCustomPalette(this.options.palette);

				// if we override the palette, add the class that enables this
				if (this.customStyleSelector) {

					classes.push(this.customStyleSelector);
				}

				return classes;
			};

			Popup.prototype.getPopupInnerMarkup = function getPopupInnerMarkup() {

				var interpolated = {};
				var opts = this.options;

				Object.keys(opts.elements).forEach(function (prop) {

					interpolated[prop] = Utils.interpolateString(opts.elements[prop], function (name) {

						var str = opts.content[name];
						return name && typeof str == "string" && str.length ? str : "";
					});
				});

				// checks if the type is valid and defaults to info if it's not
				var complianceType = opts.compliance;

				// build the compliance types from the already interpolated `elements`
				interpolated.compliance = Utils.interpolateString(complianceType, function (name) {

					return interpolated[name];
				});

				// checks if the layout is valid and defaults to basic if it's not
				var layout = opts.layouts[opts.layout];
				if (!layout) {

					layout = opts.layouts.basic;
				}

				return Utils.interpolateString(layout, function (match) {

					return interpolated[match];
				});
			};

			Popup.prototype.appendMarkup = function appendMarkup(markup) {

				var opts = this.options;
				// eslint-disable-next-line no-undef
				var div = document.createElement("div");
				// eslint-disable-next-line no-undef
				var cont = opts.container && opts.container.nodeType === 1 ? opts.container : document.body;

				div.innerHTML = markup;

				var el = div.children[0];

				el.style.display = "none";

				if (Utils.hasClass(el, "cc-window")) {

					Utils.addClass(el, "cc-invisible");
				}

				if (!cont.firstChild) {

					cont.appendChild(el);
				} else {

					cont.insertBefore(el, cont.firstChild);
				}

				return el;
			};

			Popup.prototype.setAllowHandler = function setAllowHandler(callback) {

				// eslint-disable-next-line no-undef
				document.querySelector(".cc-allow").removeEventListener("click", this.allowHandler);
				this.allowHandler = callback;
				// eslint-disable-next-line no-undef
				document.querySelector(".cc-allow").addEventListener("click", callback);
			};

			Popup.prototype.setDenyHandler = function setDenyHandler(callback) {

				// eslint-disable-next-line no-undef
				document.querySelector(".cc-deny").removeEventListener("click", this.denyHandler);
				this.denyHandler = callback;
				// eslint-disable-next-line no-undef
				document.querySelector(".cc-deny").addEventListener("click", callback);
			};

			// I might change this function to use inline styles. I originally chose a stylesheet because I could select many elements with a
			// single rule (something that happened a lot), the apps has changed slightly now though, so inline styles might be more applicable.
			Popup.prototype.attachCustomPalette = function attachCustomPalette(palette) {

				var hash = Utils.hash(JSON.stringify(palette));
				var selector = "cc-color-override-" + hash;
				var isValid = Utils.isPlainObject(palette);

				this.customStyleSelector = isValid ? selector : null;

				if (isValid) {

					this.addCustomStyle(hash, palette, "." + selector);
				}
				return isValid;
			};

			Popup.prototype.addCustomStyle = function addCustomStyle(hash, palette, prefix) {

				var colorStyles = {};
				var popup = palette.popup;
				var button = palette.button;
				var highlight = palette.highlight;

				// needs background colour, text and link will be set to black/white if not specified
				if (popup) {

					// assumes popup.background is set
					popup.text = popup.text ? popup.text : Utils.getContrast(popup.background);
					popup.link = popup.link ? popup.link : popup.text;
					colorStyles[prefix + ".cc-window"] = ["color: " + popup.text, "background-color: " + popup.background];
					colorStyles[prefix + " .cc-link," + prefix + " .cc-link:active," + prefix + " .cc-link:visited"] = ["color: " + popup.link];

					if (button) {

						// assumes button.background is set
						button.text = button.text ? button.text : Utils.getContrast(button.background);
						button.border = button.border ? button.border : "transparent";
						colorStyles[prefix + " .cc-btn"] = ["color: " + button.text, "border-color: " + button.border, "background-color: " + button.background];

						if (button.background !== "transparent") {

							colorStyles[prefix + " .cc-btn:hover, " + prefix + " .cc-btn:focus"] = ["background-color: " + Utils.getHoverColour(button.background)];
						}

						if (highlight) {

							//assumes highlight.background is set
							highlight.text = highlight.text ? highlight.text : Utils.getContrast(highlight.background);
							highlight.border = highlight.border ? highlight.border : "transparent";
							colorStyles[prefix + " .cc-highlight .cc-btn:first-child"] = ["color: " + highlight.text, "border-color: " + highlight.border, "background-color: " + highlight.background];
						} else {

							// sets highlight text color to popup text. background and border are transparent by default.
							colorStyles[prefix + " .cc-highlight .cc-btn:first-child"] = ["color: " + popup.text];
						}
					}
				}

				// this will be interpretted as CSS. the key is the selector, and each array element is a rule
				// eslint-disable-next-line no-undef
				var style = document.createElement("style");
				// eslint-disable-next-line no-undef
				document.head.appendChild(style);
				var ruleIndex = -1;
				for (var prop in colorStyles) {

					style.sheet.insertRule(prop + "{" + colorStyles[prop].join(";") + "}", ++ruleIndex);
				}
			};

			module.exports = Popup;
		}, { "./utils": 8 }], 8: [function (require, module, exports) {
			//      
			"use strict";

			var Utils = function Utils() {};

			Utils.escapeRegExp = function escapeRegExp(str) {

				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			};

			Utils.hasClass = function hasClass(element, selector) {

				var s = " ";
				var classFound = (s + element.className + s).replace(/[\n\t]/g, s).indexOf(s + selector + s) >= 0;
				// eslint-disable-next-line no-undef
				return element.nodeType === Node.ELEMENT_NODE && classFound;
			};

			Utils.addClass = function addClass(element, className) {

				element.className += " " + className;
			};

			Utils.removeClass = function removeClass(element, className) {

				var regex = new RegExp("\\b" + Utils.escapeRegExp(className) + "\\b");
				element.className = element.className.replace(regex, "");
			};

			Utils.interpolateString = function interpolateString(str, callback) {

				var marker = /{{([a-z][a-z0-9\-_]*)}}/ig;
				return str.replace(marker, function () {

					return callback(arguments[1]) || "";
				});
			};

			// only used for hashing json objects (used for hash mapping palette objects, used when custom colours are passed through JavaScript)
			Utils.hash = function hash(str) {

				var hash = 0,
				    i,
				    chr,
				    len;
				if (str.length === 0) {

					return hash;
				}
				for (i = 0, len = str.length; i < len; ++i) {

					chr = str.charCodeAt(i);
					hash = (hash << 5) - hash + chr;
					hash |= 0;
				}
				return hash;
			};

			Utils.normaliseHex = function normaliseHex(hex) {

				if (hex[0] === "#") {

					hex = hex.substr(1);
				}
				if (hex.length === 3) {

					hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				}
				return hex;
			};

			// used to get text colors if not set
			Utils.getContrast = function getContrast(hex) {

				hex = Utils.normaliseHex(hex);
				var r = parseInt(hex.substr(0, 2), 16);
				var g = parseInt(hex.substr(2, 2), 16);
				var b = parseInt(hex.substr(4, 2), 16);
				var yiq = (r * 299 + g * 587 + b * 114) / 1000;
				return yiq >= 128 ? "#000" : "#fff";
			};

			// used to change color on highlight
			Utils.getLuminance = function getLuminance(hex) {

				var num = parseInt(Utils.normaliseHex(hex), 16),
				    amt = 38,
				    R = (num >> 16) + amt,
				    B = (num >> 8 & 0x00FF) + amt,
				    G = (num & 0x0000FF) + amt;
				var newColour = (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
				return "#" + newColour;
			};

			Utils.getHoverColour = function getHoverColour(hex) {

				hex = Utils.normaliseHex(hex);
				// for black buttons
				if (hex === "000000") {

					return "#222";
				}
				return Utils.getLuminance(hex);
			};

			Utils.isMobile = function isMobile(userAgent) {

				return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
				);
			};

			Utils.isPlainObject = function isPlainObject(obj) {

				// The code "typeof obj === 'object' && obj !== null" allows Array objects
				return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null && obj.constructor === Object;
			};

			Utils.arrayContainsMatches = function arrayContainsMatches(array, search) {

				for (var i = 0, l = array.length; i < l; ++i) {

					var str = array[i];
					// if regex matches or string is equal, return true
					if (str instanceof RegExp && str.test(search) || typeof str == "string" && str.length && str === search) {

						return true;
					}
				}
				return false;
			};

			/**
   	 * Merges all the enumerable properties of source objects into the target
   	 * object. Subobjects are also merged
   	 *
   	 * @param {Object} target The target object
   	 * @param {Object} sources A list of source objects
   	 * @returns {Object} The target object
   	 */
			// eslint-disable-next-line no-unused-vars
			Utils.deepMerge = function deepMerge(target) {
				var sources = [],
				    len = arguments.length - 1;
				while (len-- > 0) {
					sources[len] = arguments[len + 1];
				}var newObj = target;
				// arguments is not an Array, it's Array-like!
				var newSources = Array.prototype.slice.call(arguments, 1);

				newSources.forEach(function (source) {

					newObj = Utils.singleDeepMerge(newObj, source);
				});

				return newObj;
			};

			/**
   	 * Merges all the enumerable properties of a source objects into the target
   	 * object. Subobjects are also merged
   	 *
   	 * @param {Object} target The target object
   	 * @param {Object} source The source object to merge
   	 * @returns {Object} The target object
   	 */
			Utils.singleDeepMerge = function singleDeepMerge(target, source) {

				for (var prop in source) {

					// Check if it's an enumerable property so we don't
					// overwrite properties like length or functions
					if (source.propertyIsEnumerable(prop)) {

						var sourceValue = source[prop];
						var targetValue = target[prop];

						if (!targetValue) {

							targetValue = {};
						}

						if (Array.isArray(sourceValue)) {

							sourceValue = sourceValue.slice(0);
						} else if ((typeof sourceValue === "undefined" ? "undefined" : _typeof(sourceValue)) === "object" && !Array.isArray(targetValue)) {

							sourceValue = Utils.singleDeepMerge(targetValue, sourceValue);
						} else if ((typeof sourceValue === "undefined" ? "undefined" : _typeof(sourceValue)) === "object" && Array.isArray(targetValue)) {

							sourceValue = Utils.singleDeepMerge({}, sourceValue);
						}

						target[prop] = sourceValue;
					}
				}
				return target;
			};

			module.exports = Utils;
		}, {}] }, {}, [6])(6);
});
