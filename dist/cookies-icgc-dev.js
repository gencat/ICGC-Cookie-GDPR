(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.icgc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "version": "0.0.1"
}
},{}],2:[function(require,module,exports){
//      
"use strict";

var CookieManager = function CookieManager () {};

CookieManager.getCookie = function getCookie (name        ) {

	// eslint-disable-next-line no-undef
	var v = document.cookie.match(("(^|;) ?" + name + "=([^;]*)(;|$)"));
	return v ? v[2] : null;

};

CookieManager.hasCookie = function hasCookie (name        ) {

	return CookieManager.getCookie(name) !== null;

};

/**
	 * Set the cookie value
	 * @param {String} name The name of the cookie.
	 * @param {String} value The value of the cookie.
	 * @param {String} days The numbers of days to expire the cookie.
	 */
CookieManager.setCookie = function setCookie (name        , value        , days        , domain         , path         ) {

	var d = new Date();
	d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
	var cookie = name + "=" + value + ";expires=" + (d.toGMTString());
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
CookieManager.deleteCookie = function deleteCookie (name        , domain         , path         ) {

	this.setCookie(name, "", -1, domain, path);

};

/**
	 * Get all cookies
	 * @returns {Object}
	 */
CookieManager.getAllCookies = function getAllCookies () {

	var cookies = {};

	// eslint-disable-next-line no-undef
	document.cookie.split(";").forEach(function (item){

		var cookie = item.split("=");
		cookies[cookie[0]] = cookie[1];

	});
	return cookies;

};

module.exports = CookieManager;
},{}],3:[function(require,module,exports){
//      
"use strict";
var defaultOptions = require("./defaultOptions");
var cookieManager = require("./cookieManager");
var Utils = require("./utils");
var Popup = require("./popup");

var Cookieconsent = function Cookieconsent(options        ) {

	this.status = {
		deny: "deny",
		allow: "allow"
	};

	// set options back to default options
	this.options = defaultOptions;

	// merge in user options
	if (Utils.isPlainObject(options)) {

		Object.assign(this.options, options);

	}

	// eslint-disable-next-line no-warning-comments
	// TODO: navigator and document shouldn't be used here
	// eslint-disable-next-line no-undef
	this.options.userAgent = navigator.userAgent;
	this.options.isMobile = Utils.isMobile(this.options.userAgent);

};

Cookieconsent.prototype.createPopup = function createPopup () {
		var this$1 = this;


	return new Promise(function (resolve) {

		var popup = new Popup(this$1.options);
		popup.setAllowHandler(function (){

			this$1.setStatus(this$1.status.allow);
			popup.close();

		});

		popup.setDenyHandler(function (){

			this$1.setStatus(this$1.status.deny);
			popup.close();

		});

		resolve(popup);

	});

};

// returns true if the cookie has a valid value
Cookieconsent.prototype.hasAnswered = function hasAnswered () {

	return Object.keys(this.status).indexOf(this.getStatus()) >= 0;

};

// returns true if the cookie indicates that consent has been given
Cookieconsent.prototype.hasConsented = function hasConsented () {

	var val = this.getStatus();
	return val === this.status.allow;

};

Cookieconsent.prototype.setStatus = function setStatus (status) {

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

Cookieconsent.prototype.getStatus = function getStatus () {

	return cookieManager.getCookie(this.options.cookie.name);

};

Cookieconsent.prototype.clearStatus = function clearStatus () {

	var c = this.options.cookie;
	cookieManager.deleteCookie(c.name, c.domain, c.path);

};

Cookieconsent.prototype.onInit = function onInit () {

	if (this.hasAnswered()) {

		this.createConfigButton();

	}

};

Cookieconsent.prototype.createConfigButton = function createConfigButton () {
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
		parent = (!divElem) ? document.body : divElem;
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
	document.querySelector(".cc-config").addEventListener("click", function () { return this$1.onResetConfig(); });

};

Cookieconsent.prototype.removeConfigButton = function removeConfigButton () {

	// eslint-disable-next-line no-undef
	var btn = document.querySelector("#cc-config-parent");

	if (btn) {

		btn.remove();

	}

};

Cookieconsent.prototype.onResetConfig = function onResetConfig () {

	this.removeConfigButton();
	this.options.onResetConfig();

};

module.exports = Cookieconsent;
},{"./cookieManager":2,"./defaultOptions":5,"./popup":7,"./utils":8}],4:[function(require,module,exports){
//      
"use strict";

var CookieConsent = require("./cookieconsent");
var CookieManager = require("./cookieManager");
var Utils = require("./utils");
var defaultOptions = require("./defaultOptions");


var CookiesICGC = function CookiesICGC(domain        , gaIds               , options         ) {
	var this$1 = this;


	var mainOptions = Utils.deepMerge({}, defaultOptions, options);

	mainOptions.cookie.domain = domain;
	mainOptions.onInitialise = function () {

		this$1.onInit();

	};
	mainOptions.onStatusChange = function () {

		this$1.onChange();

	};
	mainOptions.onResetConfig =  function () {

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
CookiesICGC.prototype.onInit = function onInit () {

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
CookiesICGC.prototype.onChange = function onChange () {

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
CookiesICGC.prototype.onResetConfig = function onResetConfig () {

	this.deleteCookies();
	this.cookieConsent.createPopup();

};

/**
	 * Checks if the user has consented
	 * @returns {boolean}
	 */
CookiesICGC.prototype.hasConsented = function hasConsented () {

	return this.cookieConsent.hasConsented();

};

/**
	 * Checks if the user has answered
	 * @returns {boolean}
	 */
CookiesICGC.prototype.hasAnswered = function hasAnswered () {

	return this.cookieConsent.hasAnswered();

};

CookiesICGC.prototype.setCookiesEnabledHandler = function setCookiesEnabledHandler (callback          ) {

	this.cookiesEnabledHandler = callback;

};

CookiesICGC.prototype.enableCookies = function enableCookies () {

	this.areCookiesEnabled = true;

	if (this.removeGACookies) {

		this.enableGA();

	}

	if (this.cookiesEnabledHandler) {

		this.cookiesEnabledHandler();

	}

};

CookiesICGC.prototype.setCookiesDisabledHandler = function setCookiesDisabledHandler (callback          ) {

	this.cookiesDisabledHandler = callback;

};

CookiesICGC.prototype.deleteCookies = function deleteCookies () {

	var activeCookies = CookieManager.getAllCookies();
	Object.keys(activeCookies).forEach(
		function (item) {

			CookieManager.deleteCookie(item);

		}
	);

};

CookiesICGC.prototype.disableCookies = function disableCookies () {

	if (this.removeGACookies) {

		this.disableGA();

	}

	this.areCookiesEnabled = false;

	if (this.cookiesDisabledHandler) {

		this.cookiesDisabledHandler();

	}

};

CookiesICGC.prototype.areCookiesEnabled = function areCookiesEnabled () {

	return this.areCookiesEnabled;

};

CookiesICGC.prototype.enableGA = function enableGA () {

	this.changeGAStatusToDisabled(false);

	CookieManager.setCookie("gaEnable", "true", 365);

};

CookiesICGC.prototype.disableGA = function disableGA () {

	this.changeGAStatusToDisabled(true);

	if (CookieManager.hasCookie("gaEnable")) {

		CookieManager.setCookie("gaEnable", "false", 365);

	}

};

CookiesICGC.prototype.changeGAStatusToDisabled = function changeGAStatusToDisabled (shouldDisable         ) {
		var this$1 = this;


	this.gaIds.forEach(function (gaId) {

		// eslint-disable-next-line no-undef
		window[("" + (this$1.gaDisablePrefix) + gaId)] = shouldDisable;

	});

};

module.exports = CookiesICGC;
},{"./cookieManager":2,"./cookieconsent":3,"./defaultOptions":5,"./utils":8}],5:[function(require,module,exports){
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
		expiryDays: 365,
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
		close: "<span aria-label=\"dismiss cookie message\" role=button tabindex=\"0\" class=\"cc-close\">{{close}}</span>",
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
		"basic-header": "{{header}}{{message}}{{link}}{{compliance}}",
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
	palette:{
		popup: {background: "#222222"},
		button: {background: "#00b050"}
	},
	// Set this value to true if you need the Google Analytics cookies
	// to be disabled. Analytics can be anonimized so the cookies
	// don't have to be disabled. Take into account that if this value
	// is set to false (as it is by default), you should configure
	// google analytics to be anonimized
	removeGACookies: false
};
},{}],6:[function(require,module,exports){
//      
"use strict";

var version         = require("../package.json").version;
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
},{"../package.json":1,"./cookiesIcgc":4}],7:[function(require,module,exports){
//      
"use strict";

var Utils = require("./utils");

var Popup = function Popup(options        , statusList        ) {

	this.statusList = statusList;
	this.allowHandler = null;
	this.denyHandler = null;

	if (this.options) {

		this.destroy(); // already rendered

	}

	// set options back to default options
	this.options = options;

	// the full markup either contains the wrapper or it does not (for multiple instances)
	var cookiePopup = this.options.window.replace("{{classes}}", this.getPopupClasses().join(" "))
		.replace("{{children}}", this.getPopupInnerMarkup());

	this.element = this.appendMarkup(cookiePopup);

	this.open();

};

Popup.prototype.destroy = function destroy () {

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

Popup.prototype.open = function open () {

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

Popup.prototype.close = function close () {

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

Popup.prototype.isOpen = function isOpen () {

	return this.element && this.element.style.display === "" && !Utils.hasClass(this.element, "cc-invisible");

};

Popup.prototype.getPositionClasses = function getPositionClasses () {

	var positions = this.options.position.split("-"); // top, bottom, left, right
	var classes = [];

	// top, left, right, bottom
	positions.forEach(function (cur) {

		classes.push(("cc-" + cur));

	});

	return classes;

};

Popup.prototype.getPopupClasses = function getPopupClasses () {

	var opts = this.options;
	var positionStyle = (opts.position === "top" || opts.position === "bottom") ? "banner" : "floating";

	if (opts.isMobile) {

		positionStyle = "floating";

	}

	var classes = [
		("cc-" + positionStyle), // floating or banner
		"cc-type-opt-in", // add the compliance type
		("cc-theme-" + (opts.theme)) ];

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

Popup.prototype.getPopupInnerMarkup = function getPopupInnerMarkup () {

	var interpolated = {};
	var opts = this.options;

	Object.keys(opts.elements).forEach(function (prop) {

		interpolated[prop] = Utils.interpolateString(opts.elements[prop], function (name) {

			var str = opts.content[name];
			return (name && typeof str == "string" && str.length) ? str : "";

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

Popup.prototype.appendMarkup = function appendMarkup (markup) {

	var opts = this.options;
	// eslint-disable-next-line no-undef
	var div = document.createElement("div");
	// eslint-disable-next-line no-undef
	var cont = (opts.container && opts.container.nodeType === 1) ? opts.container : document.body;

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

Popup.prototype.setAllowHandler = function setAllowHandler (callback          ) {

	// eslint-disable-next-line no-undef
	document.querySelector(".cc-allow").removeEventListener("click", this.allowHandler);
	this.allowHandler = callback;
	// eslint-disable-next-line no-undef
	document.querySelector(".cc-allow").addEventListener("click", callback);

};

Popup.prototype.setDenyHandler = function setDenyHandler (callback          ) {

	// eslint-disable-next-line no-undef
	document.querySelector(".cc-deny").removeEventListener("click", this.denyHandler);
	this.denyHandler = callback;
	// eslint-disable-next-line no-undef
	document.querySelector(".cc-deny").addEventListener("click", callback);

};

// I might change this function to use inline styles. I originally chose a stylesheet because I could select many elements with a
// single rule (something that happened a lot), the apps has changed slightly now though, so inline styles might be more applicable.
Popup.prototype.attachCustomPalette = function attachCustomPalette (palette) {

	var hash = Utils.hash(JSON.stringify(palette));
	var selector = "cc-color-override-" + hash;
	var isValid = Utils.isPlainObject(palette);

	this.customStyleSelector = isValid ? selector : null;

	if (isValid) {

		this.addCustomStyle(hash, palette, ("." + selector));

	}
	return isValid;

};

Popup.prototype.addCustomStyle = function addCustomStyle (hash, palette, prefix) {

	var colorStyles = {};
	var popup = palette.popup;
	var button = palette.button;
	var highlight = palette.highlight;

	// needs background colour, text and link will be set to black/white if not specified
	if (popup) {

		// assumes popup.background is set
		popup.text = popup.text ? popup.text : Utils.getContrast(popup.background);
		popup.link = popup.link ? popup.link : popup.text;
		colorStyles[(prefix + ".cc-window")] = [
			("color: " + (popup.text)),
			("background-color: " + (popup.background))
		];
		colorStyles[(prefix + " .cc-link," + prefix + " .cc-link:active," + prefix + " .cc-link:visited")] = [
			("color: " + (popup.link))
		];

		if (button) {

			// assumes button.background is set
			button.text = button.text ? button.text : Utils.getContrast(button.background);
			button.border = button.border ? button.border : "transparent";
			colorStyles[(prefix + " .cc-btn")] = [
				("color: " + (button.text)),
				("border-color: " + (button.border)),
				("background-color: " + (button.background))
			];

			if (button.background !== "transparent") {

				colorStyles[(prefix + " .cc-btn:hover, " + prefix + " .cc-btn:focus")] = [
					("background-color: " + (Utils.getHoverColour(button.background)))
				];

			}

			if (highlight) {

			//assumes highlight.background is set
				highlight.text = highlight.text ? highlight.text : Utils.getContrast(highlight.background);
				highlight.border = highlight.border ? highlight.border : "transparent";
				colorStyles[(prefix + " .cc-highlight .cc-btn:first-child")] = [
					("color: " + (highlight.text)),
					("border-color: " + (highlight.border)),
					("background-color: " + (highlight.background))
				];

			} else {

			// sets highlight text color to popup text. background and border are transparent by default.
				colorStyles[(prefix + " .cc-highlight .cc-btn:first-child")] = [
					("color: " + (popup.text))
				];

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

		style.sheet.insertRule((prop + "{" + (colorStyles[prop].join(";")) + "}"), ++ruleIndex);

	}

};

module.exports = Popup;
},{"./utils":8}],8:[function(require,module,exports){
//      
"use strict";

var Utils = function Utils () {};

Utils.escapeRegExp = function escapeRegExp (str        ) {

	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

};

Utils.hasClass = function hasClass (element        , selector        ) {

	var s = " ";
	var classFound = (s + element.className + s).replace(/[\n\t]/g, s).indexOf(s + selector + s) >= 0;
	// eslint-disable-next-line no-undef
	return element.nodeType === Node.ELEMENT_NODE && classFound;

};

Utils.addClass = function addClass (element        , className        ) {

	element.className += " " + className;

};

Utils.removeClass = function removeClass (element        , className        ) {

	var regex = new RegExp(("\\b" + (Utils.escapeRegExp(className)) + "\\b"));
	element.className = element.className.replace(regex, "");

};

Utils.interpolateString = function interpolateString (str        , callback          ) {

	var marker = /{{([a-z][a-z0-9\-_]*)}}/ig;
	return str.replace(marker, function() {

		return callback(arguments[1]) || "";

	});

};

// only used for hashing json objects (used for hash mapping palette objects, used when custom colours are passed through JavaScript)
Utils.hash = function hash (str        ) {

	var hash = 0,
		i, chr, len;
	if (str.length === 0) {

		return hash;

	}
	for (i = 0, len = str.length; i < len; ++i) {

		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;

	}
	return hash;

};

Utils.normaliseHex = function normaliseHex (hex        ) {

	if (hex[0] === "#") {

		hex = hex.substr(1);

	}
	if (hex.length === 3) {

		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

	}
	return hex;

};

// used to get text colors if not set
Utils.getContrast = function getContrast (hex        ) {

	hex = Utils.normaliseHex(hex);
	var r = parseInt(hex.substr(0, 2), 16);
	var g = parseInt(hex.substr(2, 2), 16);
	var b = parseInt(hex.substr(4, 2), 16);
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? "#000" : "#fff";

};

// used to change color on highlight
Utils.getLuminance = function getLuminance (hex        ) {

	var num = parseInt(Utils.normaliseHex(hex), 16),
		amt = 38,
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;
	var newColour = (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
	return ("#" + newColour);

};

Utils.getHoverColour = function getHoverColour (hex        ) {

	hex = Utils.normaliseHex(hex);
	// for black buttons
	if (hex === "000000") {

		return "#222";

	}
	return Utils.getLuminance(hex);

};

Utils.isMobile = function isMobile (userAgent        ) {

	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

};

Utils.isPlainObject = function isPlainObject (obj        ) {

	// The code "typeof obj === 'object' && obj !== null" allows Array objects
	return typeof obj === "object" && obj !== null && obj.constructor === Object;

};

Utils.arrayContainsMatches = function arrayContainsMatches (array       , search        ) {

	for (var i = 0, l = array.length; i < l; ++i) {

		var str = array[i];
		// if regex matches or string is equal, return true
		if ((str instanceof RegExp && str.test(search)) ||
		(typeof str == "string" && str.length && str === search)) {

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
Utils.deepMerge = function deepMerge (target        ) {
		var sources = [], len = arguments.length - 1;
		while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];


	var newObj = target;
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
Utils.singleDeepMerge = function singleDeepMerge (target        , source        ) {

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

			} else if (typeof sourceValue === "object" && !Array.isArray(targetValue)) {

				sourceValue = Utils.singleDeepMerge(targetValue, sourceValue);

			} else if (typeof sourceValue === "object" && Array.isArray(targetValue)) {

				sourceValue = Utils.singleDeepMerge({}, sourceValue);

			}

			target[prop] = sourceValue;

		}

	}
	return target;

};

module.exports = Utils;
},{}]},{},[6])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9jb29raWVNYW5hZ2VyLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvY29va2llY29uc2VudC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvZGVmYXVsdE9wdGlvbnMuanMiLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9pbmRleC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL3BvcHVwLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxhQUFhOztjQU9YLCtCQUFTLENBQUMsSUFBSSxVQUFVOztDQUUvQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQVUsSUFBSSxtQkFBZSxDQUFDLENBQUM7Q0FDaEUsQUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUV6QixBQUFDLEVBQUM7O0FBRUYsY0FBUSwrQkFBUyxDQUFDLElBQUksVUFBVTs7Q0FFL0IsQUFBQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDOztBQUVoRCxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7Ozs7O0FBTUQsY0FBUSwrQkFBUyxDQUFDLElBQUksVUFBVSxLQUFLLFVBQVUsSUFBSSxVQUFVLE1BQU0sV0FBVyxJQUFJLFdBQVc7O0NBRTVGLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3RCLEFBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ3JELEFBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxBQUFHLElBQUksU0FBSSxLQUFLLGtCQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBRSxDQUFDO0NBQzVELEFBQUMsSUFBSSxJQUFJLEVBQUU7O0VBRVYsQUFBQyxNQUFNLElBQUksV0FBUyxJQUFJLEFBQUUsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxNQUFNLElBQUksU0FBUyxDQUFDOztDQUV0QixBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksTUFBTSxFQUFFOztFQUVaLEFBQUMsTUFBTSxJQUFJLGFBQVcsTUFBTSxBQUFFLENBQUM7O0NBRWhDLEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFM0IsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxjQUFRLHFDQUFZLENBQUMsSUFBSSxVQUFVLE1BQU0sV0FBVyxJQUFJLFdBQVc7O0NBRWxFLEFBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFN0MsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxjQUFRLHVDQUFhLEdBQUc7O0NBRXZCLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0NBRXBCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sVUFBQyxDQUFDLElBQUksQ0FBQyxBQUFFOztFQUUzQyxBQUFDLEdBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoQyxBQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRWpDLEFBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDSixBQUFDLE9BQU8sT0FBTyxDQUFDOztBQUVqQixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQzs7QUN0Ri9CO0FBQ0EsWUFBWSxDQUFDO0FBQ2IsR0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNuRCxHQUFLLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxJQUFNLGFBQWEsR0FJbEIsc0JBQVcsQ0FBQyxPQUFPLFVBQVU7O0NBRTdCLEFBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRztFQUNkLEFBQUMsSUFBSSxFQUFFLE1BQU07RUFDYixBQUFDLEtBQUssRUFBRSxPQUFPO0NBQ2hCLEFBQUMsQ0FBQyxDQUFDOztDQUVILEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDOztDQUUvQixBQUFDO0NBQ0QsQUFBQyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7O0VBRWxDLEFBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztDQUV2QyxBQUFDLENBQUM7O0NBRUYsQUFBQztDQUNELEFBQUM7Q0FDRCxBQUFDO0NBQ0QsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0NBQzlDLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqRSxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsbUNBQVcsR0FBRzs7QUFBQzs7Q0FFZixBQUFDLE9BQU8sSUFBSSxPQUFPLFVBQUMsQ0FBQyxPQUFPLEVBQUUsQUFBRzs7RUFFaEMsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUN2QyxBQUFDLEtBQUssQ0FBQyxlQUFlLFVBQUMsRUFBRSxBQUFFOztHQUUxQixBQUFDLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuQyxBQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7RUFFaEIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7RUFFSixBQUFDLEtBQUssQ0FBQyxjQUFjLFVBQUMsRUFBRSxBQUFFOztHQUV6QixBQUFDLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNsQyxBQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7RUFFaEIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7RUFFSixBQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Q0FFakIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFTCxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELHdCQUFDLG1DQUFXLEdBQUc7O0NBRWQsQUFBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWpFLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0Qsd0JBQUMscUNBQVksR0FBRzs7Q0FFZixBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0NBQzlCLEFBQUMsT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRW5DLEFBQUMsRUFBQzs7QUFFRix3QkFBQywrQkFBUyxDQUFDLE1BQU0sRUFBRTs7Q0FFbEIsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0NBQy9CLEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMvQyxBQUFDLEdBQUssQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Q0FFbkUsQUFBQztDQUNELEFBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFOztFQUVuRCxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFekUsQUFBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztFQUMzQixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDOztDQUUvRCxBQUFDLENBQUMsTUFBTTs7RUFFUCxBQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Q0FFckIsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQywrQkFBUyxHQUFHOztDQUVaLEFBQUMsT0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzRCxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsbUNBQVcsR0FBRzs7Q0FFZCxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDL0IsQUFBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZELEFBQUMsRUFBQzs7QUFFRix3QkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7O0VBRXhCLEFBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O0NBRTVCLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsaURBQWtCLEdBQUc7O0FBQUM7O0NBRXRCLEFBQUMsR0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0NBQzNDLEFBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztDQUN6QyxBQUFDO0NBQ0QsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7Q0FDNUIsQUFBQyxHQUFHLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQzs7Q0FFL0IsQUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7O0VBRXRCLEFBQUM7RUFDRCxBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUM1QyxBQUFDO0VBQ0QsQUFBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0VBQy9DLEFBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7Q0FFaEIsQUFBQyxDQUFDOztDQUVGLEFBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDakYsQUFBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUMvRCxBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDNUMsQUFBQyxJQUFJLENBQUMsRUFBRSxHQUFHLGtCQUFrQixDQUFDO0NBQzlCLEFBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7Q0FDN0IsQUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDOztDQUUxQixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sV0FBRSxHQUFHLFNBQUcsTUFBSSxDQUFDLGFBQWEsS0FBRSxDQUFDLENBQUM7O0FBRTdGLEFBQUMsRUFBQzs7QUFFRix3QkFBQyxpREFBa0IsR0FBRzs7Q0FFckIsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0NBRXpELEFBQUMsSUFBSSxHQUFHLEVBQUU7O0VBRVQsQUFBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7O0NBRWYsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0NBQzNCLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFL0IsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7O0FDOUsvQjtBQUNBLFlBQVksQ0FBQzs7QUFFYixHQUFLLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELEdBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsR0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsR0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7O0FBR25ELElBQU0sV0FBVyxHQWtCaEIsb0JBQVcsQ0FBQyxNQUFNLFVBQVUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXOztBQUFDOztDQUVyRSxBQUFDLEdBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztDQUVsRSxBQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUNwQyxBQUFDLFdBQVcsQ0FBQyxZQUFZLFlBQUcsR0FBRyxBQUFHOztFQUVqQyxBQUFDLE1BQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Q0FFaEIsQUFBQyxDQUFDLENBQUM7Q0FDSCxBQUFDLFdBQVcsQ0FBQyxjQUFjLFlBQUcsR0FBRyxBQUFHOztFQUVuQyxBQUFDLE1BQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Q0FFbEIsQUFBQyxDQUFDLENBQUM7Q0FDSCxBQUFDLFdBQVcsQ0FBQyxhQUFhLGFBQUksR0FBRyxBQUFHOztFQUVuQyxBQUFDLE1BQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLENBQUM7O0NBRUgsQUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0NBQ2hDLEFBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUM7Q0FDdEMsQUFBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztDQUNwQixBQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7Q0FDbkMsQUFBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0NBQ3BDLEFBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDO0NBQ3BELEFBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFckQsQUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0NBRWYsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFOztFQUV6QixBQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7O0NBRW5DLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLHlCQUFNLEdBQUc7O0NBRVQsQUFBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTs7RUFFekIsQUFBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0NBRXZCLEFBQUMsQ0FBQyxNQUFNOztFQUVQLEFBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztDQUV4QixBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUU5QixBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLDZCQUFRLEdBQUc7O0NBRVgsQUFBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTs7RUFFekIsQUFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDbEQsQUFBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0NBRXZCLEFBQUMsQ0FBQyxNQUFNOztFQUVQLEFBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztDQUV4QixBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztDQUN0QixBQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRW5DLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMscUNBQVksR0FBRzs7Q0FFZixBQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFM0MsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyxtQ0FBVyxHQUFHOztDQUVkLEFBQUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUUxQyxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsNkRBQXdCLENBQUMsUUFBUSxZQUFZOztDQUU3QyxBQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7O0FBRXhDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7O0NBRS9CLEFBQUMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFOztFQUUxQixBQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Q0FFbEIsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7O0VBRWhDLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0NBRS9CLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsK0RBQXlCLENBQUMsUUFBUSxZQUFZOztDQUU5QyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxRQUFRLENBQUM7O0FBRXpDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLEdBQUssQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0NBQ3JELEFBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPO0VBQ2xDLFNBQUMsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7R0FFVixBQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRW5DLEFBQUMsQ0FBQztDQUNILEFBQUMsQ0FBQyxDQUFDOztBQUVKLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx5Q0FBYyxHQUFHOztDQUVqQixBQUFDLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTs7RUFFMUIsQUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0NBRW5CLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7O0NBRWhDLEFBQUMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7O0VBRWpDLEFBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0NBRWhDLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsK0NBQWlCLEdBQUc7O0NBRXBCLEFBQUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7O0FBRWhDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2QkFBUSxHQUFHOztDQUVYLEFBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUV0QyxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFbkQsQUFBQyxFQUFDOztBQUVGLHNCQUFDLCtCQUFTLEdBQUc7O0NBRVosQUFBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRXJDLEFBQUMsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFOztFQUV6QyxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzs7Q0FFcEQsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2REFBd0IsQ0FBQyxhQUFhLFdBQVc7O0FBQUM7O0NBRWxELEFBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLFdBQUMsS0FBSSxDQUFDLEFBQUc7O0VBRTNCLEFBQUM7RUFDRCxBQUFDLE1BQU0sQ0FBQyxPQUFHLE1BQUksQ0FBQyxlQUFlLElBQUcsSUFBSSxDQUFFLENBQUMsR0FBRyxhQUFhLENBQUM7O0NBRTNELEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7O0FDNU83QjtBQUNBLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHOzs7Q0FHaEIsU0FBUyxFQUFFLElBQUk7OztDQUdmLE1BQU0sRUFBRTs7RUFFUCxJQUFJLEVBQUUsMEJBQTBCOzs7RUFHaEMsSUFBSSxFQUFFLEdBQUc7Ozs7RUFJVCxNQUFNLEVBQUUsTUFBTTs7O0VBR2QsVUFBVSxFQUFFLEdBQUc7RUFDZjs7O0NBR0QsT0FBTyxFQUFFO0VBQ1IsTUFBTSxFQUFFLCtCQUErQjtFQUN2QyxPQUFPLEVBQUUsb01BQW9NO0VBQzdNLEtBQUssRUFBRSxVQUFVO0VBQ2pCLElBQUksRUFBRSxVQUFVO0VBQ2hCLElBQUksRUFBRSxxQkFBcUI7RUFDM0IsSUFBSSxFQUFFLHlIQUF5SDtFQUMvSCxLQUFLLEVBQUUsVUFBVTtFQUNqQixNQUFNLEVBQUUsb0JBQW9CO0VBQzVCOzs7Ozs7O0NBT0QsUUFBUSxFQUFFO0VBQ1QsTUFBTSxFQUFFLG1EQUFtRDtFQUMzRCxPQUFPLEVBQUUseUVBQXlFO0VBQ2xGLFdBQVcsRUFBRSx1UEFBdVA7RUFDcFEsS0FBSyxFQUFFLHFHQUFxRztFQUM1RyxJQUFJLEVBQUUsaUdBQWlHO0VBQ3ZHLElBQUksRUFBRSwwSUFBMEk7RUFDaEosS0FBSyxFQUFFLDRHQUE0RztFQUNuSDs7Ozs7Q0FLRCxNQUFNLEVBQUUsNE1BQTRNOzs7O0NBSXBOLFNBQVMsRUFBRSw4S0FBOEs7OztDQUd6TCxpQkFBaUIsRUFBRSxFQUFFOzs7Q0FHckIsVUFBVSxFQUFFLG1FQUFtRTs7O0NBRy9FLE9BQU8sRUFBRTs7RUFFUixPQUFPLEVBQUUsK0JBQStCO0VBQ3hDLGFBQWEsRUFBRSx3Q0FBd0M7RUFDdkQsY0FBYyxFQUFFLDZDQUE2QztFQUM3RDs7O0NBR0QsTUFBTSxFQUFFLE9BQU87Ozs7Ozs7Q0FPZixRQUFRLEVBQUUsUUFBUTs7Ozs7Ozs7Q0FRbEIsS0FBSyxFQUFFLE9BQU87Ozs7Ozs7Ozs7O0NBV2QsT0FBTyxDQUFDO0VBQ1AsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztFQUM5QixNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0VBQy9COzs7Ozs7Q0FNRCxlQUFlLEVBQUUsS0FBSztDQUN0QixDQUFDOztBQy9HRjtBQUNBLFlBQVksQ0FBQzs7QUFFYixHQUFLLENBQUMsT0FBTyxXQUFXLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMzRCxHQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFN0MsTUFBTSxDQUFDLE9BQU8sR0FBRztVQUNoQixPQUFPO2NBQ1AsV0FBVztDQUNYLENBQUM7Ozs7Ozs7OztBQ1RGO0FBQ0EsWUFBWSxDQUFDOztBQUViLEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxJQUFNLEtBQUssR0FLVixjQUFXLENBQUMsT0FBTyxVQUFVLFVBQVUsVUFBVTs7Q0FFakQsQUFBQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztDQUM5QixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0NBRXpCLEFBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztFQUVsQixBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7Q0FFakIsQUFBQyxDQUFDOztDQUVGLEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztDQUV4QixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoRyxBQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDOztDQUV2RCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFL0MsQUFBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWQsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJCQUFPLEdBQUc7O0NBRVYsQUFBQztDQUNELEFBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQ3JGLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0NBRXpCLEFBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFOztFQUU3QyxBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0NBRXBELEFBQUMsQ0FBQztDQUNGLEFBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0NBRXJCLEFBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXRCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxxQkFBSSxHQUFHOztDQUVQLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0VBRW5CLEFBQUMsT0FBTzs7Q0FFVCxBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFOztFQUVwQixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0VBRWpDLEFBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOztFQUVqRCxBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7O0dBRTlCLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7RUFFN0IsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx1QkFBSyxHQUFHOztDQUVSLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0VBRW5CLEFBQUMsT0FBTzs7Q0FFVCxBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTs7RUFFbkIsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztFQUVyQyxBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7O0dBRS9CLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7RUFFOUIsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRTVHLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxpREFBa0IsR0FBRzs7Q0FFckIsQUFBQyxHQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwRCxBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOztDQUVwQixBQUFDO0NBQ0QsQUFBQyxTQUFTLENBQUMsT0FBTyxVQUFDLENBQUMsR0FBRyxFQUFFLEFBQUc7O0VBRTNCLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFNLEdBQUcsQ0FBRSxDQUFDLENBQUM7O0NBRTVCLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRUosQUFBQyxPQUFPLE9BQU8sQ0FBQzs7QUFFakIsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJDQUFlLEdBQUc7O0NBRWxCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0NBQzNCLEFBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQzs7Q0FFckcsQUFBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7O0VBRW5CLEFBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQzs7Q0FFN0IsQUFBQyxDQUFDOztDQUVGLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRztFQUNoQixBQUFDLFNBQU0sYUFBYSxDQUFFO0VBQ3RCLEFBQUMsZ0JBQWdCO0VBQ2pCLEFBQUMsZ0JBQVksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUN6QixDQUFDLENBQUM7O0NBRUgsQUFBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O0VBRWpCLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7O0NBRXhELEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUVoRCxBQUFDO0NBQ0QsQUFBQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7RUFFOUIsQUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztDQUV6QyxBQUFDLENBQUM7O0NBRUYsQUFBQyxPQUFPLE9BQU8sQ0FBQzs7QUFFakIsQUFBQyxFQUFDOztBQUVGLGdCQUFDLG1EQUFtQixHQUFHOztDQUV0QixBQUFDLEdBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0NBQ3pCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztDQUUzQixBQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sVUFBQyxDQUFDLElBQUksRUFBRSxBQUFHOztFQUU3QyxBQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBRSxDQUFDLElBQUksRUFBRSxBQUFHOztHQUU1RSxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQyxBQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDOztFQUVuRSxBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVMLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRUosQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDOztDQUV4QyxBQUFDO0NBQ0QsQUFBQyxZQUFZLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLFdBQUUsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7RUFFNUUsQUFBQyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFSixBQUFDO0NBQ0QsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3hDLEFBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTs7RUFFYixBQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs7Q0FFOUIsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxXQUFFLENBQUMsS0FBSyxFQUFFLEFBQUc7O0VBRWxELEFBQUMsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7O0NBRTdCLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQUFBQyxFQUFDOztBQUVGLGdCQUFDLHFDQUFZLENBQUMsTUFBTSxFQUFFOztDQUVyQixBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUMzQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDM0MsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOztDQUVqRyxBQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDOztDQUV4QixBQUFDLEdBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7O0NBRTNCLEFBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTs7RUFFckMsQUFBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQzs7Q0FFckMsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7O0VBRXRCLEFBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0NBRXpDLEFBQUMsQ0FBQzs7O0NBR0YsQUFBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFWixBQUFDLEVBQUM7O0FBRUYsZ0JBQUMsMkNBQWUsQ0FBQyxRQUFRLFlBQVk7O0NBRXBDLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUNyRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0NBQzlCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUUxRSxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUNBQWMsQ0FBQyxRQUFRLFlBQVk7O0NBRW5DLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuRixBQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0NBQzdCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUV6RSxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELEFBQUM7QUFDRCxnQkFBQyxtREFBbUIsQ0FBQyxPQUFPLEVBQUU7O0NBRTdCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNsRCxBQUFDLEdBQUssQ0FBQyxRQUFRLEdBQUcsdUJBQXFCLElBQUksQUFBRSxDQUFDO0NBQzlDLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUU5QyxBQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEQsQUFBQyxJQUFJLE9BQU8sRUFBRTs7RUFFYixBQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFJLFFBQVEsQ0FBRSxDQUFDLENBQUM7O0NBRXJELEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxPQUFPLENBQUM7O0FBRWpCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx5Q0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFOztDQUV0QyxBQUFDLEdBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0NBQ3hCLEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0NBQzdCLEFBQUMsR0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0NBQy9CLEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDOztDQUVyQyxBQUFDO0NBQ0QsQUFBQyxJQUFJLEtBQUssRUFBRTs7RUFFWCxBQUFDO0VBQ0QsQUFBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUM1RSxBQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDbkQsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLGdCQUFZLENBQUMsR0FBRztHQUNyQyxBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtHQUN2QixBQUFDLHlCQUFxQixLQUFLLENBQUMsVUFBVSxFQUFFO0VBQ3pDLEFBQUMsQ0FBQyxDQUFDO0VBQ0gsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLGtCQUFhLE1BQU0seUJBQW9CLE1BQU0sdUJBQW1CLENBQUMsR0FBRztHQUN6RixBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtFQUN4QixBQUFDLENBQUMsQ0FBQzs7RUFFSCxBQUFDLElBQUksTUFBTSxFQUFFOztHQUVaLEFBQUM7R0FDRCxBQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ2hGLEFBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0dBQy9ELEFBQUMsV0FBVyxDQUFDLENBQUcsTUFBTSxjQUFVLENBQUMsR0FBRztJQUNuQyxBQUFDLGNBQVUsTUFBTSxDQUFDLElBQUksRUFBRTtJQUN4QixBQUFDLHFCQUFpQixNQUFNLENBQUMsTUFBTSxFQUFFO0lBQ2pDLEFBQUMseUJBQXFCLE1BQU0sQ0FBQyxVQUFVLEVBQUU7R0FDMUMsQUFBQyxDQUFDLENBQUM7O0dBRUgsQUFBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssYUFBYSxFQUFFOztJQUV6QyxBQUFDLFdBQVcsQ0FBQyxDQUFHLE1BQU0sd0JBQW1CLE1BQU0sb0JBQWdCLENBQUMsR0FBRztLQUNsRSxBQUFDLHlCQUFxQixLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtJQUNoRSxBQUFDLENBQUMsQ0FBQzs7R0FFSixBQUFDLENBQUM7O0dBRUYsQUFBQyxJQUFJLFNBQVMsRUFBRTs7R0FFaEIsQUFBQztJQUNBLEFBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUYsQUFBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7SUFDeEUsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLHdDQUFvQyxDQUFDLEdBQUc7S0FDN0QsQUFBQyxjQUFVLFNBQVMsQ0FBQyxJQUFJLEVBQUU7S0FDM0IsQUFBQyxxQkFBaUIsU0FBUyxDQUFDLE1BQU0sRUFBRTtLQUNwQyxBQUFDLHlCQUFxQixTQUFTLENBQUMsVUFBVSxFQUFFO0lBQzdDLEFBQUMsQ0FBQyxDQUFDOztHQUVKLEFBQUMsQ0FBQyxNQUFNOztHQUVSLEFBQUM7SUFDQSxBQUFDLFdBQVcsQ0FBQyxDQUFHLE1BQU0sd0NBQW9DLENBQUMsR0FBRztLQUM3RCxBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtJQUN4QixBQUFDLENBQUMsQ0FBQzs7R0FFSixBQUFDLENBQUM7O0VBRUgsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQy9DLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ2xDLEFBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNwQixBQUFDLEtBQUssR0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLEVBQUU7O0VBRWhDLEFBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBRyxJQUFJLFVBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsT0FBRyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7O0NBRWpGLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7QUMxV3ZCO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sS0FBSzs7TUFFSCxxQ0FBWSxDQUFDLEdBQUcsVUFBVTs7Q0FFakMsQUFBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXBFLEFBQUMsRUFBQzs7QUFFRixNQUFRLDZCQUFRLENBQUMsT0FBTyxVQUFVLFFBQVEsVUFBVTs7Q0FFbkQsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNmLEFBQUMsR0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3JHLEFBQUM7Q0FDRCxBQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLFVBQVUsQ0FBQzs7QUFFOUQsQUFBQyxFQUFDOztBQUVGLE1BQVEsNkJBQVEsQ0FBQyxPQUFPLFVBQVUsU0FBUyxVQUFVOztDQUVwRCxBQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksTUFBSSxTQUFTLEFBQUUsQ0FBQzs7QUFFdkMsQUFBQyxFQUFDOztBQUVGLE1BQVEsbUNBQVcsQ0FBQyxPQUFPLFVBQVUsU0FBUyxVQUFVOztDQUV2RCxBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBQyxTQUFLLENBQUMsQ0FBQztDQUNwRSxBQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUUzRCxBQUFDLEVBQUM7O0FBRUYsTUFBUSwrQ0FBaUIsQ0FBQyxHQUFHLFVBQVUsUUFBUSxZQUFZOztDQUUxRCxBQUFDLEdBQUssQ0FBQyxNQUFNLEdBQUcsMkJBQTJCLENBQUM7Q0FDNUMsQUFBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVc7O0VBRXRDLEFBQUMsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOztDQUV0QyxBQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0QsTUFBUSxxQkFBSSxDQUFDLEdBQUcsVUFBVTs7Q0FFekIsQUFBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7RUFDWixBQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0NBQ2QsQUFBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOztFQUV0QixBQUFDLE9BQU8sSUFBSSxDQUFDOztDQUVkLEFBQUMsQ0FBQztDQUNGLEFBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUU7O0VBRTVDLEFBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDekIsQUFBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDbkMsQUFBQyxJQUFJLElBQUksQ0FBQyxDQUFDOztDQUVaLEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxJQUFJLENBQUM7O0FBRWQsQUFBQyxFQUFDOztBQUVGLE1BQVEscUNBQVksQ0FBQyxHQUFHLFVBQVU7O0NBRWpDLEFBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFOztFQUVwQixBQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOztDQUV0QixBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0VBRXRCLEFBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztDQUU1RCxBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sR0FBRyxDQUFDOztBQUViLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0QsTUFBUSxtQ0FBVyxDQUFDLEdBQUcsVUFBVTs7Q0FFaEMsQUFBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMvQixBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUMsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxQyxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUN4RCxBQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFeEMsQUFBQyxFQUFDOztBQUVGLEFBQUM7QUFDRCxNQUFRLHFDQUFZLENBQUMsR0FBRyxVQUFVOztDQUVqQyxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO0VBQ2pELEFBQUMsR0FBRyxHQUFHLEVBQUU7RUFDVCxBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHO0VBQ3RCLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHO0VBQzlCLEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUM3QixBQUFDLEdBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0ssQUFBQyxPQUFPLE9BQUksU0FBUyxDQUFFLENBQUM7O0FBRXpCLEFBQUMsRUFBQzs7QUFFRixNQUFRLHlDQUFjLENBQUMsR0FBRyxVQUFVOztDQUVuQyxBQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQy9CLEFBQUM7Q0FDRCxBQUFDLElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTs7RUFFdEIsQUFBQyxPQUFPLE1BQU0sQ0FBQzs7Q0FFaEIsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWpDLEFBQUMsRUFBQzs7QUFFRixNQUFRLDZCQUFRLENBQUMsU0FBUyxVQUFVOztDQUVuQyxBQUFDLE9BQU8sZ0VBQWdFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUxRixBQUFDLEVBQUM7O0FBRUYsTUFBUSx1Q0FBYSxDQUFDLEdBQUcsVUFBVTs7Q0FFbEMsQUFBQztDQUNELEFBQUMsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQzs7QUFFL0UsQUFBQyxFQUFDOztBQUVGLE1BQVEscURBQW9CLENBQUMsS0FBSyxTQUFTLE1BQU0sVUFBVTs7Q0FFMUQsQUFBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7O0VBRTlDLEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEIsQUFBQztFQUNELEFBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNoRCxBQUFDLENBQUMsT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxLQUFLLE1BQU0sQ0FBQyxFQUFFOztHQUUxRCxBQUFDLE9BQU8sSUFBSSxDQUFDOztFQUVkLEFBQUMsQ0FBQzs7Q0FFSCxBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sS0FBSyxDQUFDOztBQUVmLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7Ozs7OztBQVFELEFBQUM7QUFDRCxNQUFRLCtCQUFTLENBQUMsTUFBTSxBQUFvQixVQUFVOzs7QUFBQzs7Q0FFdEQsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUNyQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0NBRTdELEFBQUMsVUFBVSxDQUFDLE9BQU8sVUFBQyxDQUFDLE1BQU0sRUFBRSxBQUFHOztFQUUvQixBQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7Q0FFakQsQUFBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFSixBQUFDLE9BQU8sTUFBTSxDQUFDOztBQUVoQixBQUFDLEVBQUM7O0FBRUYsQUFBQzs7Ozs7Ozs7QUFRRCxNQUFRLDJDQUFlLENBQUMsTUFBTSxVQUFVLE1BQU0sVUFBVTs7Q0FFdkQsQUFBQyxLQUFLLEdBQUssQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFOztFQUUzQixBQUFDO0VBQ0QsQUFBQztFQUNELEFBQUMsSUFBSSxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUU7O0dBRXZDLEFBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDaEMsQUFBQyxHQUFHLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7R0FFaEMsQUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFOztJQUVsQixBQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7O0dBRW5CLEFBQUMsQ0FBQzs7R0FFRixBQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTs7SUFFaEMsQUFBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7R0FFckMsQUFBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFOztJQUUzRSxBQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzs7R0FFaEUsQUFBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTs7SUFFMUUsQUFBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7O0dBRXZELEFBQUMsQ0FBQzs7R0FFRixBQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUM7O0VBRTdCLEFBQUMsQ0FBQzs7Q0FFSCxBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sTUFBTSxDQUFDOztBQUVoQixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjFcIlxufSIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY2xhc3MgQ29va2llTWFuYWdlciB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIGdldCB0aGUgY29va2llIHZhbHVlXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBnZXRDb29raWUobmFtZSAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCB2ID0gZG9jdW1lbnQuY29va2llLm1hdGNoKGAoXnw7KSA/JHtuYW1lfT0oW147XSopKDt8JClgKTtcclxuXHRcdHJldHVybiB2ID8gdlsyXSA6IG51bGw7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGhhc0Nvb2tpZShuYW1lICAgICAgICApIHtcclxuXHJcblx0XHRyZXR1cm4gQ29va2llTWFuYWdlci5nZXRDb29raWUobmFtZSkgIT09IG51bGw7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb29raWUgdmFsdWVcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZGF5cyBUaGUgbnVtYmVycyBvZiBkYXlzIHRvIGV4cGlyZSB0aGUgY29va2llLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBzZXRDb29raWUobmFtZSAgICAgICAgLCB2YWx1ZSAgICAgICAgLCBkYXlzICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkge1xyXG5cclxuXHRcdGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0ZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgMjQgKiA2MCAqIDYwICogMTAwMCAqIGRheXMpO1xyXG5cdFx0bGV0IGNvb2tpZSA9IGAke25hbWV9PSR7dmFsdWV9O2V4cGlyZXM9JHtkLnRvR01UU3RyaW5nKCl9YDtcclxuXHRcdGlmIChwYXRoKSB7XHJcblxyXG5cdFx0XHRjb29raWUgKz0gYDtwYXRoPSR7cGF0aH1gO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRjb29raWUgKz0gXCI7cGF0aD0vXCI7XHJcblxyXG5cdFx0fVxyXG5cdFx0aWYgKGRvbWFpbikge1xyXG5cclxuXHRcdFx0Y29va2llICs9IGA7ZG9tYWluPSR7ZG9tYWlufWA7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZSB0aGUgY29va2llc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICovXHJcblx0c3RhdGljIGRlbGV0ZUNvb2tpZShuYW1lICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuc2V0Q29va2llKG5hbWUsIFwiXCIsIC0xLCBkb21haW4sIHBhdGgpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhbGwgY29va2llc1xyXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9XHJcblx0ICovXHJcblx0c3RhdGljIGdldEFsbENvb2tpZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgY29va2llcyA9IHt9O1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKChpdGVtKT0+e1xyXG5cclxuXHRcdFx0Y29uc3QgY29va2llID0gaXRlbS5zcGxpdChcIj1cIik7XHJcblx0XHRcdGNvb2tpZXNbY29va2llWzBdXSA9IGNvb2tpZVsxXTtcclxuXHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBjb29raWVzO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZU1hbmFnZXI7XHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHRPcHRpb25zXCIpO1xyXG5jb25zdCBjb29raWVNYW5hZ2VyID0gcmVxdWlyZShcIi4vY29va2llTWFuYWdlclwiKTtcclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgUG9wdXAgPSByZXF1aXJlKFwiLi9wb3B1cFwiKTtcclxuXHJcbmNsYXNzIENvb2tpZWNvbnNlbnQge1xyXG5cclxuXHQgICAgICAgICAgICAgIFxyXG5cclxuXHRjb25zdHJ1Y3RvcihvcHRpb25zICAgICAgICApIHtcclxuXHJcblx0XHR0aGlzLnN0YXR1cyA9IHtcclxuXHRcdFx0ZGVueTogXCJkZW55XCIsXHJcblx0XHRcdGFsbG93OiBcImFsbG93XCJcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gc2V0IG9wdGlvbnMgYmFjayB0byBkZWZhdWx0IG9wdGlvbnNcclxuXHRcdHRoaXMub3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xyXG5cclxuXHRcdC8vIG1lcmdlIGluIHVzZXIgb3B0aW9uc1xyXG5cdFx0aWYgKFV0aWxzLmlzUGxhaW5PYmplY3Qob3B0aW9ucykpIHtcclxuXHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXdhcm5pbmctY29tbWVudHNcclxuXHRcdC8vIFRPRE86IG5hdmlnYXRvciBhbmQgZG9jdW1lbnQgc2hvdWxkbid0IGJlIHVzZWQgaGVyZVxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHR0aGlzLm9wdGlvbnMudXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuXHRcdHRoaXMub3B0aW9ucy5pc01vYmlsZSA9IFV0aWxzLmlzTW9iaWxlKHRoaXMub3B0aW9ucy51c2VyQWdlbnQpO1xyXG5cclxuXHR9XHJcblxyXG5cdGNyZWF0ZVBvcHVwKCkge1xyXG5cclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG5cclxuXHRcdFx0Y29uc3QgcG9wdXAgPSBuZXcgUG9wdXAodGhpcy5vcHRpb25zKTtcclxuXHRcdFx0cG9wdXAuc2V0QWxsb3dIYW5kbGVyKCgpPT57XHJcblxyXG5cdFx0XHRcdHRoaXMuc2V0U3RhdHVzKHRoaXMuc3RhdHVzLmFsbG93KTtcclxuXHRcdFx0XHRwb3B1cC5jbG9zZSgpO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRwb3B1cC5zZXREZW55SGFuZGxlcigoKT0+e1xyXG5cclxuXHRcdFx0XHR0aGlzLnNldFN0YXR1cyh0aGlzLnN0YXR1cy5kZW55KTtcclxuXHRcdFx0XHRwb3B1cC5jbG9zZSgpO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXNvbHZlKHBvcHVwKTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHQvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb2tpZSBoYXMgYSB2YWxpZCB2YWx1ZVxyXG5cdGhhc0Fuc3dlcmVkKCkge1xyXG5cclxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZih0aGlzLmdldFN0YXR1cygpKSA+PSAwO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHJldHVybnMgdHJ1ZSBpZiB0aGUgY29va2llIGluZGljYXRlcyB0aGF0IGNvbnNlbnQgaGFzIGJlZW4gZ2l2ZW5cclxuXHRoYXNDb25zZW50ZWQoKSB7XHJcblxyXG5cdFx0Y29uc3QgdmFsID0gdGhpcy5nZXRTdGF0dXMoKTtcclxuXHRcdHJldHVybiB2YWwgPT09IHRoaXMuc3RhdHVzLmFsbG93O1xyXG5cclxuXHR9XHJcblxyXG5cdHNldFN0YXR1cyhzdGF0dXMpIHtcclxuXHJcblx0XHRjb25zdCBjID0gdGhpcy5vcHRpb25zLmNvb2tpZTtcclxuXHRcdGNvbnN0IHZhbHVlID0gY29va2llTWFuYWdlci5nZXRDb29raWUoYy5uYW1lKTtcclxuXHRcdGNvbnN0IGNob3NlbkJlZm9yZSA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHZhbHVlKSA+PSAwO1xyXG5cclxuXHRcdC8vIGlmIGBzdGF0dXNgIGlzIHZhbGlkXHJcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2Yoc3RhdHVzKSA+PSAwKSB7XHJcblxyXG5cdFx0XHRjb29raWVNYW5hZ2VyLnNldENvb2tpZShjLm5hbWUsIHN0YXR1cywgYy5leHBpcnlEYXlzLCBjLmRvbWFpbiwgYy5wYXRoKTtcclxuXHJcblx0XHRcdHRoaXMuY3JlYXRlQ29uZmlnQnV0dG9uKCk7XHJcblx0XHRcdHRoaXMub3B0aW9ucy5vblN0YXR1c0NoYW5nZS5jYWxsKHRoaXMsIHN0YXR1cywgY2hvc2VuQmVmb3JlKTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0dGhpcy5jbGVhclN0YXR1cygpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRnZXRTdGF0dXMoKSB7XHJcblxyXG5cdFx0cmV0dXJuIGNvb2tpZU1hbmFnZXIuZ2V0Q29va2llKHRoaXMub3B0aW9ucy5jb29raWUubmFtZSk7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xlYXJTdGF0dXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgYyA9IHRoaXMub3B0aW9ucy5jb29raWU7XHJcblx0XHRjb29raWVNYW5hZ2VyLmRlbGV0ZUNvb2tpZShjLm5hbWUsIGMuZG9tYWluLCBjLnBhdGgpO1xyXG5cclxuXHR9XHJcblxyXG5cdG9uSW5pdCgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNBbnN3ZXJlZCgpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNyZWF0ZUNvbmZpZ0J1dHRvbigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRjcmVhdGVDb25maWdCdXR0b24oKSB7XHJcblxyXG5cdFx0Y29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuY29uZmlnQnRuU2VsZWN0b3I7XHJcblx0XHRsZXQgYnV0dG9uSFRNTCA9IHRoaXMub3B0aW9ucy5jb25maWdCdG47XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGxldCBwYXJlbnQgPSBkb2N1bWVudC5ib2R5O1xyXG5cdFx0bGV0IGJ0bkNsYXNzID0gXCJjb25maWctcG9wdXBcIjtcclxuXHJcblx0XHRpZiAoaWQudHJpbSgpICE9PSBcIlwiKSB7XHJcblxyXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdFx0Y29uc3QgZGl2RWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpO1xyXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdFx0cGFyZW50ID0gKCFkaXZFbGVtKSA/IGRvY3VtZW50LmJvZHkgOiBkaXZFbGVtO1xyXG5cdFx0XHRidG5DbGFzcyA9IFwiXCI7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGJ1dHRvbkhUTUwgPSBidXR0b25IVE1MLnJlcGxhY2UoXCJ7e2NvbmZpZy10ZXh0fX1cIiwgdGhpcy5vcHRpb25zLmNvbnRlbnQuY29uZmlnKTtcclxuXHRcdGJ1dHRvbkhUTUwgPSBidXR0b25IVE1MLnJlcGxhY2UoXCJ7e2NvbmZpZy1jbGFzc319XCIsIGJ0bkNsYXNzKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHRlbGVtLmlkID0gXCJjYy1jb25maWctcGFyZW50XCI7XHJcblx0XHRlbGVtLmlubmVySFRNTCA9IGJ1dHRvbkhUTUw7XHJcblx0XHRwYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbSk7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWNvbmZpZ1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5vblJlc2V0Q29uZmlnKCkpO1xyXG5cclxuXHR9XHJcblxyXG5cdHJlbW92ZUNvbmZpZ0J1dHRvbigpIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IGJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2MtY29uZmlnLXBhcmVudFwiKTtcclxuXHJcblx0XHRpZiAoYnRuKSB7XHJcblxyXG5cdFx0XHRidG4ucmVtb3ZlKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdG9uUmVzZXRDb25maWcoKSB7XHJcblxyXG5cdFx0dGhpcy5yZW1vdmVDb25maWdCdXR0b24oKTtcclxuXHRcdHRoaXMub3B0aW9ucy5vblJlc2V0Q29uZmlnKCk7XHJcblxyXG5cdH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29va2llY29uc2VudDtcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBDb29raWVDb25zZW50ID0gcmVxdWlyZShcIi4vY29va2llY29uc2VudFwiKTtcclxuY29uc3QgQ29va2llTWFuYWdlciA9IHJlcXVpcmUoXCIuL2Nvb2tpZU1hbmFnZXJcIik7XHJcbmNvbnN0IFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gcmVxdWlyZShcIi4vZGVmYXVsdE9wdGlvbnNcIik7XHJcblxyXG5cclxuY2xhc3MgQ29va2llc0lDR0Mge1xyXG5cclxuXHQgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcblx0LyoqXHJcblx0ICogQSBgQ29va2llc0lDR0NgIG9iamVjdCByZXByZXNlbnRzIHRoZSBvYmplY3QgdGhhdCBtYW5hZ2VzIHRoZSBjb29raWUgY29uc2VudCB1bmRlciB0aGUgRXVyb3BlYW4gR0RQUiBsYXdcclxuXHQgKiBkaXNhYmxpbmcgR29vZ2xlIEFuYWx5dGljcyBjb29raWVzIGlmIG5lZWRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIHRoYXQgc2V0cyB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gZ2FJZHMgQW4gYXJyYXkgd2l0aCB0aGUgR29vZ2xlIEFuYWx5dGljcyBpZHNcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25hbCBvcHRpb25zXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiB2YXIgY29va2llcyA9IG5ldyBDb29raWVzSUNHQyhcInd3dy5pbnN0YW1hcHMuY2F0XCIsIFtcIlVBLTEyMzQ1Njc4LTFcIl0sIHtwb3NpdGlvbjogXCJ0b3BcIiwgY29udGVudCB7IG1lc3NhZ2U6IFwiVm9scyBjb29raWVzP1wiIH19KTtcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihkb21haW4gICAgICAgICwgZ2FJZHMgICAgICAgICAgICAgICAsIG9wdGlvbnMgICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBtYWluT3B0aW9ucyA9IFV0aWxzLmRlZXBNZXJnZSh7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdG1haW5PcHRpb25zLmNvb2tpZS5kb21haW4gPSBkb21haW47XHJcblx0XHRtYWluT3B0aW9ucy5vbkluaXRpYWxpc2UgPSAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLm9uSW5pdCgpO1xyXG5cclxuXHRcdH07XHJcblx0XHRtYWluT3B0aW9ucy5vblN0YXR1c0NoYW5nZSA9ICgpID0+IHtcclxuXHJcblx0XHRcdHRoaXMub25DaGFuZ2UoKTtcclxuXHJcblx0XHR9O1xyXG5cdFx0bWFpbk9wdGlvbnMub25SZXNldENvbmZpZyA9ICAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLm9uUmVzZXRDb25maWcoKTtcclxuXHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYXJlQ29va2llc0VuYWJsZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuZ2FEaXNhYmxlUHJlZml4ID0gXCJnYS1kaXNhYmxlLVwiO1xyXG5cdFx0dGhpcy5nYUlkcyA9IGdhSWRzO1xyXG5cdFx0dGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMucmVtb3ZlR0FDb29raWVzID0gbWFpbk9wdGlvbnMucmVtb3ZlR0FDb29raWVzO1xyXG5cdFx0dGhpcy5jb29raWVDb25zZW50ID0gbmV3IENvb2tpZUNvbnNlbnQobWFpbk9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMub25Jbml0KCk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmhhc0Fuc3dlcmVkKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llQ29uc2VudC5jcmVhdGVQb3B1cCgpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbnNlbnQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXHJcblx0ICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgY29va2llcyBkZXBlbmRpbmcgb24gaWYgdGhlIHVzZXIgaGFzIGNvbnNlbnRlZCBvciBub3RcclxuXHQgKi9cclxuXHRvbkluaXQoKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuaGFzQ29uc2VudGVkKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuZW5hYmxlQ29va2llcygpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHR0aGlzLmRpc2FibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY29va2llQ29uc2VudC5vbkluaXQoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbnNlbnQgc3RhdHVzIGhhcyBjaGFuZ2VkLlxyXG5cdCAqIEVuYWJsZXMgdGhlIGNvb2tpZXMgaWYgbmVlZGVkXHJcblx0ICovXHJcblx0b25DaGFuZ2UoKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuaGFzQ29uc2VudGVkKCkpIHtcclxuXHJcblx0XHRcdENvb2tpZU1hbmFnZXIuc2V0Q29va2llKFwiZ2FFbmFibGVcIiwgXCJ0cnVlXCIsIDM2NSk7XHJcblx0XHRcdHRoaXMuZW5hYmxlQ29va2llcygpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHR0aGlzLmRpc2FibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uZmlnIGhhcyBiZWVuIHJlc2V0LlxyXG5cdCAqIERpc2FibGVzIHRoZSBjb29raWVzXHJcblx0ICovXHJcblx0b25SZXNldENvbmZpZygpIHtcclxuXHJcblx0XHR0aGlzLmRlbGV0ZUNvb2tpZXMoKTtcclxuXHRcdHRoaXMuY29va2llQ29uc2VudC5jcmVhdGVQb3B1cCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0aGFzQ29uc2VudGVkKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmNvb2tpZUNvbnNlbnQuaGFzQ29uc2VudGVkKCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBhbnN3ZXJlZFxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGhhc0Fuc3dlcmVkKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmNvb2tpZUNvbnNlbnQuaGFzQW5zd2VyZWQoKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXRDb29raWVzRW5hYmxlZEhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIgPSBjYWxsYmFjaztcclxuXHJcblx0fVxyXG5cclxuXHRlbmFibGVDb29raWVzKCkge1xyXG5cclxuXHRcdHRoaXMuYXJlQ29va2llc0VuYWJsZWQgPSB0cnVlO1xyXG5cclxuXHRcdGlmICh0aGlzLnJlbW92ZUdBQ29va2llcykge1xyXG5cclxuXHRcdFx0dGhpcy5lbmFibGVHQSgpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIpIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHNldENvb2tpZXNEaXNhYmxlZEhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyID0gY2FsbGJhY2s7XHJcblxyXG5cdH1cclxuXHJcblx0ZGVsZXRlQ29va2llcygpIHtcclxuXHJcblx0XHRjb25zdCBhY3RpdmVDb29raWVzID0gQ29va2llTWFuYWdlci5nZXRBbGxDb29raWVzKCk7XHJcblx0XHRPYmplY3Qua2V5cyhhY3RpdmVDb29raWVzKS5mb3JFYWNoKFxyXG5cdFx0XHQoaXRlbSkgPT4ge1xyXG5cclxuXHRcdFx0XHRDb29raWVNYW5hZ2VyLmRlbGV0ZUNvb2tpZShpdGVtKTtcclxuXHJcblx0XHRcdH1cclxuXHRcdCk7XHJcblxyXG5cdH1cclxuXHJcblx0ZGlzYWJsZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMucmVtb3ZlR0FDb29raWVzKSB7XHJcblxyXG5cdFx0XHR0aGlzLmRpc2FibGVHQSgpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlcikge1xyXG5cclxuXHRcdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGFyZUNvb2tpZXNFbmFibGVkKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmFyZUNvb2tpZXNFbmFibGVkO1xyXG5cclxuXHR9XHJcblxyXG5cdGVuYWJsZUdBKCkge1xyXG5cclxuXHRcdHRoaXMuY2hhbmdlR0FTdGF0dXNUb0Rpc2FibGVkKGZhbHNlKTtcclxuXHJcblx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwidHJ1ZVwiLCAzNjUpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpc2FibGVHQSgpIHtcclxuXHJcblx0XHR0aGlzLmNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZCh0cnVlKTtcclxuXHJcblx0XHRpZiAoQ29va2llTWFuYWdlci5oYXNDb29raWUoXCJnYUVuYWJsZVwiKSkge1xyXG5cclxuXHRcdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcImZhbHNlXCIsIDM2NSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZChzaG91bGREaXNhYmxlICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5nYUlkcy5mb3JFYWNoKGdhSWQgPT4ge1xyXG5cclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRcdHdpbmRvd1tgJHt0aGlzLmdhRGlzYWJsZVByZWZpeH0ke2dhSWR9YF0gPSBzaG91bGREaXNhYmxlO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZXNJQ0dDO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuXHQvLyBvcHRpb25hbCAoZXhwZWN0aW5nIGEgSFRNTCBlbGVtZW50KSBpZiBwYXNzZWQsIHRoZSBwb3B1cCBpcyBhcHBlbmRlZCB0byB0aGlzIGVsZW1lbnQuIGRlZmF1bHQgaXMgYGRvY3VtZW50LmJvZHlgXHJcblx0Y29udGFpbmVyOiBudWxsLFxyXG5cclxuXHQvLyBkZWZhdWx0cyBjb29raWUgb3B0aW9ucyAtIGl0IGlzIFJFQ09NTUVOREVEIHRvIHNldCB0aGVzZSB2YWx1ZXMgdG8gY29ycmVzcG9uZCB3aXRoIHlvdXIgc2VydmVyXHJcblx0Y29va2llOiB7XHJcblx0XHQvLyBUaGlzIGlzIHRoZSBuYW1lIG9mIHRoaXMgY29va2llIC0geW91IGNhbiBpZ25vcmUgdGhpc1xyXG5cdFx0bmFtZTogXCJjb29raWVjb25zZW50SUNHQ19zdGF0dXNcIixcclxuXHJcblx0XHQvLyBUaGlzIGlzIHRoZSB1cmwgcGF0aCB0aGF0IHRoZSBjb29raWUgJ25hbWUnIGJlbG9uZ3MgdG8uIFRoZSBjb29raWUgY2FuIG9ubHkgYmUgcmVhZCBhdCB0aGlzIGxvY2F0aW9uXHJcblx0XHRwYXRoOiBcIi9cIixcclxuXHJcblx0XHQvLyBUaGlzIGlzIHRoZSBkb21haW4gdGhhdCB0aGUgY29va2llICduYW1lJyBiZWxvbmdzIHRvLiBUaGUgY29va2llIGNhbiBvbmx5IGJlIHJlYWQgb24gdGhpcyBkb21haW4uXHJcblx0XHQvLyAgLSBHdWlkZSB0byBjb29raWUgZG9tYWlucyAtIGh0dHA6Ly9lcmlrLmlvL2Jsb2cvMjAxNC8wMy8wNC9kZWZpbml0aXZlLWd1aWRlLXRvLWNvb2tpZS1kb21haW5zL1xyXG5cdFx0ZG9tYWluOiBcImZpbGVcIixcclxuXHJcblx0XHQvLyBUaGUgY29va2llcyBleHBpcmUgZGF0ZSwgc3BlY2lmaWVkIGluIGRheXMgKHNwZWNpZnkgLTEgZm9yIG5vIGV4cGlyeSlcclxuXHRcdGV4cGlyeURheXM6IDM2NSxcclxuXHR9LFxyXG5cclxuXHQvLyBlYWNoIGl0ZW0gZGVmaW5lcyB0aGUgaW5uZXIgdGV4dCBmb3IgdGhlIGVsZW1lbnQgdGhhdCBpdCByZWZlcmVuY2VzXHJcblx0Y29udGVudDoge1xyXG5cdFx0aGVhZGVyOiBcIkNvb2tpZXMgdXRpbGl0emFkZXMgYSBsYSB3ZWIhXCIsXHJcblx0XHRtZXNzYWdlOiBcIlV0aWxpdHplbSBnYWxldGVzIHBlciBkaXN0aW5naXItdm9zIGQnYWx0cmVzIHVzdWFyaXMgZW4gZWxzIG5vc3RyZXMgd2VicywgcGVyIG1pbGxvcmFyIGxhIGluZm9ybWFjacOzIGkgZWxzIHNlcnZlaXMgcXVlIHVzIG9mZXJpbSwgaSBwZXIgZmFjaWxpdGFyLXZvcyBsJ2FjY8Opcy4gUGVyIGEgbcOpcyBpbmZvcm1hY2nDsywgY29uc3VsdGV1IGxhIFwiLFxyXG5cdFx0YWxsb3c6IFwiQWNjZXB0YXJcIixcclxuXHRcdGRlbnk6IFwiUmVidXRqYXJcIixcclxuXHRcdGxpbms6IFwicG9sw610aWNhIGRlIGdhbGV0ZXNcIixcclxuXHRcdGhyZWY6IFwiaHR0cDovL3d3dy5pY2djLmNhdC9MLUlDR0MvU29icmUtbC1JQ0dDL1BvbGl0aXF1ZXMvUG9saXRpY2EtZGUtcHJvdGVjY2lvLWRlLWRhZGVzLXBlcnNvbmFscy9Qb2xpdGljYS1kZS1nYWxldGVzLWNvb2tpZXNcIixcclxuXHRcdGNsb3NlOiBcIiYjeDI3NGM7XCIsXHJcblx0XHRjb25maWc6IFwiQ29uZmlndXJhciBjb29raWVzXCJcclxuXHR9LFxyXG5cclxuXHQvLyBUaGlzIGlzIHRoZSBIVE1MIGZvciB0aGUgZWxlbWVudHMgYWJvdmUuIFRoZSBzdHJpbmcge3toZWFkZXJ9fSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIGVxdWl2YWxlbnQgdGV4dCBiZWxvdy5cclxuXHQvLyBZb3UgY2FuIHJlbW92ZSBcInt7aGVhZGVyfX1cIiBhbmQgd3JpdGUgdGhlIGNvbnRlbnQgZGlyZWN0bHkgaW5zaWRlIHRoZSBIVE1MIGlmIHlvdSB3YW50LlxyXG5cdC8vXHJcblx0Ly8gIC0gQVJJQSBydWxlcyBzdWdnZXN0IHRvIGVuc3VyZSBjb250cm9scyBhcmUgdGFiYmFibGUgKHNvIHRoZSBicm93c2VyIGNhbiBmaW5kIHRoZSBmaXJzdCBjb250cm9sKSxcclxuXHQvLyAgICBhbmQgdG8gc2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3QgaW50ZXJhY3RpdmUgY29udHJvbCAoaHR0cDovL3czYy5naXRodWIuaW8vYXJpYS1pbi1odG1sLylcclxuXHRlbGVtZW50czoge1xyXG5cdFx0aGVhZGVyOiBcIjxzcGFuIGNsYXNzPVxcXCJjYy1oZWFkZXJcXFwiPnt7aGVhZGVyfX08L3NwYW4+Jm5ic3A7XCIsXHJcblx0XHRtZXNzYWdlOiBcIjxzcGFuIGlkPVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy1tZXNzYWdlXFxcIj57e21lc3NhZ2V9fTwvc3Bhbj5cIixcclxuXHRcdG1lc3NhZ2VsaW5rOiBcIjxzcGFuIGlkPVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy1tZXNzYWdlXFxcIj57e21lc3NhZ2V9fSA8YSBhcmlhLWxhYmVsPVxcXCJsZWFybiBtb3JlIGFib3V0IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtbGlua1xcXCIgaHJlZj1cXFwie3tocmVmfX1cXFwiIHJlbD1cXFwibm9vcGVuZXIgbm9yZWZlcnJlciBub2ZvbGxvd1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPnt7bGlua319PC9hPjwvc3Bhbj5cIixcclxuXHRcdGFsbG93OiBcIjxhIGFyaWEtbGFiZWw9XFxcImFsbG93IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiAgY2xhc3M9XFxcImNjLWJ0biBjYy1hbGxvd1xcXCI+e3thbGxvd319PC9hPlwiLFxyXG5cdFx0ZGVueTogXCI8YSBhcmlhLWxhYmVsPVxcXCJkZW55IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtYnRuIGNjLWRlbnlcXFwiPnt7ZGVueX19PC9hPlwiLFxyXG5cdFx0bGluazogXCI8YSBhcmlhLWxhYmVsPVxcXCJsZWFybiBtb3JlIGFib3V0IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtbGlua1xcXCIgaHJlZj1cXFwie3tocmVmfX1cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj57e2xpbmt9fTwvYT5cIixcclxuXHRcdGNsb3NlOiBcIjxzcGFuIGFyaWEtbGFiZWw9XFxcImRpc21pc3MgY29va2llIG1lc3NhZ2VcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtY2xvc2VcXFwiPnt7Y2xvc2V9fTwvc3Bhbj5cIixcclxuXHR9LFxyXG5cclxuXHQvLyBUaGUgcGxhY2Vob2xkZXJzIHt7Y2xhc3Nlc319IGFuZCB7e2NoaWxkcmVufX0gYm90aCBnZXQgcmVwbGFjZWQgZHVyaW5nIGluaXRpYWxpc2F0aW9uOlxyXG5cdC8vICAtIHt7Y2xhc3Nlc319IGlzIHdoZXJlIGFkZGl0aW9uYWwgY2xhc3NlcyBnZXQgYWRkZWRcclxuXHQvLyAgLSB7e2NoaWxkcmVufX0gaXMgd2hlcmUgdGhlIEhUTUwgY2hpbGRyZW4gYXJlIHBsYWNlZFxyXG5cdHdpbmRvdzogXCI8ZGl2IHJvbGU9XFxcImRpYWxvZ1xcXCIgYXJpYS1saXZlPVxcXCJwb2xpdGVcXFwiIGFyaWEtbGFiZWw9XFxcImNvb2tpZWNvbnNlbnRcXFwiIGFyaWEtZGVzY3JpYmVkYnk9XFxcImNvb2tpZWNvbnNlbnQ6ZGVzY1xcXCIgY2xhc3M9XFxcImNjLXdpbmRvdyB7e2NsYXNzZXN9fVxcXCI+PCEtLWdvb2dsZW9mZjogYWxsLS0+e3tjaGlsZHJlbn19PCEtLWdvb2dsZW9uOiBhbGwtLT48L2Rpdj5cIixcclxuXHJcblx0Ly8gVGhpcyBpcyB0aGUgaHRtbCBmb3IgdGhlIGNvbmZpZyBidXR0b24uIFRoaXMgb25seSBzaG93cyB1cCBhZnRlciB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgdGhlaXIgbGV2ZWwgb2YgY29uc2VudFxyXG5cdC8vIEl0IG11c3QgaW5jbHVkZSB0aGUgY2MtY29uZmlnIGNsYXNzXHJcblx0Y29uZmlnQnRuOiBcIjxkaXYgY2xhc3M9XFxcImNjLWNvbmZpZyB7e2NvbmZpZy1jbGFzc319XFxcIj48aW1nIHNyYz1cXFwiaHR0cHM6Ly9nZW5jYXQuZ2l0aHViLmlvL0lDR0MtQ29va2llLUdEUFIvZGlzdC9jb29raWUtaWNvbi0yNC5wbmdcXFwiIHN0eWxlPVxcXCJtYXJnaW4tcmlnaHQ6IDVweDtcXFwiLz57e2NvbmZpZy10ZXh0fX08L2Rpdj5cIixcclxuXHJcblx0Ly8gVGhpcyBpcyB0aGUgZWxlbWVudCBzZWxlY3RvciB3aGVyZSB0aGUgY29uZmlnIGJ1dHRvbiB3aWxsIGJlIGFkZGVkXHJcblx0Y29uZmlnQnRuU2VsZWN0b3I6IFwiXCIsXHJcblxyXG5cdC8vIGRlZmluZSB0eXBlcyBvZiAnY29tcGxpYW5jZScgaGVyZS4gJ3t7dmFsdWV9fScgc3RyaW5ncyBpbiBoZXJlIGFyZSBsaW5rZWQgdG8gYGVsZW1lbnRzYFxyXG5cdGNvbXBsaWFuY2U6IFwiPGRpdiBjbGFzcz1cXFwiY2MtY29tcGxpYW5jZSBjYy1oaWdobGlnaHRcXFwiPnt7ZGVueX19e3thbGxvd319PC9kaXY+XCIsXHJcblxyXG5cdC8vIGRlZmluZSBsYXlvdXQgbGF5b3V0cyBoZXJlXHJcblx0bGF5b3V0czoge1xyXG5cdFx0Ly8gdGhlICdibG9jaycgbGF5b3V0IHRlbmQgdG8gYmUgZm9yIHNxdWFyZSBmbG9hdGluZyBwb3B1cHNcclxuXHRcdFwiYmFzaWNcIjogXCJ7e21lc3NhZ2VsaW5rfX17e2NvbXBsaWFuY2V9fVwiLFxyXG5cdFx0XCJiYXNpYy1jbG9zZVwiOiBcInt7bWVzc2FnZWxpbmt9fXt7Y29tcGxpYW5jZX19e3tjbG9zZX19XCIsXHJcblx0XHRcImJhc2ljLWhlYWRlclwiOiBcInt7aGVhZGVyfX17e21lc3NhZ2V9fXt7bGlua319e3tjb21wbGlhbmNlfX1cIixcclxuXHR9LFxyXG5cclxuXHQvLyBkZWZhdWx0IGxheW91dCAoc2VlIGFib3ZlKVxyXG5cdGxheW91dDogXCJiYXNpY1wiLFxyXG5cclxuXHQvLyB0aGlzIHJlZmVycyB0byB0aGUgcG9wdXAgd2luZG93cyBwb3NpdGlvbi4gd2UgY3VycmVudGx5IHN1cHBvcnQ6XHJcblx0Ly8gIC0gYmFubmVyIHBvc2l0aW9uczogdG9wLCBib3R0b21cclxuXHQvLyAgLSBmbG9hdGluZyBwb3NpdGlvbnM6IHRvcC1sZWZ0LCB0b3AtcmlnaHQsIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHRcclxuXHQvL1xyXG5cdC8vIGFkZHMgYSBjbGFzcyBgY2MtZmxvYXRpbmdgIG9yIGBjYy1iYW5uZXJgIHdoaWNoIGhlbHBzIHdoZW4gc3R5bGluZ1xyXG5cdHBvc2l0aW9uOiBcImJvdHRvbVwiLCAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzICdib3R0b20nXHJcblxyXG5cdC8vIEF2YWlsYWJsZSBzdHlsZXNcclxuXHQvLyAgICAtYmxvY2sgKGRlZmF1bHQsIG5vIGV4dHJhIGNsYXNzZXMpXHJcblx0Ly8gICAgLWVkZ2VsZXNzXHJcblx0Ly8gICAgLWNsYXNzaWNcclxuXHQvLyB1c2UgeW91ciBvd24gc3R5bGUgbmFtZSBhbmQgdXNlIGAuY2MtdGhlbWUtU1RZTEVOQU1FYCBjbGFzcyBpbiBDU1MgdG8gZWRpdC5cclxuXHQvLyBOb3RlOiBzdHlsZSBcIndpcmVcIiBpcyB1c2VkIGZvciB0aGUgY29uZmlndXJhdG9yLCBidXQgaGFzIG5vIENTUyBzdHlsZXMgb2YgaXRzIG93biwgb25seSBwYWxldHRlIGlzIHVzZWQuXHJcblx0dGhlbWU6IFwiYmxvY2tcIixcclxuXHJcblx0Ly8gaWYgeW91IHdhbnQgY3VzdG9tIGNvbG91cnMsIHBhc3MgdGhlbSBpbiBoZXJlLiB0aGlzIG9iamVjdCBzaG91bGQgbG9vayBsaWtlIHRoaXMuXHJcblx0Ly8gaWRlYWxseSwgYW55IGN1c3RvbSBjb2xvdXJzL3RoZW1lcyBzaG91bGQgYmUgY3JlYXRlZCBpbiBhIHNlcGFyYXRlIHN0eWxlIHNoZWV0LCBhcyB0aGlzIGlzIG1vcmUgZWZmaWNpZW50LlxyXG5cdC8vICAge1xyXG5cdC8vICAgICBwb3B1cDoge2JhY2tncm91bmQ6ICcjMDAwMDAwJywgdGV4dDogJyNmZmYnLCBsaW5rOiAnI2ZmZid9LFxyXG5cdC8vICAgICBidXR0b246IHtiYWNrZ3JvdW5kOiAndHJhbnNwYXJlbnQnLCBib3JkZXI6ICcjZjhlNzFjJywgdGV4dDogJyNmOGU3MWMnfSxcclxuXHQvLyAgICAgaGlnaGxpZ2h0OiB7YmFja2dyb3VuZDogJyNmOGU3MWMnLCBib3JkZXI6ICcjZjhlNzFjJywgdGV4dDogJyMwMDAwMDAnfSxcclxuXHQvLyAgIH1cclxuXHQvLyBgaGlnaGxpZ2h0YCBpcyBvcHRpb25hbCBhbmQgZXh0ZW5kcyBgYnV0dG9uYC4gaWYgaXQgZXhpc3RzLCBpdCB3aWxsIGFwcGx5IHRvIHRoZSBmaXJzdCBidXR0b25cclxuXHQvLyBvbmx5IGJhY2tncm91bmQgbmVlZHMgdG8gYmUgZGVmaW5lZCBmb3IgZXZlcnkgZWxlbWVudC4gaWYgbm90IHNldCwgb3RoZXIgY29sb3JzIGNhbiBiZSBjYWxjdWxhdGVkIGZyb20gaXRcclxuXHRwYWxldHRlOntcclxuXHRcdHBvcHVwOiB7YmFja2dyb3VuZDogXCIjMjIyMjIyXCJ9LFxyXG5cdFx0YnV0dG9uOiB7YmFja2dyb3VuZDogXCIjMDBiMDUwXCJ9XHJcblx0fSxcclxuXHQvLyBTZXQgdGhpcyB2YWx1ZSB0byB0cnVlIGlmIHlvdSBuZWVkIHRoZSBHb29nbGUgQW5hbHl0aWNzIGNvb2tpZXNcclxuXHQvLyB0byBiZSBkaXNhYmxlZC4gQW5hbHl0aWNzIGNhbiBiZSBhbm9uaW1pemVkIHNvIHRoZSBjb29raWVzXHJcblx0Ly8gZG9uJ3QgaGF2ZSB0byBiZSBkaXNhYmxlZC4gVGFrZSBpbnRvIGFjY291bnQgdGhhdCBpZiB0aGlzIHZhbHVlXHJcblx0Ly8gaXMgc2V0IHRvIGZhbHNlIChhcyBpdCBpcyBieSBkZWZhdWx0KSwgeW91IHNob3VsZCBjb25maWd1cmVcclxuXHQvLyBnb29nbGUgYW5hbHl0aWNzIHRvIGJlIGFub25pbWl6ZWRcclxuXHRyZW1vdmVHQUNvb2tpZXM6IGZhbHNlXHJcbn07XHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgdmVyc2lvbiAgICAgICAgID0gcmVxdWlyZShcIi4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9uO1xyXG5jb25zdCBDb29raWVzSUNHQyA9IHJlcXVpcmUoXCIuL2Nvb2tpZXNJY2djXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0dmVyc2lvbixcclxuXHRDb29raWVzSUNHQ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBwcm9qZWN0IGluIHVzZSBhcyBzcGVjaWZpZWQgaW4gYHBhY2thZ2UuanNvbmAsXHJcbiAqIGBDSEFOR0VMT0cubWRgLCBhbmQgdGhlIEdpdEh1YiByZWxlYXNlLlxyXG4gKlxyXG4gKiBAdmFyIHtzdHJpbmd9IHZlcnNpb25cclxuICovXHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuXHJcbmNsYXNzIFBvcHVwIHtcclxuXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICwgc3RhdHVzTGlzdCAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5zdGF0dXNMaXN0ID0gc3RhdHVzTGlzdDtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuZGVueUhhbmRsZXIgPSBudWxsO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMpIHtcclxuXHJcblx0XHRcdHRoaXMuZGVzdHJveSgpOyAvLyBhbHJlYWR5IHJlbmRlcmVkXHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuXHRcdC8vIHRoZSBmdWxsIG1hcmt1cCBlaXRoZXIgY29udGFpbnMgdGhlIHdyYXBwZXIgb3IgaXQgZG9lcyBub3QgKGZvciBtdWx0aXBsZSBpbnN0YW5jZXMpXHJcblx0XHRjb25zdCBjb29raWVQb3B1cCA9IHRoaXMub3B0aW9ucy53aW5kb3cucmVwbGFjZShcInt7Y2xhc3Nlc319XCIsIHRoaXMuZ2V0UG9wdXBDbGFzc2VzKCkuam9pbihcIiBcIikpXHJcblx0XHRcdC5yZXBsYWNlKFwie3tjaGlsZHJlbn19XCIsIHRoaXMuZ2V0UG9wdXBJbm5lck1hcmt1cCgpKTtcclxuXHJcblx0XHR0aGlzLmVsZW1lbnQgPSB0aGlzLmFwcGVuZE1hcmt1cChjb29raWVQb3B1cCk7XHJcblxyXG5cdFx0dGhpcy5vcGVuKCk7XHJcblxyXG5cdH1cclxuXHJcblx0ZGVzdHJveSgpIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWxsb3dIYW5kbGVyKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1kZW55XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlbnlIYW5kbGVyKTtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuZGVueUhhbmRsZXIgPSBudWxsO1xyXG5cclxuXHRcdGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUpIHtcclxuXHJcblx0XHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcblxyXG5cdFx0fVxyXG5cdFx0dGhpcy5lbGVtZW50ID0gbnVsbDtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdG9wZW4oKSB7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHtcclxuXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLmlzT3BlbigpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcblxyXG5cdFx0XHRVdGlscy5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5vblBvcHVwT3Blbikge1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4oKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xvc2UoKSB7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHtcclxuXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNPcGVuKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLm9uUG9wdXBDbG9zZSkge1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cENsb3NlKCk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzT3BlbigpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSBcIlwiICYmICFVdGlscy5oYXNDbGFzcyh0aGlzLmVsZW1lbnQsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHR9XHJcblxyXG5cdGdldFBvc2l0aW9uQ2xhc3NlcygpIHtcclxuXHJcblx0XHRjb25zdCBwb3NpdGlvbnMgPSB0aGlzLm9wdGlvbnMucG9zaXRpb24uc3BsaXQoXCItXCIpOyAvLyB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHRcclxuXHRcdGNvbnN0IGNsYXNzZXMgPSBbXTtcclxuXHJcblx0XHQvLyB0b3AsIGxlZnQsIHJpZ2h0LCBib3R0b21cclxuXHRcdHBvc2l0aW9ucy5mb3JFYWNoKChjdXIpID0+IHtcclxuXHJcblx0XHRcdGNsYXNzZXMucHVzaChgY2MtJHtjdXJ9YCk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGNsYXNzZXM7XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0UG9wdXBDbGFzc2VzKCkge1xyXG5cclxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblx0XHRsZXQgcG9zaXRpb25TdHlsZSA9IChvcHRzLnBvc2l0aW9uID09PSBcInRvcFwiIHx8IG9wdHMucG9zaXRpb24gPT09IFwiYm90dG9tXCIpID8gXCJiYW5uZXJcIiA6IFwiZmxvYXRpbmdcIjtcclxuXHJcblx0XHRpZiAob3B0cy5pc01vYmlsZSkge1xyXG5cclxuXHRcdFx0cG9zaXRpb25TdHlsZSA9IFwiZmxvYXRpbmdcIjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtcclxuXHRcdFx0YGNjLSR7cG9zaXRpb25TdHlsZX1gLCAvLyBmbG9hdGluZyBvciBiYW5uZXJcclxuXHRcdFx0XCJjYy10eXBlLW9wdC1pblwiLCAvLyBhZGQgdGhlIGNvbXBsaWFuY2UgdHlwZVxyXG5cdFx0XHRgY2MtdGhlbWUtJHtvcHRzLnRoZW1lfWAsIC8vIGFkZCB0aGUgdGhlbWVcclxuXHRcdF07XHJcblxyXG5cdFx0aWYgKG9wdHMuc3RhdGljKSB7XHJcblxyXG5cdFx0XHRjbGFzc2VzLnB1c2goXCJjYy1zdGF0aWNcIik7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGNsYXNzZXMucHVzaC5hcHBseShjbGFzc2VzLCB0aGlzLmdldFBvc2l0aW9uQ2xhc3NlcygpKTtcclxuXHJcblx0XHQvLyB3ZSBvbmx5IGFkZCBleHRyYSBzdHlsZXMgaWYgYHBhbGV0dGVgIGhhcyBiZWVuIHNldCB0byBhIHZhbGlkIHZhbHVlXHJcblx0XHR0aGlzLmF0dGFjaEN1c3RvbVBhbGV0dGUodGhpcy5vcHRpb25zLnBhbGV0dGUpO1xyXG5cclxuXHRcdC8vIGlmIHdlIG92ZXJyaWRlIHRoZSBwYWxldHRlLCBhZGQgdGhlIGNsYXNzIHRoYXQgZW5hYmxlcyB0aGlzXHJcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKSB7XHJcblxyXG5cdFx0XHRjbGFzc2VzLnB1c2godGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNsYXNzZXM7XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0UG9wdXBJbm5lck1hcmt1cCgpIHtcclxuXHJcblx0XHRjb25zdCBpbnRlcnBvbGF0ZWQgPSB7fTtcclxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMob3B0cy5lbGVtZW50cykuZm9yRWFjaCgocHJvcCkgPT4ge1xyXG5cclxuXHRcdFx0aW50ZXJwb2xhdGVkW3Byb3BdID0gVXRpbHMuaW50ZXJwb2xhdGVTdHJpbmcob3B0cy5lbGVtZW50c1twcm9wXSwgKG5hbWUpID0+IHtcclxuXHJcblx0XHRcdFx0Y29uc3Qgc3RyID0gb3B0cy5jb250ZW50W25hbWVdO1xyXG5cdFx0XHRcdHJldHVybiAobmFtZSAmJiB0eXBlb2Ygc3RyID09IFwic3RyaW5nXCIgJiYgc3RyLmxlbmd0aCkgPyBzdHIgOiBcIlwiO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY2hlY2tzIGlmIHRoZSB0eXBlIGlzIHZhbGlkIGFuZCBkZWZhdWx0cyB0byBpbmZvIGlmIGl0J3Mgbm90XHJcblx0XHRjb25zdCBjb21wbGlhbmNlVHlwZSA9IG9wdHMuY29tcGxpYW5jZTtcclxuXHJcblx0XHQvLyBidWlsZCB0aGUgY29tcGxpYW5jZSB0eXBlcyBmcm9tIHRoZSBhbHJlYWR5IGludGVycG9sYXRlZCBgZWxlbWVudHNgXHJcblx0XHRpbnRlcnBvbGF0ZWQuY29tcGxpYW5jZSA9IFV0aWxzLmludGVycG9sYXRlU3RyaW5nKGNvbXBsaWFuY2VUeXBlLCAobmFtZSkgPT4ge1xyXG5cclxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFtuYW1lXTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBjaGVja3MgaWYgdGhlIGxheW91dCBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gYmFzaWMgaWYgaXQncyBub3RcclxuXHRcdGxldCBsYXlvdXQgPSBvcHRzLmxheW91dHNbb3B0cy5sYXlvdXRdO1xyXG5cdFx0aWYgKCFsYXlvdXQpIHtcclxuXHJcblx0XHRcdGxheW91dCA9IG9wdHMubGF5b3V0cy5iYXNpYztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFV0aWxzLmludGVycG9sYXRlU3RyaW5nKGxheW91dCwgKG1hdGNoKSA9PiB7XHJcblxyXG5cdFx0XHRyZXR1cm4gaW50ZXJwb2xhdGVkW21hdGNoXTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHRhcHBlbmRNYXJrdXAobWFya3VwKSB7XHJcblxyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgY29udCA9IChvcHRzLmNvbnRhaW5lciAmJiBvcHRzLmNvbnRhaW5lci5ub2RlVHlwZSA9PT0gMSkgPyBvcHRzLmNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XHJcblxyXG5cdFx0ZGl2LmlubmVySFRNTCA9IG1hcmt1cDtcclxuXHJcblx0XHRjb25zdCBlbCA9IGRpdi5jaGlsZHJlblswXTtcclxuXHJcblx0XHRlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG5cdFx0aWYgKFV0aWxzLmhhc0NsYXNzKGVsLCBcImNjLXdpbmRvd1wiKSkge1xyXG5cclxuXHRcdFx0VXRpbHMuYWRkQ2xhc3MoZWwsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIWNvbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuXHRcdFx0Y29udC5hcHBlbmRDaGlsZChlbCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGNvbnQuaW5zZXJ0QmVmb3JlKGVsLCBjb250LmZpcnN0Q2hpbGQpO1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEFsbG93SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWxsb3dIYW5kbGVyKTtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhbGxiYWNrKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXREZW55SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZW55SGFuZGxlcik7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIEkgbWlnaHQgY2hhbmdlIHRoaXMgZnVuY3Rpb24gdG8gdXNlIGlubGluZSBzdHlsZXMuIEkgb3JpZ2luYWxseSBjaG9zZSBhIHN0eWxlc2hlZXQgYmVjYXVzZSBJIGNvdWxkIHNlbGVjdCBtYW55IGVsZW1lbnRzIHdpdGggYVxyXG5cdC8vIHNpbmdsZSBydWxlIChzb21ldGhpbmcgdGhhdCBoYXBwZW5lZCBhIGxvdCksIHRoZSBhcHBzIGhhcyBjaGFuZ2VkIHNsaWdodGx5IG5vdyB0aG91Z2gsIHNvIGlubGluZSBzdHlsZXMgbWlnaHQgYmUgbW9yZSBhcHBsaWNhYmxlLlxyXG5cdGF0dGFjaEN1c3RvbVBhbGV0dGUocGFsZXR0ZSkge1xyXG5cclxuXHRcdGNvbnN0IGhhc2ggPSBVdGlscy5oYXNoKEpTT04uc3RyaW5naWZ5KHBhbGV0dGUpKTtcclxuXHRcdGNvbnN0IHNlbGVjdG9yID0gYGNjLWNvbG9yLW92ZXJyaWRlLSR7aGFzaH1gO1xyXG5cdFx0Y29uc3QgaXNWYWxpZCA9IFV0aWxzLmlzUGxhaW5PYmplY3QocGFsZXR0ZSk7XHJcblxyXG5cdFx0dGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yID0gaXNWYWxpZCA/IHNlbGVjdG9yIDogbnVsbDtcclxuXHJcblx0XHRpZiAoaXNWYWxpZCkge1xyXG5cclxuXHRcdFx0dGhpcy5hZGRDdXN0b21TdHlsZShoYXNoLCBwYWxldHRlLCBgLiR7c2VsZWN0b3J9YCk7XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblxyXG5cdH1cclxuXHJcblx0YWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgcHJlZml4KSB7XHJcblxyXG5cdFx0Y29uc3QgY29sb3JTdHlsZXMgPSB7fTtcclxuXHRcdGNvbnN0IHBvcHVwID0gcGFsZXR0ZS5wb3B1cDtcclxuXHRcdGNvbnN0IGJ1dHRvbiA9IHBhbGV0dGUuYnV0dG9uO1xyXG5cdFx0Y29uc3QgaGlnaGxpZ2h0ID0gcGFsZXR0ZS5oaWdobGlnaHQ7XHJcblxyXG5cdFx0Ly8gbmVlZHMgYmFja2dyb3VuZCBjb2xvdXIsIHRleHQgYW5kIGxpbmsgd2lsbCBiZSBzZXQgdG8gYmxhY2svd2hpdGUgaWYgbm90IHNwZWNpZmllZFxyXG5cdFx0aWYgKHBvcHVwKSB7XHJcblxyXG5cdFx0XHQvLyBhc3N1bWVzIHBvcHVwLmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdHBvcHVwLnRleHQgPSBwb3B1cC50ZXh0ID8gcG9wdXAudGV4dCA6IFV0aWxzLmdldENvbnRyYXN0KHBvcHVwLmJhY2tncm91bmQpO1xyXG5cdFx0XHRwb3B1cC5saW5rID0gcG9wdXAubGluayA/IHBvcHVwLmxpbmsgOiBwb3B1cC50ZXh0O1xyXG5cdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9LmNjLXdpbmRvd2BdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC50ZXh0fWAsXHJcblx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7cG9wdXAuYmFja2dyb3VuZH1gXHJcblx0XHRcdF07XHJcblx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWxpbmssJHtwcmVmaXh9IC5jYy1saW5rOmFjdGl2ZSwke3ByZWZpeH0gLmNjLWxpbms6dmlzaXRlZGBdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC5saW5rfWBcclxuXHRcdFx0XTtcclxuXHJcblx0XHRcdGlmIChidXR0b24pIHtcclxuXHJcblx0XHRcdFx0Ly8gYXNzdW1lcyBidXR0b24uYmFja2dyb3VuZCBpcyBzZXRcclxuXHRcdFx0XHRidXR0b24udGV4dCA9IGJ1dHRvbi50ZXh0ID8gYnV0dG9uLnRleHQgOiBVdGlscy5nZXRDb250cmFzdChidXR0b24uYmFja2dyb3VuZCk7XHJcblx0XHRcdFx0YnV0dG9uLmJvcmRlciA9IGJ1dHRvbi5ib3JkZXIgPyBidXR0b24uYm9yZGVyIDogXCJ0cmFuc3BhcmVudFwiO1xyXG5cdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWJ0bmBdID0gW1xyXG5cdFx0XHRcdFx0YGNvbG9yOiAke2J1dHRvbi50ZXh0fWAsXHJcblx0XHRcdFx0XHRgYm9yZGVyLWNvbG9yOiAke2J1dHRvbi5ib3JkZXJ9YCxcclxuXHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke2J1dHRvbi5iYWNrZ3JvdW5kfWBcclxuXHRcdFx0XHRdO1xyXG5cclxuXHRcdFx0XHRpZiAoYnV0dG9uLmJhY2tncm91bmQgIT09IFwidHJhbnNwYXJlbnRcIikge1xyXG5cclxuXHRcdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWJ0bjpob3ZlciwgJHtwcmVmaXh9IC5jYy1idG46Zm9jdXNgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7VXRpbHMuZ2V0SG92ZXJDb2xvdXIoYnV0dG9uLmJhY2tncm91bmQpfWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGhpZ2hsaWdodCkge1xyXG5cclxuXHRcdFx0XHQvL2Fzc3VtZXMgaGlnaGxpZ2h0LmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdFx0XHRoaWdobGlnaHQudGV4dCA9IGhpZ2hsaWdodC50ZXh0ID8gaGlnaGxpZ2h0LnRleHQgOiBVdGlscy5nZXRDb250cmFzdChoaWdobGlnaHQuYmFja2dyb3VuZCk7XHJcblx0XHRcdFx0XHRoaWdobGlnaHQuYm9yZGVyID0gaGlnaGxpZ2h0LmJvcmRlciA/IGhpZ2hsaWdodC5ib3JkZXIgOiBcInRyYW5zcGFyZW50XCI7XHJcblx0XHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1oaWdobGlnaHQgLmNjLWJ0bjpmaXJzdC1jaGlsZGBdID0gW1xyXG5cdFx0XHRcdFx0XHRgY29sb3I6ICR7aGlnaGxpZ2h0LnRleHR9YCxcclxuXHRcdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtoaWdobGlnaHQuYm9yZGVyfWAsXHJcblx0XHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke2hpZ2hsaWdodC5iYWNrZ3JvdW5kfWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdC8vIHNldHMgaGlnaGxpZ2h0IHRleHQgY29sb3IgdG8gcG9wdXAgdGV4dC4gYmFja2dyb3VuZCBhbmQgYm9yZGVyIGFyZSB0cmFuc3BhcmVudCBieSBkZWZhdWx0LlxyXG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtaGlnaGxpZ2h0IC5jYy1idG46Zmlyc3QtY2hpbGRgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGNvbG9yOiAke3BvcHVwLnRleHR9YFxyXG5cdFx0XHRcdFx0XTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGlzIHdpbGwgYmUgaW50ZXJwcmV0dGVkIGFzIENTUy4gdGhlIGtleSBpcyB0aGUgc2VsZWN0b3IsIGFuZCBlYWNoIGFycmF5IGVsZW1lbnQgaXMgYSBydWxlXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuXHRcdGxldCBydWxlSW5kZXggPSAtMTtcclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBjb2xvclN0eWxlcykge1xyXG5cclxuXHRcdFx0c3R5bGUuc2hlZXQuaW5zZXJ0UnVsZShgJHtwcm9wfXske2NvbG9yU3R5bGVzW3Byb3BdLmpvaW4oXCI7XCIpfX1gLCArK3J1bGVJbmRleCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNsYXNzIFV0aWxzIHtcclxuXHJcblx0c3RhdGljIGVzY2FwZVJlZ0V4cChzdHIgICAgICAgICkge1xyXG5cclxuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBoYXNDbGFzcyhlbGVtZW50ICAgICAgICAsIHNlbGVjdG9yICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBzID0gXCIgXCI7XHJcblx0XHRjb25zdCBjbGFzc0ZvdW5kID0gKHMgKyBlbGVtZW50LmNsYXNzTmFtZSArIHMpLnJlcGxhY2UoL1tcXG5cXHRdL2csIHMpLmluZGV4T2YocyArIHNlbGVjdG9yICsgcykgPj0gMDtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0cmV0dXJuIGVsZW1lbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmIGNsYXNzRm91bmQ7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZENsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRlbGVtZW50LmNsYXNzTmFtZSArPSBgICR7Y2xhc3NOYW1lfWA7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFxcXFxiJHtVdGlscy5lc2NhcGVSZWdFeHAoY2xhc3NOYW1lKX1cXFxcYmApO1xyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaW50ZXJwb2xhdGVTdHJpbmcoc3RyICAgICAgICAsIGNhbGxiYWNrICAgICAgICAgICkge1xyXG5cclxuXHRcdGNvbnN0IG1hcmtlciA9IC97eyhbYS16XVthLXowLTlcXC1fXSopfX0vaWc7XHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UobWFya2VyLCBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdHJldHVybiBjYWxsYmFjayhhcmd1bWVudHNbMV0pIHx8IFwiXCI7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gb25seSB1c2VkIGZvciBoYXNoaW5nIGpzb24gb2JqZWN0cyAodXNlZCBmb3IgaGFzaCBtYXBwaW5nIHBhbGV0dGUgb2JqZWN0cywgdXNlZCB3aGVuIGN1c3RvbSBjb2xvdXJzIGFyZSBwYXNzZWQgdGhyb3VnaCBKYXZhU2NyaXB0KVxyXG5cdHN0YXRpYyBoYXNoKHN0ciAgICAgICAgKSB7XHJcblxyXG5cdFx0bGV0IGhhc2ggPSAwLFxyXG5cdFx0XHRpLCBjaHIsIGxlbjtcclxuXHRcdGlmIChzdHIubGVuZ3RoID09PSAwKSB7XHJcblxyXG5cdFx0XHRyZXR1cm4gaGFzaDtcclxuXHJcblx0XHR9XHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuXHJcblx0XHRcdGNociA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG5cdFx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaHI7XHJcblx0XHRcdGhhc2ggfD0gMDtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaGFzaDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbm9ybWFsaXNlSGV4KGhleCAgICAgICAgKSB7XHJcblxyXG5cdFx0aWYgKGhleFswXSA9PT0gXCIjXCIpIHtcclxuXHJcblx0XHRcdGhleCA9IGhleC5zdWJzdHIoMSk7XHJcblxyXG5cdFx0fVxyXG5cdFx0aWYgKGhleC5sZW5ndGggPT09IDMpIHtcclxuXHJcblx0XHRcdGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaGV4O1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHVzZWQgdG8gZ2V0IHRleHQgY29sb3JzIGlmIG5vdCBzZXRcclxuXHRzdGF0aWMgZ2V0Q29udHJhc3QoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRoZXggPSBVdGlscy5ub3JtYWxpc2VIZXgoaGV4KTtcclxuXHRcdGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyKDAsIDIpLCAxNik7XHJcblx0XHRjb25zdCBnID0gcGFyc2VJbnQoaGV4LnN1YnN0cigyLCAyKSwgMTYpO1xyXG5cdFx0Y29uc3QgYiA9IHBhcnNlSW50KGhleC5zdWJzdHIoNCwgMiksIDE2KTtcclxuXHRcdGNvbnN0IHlpcSA9ICgociAqIDI5OSkgKyAoZyAqIDU4NykgKyAoYiAqIDExNCkpIC8gMTAwMDtcclxuXHRcdHJldHVybiAoeWlxID49IDEyOCkgPyBcIiMwMDBcIiA6IFwiI2ZmZlwiO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHVzZWQgdG8gY2hhbmdlIGNvbG9yIG9uIGhpZ2hsaWdodFxyXG5cdHN0YXRpYyBnZXRMdW1pbmFuY2UoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBudW0gPSBwYXJzZUludChVdGlscy5ub3JtYWxpc2VIZXgoaGV4KSwgMTYpLFxyXG5cdFx0XHRhbXQgPSAzOCxcclxuXHRcdFx0UiA9IChudW0gPj4gMTYpICsgYW10LFxyXG5cdFx0XHRCID0gKG51bSA+PiA4ICYgMHgwMEZGKSArIGFtdCxcclxuXHRcdFx0RyA9IChudW0gJiAweDAwMDBGRikgKyBhbXQ7XHJcblx0XHRjb25zdCBuZXdDb2xvdXIgPSAoMHgxMDAwMDAwICsgKFIgPCAyNTUgPyBSIDwgMSA/IDAgOiBSIDogMjU1KSAqIDB4MTAwMDAgKyAoQiA8IDI1NSA/IEIgPCAxID8gMCA6IEIgOiAyNTUpICogMHgxMDAgKyAoRyA8IDI1NSA/IEcgPCAxID8gMCA6IEcgOiAyNTUpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XHJcblx0XHRyZXR1cm4gYCMke25ld0NvbG91cn1gO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRIb3ZlckNvbG91cihoZXggICAgICAgICkge1xyXG5cclxuXHRcdGhleCA9IFV0aWxzLm5vcm1hbGlzZUhleChoZXgpO1xyXG5cdFx0Ly8gZm9yIGJsYWNrIGJ1dHRvbnNcclxuXHRcdGlmIChoZXggPT09IFwiMDAwMDAwXCIpIHtcclxuXHJcblx0XHRcdHJldHVybiBcIiMyMjJcIjtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVXRpbHMuZ2V0THVtaW5hbmNlKGhleCk7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGlzTW9iaWxlKHVzZXJBZ2VudCAgICAgICAgKSB7XHJcblxyXG5cdFx0cmV0dXJuIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdCh1c2VyQWdlbnQpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpc1BsYWluT2JqZWN0KG9iaiAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gVGhlIGNvZGUgXCJ0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGxcIiBhbGxvd3MgQXJyYXkgb2JqZWN0c1xyXG5cdFx0cmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhcnJheUNvbnRhaW5zTWF0Y2hlcyhhcnJheSAgICAgICAsIHNlYXJjaCAgICAgICAgKSB7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHJcblx0XHRcdGNvbnN0IHN0ciA9IGFycmF5W2ldO1xyXG5cdFx0XHQvLyBpZiByZWdleCBtYXRjaGVzIG9yIHN0cmluZyBpcyBlcXVhbCwgcmV0dXJuIHRydWVcclxuXHRcdFx0aWYgKChzdHIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgc3RyLnRlc3Qoc2VhcmNoKSkgfHxcclxuXHRcdFx0KHR5cGVvZiBzdHIgPT0gXCJzdHJpbmdcIiAmJiBzdHIubGVuZ3RoICYmIHN0ciA9PT0gc2VhcmNoKSkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2VzIGFsbCB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIHRhcmdldFxyXG5cdCAqIG9iamVjdC4gU3Vib2JqZWN0cyBhcmUgYWxzbyBtZXJnZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gc291cmNlcyBBIGxpc3Qgb2Ygc291cmNlIG9iamVjdHNcclxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgdGFyZ2V0IG9iamVjdFxyXG5cdCAqL1xyXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cdHN0YXRpYyBkZWVwTWVyZ2UodGFyZ2V0ICAgICAgICAsIC4uLnNvdXJjZXMgICAgICAgICkge1xyXG5cclxuXHRcdGxldCBuZXdPYmogPSB0YXJnZXQ7XHJcblx0XHQvLyBhcmd1bWVudHMgaXMgbm90IGFuIEFycmF5LCBpdCdzIEFycmF5LWxpa2UhXHJcblx0XHRjb25zdCBuZXdTb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcblx0XHRuZXdTb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cclxuXHRcdFx0bmV3T2JqID0gVXRpbHMuc2luZ2xlRGVlcE1lcmdlKG5ld09iaiwgc291cmNlKTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3T2JqO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlcyBhbGwgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIHRhcmdldFxyXG5cdCAqIG9iamVjdC4gU3Vib2JqZWN0cyBhcmUgYWxzbyBtZXJnZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIG1lcmdlXHJcblx0ICogQHJldHVybnMge09iamVjdH0gVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgc2luZ2xlRGVlcE1lcmdlKHRhcmdldCAgICAgICAgLCBzb3VyY2UgICAgICAgICkge1xyXG5cclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBzb3VyY2UpIHtcclxuXHJcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYW4gZW51bWVyYWJsZSBwcm9wZXJ0eSBzbyB3ZSBkb24ndFxyXG5cdFx0XHQvLyBvdmVyd3JpdGUgcHJvcGVydGllcyBsaWtlIGxlbmd0aCBvciBmdW5jdGlvbnNcclxuXHRcdFx0aWYgKHNvdXJjZS5wcm9wZXJ0eUlzRW51bWVyYWJsZShwcm9wKSkge1xyXG5cclxuXHRcdFx0XHRsZXQgc291cmNlVmFsdWUgPSBzb3VyY2VbcHJvcF07XHJcblx0XHRcdFx0bGV0IHRhcmdldFZhbHVlID0gdGFyZ2V0W3Byb3BdO1xyXG5cclxuXHRcdFx0XHRpZiAoIXRhcmdldFZhbHVlKSB7XHJcblxyXG5cdFx0XHRcdFx0dGFyZ2V0VmFsdWUgPSB7fTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzb3VyY2VWYWx1ZSkpIHtcclxuXHJcblx0XHRcdFx0XHRzb3VyY2VWYWx1ZSA9IHNvdXJjZVZhbHVlLnNsaWNlKDApO1xyXG5cclxuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheSh0YXJnZXRWYWx1ZSkpIHtcclxuXHJcblx0XHRcdFx0XHRzb3VyY2VWYWx1ZSA9IFV0aWxzLnNpbmdsZURlZXBNZXJnZSh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUpO1xyXG5cclxuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBBcnJheS5pc0FycmF5KHRhcmdldFZhbHVlKSkge1xyXG5cclxuXHRcdFx0XHRcdHNvdXJjZVZhbHVlID0gVXRpbHMuc2luZ2xlRGVlcE1lcmdlKHt9LCBzb3VyY2VWYWx1ZSk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0W3Byb3BdID0gc291cmNlVmFsdWU7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRhcmdldDtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcclxuIl19
