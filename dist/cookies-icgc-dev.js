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
var util = require("./util");
var Popup = require("./popup");

var Cookieconsent = function Cookieconsent(options        ) {

	this.status = {
		deny: "deny",
		allow: "allow"
	};

	// set options back to default options
	this.options = defaultOptions;

	// merge in user options
	if (util.isPlainObject(options)) {

		Object.assign(this.options, options);

	}

	// eslint-disable-next-line no-warning-comments
	// TODO: navigator and document shouldn't be used here
	// eslint-disable-next-line no-undef
	this.options.userAgent = navigator.userAgent;
	this.options.isMobile = util.isMobile(this.options.userAgent);

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

	if (this.hasConsented()) {

		this.createConfigButton();

	}

};

Cookieconsent.prototype.createConfigButton = function createConfigButton () {
		var this$1 = this;


	var id = this.options.configBtnSelector;
	if (id.trim() !== "") {

		// eslint-disable-next-line no-undef
		document.querySelector(id).innerHTML = this.options.configBtn;
		// eslint-disable-next-line no-undef
		document.querySelector(".cc-config").addEventListener("click", function () { return this$1.onResetConfig(); });

	}

};

Cookieconsent.prototype.removeConfigButton = function removeConfigButton () {

	var id = this.options.configBtnSelector;
	if (id.trim() !== "") {

		// eslint-disable-next-line no-undef
		var btn = document.querySelector(".cc-config");

		if (btn) {

			btn.remove();

		}

	}

};

Cookieconsent.prototype.onResetConfig = function onResetConfig () {

	this.removeConfigButton();
	this.options.onResetConfig();

};

