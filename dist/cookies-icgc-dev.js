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
	elem.innerHTML = buttonHTML;
	parent.appendChild(elem);

	// eslint-disable-next-line no-undef
	document.querySelector(".cc-config").addEventListener("click", function () { return this$1.onResetConfig(); });

};

Cookieconsent.prototype.removeConfigButton = function removeConfigButton () {

	// eslint-disable-next-line no-undef
	var btn = document.querySelector(".cc-config");

	if (btn) {

		btn.parentNode.remove();

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
	configBtn: "<div class=\"cc-config {{config-class}}\"><img src=\"/dist/cookie-icon-24.png\" style=\"margin-right: 5px;\"/>{{config-text}}</div>",

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9jb29raWVNYW5hZ2VyLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvY29va2llY29uc2VudC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvZGVmYXVsdE9wdGlvbnMuanMiLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9pbmRleC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL3BvcHVwLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxhQUFhOztjQU9YLCtCQUFTLENBQUMsSUFBSSxVQUFVOztDQUUvQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQVUsSUFBSSxtQkFBZSxDQUFDLENBQUM7Q0FDaEUsQUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUV6QixBQUFDLEVBQUM7O0FBRUYsY0FBUSwrQkFBUyxDQUFDLElBQUksVUFBVTs7Q0FFL0IsQUFBQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDOztBQUVoRCxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7Ozs7O0FBTUQsY0FBUSwrQkFBUyxDQUFDLElBQUksVUFBVSxLQUFLLFVBQVUsSUFBSSxVQUFVLE1BQU0sV0FBVyxJQUFJLFdBQVc7O0NBRTVGLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3RCLEFBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ3JELEFBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxBQUFHLElBQUksU0FBSSxLQUFLLGtCQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBRSxDQUFDO0NBQzVELEFBQUMsSUFBSSxJQUFJLEVBQUU7O0VBRVYsQUFBQyxNQUFNLElBQUksV0FBUyxJQUFJLEFBQUUsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxNQUFNLElBQUksU0FBUyxDQUFDOztDQUV0QixBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksTUFBTSxFQUFFOztFQUVaLEFBQUMsTUFBTSxJQUFJLGFBQVcsTUFBTSxBQUFFLENBQUM7O0NBRWhDLEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFM0IsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxjQUFRLHFDQUFZLENBQUMsSUFBSSxVQUFVLE1BQU0sV0FBVyxJQUFJLFdBQVc7O0NBRWxFLEFBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFN0MsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxjQUFRLHVDQUFhLEdBQUc7O0NBRXZCLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0NBRXBCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sVUFBQyxDQUFDLElBQUksQ0FBQyxBQUFFOztFQUUzQyxBQUFDLEdBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoQyxBQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRWpDLEFBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDSixBQUFDLE9BQU8sT0FBTyxDQUFDOztBQUVqQixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQzs7QUN0Ri9CO0FBQ0EsWUFBWSxDQUFDO0FBQ2IsR0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUNuRCxHQUFLLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2pDLEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxJQUFNLGFBQWEsR0FJbEIsc0JBQVcsQ0FBQyxPQUFPLFVBQVU7O0NBRTdCLEFBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRztFQUNkLEFBQUMsSUFBSSxFQUFFLE1BQU07RUFDYixBQUFDLEtBQUssRUFBRSxPQUFPO0NBQ2hCLEFBQUMsQ0FBQyxDQUFDOztDQUVILEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDOztDQUUvQixBQUFDO0NBQ0QsQUFBQyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7O0VBRWxDLEFBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztDQUV2QyxBQUFDLENBQUM7O0NBRUYsQUFBQztDQUNELEFBQUM7Q0FDRCxBQUFDO0NBQ0QsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0NBQzlDLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqRSxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsbUNBQVcsR0FBRzs7QUFBQzs7Q0FFZixBQUFDLE9BQU8sSUFBSSxPQUFPLFVBQUMsQ0FBQyxPQUFPLEVBQUUsQUFBRzs7RUFFaEMsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUN2QyxBQUFDLEtBQUssQ0FBQyxlQUFlLFVBQUMsRUFBRSxBQUFFOztHQUUxQixBQUFDLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuQyxBQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7RUFFaEIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7RUFFSixBQUFDLEtBQUssQ0FBQyxjQUFjLFVBQUMsRUFBRSxBQUFFOztHQUV6QixBQUFDLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNsQyxBQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7RUFFaEIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7RUFFSixBQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Q0FFakIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFTCxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELHdCQUFDLG1DQUFXLEdBQUc7O0NBRWQsQUFBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWpFLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0Qsd0JBQUMscUNBQVksR0FBRzs7Q0FFZixBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0NBQzlCLEFBQUMsT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRW5DLEFBQUMsRUFBQzs7QUFFRix3QkFBQywrQkFBUyxDQUFDLE1BQU0sRUFBRTs7Q0FFbEIsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0NBQy9CLEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMvQyxBQUFDLEdBQUssQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Q0FFbkUsQUFBQztDQUNELEFBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFOztFQUVuRCxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFekUsQUFBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztFQUMzQixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDOztDQUUvRCxBQUFDLENBQUMsTUFBTTs7RUFFUCxBQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Q0FFckIsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQywrQkFBUyxHQUFHOztDQUVaLEFBQUMsT0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzRCxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsbUNBQVcsR0FBRzs7Q0FFZCxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDL0IsQUFBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXZELEFBQUMsRUFBQzs7QUFFRix3QkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7O0VBRXhCLEFBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O0NBRTVCLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsaURBQWtCLEdBQUc7O0FBQUM7O0NBRXRCLEFBQUMsR0FBSyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO0NBQzNDLEFBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztDQUN6QyxBQUFDO0NBQ0QsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7Q0FDNUIsQUFBQyxHQUFHLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQzs7Q0FFL0IsQUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7O0VBRXRCLEFBQUM7RUFDRCxBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUM1QyxBQUFDO0VBQ0QsQUFBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0VBQy9DLEFBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7Q0FFaEIsQUFBQyxDQUFDOztDQUVGLEFBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDakYsQUFBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztDQUMvRCxBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDNUMsQUFBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztDQUM3QixBQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRTFCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxXQUFFLEdBQUcsU0FBRyxNQUFJLENBQUMsYUFBYSxLQUFFLENBQUMsQ0FBQzs7QUFFN0YsQUFBQyxFQUFDOztBQUVGLHdCQUFDLGlEQUFrQixHQUFHOztDQUVyQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7O0NBRWxELEFBQUMsSUFBSSxHQUFHLEVBQUU7O0VBRVQsQUFBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDOztDQUUxQixBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLHdCQUFDLHVDQUFhLEdBQUc7O0NBRWhCLEFBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Q0FDM0IsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUUvQixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQzs7QUM3Sy9CO0FBQ0EsWUFBWSxDQUFDOztBQUViLEdBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsR0FBSyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxHQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxHQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzs7QUFHbkQsSUFBTSxXQUFXLEdBaUJoQixvQkFBVyxDQUFDLE1BQU0sVUFBVSxLQUFLLGlCQUFpQixPQUFPLFdBQVc7O0FBQUM7O0NBRXJFLEFBQUMsR0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRWxFLEFBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0NBQ3BDLEFBQUMsV0FBVyxDQUFDLFlBQVksWUFBRyxHQUFHLEFBQUc7O0VBRWpDLEFBQUMsTUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOztDQUVoQixBQUFDLENBQUMsQ0FBQztDQUNILEFBQUMsV0FBVyxDQUFDLGNBQWMsWUFBRyxHQUFHLEFBQUc7O0VBRW5DLEFBQUMsTUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztDQUVsQixBQUFDLENBQUMsQ0FBQztDQUNILEFBQUMsV0FBVyxDQUFDLGFBQWEsYUFBSSxHQUFHLEFBQUc7O0VBRW5DLEFBQUMsTUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztDQUV2QixBQUFDLENBQUMsQ0FBQzs7Q0FFSCxBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7Q0FDaEMsQUFBQyxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQztDQUN0QyxBQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ3BCLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztDQUNuQyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7Q0FDcEMsQUFBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztDQUVyRCxBQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Q0FFZixBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7O0VBRXpCLEFBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7Q0FFbkMsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMseUJBQU0sR0FBRzs7Q0FFVCxBQUFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFOztFQUV6QixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O0NBRXhCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRTlCLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMsNkJBQVEsR0FBRzs7Q0FFWCxBQUFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFOztFQUV6QixBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNsRCxBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O0NBRXhCLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLHVDQUFhLEdBQUc7O0NBRWhCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0NBQ3RCLEFBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbkMsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyxxQ0FBWSxHQUFHOztDQUVmLEFBQUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFDOztBQUUzQyxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLG1DQUFXLEdBQUc7O0NBRWQsQUFBQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRTFDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2REFBd0IsQ0FBQyxRQUFRLFlBQVk7O0NBRTdDLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFFBQVEsQ0FBQzs7QUFFeEMsQUFBQyxFQUFDOztBQUVGLHNCQUFDLHVDQUFhLEdBQUc7O0NBRWhCLEFBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztDQUMvQixBQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Q0FFakIsQUFBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTs7RUFFaEMsQUFBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7Q0FFL0IsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRixzQkFBQywrREFBeUIsQ0FBQyxRQUFRLFlBQVk7O0NBRTlDLEFBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFFBQVEsQ0FBQzs7QUFFekMsQUFBQyxFQUFDOztBQUVGLHNCQUFDLHVDQUFhLEdBQUc7O0NBRWhCLEFBQUMsR0FBSyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7Q0FDckQsQUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU87RUFDbEMsU0FBQyxDQUFDLElBQUksRUFBRSxBQUFHOztHQUVWLEFBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7RUFFbkMsQUFBQyxDQUFDO0NBQ0gsQUFBQyxDQUFDLENBQUM7O0FBRUosQUFBQyxFQUFDOztBQUVGLHNCQUFDLHlDQUFjLEdBQUc7O0NBRWpCLEFBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztDQUVsQixBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7O0NBRWhDLEFBQUMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7O0VBRWpDLEFBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0NBRWhDLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsK0NBQWlCLEdBQUc7O0NBRXBCLEFBQUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7O0FBRWhDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2QkFBUSxHQUFHOztDQUVYLEFBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUV0QyxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFbkQsQUFBQyxFQUFDOztBQUVGLHNCQUFDLCtCQUFTLEdBQUc7O0NBRVosQUFBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRXJDLEFBQUMsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFOztFQUV6QyxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQzs7Q0FFcEQsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2REFBd0IsQ0FBQyxhQUFhLFdBQVc7O0FBQUM7O0NBRWxELEFBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLFdBQUMsS0FBSSxDQUFDLEFBQUc7O0VBRTNCLEFBQUM7RUFDRCxBQUFDLE1BQU0sQ0FBQyxPQUFHLE1BQUksQ0FBQyxlQUFlLElBQUcsSUFBSSxDQUFFLENBQUMsR0FBRyxhQUFhLENBQUM7O0NBRTNELEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7O0FDak83QjtBQUNBLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHOzs7Q0FHaEIsU0FBUyxFQUFFLElBQUk7OztDQUdmLE1BQU0sRUFBRTs7RUFFUCxJQUFJLEVBQUUsMEJBQTBCOzs7RUFHaEMsSUFBSSxFQUFFLEdBQUc7Ozs7RUFJVCxNQUFNLEVBQUUsTUFBTTs7O0VBR2QsVUFBVSxFQUFFLEdBQUc7RUFDZjs7O0NBR0QsT0FBTyxFQUFFO0VBQ1IsTUFBTSxFQUFFLCtCQUErQjtFQUN2QyxPQUFPLEVBQUUsb01BQW9NO0VBQzdNLEtBQUssRUFBRSxVQUFVO0VBQ2pCLElBQUksRUFBRSxVQUFVO0VBQ2hCLElBQUksRUFBRSxxQkFBcUI7RUFDM0IsSUFBSSxFQUFFLHlIQUF5SDtFQUMvSCxLQUFLLEVBQUUsVUFBVTtFQUNqQixNQUFNLEVBQUUsb0JBQW9CO0VBQzVCOzs7Ozs7O0NBT0QsUUFBUSxFQUFFO0VBQ1QsTUFBTSxFQUFFLG1EQUFtRDtFQUMzRCxPQUFPLEVBQUUseUVBQXlFO0VBQ2xGLFdBQVcsRUFBRSx1UEFBdVA7RUFDcFEsS0FBSyxFQUFFLHFHQUFxRztFQUM1RyxJQUFJLEVBQUUsaUdBQWlHO0VBQ3ZHLElBQUksRUFBRSwwSUFBMEk7RUFDaEosS0FBSyxFQUFFLDRHQUE0RztFQUNuSDs7Ozs7Q0FLRCxNQUFNLEVBQUUsNE1BQTRNOzs7O0NBSXBOLFNBQVMsRUFBRSxxSUFBcUk7OztDQUdoSixpQkFBaUIsRUFBRSxFQUFFOzs7Q0FHckIsVUFBVSxFQUFFLG1FQUFtRTs7O0NBRy9FLE9BQU8sRUFBRTs7RUFFUixPQUFPLEVBQUUsK0JBQStCO0VBQ3hDLGFBQWEsRUFBRSx3Q0FBd0M7RUFDdkQsY0FBYyxFQUFFLDZDQUE2QztFQUM3RDs7O0NBR0QsTUFBTSxFQUFFLE9BQU87Ozs7Ozs7Q0FPZixRQUFRLEVBQUUsUUFBUTs7Ozs7Ozs7Q0FRbEIsS0FBSyxFQUFFLE9BQU87Ozs7Ozs7Ozs7O0NBV2QsT0FBTyxDQUFDO0VBQ1AsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztFQUM5QixNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0VBQy9CO0NBQ0QsQ0FBQzs7QUN6R0Y7QUFDQSxZQUFZLENBQUM7O0FBRWIsR0FBSyxDQUFDLE9BQU8sV0FBVyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDM0QsR0FBSyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTdDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7VUFDaEIsT0FBTztjQUNQLFdBQVc7Q0FDWCxDQUFDOzs7Ozs7Ozs7QUNURjtBQUNBLFlBQVksQ0FBQzs7QUFFYixHQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakMsSUFBTSxLQUFLLEdBS1YsY0FBVyxDQUFDLE9BQU8sVUFBVSxVQUFVLFVBQVU7O0NBRWpELEFBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7Q0FDOUIsQUFBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztDQUMxQixBQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOztDQUV6QixBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTs7RUFFbEIsQUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0NBRWpCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7Q0FFeEIsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDaEcsQUFBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQzs7Q0FFdkQsQUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7O0NBRS9DLEFBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixnQkFBQywyQkFBTyxHQUFHOztDQUVWLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUNyRixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDbkYsQUFBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztDQUMxQixBQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOztDQUV6QixBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTs7RUFFN0MsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUVwRCxBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOztDQUVyQixBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOztBQUV0QixBQUFDLEVBQUM7O0FBRUYsZ0JBQUMscUJBQUksR0FBRzs7Q0FFUCxBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztFQUVuQixBQUFDLE9BQU87O0NBRVQsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTs7RUFFcEIsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOztFQUVqQyxBQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQzs7RUFFakQsQUFBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFOztHQUU5QixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7O0VBRTdCLEFBQUMsQ0FBQzs7Q0FFSCxBQUFDLENBQUM7O0NBRUYsQUFBQyxPQUFPLElBQUksQ0FBQzs7QUFFZCxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMsdUJBQUssR0FBRzs7Q0FFUixBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztFQUVuQixBQUFDLE9BQU87O0NBRVQsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7O0VBRW5CLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7RUFFckMsQUFBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFOztHQUUvQixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7O0VBRTlCLEFBQUMsQ0FBQzs7Q0FFSCxBQUFDLENBQUM7O0NBRUYsQUFBQyxPQUFPLElBQUksQ0FBQzs7QUFFZCxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUJBQU0sR0FBRzs7Q0FFVCxBQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOztBQUU1RyxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMsaURBQWtCLEdBQUc7O0NBRXJCLEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEQsQUFBQyxHQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Q0FFcEIsQUFBQztDQUNELEFBQUMsU0FBUyxDQUFDLE9BQU8sVUFBQyxDQUFDLEdBQUcsRUFBRSxBQUFHOztFQUUzQixBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBTSxHQUFHLENBQUUsQ0FBQyxDQUFDOztDQUU1QixBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVKLEFBQUMsT0FBTyxPQUFPLENBQUM7O0FBRWpCLEFBQUMsRUFBQzs7QUFFRixnQkFBQywyQ0FBZSxHQUFHOztDQUVsQixBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUMzQixBQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxHQUFHLFFBQVEsR0FBRyxVQUFVLENBQUM7O0NBRXJHLEFBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztFQUVuQixBQUFDLGFBQWEsR0FBRyxVQUFVLENBQUM7O0NBRTdCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUc7RUFDaEIsQUFBQyxTQUFNLGFBQWEsQ0FBRTtFQUN0QixBQUFDLGdCQUFnQjtFQUNqQixBQUFDLGdCQUFZLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FDekIsQ0FBQyxDQUFDOztDQUVILEFBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOztFQUVqQixBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O0NBRTVCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDOztDQUV4RCxBQUFDO0NBQ0QsQUFBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FFaEQsQUFBQztDQUNELEFBQUMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7O0VBRTlCLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7Q0FFekMsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxPQUFPLENBQUM7O0FBRWpCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxtREFBbUIsR0FBRzs7Q0FFdEIsQUFBQyxHQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztDQUN6QixBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7Q0FFM0IsQUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLFVBQUMsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7RUFFN0MsQUFBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQUUsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7R0FFNUUsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDaEMsQUFBQyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQzs7RUFFbkUsQUFBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFTCxBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVKLEFBQUM7Q0FDRCxBQUFDLEdBQUssQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7Q0FFeEMsQUFBQztDQUNELEFBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxXQUFFLENBQUMsSUFBSSxFQUFFLEFBQUc7O0VBRTVFLEFBQUMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRTVCLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRUosQUFBQztDQUNELEFBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN4QyxBQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7O0VBRWIsQUFBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7O0NBRTlCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sV0FBRSxDQUFDLEtBQUssRUFBRSxBQUFHOztFQUVsRCxBQUFDLE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUU3QixBQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxxQ0FBWSxDQUFDLE1BQU0sRUFBRTs7Q0FFckIsQUFBQyxHQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Q0FDM0IsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzNDLEFBQUM7Q0FDRCxBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7Q0FFakcsQUFBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQzs7Q0FFeEIsQUFBQyxHQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRTVCLEFBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztDQUUzQixBQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQUU7O0VBRXJDLEFBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7O0NBRXJDLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFOztFQUV0QixBQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7O0NBRXZCLEFBQUMsQ0FBQyxNQUFNOztFQUVQLEFBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztDQUV6QyxBQUFDLENBQUM7OztDQUdGLEFBQUMsT0FBTyxFQUFFLENBQUM7O0FBRVosQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJDQUFlLENBQUMsUUFBUSxZQUFZOztDQUVwQyxBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Q0FDckYsQUFBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztDQUM5QixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFMUUsQUFBQyxFQUFDOztBQUVGLGdCQUFDLHlDQUFjLENBQUMsUUFBUSxZQUFZOztDQUVuQyxBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDbkYsQUFBQyxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQztDQUM3QixBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFekUsQUFBQyxFQUFDOztBQUVGLEFBQUM7QUFDRCxBQUFDO0FBQ0QsZ0JBQUMsbURBQW1CLENBQUMsT0FBTyxFQUFFOztDQUU3QixBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDbEQsQUFBQyxHQUFLLENBQUMsUUFBUSxHQUFHLHVCQUFxQixJQUFJLEFBQUUsQ0FBQztDQUM5QyxBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FFOUMsQUFBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRELEFBQUMsSUFBSSxPQUFPLEVBQUU7O0VBRWIsQUFBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBSSxRQUFRLENBQUUsQ0FBQyxDQUFDOztDQUVyRCxBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sT0FBTyxDQUFDOztBQUVqQixBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTs7Q0FFdEMsQUFBQyxHQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztDQUN4QixBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztDQUM3QixBQUFDLEdBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztDQUMvQixBQUFDLEdBQUssQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQzs7Q0FFckMsQUFBQztDQUNELEFBQUMsSUFBSSxLQUFLLEVBQUU7O0VBRVgsQUFBQztFQUNELEFBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDNUUsQUFBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0VBQ25ELEFBQUMsV0FBVyxDQUFDLENBQUcsTUFBTSxnQkFBWSxDQUFDLEdBQUc7R0FDckMsQUFBQyxjQUFVLEtBQUssQ0FBQyxJQUFJLEVBQUU7R0FDdkIsQUFBQyx5QkFBcUIsS0FBSyxDQUFDLFVBQVUsRUFBRTtFQUN6QyxBQUFDLENBQUMsQ0FBQztFQUNILEFBQUMsV0FBVyxDQUFDLENBQUcsTUFBTSxrQkFBYSxNQUFNLHlCQUFvQixNQUFNLHVCQUFtQixDQUFDLEdBQUc7R0FDekYsQUFBQyxjQUFVLEtBQUssQ0FBQyxJQUFJLEVBQUU7RUFDeEIsQUFBQyxDQUFDLENBQUM7O0VBRUgsQUFBQyxJQUFJLE1BQU0sRUFBRTs7R0FFWixBQUFDO0dBQ0QsQUFBQyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUNoRixBQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztHQUMvRCxBQUFDLFdBQVcsQ0FBQyxDQUFHLE1BQU0sY0FBVSxDQUFDLEdBQUc7SUFDbkMsQUFBQyxjQUFVLE1BQU0sQ0FBQyxJQUFJLEVBQUU7SUFDeEIsQUFBQyxxQkFBaUIsTUFBTSxDQUFDLE1BQU0sRUFBRTtJQUNqQyxBQUFDLHlCQUFxQixNQUFNLENBQUMsVUFBVSxFQUFFO0dBQzFDLEFBQUMsQ0FBQyxDQUFDOztHQUVILEFBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLGFBQWEsRUFBRTs7SUFFekMsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLHdCQUFtQixNQUFNLG9CQUFnQixDQUFDLEdBQUc7S0FDbEUsQUFBQyx5QkFBcUIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7SUFDaEUsQUFBQyxDQUFDLENBQUM7O0dBRUosQUFBQyxDQUFDOztHQUVGLEFBQUMsSUFBSSxTQUFTLEVBQUU7O0dBRWhCLEFBQUM7SUFDQSxBQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVGLEFBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0lBQ3hFLEFBQUMsV0FBVyxDQUFDLENBQUcsTUFBTSx3Q0FBb0MsQ0FBQyxHQUFHO0tBQzdELEFBQUMsY0FBVSxTQUFTLENBQUMsSUFBSSxFQUFFO0tBQzNCLEFBQUMscUJBQWlCLFNBQVMsQ0FBQyxNQUFNLEVBQUU7S0FDcEMsQUFBQyx5QkFBcUIsU0FBUyxDQUFDLFVBQVUsRUFBRTtJQUM3QyxBQUFDLENBQUMsQ0FBQzs7R0FFSixBQUFDLENBQUMsTUFBTTs7R0FFUixBQUFDO0lBQ0EsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLHdDQUFvQyxDQUFDLEdBQUc7S0FDN0QsQUFBQyxjQUFVLEtBQUssQ0FBQyxJQUFJLEVBQUU7SUFDeEIsQUFBQyxDQUFDLENBQUM7O0dBRUosQUFBQyxDQUFDOztFQUVILEFBQUMsQ0FBQzs7Q0FFSCxBQUFDLENBQUM7O0NBRUYsQUFBQztDQUNELEFBQUM7Q0FDRCxBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUMvQyxBQUFDO0NBQ0QsQUFBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNsQyxBQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDcEIsQUFBQyxLQUFLLEdBQUssQ0FBQyxJQUFJLElBQUksV0FBVyxFQUFFOztFQUVoQyxBQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUcsSUFBSSxVQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLE9BQUcsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztDQUVqRixBQUFDLENBQUM7O0FBRUgsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FDMVd2QjtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLEtBQUs7O01BRUgscUNBQVksQ0FBQyxHQUFHLFVBQVU7O0NBRWpDLEFBQUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVwRSxBQUFDLEVBQUM7O0FBRUYsTUFBUSw2QkFBUSxDQUFDLE9BQU8sVUFBVSxRQUFRLFVBQVU7O0NBRW5ELEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDZixBQUFDLEdBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNyRyxBQUFDO0NBQ0QsQUFBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksSUFBSSxVQUFVLENBQUM7O0FBRTlELEFBQUMsRUFBQzs7QUFFRixNQUFRLDZCQUFRLENBQUMsT0FBTyxVQUFVLFNBQVMsVUFBVTs7Q0FFcEQsQUFBQyxPQUFPLENBQUMsU0FBUyxJQUFJLE1BQUksU0FBUyxBQUFFLENBQUM7O0FBRXZDLEFBQUMsRUFBQzs7QUFFRixNQUFRLG1DQUFXLENBQUMsT0FBTyxVQUFVLFNBQVMsVUFBVTs7Q0FFdkQsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUMsU0FBSyxDQUFDLENBQUM7Q0FDcEUsQUFBQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFM0QsQUFBQyxFQUFDOztBQUVGLE1BQVEsK0NBQWlCLENBQUMsR0FBRyxVQUFVLFFBQVEsWUFBWTs7Q0FFMUQsQUFBQyxHQUFLLENBQUMsTUFBTSxHQUFHLDJCQUEyQixDQUFDO0NBQzVDLEFBQUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXOztFQUV0QyxBQUFDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7Q0FFdEMsQUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFTCxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELE1BQVEscUJBQUksQ0FBQyxHQUFHLFVBQVU7O0NBRXpCLEFBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO0VBQ1osQUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNkLEFBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7RUFFdEIsQUFBQyxPQUFPLElBQUksQ0FBQzs7Q0FFZCxBQUFDLENBQUM7Q0FDRixBQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztFQUU1QyxBQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pCLEFBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ25DLEFBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzs7Q0FFWixBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixNQUFRLHFDQUFZLENBQUMsR0FBRyxVQUFVOztDQUVqQyxBQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTs7RUFFcEIsQUFBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFdEIsQUFBQyxDQUFDO0NBQ0YsQUFBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOztFQUV0QixBQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFNUQsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLEdBQUcsQ0FBQzs7QUFFYixBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELE1BQVEsbUNBQVcsQ0FBQyxHQUFHLFVBQVU7O0NBRWhDLEFBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDL0IsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxQyxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUMsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDeEQsQUFBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXhDLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0QsTUFBUSxxQ0FBWSxDQUFDLEdBQUcsVUFBVTs7Q0FFakMsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUNqRCxBQUFDLEdBQUcsR0FBRyxFQUFFO0VBQ1QsQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRztFQUN0QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRztFQUM5QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDN0IsQUFBQyxHQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFD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R0FBRyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0dBRWhDLEFBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTs7SUFFbEIsQUFBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztHQUVuQixBQUFDLENBQUM7O0dBRUYsQUFBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7O0lBRWhDLEFBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0dBRXJDLEFBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTs7SUFFM0UsQUFBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7O0dBRWhFLEFBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7O0lBRTFFLEFBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztHQUV2RCxBQUFDLENBQUM7O0dBRUYsQUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDOztFQUU3QixBQUFDLENBQUM7O0NBRUgsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLE1BQU0sQ0FBQzs7QUFFaEIsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwidmVyc2lvblwiOiBcIjAuMC4xXCJcbn0iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNsYXNzIENvb2tpZU1hbmFnZXIge1xyXG5cclxuXHQvKipcclxuXHQgKiBnZXQgdGhlIGNvb2tpZSB2YWx1ZVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICogQHJldHVybnMge1N0cmluZ31cclxuXHQgKi9cclxuXHRzdGF0aWMgZ2V0Q29va2llKG5hbWUgICAgICAgICkge1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0Y29uc3QgdiA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChgKF58OykgPyR7bmFtZX09KFteO10qKSg7fCQpYCk7XHJcblx0XHRyZXR1cm4gdiA/IHZbMl0gOiBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBoYXNDb29raWUobmFtZSAgICAgICAgKSB7XHJcblxyXG5cdFx0cmV0dXJuIENvb2tpZU1hbmFnZXIuZ2V0Q29va2llKG5hbWUpICE9PSBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29va2llIHZhbHVlXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBjb29raWUuXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRheXMgVGhlIG51bWJlcnMgb2YgZGF5cyB0byBleHBpcmUgdGhlIGNvb2tpZS5cclxuXHQgKi9cclxuXHRzdGF0aWMgc2V0Q29va2llKG5hbWUgICAgICAgICwgdmFsdWUgICAgICAgICwgZGF5cyAgICAgICAgLCBkb21haW4gICAgICAgICAsIHBhdGggICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBkID0gbmV3IERhdGUoKTtcclxuXHRcdGQuc2V0VGltZShkLmdldFRpbWUoKSArIDI0ICogNjAgKiA2MCAqIDEwMDAgKiBkYXlzKTtcclxuXHRcdGxldCBjb29raWUgPSBgJHtuYW1lfT0ke3ZhbHVlfTtleHBpcmVzPSR7ZC50b0dNVFN0cmluZygpfWA7XHJcblx0XHRpZiAocGF0aCkge1xyXG5cclxuXHRcdFx0Y29va2llICs9IGA7cGF0aD0ke3BhdGh9YDtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0Y29va2llICs9IFwiO3BhdGg9L1wiO1xyXG5cclxuXHRcdH1cclxuXHRcdGlmIChkb21haW4pIHtcclxuXHJcblx0XHRcdGNvb2tpZSArPSBgO2RvbWFpbj0ke2RvbWFpbn1gO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGUgdGhlIGNvb2tpZXNcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgY29va2llLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBkZWxldGVDb29raWUobmFtZSAgICAgICAgLCBkb21haW4gICAgICAgICAsIHBhdGggICAgICAgICApIHtcclxuXHJcblx0XHR0aGlzLnNldENvb2tpZShuYW1lLCBcIlwiLCAtMSwgZG9tYWluLCBwYXRoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgYWxsIGNvb2tpZXNcclxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBnZXRBbGxDb29raWVzKCkge1xyXG5cclxuXHRcdGNvbnN0IGNvb2tpZXMgPSB7fTtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LmNvb2tpZS5zcGxpdChcIjtcIikuZm9yRWFjaCgoaXRlbSk9PntcclxuXHJcblx0XHRcdGNvbnN0IGNvb2tpZSA9IGl0ZW0uc3BsaXQoXCI9XCIpO1xyXG5cdFx0XHRjb29raWVzW2Nvb2tpZVswXV0gPSBjb29raWVbMV07XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gY29va2llcztcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29raWVNYW5hZ2VyO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSByZXF1aXJlKFwiLi9kZWZhdWx0T3B0aW9uc1wiKTtcclxuY29uc3QgY29va2llTWFuYWdlciA9IHJlcXVpcmUoXCIuL2Nvb2tpZU1hbmFnZXJcIik7XHJcbmNvbnN0IFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcbmNvbnN0IFBvcHVwID0gcmVxdWlyZShcIi4vcG9wdXBcIik7XHJcblxyXG5jbGFzcyBDb29raWVjb25zZW50IHtcclxuXHJcblx0ICAgICAgICAgICAgICBcclxuXHJcblx0Y29uc3RydWN0b3Iob3B0aW9ucyAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5zdGF0dXMgPSB7XHJcblx0XHRcdGRlbnk6IFwiZGVueVwiLFxyXG5cdFx0XHRhbGxvdzogXCJhbGxvd1wiXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcclxuXHJcblx0XHQvLyBtZXJnZSBpbiB1c2VyIG9wdGlvbnNcclxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KG9wdGlvbnMpKSB7XHJcblxyXG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby13YXJuaW5nLWNvbW1lbnRzXHJcblx0XHQvLyBUT0RPOiBuYXZpZ2F0b3IgYW5kIGRvY3VtZW50IHNob3VsZG4ndCBiZSB1c2VkIGhlcmVcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0dGhpcy5vcHRpb25zLnVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XHJcblx0XHR0aGlzLm9wdGlvbnMuaXNNb2JpbGUgPSBVdGlscy5pc01vYmlsZSh0aGlzLm9wdGlvbnMudXNlckFnZW50KTtcclxuXHJcblx0fVxyXG5cclxuXHRjcmVhdGVQb3B1cCgpIHtcclxuXHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuXHJcblx0XHRcdGNvbnN0IHBvcHVwID0gbmV3IFBvcHVwKHRoaXMub3B0aW9ucyk7XHJcblx0XHRcdHBvcHVwLnNldEFsbG93SGFuZGxlcigoKT0+e1xyXG5cclxuXHRcdFx0XHR0aGlzLnNldFN0YXR1cyh0aGlzLnN0YXR1cy5hbGxvdyk7XHJcblx0XHRcdFx0cG9wdXAuY2xvc2UoKTtcclxuXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cG9wdXAuc2V0RGVueUhhbmRsZXIoKCk9PntcclxuXHJcblx0XHRcdFx0dGhpcy5zZXRTdGF0dXModGhpcy5zdGF0dXMuZGVueSk7XHJcblx0XHRcdFx0cG9wdXAuY2xvc2UoKTtcclxuXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0cmVzb2x2ZShwb3B1cCk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gcmV0dXJucyB0cnVlIGlmIHRoZSBjb29raWUgaGFzIGEgdmFsaWQgdmFsdWVcclxuXHRoYXNBbnN3ZXJlZCgpIHtcclxuXHJcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2YodGhpcy5nZXRTdGF0dXMoKSkgPj0gMDtcclxuXHJcblx0fVxyXG5cclxuXHQvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb2tpZSBpbmRpY2F0ZXMgdGhhdCBjb25zZW50IGhhcyBiZWVuIGdpdmVuXHJcblx0aGFzQ29uc2VudGVkKCkge1xyXG5cclxuXHRcdGNvbnN0IHZhbCA9IHRoaXMuZ2V0U3RhdHVzKCk7XHJcblx0XHRyZXR1cm4gdmFsID09PSB0aGlzLnN0YXR1cy5hbGxvdztcclxuXHJcblx0fVxyXG5cclxuXHRzZXRTdGF0dXMoc3RhdHVzKSB7XHJcblxyXG5cdFx0Y29uc3QgYyA9IHRoaXMub3B0aW9ucy5jb29raWU7XHJcblx0XHRjb25zdCB2YWx1ZSA9IGNvb2tpZU1hbmFnZXIuZ2V0Q29va2llKGMubmFtZSk7XHJcblx0XHRjb25zdCBjaG9zZW5CZWZvcmUgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZih2YWx1ZSkgPj0gMDtcclxuXHJcblx0XHQvLyBpZiBgc3RhdHVzYCBpcyB2YWxpZFxyXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHN0YXR1cykgPj0gMCkge1xyXG5cclxuXHRcdFx0Y29va2llTWFuYWdlci5zZXRDb29raWUoYy5uYW1lLCBzdGF0dXMsIGMuZXhwaXJ5RGF5cywgYy5kb21haW4sIGMucGF0aCk7XHJcblxyXG5cdFx0XHR0aGlzLmNyZWF0ZUNvbmZpZ0J1dHRvbigpO1xyXG5cdFx0XHR0aGlzLm9wdGlvbnMub25TdGF0dXNDaGFuZ2UuY2FsbCh0aGlzLCBzdGF0dXMsIGNob3NlbkJlZm9yZSk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuY2xlYXJTdGF0dXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0U3RhdHVzKCkge1xyXG5cclxuXHRcdHJldHVybiBjb29raWVNYW5hZ2VyLmdldENvb2tpZSh0aGlzLm9wdGlvbnMuY29va2llLm5hbWUpO1xyXG5cclxuXHR9XHJcblxyXG5cdGNsZWFyU3RhdHVzKCkge1xyXG5cclxuXHRcdGNvbnN0IGMgPSB0aGlzLm9wdGlvbnMuY29va2llO1xyXG5cdFx0Y29va2llTWFuYWdlci5kZWxldGVDb29raWUoYy5uYW1lLCBjLmRvbWFpbiwgYy5wYXRoKTtcclxuXHJcblx0fVxyXG5cclxuXHRvbkluaXQoKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuaGFzQW5zd2VyZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5jcmVhdGVDb25maWdCdXR0b24oKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0Y3JlYXRlQ29uZmlnQnV0dG9uKCkge1xyXG5cclxuXHRcdGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLmNvbmZpZ0J0blNlbGVjdG9yO1xyXG5cdFx0bGV0IGJ1dHRvbkhUTUwgPSB0aGlzLm9wdGlvbnMuY29uZmlnQnRuO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRsZXQgcGFyZW50ID0gZG9jdW1lbnQuYm9keTtcclxuXHRcdGxldCBidG5DbGFzcyA9IFwiY29uZmlnLXBvcHVwXCI7XHJcblxyXG5cdFx0aWYgKGlkLnRyaW0oKSAhPT0gXCJcIikge1xyXG5cclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRcdGNvbnN0IGRpdkVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKTtcclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRcdHBhcmVudCA9ICghZGl2RWxlbSkgPyBkb2N1bWVudC5ib2R5IDogZGl2RWxlbTtcclxuXHRcdFx0YnRuQ2xhc3MgPSBcIlwiO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRidXR0b25IVE1MID0gYnV0dG9uSFRNTC5yZXBsYWNlKFwie3tjb25maWctdGV4dH19XCIsIHRoaXMub3B0aW9ucy5jb250ZW50LmNvbmZpZyk7XHJcblx0XHRidXR0b25IVE1MID0gYnV0dG9uSFRNTC5yZXBsYWNlKFwie3tjb25maWctY2xhc3N9fVwiLCBidG5DbGFzcyk7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0ZWxlbS5pbm5lckhUTUwgPSBidXR0b25IVE1MO1xyXG5cdFx0cGFyZW50LmFwcGVuZENoaWxkKGVsZW0pO1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1jb25maWdcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMub25SZXNldENvbmZpZygpKTtcclxuXHJcblx0fVxyXG5cclxuXHRyZW1vdmVDb25maWdCdXR0b24oKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCBidG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWNvbmZpZ1wiKTtcclxuXHJcblx0XHRpZiAoYnRuKSB7XHJcblxyXG5cdFx0XHRidG4ucGFyZW50Tm9kZS5yZW1vdmUoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0b25SZXNldENvbmZpZygpIHtcclxuXHJcblx0XHR0aGlzLnJlbW92ZUNvbmZpZ0J1dHRvbigpO1xyXG5cdFx0dGhpcy5vcHRpb25zLm9uUmVzZXRDb25maWcoKTtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29raWVjb25zZW50O1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IENvb2tpZUNvbnNlbnQgPSByZXF1aXJlKFwiLi9jb29raWVjb25zZW50XCIpO1xyXG5jb25zdCBDb29raWVNYW5hZ2VyID0gcmVxdWlyZShcIi4vY29va2llTWFuYWdlclwiKTtcclxuY29uc3QgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcclxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSByZXF1aXJlKFwiLi9kZWZhdWx0T3B0aW9uc1wiKTtcclxuXHJcblxyXG5jbGFzcyBDb29raWVzSUNHQyB7XHJcblxyXG5cdCAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG5cdC8qKlxyXG5cdCAqIEEgYENvb2tpZXNJQ0dDYCBvYmplY3QgcmVwcmVzZW50cyB0aGUgb2JqZWN0IHRoYXQgbWFuYWdlcyB0aGUgY29va2llIGNvbnNlbnQgdW5kZXIgdGhlIEV1cm9wZWFuIEdEUFIgbGF3XHJcblx0ICogZGlzYWJsaW5nIEdvb2dsZSBBbmFseXRpY3MgY29va2llcyBpZiBuZWVkZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiB0aGF0IHNldHMgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge0FycmF5PFN0cmluZz59IGdhSWRzIEFuIGFycmF5IHdpdGggdGhlIEdvb2dsZSBBbmFseXRpY3MgaWRzXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwgb3B0aW9uc1xyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogdmFyIGNvb2tpZXMgPSBuZXcgQ29va2llc0lDR0MoXCJ3d3cuaW5zdGFtYXBzLmNhdFwiLCBbXCJVQS0xMjM0NTY3OC0xXCJdLCB7cG9zaXRpb246IFwidG9wXCIsIGNvbnRlbnQgeyBtZXNzYWdlOiBcIlZvbHMgY29va2llcz9cIiB9fSk7XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoZG9tYWluICAgICAgICAsIGdhSWRzICAgICAgICAgICAgICAgLCBvcHRpb25zICAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgbWFpbk9wdGlvbnMgPSBVdGlscy5kZWVwTWVyZ2Uoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHRtYWluT3B0aW9ucy5jb29raWUuZG9tYWluID0gZG9tYWluO1xyXG5cdFx0bWFpbk9wdGlvbnMub25Jbml0aWFsaXNlID0gKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHR9O1xyXG5cdFx0bWFpbk9wdGlvbnMub25TdGF0dXNDaGFuZ2UgPSAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLm9uQ2hhbmdlKCk7XHJcblxyXG5cdFx0fTtcclxuXHRcdG1haW5PcHRpb25zLm9uUmVzZXRDb25maWcgPSAgKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vblJlc2V0Q29uZmlnKCk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhRGlzYWJsZVByZWZpeCA9IFwiZ2EtZGlzYWJsZS1cIjtcclxuXHRcdHRoaXMuZ2FJZHMgPSBnYUlkcztcclxuXHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQgPSBuZXcgQ29va2llQ29uc2VudChtYWluT3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuaGFzQW5zd2VyZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBoYXMgYmVlbiBpbml0aWFsaXplZC5cclxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBjb29raWVzIGRlcGVuZGluZyBvbiBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkIG9yIG5vdFxyXG5cdCAqL1xyXG5cdG9uSW5pdCgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuZGlzYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5jb29raWVDb25zZW50Lm9uSW5pdCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBzdGF0dXMgaGFzIGNoYW5nZWQuXHJcblx0ICogRW5hYmxlcyB0aGUgY29va2llcyBpZiBuZWVkZWRcclxuXHQgKi9cclxuXHRvbkNoYW5nZSgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cclxuXHRcdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcInRydWVcIiwgMzY1KTtcclxuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuZGlzYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25maWcgaGFzIGJlZW4gcmVzZXQuXHJcblx0ICogRGlzYWJsZXMgdGhlIGNvb2tpZXNcclxuXHQgKi9cclxuXHRvblJlc2V0Q29uZmlnKCkge1xyXG5cclxuXHRcdHRoaXMuZGVsZXRlQ29va2llcygpO1xyXG5cdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBjb25zZW50ZWRcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRoYXNDb25zZW50ZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNDb25zZW50ZWQoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIHVzZXIgaGFzIGFuc3dlcmVkXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0aGFzQW5zd2VyZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNBbnN3ZXJlZCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvb2tpZXNFbmFibGVkSGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cclxuXHR9XHJcblxyXG5cdGVuYWJsZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IHRydWU7XHJcblx0XHR0aGlzLmVuYWJsZUdBKCk7XHJcblxyXG5cdFx0aWYgKHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlcigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRzZXRDb29raWVzRGlzYWJsZWRIYW5kbGVyKGNhbGxiYWNrICAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cclxuXHR9XHJcblxyXG5cdGRlbGV0ZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgYWN0aXZlQ29va2llcyA9IENvb2tpZU1hbmFnZXIuZ2V0QWxsQ29va2llcygpO1xyXG5cdFx0T2JqZWN0LmtleXMoYWN0aXZlQ29va2llcykuZm9yRWFjaChcclxuXHRcdFx0KGl0ZW0pID0+IHtcclxuXHJcblx0XHRcdFx0Q29va2llTWFuYWdlci5kZWxldGVDb29raWUoaXRlbSk7XHJcblxyXG5cdFx0XHR9XHJcblx0XHQpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpc2FibGVDb29raWVzKCkge1xyXG5cclxuXHRcdHRoaXMuZGlzYWJsZUdBKCk7XHJcblxyXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuXHRcdGlmICh0aGlzLmNvb2tpZXNEaXNhYmxlZEhhbmRsZXIpIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlcigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRhcmVDb29raWVzRW5hYmxlZCgpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5hcmVDb29raWVzRW5hYmxlZDtcclxuXHJcblx0fVxyXG5cclxuXHRlbmFibGVHQSgpIHtcclxuXHJcblx0XHR0aGlzLmNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZChmYWxzZSk7XHJcblxyXG5cdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcInRydWVcIiwgMzY1KTtcclxuXHJcblx0fVxyXG5cclxuXHRkaXNhYmxlR0EoKSB7XHJcblxyXG5cdFx0dGhpcy5jaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQodHJ1ZSk7XHJcblxyXG5cdFx0aWYgKENvb2tpZU1hbmFnZXIuaGFzQ29va2llKFwiZ2FFbmFibGVcIikpIHtcclxuXHJcblx0XHRcdENvb2tpZU1hbmFnZXIuc2V0Q29va2llKFwiZ2FFbmFibGVcIiwgXCJmYWxzZVwiLCAzNjUpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRjaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQoc2hvdWxkRGlzYWJsZSAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuZ2FJZHMuZm9yRWFjaChnYUlkID0+IHtcclxuXHJcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0XHR3aW5kb3dbYCR7dGhpcy5nYURpc2FibGVQcmVmaXh9JHtnYUlkfWBdID0gc2hvdWxkRGlzYWJsZTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29raWVzSUNHQztcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcblx0Ly8gb3B0aW9uYWwgKGV4cGVjdGluZyBhIEhUTUwgZWxlbWVudCkgaWYgcGFzc2VkLCB0aGUgcG9wdXAgaXMgYXBwZW5kZWQgdG8gdGhpcyBlbGVtZW50LiBkZWZhdWx0IGlzIGBkb2N1bWVudC5ib2R5YFxyXG5cdGNvbnRhaW5lcjogbnVsbCxcclxuXHJcblx0Ly8gZGVmYXVsdHMgY29va2llIG9wdGlvbnMgLSBpdCBpcyBSRUNPTU1FTkRFRCB0byBzZXQgdGhlc2UgdmFsdWVzIHRvIGNvcnJlc3BvbmQgd2l0aCB5b3VyIHNlcnZlclxyXG5cdGNvb2tpZToge1xyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgbmFtZSBvZiB0aGlzIGNvb2tpZSAtIHlvdSBjYW4gaWdub3JlIHRoaXNcclxuXHRcdG5hbWU6IFwiY29va2llY29uc2VudElDR0Nfc3RhdHVzXCIsXHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgdXJsIHBhdGggdGhhdCB0aGUgY29va2llICduYW1lJyBiZWxvbmdzIHRvLiBUaGUgY29va2llIGNhbiBvbmx5IGJlIHJlYWQgYXQgdGhpcyBsb2NhdGlvblxyXG5cdFx0cGF0aDogXCIvXCIsXHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgZG9tYWluIHRoYXQgdGhlIGNvb2tpZSAnbmFtZScgYmVsb25ncyB0by4gVGhlIGNvb2tpZSBjYW4gb25seSBiZSByZWFkIG9uIHRoaXMgZG9tYWluLlxyXG5cdFx0Ly8gIC0gR3VpZGUgdG8gY29va2llIGRvbWFpbnMgLSBodHRwOi8vZXJpay5pby9ibG9nLzIwMTQvMDMvMDQvZGVmaW5pdGl2ZS1ndWlkZS10by1jb29raWUtZG9tYWlucy9cclxuXHRcdGRvbWFpbjogXCJmaWxlXCIsXHJcblxyXG5cdFx0Ly8gVGhlIGNvb2tpZXMgZXhwaXJlIGRhdGUsIHNwZWNpZmllZCBpbiBkYXlzIChzcGVjaWZ5IC0xIGZvciBubyBleHBpcnkpXHJcblx0XHRleHBpcnlEYXlzOiAzNjUsXHJcblx0fSxcclxuXHJcblx0Ly8gZWFjaCBpdGVtIGRlZmluZXMgdGhlIGlubmVyIHRleHQgZm9yIHRoZSBlbGVtZW50IHRoYXQgaXQgcmVmZXJlbmNlc1xyXG5cdGNvbnRlbnQ6IHtcclxuXHRcdGhlYWRlcjogXCJDb29raWVzIHV0aWxpdHphZGVzIGEgbGEgd2ViIVwiLFxyXG5cdFx0bWVzc2FnZTogXCJVdGlsaXR6ZW0gZ2FsZXRlcyBwZXIgZGlzdGluZ2lyLXZvcyBkJ2FsdHJlcyB1c3VhcmlzIGVuIGVscyBub3N0cmVzIHdlYnMsIHBlciBtaWxsb3JhciBsYSBpbmZvcm1hY2nDsyBpIGVscyBzZXJ2ZWlzIHF1ZSB1cyBvZmVyaW0sIGkgcGVyIGZhY2lsaXRhci12b3MgbCdhY2PDqXMuIFBlciBhIG3DqXMgaW5mb3JtYWNpw7MsIGNvbnN1bHRldSBsYSBcIixcclxuXHRcdGFsbG93OiBcIkFjY2VwdGFyXCIsXHJcblx0XHRkZW55OiBcIlJlYnV0amFyXCIsXHJcblx0XHRsaW5rOiBcInBvbMOtdGljYSBkZSBnYWxldGVzXCIsXHJcblx0XHRocmVmOiBcImh0dHA6Ly93d3cuaWNnYy5jYXQvTC1JQ0dDL1NvYnJlLWwtSUNHQy9Qb2xpdGlxdWVzL1BvbGl0aWNhLWRlLXByb3RlY2Npby1kZS1kYWRlcy1wZXJzb25hbHMvUG9saXRpY2EtZGUtZ2FsZXRlcy1jb29raWVzXCIsXHJcblx0XHRjbG9zZTogXCImI3gyNzRjO1wiLFxyXG5cdFx0Y29uZmlnOiBcIkNvbmZpZ3VyYXIgY29va2llc1wiXHJcblx0fSxcclxuXHJcblx0Ly8gVGhpcyBpcyB0aGUgSFRNTCBmb3IgdGhlIGVsZW1lbnRzIGFib3ZlLiBUaGUgc3RyaW5nIHt7aGVhZGVyfX0gd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBlcXVpdmFsZW50IHRleHQgYmVsb3cuXHJcblx0Ly8gWW91IGNhbiByZW1vdmUgXCJ7e2hlYWRlcn19XCIgYW5kIHdyaXRlIHRoZSBjb250ZW50IGRpcmVjdGx5IGluc2lkZSB0aGUgSFRNTCBpZiB5b3Ugd2FudC5cclxuXHQvL1xyXG5cdC8vICAtIEFSSUEgcnVsZXMgc3VnZ2VzdCB0byBlbnN1cmUgY29udHJvbHMgYXJlIHRhYmJhYmxlIChzbyB0aGUgYnJvd3NlciBjYW4gZmluZCB0aGUgZmlyc3QgY29udHJvbCksXHJcblx0Ly8gICAgYW5kIHRvIHNldCB0aGUgZm9jdXMgdG8gdGhlIGZpcnN0IGludGVyYWN0aXZlIGNvbnRyb2wgKGh0dHA6Ly93M2MuZ2l0aHViLmlvL2FyaWEtaW4taHRtbC8pXHJcblx0ZWxlbWVudHM6IHtcclxuXHRcdGhlYWRlcjogXCI8c3BhbiBjbGFzcz1cXFwiY2MtaGVhZGVyXFxcIj57e2hlYWRlcn19PC9zcGFuPiZuYnNwO1wiLFxyXG5cdFx0bWVzc2FnZTogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX08L3NwYW4+XCIsXHJcblx0XHRtZXNzYWdlbGluazogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX0gPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiByZWw9XFxcIm5vb3BlbmVyIG5vcmVmZXJyZXIgbm9mb2xsb3dcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj57e2xpbmt9fTwvYT48L3NwYW4+XCIsXHJcblx0XHRhbGxvdzogXCI8YSBhcmlhLWxhYmVsPVxcXCJhbGxvdyBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgIGNsYXNzPVxcXCJjYy1idG4gY2MtYWxsb3dcXFwiPnt7YWxsb3d9fTwvYT5cIixcclxuXHRcdGRlbnk6IFwiPGEgYXJpYS1sYWJlbD1cXFwiZGVueSBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWJ0biBjYy1kZW55XFxcIj57e2Rlbnl9fTwvYT5cIixcclxuXHRcdGxpbms6IFwiPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+e3tsaW5rfX08L2E+XCIsXHJcblx0XHRjbG9zZTogXCI8c3BhbiBhcmlhLWxhYmVsPVxcXCJkaXNtaXNzIGNvb2tpZSBtZXNzYWdlXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWNsb3NlXFxcIj57e2Nsb3NlfX08L3NwYW4+XCIsXHJcblx0fSxcclxuXHJcblx0Ly8gVGhlIHBsYWNlaG9sZGVycyB7e2NsYXNzZXN9fSBhbmQge3tjaGlsZHJlbn19IGJvdGggZ2V0IHJlcGxhY2VkIGR1cmluZyBpbml0aWFsaXNhdGlvbjpcclxuXHQvLyAgLSB7e2NsYXNzZXN9fSBpcyB3aGVyZSBhZGRpdGlvbmFsIGNsYXNzZXMgZ2V0IGFkZGVkXHJcblx0Ly8gIC0ge3tjaGlsZHJlbn19IGlzIHdoZXJlIHRoZSBIVE1MIGNoaWxkcmVuIGFyZSBwbGFjZWRcclxuXHR3aW5kb3c6IFwiPGRpdiByb2xlPVxcXCJkaWFsb2dcXFwiIGFyaWEtbGl2ZT1cXFwicG9saXRlXFxcIiBhcmlhLWxhYmVsPVxcXCJjb29raWVjb25zZW50XFxcIiBhcmlhLWRlc2NyaWJlZGJ5PVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy13aW5kb3cge3tjbGFzc2VzfX1cXFwiPjwhLS1nb29nbGVvZmY6IGFsbC0tPnt7Y2hpbGRyZW59fTwhLS1nb29nbGVvbjogYWxsLS0+PC9kaXY+XCIsXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIGh0bWwgZm9yIHRoZSBjb25maWcgYnV0dG9uLiBUaGlzIG9ubHkgc2hvd3MgdXAgYWZ0ZXIgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIHRoZWlyIGxldmVsIG9mIGNvbnNlbnRcclxuXHQvLyBJdCBtdXN0IGluY2x1ZGUgdGhlIGNjLWNvbmZpZyBjbGFzc1xyXG5cdGNvbmZpZ0J0bjogXCI8ZGl2IGNsYXNzPVxcXCJjYy1jb25maWcge3tjb25maWctY2xhc3N9fVxcXCI+PGltZyBzcmM9XFxcIi9kaXN0L2Nvb2tpZS1pY29uLTI0LnBuZ1xcXCIgc3R5bGU9XFxcIm1hcmdpbi1yaWdodDogNXB4O1xcXCIvPnt7Y29uZmlnLXRleHR9fTwvZGl2PlwiLFxyXG5cclxuXHQvLyBUaGlzIGlzIHRoZSBlbGVtZW50IHNlbGVjdG9yIHdoZXJlIHRoZSBjb25maWcgYnV0dG9uIHdpbGwgYmUgYWRkZWRcclxuXHRjb25maWdCdG5TZWxlY3RvcjogXCJcIixcclxuXHJcblx0Ly8gZGVmaW5lIHR5cGVzIG9mICdjb21wbGlhbmNlJyBoZXJlLiAne3t2YWx1ZX19JyBzdHJpbmdzIGluIGhlcmUgYXJlIGxpbmtlZCB0byBgZWxlbWVudHNgXHJcblx0Y29tcGxpYW5jZTogXCI8ZGl2IGNsYXNzPVxcXCJjYy1jb21wbGlhbmNlIGNjLWhpZ2hsaWdodFxcXCI+e3tkZW55fX17e2FsbG93fX08L2Rpdj5cIixcclxuXHJcblx0Ly8gZGVmaW5lIGxheW91dCBsYXlvdXRzIGhlcmVcclxuXHRsYXlvdXRzOiB7XHJcblx0XHQvLyB0aGUgJ2Jsb2NrJyBsYXlvdXQgdGVuZCB0byBiZSBmb3Igc3F1YXJlIGZsb2F0aW5nIHBvcHVwc1xyXG5cdFx0XCJiYXNpY1wiOiBcInt7bWVzc2FnZWxpbmt9fXt7Y29tcGxpYW5jZX19XCIsXHJcblx0XHRcImJhc2ljLWNsb3NlXCI6IFwie3ttZXNzYWdlbGlua319e3tjb21wbGlhbmNlfX17e2Nsb3NlfX1cIixcclxuXHRcdFwiYmFzaWMtaGVhZGVyXCI6IFwie3toZWFkZXJ9fXt7bWVzc2FnZX19e3tsaW5rfX17e2NvbXBsaWFuY2V9fVwiLFxyXG5cdH0sXHJcblxyXG5cdC8vIGRlZmF1bHQgbGF5b3V0IChzZWUgYWJvdmUpXHJcblx0bGF5b3V0OiBcImJhc2ljXCIsXHJcblxyXG5cdC8vIHRoaXMgcmVmZXJzIHRvIHRoZSBwb3B1cCB3aW5kb3dzIHBvc2l0aW9uLiB3ZSBjdXJyZW50bHkgc3VwcG9ydDpcclxuXHQvLyAgLSBiYW5uZXIgcG9zaXRpb25zOiB0b3AsIGJvdHRvbVxyXG5cdC8vICAtIGZsb2F0aW5nIHBvc2l0aW9uczogdG9wLWxlZnQsIHRvcC1yaWdodCwgYm90dG9tLWxlZnQsIGJvdHRvbS1yaWdodFxyXG5cdC8vXHJcblx0Ly8gYWRkcyBhIGNsYXNzIGBjYy1mbG9hdGluZ2Agb3IgYGNjLWJhbm5lcmAgd2hpY2ggaGVscHMgd2hlbiBzdHlsaW5nXHJcblx0cG9zaXRpb246IFwiYm90dG9tXCIsIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgJ2JvdHRvbSdcclxuXHJcblx0Ly8gQXZhaWxhYmxlIHN0eWxlc1xyXG5cdC8vICAgIC1ibG9jayAoZGVmYXVsdCwgbm8gZXh0cmEgY2xhc3NlcylcclxuXHQvLyAgICAtZWRnZWxlc3NcclxuXHQvLyAgICAtY2xhc3NpY1xyXG5cdC8vIHVzZSB5b3VyIG93biBzdHlsZSBuYW1lIGFuZCB1c2UgYC5jYy10aGVtZS1TVFlMRU5BTUVgIGNsYXNzIGluIENTUyB0byBlZGl0LlxyXG5cdC8vIE5vdGU6IHN0eWxlIFwid2lyZVwiIGlzIHVzZWQgZm9yIHRoZSBjb25maWd1cmF0b3IsIGJ1dCBoYXMgbm8gQ1NTIHN0eWxlcyBvZiBpdHMgb3duLCBvbmx5IHBhbGV0dGUgaXMgdXNlZC5cclxuXHR0aGVtZTogXCJibG9ja1wiLFxyXG5cclxuXHQvLyBpZiB5b3Ugd2FudCBjdXN0b20gY29sb3VycywgcGFzcyB0aGVtIGluIGhlcmUuIHRoaXMgb2JqZWN0IHNob3VsZCBsb29rIGxpa2UgdGhpcy5cclxuXHQvLyBpZGVhbGx5LCBhbnkgY3VzdG9tIGNvbG91cnMvdGhlbWVzIHNob3VsZCBiZSBjcmVhdGVkIGluIGEgc2VwYXJhdGUgc3R5bGUgc2hlZXQsIGFzIHRoaXMgaXMgbW9yZSBlZmZpY2llbnQuXHJcblx0Ly8gICB7XHJcblx0Ly8gICAgIHBvcHVwOiB7YmFja2dyb3VuZDogJyMwMDAwMDAnLCB0ZXh0OiAnI2ZmZicsIGxpbms6ICcjZmZmJ30sXHJcblx0Ly8gICAgIGJ1dHRvbjoge2JhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnI2Y4ZTcxYyd9LFxyXG5cdC8vICAgICBoaWdobGlnaHQ6IHtiYWNrZ3JvdW5kOiAnI2Y4ZTcxYycsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnIzAwMDAwMCd9LFxyXG5cdC8vICAgfVxyXG5cdC8vIGBoaWdobGlnaHRgIGlzIG9wdGlvbmFsIGFuZCBleHRlbmRzIGBidXR0b25gLiBpZiBpdCBleGlzdHMsIGl0IHdpbGwgYXBwbHkgdG8gdGhlIGZpcnN0IGJ1dHRvblxyXG5cdC8vIG9ubHkgYmFja2dyb3VuZCBuZWVkcyB0byBiZSBkZWZpbmVkIGZvciBldmVyeSBlbGVtZW50LiBpZiBub3Qgc2V0LCBvdGhlciBjb2xvcnMgY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSBpdFxyXG5cdHBhbGV0dGU6e1xyXG5cdFx0cG9wdXA6IHtiYWNrZ3JvdW5kOiBcIiMyMjIyMjJcIn0sXHJcblx0XHRidXR0b246IHtiYWNrZ3JvdW5kOiBcIiMwMGIwNTBcIn1cclxuXHR9LFxyXG59O1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHZlcnNpb24gICAgICAgICA9IHJlcXVpcmUoXCIuLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbjtcclxuY29uc3QgQ29va2llc0lDR0MgPSByZXF1aXJlKFwiLi9jb29raWVzSWNnY1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHZlcnNpb24sXHJcblx0Q29va2llc0lDR0NcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgcHJvamVjdCBpbiB1c2UgYXMgc3BlY2lmaWVkIGluIGBwYWNrYWdlLmpzb25gLFxyXG4gKiBgQ0hBTkdFTE9HLm1kYCwgYW5kIHRoZSBHaXRIdWIgcmVsZWFzZS5cclxuICpcclxuICogQHZhciB7c3RyaW5nfSB2ZXJzaW9uXHJcbiAqL1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XHJcblxyXG5jbGFzcyBQb3B1cCB7XHJcblxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgIFxyXG5cclxuXHRjb25zdHJ1Y3RvcihvcHRpb25zICAgICAgICAsIHN0YXR1c0xpc3QgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuc3RhdHVzTGlzdCA9IHN0YXR1c0xpc3Q7XHJcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zKSB7XHJcblxyXG5cdFx0XHR0aGlzLmRlc3Ryb3koKTsgLy8gYWxyZWFkeSByZW5kZXJlZFxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyBzZXQgb3B0aW9ucyBiYWNrIHRvIGRlZmF1bHQgb3B0aW9uc1xyXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuXHJcblx0XHQvLyB0aGUgZnVsbCBtYXJrdXAgZWl0aGVyIGNvbnRhaW5zIHRoZSB3cmFwcGVyIG9yIGl0IGRvZXMgbm90IChmb3IgbXVsdGlwbGUgaW5zdGFuY2VzKVxyXG5cdFx0Y29uc3QgY29va2llUG9wdXAgPSB0aGlzLm9wdGlvbnMud2luZG93LnJlcGxhY2UoXCJ7e2NsYXNzZXN9fVwiLCB0aGlzLmdldFBvcHVwQ2xhc3NlcygpLmpvaW4oXCIgXCIpKVxyXG5cdFx0XHQucmVwbGFjZShcInt7Y2hpbGRyZW59fVwiLCB0aGlzLmdldFBvcHVwSW5uZXJNYXJrdXAoKSk7XHJcblxyXG5cdFx0dGhpcy5lbGVtZW50ID0gdGhpcy5hcHBlbmRNYXJrdXAoY29va2llUG9wdXApO1xyXG5cclxuXHRcdHRoaXMub3BlbigpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRlc3Ryb3koKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmFsbG93SGFuZGxlcik7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZW55SGFuZGxlcik7XHJcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKSB7XHJcblxyXG5cdFx0XHR0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuXHRcdH1cclxuXHRcdHRoaXMuZWxlbWVudCA9IG51bGw7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zID0gbnVsbDtcclxuXHJcblx0fVxyXG5cclxuXHRvcGVuKCkge1xyXG5cclxuXHRcdGlmICghdGhpcy5lbGVtZW50KSB7XHJcblxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghdGhpcy5pc09wZW4oKSkge1xyXG5cclxuXHRcdFx0dGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG5cclxuXHRcdFx0VXRpbHMucmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LCBcImNjLWludmlzaWJsZVwiKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4pIHtcclxuXHJcblx0XHRcdFx0dGhpcy5vcHRpb25zLm9uUG9wdXBPcGVuKCk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGNsb3NlKCkge1xyXG5cclxuXHRcdGlmICghdGhpcy5lbGVtZW50KSB7XHJcblxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLmlzT3BlbigpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5vblBvcHVwQ2xvc2UpIHtcclxuXHJcblx0XHRcdFx0dGhpcy5vcHRpb25zLm9uUG9wdXBDbG9zZSgpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRpc09wZW4oKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PT0gXCJcIiAmJiAhVXRpbHMuaGFzQ2xhc3ModGhpcy5lbGVtZW50LCBcImNjLWludmlzaWJsZVwiKTtcclxuXHJcblx0fVxyXG5cclxuXHRnZXRQb3NpdGlvbkNsYXNzZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgcG9zaXRpb25zID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uLnNwbGl0KFwiLVwiKTsgLy8gdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0XHJcblx0XHRjb25zdCBjbGFzc2VzID0gW107XHJcblxyXG5cdFx0Ly8gdG9wLCBsZWZ0LCByaWdodCwgYm90dG9tXHJcblx0XHRwb3NpdGlvbnMuZm9yRWFjaCgoY3VyKSA9PiB7XHJcblxyXG5cdFx0XHRjbGFzc2VzLnB1c2goYGNjLSR7Y3VyfWApO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBjbGFzc2VzO1xyXG5cclxuXHR9XHJcblxyXG5cdGdldFBvcHVwQ2xhc3NlcygpIHtcclxuXHJcblx0XHRjb25zdCBvcHRzID0gdGhpcy5vcHRpb25zO1xyXG5cdFx0bGV0IHBvc2l0aW9uU3R5bGUgPSAob3B0cy5wb3NpdGlvbiA9PT0gXCJ0b3BcIiB8fCBvcHRzLnBvc2l0aW9uID09PSBcImJvdHRvbVwiKSA/IFwiYmFubmVyXCIgOiBcImZsb2F0aW5nXCI7XHJcblxyXG5cdFx0aWYgKG9wdHMuaXNNb2JpbGUpIHtcclxuXHJcblx0XHRcdHBvc2l0aW9uU3R5bGUgPSBcImZsb2F0aW5nXCI7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGNsYXNzZXMgPSBbXHJcblx0XHRcdGBjYy0ke3Bvc2l0aW9uU3R5bGV9YCwgLy8gZmxvYXRpbmcgb3IgYmFubmVyXHJcblx0XHRcdFwiY2MtdHlwZS1vcHQtaW5cIiwgLy8gYWRkIHRoZSBjb21wbGlhbmNlIHR5cGVcclxuXHRcdFx0YGNjLXRoZW1lLSR7b3B0cy50aGVtZX1gLCAvLyBhZGQgdGhlIHRoZW1lXHJcblx0XHRdO1xyXG5cclxuXHRcdGlmIChvcHRzLnN0YXRpYykge1xyXG5cclxuXHRcdFx0Y2xhc3Nlcy5wdXNoKFwiY2Mtc3RhdGljXCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRjbGFzc2VzLnB1c2guYXBwbHkoY2xhc3NlcywgdGhpcy5nZXRQb3NpdGlvbkNsYXNzZXMoKSk7XHJcblxyXG5cdFx0Ly8gd2Ugb25seSBhZGQgZXh0cmEgc3R5bGVzIGlmIGBwYWxldHRlYCBoYXMgYmVlbiBzZXQgdG8gYSB2YWxpZCB2YWx1ZVxyXG5cdFx0dGhpcy5hdHRhY2hDdXN0b21QYWxldHRlKHRoaXMub3B0aW9ucy5wYWxldHRlKTtcclxuXHJcblx0XHQvLyBpZiB3ZSBvdmVycmlkZSB0aGUgcGFsZXR0ZSwgYWRkIHRoZSBjbGFzcyB0aGF0IGVuYWJsZXMgdGhpc1xyXG5cdFx0aWYgKHRoaXMuY3VzdG9tU3R5bGVTZWxlY3Rvcikge1xyXG5cclxuXHRcdFx0Y2xhc3Nlcy5wdXNoKHRoaXMuY3VzdG9tU3R5bGVTZWxlY3Rvcik7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjbGFzc2VzO1xyXG5cclxuXHR9XHJcblxyXG5cdGdldFBvcHVwSW5uZXJNYXJrdXAoKSB7XHJcblxyXG5cdFx0Y29uc3QgaW50ZXJwb2xhdGVkID0ge307XHJcblx0XHRjb25zdCBvcHRzID0gdGhpcy5vcHRpb25zO1xyXG5cclxuXHRcdE9iamVjdC5rZXlzKG9wdHMuZWxlbWVudHMpLmZvckVhY2goKHByb3ApID0+IHtcclxuXHJcblx0XHRcdGludGVycG9sYXRlZFtwcm9wXSA9IFV0aWxzLmludGVycG9sYXRlU3RyaW5nKG9wdHMuZWxlbWVudHNbcHJvcF0sIChuYW1lKSA9PiB7XHJcblxyXG5cdFx0XHRcdGNvbnN0IHN0ciA9IG9wdHMuY29udGVudFtuYW1lXTtcclxuXHRcdFx0XHRyZXR1cm4gKG5hbWUgJiYgdHlwZW9mIHN0ciA9PSBcInN0cmluZ1wiICYmIHN0ci5sZW5ndGgpID8gc3RyIDogXCJcIjtcclxuXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGNoZWNrcyBpZiB0aGUgdHlwZSBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gaW5mbyBpZiBpdCdzIG5vdFxyXG5cdFx0Y29uc3QgY29tcGxpYW5jZVR5cGUgPSBvcHRzLmNvbXBsaWFuY2U7XHJcblxyXG5cdFx0Ly8gYnVpbGQgdGhlIGNvbXBsaWFuY2UgdHlwZXMgZnJvbSB0aGUgYWxyZWFkeSBpbnRlcnBvbGF0ZWQgYGVsZW1lbnRzYFxyXG5cdFx0aW50ZXJwb2xhdGVkLmNvbXBsaWFuY2UgPSBVdGlscy5pbnRlcnBvbGF0ZVN0cmluZyhjb21wbGlhbmNlVHlwZSwgKG5hbWUpID0+IHtcclxuXHJcblx0XHRcdHJldHVybiBpbnRlcnBvbGF0ZWRbbmFtZV07XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY2hlY2tzIGlmIHRoZSBsYXlvdXQgaXMgdmFsaWQgYW5kIGRlZmF1bHRzIHRvIGJhc2ljIGlmIGl0J3Mgbm90XHJcblx0XHRsZXQgbGF5b3V0ID0gb3B0cy5sYXlvdXRzW29wdHMubGF5b3V0XTtcclxuXHRcdGlmICghbGF5b3V0KSB7XHJcblxyXG5cdFx0XHRsYXlvdXQgPSBvcHRzLmxheW91dHMuYmFzaWM7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBVdGlscy5pbnRlcnBvbGF0ZVN0cmluZyhsYXlvdXQsIChtYXRjaCkgPT4ge1xyXG5cclxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFttYXRjaF07XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0YXBwZW5kTWFya3VwKG1hcmt1cCkge1xyXG5cclxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IGNvbnQgPSAob3B0cy5jb250YWluZXIgJiYgb3B0cy5jb250YWluZXIubm9kZVR5cGUgPT09IDEpID8gb3B0cy5jb250YWluZXIgOiBkb2N1bWVudC5ib2R5O1xyXG5cclxuXHRcdGRpdi5pbm5lckhUTUwgPSBtYXJrdXA7XHJcblxyXG5cdFx0Y29uc3QgZWwgPSBkaXYuY2hpbGRyZW5bMF07XHJcblxyXG5cdFx0ZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuXHRcdGlmIChVdGlscy5oYXNDbGFzcyhlbCwgXCJjYy13aW5kb3dcIikpIHtcclxuXHJcblx0XHRcdFV0aWxzLmFkZENsYXNzKGVsLCBcImNjLWludmlzaWJsZVwiKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFjb250LmZpcnN0Q2hpbGQpIHtcclxuXHJcblx0XHRcdGNvbnQuYXBwZW5kQ2hpbGQoZWwpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRjb250Lmluc2VydEJlZm9yZShlbCwgY29udC5maXJzdENoaWxkKTtcclxuXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdHJldHVybiBlbDtcclxuXHJcblx0fVxyXG5cclxuXHRzZXRBbGxvd0hhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmFsbG93SGFuZGxlcik7XHJcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYWxsYmFjayk7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0RGVueUhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWRlbnlcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZGVueUhhbmRsZXIpO1xyXG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWRlbnlcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhbGxiYWNrKTtcclxuXHJcblx0fVxyXG5cclxuXHQvLyBJIG1pZ2h0IGNoYW5nZSB0aGlzIGZ1bmN0aW9uIHRvIHVzZSBpbmxpbmUgc3R5bGVzLiBJIG9yaWdpbmFsbHkgY2hvc2UgYSBzdHlsZXNoZWV0IGJlY2F1c2UgSSBjb3VsZCBzZWxlY3QgbWFueSBlbGVtZW50cyB3aXRoIGFcclxuXHQvLyBzaW5nbGUgcnVsZSAoc29tZXRoaW5nIHRoYXQgaGFwcGVuZWQgYSBsb3QpLCB0aGUgYXBwcyBoYXMgY2hhbmdlZCBzbGlnaHRseSBub3cgdGhvdWdoLCBzbyBpbmxpbmUgc3R5bGVzIG1pZ2h0IGJlIG1vcmUgYXBwbGljYWJsZS5cclxuXHRhdHRhY2hDdXN0b21QYWxldHRlKHBhbGV0dGUpIHtcclxuXHJcblx0XHRjb25zdCBoYXNoID0gVXRpbHMuaGFzaChKU09OLnN0cmluZ2lmeShwYWxldHRlKSk7XHJcblx0XHRjb25zdCBzZWxlY3RvciA9IGBjYy1jb2xvci1vdmVycmlkZS0ke2hhc2h9YDtcclxuXHRcdGNvbnN0IGlzVmFsaWQgPSBVdGlscy5pc1BsYWluT2JqZWN0KHBhbGV0dGUpO1xyXG5cclxuXHRcdHRoaXMuY3VzdG9tU3R5bGVTZWxlY3RvciA9IGlzVmFsaWQgPyBzZWxlY3RvciA6IG51bGw7XHJcblxyXG5cdFx0aWYgKGlzVmFsaWQpIHtcclxuXHJcblx0XHRcdHRoaXMuYWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgYC4ke3NlbGVjdG9yfWApO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiBpc1ZhbGlkO1xyXG5cclxuXHR9XHJcblxyXG5cdGFkZEN1c3RvbVN0eWxlKGhhc2gsIHBhbGV0dGUsIHByZWZpeCkge1xyXG5cclxuXHRcdGNvbnN0IGNvbG9yU3R5bGVzID0ge307XHJcblx0XHRjb25zdCBwb3B1cCA9IHBhbGV0dGUucG9wdXA7XHJcblx0XHRjb25zdCBidXR0b24gPSBwYWxldHRlLmJ1dHRvbjtcclxuXHRcdGNvbnN0IGhpZ2hsaWdodCA9IHBhbGV0dGUuaGlnaGxpZ2h0O1xyXG5cclxuXHRcdC8vIG5lZWRzIGJhY2tncm91bmQgY29sb3VyLCB0ZXh0IGFuZCBsaW5rIHdpbGwgYmUgc2V0IHRvIGJsYWNrL3doaXRlIGlmIG5vdCBzcGVjaWZpZWRcclxuXHRcdGlmIChwb3B1cCkge1xyXG5cclxuXHRcdFx0Ly8gYXNzdW1lcyBwb3B1cC5iYWNrZ3JvdW5kIGlzIHNldFxyXG5cdFx0XHRwb3B1cC50ZXh0ID0gcG9wdXAudGV4dCA/IHBvcHVwLnRleHQgOiBVdGlscy5nZXRDb250cmFzdChwb3B1cC5iYWNrZ3JvdW5kKTtcclxuXHRcdFx0cG9wdXAubGluayA9IHBvcHVwLmxpbmsgPyBwb3B1cC5saW5rIDogcG9wdXAudGV4dDtcclxuXHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fS5jYy13aW5kb3dgXSA9IFtcclxuXHRcdFx0XHRgY29sb3I6ICR7cG9wdXAudGV4dH1gLFxyXG5cdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke3BvcHVwLmJhY2tncm91bmR9YFxyXG5cdFx0XHRdO1xyXG5cdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1saW5rLCR7cHJlZml4fSAuY2MtbGluazphY3RpdmUsJHtwcmVmaXh9IC5jYy1saW5rOnZpc2l0ZWRgXSA9IFtcclxuXHRcdFx0XHRgY29sb3I6ICR7cG9wdXAubGlua31gXHJcblx0XHRcdF07XHJcblxyXG5cdFx0XHRpZiAoYnV0dG9uKSB7XHJcblxyXG5cdFx0XHRcdC8vIGFzc3VtZXMgYnV0dG9uLmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdFx0YnV0dG9uLnRleHQgPSBidXR0b24udGV4dCA/IGJ1dHRvbi50ZXh0IDogVXRpbHMuZ2V0Q29udHJhc3QoYnV0dG9uLmJhY2tncm91bmQpO1xyXG5cdFx0XHRcdGJ1dHRvbi5ib3JkZXIgPSBidXR0b24uYm9yZGVyID8gYnV0dG9uLmJvcmRlciA6IFwidHJhbnNwYXJlbnRcIjtcclxuXHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1idG5gXSA9IFtcclxuXHRcdFx0XHRcdGBjb2xvcjogJHtidXR0b24udGV4dH1gLFxyXG5cdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtidXR0b24uYm9yZGVyfWAsXHJcblx0XHRcdFx0XHRgYmFja2dyb3VuZC1jb2xvcjogJHtidXR0b24uYmFja2dyb3VuZH1gXHJcblx0XHRcdFx0XTtcclxuXHJcblx0XHRcdFx0aWYgKGJ1dHRvbi5iYWNrZ3JvdW5kICE9PSBcInRyYW5zcGFyZW50XCIpIHtcclxuXHJcblx0XHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1idG46aG92ZXIsICR7cHJlZml4fSAuY2MtYnRuOmZvY3VzYF0gPSBbXHJcblx0XHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke1V0aWxzLmdldEhvdmVyQ29sb3VyKGJ1dHRvbi5iYWNrZ3JvdW5kKX1gXHJcblx0XHRcdFx0XHRdO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChoaWdobGlnaHQpIHtcclxuXHJcblx0XHRcdFx0Ly9hc3N1bWVzIGhpZ2hsaWdodC5iYWNrZ3JvdW5kIGlzIHNldFxyXG5cdFx0XHRcdFx0aGlnaGxpZ2h0LnRleHQgPSBoaWdobGlnaHQudGV4dCA/IGhpZ2hsaWdodC50ZXh0IDogVXRpbHMuZ2V0Q29udHJhc3QoaGlnaGxpZ2h0LmJhY2tncm91bmQpO1xyXG5cdFx0XHRcdFx0aGlnaGxpZ2h0LmJvcmRlciA9IGhpZ2hsaWdodC5ib3JkZXIgPyBoaWdobGlnaHQuYm9yZGVyIDogXCJ0cmFuc3BhcmVudFwiO1xyXG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtaGlnaGxpZ2h0IC5jYy1idG46Zmlyc3QtY2hpbGRgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGNvbG9yOiAke2hpZ2hsaWdodC50ZXh0fWAsXHJcblx0XHRcdFx0XHRcdGBib3JkZXItY29sb3I6ICR7aGlnaGxpZ2h0LmJvcmRlcn1gLFxyXG5cdFx0XHRcdFx0XHRgYmFja2dyb3VuZC1jb2xvcjogJHtoaWdobGlnaHQuYmFja2dyb3VuZH1gXHJcblx0XHRcdFx0XHRdO1xyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0XHQvLyBzZXRzIGhpZ2hsaWdodCB0ZXh0IGNvbG9yIHRvIHBvcHVwIHRleHQuIGJhY2tncm91bmQgYW5kIGJvcmRlciBhcmUgdHJhbnNwYXJlbnQgYnkgZGVmYXVsdC5cclxuXHRcdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWhpZ2hsaWdodCAuY2MtYnRuOmZpcnN0LWNoaWxkYF0gPSBbXHJcblx0XHRcdFx0XHRcdGBjb2xvcjogJHtwb3B1cC50ZXh0fWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gdGhpcyB3aWxsIGJlIGludGVycHJldHRlZCBhcyBDU1MuIHRoZSBrZXkgaXMgdGhlIHNlbGVjdG9yLCBhbmQgZWFjaCBhcnJheSBlbGVtZW50IGlzIGEgcnVsZVxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcblx0XHRsZXQgcnVsZUluZGV4ID0gLTE7XHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4gY29sb3JTdHlsZXMpIHtcclxuXHJcblx0XHRcdHN0eWxlLnNoZWV0Lmluc2VydFJ1bGUoYCR7cHJvcH17JHtjb2xvclN0eWxlc1twcm9wXS5qb2luKFwiO1wiKX19YCwgKytydWxlSW5kZXgpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3B1cDtcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jbGFzcyBVdGlscyB7XHJcblxyXG5cdHN0YXRpYyBlc2NhcGVSZWdFeHAoc3RyICAgICAgICApIHtcclxuXHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaGFzQ2xhc3MoZWxlbWVudCAgICAgICAgLCBzZWxlY3RvciAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgcyA9IFwiIFwiO1xyXG5cdFx0Y29uc3QgY2xhc3NGb3VuZCA9IChzICsgZWxlbWVudC5jbGFzc05hbWUgKyBzKS5yZXBsYWNlKC9bXFxuXFx0XS9nLCBzKS5pbmRleE9mKHMgKyBzZWxlY3RvciArIHMpID49IDA7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdHJldHVybiBlbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJiBjbGFzc0ZvdW5kO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBhZGRDbGFzcyhlbGVtZW50ICAgICAgICAsIGNsYXNzTmFtZSAgICAgICAgKSB7XHJcblxyXG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgKz0gYCAke2NsYXNzTmFtZX1gO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyByZW1vdmVDbGFzcyhlbGVtZW50ICAgICAgICAsIGNsYXNzTmFtZSAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBcXFxcYiR7VXRpbHMuZXNjYXBlUmVnRXhwKGNsYXNzTmFtZSl9XFxcXGJgKTtcclxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShyZWdleCwgXCJcIik7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGludGVycG9sYXRlU3RyaW5nKHN0ciAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBtYXJrZXIgPSAve3soW2Etel1bYS16MC05XFwtX10qKX19L2lnO1xyXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKG1hcmtlciwgZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soYXJndW1lbnRzWzFdKSB8fCBcIlwiO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIG9ubHkgdXNlZCBmb3IgaGFzaGluZyBqc29uIG9iamVjdHMgKHVzZWQgZm9yIGhhc2ggbWFwcGluZyBwYWxldHRlIG9iamVjdHMsIHVzZWQgd2hlbiBjdXN0b20gY29sb3VycyBhcmUgcGFzc2VkIHRocm91Z2ggSmF2YVNjcmlwdClcclxuXHRzdGF0aWMgaGFzaChzdHIgICAgICAgICkge1xyXG5cclxuXHRcdGxldCBoYXNoID0gMCxcclxuXHRcdFx0aSwgY2hyLCBsZW47XHJcblx0XHRpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuXHRcdFx0cmV0dXJuIGhhc2g7XHJcblxyXG5cdFx0fVxyXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcblxyXG5cdFx0XHRjaHIgPSBzdHIuY2hhckNvZGVBdChpKTtcclxuXHRcdFx0aGFzaCA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgY2hyO1xyXG5cdFx0XHRoYXNoIHw9IDA7XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGhhc2g7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIG5vcm1hbGlzZUhleChoZXggICAgICAgICkge1xyXG5cclxuXHRcdGlmIChoZXhbMF0gPT09IFwiI1wiKSB7XHJcblxyXG5cdFx0XHRoZXggPSBoZXguc3Vic3RyKDEpO1xyXG5cclxuXHRcdH1cclxuXHRcdGlmIChoZXgubGVuZ3RoID09PSAzKSB7XHJcblxyXG5cdFx0XHRoZXggPSBoZXhbMF0gKyBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl07XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGhleDtcclxuXHJcblx0fVxyXG5cclxuXHQvLyB1c2VkIHRvIGdldCB0ZXh0IGNvbG9ycyBpZiBub3Qgc2V0XHJcblx0c3RhdGljIGdldENvbnRyYXN0KGhleCAgICAgICAgKSB7XHJcblxyXG5cdFx0aGV4ID0gVXRpbHMubm9ybWFsaXNlSGV4KGhleCk7XHJcblx0XHRjb25zdCByID0gcGFyc2VJbnQoaGV4LnN1YnN0cigwLCAyKSwgMTYpO1xyXG5cdFx0Y29uc3QgZyA9IHBhcnNlSW50KGhleC5zdWJzdHIoMiwgMiksIDE2KTtcclxuXHRcdGNvbnN0IGIgPSBwYXJzZUludChoZXguc3Vic3RyKDQsIDIpLCAxNik7XHJcblx0XHRjb25zdCB5aXEgPSAoKHIgKiAyOTkpICsgKGcgKiA1ODcpICsgKGIgKiAxMTQpKSAvIDEwMDA7XHJcblx0XHRyZXR1cm4gKHlpcSA+PSAxMjgpID8gXCIjMDAwXCIgOiBcIiNmZmZcIjtcclxuXHJcblx0fVxyXG5cclxuXHQvLyB1c2VkIHRvIGNoYW5nZSBjb2xvciBvbiBoaWdobGlnaHRcclxuXHRzdGF0aWMgZ2V0THVtaW5hbmNlKGhleCAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgbnVtID0gcGFyc2VJbnQoVXRpbHMubm9ybWFsaXNlSGV4KGhleCksIDE2KSxcclxuXHRcdFx0YW10ID0gMzgsXHJcblx0XHRcdFIgPSAobnVtID4+IDE2KSArIGFtdCxcclxuXHRcdFx0QiA9IChudW0gPj4gOCAmIDB4MDBGRikgKyBhbXQsXHJcblx0XHRcdEcgPSAobnVtICYgMHgwMDAwRkYpICsgYW10O1xyXG5cdFx0Y29uc3QgbmV3Q29sb3VyID0gKDB4MTAwMDAwMCArIChSIDwgMjU1ID8gUiA8IDEgPyAwIDogUiA6IDI1NSkgKiAweDEwMDAwICsgKEIgPCAyNTUgPyBCIDwgMSA/IDAgOiBCIDogMjU1KSAqIDB4MTAwICsgKEcgPCAyNTUgPyBHIDwgMSA/IDAgOiBHIDogMjU1KSkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xyXG5cdFx0cmV0dXJuIGAjJHtuZXdDb2xvdXJ9YDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZ2V0SG92ZXJDb2xvdXIoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRoZXggPSBVdGlscy5ub3JtYWxpc2VIZXgoaGV4KTtcclxuXHRcdC8vIGZvciBibGFjayBidXR0b25zXHJcblx0XHRpZiAoaGV4ID09PSBcIjAwMDAwMFwiKSB7XHJcblxyXG5cdFx0XHRyZXR1cm4gXCIjMjIyXCI7XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFV0aWxzLmdldEx1bWluYW5jZShoZXgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpc01vYmlsZSh1c2VyQWdlbnQgICAgICAgICkge1xyXG5cclxuXHRcdHJldHVybiAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QodXNlckFnZW50KTtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaXNQbGFpbk9iamVjdChvYmogICAgICAgICkge1xyXG5cclxuXHRcdC8vIFRoZSBjb2RlIFwidHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqICE9PSBudWxsXCIgYWxsb3dzIEFycmF5IG9iamVjdHNcclxuXHRcdHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgYXJyYXlDb250YWluc01hdGNoZXMoYXJyYXkgICAgICAgLCBzZWFyY2ggICAgICAgICkge1xyXG5cclxuXHRcdGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblxyXG5cdFx0XHRjb25zdCBzdHIgPSBhcnJheVtpXTtcclxuXHRcdFx0Ly8gaWYgcmVnZXggbWF0Y2hlcyBvciBzdHJpbmcgaXMgZXF1YWwsIHJldHVybiB0cnVlXHJcblx0XHRcdGlmICgoc3RyIGluc3RhbmNlb2YgUmVnRXhwICYmIHN0ci50ZXN0KHNlYXJjaCkpIHx8XHJcblx0XHRcdCh0eXBlb2Ygc3RyID09IFwic3RyaW5nXCIgJiYgc3RyLmxlbmd0aCAmJiBzdHIgPT09IHNlYXJjaCkpIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lcmdlcyBhbGwgdGhlIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXRcclxuXHQgKiBvYmplY3QuIFN1Ym9iamVjdHMgYXJlIGFsc28gbWVyZ2VkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZXMgQSBsaXN0IG9mIHNvdXJjZSBvYmplY3RzXHJcblx0ICogQHJldHVybnMge09iamVjdH0gVGhlIHRhcmdldCBvYmplY3RcclxuXHQgKi9cclxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcclxuXHRzdGF0aWMgZGVlcE1lcmdlKHRhcmdldCAgICAgICAgLCAuLi5zb3VyY2VzICAgICAgICApIHtcclxuXHJcblx0XHRsZXQgbmV3T2JqID0gdGFyZ2V0O1xyXG5cdFx0Ly8gYXJndW1lbnRzIGlzIG5vdCBhbiBBcnJheSwgaXQncyBBcnJheS1saWtlIVxyXG5cdFx0Y29uc3QgbmV3U291cmNlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcblxyXG5cdFx0bmV3U291cmNlcy5mb3JFYWNoKChzb3VyY2UpID0+IHtcclxuXHJcblx0XHRcdG5ld09iaiA9IFV0aWxzLnNpbmdsZURlZXBNZXJnZShuZXdPYmosIHNvdXJjZSk7XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIG5ld09iajtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZXJnZXMgYWxsIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXRcclxuXHQgKiBvYmplY3QuIFN1Ym9iamVjdHMgYXJlIGFsc28gbWVyZ2VkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdCB0byBtZXJnZVxyXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSB0YXJnZXQgb2JqZWN0XHJcblx0ICovXHJcblx0c3RhdGljIHNpbmdsZURlZXBNZXJnZSh0YXJnZXQgICAgICAgICwgc291cmNlICAgICAgICApIHtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4gc291cmNlKSB7XHJcblxyXG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGFuIGVudW1lcmFibGUgcHJvcGVydHkgc28gd2UgZG9uJ3RcclxuXHRcdFx0Ly8gb3ZlcndyaXRlIHByb3BlcnRpZXMgbGlrZSBsZW5ndGggb3IgZnVuY3Rpb25zXHJcblx0XHRcdGlmIChzb3VyY2UucHJvcGVydHlJc0VudW1lcmFibGUocHJvcCkpIHtcclxuXHJcblx0XHRcdFx0bGV0IHNvdXJjZVZhbHVlID0gc291cmNlW3Byb3BdO1xyXG5cdFx0XHRcdGxldCB0YXJnZXRWYWx1ZSA9IHRhcmdldFtwcm9wXTtcclxuXHJcblx0XHRcdFx0aWYgKCF0YXJnZXRWYWx1ZSkge1xyXG5cclxuXHRcdFx0XHRcdHRhcmdldFZhbHVlID0ge307XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc291cmNlVmFsdWUpKSB7XHJcblxyXG5cdFx0XHRcdFx0c291cmNlVmFsdWUgPSBzb3VyY2VWYWx1ZS5zbGljZSgwKTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygc291cmNlVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgIUFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpKSB7XHJcblxyXG5cdFx0XHRcdFx0c291cmNlVmFsdWUgPSBVdGlscy5zaW5nbGVEZWVwTWVyZ2UodGFyZ2V0VmFsdWUsIHNvdXJjZVZhbHVlKTtcclxuXHJcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygc291cmNlVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgQXJyYXkuaXNBcnJheSh0YXJnZXRWYWx1ZSkpIHtcclxuXHJcblx0XHRcdFx0XHRzb3VyY2VWYWx1ZSA9IFV0aWxzLnNpbmdsZURlZXBNZXJnZSh7fSwgc291cmNlVmFsdWUpO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRhcmdldFtwcm9wXSA9IHNvdXJjZVZhbHVlO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiB0YXJnZXQ7XHJcblxyXG5cdH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XHJcbiJdfQ==
