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
	this.enableGA();

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

	this.disableGA();

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9jb29raWVNYW5hZ2VyLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvY29va2llY29uc2VudC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvZGVmYXVsdE9wdGlvbnMuanMiLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9pbmRleC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL3BvcHVwLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxhQUFhOztjQU9YLCtCQUFTLENBQUMsSUFBSSxVQUFVOztDQUUvQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQVUsSUFBSSxtQkFBZSxDQUFDLENBQUM7Q0FDaEUsQUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUV6QixBQUFDLEVBQUM7O0FBRUYsY0FBUSwrQkFBUyxDQUFDLElBQUksVUFBVTs7Q0FFL0IsQUFBQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFB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RSxFQUFFLENBQUMsQ0FBQztDQUMxQyxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ3hELEFBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUV4QyxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELE1BQVEscUNBQVksQ0FBQyxHQUFHLFVBQVU7O0NBRWpDLEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDakQsQUFBQyxHQUFHLEdBQUcsRUFBRTtFQUNULEFBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEdBQUc7RUFDdEIsQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUc7RUFDOUIsQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQzdCLEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUss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QU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQyxBQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztHQUVoQyxBQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7O0lBRWxCLEFBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7R0FFbkIsQUFBQyxDQUFDOztHQUVGLEFBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFOztJQUVoQyxBQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztHQUVyQyxBQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7O0lBRTNFLEFBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDOztHQUVoRSxBQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFOztJQUUxRSxBQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQzs7R0FFdkQsQUFBQyxDQUFDOztHQUVGLEFBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQzs7RUFFN0IsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxNQUFNLENBQUM7O0FBRWhCLEFBQUMsQ0FBQyxDQUVEOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInZlcnNpb25cIjogXCIwLjAuMVwiXG59IiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jbGFzcyBDb29raWVNYW5hZ2VyIHtcclxuXHJcblx0LyoqXHJcblx0ICogZ2V0IHRoZSBjb29raWUgdmFsdWVcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgY29va2llLlxyXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9XHJcblx0ICovXHJcblx0c3RhdGljIGdldENvb2tpZShuYW1lICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IHYgPSBkb2N1bWVudC5jb29raWUubWF0Y2goYChefDspID8ke25hbWV9PShbXjtdKikoO3wkKWApO1xyXG5cdFx0cmV0dXJuIHYgPyB2WzJdIDogbnVsbDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaGFzQ29va2llKG5hbWUgICAgICAgICkge1xyXG5cclxuXHRcdHJldHVybiBDb29raWVNYW5hZ2VyLmdldENvb2tpZShuYW1lKSAhPT0gbnVsbDtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIGNvb2tpZSB2YWx1ZVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkYXlzIFRoZSBudW1iZXJzIG9mIGRheXMgdG8gZXhwaXJlIHRoZSBjb29raWUuXHJcblx0ICovXHJcblx0c3RhdGljIHNldENvb2tpZShuYW1lICAgICAgICAsIHZhbHVlICAgICAgICAsIGRheXMgICAgICAgICwgZG9tYWluICAgICAgICAgLCBwYXRoICAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgZCA9IG5ldyBEYXRlKCk7XHJcblx0XHRkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAyNCAqIDYwICogNjAgKiAxMDAwICogZGF5cyk7XHJcblx0XHRsZXQgY29va2llID0gYCR7bmFtZX09JHt2YWx1ZX07ZXhwaXJlcz0ke2QudG9HTVRTdHJpbmcoKX1gO1xyXG5cdFx0aWYgKHBhdGgpIHtcclxuXHJcblx0XHRcdGNvb2tpZSArPSBgO3BhdGg9JHtwYXRofWA7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGNvb2tpZSArPSBcIjtwYXRoPS9cIjtcclxuXHJcblx0XHR9XHJcblx0XHRpZiAoZG9tYWluKSB7XHJcblxyXG5cdFx0XHRjb29raWUgKz0gYDtkb21haW49JHtkb21haW59YDtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWU7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGVsZXRlIHRoZSBjb29raWVzXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKi9cclxuXHRzdGF0aWMgZGVsZXRlQ29va2llKG5hbWUgICAgICAgICwgZG9tYWluICAgICAgICAgLCBwYXRoICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5zZXRDb29raWUobmFtZSwgXCJcIiwgLTEsIGRvbWFpbiwgcGF0aCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGFsbCBjb29raWVzXHJcblx0ICogQHJldHVybnMge09iamVjdH1cclxuXHQgKi9cclxuXHRzdGF0aWMgZ2V0QWxsQ29va2llcygpIHtcclxuXHJcblx0XHRjb25zdCBjb29raWVzID0ge307XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpLmZvckVhY2goKGl0ZW0pPT57XHJcblxyXG5cdFx0XHRjb25zdCBjb29raWUgPSBpdGVtLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0Y29va2llc1tjb29raWVbMF1dID0gY29va2llWzFdO1xyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIGNvb2tpZXM7XHJcblxyXG5cdH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29va2llTWFuYWdlcjtcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gcmVxdWlyZShcIi4vZGVmYXVsdE9wdGlvbnNcIik7XHJcbmNvbnN0IGNvb2tpZU1hbmFnZXIgPSByZXF1aXJlKFwiLi9jb29raWVNYW5hZ2VyXCIpO1xyXG5jb25zdCBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xyXG5jb25zdCBQb3B1cCA9IHJlcXVpcmUoXCIuL3BvcHVwXCIpO1xyXG5cclxuY2xhc3MgQ29va2llY29uc2VudCB7XHJcblxyXG5cdCAgICAgICAgICAgICAgXHJcblxyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuc3RhdHVzID0ge1xyXG5cdFx0XHRkZW55OiBcImRlbnlcIixcclxuXHRcdFx0YWxsb3c6IFwiYWxsb3dcIlxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBzZXQgb3B0aW9ucyBiYWNrIHRvIGRlZmF1bHQgb3B0aW9uc1xyXG5cdFx0dGhpcy5vcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XHJcblxyXG5cdFx0Ly8gbWVyZ2UgaW4gdXNlciBvcHRpb25zXHJcblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChvcHRpb25zKSkge1xyXG5cclxuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8td2FybmluZy1jb21tZW50c1xyXG5cdFx0Ly8gVE9ETzogbmF2aWdhdG9yIGFuZCBkb2N1bWVudCBzaG91bGRuJ3QgYmUgdXNlZCBoZXJlXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdHRoaXMub3B0aW9ucy51c2VyQWdlbnQgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG5cdFx0dGhpcy5vcHRpb25zLmlzTW9iaWxlID0gVXRpbHMuaXNNb2JpbGUodGhpcy5vcHRpb25zLnVzZXJBZ2VudCk7XHJcblxyXG5cdH1cclxuXHJcblx0Y3JlYXRlUG9wdXAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcblxyXG5cdFx0XHRjb25zdCBwb3B1cCA9IG5ldyBQb3B1cCh0aGlzLm9wdGlvbnMpO1xyXG5cdFx0XHRwb3B1cC5zZXRBbGxvd0hhbmRsZXIoKCk9PntcclxuXHJcblx0XHRcdFx0dGhpcy5zZXRTdGF0dXModGhpcy5zdGF0dXMuYWxsb3cpO1xyXG5cdFx0XHRcdHBvcHVwLmNsb3NlKCk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHBvcHVwLnNldERlbnlIYW5kbGVyKCgpPT57XHJcblxyXG5cdFx0XHRcdHRoaXMuc2V0U3RhdHVzKHRoaXMuc3RhdHVzLmRlbnkpO1xyXG5cdFx0XHRcdHBvcHVwLmNsb3NlKCk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJlc29sdmUocG9wdXApO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHJldHVybnMgdHJ1ZSBpZiB0aGUgY29va2llIGhhcyBhIHZhbGlkIHZhbHVlXHJcblx0aGFzQW5zd2VyZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHRoaXMuZ2V0U3RhdHVzKCkpID49IDA7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gcmV0dXJucyB0cnVlIGlmIHRoZSBjb29raWUgaW5kaWNhdGVzIHRoYXQgY29uc2VudCBoYXMgYmVlbiBnaXZlblxyXG5cdGhhc0NvbnNlbnRlZCgpIHtcclxuXHJcblx0XHRjb25zdCB2YWwgPSB0aGlzLmdldFN0YXR1cygpO1xyXG5cdFx0cmV0dXJuIHZhbCA9PT0gdGhpcy5zdGF0dXMuYWxsb3c7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0U3RhdHVzKHN0YXR1cykge1xyXG5cclxuXHRcdGNvbnN0IGMgPSB0aGlzLm9wdGlvbnMuY29va2llO1xyXG5cdFx0Y29uc3QgdmFsdWUgPSBjb29raWVNYW5hZ2VyLmdldENvb2tpZShjLm5hbWUpO1xyXG5cdFx0Y29uc3QgY2hvc2VuQmVmb3JlID0gT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2YodmFsdWUpID49IDA7XHJcblxyXG5cdFx0Ly8gaWYgYHN0YXR1c2AgaXMgdmFsaWRcclxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZihzdGF0dXMpID49IDApIHtcclxuXHJcblx0XHRcdGNvb2tpZU1hbmFnZXIuc2V0Q29va2llKGMubmFtZSwgc3RhdHVzLCBjLmV4cGlyeURheXMsIGMuZG9tYWluLCBjLnBhdGgpO1xyXG5cclxuXHRcdFx0dGhpcy5jcmVhdGVDb25maWdCdXR0b24oKTtcclxuXHRcdFx0dGhpcy5vcHRpb25zLm9uU3RhdHVzQ2hhbmdlLmNhbGwodGhpcywgc3RhdHVzLCBjaG9zZW5CZWZvcmUpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHR0aGlzLmNsZWFyU3RhdHVzKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGdldFN0YXR1cygpIHtcclxuXHJcblx0XHRyZXR1cm4gY29va2llTWFuYWdlci5nZXRDb29raWUodGhpcy5vcHRpb25zLmNvb2tpZS5uYW1lKTtcclxuXHJcblx0fVxyXG5cclxuXHRjbGVhclN0YXR1cygpIHtcclxuXHJcblx0XHRjb25zdCBjID0gdGhpcy5vcHRpb25zLmNvb2tpZTtcclxuXHRcdGNvb2tpZU1hbmFnZXIuZGVsZXRlQ29va2llKGMubmFtZSwgYy5kb21haW4sIGMucGF0aCk7XHJcblxyXG5cdH1cclxuXHJcblx0b25Jbml0KCkge1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0Fuc3dlcmVkKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuY3JlYXRlQ29uZmlnQnV0dG9uKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGNyZWF0ZUNvbmZpZ0J1dHRvbigpIHtcclxuXHJcblx0XHRjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5jb25maWdCdG5TZWxlY3RvcjtcclxuXHRcdGxldCBidXR0b25IVE1MID0gdGhpcy5vcHRpb25zLmNvbmZpZ0J0bjtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0bGV0IHBhcmVudCA9IGRvY3VtZW50LmJvZHk7XHJcblx0XHRsZXQgYnRuQ2xhc3MgPSBcImNvbmZpZy1wb3B1cFwiO1xyXG5cclxuXHRcdGlmIChpZC50cmltKCkgIT09IFwiXCIpIHtcclxuXHJcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0XHRjb25zdCBkaXZFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCk7XHJcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0XHRwYXJlbnQgPSAoIWRpdkVsZW0pID8gZG9jdW1lbnQuYm9keSA6IGRpdkVsZW07XHJcblx0XHRcdGJ0bkNsYXNzID0gXCJcIjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0YnV0dG9uSFRNTCA9IGJ1dHRvbkhUTUwucmVwbGFjZShcInt7Y29uZmlnLXRleHR9fVwiLCB0aGlzLm9wdGlvbnMuY29udGVudC5jb25maWcpO1xyXG5cdFx0YnV0dG9uSFRNTCA9IGJ1dHRvbkhUTUwucmVwbGFjZShcInt7Y29uZmlnLWNsYXNzfX1cIiwgYnRuQ2xhc3MpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdGVsZW0uaWQgPSBcImNjLWNvbmZpZy1wYXJlbnRcIjtcclxuXHRcdGVsZW0uaW5uZXJIVE1MID0gYnV0dG9uSFRNTDtcclxuXHRcdHBhcmVudC5hcHBlbmRDaGlsZChlbGVtKTtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtY29uZmlnXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLm9uUmVzZXRDb25maWcoKSk7XHJcblxyXG5cdH1cclxuXHJcblx0cmVtb3ZlQ29uZmlnQnV0dG9uKCkge1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgYnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjYy1jb25maWctcGFyZW50XCIpO1xyXG5cclxuXHRcdGlmIChidG4pIHtcclxuXHJcblx0XHRcdGJ0bi5yZW1vdmUoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0b25SZXNldENvbmZpZygpIHtcclxuXHJcblx0XHR0aGlzLnJlbW92ZUNvbmZpZ0J1dHRvbigpO1xyXG5cdFx0dGhpcy5vcHRpb25zLm9uUmVzZXRDb25maWcoKTtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29raWVjb25zZW50O1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IENvb2tpZUNvbnNlbnQgPSByZXF1aXJlKFwiLi9jb29raWVjb25zZW50XCIpO1xyXG5jb25zdCBDb29raWVNYW5hZ2VyID0gcmVxdWlyZShcIi4vY29va2llTWFuYWdlclwiKTtcclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSByZXF1aXJlKFwiLi9kZWZhdWx0T3B0aW9uc1wiKTtcclxuXHJcblxyXG5jbGFzcyBDb29raWVzSUNHQyB7XHJcblxyXG5cdCAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG5cdC8qKlxyXG5cdCAqIEEgYENvb2tpZXNJQ0dDYCBvYmplY3QgcmVwcmVzZW50cyB0aGUgb2JqZWN0IHRoYXQgbWFuYWdlcyB0aGUgY29va2llIGNvbnNlbnQgdW5kZXIgdGhlIEV1cm9wZWFuIEdEUFIgbGF3XHJcblx0ICogZGlzYWJsaW5nIEdvb2dsZSBBbmFseXRpY3MgY29va2llcyBpZiBuZWVkZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiB0aGF0IHNldHMgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IGdhSWRzIEFuIGFycmF5IHdpdGggdGhlIEdvb2dsZSBBbmFseXRpY3MgaWRzXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwgb3B0aW9uc1xyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogdmFyIGNvb2tpZXMgPSBuZXcgQ29va2llc0lDR0MoXCJ3d3cuaW5zdGFtYXBzLmNhdFwiLCBbXCJVQS0xMjM0NTY3OC0xXCJdLCB7cG9zaXRpb246IFwidG9wXCIsIGNvbnRlbnQgeyBtZXNzYWdlOiBcIlZvbHMgY29va2llcz9cIiB9fSk7XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoZG9tYWluICAgICAgICAsIGdhSWRzICAgICAgICAgICAgICAgLCBvcHRpb25zICAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgbWFpbk9wdGlvbnMgPSBVdGlscy5kZWVwTWVyZ2Uoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHRtYWluT3B0aW9ucy5jb29raWUuZG9tYWluID0gZG9tYWluO1xyXG5cdFx0bWFpbk9wdGlvbnMub25Jbml0aWFsaXNlID0gKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHR9O1xyXG5cdFx0bWFpbk9wdGlvbnMub25TdGF0dXNDaGFuZ2UgPSAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLm9uQ2hhbmdlKCk7XHJcblxyXG5cdFx0fTtcclxuXHRcdG1haW5PcHRpb25zLm9uUmVzZXRDb25maWcgPSAgKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vblJlc2V0Q29uZmlnKCk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhRGlzYWJsZVByZWZpeCA9IFwiZ2EtZGlzYWJsZS1cIjtcclxuXHRcdHRoaXMuZ2FJZHMgPSBnYUlkcztcclxuXHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQgPSBuZXcgQ29va2llQ29uc2VudChtYWluT3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuaGFzQW5zd2VyZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBoYXMgYmVlbiBpbml0aWFsaXplZC5cclxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBjb29raWVzIGRlcGVuZGluZyBvbiBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkIG9yIG5vdFxyXG5cdCAqL1xyXG5cdG9uSW5pdCgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuZGlzYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5jb29raWVDb25zZW50Lm9uSW5pdCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBzdGF0dXMgaGFzIGNoYW5nZWQuXHJcblx0ICogRW5hYmxlcyB0aGUgY29va2llcyBpZiBuZWVkZWRcclxuXHQgKi9cclxuXHRvbkNoYW5nZSgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cclxuXHRcdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcInRydWVcIiwgMzY1KTtcclxuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuZGlzYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25maWcgaGFzIGJlZW4gcmVzZXQuXHJcblx0ICogRGlzYWJsZXMgdGhlIGNvb2tpZXNcclxuXHQgKi9cclxuXHRvblJlc2V0Q29uZmlnKCkge1xyXG5cclxuXHRcdHRoaXMuZGVsZXRlQ29va2llcygpO1xyXG5cdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBjb25zZW50ZWRcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRoYXNDb25zZW50ZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNDb25zZW50ZWQoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIHVzZXIgaGFzIGFuc3dlcmVkXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0aGFzQW5zd2VyZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNBbnN3ZXJlZCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvb2tpZXNFbmFibGVkSGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cclxuXHR9XHJcblxyXG5cdGVuYWJsZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IHRydWU7XHJcblx0XHR0aGlzLmVuYWJsZUdBKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlcigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRzZXRDb29raWVzRGlzYWJsZWRIYW5kbGVyKGNhbGxiYWNrICAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cclxuXHR9XHJcblxyXG5cdGRlbGV0ZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgYWN0aXZlQ29va2llcyA9IENvb2tpZU1hbmFnZXIuZ2V0QWxsQ29va2llcygpO1xyXG5cdFx0T2JqZWN0LmtleXMoYWN0aXZlQ29va2llcykuZm9yRWFjaChcclxuXHRcdFx0KGl0ZW0pID0+IHtcclxuXHJcblx0XHRcdFx0Q29va2llTWFuYWdlci5kZWxldGVDb29raWUoaXRlbSk7XHJcblxyXG5cdFx0XHR9XHJcblx0XHQpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpc2FibGVDb29raWVzKCkge1xyXG5cclxuXHRcdHRoaXMuZGlzYWJsZUdBKCk7XHJcblxyXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICh0aGlzLmNvb2tpZXNEaXNhYmxlZEhhbmRsZXIpIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlcigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRhcmVDb29raWVzRW5hYmxlZCgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5hcmVDb29raWVzRW5hYmxlZDtcclxuXHJcblx0fVxyXG5cclxuXHRlbmFibGVHQSgpIHtcclxuXHJcblx0XHR0aGlzLmNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZChmYWxzZSk7XHJcblxyXG5cdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcInRydWVcIiwgMzY1KTtcclxuXHJcblx0fVxyXG5cclxuXHRkaXNhYmxlR0EoKSB7XHJcblxyXG5cdFx0dGhpcy5jaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQodHJ1ZSk7XHJcblxyXG5cdFx0aWYgKENvb2tpZU1hbmFnZXIuaGFzQ29va2llKFwiZ2FFbmFibGVcIikpIHtcclxuXHJcblx0XHRcdENvb2tpZU1hbmFnZXIuc2V0Q29va2llKFwiZ2FFbmFibGVcIiwgXCJmYWxzZVwiLCAzNjUpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRjaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQoc2hvdWxkRGlzYWJsZSAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuZ2FJZHMuZm9yRWFjaChnYUlkID0+IHtcclxuXHJcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0XHR3aW5kb3dbYCR7dGhpcy5nYURpc2FibGVQcmVmaXh9JHtnYUlkfWBdID0gc2hvdWxkRGlzYWJsZTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29raWVzSUNHQztcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcblx0Ly8gb3B0aW9uYWwgKGV4cGVjdGluZyBhIEhUTUwgZWxlbWVudCkgaWYgcGFzc2VkLCB0aGUgcG9wdXAgaXMgYXBwZW5kZWQgdG8gdGhpcyBlbGVtZW50LiBkZWZhdWx0IGlzIGBkb2N1bWVudC5ib2R5YFxyXG5cdGNvbnRhaW5lcjogbnVsbCxcclxuXHJcblx0Ly8gZGVmYXVsdHMgY29va2llIG9wdGlvbnMgLSBpdCBpcyBSRUNPTU1FTkRFRCB0byBzZXQgdGhlc2UgdmFsdWVzIHRvIGNvcnJlc3BvbmQgd2l0aCB5b3VyIHNlcnZlclxyXG5cdGNvb2tpZToge1xyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgbmFtZSBvZiB0aGlzIGNvb2tpZSAtIHlvdSBjYW4gaWdub3JlIHRoaXNcclxuXHRcdG5hbWU6IFwiY29va2llY29uc2VudElDR0Nfc3RhdHVzXCIsXHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgdXJsIHBhdGggdGhhdCB0aGUgY29va2llICduYW1lJyBiZWxvbmdzIHRvLiBUaGUgY29va2llIGNhbiBvbmx5IGJlIHJlYWQgYXQgdGhpcyBsb2NhdGlvblxyXG5cdFx0cGF0aDogXCIvXCIsXHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgZG9tYWluIHRoYXQgdGhlIGNvb2tpZSAnbmFtZScgYmVsb25ncyB0by4gVGhlIGNvb2tpZSBjYW4gb25seSBiZSByZWFkIG9uIHRoaXMgZG9tYWluLlxyXG5cdFx0Ly8gIC0gR3VpZGUgdG8gY29va2llIGRvbWFpbnMgLSBodHRwOi8vZXJpay5pby9ibG9nLzIwMTQvMDMvMDQvZGVmaW5pdGl2ZS1ndWlkZS10by1jb29raWUtZG9tYWlucy9cclxuXHRcdGRvbWFpbjogXCJmaWxlXCIsXHJcblxyXG5cdFx0Ly8gVGhlIGNvb2tpZXMgZXhwaXJlIGRhdGUsIHNwZWNpZmllZCBpbiBkYXlzIChzcGVjaWZ5IC0xIGZvciBubyBleHBpcnkpXHJcblx0XHRleHBpcnlEYXlzOiAzNjUsXHJcblx0fSxcclxuXHJcblx0Ly8gZWFjaCBpdGVtIGRlZmluZXMgdGhlIGlubmVyIHRleHQgZm9yIHRoZSBlbGVtZW50IHRoYXQgaXQgcmVmZXJlbmNlc1xyXG5cdGNvbnRlbnQ6IHtcclxuXHRcdGhlYWRlcjogXCJDb29raWVzIHV0aWxpdHphZGVzIGEgbGEgd2ViIVwiLFxyXG5cdFx0bWVzc2FnZTogXCJVdGlsaXR6ZW0gZ2FsZXRlcyBwZXIgZGlzdGluZ2lyLXZvcyBkJ2FsdHJlcyB1c3VhcmlzIGVuIGVscyBub3N0cmVzIHdlYnMsIHBlciBtaWxsb3JhciBsYSBpbmZvcm1hY2nDsyBpIGVscyBzZXJ2ZWlzIHF1ZSB1cyBvZmVyaW0sIGkgcGVyIGZhY2lsaXRhci12b3MgbCdhY2PDqXMuIFBlciBhIG3DqXMgaW5mb3JtYWNpw7MsIGNvbnN1bHRldSBsYSBcIixcclxuXHRcdGFsbG93OiBcIkFjY2VwdGFyXCIsXHJcblx0XHRkZW55OiBcIlJlYnV0amFyXCIsXHJcblx0XHRsaW5rOiBcInBvbMOtdGljYSBkZSBnYWxldGVzXCIsXHJcblx0XHRocmVmOiBcImh0dHA6Ly93d3cuaWNnYy5jYXQvTC1JQ0dDL1NvYnJlLWwtSUNHQy9Qb2xpdGlxdWVzL1BvbGl0aWNhLWRlLXByb3RlY2Npby1kZS1kYWRlcy1wZXJzb25hbHMvUG9saXRpY2EtZGUtZ2FsZXRlcy1jb29raWVzXCIsXHJcblx0XHRjbG9zZTogXCImI3gyNzRjO1wiLFxyXG5cdFx0Y29uZmlnOiBcIkNvbmZpZ3VyYXIgY29va2llc1wiXHJcblx0fSxcclxuXHJcblx0Ly8gVGhpcyBpcyB0aGUgSFRNTCBmb3IgdGhlIGVsZW1lbnRzIGFib3ZlLiBUaGUgc3RyaW5nIHt7aGVhZGVyfX0gd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBlcXVpdmFsZW50IHRleHQgYmVsb3cuXHJcblx0Ly8gWW91IGNhbiByZW1vdmUgXCJ7e2hlYWRlcn19XCIgYW5kIHdyaXRlIHRoZSBjb250ZW50IGRpcmVjdGx5IGluc2lkZSB0aGUgSFRNTCBpZiB5b3Ugd2FudC5cclxuXHQvL1xyXG5cdC8vICAtIEFSSUEgcnVsZXMgc3VnZ2VzdCB0byBlbnN1cmUgY29udHJvbHMgYXJlIHRhYmJhYmxlIChzbyB0aGUgYnJvd3NlciBjYW4gZmluZCB0aGUgZmlyc3QgY29udHJvbCksXHJcblx0Ly8gICAgYW5kIHRvIHNldCB0aGUgZm9jdXMgdG8gdGhlIGZpcnN0IGludGVyYWN0aXZlIGNvbnRyb2wgKGh0dHA6Ly93M2MuZ2l0aHViLmlvL2FyaWEtaW4taHRtbC8pXHJcblx0ZWxlbWVudHM6IHtcclxuXHRcdGhlYWRlcjogXCI8c3BhbiBjbGFzcz1cXFwiY2MtaGVhZGVyXFxcIj57e2hlYWRlcn19PC9zcGFuPiZuYnNwO1wiLFxyXG5cdFx0bWVzc2FnZTogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX08L3NwYW4+XCIsXHJcblx0XHRtZXNzYWdlbGluazogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX0gPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiByZWw9XFxcIm5vb3BlbmVyIG5vcmVmZXJyZXIgbm9mb2xsb3dcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj57e2xpbmt9fTwvYT48L3NwYW4+XCIsXHJcblx0XHRhbGxvdzogXCI8YSBhcmlhLWxhYmVsPVxcXCJhbGxvdyBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgIGNsYXNzPVxcXCJjYy1idG4gY2MtYWxsb3dcXFwiPnt7YWxsb3d9fTwvYT5cIixcclxuXHRcdGRlbnk6IFwiPGEgYXJpYS1sYWJlbD1cXFwiZGVueSBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWJ0biBjYy1kZW55XFxcIj57e2Rlbnl9fTwvYT5cIixcclxuXHRcdGxpbms6IFwiPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+e3tsaW5rfX08L2E+XCIsXHJcblx0XHRjbG9zZTogXCI8c3BhbiBhcmlhLWxhYmVsPVxcXCJkaXNtaXNzIGNvb2tpZSBtZXNzYWdlXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWNsb3NlXFxcIj57e2Nsb3NlfX08L3NwYW4+XCIsXHJcblx0fSxcclxuXHJcblx0Ly8gVGhlIHBsYWNlaG9sZGVycyB7e2NsYXNzZXN9fSBhbmQge3tjaGlsZHJlbn19IGJvdGggZ2V0IHJlcGxhY2VkIGR1cmluZyBpbml0aWFsaXNhdGlvbjpcclxuXHQvLyAgLSB7e2NsYXNzZXN9fSBpcyB3aGVyZSBhZGRpdGlvbmFsIGNsYXNzZXMgZ2V0IGFkZGVkXHJcblx0Ly8gIC0ge3tjaGlsZHJlbn19IGlzIHdoZXJlIHRoZSBIVE1MIGNoaWxkcmVuIGFyZSBwbGFjZWRcclxuXHR3aW5kb3c6IFwiPGRpdiByb2xlPVxcXCJkaWFsb2dcXFwiIGFyaWEtbGl2ZT1cXFwicG9saXRlXFxcIiBhcmlhLWxhYmVsPVxcXCJjb29raWVjb25zZW50XFxcIiBhcmlhLWRlc2NyaWJlZGJ5PVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy13aW5kb3cge3tjbGFzc2VzfX1cXFwiPjwhLS1nb29nbGVvZmY6IGFsbC0tPnt7Y2hpbGRyZW59fTwhLS1nb29nbGVvbjogYWxsLS0+PC9kaXY+XCIsXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIGh0bWwgZm9yIHRoZSBjb25maWcgYnV0dG9uLiBUaGlzIG9ubHkgc2hvd3MgdXAgYWZ0ZXIgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIHRoZWlyIGxldmVsIG9mIGNvbnNlbnRcclxuXHQvLyBJdCBtdXN0IGluY2x1ZGUgdGhlIGNjLWNvbmZpZyBjbGFzc1xyXG5cdGNvbmZpZ0J0bjogXCI8ZGl2IGNsYXNzPVxcXCJjYy1jb25maWcge3tjb25maWctY2xhc3N9fVxcXCI+PGltZyBzcmM9XFxcImh0dHBzOi8vZ2VuY2F0LmdpdGh1Yi5pby9JQ0dDLUNvb2tpZS1HRFBSL2Rpc3QvY29va2llLWljb24tMjQucG5nXFxcIiBzdHlsZT1cXFwibWFyZ2luLXJpZ2h0OiA1cHg7XFxcIi8+e3tjb25maWctdGV4dH19PC9kaXY+XCIsXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIGVsZW1lbnQgc2VsZWN0b3Igd2hlcmUgdGhlIGNvbmZpZyBidXR0b24gd2lsbCBiZSBhZGRlZFxyXG5cdGNvbmZpZ0J0blNlbGVjdG9yOiBcIlwiLFxyXG5cclxuXHQvLyBkZWZpbmUgdHlwZXMgb2YgJ2NvbXBsaWFuY2UnIGhlcmUuICd7e3ZhbHVlfX0nIHN0cmluZ3MgaW4gaGVyZSBhcmUgbGlua2VkIHRvIGBlbGVtZW50c2BcclxuXHRjb21wbGlhbmNlOiBcIjxkaXYgY2xhc3M9XFxcImNjLWNvbXBsaWFuY2UgY2MtaGlnaGxpZ2h0XFxcIj57e2Rlbnl9fXt7YWxsb3d9fTwvZGl2PlwiLFxyXG5cclxuXHQvLyBkZWZpbmUgbGF5b3V0IGxheW91dHMgaGVyZVxyXG5cdGxheW91dHM6IHtcclxuXHRcdC8vIHRoZSAnYmxvY2snIGxheW91dCB0ZW5kIHRvIGJlIGZvciBzcXVhcmUgZmxvYXRpbmcgcG9wdXBzXHJcblx0XHRcImJhc2ljXCI6IFwie3ttZXNzYWdlbGlua319e3tjb21wbGlhbmNlfX1cIixcclxuXHRcdFwiYmFzaWMtY2xvc2VcIjogXCJ7e21lc3NhZ2VsaW5rfX17e2NvbXBsaWFuY2V9fXt7Y2xvc2V9fVwiLFxyXG5cdFx0XCJiYXNpYy1oZWFkZXJcIjogXCJ7e2hlYWRlcn19e3ttZXNzYWdlfX17e2xpbmt9fXt7Y29tcGxpYW5jZX19XCIsXHJcblx0fSxcclxuXHJcblx0Ly8gZGVmYXVsdCBsYXlvdXQgKHNlZSBhYm92ZSlcclxuXHRsYXlvdXQ6IFwiYmFzaWNcIixcclxuXHJcblx0Ly8gdGhpcyByZWZlcnMgdG8gdGhlIHBvcHVwIHdpbmRvd3MgcG9zaXRpb24uIHdlIGN1cnJlbnRseSBzdXBwb3J0OlxyXG5cdC8vICAtIGJhbm5lciBwb3NpdGlvbnM6IHRvcCwgYm90dG9tXHJcblx0Ly8gIC0gZmxvYXRpbmcgcG9zaXRpb25zOiB0b3AtbGVmdCwgdG9wLXJpZ2h0LCBib3R0b20tbGVmdCwgYm90dG9tLXJpZ2h0XHJcblx0Ly9cclxuXHQvLyBhZGRzIGEgY2xhc3MgYGNjLWZsb2F0aW5nYCBvciBgY2MtYmFubmVyYCB3aGljaCBoZWxwcyB3aGVuIHN0eWxpbmdcclxuXHRwb3NpdGlvbjogXCJib3R0b21cIiwgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyAnYm90dG9tJ1xyXG5cclxuXHQvLyBBdmFpbGFibGUgc3R5bGVzXHJcblx0Ly8gICAgLWJsb2NrIChkZWZhdWx0LCBubyBleHRyYSBjbGFzc2VzKVxyXG5cdC8vICAgIC1lZGdlbGVzc1xyXG5cdC8vICAgIC1jbGFzc2ljXHJcblx0Ly8gdXNlIHlvdXIgb3duIHN0eWxlIG5hbWUgYW5kIHVzZSBgLmNjLXRoZW1lLVNUWUxFTkFNRWAgY2xhc3MgaW4gQ1NTIHRvIGVkaXQuXHJcblx0Ly8gTm90ZTogc3R5bGUgXCJ3aXJlXCIgaXMgdXNlZCBmb3IgdGhlIGNvbmZpZ3VyYXRvciwgYnV0IGhhcyBubyBDU1Mgc3R5bGVzIG9mIGl0cyBvd24sIG9ubHkgcGFsZXR0ZSBpcyB1c2VkLlxyXG5cdHRoZW1lOiBcImJsb2NrXCIsXHJcblxyXG5cdC8vIGlmIHlvdSB3YW50IGN1c3RvbSBjb2xvdXJzLCBwYXNzIHRoZW0gaW4gaGVyZS4gdGhpcyBvYmplY3Qgc2hvdWxkIGxvb2sgbGlrZSB0aGlzLlxyXG5cdC8vIGlkZWFsbHksIGFueSBjdXN0b20gY29sb3Vycy90aGVtZXMgc2hvdWxkIGJlIGNyZWF0ZWQgaW4gYSBzZXBhcmF0ZSBzdHlsZSBzaGVldCwgYXMgdGhpcyBpcyBtb3JlIGVmZmljaWVudC5cclxuXHQvLyAgIHtcclxuXHQvLyAgICAgcG9wdXA6IHtiYWNrZ3JvdW5kOiAnIzAwMDAwMCcsIHRleHQ6ICcjZmZmJywgbGluazogJyNmZmYnfSxcclxuXHQvLyAgICAgYnV0dG9uOiB7YmFja2dyb3VuZDogJ3RyYW5zcGFyZW50JywgYm9yZGVyOiAnI2Y4ZTcxYycsIHRleHQ6ICcjZjhlNzFjJ30sXHJcblx0Ly8gICAgIGhpZ2hsaWdodDoge2JhY2tncm91bmQ6ICcjZjhlNzFjJywgYm9yZGVyOiAnI2Y4ZTcxYycsIHRleHQ6ICcjMDAwMDAwJ30sXHJcblx0Ly8gICB9XHJcblx0Ly8gYGhpZ2hsaWdodGAgaXMgb3B0aW9uYWwgYW5kIGV4dGVuZHMgYGJ1dHRvbmAuIGlmIGl0IGV4aXN0cywgaXQgd2lsbCBhcHBseSB0byB0aGUgZmlyc3QgYnV0dG9uXHJcblx0Ly8gb25seSBiYWNrZ3JvdW5kIG5lZWRzIHRvIGJlIGRlZmluZWQgZm9yIGV2ZXJ5IGVsZW1lbnQuIGlmIG5vdCBzZXQsIG90aGVyIGNvbG9ycyBjYW4gYmUgY2FsY3VsYXRlZCBmcm9tIGl0XHJcblx0cGFsZXR0ZTp7XHJcblx0XHRwb3B1cDoge2JhY2tncm91bmQ6IFwiIzIyMjIyMlwifSxcclxuXHRcdGJ1dHRvbjoge2JhY2tncm91bmQ6IFwiIzAwYjA1MFwifVxyXG5cdH0sXHJcbn07XHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgdmVyc2lvbiAgICAgICAgID0gcmVxdWlyZShcIi4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9uO1xyXG5jb25zdCBDb29raWVzSUNHQyA9IHJlcXVpcmUoXCIuL2Nvb2tpZXNJY2djXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0dmVyc2lvbixcclxuXHRDb29raWVzSUNHQ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBwcm9qZWN0IGluIHVzZSBhcyBzcGVjaWZpZWQgaW4gYHBhY2thZ2UuanNvbmAsXHJcbiAqIGBDSEFOR0VMT0cubWRgLCBhbmQgdGhlIEdpdEh1YiByZWxlYXNlLlxyXG4gKlxyXG4gKiBAdmFyIHtzdHJpbmd9IHZlcnNpb25cclxuICovXHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuXHJcbmNsYXNzIFBvcHVwIHtcclxuXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICwgc3RhdHVzTGlzdCAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5zdGF0dXNMaXN0ID0gc3RhdHVzTGlzdDtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuZGVueUhhbmRsZXIgPSBudWxsO1xyXG5cclxuXHRcdGlmICh0aGlzLm9wdGlvbnMpIHtcclxuXHJcblx0XHRcdHRoaXMuZGVzdHJveSgpOyAvLyBhbHJlYWR5IHJlbmRlcmVkXHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuXHRcdC8vIHRoZSBmdWxsIG1hcmt1cCBlaXRoZXIgY29udGFpbnMgdGhlIHdyYXBwZXIgb3IgaXQgZG9lcyBub3QgKGZvciBtdWx0aXBsZSBpbnN0YW5jZXMpXHJcblx0XHRjb25zdCBjb29raWVQb3B1cCA9IHRoaXMub3B0aW9ucy53aW5kb3cucmVwbGFjZShcInt7Y2xhc3Nlc319XCIsIHRoaXMuZ2V0UG9wdXBDbGFzc2VzKCkuam9pbihcIiBcIikpXHJcblx0XHRcdC5yZXBsYWNlKFwie3tjaGlsZHJlbn19XCIsIHRoaXMuZ2V0UG9wdXBJbm5lck1hcmt1cCgpKTtcclxuXHJcblx0XHR0aGlzLmVsZW1lbnQgPSB0aGlzLmFwcGVuZE1hcmt1cChjb29raWVQb3B1cCk7XHJcblxyXG5cdFx0dGhpcy5vcGVuKCk7XHJcblxyXG5cdH1cclxuXHJcblx0ZGVzdHJveSgpIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWxsb3dIYW5kbGVyKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1kZW55XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlbnlIYW5kbGVyKTtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuZGVueUhhbmRsZXIgPSBudWxsO1xyXG5cclxuXHRcdGlmICh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUpIHtcclxuXHJcblx0XHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcblxyXG5cdFx0fVxyXG5cdFx0dGhpcy5lbGVtZW50ID0gbnVsbDtcclxuXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdG9wZW4oKSB7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHtcclxuXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCF0aGlzLmlzT3BlbigpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcblxyXG5cdFx0XHRVdGlscy5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5vblBvcHVwT3Blbikge1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4oKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xvc2UoKSB7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHtcclxuXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNPcGVuKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLm9uUG9wdXBDbG9zZSkge1xyXG5cclxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cENsb3NlKCk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzT3BlbigpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSBcIlwiICYmICFVdGlscy5oYXNDbGFzcyh0aGlzLmVsZW1lbnQsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHR9XHJcblxyXG5cdGdldFBvc2l0aW9uQ2xhc3NlcygpIHtcclxuXHJcblx0XHRjb25zdCBwb3NpdGlvbnMgPSB0aGlzLm9wdGlvbnMucG9zaXRpb24uc3BsaXQoXCItXCIpOyAvLyB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHRcclxuXHRcdGNvbnN0IGNsYXNzZXMgPSBbXTtcclxuXHJcblx0XHQvLyB0b3AsIGxlZnQsIHJpZ2h0LCBib3R0b21cclxuXHRcdHBvc2l0aW9ucy5mb3JFYWNoKChjdXIpID0+IHtcclxuXHJcblx0XHRcdGNsYXNzZXMucHVzaChgY2MtJHtjdXJ9YCk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIGNsYXNzZXM7XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0UG9wdXBDbGFzc2VzKCkge1xyXG5cclxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblx0XHRsZXQgcG9zaXRpb25TdHlsZSA9IChvcHRzLnBvc2l0aW9uID09PSBcInRvcFwiIHx8IG9wdHMucG9zaXRpb24gPT09IFwiYm90dG9tXCIpID8gXCJiYW5uZXJcIiA6IFwiZmxvYXRpbmdcIjtcclxuXHJcblx0XHRpZiAob3B0cy5pc01vYmlsZSkge1xyXG5cclxuXHRcdFx0cG9zaXRpb25TdHlsZSA9IFwiZmxvYXRpbmdcIjtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtcclxuXHRcdFx0YGNjLSR7cG9zaXRpb25TdHlsZX1gLCAvLyBmbG9hdGluZyBvciBiYW5uZXJcclxuXHRcdFx0XCJjYy10eXBlLW9wdC1pblwiLCAvLyBhZGQgdGhlIGNvbXBsaWFuY2UgdHlwZVxyXG5cdFx0XHRgY2MtdGhlbWUtJHtvcHRzLnRoZW1lfWAsIC8vIGFkZCB0aGUgdGhlbWVcclxuXHRcdF07XHJcblxyXG5cdFx0aWYgKG9wdHMuc3RhdGljKSB7XHJcblxyXG5cdFx0XHRjbGFzc2VzLnB1c2goXCJjYy1zdGF0aWNcIik7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGNsYXNzZXMucHVzaC5hcHBseShjbGFzc2VzLCB0aGlzLmdldFBvc2l0aW9uQ2xhc3NlcygpKTtcclxuXHJcblx0XHQvLyB3ZSBvbmx5IGFkZCBleHRyYSBzdHlsZXMgaWYgYHBhbGV0dGVgIGhhcyBiZWVuIHNldCB0byBhIHZhbGlkIHZhbHVlXHJcblx0XHR0aGlzLmF0dGFjaEN1c3RvbVBhbGV0dGUodGhpcy5vcHRpb25zLnBhbGV0dGUpO1xyXG5cclxuXHRcdC8vIGlmIHdlIG92ZXJyaWRlIHRoZSBwYWxldHRlLCBhZGQgdGhlIGNsYXNzIHRoYXQgZW5hYmxlcyB0aGlzXHJcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKSB7XHJcblxyXG5cdFx0XHRjbGFzc2VzLnB1c2godGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNsYXNzZXM7XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0UG9wdXBJbm5lck1hcmt1cCgpIHtcclxuXHJcblx0XHRjb25zdCBpbnRlcnBvbGF0ZWQgPSB7fTtcclxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG5cdFx0T2JqZWN0LmtleXMob3B0cy5lbGVtZW50cykuZm9yRWFjaCgocHJvcCkgPT4ge1xyXG5cclxuXHRcdFx0aW50ZXJwb2xhdGVkW3Byb3BdID0gVXRpbHMuaW50ZXJwb2xhdGVTdHJpbmcob3B0cy5lbGVtZW50c1twcm9wXSwgKG5hbWUpID0+IHtcclxuXHJcblx0XHRcdFx0Y29uc3Qgc3RyID0gb3B0cy5jb250ZW50W25hbWVdO1xyXG5cdFx0XHRcdHJldHVybiAobmFtZSAmJiB0eXBlb2Ygc3RyID09IFwic3RyaW5nXCIgJiYgc3RyLmxlbmd0aCkgPyBzdHIgOiBcIlwiO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY2hlY2tzIGlmIHRoZSB0eXBlIGlzIHZhbGlkIGFuZCBkZWZhdWx0cyB0byBpbmZvIGlmIGl0J3Mgbm90XHJcblx0XHRjb25zdCBjb21wbGlhbmNlVHlwZSA9IG9wdHMuY29tcGxpYW5jZTtcclxuXHJcblx0XHQvLyBidWlsZCB0aGUgY29tcGxpYW5jZSB0eXBlcyBmcm9tIHRoZSBhbHJlYWR5IGludGVycG9sYXRlZCBgZWxlbWVudHNgXHJcblx0XHRpbnRlcnBvbGF0ZWQuY29tcGxpYW5jZSA9IFV0aWxzLmludGVycG9sYXRlU3RyaW5nKGNvbXBsaWFuY2VUeXBlLCAobmFtZSkgPT4ge1xyXG5cclxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFtuYW1lXTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBjaGVja3MgaWYgdGhlIGxheW91dCBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gYmFzaWMgaWYgaXQncyBub3RcclxuXHRcdGxldCBsYXlvdXQgPSBvcHRzLmxheW91dHNbb3B0cy5sYXlvdXRdO1xyXG5cdFx0aWYgKCFsYXlvdXQpIHtcclxuXHJcblx0XHRcdGxheW91dCA9IG9wdHMubGF5b3V0cy5iYXNpYztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIFV0aWxzLmludGVycG9sYXRlU3RyaW5nKGxheW91dCwgKG1hdGNoKSA9PiB7XHJcblxyXG5cdFx0XHRyZXR1cm4gaW50ZXJwb2xhdGVkW21hdGNoXTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHRhcHBlbmRNYXJrdXAobWFya3VwKSB7XHJcblxyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgY29udCA9IChvcHRzLmNvbnRhaW5lciAmJiBvcHRzLmNvbnRhaW5lci5ub2RlVHlwZSA9PT0gMSkgPyBvcHRzLmNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XHJcblxyXG5cdFx0ZGl2LmlubmVySFRNTCA9IG1hcmt1cDtcclxuXHJcblx0XHRjb25zdCBlbCA9IGRpdi5jaGlsZHJlblswXTtcclxuXHJcblx0XHRlbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG5cdFx0aWYgKFV0aWxzLmhhc0NsYXNzKGVsLCBcImNjLXdpbmRvd1wiKSkge1xyXG5cclxuXHRcdFx0VXRpbHMuYWRkQ2xhc3MoZWwsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIWNvbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuXHRcdFx0Y29udC5hcHBlbmRDaGlsZChlbCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGNvbnQuaW5zZXJ0QmVmb3JlKGVsLCBjb250LmZpcnN0Q2hpbGQpO1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEFsbG93SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWxsb3dIYW5kbGVyKTtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhbGxiYWNrKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXREZW55SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZW55SGFuZGxlcik7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIEkgbWlnaHQgY2hhbmdlIHRoaXMgZnVuY3Rpb24gdG8gdXNlIGlubGluZSBzdHlsZXMuIEkgb3JpZ2luYWxseSBjaG9zZSBhIHN0eWxlc2hlZXQgYmVjYXVzZSBJIGNvdWxkIHNlbGVjdCBtYW55IGVsZW1lbnRzIHdpdGggYVxyXG5cdC8vIHNpbmdsZSBydWxlIChzb21ldGhpbmcgdGhhdCBoYXBwZW5lZCBhIGxvdCksIHRoZSBhcHBzIGhhcyBjaGFuZ2VkIHNsaWdodGx5IG5vdyB0aG91Z2gsIHNvIGlubGluZSBzdHlsZXMgbWlnaHQgYmUgbW9yZSBhcHBsaWNhYmxlLlxyXG5cdGF0dGFjaEN1c3RvbVBhbGV0dGUocGFsZXR0ZSkge1xyXG5cclxuXHRcdGNvbnN0IGhhc2ggPSBVdGlscy5oYXNoKEpTT04uc3RyaW5naWZ5KHBhbGV0dGUpKTtcclxuXHRcdGNvbnN0IHNlbGVjdG9yID0gYGNjLWNvbG9yLW92ZXJyaWRlLSR7aGFzaH1gO1xyXG5cdFx0Y29uc3QgaXNWYWxpZCA9IFV0aWxzLmlzUGxhaW5PYmplY3QocGFsZXR0ZSk7XHJcblxyXG5cdFx0dGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yID0gaXNWYWxpZCA/IHNlbGVjdG9yIDogbnVsbDtcclxuXHJcblx0XHRpZiAoaXNWYWxpZCkge1xyXG5cclxuXHRcdFx0dGhpcy5hZGRDdXN0b21TdHlsZShoYXNoLCBwYWxldHRlLCBgLiR7c2VsZWN0b3J9YCk7XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblxyXG5cdH1cclxuXHJcblx0YWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgcHJlZml4KSB7XHJcblxyXG5cdFx0Y29uc3QgY29sb3JTdHlsZXMgPSB7fTtcclxuXHRcdGNvbnN0IHBvcHVwID0gcGFsZXR0ZS5wb3B1cDtcclxuXHRcdGNvbnN0IGJ1dHRvbiA9IHBhbGV0dGUuYnV0dG9uO1xyXG5cdFx0Y29uc3QgaGlnaGxpZ2h0ID0gcGFsZXR0ZS5oaWdobGlnaHQ7XHJcblxyXG5cdFx0Ly8gbmVlZHMgYmFja2dyb3VuZCBjb2xvdXIsIHRleHQgYW5kIGxpbmsgd2lsbCBiZSBzZXQgdG8gYmxhY2svd2hpdGUgaWYgbm90IHNwZWNpZmllZFxyXG5cdFx0aWYgKHBvcHVwKSB7XHJcblxyXG5cdFx0XHQvLyBhc3N1bWVzIHBvcHVwLmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdHBvcHVwLnRleHQgPSBwb3B1cC50ZXh0ID8gcG9wdXAudGV4dCA6IFV0aWxzLmdldENvbnRyYXN0KHBvcHVwLmJhY2tncm91bmQpO1xyXG5cdFx0XHRwb3B1cC5saW5rID0gcG9wdXAubGluayA/IHBvcHVwLmxpbmsgOiBwb3B1cC50ZXh0O1xyXG5cdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9LmNjLXdpbmRvd2BdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC50ZXh0fWAsXHJcblx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7cG9wdXAuYmFja2dyb3VuZH1gXHJcblx0XHRcdF07XHJcblx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWxpbmssJHtwcmVmaXh9IC5jYy1saW5rOmFjdGl2ZSwke3ByZWZpeH0gLmNjLWxpbms6dmlzaXRlZGBdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC5saW5rfWBcclxuXHRcdFx0XTtcclxuXHJcblx0XHRcdGlmIChidXR0b24pIHtcclxuXHJcblx0XHRcdFx0Ly8gYXNzdW1lcyBidXR0b24uYmFja2dyb3VuZCBpcyBzZXRcclxuXHRcdFx0XHRidXR0b24udGV4dCA9IGJ1dHRvbi50ZXh0ID8gYnV0dG9uLnRleHQgOiBVdGlscy5nZXRDb250cmFzdChidXR0b24uYmFja2dyb3VuZCk7XHJcblx0XHRcdFx0YnV0dG9uLmJvcmRlciA9IGJ1dHRvbi5ib3JkZXIgPyBidXR0b24uYm9yZGVyIDogXCJ0cmFuc3BhcmVudFwiO1xyXG5cdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWJ0bmBdID0gW1xyXG5cdFx0XHRcdFx0YGNvbG9yOiAke2J1dHRvbi50ZXh0fWAsXHJcblx0XHRcdFx0XHRgYm9yZGVyLWNvbG9yOiAke2J1dHRvbi5ib3JkZXJ9YCxcclxuXHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke2J1dHRvbi5iYWNrZ3JvdW5kfWBcclxuXHRcdFx0XHRdO1xyXG5cclxuXHRcdFx0XHRpZiAoYnV0dG9uLmJhY2tncm91bmQgIT09IFwidHJhbnNwYXJlbnRcIikge1xyXG5cclxuXHRcdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWJ0bjpob3ZlciwgJHtwcmVmaXh9IC5jYy1idG46Zm9jdXNgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7VXRpbHMuZ2V0SG92ZXJDb2xvdXIoYnV0dG9uLmJhY2tncm91bmQpfWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGhpZ2hsaWdodCkge1xyXG5cclxuXHRcdFx0XHQvL2Fzc3VtZXMgaGlnaGxpZ2h0LmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdFx0XHRoaWdobGlnaHQudGV4dCA9IGhpZ2hsaWdodC50ZXh0ID8gaGlnaGxpZ2h0LnRleHQgOiBVdGlscy5nZXRDb250cmFzdChoaWdobGlnaHQuYmFja2dyb3VuZCk7XHJcblx0XHRcdFx0XHRoaWdobGlnaHQuYm9yZGVyID0gaGlnaGxpZ2h0LmJvcmRlciA/IGhpZ2hsaWdodC5ib3JkZXIgOiBcInRyYW5zcGFyZW50XCI7XHJcblx0XHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1oaWdobGlnaHQgLmNjLWJ0bjpmaXJzdC1jaGlsZGBdID0gW1xyXG5cdFx0XHRcdFx0XHRgY29sb3I6ICR7aGlnaGxpZ2h0LnRleHR9YCxcclxuXHRcdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtoaWdobGlnaHQuYm9yZGVyfWAsXHJcblx0XHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke2hpZ2hsaWdodC5iYWNrZ3JvdW5kfWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdC8vIHNldHMgaGlnaGxpZ2h0IHRleHQgY29sb3IgdG8gcG9wdXAgdGV4dC4gYmFja2dyb3VuZCBhbmQgYm9yZGVyIGFyZSB0cmFuc3BhcmVudCBieSBkZWZhdWx0LlxyXG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtaGlnaGxpZ2h0IC5jYy1idG46Zmlyc3QtY2hpbGRgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGNvbG9yOiAke3BvcHVwLnRleHR9YFxyXG5cdFx0XHRcdFx0XTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGlzIHdpbGwgYmUgaW50ZXJwcmV0dGVkIGFzIENTUy4gdGhlIGtleSBpcyB0aGUgc2VsZWN0b3IsIGFuZCBlYWNoIGFycmF5IGVsZW1lbnQgaXMgYSBydWxlXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuXHRcdGxldCBydWxlSW5kZXggPSAtMTtcclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBjb2xvclN0eWxlcykge1xyXG5cclxuXHRcdFx0c3R5bGUuc2hlZXQuaW5zZXJ0UnVsZShgJHtwcm9wfXske2NvbG9yU3R5bGVzW3Byb3BdLmpvaW4oXCI7XCIpfX1gLCArK3J1bGVJbmRleCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNsYXNzIFV0aWxzIHtcclxuXHJcblx0c3RhdGljIGVzY2FwZVJlZ0V4cChzdHIgICAgICAgICkge1xyXG5cclxuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBoYXNDbGFzcyhlbGVtZW50ICAgICAgICAsIHNlbGVjdG9yICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBzID0gXCIgXCI7XHJcblx0XHRjb25zdCBjbGFzc0ZvdW5kID0gKHMgKyBlbGVtZW50LmNsYXNzTmFtZSArIHMpLnJlcGxhY2UoL1tcXG5cXHRdL2csIHMpLmluZGV4T2YocyArIHNlbGVjdG9yICsgcykgPj0gMDtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0cmV0dXJuIGVsZW1lbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmIGNsYXNzRm91bmQ7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZENsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRlbGVtZW50LmNsYXNzTmFtZSArPSBgICR7Y2xhc3NOYW1lfWA7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFxcXFxiJHtVdGlscy5lc2NhcGVSZWdFeHAoY2xhc3NOYW1lKX1cXFxcYmApO1xyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaW50ZXJwb2xhdGVTdHJpbmcoc3RyICAgICAgICAsIGNhbGxiYWNrICAgICAgICAgICkge1xyXG5cclxuXHRcdGNvbnN0IG1hcmtlciA9IC97eyhbYS16XVthLXowLTlcXC1fXSopfX0vaWc7XHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UobWFya2VyLCBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdHJldHVybiBjYWxsYmFjayhhcmd1bWVudHNbMV0pIHx8IFwiXCI7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gb25seSB1c2VkIGZvciBoYXNoaW5nIGpzb24gb2JqZWN0cyAodXNlZCBmb3IgaGFzaCBtYXBwaW5nIHBhbGV0dGUgb2JqZWN0cywgdXNlZCB3aGVuIGN1c3RvbSBjb2xvdXJzIGFyZSBwYXNzZWQgdGhyb3VnaCBKYXZhU2NyaXB0KVxyXG5cdHN0YXRpYyBoYXNoKHN0ciAgICAgICAgKSB7XHJcblxyXG5cdFx0bGV0IGhhc2ggPSAwLFxyXG5cdFx0XHRpLCBjaHIsIGxlbjtcclxuXHRcdGlmIChzdHIubGVuZ3RoID09PSAwKSB7XHJcblxyXG5cdFx0XHRyZXR1cm4gaGFzaDtcclxuXHJcblx0XHR9XHJcblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuXHJcblx0XHRcdGNociA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG5cdFx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaHI7XHJcblx0XHRcdGhhc2ggfD0gMDtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaGFzaDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbm9ybWFsaXNlSGV4KGhleCAgICAgICAgKSB7XHJcblxyXG5cdFx0aWYgKGhleFswXSA9PT0gXCIjXCIpIHtcclxuXHJcblx0XHRcdGhleCA9IGhleC5zdWJzdHIoMSk7XHJcblxyXG5cdFx0fVxyXG5cdFx0aWYgKGhleC5sZW5ndGggPT09IDMpIHtcclxuXHJcblx0XHRcdGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaGV4O1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHVzZWQgdG8gZ2V0IHRleHQgY29sb3JzIGlmIG5vdCBzZXRcclxuXHRzdGF0aWMgZ2V0Q29udHJhc3QoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRoZXggPSBVdGlscy5ub3JtYWxpc2VIZXgoaGV4KTtcclxuXHRcdGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyKDAsIDIpLCAxNik7XHJcblx0XHRjb25zdCBnID0gcGFyc2VJbnQoaGV4LnN1YnN0cigyLCAyKSwgMTYpO1xyXG5cdFx0Y29uc3QgYiA9IHBhcnNlSW50KGhleC5zdWJzdHIoNCwgMiksIDE2KTtcclxuXHRcdGNvbnN0IHlpcSA9ICgociAqIDI5OSkgKyAoZyAqIDU4NykgKyAoYiAqIDExNCkpIC8gMTAwMDtcclxuXHRcdHJldHVybiAoeWlxID49IDEyOCkgPyBcIiMwMDBcIiA6IFwiI2ZmZlwiO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHVzZWQgdG8gY2hhbmdlIGNvbG9yIG9uIGhpZ2hsaWdodFxyXG5cdHN0YXRpYyBnZXRMdW1pbmFuY2UoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBudW0gPSBwYXJzZUludChVdGlscy5ub3JtYWxpc2VIZXgoaGV4KSwgMTYpLFxyXG5cdFx0XHRhbXQgPSAzOCxcclxuXHRcdFx0UiA9IChudW0gPj4gMTYpICsgYW10LFxyXG5cdFx0XHRCID0gKG51bSA+PiA4ICYgMHgwMEZGKSArIGFtdCxcclxuXHRcdFx0RyA9IChudW0gJiAweDAwMDBGRikgKyBhbXQ7XHJcblx0XHRjb25zdCBuZXdDb2xvdXIgPSAoMHgxMDAwMDAwICsgKFIgPCAyNTUgPyBSIDwgMSA/IDAgOiBSIDogMjU1KSAqIDB4MTAwMDAgKyAoQiA8IDI1NSA/IEIgPCAxID8gMCA6IEIgOiAyNTUpICogMHgxMDAgKyAoRyA8IDI1NSA/IEcgPCAxID8gMCA6IEcgOiAyNTUpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XHJcblx0XHRyZXR1cm4gYCMke25ld0NvbG91cn1gO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRIb3ZlckNvbG91cihoZXggICAgICAgICkge1xyXG5cclxuXHRcdGhleCA9IFV0aWxzLm5vcm1hbGlzZUhleChoZXgpO1xyXG5cdFx0Ly8gZm9yIGJsYWNrIGJ1dHRvbnNcclxuXHRcdGlmIChoZXggPT09IFwiMDAwMDAwXCIpIHtcclxuXHJcblx0XHRcdHJldHVybiBcIiMyMjJcIjtcclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVXRpbHMuZ2V0THVtaW5hbmNlKGhleCk7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGlzTW9iaWxlKHVzZXJBZ2VudCAgICAgICAgKSB7XHJcblxyXG5cdFx0cmV0dXJuIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdCh1c2VyQWdlbnQpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpc1BsYWluT2JqZWN0KG9iaiAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gVGhlIGNvZGUgXCJ0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGxcIiBhbGxvd3MgQXJyYXkgb2JqZWN0c1xyXG5cdFx0cmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhcnJheUNvbnRhaW5zTWF0Y2hlcyhhcnJheSAgICAgICAsIHNlYXJjaCAgICAgICAgKSB7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHJcblx0XHRcdGNvbnN0IHN0ciA9IGFycmF5W2ldO1xyXG5cdFx0XHQvLyBpZiByZWdleCBtYXRjaGVzIG9yIHN0cmluZyBpcyBlcXVhbCwgcmV0dXJuIHRydWVcclxuXHRcdFx0aWYgKChzdHIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgc3RyLnRlc3Qoc2VhcmNoKSkgfHxcclxuXHRcdFx0KHR5cGVvZiBzdHIgPT0gXCJzdHJpbmdcIiAmJiBzdHIubGVuZ3RoICYmIHN0ciA9PT0gc2VhcmNoKSkge1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWVyZ2VzIGFsbCB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIHRhcmdldFxyXG5cdCAqIG9iamVjdC4gU3Vib2JqZWN0cyBhcmUgYWxzbyBtZXJnZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gc291cmNlcyBBIGxpc3Qgb2Ygc291cmNlIG9iamVjdHNcclxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgdGFyZ2V0IG9iamVjdFxyXG5cdCAqL1xyXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xyXG5cdHN0YXRpYyBkZWVwTWVyZ2UodGFyZ2V0ICAgICAgICAsIC4uLnNvdXJjZXMgICAgICAgICkge1xyXG5cclxuXHRcdGxldCBuZXdPYmogPSB0YXJnZXQ7XHJcblx0XHQvLyBhcmd1bWVudHMgaXMgbm90IGFuIEFycmF5LCBpdCdzIEFycmF5LWxpa2UhXHJcblx0XHRjb25zdCBuZXdTb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuXHJcblx0XHRuZXdTb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cclxuXHRcdFx0bmV3T2JqID0gVXRpbHMuc2luZ2xlRGVlcE1lcmdlKG5ld09iaiwgc291cmNlKTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3T2JqO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlcyBhbGwgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIHRhcmdldFxyXG5cdCAqIG9iamVjdC4gU3Vib2JqZWN0cyBhcmUgYWxzbyBtZXJnZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIG1lcmdlXHJcblx0ICogQHJldHVybnMge09iamVjdH0gVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgc2luZ2xlRGVlcE1lcmdlKHRhcmdldCAgICAgICAgLCBzb3VyY2UgICAgICAgICkge1xyXG5cclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBzb3VyY2UpIHtcclxuXHJcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYW4gZW51bWVyYWJsZSBwcm9wZXJ0eSBzbyB3ZSBkb24ndFxyXG5cdFx0XHQvLyBvdmVyd3JpdGUgcHJvcGVydGllcyBsaWtlIGxlbmd0aCBvciBmdW5jdGlvbnNcclxuXHRcdFx0aWYgKHNvdXJjZS5wcm9wZXJ0eUlzRW51bWVyYWJsZShwcm9wKSkge1xyXG5cclxuXHRcdFx0XHRsZXQgc291cmNlVmFsdWUgPSBzb3VyY2VbcHJvcF07XHJcblx0XHRcdFx0bGV0IHRhcmdldFZhbHVlID0gdGFyZ2V0W3Byb3BdO1xyXG5cclxuXHRcdFx0XHRpZiAoIXRhcmdldFZhbHVlKSB7XHJcblxyXG5cdFx0XHRcdFx0dGFyZ2V0VmFsdWUgPSB7fTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShzb3VyY2VWYWx1ZSkpIHtcclxuXHJcblx0XHRcdFx0XHRzb3VyY2VWYWx1ZSA9IHNvdXJjZVZhbHVlLnNsaWNlKDApO1xyXG5cclxuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheSh0YXJnZXRWYWx1ZSkpIHtcclxuXHJcblx0XHRcdFx0XHRzb3VyY2VWYWx1ZSA9IFV0aWxzLnNpbmdsZURlZXBNZXJnZSh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUpO1xyXG5cclxuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBBcnJheS5pc0FycmF5KHRhcmdldFZhbHVlKSkge1xyXG5cclxuXHRcdFx0XHRcdHNvdXJjZVZhbHVlID0gVXRpbHMuc2luZ2xlRGVlcE1lcmdlKHt9LCBzb3VyY2VWYWx1ZSk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dGFyZ2V0W3Byb3BdID0gc291cmNlVmFsdWU7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRhcmdldDtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcclxuIl19