module.exports = Cookieconsent;
},{"./cookieManager":2,"./defaultOptions":5,"./popup":7,"./util":8}],4:[function(require,module,exports){
//      
"use strict";

var CookieConsent = require("./cookieconsent");
var CookieManager = require("./cookieManager");
var defaultOptions = require("./defaultOptions");


var CookiesICGC = function CookiesICGC(domain        , gaIds               , options         ) {
	var this$1 = this;


	var mainOptions = Object.assign({}, defaultOptions, options);

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

	} else {

		this.cookieConsent.createConfigButton();

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

CookiesICGC.prototype.setCookiesEnableHandler = function setCookiesEnableHandler (callback          ) {

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
},{"./cookieManager":2,"./cookieconsent":3,"./defaultOptions":5}],5:[function(require,module,exports){
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
	configBtn: "<div class=\"cc-config {{classes}}\">Configurar cookies</div>",

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

var util = require("./util");

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

		util.removeClass(this.element, "cc-invisible");

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

	return this.element && this.element.style.display === "" && !util.hasClass(this.element, "cc-invisible");

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

		interpolated[prop] = util.interpolateString(opts.elements[prop], function (name) {

			var str = opts.content[name];
			return (name && typeof str == "string" && str.length) ? str : "";

		});

	});

	// checks if the type is valid and defaults to info if it's not
	var complianceType = opts.compliance;

	// build the compliance types from the already interpolated `elements`
	interpolated.compliance = util.interpolateString(complianceType, function (name) {

		return interpolated[name];

	});

	// checks if the layout is valid and defaults to basic if it's not
	var layout = opts.layouts[opts.layout];
	if (!layout) {

		layout = opts.layouts.basic;

	}

	return util.interpolateString(layout, function (match) {

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

	if (util.hasClass(el, "cc-window")) {

		util.addClass(el, "cc-invisible");

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

	var hash = util.hash(JSON.stringify(palette));
	var selector = "cc-color-override-" + hash;
	var isValid = util.isPlainObject(palette);

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
		popup.text = popup.text ? popup.text : util.getContrast(popup.background);
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
			button.text = button.text ? button.text : util.getContrast(button.background);
			button.border = button.border ? button.border : "transparent";
			colorStyles[(prefix + " .cc-btn")] = [
				("color: " + (button.text)),
				("border-color: " + (button.border)),
				("background-color: " + (button.background))
			];

			if (button.background !== "transparent") {

				colorStyles[(prefix + " .cc-btn:hover, " + prefix + " .cc-btn:focus")] = [
					("background-color: " + (util.getHoverColour(button.background)))
				];

			}

			if (highlight) {

			//assumes highlight.background is set
				highlight.text = highlight.text ? highlight.text : util.getContrast(highlight.background);
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
},{"./util":8}],8:[function(require,module,exports){
//      
"use strict";

var Util = function Util () {};

Util.escapeRegExp = function escapeRegExp (str        ) {

	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

};

Util.hasClass = function hasClass (element        , selector        ) {

	var s = " ";
	// eslint-disable-next-line no-undef
	return element.nodeType === Node.ELEMENT_NODE &&
		(s + element.className + s).replace(/[\n\t]/g, s).indexOf(s + selector + s) >= 0;

};

Util.addClass = function addClass (element        , className        ) {

	element.className += " " + className;

};

Util.removeClass = function removeClass (element        , className        ) {

	var regex = new RegExp(("\\b" + (Util.escapeRegExp(className)) + "\\b"));
	element.className = element.className.replace(regex, "");

};

Util.interpolateString = function interpolateString (str        , callback          ) {

	var marker = /{{([a-z][a-z0-9\-_]*)}}/ig;
	return str.replace(marker, function() {

		return callback(arguments[1]) || "";

	});

};

// only used for hashing json objects (used for hash mapping palette objects, used when custom colours are passed through JavaScript)
Util.hash = function hash (str        ) {

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

Util.normaliseHex = function normaliseHex (hex        ) {

	if (hex[0] === "#") {

		hex = hex.substr(1);

	}
	if (hex.length === 3) {

		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

	}
	return hex;

};

// used to get text colors if not set
Util.getContrast = function getContrast (hex        ) {

	hex = Util.normaliseHex(hex);
	var r = parseInt(hex.substr(0, 2), 16);
	var g = parseInt(hex.substr(2, 2), 16);
	var b = parseInt(hex.substr(4, 2), 16);
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? "#000" : "#fff";

};

// used to change color on highlight
Util.getLuminance = function getLuminance (hex        ) {

	var num = parseInt(Util.normaliseHex(hex), 16),
		amt = 38,
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;
	var newColour = (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
	return ("#" + newColour);

};

Util.getHoverColour = function getHoverColour (hex        ) {

	hex = Util.normaliseHex(hex);
	// for black buttons
	if (hex === "000000") {

		return "#222";

	}
	return Util.getLuminance(hex);

};

Util.isMobile = function isMobile (userAgent        ) {

	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

};

Util.isPlainObject = function isPlainObject (obj        ) {

	// The code "typeof obj === 'object' && obj !== null" allows Array objects
	return typeof obj === "object" && obj !== null && obj.constructor === Object;

};

Util.arrayContainsMatches = function arrayContainsMatches (array       , search        ) {

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

module.exports = Util;
},{}]},{},[6])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9jb29raWVNYW5hZ2VyLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvY29va2llY29uc2VudC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvZGVmYXVsdE9wdGlvbnMuanMiLCJlOi91c3VhcmlzL2kuYmVzb3JhL3dvcmtzcGFjZS9JQ0dDLWNvb2tpZS1nZHByL3NyYy9pbmRleC5qcyIsImU6L3VzdWFyaXMvaS5iZXNvcmEvd29ya3NwYWNlL0lDR0MtY29va2llLWdkcHIvc3JjL3BvcHVwLmpzIiwiZTovdXN1YXJpcy9pLmJlc29yYS93b3Jrc3BhY2UvSUNHQy1jb29raWUtZ2Rwci9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLGFBQWE7O2NBT1gsK0JBQVMsQ0FBQyxJQUFJLFVBQVU7O0NBRS9CLEFBQUM7Q0FDRCxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBVSxJQUFJLG1CQUFlLENBQUMsQ0FBQztDQUNoRSxBQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRXpCLEFBQUMsRUFBQzs7QUFFRixjQUFRLCtCQUFTLENBQUMsSUFBSSxVQUFVOztDQUUvQixBQUFDLE9BQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7O0FBRWhELEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7Ozs7QUFNRCxjQUFRLCtCQUFTLENBQUMsSUFBSSxVQUFVLEtBQUssVUFBVSxJQUFJLFVBQVUsTUFBTSxXQUFXLElBQUksV0FBVzs7Q0FFNUYsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Q0FDdEIsQUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDckQsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEFBQUcsSUFBSSxTQUFJLEtBQUssa0JBQVksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFFLENBQUM7Q0FDNUQsQUFBQyxJQUFJLElBQUksRUFBRTs7RUFFVixBQUFDLE1BQU0sSUFBSSxXQUFTLElBQUksQUFBRSxDQUFDOztDQUU1QixBQUFDLENBQUMsTUFBTTs7RUFFUCxBQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7O0NBRXRCLEFBQUMsQ0FBQztDQUNGLEFBQUMsSUFBSSxNQUFNLEVBQUU7O0VBRVosQUFBQyxNQUFNLElBQUksYUFBVyxNQUFNLEFBQUUsQ0FBQzs7Q0FFaEMsQUFBQyxDQUFDOztDQUVGLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUUzQixBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELGNBQVEscUNBQVksQ0FBQyxJQUFJLFVBQVUsTUFBTSxXQUFXLElBQUksV0FBVzs7Q0FFbEUsQUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU3QyxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELGNBQVEsdUNBQWEsR0FBRzs7Q0FFdkIsQUFBQyxHQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Q0FFcEIsQUFBQztDQUNELEFBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxVQUFDLENBQUMsSUFBSSxDQUFDLEFBQUU7O0VBRTNDLEFBQUMsR0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2hDLEFBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFakMsQUFBQyxDQUFDLENBQUMsQ0FBQztDQUNKLEFBQUMsT0FBTyxPQUFPLENBQUM7O0FBRWpCLEFBQUMsQ0FBQyxDQUVEOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOztBQ3RGL0I7QUFDQSxZQUFZLENBQUM7QUFDYixHQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ25ELEdBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsR0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsR0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWpDLElBQU0sYUFBYSxHQUlsQixzQkFBVyxDQUFDLE9BQU8sVUFBVTs7Q0FFN0IsQUFBQyxJQUFJLENBQUMsTUFBTSxHQUFHO0VBQ2QsQUFBQyxJQUFJLEVBQUUsTUFBTTtFQUNiLEFBQUMsS0FBSyxFQUFFLE9BQU87Q0FDaEIsQUFBQyxDQUFDLENBQUM7O0NBRUgsQUFBQztDQUNELEFBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7O0NBRS9CLEFBQUM7Q0FDRCxBQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTs7RUFFakMsQUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRXZDLEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQztDQUNELEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7Q0FDOUMsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWhFLEFBQUMsRUFBQzs7QUFFRix3QkFBQyxtQ0FBVyxHQUFHOztBQUFDOztDQUVmLEFBQUMsT0FBTyxJQUFJLE9BQU8sVUFBQyxDQUFDLE9BQU8sRUFBRSxBQUFHOztFQUVoQyxBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ3ZDLEFBQUMsS0FBSyxDQUFDLGVBQWUsVUFBQyxFQUFFLEFBQUU7O0dBRTFCLEFBQUMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ25DLEFBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztFQUVoQixBQUFDLENBQUMsQ0FBQyxDQUFDOztFQUVKLEFBQUMsS0FBSyxDQUFDLGNBQWMsVUFBQyxFQUFFLEFBQUU7O0dBRXpCLEFBQUMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2xDLEFBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDOztFQUVoQixBQUFDLENBQUMsQ0FBQyxDQUFDOztFQUVKLEFBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUVqQixBQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0Qsd0JBQUMsbUNBQVcsR0FBRzs7Q0FFZCxBQUFDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFakUsQUFBQyxFQUFDOztBQUVGLEFBQUM7QUFDRCx3QkFBQyxxQ0FBWSxHQUFHOztDQUVmLEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Q0FDOUIsQUFBQyxPQUFPLEdBQUcsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzs7QUFFbkMsQUFBQyxFQUFDOztBQUVGLHdCQUFDLCtCQUFTLENBQUMsTUFBTSxFQUFFOztDQUVsQixBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDL0IsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQy9DLEFBQUMsR0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztDQUVuRSxBQUFDO0NBQ0QsQUFBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7O0VBRW5ELEFBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOztFQUV6RSxBQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0VBQzNCLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7O0NBRS9ELEFBQUMsQ0FBQyxNQUFNOztFQUVQLEFBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztDQUVyQixBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLHdCQUFDLCtCQUFTLEdBQUc7O0NBRVosQUFBQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNELEFBQUMsRUFBQzs7QUFFRix3QkFBQyxtQ0FBVyxHQUFHOztDQUVkLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztDQUMvQixBQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdkQsQUFBQyxFQUFDOztBQUVGLHdCQUFDLHlCQUFNLEdBQUc7O0NBRVQsQUFBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTs7RUFFekIsQUFBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQyxpREFBa0IsR0FBRzs7QUFBQzs7Q0FFdEIsQUFBQyxHQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Q0FDM0MsQUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7O0VBRXRCLEFBQUM7RUFDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0VBQy9ELEFBQUM7RUFDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxXQUFFLEdBQUcsU0FBRyxNQUFJLENBQUMsYUFBYSxLQUFFLENBQUMsQ0FBQzs7Q0FFN0YsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQyxpREFBa0IsR0FBRzs7Q0FFckIsQUFBQyxHQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Q0FDM0MsQUFBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7O0VBRXRCLEFBQUM7RUFDRCxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7RUFFbEQsQUFBQyxJQUFJLEdBQUcsRUFBRTs7R0FFVCxBQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7RUFFZixBQUFDLENBQUM7O0NBRUgsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRix3QkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0NBQzNCLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFL0IsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7O0FDbEsvQjtBQUNBLFlBQVksQ0FBQzs7QUFFYixHQUFLLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELEdBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsR0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7O0FBR25ELElBQU0sV0FBVyxHQWlCaEIsb0JBQVcsQ0FBQyxNQUFNLFVBQVUsS0FBSyxpQkFBaUIsT0FBTyxXQUFXOztBQUFDOztDQUVyRSxBQUFDLEdBQUssQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztDQUVoRSxBQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUNwQyxBQUFDLFdBQVcsQ0FBQyxZQUFZLFlBQUcsR0FBRyxBQUFHOztFQUVqQyxBQUFDLE1BQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Q0FFaEIsQUFBQyxDQUFDLENBQUM7Q0FDSCxBQUFDLFdBQVcsQ0FBQyxjQUFjLFlBQUcsR0FBRyxBQUFHOztFQUVuQyxBQUFDLE1BQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Q0FFbEIsQUFBQyxDQUFDLENBQUM7Q0FDSCxBQUFDLFdBQVcsQ0FBQyxhQUFhLGFBQUksR0FBRyxBQUFHOztFQUVuQyxBQUFDLE1BQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLENBQUM7O0NBRUgsQUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0NBQ2hDLEFBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUM7Q0FDdEMsQUFBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztDQUNwQixBQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7Q0FDbkMsQUFBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO0NBQ3BDLEFBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFckQsQUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0NBRWYsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFOztFQUV6QixBQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7O0NBRW5DLEFBQUMsQ0FBQyxNQUFNOztFQUVQLEFBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDOztDQUUxQyxBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7O0VBRXpCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztDQUV2QixBQUFDLENBQUMsTUFBTTs7RUFFUCxBQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7Q0FFeEIsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFOUIsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyw2QkFBUSxHQUFHOztDQUVYLEFBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7O0VBRXpCLEFBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQ2xELEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztDQUV2QixBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztDQUN0QixBQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7O0FBRW5DLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMscUNBQVksR0FBRzs7Q0FFZixBQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7QUFFM0MsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyxtQ0FBVyxHQUFHOztDQUVkLEFBQUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUUxQyxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsMkRBQXVCLENBQUMsUUFBUSxZQUFZOztDQUU1QyxBQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7O0FBRXhDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Q0FDL0IsQUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O0NBRWpCLEFBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUU7O0VBRWhDLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0NBRS9CLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsK0RBQXlCLENBQUMsUUFBUSxZQUFZOztDQUU5QyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxRQUFRLENBQUM7O0FBRXpDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx1Q0FBYSxHQUFHOztDQUVoQixBQUFDLEdBQUssQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO0NBQ3JELEFBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPO0VBQ2xDLFNBQUMsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7R0FFVixBQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRW5DLEFBQUMsQ0FBQztDQUNILEFBQUMsQ0FBQyxDQUFDOztBQUVKLEFBQUMsRUFBQzs7QUFFRixzQkFBQyx5Q0FBYyxHQUFHOztDQUVqQixBQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7Q0FFbEIsQUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDOztDQUVoQyxBQUFDLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFOztFQUVqQyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztDQUVoQyxBQUFDLENBQUM7O0FBRUgsQUFBQyxFQUFDOztBQUVGLHNCQUFDLCtDQUFpQixHQUFHOztDQUVwQixBQUFDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDOztBQUVoQyxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsNkJBQVEsR0FBRzs7Q0FFWCxBQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Q0FFdEMsQUFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRW5ELEFBQUMsRUFBQzs7QUFFRixzQkFBQywrQkFBUyxHQUFHOztDQUVaLEFBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDOztDQUVyQyxBQUFDLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTs7RUFFekMsQUFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7O0NBRXBELEFBQUMsQ0FBQzs7QUFFSCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsNkRBQXdCLENBQUMsYUFBYSxXQUFXOztBQUFDOztDQUVsRCxBQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxXQUFDLEtBQUksQ0FBQyxBQUFHOztFQUUzQixBQUFDO0VBQ0QsQUFBQyxNQUFNLENBQUMsT0FBRyxNQUFJLENBQUMsZUFBZSxJQUFHLElBQUksQ0FBRSxDQUFDLEdBQUcsYUFBYSxDQUFDOztDQUUzRCxBQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVMLEFBQUMsQ0FBQyxDQUVEOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDOztBQ2hPN0I7QUFDQSxZQUFZLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRzs7O0NBR2hCLFNBQVMsRUFBRSxJQUFJOzs7Q0FHZixNQUFNLEVBQUU7O0VBRVAsSUFBSSxFQUFFLDBCQUEwQjs7O0VBR2hDLElBQUksRUFBRSxHQUFHOzs7O0VBSVQsTUFBTSxFQUFFLE1BQU07OztFQUdkLFVBQVUsRUFBRSxHQUFHO0VBQ2Y7OztDQUdELE9BQU8sRUFBRTtFQUNSLE1BQU0sRUFBRSwrQkFBK0I7RUFDdkMsT0FBTyxFQUFFLG9NQUFvTTtFQUM3TSxLQUFLLEVBQUUsVUFBVTtFQUNqQixJQUFJLEVBQUUsVUFBVTtFQUNoQixJQUFJLEVBQUUscUJBQXFCO0VBQzNCLElBQUksRUFBRSx5SEFBeUg7RUFDL0gsS0FBSyxFQUFFLFVBQVU7RUFDakI7Ozs7Ozs7Q0FPRCxRQUFRLEVBQUU7RUFDVCxNQUFNLEVBQUUsbURBQW1EO0VBQzNELE9BQU8sRUFBRSx5RUFBeUU7RUFDbEYsV0FBVyxFQUFFLHVQQUF1UDtFQUNwUSxLQUFLLEVBQUUscUdBQXFHO0VBQzVHLElBQUksRUFBRSxpR0FBaUc7RUFDdkcsSUFBSSxFQUFFLDBJQUEwSTtFQUNoSixLQUFLLEVBQUUsNEdBQTRHO0VBQ25IOzs7OztDQUtELE1BQU0sRUFBRSw0TUFBNE07Ozs7Q0FJcE4sU0FBUyxFQUFFLCtEQUErRDs7O0NBRzFFLGlCQUFpQixFQUFFLEVBQUU7OztDQUdyQixVQUFVLEVBQUUsbUVBQW1FOzs7Q0FHL0UsT0FBTyxFQUFFOztFQUVSLE9BQU8sRUFBRSwrQkFBK0I7RUFDeEMsYUFBYSxFQUFFLHdDQUF3QztFQUN2RCxjQUFjLEVBQUUsNkNBQTZDO0VBQzdEOzs7Q0FHRCxNQUFNLEVBQUUsT0FBTzs7Ozs7OztDQU9mLFFBQVEsRUFBRSxRQUFROzs7Ozs7OztDQVFsQixLQUFLLEVBQUUsT0FBTzs7Ozs7Ozs7Ozs7Q0FXZCxPQUFPLENBQUM7RUFDUCxLQUFLLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0VBQzlCLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7RUFDL0I7Q0FDRCxDQUFDOztBQ3hHRjtBQUNBLFlBQVksQ0FBQzs7QUFFYixHQUFLLENBQUMsT0FBTyxXQUFXLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUMzRCxHQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFN0MsTUFBTSxDQUFDLE9BQU8sR0FBRztVQUNoQixPQUFPO2NBQ1AsV0FBVztDQUNYLENBQUM7Ozs7Ozs7OztBQ1RGO0FBQ0EsWUFBWSxDQUFDOztBQUViLEdBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUvQixJQUFNLEtBQUssR0FLVixjQUFXLENBQUMsT0FBTyxVQUFVLFVBQVUsVUFBVTs7Q0FFakQsQUFBQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztDQUM5QixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0NBRXpCLEFBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOztFQUVsQixBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7Q0FFakIsQUFBQyxDQUFDOztDQUVGLEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztDQUV4QixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoRyxBQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDOztDQUV2RCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFL0MsQUFBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWQsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJCQUFPLEdBQUc7O0NBRVYsQUFBQztDQUNELEFBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQ3JGLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0NBRXpCLEFBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFOztFQUU3QyxBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7O0NBRXBELEFBQUMsQ0FBQztDQUNGLEFBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0NBRXJCLEFBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRXRCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxxQkFBSSxHQUFHOztDQUVQLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0VBRW5CLEFBQUMsT0FBTzs7Q0FFVCxBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFOztFQUVwQixBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7O0VBRWpDLEFBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOztFQUVoRCxBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7O0dBRTlCLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7RUFFN0IsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx1QkFBSyxHQUFHOztDQUVSLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7O0VBRW5CLEFBQUMsT0FBTzs7Q0FFVCxBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTs7RUFFbkIsQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztFQUVyQyxBQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7O0dBRS9CLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7RUFFOUIsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7O0FBRTNHLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxpREFBa0IsR0FBRzs7Q0FFckIsQUFBQyxHQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwRCxBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDOztDQUVwQixBQUFDO0NBQ0QsQUFBQyxTQUFTLENBQUMsT0FBTyxVQUFDLENBQUMsR0FBRyxFQUFFLEFBQUc7O0VBRTNCLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFNLEdBQUcsQ0FBRSxDQUFDLENBQUM7O0NBRTVCLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRUosQUFBQyxPQUFPLE9BQU8sQ0FBQzs7QUFFakIsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJDQUFlLEdBQUc7O0NBRWxCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0NBQzNCLEFBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsUUFBUSxHQUFHLFVBQVUsQ0FBQzs7Q0FFckcsQUFBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7O0VBRW5CLEFBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQzs7Q0FFN0IsQUFBQyxDQUFDOztDQUVGLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRztFQUNoQixBQUFDLFNBQU0sYUFBYSxDQUFFO0VBQ3RCLEFBQUMsZ0JBQWdCO0VBQ2pCLEFBQUMsZ0JBQVksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUN6QixDQUFDLENBQUM7O0NBRUgsQUFBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O0VBRWpCLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7O0NBRXhELEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUVoRCxBQUFDO0NBQ0QsQUFBQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7RUFFOUIsQUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztDQUV6QyxBQUFDLENBQUM7O0NBRUYsQUFBQyxPQUFPLE9BQU8sQ0FBQzs7QUFFakIsQUFBQyxFQUFDOztBQUVGLGdCQUFDLG1EQUFtQixHQUFHOztDQUV0QixBQUFDLEdBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0NBQ3pCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztDQUUzQixBQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sVUFBQyxDQUFDLElBQUksRUFBRSxBQUFHOztFQUU3QyxBQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBRSxDQUFDLElBQUksRUFBRSxBQUFHOztHQUUzRSxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQyxBQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDOztFQUVuRSxBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVMLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRUosQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDOztDQUV4QyxBQUFDO0NBQ0QsQUFBQyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLFdBQUUsQ0FBQyxJQUFJLEVBQUUsQUFBRzs7RUFFM0UsQUFBQyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFSixBQUFDO0NBQ0QsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3hDLEFBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTs7RUFFYixBQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzs7Q0FFOUIsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxXQUFFLENBQUMsS0FBSyxFQUFFLEFBQUc7O0VBRWpELEFBQUMsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7O0NBRTdCLEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQUFBQyxFQUFDOztBQUVGLGdCQUFDLHFDQUFZLENBQUMsTUFBTSxFQUFFOztDQUVyQixBQUFDLEdBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUMzQixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDM0MsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOztDQUVqRyxBQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDOztDQUV4QixBQUFDLEdBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7O0NBRTNCLEFBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTs7RUFFcEMsQUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQzs7Q0FFcEMsQUFBQyxDQUFDOztDQUVGLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7O0VBRXRCLEFBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDLE1BQU07O0VBRVAsQUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0NBRXpDLEFBQUMsQ0FBQzs7O0NBR0YsQUFBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFWixBQUFDLEVBQUM7O0FBRUYsZ0JBQUMsMkNBQWUsQ0FBQyxRQUFRLFlBQVk7O0NBRXBDLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUNyRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0NBQzlCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUUxRSxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUNBQWMsQ0FBQyxRQUFRLFlBQVk7O0NBRW5DLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuRixBQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0NBQzdCLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztBQUV6RSxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELEFBQUM7QUFDRCxnQkFBQyxtREFBbUIsQ0FBQyxPQUFPLEVBQUU7O0NBRTdCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNqRCxBQUFDLEdBQUssQ0FBQyxRQUFRLEdBQUcsdUJBQXFCLElBQUksQUFBRSxDQUFDO0NBQzlDLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUU3QyxBQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEQsQUFBQyxJQUFJLE9BQU8sRUFBRTs7RUFFYixBQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFJLFFBQVEsQ0FBRSxDQUFDLENBQUM7O0NBRXJELEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxPQUFPLENBQUM7O0FBRWpCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyx5Q0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFOztDQUV0QyxBQUFDLEdBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0NBQ3hCLEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0NBQzdCLEFBQUMsR0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0NBQy9CLEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDOztDQUVyQyxBQUFDO0NBQ0QsQUFBQyxJQUFJLEtBQUssRUFBRTs7RUFFWCxBQUFDO0VBQ0QsQUFBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUMzRSxBQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDbkQsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLGdCQUFZLENBQUMsR0FBRztHQUNyQyxBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtHQUN2QixBQUFDLHlCQUFxQixLQUFLLENBQUMsVUFBVSxFQUFFO0VBQ3pDLEFBQUMsQ0FBQyxDQUFDO0VBQ0gsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLGtCQUFhLE1BQU0seUJBQW9CLE1BQU0sdUJBQW1CLENBQUMsR0FBRztHQUN6RixBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtFQUN4QixBQUFDLENBQUMsQ0FBQzs7RUFFSCxBQUFDLElBQUksTUFBTSxFQUFFOztHQUVaLEFBQUM7R0FDRCxBQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQy9FLEFBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0dBQy9ELEFBQUMsV0FBVyxDQUFDLENBQUcsTUFBTSxjQUFVLENBQUMsR0FBRztJQUNuQyxBQUFDLGNBQVUsTUFBTSxDQUFDLElBQUksRUFBRTtJQUN4QixBQUFDLHFCQUFpQixNQUFNLENBQUMsTUFBTSxFQUFFO0lBQ2pDLEFBQUMseUJBQXFCLE1BQU0sQ0FBQyxVQUFVLEVBQUU7R0FDMUMsQUFBQyxDQUFDLENBQUM7O0dBRUgsQUFBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssYUFBYSxFQUFFOztJQUV6QyxBQUFDLFdBQVcsQ0FBQyxDQUFHLE1BQU0sd0JBQW1CLE1BQU0sb0JBQWdCLENBQUMsR0FBRztLQUNsRSxBQUFDLHlCQUFxQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtJQUMvRCxBQUFDLENBQUMsQ0FBQzs7R0FFSixBQUFDLENBQUM7O0dBRUYsQUFBQyxJQUFJLFNBQVMsRUFBRTs7R0FFaEIsQUFBQztJQUNBLEFBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0YsQUFBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7SUFDeEUsQUFBQyxXQUFXLENBQUMsQ0FBRyxNQUFNLHdDQUFvQyxDQUFDLEdBQUc7S0FDN0QsQUFBQyxjQUFVLFNBQVMsQ0FBQyxJQUFJLEVBQUU7S0FDM0IsQUFBQyxxQkFBaUIsU0FBUyxDQUFDLE1BQU0sRUFBRTtLQUNwQyxBQUFDLHlCQUFxQixTQUFTLENBQUMsVUFBVSxFQUFFO0lBQzdDLEFBQUMsQ0FBQyxDQUFDOztHQUVKLEFBQUMsQ0FBQyxNQUFNOztHQUVSLEFBQUM7SUFDQSxBQUFDLFdBQVcsQ0FBQyxDQUFHLE1BQU0sd0NBQW9DLENBQUMsR0FBRztLQUM3RCxBQUFDLGNBQVUsS0FBSyxDQUFDLElBQUksRUFBRTtJQUN4QixBQUFDLENBQUMsQ0FBQzs7R0FFSixBQUFDLENBQUM7O0VBRUgsQUFBQyxDQUFDOztDQUVILEFBQUMsQ0FBQzs7Q0FFRixBQUFDO0NBQ0QsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQy9DLEFBQUM7Q0FDRCxBQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ2xDLEFBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNwQixBQUFDLEtBQUssR0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLEVBQUU7O0VBRWhDLEFBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBRyxJQUFJLFVBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsT0FBRyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7O0NBRWpGLEFBQUMsQ0FBQzs7QUFFSCxBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7QUMxV3ZCO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sSUFBSTs7S0FFRixxQ0FBWSxDQUFDLEdBQUcsVUFBVTs7Q0FFakMsQUFBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXBFLEFBQUMsRUFBQzs7QUFFRixLQUFRLDZCQUFRLENBQUMsT0FBTyxVQUFVLFFBQVEsVUFBVTs7Q0FFbkQsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNmLEFBQUM7Q0FDRCxBQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWTtFQUM3QyxBQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXBGLEFBQUMsRUFBQzs7QUFFRixLQUFRLDZCQUFRLENBQUMsT0FBTyxVQUFVLFNBQVMsVUFBVTs7Q0FFcEQsQUFBQyxPQUFPLENBQUMsU0FBUyxJQUFJLE1BQUksU0FBUyxBQUFFLENBQUM7O0FBRXZDLEFBQUMsRUFBQzs7QUFFRixLQUFRLG1DQUFXLENBQUMsT0FBTyxVQUFVLFNBQVMsVUFBVTs7Q0FFdkQsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUMsU0FBSyxDQUFDLENBQUM7Q0FDbkUsQUFBQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFM0QsQUFBQyxFQUFDOztBQUVGLEtBQVEsK0NBQWlCLENBQUMsR0FBRyxVQUFVLFFBQVEsWUFBWTs7Q0FFMUQsQUFBQyxHQUFLLENBQUMsTUFBTSxHQUFHLDJCQUEyQixDQUFDO0NBQzVDLEFBQUMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXOztFQUV0QyxBQUFDLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7Q0FFdEMsQUFBQyxDQUFDLENBQUMsQ0FBQzs7QUFFTCxBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELEtBQVEscUJBQUksQ0FBQyxHQUFHLFVBQVU7O0NBRXpCLEFBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO0VBQ1osQUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztDQUNkLEFBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7RUFFdEIsQUFBQyxPQUFPLElBQUksQ0FBQzs7Q0FFZCxBQUFDLENBQUM7Q0FDRixBQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztFQUU1QyxBQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pCLEFBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ25DLEFBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzs7Q0FFWixBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sSUFBSSxDQUFDOztBQUVkLEFBQUMsRUFBQzs7QUFFRixLQUFRLHFDQUFZLENBQUMsR0FBRyxVQUFVOztDQUVqQyxBQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTs7RUFFcEIsQUFBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFdEIsQUFBQyxDQUFDO0NBQ0YsQUFBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOztFQUV0QixBQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFNUQsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLEdBQUcsQ0FBQzs7QUFFYixBQUFDLEVBQUM7O0FBRUYsQUFBQztBQUNELEtBQVEsbUNBQVcsQ0FBQyxHQUFHLFVBQVU7O0NBRWhDLEFBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDOUIsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxQyxBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUMsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDeEQsQUFBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRXhDLEFBQUMsRUFBQzs7QUFFRixBQUFDO0FBQ0QsS0FBUSxxQ0FBWSxDQUFDLEdBQUcsVUFBVTs7Q0FFakMsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUNoRCxBQUFDLEdBQUcsR0FBRyxFQUFFO0VBQ1QsQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRztFQUN0QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRztFQUM5QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDN0IsQUFBQyxHQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdLLEFBQUMsT0FBTyxPQUFJLFNBQVMsQ0FBRSxDQUFDOztBQUV6QixBQUFDLEVBQUM7O0FBRUYsS0FBUSx5Q0FBYyxDQUFDLEdBQUcsVUFBVTs7Q0FFbkMsQUFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM5QixBQUFDO0NBQ0QsQUFBQyxJQUFJLEdBQUcsS0FBSyxRQUFRLEVBQUU7O0VBRXRCLEFBQUMsT0FBTyxNQUFNLENBQUM7O0NBRWhCLEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVoQyxBQUFDLEVBQUM7O0FBRUYsS0FBUSw2QkFBUSxDQUFDLFNBQVMsVUFBVTs7Q0FFbkMsQUFBQyxPQUFPLGdFQUFnRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFMUYsQUFBQyxFQUFDOztBQUVGLEtBQVEsdUNBQWEsQ0FBQyxHQUFHLFVBQVU7O0NBRWxDLEFBQUM7Q0FDRCxBQUFDLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUM7O0FBRS9FLEFBQUMsRUFBQzs7QUFFRixLQUFRLHFEQUFvQixDQUFDLEtBQUssU0FBUyxNQUFNLFVBQVU7O0NBRTFELEFBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztFQUU5QyxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RCLEFBQUM7RUFDRCxBQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDaEQsQUFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLENBQUMsRUFBRTs7R0FFMUQsQUFBQyxPQUFPLElBQUksQ0FBQzs7RUFFZCxBQUFDLENBQUM7O0NBRUgsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLEtBQUssQ0FBQzs7QUFFZixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjFcIlxufSIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY2xhc3MgQ29va2llTWFuYWdlciB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIGdldCB0aGUgY29va2llIHZhbHVlXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBnZXRDb29raWUobmFtZSAgICAgICAgKSB7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCB2ID0gZG9jdW1lbnQuY29va2llLm1hdGNoKGAoXnw7KSA/JHtuYW1lfT0oW147XSopKDt8JClgKTtcclxuXHRcdHJldHVybiB2ID8gdlsyXSA6IG51bGw7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGhhc0Nvb2tpZShuYW1lICAgICAgICApIHtcclxuXHJcblx0XHRyZXR1cm4gQ29va2llTWFuYWdlci5nZXRDb29raWUobmFtZSkgIT09IG51bGw7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBjb29raWUgdmFsdWVcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZGF5cyBUaGUgbnVtYmVycyBvZiBkYXlzIHRvIGV4cGlyZSB0aGUgY29va2llLlxyXG5cdCAqL1xyXG5cdHN0YXRpYyBzZXRDb29raWUobmFtZSAgICAgICAgLCB2YWx1ZSAgICAgICAgLCBkYXlzICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkge1xyXG5cclxuXHRcdGNvbnN0IGQgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0ZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgMjQgKiA2MCAqIDYwICogMTAwMCAqIGRheXMpO1xyXG5cdFx0bGV0IGNvb2tpZSA9IGAke25hbWV9PSR7dmFsdWV9O2V4cGlyZXM9JHtkLnRvR01UU3RyaW5nKCl9YDtcclxuXHRcdGlmIChwYXRoKSB7XHJcblxyXG5cdFx0XHRjb29raWUgKz0gYDtwYXRoPSR7cGF0aH1gO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRjb29raWUgKz0gXCI7cGF0aD0vXCI7XHJcblxyXG5cdFx0fVxyXG5cdFx0aWYgKGRvbWFpbikge1xyXG5cclxuXHRcdFx0Y29va2llICs9IGA7ZG9tYWluPSR7ZG9tYWlufWA7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZSB0aGUgY29va2llc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICovXHJcblx0c3RhdGljIGRlbGV0ZUNvb2tpZShuYW1lICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuc2V0Q29va2llKG5hbWUsIFwiXCIsIC0xLCBkb21haW4sIHBhdGgpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhbGwgY29va2llc1xyXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9XHJcblx0ICovXHJcblx0c3RhdGljIGdldEFsbENvb2tpZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgY29va2llcyA9IHt9O1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKChpdGVtKT0+e1xyXG5cclxuXHRcdFx0Y29uc3QgY29va2llID0gaXRlbS5zcGxpdChcIj1cIik7XHJcblx0XHRcdGNvb2tpZXNbY29va2llWzBdXSA9IGNvb2tpZVsxXTtcclxuXHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBjb29raWVzO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZU1hbmFnZXI7XHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHRPcHRpb25zXCIpO1xyXG5jb25zdCBjb29raWVNYW5hZ2VyID0gcmVxdWlyZShcIi4vY29va2llTWFuYWdlclwiKTtcclxuY29uc3QgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XHJcbmNvbnN0IFBvcHVwID0gcmVxdWlyZShcIi4vcG9wdXBcIik7XHJcblxyXG5jbGFzcyBDb29raWVjb25zZW50IHtcclxuXHJcblx0ICAgICAgICAgICAgICBcclxuXHJcblx0Y29uc3RydWN0b3Iob3B0aW9ucyAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5zdGF0dXMgPSB7XHJcblx0XHRcdGRlbnk6IFwiZGVueVwiLFxyXG5cdFx0XHRhbGxvdzogXCJhbGxvd1wiXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXHJcblx0XHR0aGlzLm9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcclxuXHJcblx0XHQvLyBtZXJnZSBpbiB1c2VyIG9wdGlvbnNcclxuXHRcdGlmICh1dGlsLmlzUGxhaW5PYmplY3Qob3B0aW9ucykpIHtcclxuXHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXdhcm5pbmctY29tbWVudHNcclxuXHRcdC8vIFRPRE86IG5hdmlnYXRvciBhbmQgZG9jdW1lbnQgc2hvdWxkbid0IGJlIHVzZWQgaGVyZVxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHR0aGlzLm9wdGlvbnMudXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuXHRcdHRoaXMub3B0aW9ucy5pc01vYmlsZSA9IHV0aWwuaXNNb2JpbGUodGhpcy5vcHRpb25zLnVzZXJBZ2VudCk7XHJcblxyXG5cdH1cclxuXHJcblx0Y3JlYXRlUG9wdXAoKSB7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcblxyXG5cdFx0XHRjb25zdCBwb3B1cCA9IG5ldyBQb3B1cCh0aGlzLm9wdGlvbnMpO1xyXG5cdFx0XHRwb3B1cC5zZXRBbGxvd0hhbmRsZXIoKCk9PntcclxuXHJcblx0XHRcdFx0dGhpcy5zZXRTdGF0dXModGhpcy5zdGF0dXMuYWxsb3cpO1xyXG5cdFx0XHRcdHBvcHVwLmNsb3NlKCk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHBvcHVwLnNldERlbnlIYW5kbGVyKCgpPT57XHJcblxyXG5cdFx0XHRcdHRoaXMuc2V0U3RhdHVzKHRoaXMuc3RhdHVzLmRlbnkpO1xyXG5cdFx0XHRcdHBvcHVwLmNsb3NlKCk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJlc29sdmUocG9wdXApO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIHJldHVybnMgdHJ1ZSBpZiB0aGUgY29va2llIGhhcyBhIHZhbGlkIHZhbHVlXHJcblx0aGFzQW5zd2VyZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHRoaXMuZ2V0U3RhdHVzKCkpID49IDA7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gcmV0dXJucyB0cnVlIGlmIHRoZSBjb29raWUgaW5kaWNhdGVzIHRoYXQgY29uc2VudCBoYXMgYmVlbiBnaXZlblxyXG5cdGhhc0NvbnNlbnRlZCgpIHtcclxuXHJcblx0XHRjb25zdCB2YWwgPSB0aGlzLmdldFN0YXR1cygpO1xyXG5cdFx0cmV0dXJuIHZhbCA9PT0gdGhpcy5zdGF0dXMuYWxsb3c7XHJcblxyXG5cdH1cclxuXHJcblx0c2V0U3RhdHVzKHN0YXR1cykge1xyXG5cclxuXHRcdGNvbnN0IGMgPSB0aGlzLm9wdGlvbnMuY29va2llO1xyXG5cdFx0Y29uc3QgdmFsdWUgPSBjb29raWVNYW5hZ2VyLmdldENvb2tpZShjLm5hbWUpO1xyXG5cdFx0Y29uc3QgY2hvc2VuQmVmb3JlID0gT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2YodmFsdWUpID49IDA7XHJcblxyXG5cdFx0Ly8gaWYgYHN0YXR1c2AgaXMgdmFsaWRcclxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZihzdGF0dXMpID49IDApIHtcclxuXHJcblx0XHRcdGNvb2tpZU1hbmFnZXIuc2V0Q29va2llKGMubmFtZSwgc3RhdHVzLCBjLmV4cGlyeURheXMsIGMuZG9tYWluLCBjLnBhdGgpO1xyXG5cclxuXHRcdFx0dGhpcy5jcmVhdGVDb25maWdCdXR0b24oKTtcclxuXHRcdFx0dGhpcy5vcHRpb25zLm9uU3RhdHVzQ2hhbmdlLmNhbGwodGhpcywgc3RhdHVzLCBjaG9zZW5CZWZvcmUpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHR0aGlzLmNsZWFyU3RhdHVzKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGdldFN0YXR1cygpIHtcclxuXHJcblx0XHRyZXR1cm4gY29va2llTWFuYWdlci5nZXRDb29raWUodGhpcy5vcHRpb25zLmNvb2tpZS5uYW1lKTtcclxuXHJcblx0fVxyXG5cclxuXHRjbGVhclN0YXR1cygpIHtcclxuXHJcblx0XHRjb25zdCBjID0gdGhpcy5vcHRpb25zLmNvb2tpZTtcclxuXHRcdGNvb2tpZU1hbmFnZXIuZGVsZXRlQ29va2llKGMubmFtZSwgYy5kb21haW4sIGMucGF0aCk7XHJcblxyXG5cdH1cclxuXHJcblx0b25Jbml0KCkge1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0NvbnNlbnRlZCgpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNyZWF0ZUNvbmZpZ0J1dHRvbigpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRjcmVhdGVDb25maWdCdXR0b24oKSB7XHJcblxyXG5cdFx0Y29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuY29uZmlnQnRuU2VsZWN0b3I7XHJcblx0XHRpZiAoaWQudHJpbSgpICE9PSBcIlwiKSB7XHJcblxyXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gdGhpcy5vcHRpb25zLmNvbmZpZ0J0bjtcclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtY29uZmlnXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLm9uUmVzZXRDb25maWcoKSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHJlbW92ZUNvbmZpZ0J1dHRvbigpIHtcclxuXHJcblx0XHRjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5jb25maWdCdG5TZWxlY3RvcjtcclxuXHRcdGlmIChpZC50cmltKCkgIT09IFwiXCIpIHtcclxuXHJcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0XHRjb25zdCBidG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWNvbmZpZ1wiKTtcclxuXHJcblx0XHRcdGlmIChidG4pIHtcclxuXHJcblx0XHRcdFx0YnRuLnJlbW92ZSgpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRvblJlc2V0Q29uZmlnKCkge1xyXG5cclxuXHRcdHRoaXMucmVtb3ZlQ29uZmlnQnV0dG9uKCk7XHJcblx0XHR0aGlzLm9wdGlvbnMub25SZXNldENvbmZpZygpO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZWNvbnNlbnQ7XHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgQ29va2llQ29uc2VudCA9IHJlcXVpcmUoXCIuL2Nvb2tpZWNvbnNlbnRcIik7XHJcbmNvbnN0IENvb2tpZU1hbmFnZXIgPSByZXF1aXJlKFwiLi9jb29raWVNYW5hZ2VyXCIpO1xyXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHRPcHRpb25zXCIpO1xyXG5cclxuXHJcbmNsYXNzIENvb2tpZXNJQ0dDIHtcclxuXHJcblx0ICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcblx0LyoqXHJcblx0ICogQSBgQ29va2llc0lDR0NgIG9iamVjdCByZXByZXNlbnRzIHRoZSBvYmplY3QgdGhhdCBtYW5hZ2VzIHRoZSBjb29raWUgY29uc2VudCB1bmRlciB0aGUgRXVyb3BlYW4gR0RQUiBsYXdcclxuXHQgKiBkaXNhYmxpbmcgR29vZ2xlIEFuYWx5dGljcyBjb29raWVzIGlmIG5lZWRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIHRoYXQgc2V0cyB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gZ2FJZHMgQW4gYXJyYXkgd2l0aCB0aGUgR29vZ2xlIEFuYWx5dGljcyBpZHNcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25hbCBvcHRpb25zXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiB2YXIgY29va2llcyA9IG5ldyBDb29raWVzSUNHQyhcInd3dy5pbnN0YW1hcHMuY2F0XCIsIFtcIlVBLTEyMzQ1Njc4LTFcIl0sIHtwb3NpdGlvbjogXCJ0b3BcIiwgY29udGVudCB7IG1lc3NhZ2U6IFwiVm9scyBjb29raWVzP1wiIH19KTtcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihkb21haW4gICAgICAgICwgZ2FJZHMgICAgICAgICAgICAgICAsIG9wdGlvbnMgICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCBtYWluT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcblx0XHRtYWluT3B0aW9ucy5jb29raWUuZG9tYWluID0gZG9tYWluO1xyXG5cdFx0bWFpbk9wdGlvbnMub25Jbml0aWFsaXNlID0gKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHR9O1xyXG5cdFx0bWFpbk9wdGlvbnMub25TdGF0dXNDaGFuZ2UgPSAoKSA9PiB7XHJcblxyXG5cdFx0XHR0aGlzLm9uQ2hhbmdlKCk7XHJcblxyXG5cdFx0fTtcclxuXHRcdG1haW5PcHRpb25zLm9uUmVzZXRDb25maWcgPSAgKCkgPT4ge1xyXG5cclxuXHRcdFx0dGhpcy5vblJlc2V0Q29uZmlnKCk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhRGlzYWJsZVByZWZpeCA9IFwiZ2EtZGlzYWJsZS1cIjtcclxuXHRcdHRoaXMuZ2FJZHMgPSBnYUlkcztcclxuXHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQgPSBuZXcgQ29va2llQ29uc2VudChtYWluT3B0aW9ucyk7XHJcblxyXG5cdFx0dGhpcy5vbkluaXQoKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuaGFzQW5zd2VyZWQoKSkge1xyXG5cclxuXHRcdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llQ29uc2VudC5jcmVhdGVDb25maWdCdXR0b24oKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25zZW50IGhhcyBiZWVuIGluaXRpYWxpemVkLlxyXG5cdCAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIGNvb2tpZXMgZGVwZW5kaW5nIG9uIGlmIHRoZSB1c2VyIGhhcyBjb25zZW50ZWQgb3Igbm90XHJcblx0ICovXHJcblx0b25Jbml0KCkge1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0NvbnNlbnRlZCgpKSB7XHJcblxyXG5cdFx0XHR0aGlzLmVuYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0dGhpcy5kaXNhYmxlQ29va2llcygpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQub25Jbml0KCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25zZW50IHN0YXR1cyBoYXMgY2hhbmdlZC5cclxuXHQgKiBFbmFibGVzIHRoZSBjb29raWVzIGlmIG5lZWRlZFxyXG5cdCAqL1xyXG5cdG9uQ2hhbmdlKCkge1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0NvbnNlbnRlZCgpKSB7XHJcblxyXG5cdFx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwidHJ1ZVwiLCAzNjUpO1xyXG5cdFx0XHR0aGlzLmVuYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25maWcgaGFzIGJlZW4gcmVzZXQuXHJcblx0ICogRGlzYWJsZXMgdGhlIGNvb2tpZXNcclxuXHQgKi9cclxuXHRvblJlc2V0Q29uZmlnKCkge1xyXG5cclxuXHRcdHRoaXMuZGVsZXRlQ29va2llcygpO1xyXG5cdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZVBvcHVwKCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBjb25zZW50ZWRcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRoYXNDb25zZW50ZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNDb25zZW50ZWQoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIHVzZXIgaGFzIGFuc3dlcmVkXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0aGFzQW5zd2VyZWQoKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNBbnN3ZXJlZCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvb2tpZXNFbmFibGVIYW5kbGVyKGNhbGxiYWNrICAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyID0gY2FsbGJhY2s7XHJcblxyXG5cdH1cclxuXHJcblx0ZW5hYmxlQ29va2llcygpIHtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gdHJ1ZTtcclxuXHRcdHRoaXMuZW5hYmxlR0EoKTtcclxuXHJcblx0XHRpZiAodGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIpIHtcclxuXHJcblx0XHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHNldENvb2tpZXNEaXNhYmxlZEhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyID0gY2FsbGJhY2s7XHJcblxyXG5cdH1cclxuXHJcblx0ZGVsZXRlQ29va2llcygpIHtcclxuXHJcblx0XHRjb25zdCBhY3RpdmVDb29raWVzID0gQ29va2llTWFuYWdlci5nZXRBbGxDb29raWVzKCk7XHJcblx0XHRPYmplY3Qua2V5cyhhY3RpdmVDb29raWVzKS5mb3JFYWNoKFxyXG5cdFx0XHQoaXRlbSkgPT4ge1xyXG5cclxuXHRcdFx0XHRDb29raWVNYW5hZ2VyLmRlbGV0ZUNvb2tpZShpdGVtKTtcclxuXHJcblx0XHRcdH1cclxuXHRcdCk7XHJcblxyXG5cdH1cclxuXHJcblx0ZGlzYWJsZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0dGhpcy5kaXNhYmxlR0EoKTtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlcikge1xyXG5cclxuXHRcdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyKCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGFyZUNvb2tpZXNFbmFibGVkKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmFyZUNvb2tpZXNFbmFibGVkO1xyXG5cclxuXHR9XHJcblxyXG5cdGVuYWJsZUdBKCkge1xyXG5cclxuXHRcdHRoaXMuY2hhbmdlR0FTdGF0dXNUb0Rpc2FibGVkKGZhbHNlKTtcclxuXHJcblx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwidHJ1ZVwiLCAzNjUpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpc2FibGVHQSgpIHtcclxuXHJcblx0XHR0aGlzLmNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZCh0cnVlKTtcclxuXHJcblx0XHRpZiAoQ29va2llTWFuYWdlci5oYXNDb29raWUoXCJnYUVuYWJsZVwiKSkge1xyXG5cclxuXHRcdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcImZhbHNlXCIsIDM2NSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZChzaG91bGREaXNhYmxlICAgICAgICAgKSB7XHJcblxyXG5cdFx0dGhpcy5nYUlkcy5mb3JFYWNoKGdhSWQgPT4ge1xyXG5cclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRcdHdpbmRvd1tgJHt0aGlzLmdhRGlzYWJsZVByZWZpeH0ke2dhSWR9YF0gPSBzaG91bGREaXNhYmxlO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZXNJQ0dDO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuXHQvLyBvcHRpb25hbCAoZXhwZWN0aW5nIGEgSFRNTCBlbGVtZW50KSBpZiBwYXNzZWQsIHRoZSBwb3B1cCBpcyBhcHBlbmRlZCB0byB0aGlzIGVsZW1lbnQuIGRlZmF1bHQgaXMgYGRvY3VtZW50LmJvZHlgXHJcblx0Y29udGFpbmVyOiBudWxsLFxyXG5cclxuXHQvLyBkZWZhdWx0cyBjb29raWUgb3B0aW9ucyAtIGl0IGlzIFJFQ09NTUVOREVEIHRvIHNldCB0aGVzZSB2YWx1ZXMgdG8gY29ycmVzcG9uZCB3aXRoIHlvdXIgc2VydmVyXHJcblx0Y29va2llOiB7XHJcblx0XHQvLyBUaGlzIGlzIHRoZSBuYW1lIG9mIHRoaXMgY29va2llIC0geW91IGNhbiBpZ25vcmUgdGhpc1xyXG5cdFx0bmFtZTogXCJjb29raWVjb25zZW50SUNHQ19zdGF0dXNcIixcclxuXHJcblx0XHQvLyBUaGlzIGlzIHRoZSB1cmwgcGF0aCB0aGF0IHRoZSBjb29raWUgJ25hbWUnIGJlbG9uZ3MgdG8uIFRoZSBjb29raWUgY2FuIG9ubHkgYmUgcmVhZCBhdCB0aGlzIGxvY2F0aW9uXHJcblx0XHRwYXRoOiBcIi9cIixcclxuXHJcblx0XHQvLyBUaGlzIGlzIHRoZSBkb21haW4gdGhhdCB0aGUgY29va2llICduYW1lJyBiZWxvbmdzIHRvLiBUaGUgY29va2llIGNhbiBvbmx5IGJlIHJlYWQgb24gdGhpcyBkb21haW4uXHJcblx0XHQvLyAgLSBHdWlkZSB0byBjb29raWUgZG9tYWlucyAtIGh0dHA6Ly9lcmlrLmlvL2Jsb2cvMjAxNC8wMy8wNC9kZWZpbml0aXZlLWd1aWRlLXRvLWNvb2tpZS1kb21haW5zL1xyXG5cdFx0ZG9tYWluOiBcImZpbGVcIixcclxuXHJcblx0XHQvLyBUaGUgY29va2llcyBleHBpcmUgZGF0ZSwgc3BlY2lmaWVkIGluIGRheXMgKHNwZWNpZnkgLTEgZm9yIG5vIGV4cGlyeSlcclxuXHRcdGV4cGlyeURheXM6IDM2NSxcclxuXHR9LFxyXG5cclxuXHQvLyBlYWNoIGl0ZW0gZGVmaW5lcyB0aGUgaW5uZXIgdGV4dCBmb3IgdGhlIGVsZW1lbnQgdGhhdCBpdCByZWZlcmVuY2VzXHJcblx0Y29udGVudDoge1xyXG5cdFx0aGVhZGVyOiBcIkNvb2tpZXMgdXRpbGl0emFkZXMgYSBsYSB3ZWIhXCIsXHJcblx0XHRtZXNzYWdlOiBcIlV0aWxpdHplbSBnYWxldGVzIHBlciBkaXN0aW5naXItdm9zIGQnYWx0cmVzIHVzdWFyaXMgZW4gZWxzIG5vc3RyZXMgd2VicywgcGVyIG1pbGxvcmFyIGxhIGluZm9ybWFjacOzIGkgZWxzIHNlcnZlaXMgcXVlIHVzIG9mZXJpbSwgaSBwZXIgZmFjaWxpdGFyLXZvcyBsJ2FjY8Opcy4gUGVyIGEgbcOpcyBpbmZvcm1hY2nDsywgY29uc3VsdGV1IGxhIFwiLFxyXG5cdFx0YWxsb3c6IFwiQWNjZXB0YXJcIixcclxuXHRcdGRlbnk6IFwiUmVidXRqYXJcIixcclxuXHRcdGxpbms6IFwicG9sw610aWNhIGRlIGdhbGV0ZXNcIixcclxuXHRcdGhyZWY6IFwiaHR0cDovL3d3dy5pY2djLmNhdC9MLUlDR0MvU29icmUtbC1JQ0dDL1BvbGl0aXF1ZXMvUG9saXRpY2EtZGUtcHJvdGVjY2lvLWRlLWRhZGVzLXBlcnNvbmFscy9Qb2xpdGljYS1kZS1nYWxldGVzLWNvb2tpZXNcIixcclxuXHRcdGNsb3NlOiBcIiYjeDI3NGM7XCIsXHJcblx0fSxcclxuXHJcblx0Ly8gVGhpcyBpcyB0aGUgSFRNTCBmb3IgdGhlIGVsZW1lbnRzIGFib3ZlLiBUaGUgc3RyaW5nIHt7aGVhZGVyfX0gd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBlcXVpdmFsZW50IHRleHQgYmVsb3cuXHJcblx0Ly8gWW91IGNhbiByZW1vdmUgXCJ7e2hlYWRlcn19XCIgYW5kIHdyaXRlIHRoZSBjb250ZW50IGRpcmVjdGx5IGluc2lkZSB0aGUgSFRNTCBpZiB5b3Ugd2FudC5cclxuXHQvL1xyXG5cdC8vICAtIEFSSUEgcnVsZXMgc3VnZ2VzdCB0byBlbnN1cmUgY29udHJvbHMgYXJlIHRhYmJhYmxlIChzbyB0aGUgYnJvd3NlciBjYW4gZmluZCB0aGUgZmlyc3QgY29udHJvbCksXHJcblx0Ly8gICAgYW5kIHRvIHNldCB0aGUgZm9jdXMgdG8gdGhlIGZpcnN0IGludGVyYWN0aXZlIGNvbnRyb2wgKGh0dHA6Ly93M2MuZ2l0aHViLmlvL2FyaWEtaW4taHRtbC8pXHJcblx0ZWxlbWVudHM6IHtcclxuXHRcdGhlYWRlcjogXCI8c3BhbiBjbGFzcz1cXFwiY2MtaGVhZGVyXFxcIj57e2hlYWRlcn19PC9zcGFuPiZuYnNwO1wiLFxyXG5cdFx0bWVzc2FnZTogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX08L3NwYW4+XCIsXHJcblx0XHRtZXNzYWdlbGluazogXCI8c3BhbiBpZD1cXFwiY29va2llY29uc2VudDpkZXNjXFxcIiBjbGFzcz1cXFwiY2MtbWVzc2FnZVxcXCI+e3ttZXNzYWdlfX0gPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiByZWw9XFxcIm5vb3BlbmVyIG5vcmVmZXJyZXIgbm9mb2xsb3dcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj57e2xpbmt9fTwvYT48L3NwYW4+XCIsXHJcblx0XHRhbGxvdzogXCI8YSBhcmlhLWxhYmVsPVxcXCJhbGxvdyBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgIGNsYXNzPVxcXCJjYy1idG4gY2MtYWxsb3dcXFwiPnt7YWxsb3d9fTwvYT5cIixcclxuXHRcdGRlbnk6IFwiPGEgYXJpYS1sYWJlbD1cXFwiZGVueSBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWJ0biBjYy1kZW55XFxcIj57e2Rlbnl9fTwvYT5cIixcclxuXHRcdGxpbms6IFwiPGEgYXJpYS1sYWJlbD1cXFwibGVhcm4gbW9yZSBhYm91dCBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWxpbmtcXFwiIGhyZWY9XFxcInt7aHJlZn19XFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCI+e3tsaW5rfX08L2E+XCIsXHJcblx0XHRjbG9zZTogXCI8c3BhbiBhcmlhLWxhYmVsPVxcXCJkaXNtaXNzIGNvb2tpZSBtZXNzYWdlXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWNsb3NlXFxcIj57e2Nsb3NlfX08L3NwYW4+XCIsXHJcblx0fSxcclxuXHJcblx0Ly8gVGhlIHBsYWNlaG9sZGVycyB7e2NsYXNzZXN9fSBhbmQge3tjaGlsZHJlbn19IGJvdGggZ2V0IHJlcGxhY2VkIGR1cmluZyBpbml0aWFsaXNhdGlvbjpcclxuXHQvLyAgLSB7e2NsYXNzZXN9fSBpcyB3aGVyZSBhZGRpdGlvbmFsIGNsYXNzZXMgZ2V0IGFkZGVkXHJcblx0Ly8gIC0ge3tjaGlsZHJlbn19IGlzIHdoZXJlIHRoZSBIVE1MIGNoaWxkcmVuIGFyZSBwbGFjZWRcclxuXHR3aW5kb3c6IFwiPGRpdiByb2xlPVxcXCJkaWFsb2dcXFwiIGFyaWEtbGl2ZT1cXFwicG9saXRlXFxcIiBhcmlhLWxhYmVsPVxcXCJjb29raWVjb25zZW50XFxcIiBhcmlhLWRlc2NyaWJlZGJ5PVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy13aW5kb3cge3tjbGFzc2VzfX1cXFwiPjwhLS1nb29nbGVvZmY6IGFsbC0tPnt7Y2hpbGRyZW59fTwhLS1nb29nbGVvbjogYWxsLS0+PC9kaXY+XCIsXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIGh0bWwgZm9yIHRoZSBjb25maWcgYnV0dG9uLiBUaGlzIG9ubHkgc2hvd3MgdXAgYWZ0ZXIgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIHRoZWlyIGxldmVsIG9mIGNvbnNlbnRcclxuXHQvLyBJdCBtdXN0IGluY2x1ZGUgdGhlIGNjLWNvbmZpZyBjbGFzc1xyXG5cdGNvbmZpZ0J0bjogXCI8ZGl2IGNsYXNzPVxcXCJjYy1jb25maWcge3tjbGFzc2VzfX1cXFwiPkNvbmZpZ3VyYXIgY29va2llczwvZGl2PlwiLFxyXG5cclxuXHQvLyBUaGlzIGlzIHRoZSBlbGVtZW50IHNlbGVjdG9yIHdoZXJlIHRoZSBjb25maWcgYnV0dG9uIHdpbGwgYmUgYWRkZWRcclxuXHRjb25maWdCdG5TZWxlY3RvcjogXCJcIixcclxuXHJcblx0Ly8gZGVmaW5lIHR5cGVzIG9mICdjb21wbGlhbmNlJyBoZXJlLiAne3t2YWx1ZX19JyBzdHJpbmdzIGluIGhlcmUgYXJlIGxpbmtlZCB0byBgZWxlbWVudHNgXHJcblx0Y29tcGxpYW5jZTogXCI8ZGl2IGNsYXNzPVxcXCJjYy1jb21wbGlhbmNlIGNjLWhpZ2hsaWdodFxcXCI+e3tkZW55fX17e2FsbG93fX08L2Rpdj5cIixcclxuXHJcblx0Ly8gZGVmaW5lIGxheW91dCBsYXlvdXRzIGhlcmVcclxuXHRsYXlvdXRzOiB7XHJcblx0XHQvLyB0aGUgJ2Jsb2NrJyBsYXlvdXQgdGVuZCB0byBiZSBmb3Igc3F1YXJlIGZsb2F0aW5nIHBvcHVwc1xyXG5cdFx0XCJiYXNpY1wiOiBcInt7bWVzc2FnZWxpbmt9fXt7Y29tcGxpYW5jZX19XCIsXHJcblx0XHRcImJhc2ljLWNsb3NlXCI6IFwie3ttZXNzYWdlbGlua319e3tjb21wbGlhbmNlfX17e2Nsb3NlfX1cIixcclxuXHRcdFwiYmFzaWMtaGVhZGVyXCI6IFwie3toZWFkZXJ9fXt7bWVzc2FnZX19e3tsaW5rfX17e2NvbXBsaWFuY2V9fVwiLFxyXG5cdH0sXHJcblxyXG5cdC8vIGRlZmF1bHQgbGF5b3V0IChzZWUgYWJvdmUpXHJcblx0bGF5b3V0OiBcImJhc2ljXCIsXHJcblxyXG5cdC8vIHRoaXMgcmVmZXJzIHRvIHRoZSBwb3B1cCB3aW5kb3dzIHBvc2l0aW9uLiB3ZSBjdXJyZW50bHkgc3VwcG9ydDpcclxuXHQvLyAgLSBiYW5uZXIgcG9zaXRpb25zOiB0b3AsIGJvdHRvbVxyXG5cdC8vICAtIGZsb2F0aW5nIHBvc2l0aW9uczogdG9wLWxlZnQsIHRvcC1yaWdodCwgYm90dG9tLWxlZnQsIGJvdHRvbS1yaWdodFxyXG5cdC8vXHJcblx0Ly8gYWRkcyBhIGNsYXNzIGBjYy1mbG9hdGluZ2Agb3IgYGNjLWJhbm5lcmAgd2hpY2ggaGVscHMgd2hlbiBzdHlsaW5nXHJcblx0cG9zaXRpb246IFwiYm90dG9tXCIsIC8vIGRlZmF1bHQgcG9zaXRpb24gaXMgJ2JvdHRvbSdcclxuXHJcblx0Ly8gQXZhaWxhYmxlIHN0eWxlc1xyXG5cdC8vICAgIC1ibG9jayAoZGVmYXVsdCwgbm8gZXh0cmEgY2xhc3NlcylcclxuXHQvLyAgICAtZWRnZWxlc3NcclxuXHQvLyAgICAtY2xhc3NpY1xyXG5cdC8vIHVzZSB5b3VyIG93biBzdHlsZSBuYW1lIGFuZCB1c2UgYC5jYy10aGVtZS1TVFlMRU5BTUVgIGNsYXNzIGluIENTUyB0byBlZGl0LlxyXG5cdC8vIE5vdGU6IHN0eWxlIFwid2lyZVwiIGlzIHVzZWQgZm9yIHRoZSBjb25maWd1cmF0b3IsIGJ1dCBoYXMgbm8gQ1NTIHN0eWxlcyBvZiBpdHMgb3duLCBvbmx5IHBhbGV0dGUgaXMgdXNlZC5cclxuXHR0aGVtZTogXCJibG9ja1wiLFxyXG5cclxuXHQvLyBpZiB5b3Ugd2FudCBjdXN0b20gY29sb3VycywgcGFzcyB0aGVtIGluIGhlcmUuIHRoaXMgb2JqZWN0IHNob3VsZCBsb29rIGxpa2UgdGhpcy5cclxuXHQvLyBpZGVhbGx5LCBhbnkgY3VzdG9tIGNvbG91cnMvdGhlbWVzIHNob3VsZCBiZSBjcmVhdGVkIGluIGEgc2VwYXJhdGUgc3R5bGUgc2hlZXQsIGFzIHRoaXMgaXMgbW9yZSBlZmZpY2llbnQuXHJcblx0Ly8gICB7XHJcblx0Ly8gICAgIHBvcHVwOiB7YmFja2dyb3VuZDogJyMwMDAwMDAnLCB0ZXh0OiAnI2ZmZicsIGxpbms6ICcjZmZmJ30sXHJcblx0Ly8gICAgIGJ1dHRvbjoge2JhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnI2Y4ZTcxYyd9LFxyXG5cdC8vICAgICBoaWdobGlnaHQ6IHtiYWNrZ3JvdW5kOiAnI2Y4ZTcxYycsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnIzAwMDAwMCd9LFxyXG5cdC8vICAgfVxyXG5cdC8vIGBoaWdobGlnaHRgIGlzIG9wdGlvbmFsIGFuZCBleHRlbmRzIGBidXR0b25gLiBpZiBpdCBleGlzdHMsIGl0IHdpbGwgYXBwbHkgdG8gdGhlIGZpcnN0IGJ1dHRvblxyXG5cdC8vIG9ubHkgYmFja2dyb3VuZCBuZWVkcyB0byBiZSBkZWZpbmVkIGZvciBldmVyeSBlbGVtZW50LiBpZiBub3Qgc2V0LCBvdGhlciBjb2xvcnMgY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSBpdFxyXG5cdHBhbGV0dGU6e1xyXG5cdFx0cG9wdXA6IHtiYWNrZ3JvdW5kOiBcIiMyMjIyMjJcIn0sXHJcblx0XHRidXR0b246IHtiYWNrZ3JvdW5kOiBcIiMwMGIwNTBcIn1cclxuXHR9LFxyXG59O1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHZlcnNpb24gICAgICAgICA9IHJlcXVpcmUoXCIuLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbjtcclxuY29uc3QgQ29va2llc0lDR0MgPSByZXF1aXJlKFwiLi9jb29raWVzSWNnY1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHZlcnNpb24sXHJcblx0Q29va2llc0lDR0NcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgcHJvamVjdCBpbiB1c2UgYXMgc3BlY2lmaWVkIGluIGBwYWNrYWdlLmpzb25gLFxyXG4gKiBgQ0hBTkdFTE9HLm1kYCwgYW5kIHRoZSBHaXRIdWIgcmVsZWFzZS5cclxuICpcclxuICogQHZhciB7c3RyaW5nfSB2ZXJzaW9uXHJcbiAqL1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNvbnN0IHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xyXG5cclxuY2xhc3MgUG9wdXAge1xyXG5cclxuXHQgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcblx0Y29uc3RydWN0b3Iob3B0aW9ucyAgICAgICAgLCBzdGF0dXNMaXN0ICAgICAgICApIHtcclxuXHJcblx0XHR0aGlzLnN0YXR1c0xpc3QgPSBzdGF0dXNMaXN0O1xyXG5cdFx0dGhpcy5hbGxvd0hhbmRsZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IG51bGw7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucykge1xyXG5cclxuXHRcdFx0dGhpcy5kZXN0cm95KCk7IC8vIGFscmVhZHkgcmVuZGVyZWRcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gc2V0IG9wdGlvbnMgYmFjayB0byBkZWZhdWx0IG9wdGlvbnNcclxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcblxyXG5cdFx0Ly8gdGhlIGZ1bGwgbWFya3VwIGVpdGhlciBjb250YWlucyB0aGUgd3JhcHBlciBvciBpdCBkb2VzIG5vdCAoZm9yIG11bHRpcGxlIGluc3RhbmNlcylcclxuXHRcdGNvbnN0IGNvb2tpZVBvcHVwID0gdGhpcy5vcHRpb25zLndpbmRvdy5yZXBsYWNlKFwie3tjbGFzc2VzfX1cIiwgdGhpcy5nZXRQb3B1cENsYXNzZXMoKS5qb2luKFwiIFwiKSlcclxuXHRcdFx0LnJlcGxhY2UoXCJ7e2NoaWxkcmVufX1cIiwgdGhpcy5nZXRQb3B1cElubmVyTWFya3VwKCkpO1xyXG5cclxuXHRcdHRoaXMuZWxlbWVudCA9IHRoaXMuYXBwZW5kTWFya3VwKGNvb2tpZVBvcHVwKTtcclxuXHJcblx0XHR0aGlzLm9wZW4oKTtcclxuXHJcblx0fVxyXG5cclxuXHRkZXN0cm95KCkge1xyXG5cclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1hbGxvd1wiKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5hbGxvd0hhbmRsZXIpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWRlbnlcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZGVueUhhbmRsZXIpO1xyXG5cdFx0dGhpcy5hbGxvd0hhbmRsZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IG51bGw7XHJcblxyXG5cdFx0aWYgKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG5cclxuXHRcdFx0dGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KTtcclxuXHJcblx0XHR9XHJcblx0XHR0aGlzLmVsZW1lbnQgPSBudWxsO1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucyA9IG51bGw7XHJcblxyXG5cdH1cclxuXHJcblx0b3BlbigpIHtcclxuXHJcblx0XHRpZiAoIXRoaXMuZWxlbWVudCkge1xyXG5cclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIXRoaXMuaXNPcGVuKCkpIHtcclxuXHJcblx0XHRcdHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcclxuXHJcblx0XHRcdHV0aWwucmVtb3ZlQ2xhc3ModGhpcy5lbGVtZW50LCBcImNjLWludmlzaWJsZVwiKTtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4pIHtcblxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4oKTtcblxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRjbG9zZSgpIHtcclxuXHJcblx0XHRpZiAoIXRoaXMuZWxlbWVudCkge1xyXG5cclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5pc09wZW4oKSkge1xyXG5cclxuXHRcdFx0dGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub25Qb3B1cENsb3NlKSB7XG5cblx0XHRcdFx0dGhpcy5vcHRpb25zLm9uUG9wdXBDbG9zZSgpO1xuXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlzT3BlbigpIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSBcIlwiICYmICF1dGlsLmhhc0NsYXNzKHRoaXMuZWxlbWVudCwgXCJjYy1pbnZpc2libGVcIik7XHJcblxyXG5cdH1cclxuXHJcblx0Z2V0UG9zaXRpb25DbGFzc2VzKCkge1xyXG5cclxuXHRcdGNvbnN0IHBvc2l0aW9ucyA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbi5zcGxpdChcIi1cIik7IC8vIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodFxyXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtdO1xyXG5cclxuXHRcdC8vIHRvcCwgbGVmdCwgcmlnaHQsIGJvdHRvbVxyXG5cdFx0cG9zaXRpb25zLmZvckVhY2goKGN1cikgPT4ge1xyXG5cclxuXHRcdFx0Y2xhc3Nlcy5wdXNoKGBjYy0ke2N1cn1gKTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gY2xhc3NlcztcclxuXHJcblx0fVxyXG5cclxuXHRnZXRQb3B1cENsYXNzZXMoKSB7XHJcblxyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuXHRcdGxldCBwb3NpdGlvblN0eWxlID0gKG9wdHMucG9zaXRpb24gPT09IFwidG9wXCIgfHwgb3B0cy5wb3NpdGlvbiA9PT0gXCJib3R0b21cIikgPyBcImJhbm5lclwiIDogXCJmbG9hdGluZ1wiO1xyXG5cclxuXHRcdGlmIChvcHRzLmlzTW9iaWxlKSB7XHJcblxyXG5cdFx0XHRwb3NpdGlvblN0eWxlID0gXCJmbG9hdGluZ1wiO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBjbGFzc2VzID0gW1xyXG5cdFx0XHRgY2MtJHtwb3NpdGlvblN0eWxlfWAsIC8vIGZsb2F0aW5nIG9yIGJhbm5lclxyXG5cdFx0XHRcImNjLXR5cGUtb3B0LWluXCIsIC8vIGFkZCB0aGUgY29tcGxpYW5jZSB0eXBlXHJcblx0XHRcdGBjYy10aGVtZS0ke29wdHMudGhlbWV9YCwgLy8gYWRkIHRoZSB0aGVtZVxyXG5cdFx0XTtcclxuXHJcblx0XHRpZiAob3B0cy5zdGF0aWMpIHtcclxuXHJcblx0XHRcdGNsYXNzZXMucHVzaChcImNjLXN0YXRpY1wiKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0Y2xhc3Nlcy5wdXNoLmFwcGx5KGNsYXNzZXMsIHRoaXMuZ2V0UG9zaXRpb25DbGFzc2VzKCkpO1xyXG5cclxuXHRcdC8vIHdlIG9ubHkgYWRkIGV4dHJhIHN0eWxlcyBpZiBgcGFsZXR0ZWAgaGFzIGJlZW4gc2V0IHRvIGEgdmFsaWQgdmFsdWVcclxuXHRcdHRoaXMuYXR0YWNoQ3VzdG9tUGFsZXR0ZSh0aGlzLm9wdGlvbnMucGFsZXR0ZSk7XHJcblxyXG5cdFx0Ly8gaWYgd2Ugb3ZlcnJpZGUgdGhlIHBhbGV0dGUsIGFkZCB0aGUgY2xhc3MgdGhhdCBlbmFibGVzIHRoaXNcclxuXHRcdGlmICh0aGlzLmN1c3RvbVN0eWxlU2VsZWN0b3IpIHtcclxuXHJcblx0XHRcdGNsYXNzZXMucHVzaCh0aGlzLmN1c3RvbVN0eWxlU2VsZWN0b3IpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY2xhc3NlcztcclxuXHJcblx0fVxyXG5cclxuXHRnZXRQb3B1cElubmVyTWFya3VwKCkge1xyXG5cclxuXHRcdGNvbnN0IGludGVycG9sYXRlZCA9IHt9O1xyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuXHJcblx0XHRPYmplY3Qua2V5cyhvcHRzLmVsZW1lbnRzKS5mb3JFYWNoKChwcm9wKSA9PiB7XHJcblxyXG5cdFx0XHRpbnRlcnBvbGF0ZWRbcHJvcF0gPSB1dGlsLmludGVycG9sYXRlU3RyaW5nKG9wdHMuZWxlbWVudHNbcHJvcF0sIChuYW1lKSA9PiB7XHJcblxyXG5cdFx0XHRcdGNvbnN0IHN0ciA9IG9wdHMuY29udGVudFtuYW1lXTtcclxuXHRcdFx0XHRyZXR1cm4gKG5hbWUgJiYgdHlwZW9mIHN0ciA9PSBcInN0cmluZ1wiICYmIHN0ci5sZW5ndGgpID8gc3RyIDogXCJcIjtcclxuXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGNoZWNrcyBpZiB0aGUgdHlwZSBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gaW5mbyBpZiBpdCdzIG5vdFxyXG5cdFx0Y29uc3QgY29tcGxpYW5jZVR5cGUgPSBvcHRzLmNvbXBsaWFuY2U7XHJcblxyXG5cdFx0Ly8gYnVpbGQgdGhlIGNvbXBsaWFuY2UgdHlwZXMgZnJvbSB0aGUgYWxyZWFkeSBpbnRlcnBvbGF0ZWQgYGVsZW1lbnRzYFxyXG5cdFx0aW50ZXJwb2xhdGVkLmNvbXBsaWFuY2UgPSB1dGlsLmludGVycG9sYXRlU3RyaW5nKGNvbXBsaWFuY2VUeXBlLCAobmFtZSkgPT4ge1xyXG5cclxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFtuYW1lXTtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBjaGVja3MgaWYgdGhlIGxheW91dCBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gYmFzaWMgaWYgaXQncyBub3RcclxuXHRcdGxldCBsYXlvdXQgPSBvcHRzLmxheW91dHNbb3B0cy5sYXlvdXRdO1xyXG5cdFx0aWYgKCFsYXlvdXQpIHtcclxuXHJcblx0XHRcdGxheW91dCA9IG9wdHMubGF5b3V0cy5iYXNpYztcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHV0aWwuaW50ZXJwb2xhdGVTdHJpbmcobGF5b3V0LCAobWF0Y2gpID0+IHtcclxuXHJcblx0XHRcdHJldHVybiBpbnRlcnBvbGF0ZWRbbWF0Y2hdO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdGFwcGVuZE1hcmt1cChtYXJrdXApIHtcclxuXHJcblx0XHRjb25zdCBvcHRzID0gdGhpcy5vcHRpb25zO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRjb25zdCBjb250ID0gKG9wdHMuY29udGFpbmVyICYmIG9wdHMuY29udGFpbmVyLm5vZGVUeXBlID09PSAxKSA/IG9wdHMuY29udGFpbmVyIDogZG9jdW1lbnQuYm9keTtcclxuXHJcblx0XHRkaXYuaW5uZXJIVE1MID0gbWFya3VwO1xyXG5cclxuXHRcdGNvbnN0IGVsID0gZGl2LmNoaWxkcmVuWzBdO1xyXG5cclxuXHRcdGVsLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHJcblx0XHRpZiAodXRpbC5oYXNDbGFzcyhlbCwgXCJjYy13aW5kb3dcIikpIHtcclxuXHJcblx0XHRcdHV0aWwuYWRkQ2xhc3MoZWwsIFwiY2MtaW52aXNpYmxlXCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIWNvbnQuZmlyc3RDaGlsZCkge1xyXG5cclxuXHRcdFx0Y29udC5hcHBlbmRDaGlsZChlbCk7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHJcblx0XHRcdGNvbnQuaW5zZXJ0QmVmb3JlKGVsLCBjb250LmZpcnN0Q2hpbGQpO1xyXG5cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0cmV0dXJuIGVsO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEFsbG93SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuYWxsb3dIYW5kbGVyKTtcclxuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtYWxsb3dcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhbGxiYWNrKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXREZW55SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApIHtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kZW55SGFuZGxlcik7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gY2FsbGJhY2s7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtZGVueVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vIEkgbWlnaHQgY2hhbmdlIHRoaXMgZnVuY3Rpb24gdG8gdXNlIGlubGluZSBzdHlsZXMuIEkgb3JpZ2luYWxseSBjaG9zZSBhIHN0eWxlc2hlZXQgYmVjYXVzZSBJIGNvdWxkIHNlbGVjdCBtYW55IGVsZW1lbnRzIHdpdGggYVxyXG5cdC8vIHNpbmdsZSBydWxlIChzb21ldGhpbmcgdGhhdCBoYXBwZW5lZCBhIGxvdCksIHRoZSBhcHBzIGhhcyBjaGFuZ2VkIHNsaWdodGx5IG5vdyB0aG91Z2gsIHNvIGlubGluZSBzdHlsZXMgbWlnaHQgYmUgbW9yZSBhcHBsaWNhYmxlLlxyXG5cdGF0dGFjaEN1c3RvbVBhbGV0dGUocGFsZXR0ZSkge1xyXG5cclxuXHRcdGNvbnN0IGhhc2ggPSB1dGlsLmhhc2goSlNPTi5zdHJpbmdpZnkocGFsZXR0ZSkpO1xyXG5cdFx0Y29uc3Qgc2VsZWN0b3IgPSBgY2MtY29sb3Itb3ZlcnJpZGUtJHtoYXNofWA7XHJcblx0XHRjb25zdCBpc1ZhbGlkID0gdXRpbC5pc1BsYWluT2JqZWN0KHBhbGV0dGUpO1xyXG5cclxuXHRcdHRoaXMuY3VzdG9tU3R5bGVTZWxlY3RvciA9IGlzVmFsaWQgPyBzZWxlY3RvciA6IG51bGw7XHJcblxyXG5cdFx0aWYgKGlzVmFsaWQpIHtcclxuXHJcblx0XHRcdHRoaXMuYWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgYC4ke3NlbGVjdG9yfWApO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiBpc1ZhbGlkO1xyXG5cclxuXHR9XHJcblxyXG5cdGFkZEN1c3RvbVN0eWxlKGhhc2gsIHBhbGV0dGUsIHByZWZpeCkge1xyXG5cclxuXHRcdGNvbnN0IGNvbG9yU3R5bGVzID0ge307XHJcblx0XHRjb25zdCBwb3B1cCA9IHBhbGV0dGUucG9wdXA7XHJcblx0XHRjb25zdCBidXR0b24gPSBwYWxldHRlLmJ1dHRvbjtcclxuXHRcdGNvbnN0IGhpZ2hsaWdodCA9IHBhbGV0dGUuaGlnaGxpZ2h0O1xyXG5cclxuXHRcdC8vIG5lZWRzIGJhY2tncm91bmQgY29sb3VyLCB0ZXh0IGFuZCBsaW5rIHdpbGwgYmUgc2V0IHRvIGJsYWNrL3doaXRlIGlmIG5vdCBzcGVjaWZpZWRcclxuXHRcdGlmIChwb3B1cCkge1xyXG5cclxuXHRcdFx0Ly8gYXNzdW1lcyBwb3B1cC5iYWNrZ3JvdW5kIGlzIHNldFxyXG5cdFx0XHRwb3B1cC50ZXh0ID0gcG9wdXAudGV4dCA/IHBvcHVwLnRleHQgOiB1dGlsLmdldENvbnRyYXN0KHBvcHVwLmJhY2tncm91bmQpO1xyXG5cdFx0XHRwb3B1cC5saW5rID0gcG9wdXAubGluayA/IHBvcHVwLmxpbmsgOiBwb3B1cC50ZXh0O1xyXG5cdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9LmNjLXdpbmRvd2BdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC50ZXh0fWAsXHJcblx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7cG9wdXAuYmFja2dyb3VuZH1gXHJcblx0XHRcdF07XHJcblx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWxpbmssJHtwcmVmaXh9IC5jYy1saW5rOmFjdGl2ZSwke3ByZWZpeH0gLmNjLWxpbms6dmlzaXRlZGBdID0gW1xyXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC5saW5rfWBcclxuXHRcdFx0XTtcclxuXHJcblx0XHRcdGlmIChidXR0b24pIHtcclxuXHJcblx0XHRcdFx0Ly8gYXNzdW1lcyBidXR0b24uYmFja2dyb3VuZCBpcyBzZXRcclxuXHRcdFx0XHRidXR0b24udGV4dCA9IGJ1dHRvbi50ZXh0ID8gYnV0dG9uLnRleHQgOiB1dGlsLmdldENvbnRyYXN0KGJ1dHRvbi5iYWNrZ3JvdW5kKTtcclxuXHRcdFx0XHRidXR0b24uYm9yZGVyID0gYnV0dG9uLmJvcmRlciA/IGJ1dHRvbi5ib3JkZXIgOiBcInRyYW5zcGFyZW50XCI7XHJcblx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtYnRuYF0gPSBbXHJcblx0XHRcdFx0XHRgY29sb3I6ICR7YnV0dG9uLnRleHR9YCxcclxuXHRcdFx0XHRcdGBib3JkZXItY29sb3I6ICR7YnV0dG9uLmJvcmRlcn1gLFxyXG5cdFx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7YnV0dG9uLmJhY2tncm91bmR9YFxyXG5cdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdGlmIChidXR0b24uYmFja2dyb3VuZCAhPT0gXCJ0cmFuc3BhcmVudFwiKSB7XHJcblxyXG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtYnRuOmhvdmVyLCAke3ByZWZpeH0gLmNjLWJ0bjpmb2N1c2BdID0gW1xyXG5cdFx0XHRcdFx0XHRgYmFja2dyb3VuZC1jb2xvcjogJHt1dGlsLmdldEhvdmVyQ29sb3VyKGJ1dHRvbi5iYWNrZ3JvdW5kKX1gXHJcblx0XHRcdFx0XHRdO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChoaWdobGlnaHQpIHtcclxuXHJcblx0XHRcdFx0Ly9hc3N1bWVzIGhpZ2hsaWdodC5iYWNrZ3JvdW5kIGlzIHNldFxyXG5cdFx0XHRcdFx0aGlnaGxpZ2h0LnRleHQgPSBoaWdobGlnaHQudGV4dCA/IGhpZ2hsaWdodC50ZXh0IDogdXRpbC5nZXRDb250cmFzdChoaWdobGlnaHQuYmFja2dyb3VuZCk7XHJcblx0XHRcdFx0XHRoaWdobGlnaHQuYm9yZGVyID0gaGlnaGxpZ2h0LmJvcmRlciA/IGhpZ2hsaWdodC5ib3JkZXIgOiBcInRyYW5zcGFyZW50XCI7XHJcblx0XHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1oaWdobGlnaHQgLmNjLWJ0bjpmaXJzdC1jaGlsZGBdID0gW1xyXG5cdFx0XHRcdFx0XHRgY29sb3I6ICR7aGlnaGxpZ2h0LnRleHR9YCxcclxuXHRcdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtoaWdobGlnaHQuYm9yZGVyfWAsXHJcblx0XHRcdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke2hpZ2hsaWdodC5iYWNrZ3JvdW5kfWBcclxuXHRcdFx0XHRcdF07XHJcblxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdC8vIHNldHMgaGlnaGxpZ2h0IHRleHQgY29sb3IgdG8gcG9wdXAgdGV4dC4gYmFja2dyb3VuZCBhbmQgYm9yZGVyIGFyZSB0cmFuc3BhcmVudCBieSBkZWZhdWx0LlxyXG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtaGlnaGxpZ2h0IC5jYy1idG46Zmlyc3QtY2hpbGRgXSA9IFtcclxuXHRcdFx0XHRcdFx0YGNvbG9yOiAke3BvcHVwLnRleHR9YFxyXG5cdFx0XHRcdFx0XTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvLyB0aGlzIHdpbGwgYmUgaW50ZXJwcmV0dGVkIGFzIENTUy4gdGhlIGtleSBpcyB0aGUgc2VsZWN0b3IsIGFuZCBlYWNoIGFycmF5IGVsZW1lbnQgaXMgYSBydWxlXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuXHRcdGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuXHRcdGxldCBydWxlSW5kZXggPSAtMTtcclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBjb2xvclN0eWxlcykge1xyXG5cclxuXHRcdFx0c3R5bGUuc2hlZXQuaW5zZXJ0UnVsZShgJHtwcm9wfXske2NvbG9yU3R5bGVzW3Byb3BdLmpvaW4oXCI7XCIpfX1gLCArK3J1bGVJbmRleCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwO1xyXG4iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNsYXNzIFV0aWwge1xyXG5cclxuXHRzdGF0aWMgZXNjYXBlUmVnRXhwKHN0ciAgICAgICAgKSB7XHJcblxyXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIik7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGhhc0NsYXNzKGVsZW1lbnQgICAgICAgICwgc2VsZWN0b3IgICAgICAgICkge1xyXG5cclxuXHRcdGNvbnN0IHMgPSBcIiBcIjtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG5cdFx0cmV0dXJuIGVsZW1lbnQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmXHJcblx0XHRcdChzICsgZWxlbWVudC5jbGFzc05hbWUgKyBzKS5yZXBsYWNlKC9bXFxuXFx0XS9nLCBzKS5pbmRleE9mKHMgKyBzZWxlY3RvciArIHMpID49IDA7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZENsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRlbGVtZW50LmNsYXNzTmFtZSArPSBgICR7Y2xhc3NOYW1lfWA7XHJcblxyXG5cdH1cclxuXHJcblx0c3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHJcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFxcXFxiJHtVdGlsLmVzY2FwZVJlZ0V4cChjbGFzc05hbWUpfVxcXFxiYCk7XHJcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpbnRlcnBvbGF0ZVN0cmluZyhzdHIgICAgICAgICwgY2FsbGJhY2sgICAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgbWFya2VyID0gL3t7KFthLXpdW2EtejAtOVxcLV9dKil9fS9pZztcclxuXHRcdHJldHVybiBzdHIucmVwbGFjZShtYXJrZXIsIGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGFyZ3VtZW50c1sxXSkgfHwgXCJcIjtcclxuXHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHQvLyBvbmx5IHVzZWQgZm9yIGhhc2hpbmcganNvbiBvYmplY3RzICh1c2VkIGZvciBoYXNoIG1hcHBpbmcgcGFsZXR0ZSBvYmplY3RzLCB1c2VkIHdoZW4gY3VzdG9tIGNvbG91cnMgYXJlIHBhc3NlZCB0aHJvdWdoIEphdmFTY3JpcHQpXHJcblx0c3RhdGljIGhhc2goc3RyICAgICAgICApIHtcclxuXHJcblx0XHRsZXQgaGFzaCA9IDAsXHJcblx0XHRcdGksIGNociwgbGVuO1xyXG5cdFx0aWYgKHN0ci5sZW5ndGggPT09IDApIHtcclxuXHJcblx0XHRcdHJldHVybiBoYXNoO1xyXG5cclxuXHRcdH1cclxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG5cclxuXHRcdFx0Y2hyID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcblx0XHRcdGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNocjtcclxuXHRcdFx0aGFzaCB8PSAwO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiBoYXNoO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBub3JtYWxpc2VIZXgoaGV4ICAgICAgICApIHtcclxuXHJcblx0XHRpZiAoaGV4WzBdID09PSBcIiNcIikge1xyXG5cclxuXHRcdFx0aGV4ID0gaGV4LnN1YnN0cigxKTtcclxuXHJcblx0XHR9XHJcblx0XHRpZiAoaGV4Lmxlbmd0aCA9PT0gMykge1xyXG5cclxuXHRcdFx0aGV4ID0gaGV4WzBdICsgaGV4WzBdICsgaGV4WzFdICsgaGV4WzFdICsgaGV4WzJdICsgaGV4WzJdO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiBoZXg7XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gdXNlZCB0byBnZXQgdGV4dCBjb2xvcnMgaWYgbm90IHNldFxyXG5cdHN0YXRpYyBnZXRDb250cmFzdChoZXggICAgICAgICkge1xyXG5cclxuXHRcdGhleCA9IFV0aWwubm9ybWFsaXNlSGV4KGhleCk7XHJcblx0XHRjb25zdCByID0gcGFyc2VJbnQoaGV4LnN1YnN0cigwLCAyKSwgMTYpO1xyXG5cdFx0Y29uc3QgZyA9IHBhcnNlSW50KGhleC5zdWJzdHIoMiwgMiksIDE2KTtcclxuXHRcdGNvbnN0IGIgPSBwYXJzZUludChoZXguc3Vic3RyKDQsIDIpLCAxNik7XHJcblx0XHRjb25zdCB5aXEgPSAoKHIgKiAyOTkpICsgKGcgKiA1ODcpICsgKGIgKiAxMTQpKSAvIDEwMDA7XHJcblx0XHRyZXR1cm4gKHlpcSA+PSAxMjgpID8gXCIjMDAwXCIgOiBcIiNmZmZcIjtcclxuXHJcblx0fVxyXG5cclxuXHQvLyB1c2VkIHRvIGNoYW5nZSBjb2xvciBvbiBoaWdobGlnaHRcclxuXHRzdGF0aWMgZ2V0THVtaW5hbmNlKGhleCAgICAgICAgKSB7XHJcblxyXG5cdFx0Y29uc3QgbnVtID0gcGFyc2VJbnQoVXRpbC5ub3JtYWxpc2VIZXgoaGV4KSwgMTYpLFxyXG5cdFx0XHRhbXQgPSAzOCxcclxuXHRcdFx0UiA9IChudW0gPj4gMTYpICsgYW10LFxyXG5cdFx0XHRCID0gKG51bSA+PiA4ICYgMHgwMEZGKSArIGFtdCxcclxuXHRcdFx0RyA9IChudW0gJiAweDAwMDBGRikgKyBhbXQ7XHJcblx0XHRjb25zdCBuZXdDb2xvdXIgPSAoMHgxMDAwMDAwICsgKFIgPCAyNTUgPyBSIDwgMSA/IDAgOiBSIDogMjU1KSAqIDB4MTAwMDAgKyAoQiA8IDI1NSA/IEIgPCAxID8gMCA6IEIgOiAyNTUpICogMHgxMDAgKyAoRyA8IDI1NSA/IEcgPCAxID8gMCA6IEcgOiAyNTUpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XHJcblx0XHRyZXR1cm4gYCMke25ld0NvbG91cn1gO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBnZXRIb3ZlckNvbG91cihoZXggICAgICAgICkge1xyXG5cclxuXHRcdGhleCA9IFV0aWwubm9ybWFsaXNlSGV4KGhleCk7XHJcblx0XHQvLyBmb3IgYmxhY2sgYnV0dG9uc1xyXG5cdFx0aWYgKGhleCA9PT0gXCIwMDAwMDBcIikge1xyXG5cclxuXHRcdFx0cmV0dXJuIFwiIzIyMlwiO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiBVdGlsLmdldEx1bWluYW5jZShoZXgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBpc01vYmlsZSh1c2VyQWdlbnQgICAgICAgICkge1xyXG5cclxuXHRcdHJldHVybiAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QodXNlckFnZW50KTtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaXNQbGFpbk9iamVjdChvYmogICAgICAgICkge1xyXG5cclxuXHRcdC8vIFRoZSBjb2RlIFwidHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgb2JqICE9PSBudWxsXCIgYWxsb3dzIEFycmF5IG9iamVjdHNcclxuXHRcdHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgYXJyYXlDb250YWluc01hdGNoZXMoYXJyYXkgICAgICAgLCBzZWFyY2ggICAgICAgICkge1xyXG5cclxuXHRcdGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblxyXG5cdFx0XHRjb25zdCBzdHIgPSBhcnJheVtpXTtcclxuXHRcdFx0Ly8gaWYgcmVnZXggbWF0Y2hlcyBvciBzdHJpbmcgaXMgZXF1YWwsIHJldHVybiB0cnVlXHJcblx0XHRcdGlmICgoc3RyIGluc3RhbmNlb2YgUmVnRXhwICYmIHN0ci50ZXN0KHNlYXJjaCkpIHx8XHJcblx0XHRcdCh0eXBlb2Ygc3RyID09IFwic3RyaW5nXCIgJiYgc3RyLmxlbmd0aCAmJiBzdHIgPT09IHNlYXJjaCkpIHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHR9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7XHJcbiJdfQ==
