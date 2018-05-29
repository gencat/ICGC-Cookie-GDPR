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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJEOi93b3Jrc3BhY2UvR2l0aHViL0lDR0MtQ29va2llLUdEUFIvc3JjL2Nvb2tpZU1hbmFnZXIuanMiLCJEOi93b3Jrc3BhY2UvR2l0aHViL0lDR0MtQ29va2llLUdEUFIvc3JjL2Nvb2tpZWNvbnNlbnQuanMiLCJEOi93b3Jrc3BhY2UvR2l0aHViL0lDR0MtQ29va2llLUdEUFIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiRDovd29ya3NwYWNlL0dpdGh1Yi9JQ0dDLUNvb2tpZS1HRFBSL3NyYy9kZWZhdWx0T3B0aW9ucy5qcyIsIkQ6L3dvcmtzcGFjZS9HaXRodWIvSUNHQy1Db29raWUtR0RQUi9zcmMvaW5kZXguanMiLCJEOi93b3Jrc3BhY2UvR2l0aHViL0lDR0MtQ29va2llLUdEUFIvc3JjL3BvcHVwLmpzIiwiRDovd29ya3NwYWNlL0dpdGh1Yi9JQ0dDLUNvb2tpZS1HRFBSL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sYUFBYTs7Y0FPWCwrQkFBUyxDQUFDLElBQUksVUFBVTs7Q0FFL0IsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFVLElBQUksbUJBQWUsQ0FBQyxDQUFDO0NBQ2hFLEFBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7QUFFekIsQUFBQyxFQUFDOztBQUVGLGNBQVEsK0JBQVMsQ0FBQyxJQUFJLFVBQVU7O0NBRS9CLEFBQUMsT0FBTyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQzs7QUFFaEQsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7OztBQU1ELGNBQVEsK0JBQVMs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LEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUM7O0FBRS9FLEFBQUMsRUFBQzs7QUFFRixLQUFRLHFEQUFvQixDQUFDLEtBQUssU0FBUyxNQUFNLFVBQVU7O0NBRTFELEFBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztFQUU5QyxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RCLEFBQUM7RUFDRCxBQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDaEQsQUFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLENBQUMsRUFBRTs7R0FFMUQsQUFBQyxPQUFPLElBQUksQ0FBQzs7RUFFZCxBQUFDLENBQUM7O0NBRUgsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLEtBQUssQ0FBQzs7QUFFZixBQUFDLENBQUMsQ0FFRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjFcIlxufSIsIi8vICAgICAgXG5cInVzZSBzdHJpY3RcIjtcblxuY2xhc3MgQ29va2llTWFuYWdlciB7XG5cblx0LyoqXG5cdCAqIGdldCB0aGUgY29va2llIHZhbHVlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0Q29va2llKG5hbWUgICAgICAgICkge1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0Y29uc3QgdiA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChgKF58OykgPyR7bmFtZX09KFteO10qKSg7fCQpYCk7XG5cdFx0cmV0dXJuIHYgPyB2WzJdIDogbnVsbDtcblxuXHR9XG5cblx0c3RhdGljIGhhc0Nvb2tpZShuYW1lICAgICAgICApIHtcblxuXHRcdHJldHVybiBDb29raWVNYW5hZ2VyLmdldENvb2tpZShuYW1lKSAhPT0gbnVsbDtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgY29va2llIHZhbHVlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGNvb2tpZS5cblx0ICogQHBhcmFtIHtTdHJpbmd9IGRheXMgVGhlIG51bWJlcnMgb2YgZGF5cyB0byBleHBpcmUgdGhlIGNvb2tpZS5cblx0ICovXG5cdHN0YXRpYyBzZXRDb29raWUobmFtZSAgICAgICAgLCB2YWx1ZSAgICAgICAgLCBkYXlzICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkge1xuXG5cdFx0Y29uc3QgZCA9IG5ldyBEYXRlKCk7XG5cdFx0ZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgMjQgKiA2MCAqIDYwICogMTAwMCAqIGRheXMpO1xuXHRcdGxldCBjb29raWUgPSBgJHtuYW1lfT0ke3ZhbHVlfTtleHBpcmVzPSR7ZC50b0dNVFN0cmluZygpfWA7XG5cdFx0aWYgKHBhdGgpIHtcblxuXHRcdFx0Y29va2llICs9IGA7cGF0aD0ke3BhdGh9YDtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGNvb2tpZSArPSBcIjtwYXRoPS9cIjtcblxuXHRcdH1cblx0XHRpZiAoZG9tYWluKSB7XG5cblx0XHRcdGNvb2tpZSArPSBgO2RvbWFpbj0ke2RvbWFpbn1gO1xuXG5cdFx0fVxuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0ZG9jdW1lbnQuY29va2llID0gY29va2llO1xuXG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlIHRoZSBjb29raWVzXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXG5cdCAqL1xuXHRzdGF0aWMgZGVsZXRlQ29va2llKG5hbWUgICAgICAgICwgZG9tYWluICAgICAgICAgLCBwYXRoICAgICAgICAgKSB7XG5cblx0XHR0aGlzLnNldENvb2tpZShuYW1lLCBcIlwiLCAtMSwgZG9tYWluLCBwYXRoKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhbGwgY29va2llc1xuXHQgKiBAcmV0dXJucyB7T2JqZWN0fVxuXHQgKi9cblx0c3RhdGljIGdldEFsbENvb2tpZXMoKSB7XG5cblx0XHRjb25zdCBjb29raWVzID0ge307XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRkb2N1bWVudC5jb29raWUuc3BsaXQoXCI7XCIpLmZvckVhY2goKGl0ZW0pPT57XG5cblx0XHRcdGNvbnN0IGNvb2tpZSA9IGl0ZW0uc3BsaXQoXCI9XCIpO1xuXHRcdFx0Y29va2llc1tjb29raWVbMF1dID0gY29va2llWzFdO1xuXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvb2tpZXM7XG5cblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29va2llTWFuYWdlcjtcbiIsIi8vICAgICAgXG5cInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gcmVxdWlyZShcIi4vZGVmYXVsdE9wdGlvbnNcIik7XG5jb25zdCBjb29raWVNYW5hZ2VyID0gcmVxdWlyZShcIi4vY29va2llTWFuYWdlclwiKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuY29uc3QgUG9wdXAgPSByZXF1aXJlKFwiLi9wb3B1cFwiKTtcblxuY2xhc3MgQ29va2llY29uc2VudCB7XG5cblx0ICAgICAgICAgICAgICBcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zICAgICAgICApIHtcblxuXHRcdHRoaXMuc3RhdHVzID0ge1xuXHRcdFx0ZGVueTogXCJkZW55XCIsXG5cdFx0XHRhbGxvdzogXCJhbGxvd1wiXG5cdFx0fTtcblxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXG5cdFx0dGhpcy5vcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5cblx0XHQvLyBtZXJnZSBpbiB1c2VyIG9wdGlvbnNcblx0XHRpZiAodXRpbC5pc1BsYWluT2JqZWN0KG9wdGlvbnMpKSB7XG5cblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdH1cblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby13YXJuaW5nLWNvbW1lbnRzXG5cdFx0Ly8gVE9ETzogbmF2aWdhdG9yIGFuZCBkb2N1bWVudCBzaG91bGRuJ3QgYmUgdXNlZCBoZXJlXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0dGhpcy5vcHRpb25zLnVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cdFx0dGhpcy5vcHRpb25zLmlzTW9iaWxlID0gdXRpbC5pc01vYmlsZSh0aGlzLm9wdGlvbnMudXNlckFnZW50KTtcblxuXHR9XG5cblx0Y3JlYXRlUG9wdXAoKSB7XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuXHRcdFx0Y29uc3QgcG9wdXAgPSBuZXcgUG9wdXAodGhpcy5vcHRpb25zKTtcblx0XHRcdHBvcHVwLnNldEFsbG93SGFuZGxlcigoKT0+e1xuXG5cdFx0XHRcdHRoaXMuc2V0U3RhdHVzKHRoaXMuc3RhdHVzLmFsbG93KTtcblx0XHRcdFx0cG9wdXAuY2xvc2UoKTtcblxuXHRcdFx0fSk7XG5cblx0XHRcdHBvcHVwLnNldERlbnlIYW5kbGVyKCgpPT57XG5cblx0XHRcdFx0dGhpcy5zZXRTdGF0dXModGhpcy5zdGF0dXMuZGVueSk7XG5cdFx0XHRcdHBvcHVwLmNsb3NlKCk7XG5cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXNvbHZlKHBvcHVwKTtcblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb2tpZSBoYXMgYSB2YWxpZCB2YWx1ZVxuXHRoYXNBbnN3ZXJlZCgpIHtcblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZih0aGlzLmdldFN0YXR1cygpKSA+PSAwO1xuXG5cdH1cblxuXHQvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb2tpZSBpbmRpY2F0ZXMgdGhhdCBjb25zZW50IGhhcyBiZWVuIGdpdmVuXG5cdGhhc0NvbnNlbnRlZCgpIHtcblxuXHRcdGNvbnN0IHZhbCA9IHRoaXMuZ2V0U3RhdHVzKCk7XG5cdFx0cmV0dXJuIHZhbCA9PT0gdGhpcy5zdGF0dXMuYWxsb3c7XG5cblx0fVxuXG5cdHNldFN0YXR1cyhzdGF0dXMpIHtcblxuXHRcdGNvbnN0IGMgPSB0aGlzLm9wdGlvbnMuY29va2llO1xuXHRcdGNvbnN0IHZhbHVlID0gY29va2llTWFuYWdlci5nZXRDb29raWUoYy5uYW1lKTtcblx0XHRjb25zdCBjaG9zZW5CZWZvcmUgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXR1cykuaW5kZXhPZih2YWx1ZSkgPj0gMDtcblxuXHRcdC8vIGlmIGBzdGF0dXNgIGlzIHZhbGlkXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHN0YXR1cykgPj0gMCkge1xuXG5cdFx0XHRjb29raWVNYW5hZ2VyLnNldENvb2tpZShjLm5hbWUsIHN0YXR1cywgYy5leHBpcnlEYXlzLCBjLmRvbWFpbiwgYy5wYXRoKTtcblxuXHRcdFx0dGhpcy5jcmVhdGVDb25maWdCdXR0b24oKTtcblx0XHRcdHRoaXMub3B0aW9ucy5vblN0YXR1c0NoYW5nZS5jYWxsKHRoaXMsIHN0YXR1cywgY2hvc2VuQmVmb3JlKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRoaXMuY2xlYXJTdGF0dXMoKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Z2V0U3RhdHVzKCkge1xuXG5cdFx0cmV0dXJuIGNvb2tpZU1hbmFnZXIuZ2V0Q29va2llKHRoaXMub3B0aW9ucy5jb29raWUubmFtZSk7XG5cblx0fVxuXG5cdGNsZWFyU3RhdHVzKCkge1xuXG5cdFx0Y29uc3QgYyA9IHRoaXMub3B0aW9ucy5jb29raWU7XG5cdFx0Y29va2llTWFuYWdlci5kZWxldGVDb29raWUoYy5uYW1lLCBjLmRvbWFpbiwgYy5wYXRoKTtcblxuXHR9XG5cblx0b25Jbml0KCkge1xuXG5cdFx0aWYgKHRoaXMuaGFzQ29uc2VudGVkKCkpIHtcblxuXHRcdFx0dGhpcy5jcmVhdGVDb25maWdCdXR0b24oKTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y3JlYXRlQ29uZmlnQnV0dG9uKCkge1xuXG5cdFx0Y29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuY29uZmlnQnRuU2VsZWN0b3I7XG5cdFx0aWYgKGlkLnRyaW0oKSAhPT0gXCJcIikge1xuXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IHRoaXMub3B0aW9ucy5jb25maWdCdG47XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2MtY29uZmlnXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLm9uUmVzZXRDb25maWcoKSk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHJlbW92ZUNvbmZpZ0J1dHRvbigpIHtcblxuXHRcdGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLmNvbmZpZ0J0blNlbGVjdG9yO1xuXHRcdGlmIChpZC50cmltKCkgIT09IFwiXCIpIHtcblxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0XHRjb25zdCBidG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWNvbmZpZ1wiKTtcblxuXHRcdFx0aWYgKGJ0bikge1xuXG5cdFx0XHRcdGJ0bi5yZW1vdmUoKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH1cblxuXHRvblJlc2V0Q29uZmlnKCkge1xuXG5cdFx0dGhpcy5yZW1vdmVDb25maWdCdXR0b24oKTtcblx0XHR0aGlzLm9wdGlvbnMub25SZXNldENvbmZpZygpO1xuXG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZWNvbnNlbnQ7XG4iLCIvLyAgICAgIFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IENvb2tpZUNvbnNlbnQgPSByZXF1aXJlKFwiLi9jb29raWVjb25zZW50XCIpO1xuY29uc3QgQ29va2llTWFuYWdlciA9IHJlcXVpcmUoXCIuL2Nvb2tpZU1hbmFnZXJcIik7XG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHRPcHRpb25zXCIpO1xuXG5cbmNsYXNzIENvb2tpZXNJQ0dDIHtcblxuXHQgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5cdC8qKlxuXHQgKiBBIGBDb29raWVzSUNHQ2Agb2JqZWN0IHJlcHJlc2VudHMgdGhlIG9iamVjdCB0aGF0IG1hbmFnZXMgdGhlIGNvb2tpZSBjb25zZW50IHVuZGVyIHRoZSBFdXJvcGVhbiBHRFBSIGxhd1xuXHQgKiBkaXNhYmxpbmcgR29vZ2xlIEFuYWx5dGljcyBjb29raWVzIGlmIG5lZWRlZFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gdGhhdCBzZXRzIHRoZSBjb29raWUuXG5cdCAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gZ2FJZHMgQW4gYXJyYXkgd2l0aCB0aGUgR29vZ2xlIEFuYWx5dGljcyBpZHNcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwgb3B0aW9uc1xuXHQgKiBAZXhhbXBsZVxuXHQgKiB2YXIgY29va2llcyA9IG5ldyBDb29raWVzSUNHQyhcInd3dy5pbnN0YW1hcHMuY2F0XCIsIFtcIlVBLTEyMzQ1Njc4LTFcIl0sIHtwb3NpdGlvbjogXCJ0b3BcIiwgY29udGVudCB7IG1lc3NhZ2U6IFwiVm9scyBjb29raWVzP1wiIH19KTtcblx0ICovXG5cdGNvbnN0cnVjdG9yKGRvbWFpbiAgICAgICAgLCBnYUlkcyAgICAgICAgICAgICAgICwgb3B0aW9ucyAgICAgICAgICkge1xuXG5cdFx0Y29uc3QgbWFpbk9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRtYWluT3B0aW9ucy5jb29raWUuZG9tYWluID0gZG9tYWluO1xuXHRcdG1haW5PcHRpb25zLm9uSW5pdGlhbGlzZSA9ICgpID0+IHtcblxuXHRcdFx0dGhpcy5vbkluaXQoKTtcblxuXHRcdH07XG5cdFx0bWFpbk9wdGlvbnMub25TdGF0dXNDaGFuZ2UgPSAoKSA9PiB7XG5cblx0XHRcdHRoaXMub25DaGFuZ2UoKTtcblxuXHRcdH07XG5cdFx0bWFpbk9wdGlvbnMub25SZXNldENvbmZpZyA9ICAoKSA9PiB7XG5cblx0XHRcdHRoaXMub25SZXNldENvbmZpZygpO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuYXJlQ29va2llc0VuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLmdhRGlzYWJsZVByZWZpeCA9IFwiZ2EtZGlzYWJsZS1cIjtcblx0XHR0aGlzLmdhSWRzID0gZ2FJZHM7XG5cdFx0dGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIgPSBudWxsO1xuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IG51bGw7XG5cdFx0dGhpcy5jb29raWVDb25zZW50ID0gbmV3IENvb2tpZUNvbnNlbnQobWFpbk9wdGlvbnMpO1xuXG5cdFx0dGhpcy5vbkluaXQoKTtcblxuXHRcdGlmICghdGhpcy5oYXNBbnN3ZXJlZCgpKSB7XG5cblx0XHRcdHRoaXMuY29va2llQ29uc2VudC5jcmVhdGVQb3B1cCgpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5jb29raWVDb25zZW50LmNyZWF0ZUNvbmZpZ0J1dHRvbigpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIGNvb2tpZSBjb25zZW50IGhhcyBiZWVuIGluaXRpYWxpemVkLlxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBjb29raWVzIGRlcGVuZGluZyBvbiBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkIG9yIG5vdFxuXHQgKi9cblx0b25Jbml0KCkge1xuXG5cdFx0aWYgKHRoaXMuaGFzQ29uc2VudGVkKCkpIHtcblxuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLmRpc2FibGVDb29raWVzKCk7XG5cblx0XHR9XG5cblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQub25Jbml0KCk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbnNlbnQgc3RhdHVzIGhhcyBjaGFuZ2VkLlxuXHQgKiBFbmFibGVzIHRoZSBjb29raWVzIGlmIG5lZWRlZFxuXHQgKi9cblx0b25DaGFuZ2UoKSB7XG5cblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xuXG5cdFx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwidHJ1ZVwiLCAzNjUpO1xuXHRcdFx0dGhpcy5lbmFibGVDb29raWVzKCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLmRpc2FibGVDb29raWVzKCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbmZpZyBoYXMgYmVlbiByZXNldC5cblx0ICogRGlzYWJsZXMgdGhlIGNvb2tpZXNcblx0ICovXG5cdG9uUmVzZXRDb25maWcoKSB7XG5cblx0XHR0aGlzLmRlbGV0ZUNvb2tpZXMoKTtcblx0XHR0aGlzLmNvb2tpZUNvbnNlbnQuY3JlYXRlUG9wdXAoKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzQ29uc2VudGVkKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuY29va2llQ29uc2VudC5oYXNDb25zZW50ZWQoKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgdXNlciBoYXMgYW5zd2VyZWRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRoYXNBbnN3ZXJlZCgpIHtcblxuXHRcdHJldHVybiB0aGlzLmNvb2tpZUNvbnNlbnQuaGFzQW5zd2VyZWQoKTtcblxuXHR9XG5cblx0c2V0Q29va2llc0VuYWJsZUhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XG5cblx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xuXG5cdH1cblxuXHRlbmFibGVDb29raWVzKCkge1xuXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IHRydWU7XG5cdFx0dGhpcy5lbmFibGVHQSgpO1xuXG5cdFx0aWYgKHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKSB7XG5cblx0XHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyKCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNldENvb2tpZXNEaXNhYmxlZEhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XG5cblx0XHR0aGlzLmNvb2tpZXNEaXNhYmxlZEhhbmRsZXIgPSBjYWxsYmFjaztcblxuXHR9XG5cblx0ZGVsZXRlQ29va2llcygpIHtcblxuXHRcdGNvbnN0IGFjdGl2ZUNvb2tpZXMgPSBDb29raWVNYW5hZ2VyLmdldEFsbENvb2tpZXMoKTtcblx0XHRPYmplY3Qua2V5cyhhY3RpdmVDb29raWVzKS5mb3JFYWNoKFxuXHRcdFx0KGl0ZW0pID0+IHtcblxuXHRcdFx0XHRDb29raWVNYW5hZ2VyLmRlbGV0ZUNvb2tpZShpdGVtKTtcblxuXHRcdFx0fVxuXHRcdCk7XG5cblx0fVxuXG5cdGRpc2FibGVDb29raWVzKCkge1xuXG5cdFx0dGhpcy5kaXNhYmxlR0EoKTtcblxuXHRcdHRoaXMuYXJlQ29va2llc0VuYWJsZWQgPSBmYWxzZTtcblxuXHRcdGlmICh0aGlzLmNvb2tpZXNEaXNhYmxlZEhhbmRsZXIpIHtcblxuXHRcdFx0dGhpcy5jb29raWVzRGlzYWJsZWRIYW5kbGVyKCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGFyZUNvb2tpZXNFbmFibGVkKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuYXJlQ29va2llc0VuYWJsZWQ7XG5cblx0fVxuXG5cdGVuYWJsZUdBKCkge1xuXG5cdFx0dGhpcy5jaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQoZmFsc2UpO1xuXG5cdFx0Q29va2llTWFuYWdlci5zZXRDb29raWUoXCJnYUVuYWJsZVwiLCBcInRydWVcIiwgMzY1KTtcblxuXHR9XG5cblx0ZGlzYWJsZUdBKCkge1xuXG5cdFx0dGhpcy5jaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQodHJ1ZSk7XG5cblx0XHRpZiAoQ29va2llTWFuYWdlci5oYXNDb29raWUoXCJnYUVuYWJsZVwiKSkge1xuXG5cdFx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwiZmFsc2VcIiwgMzY1KTtcblxuXHRcdH1cblxuXHR9XG5cblx0Y2hhbmdlR0FTdGF0dXNUb0Rpc2FibGVkKHNob3VsZERpc2FibGUgICAgICAgICApIHtcblxuXHRcdHRoaXMuZ2FJZHMuZm9yRWFjaChnYUlkID0+IHtcblxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0XHR3aW5kb3dbYCR7dGhpcy5nYURpc2FibGVQcmVmaXh9JHtnYUlkfWBdID0gc2hvdWxkRGlzYWJsZTtcblxuXHRcdH0pO1xuXG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvb2tpZXNJQ0dDO1xuIiwiLy8gICAgICBcblwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQvLyBvcHRpb25hbCAoZXhwZWN0aW5nIGEgSFRNTCBlbGVtZW50KSBpZiBwYXNzZWQsIHRoZSBwb3B1cCBpcyBhcHBlbmRlZCB0byB0aGlzIGVsZW1lbnQuIGRlZmF1bHQgaXMgYGRvY3VtZW50LmJvZHlgXG5cdGNvbnRhaW5lcjogbnVsbCxcblxuXHQvLyBkZWZhdWx0cyBjb29raWUgb3B0aW9ucyAtIGl0IGlzIFJFQ09NTUVOREVEIHRvIHNldCB0aGVzZSB2YWx1ZXMgdG8gY29ycmVzcG9uZCB3aXRoIHlvdXIgc2VydmVyXG5cdGNvb2tpZToge1xuXHRcdC8vIFRoaXMgaXMgdGhlIG5hbWUgb2YgdGhpcyBjb29raWUgLSB5b3UgY2FuIGlnbm9yZSB0aGlzXG5cdFx0bmFtZTogXCJjb29raWVjb25zZW50SUNHQ19zdGF0dXNcIixcblxuXHRcdC8vIFRoaXMgaXMgdGhlIHVybCBwYXRoIHRoYXQgdGhlIGNvb2tpZSAnbmFtZScgYmVsb25ncyB0by4gVGhlIGNvb2tpZSBjYW4gb25seSBiZSByZWFkIGF0IHRoaXMgbG9jYXRpb25cblx0XHRwYXRoOiBcIi9cIixcblxuXHRcdC8vIFRoaXMgaXMgdGhlIGRvbWFpbiB0aGF0IHRoZSBjb29raWUgJ25hbWUnIGJlbG9uZ3MgdG8uIFRoZSBjb29raWUgY2FuIG9ubHkgYmUgcmVhZCBvbiB0aGlzIGRvbWFpbi5cblx0XHQvLyAgLSBHdWlkZSB0byBjb29raWUgZG9tYWlucyAtIGh0dHA6Ly9lcmlrLmlvL2Jsb2cvMjAxNC8wMy8wNC9kZWZpbml0aXZlLWd1aWRlLXRvLWNvb2tpZS1kb21haW5zL1xuXHRcdGRvbWFpbjogXCJmaWxlXCIsXG5cblx0XHQvLyBUaGUgY29va2llcyBleHBpcmUgZGF0ZSwgc3BlY2lmaWVkIGluIGRheXMgKHNwZWNpZnkgLTEgZm9yIG5vIGV4cGlyeSlcblx0XHRleHBpcnlEYXlzOiAzNjUsXG5cdH0sXG5cblx0Ly8gZWFjaCBpdGVtIGRlZmluZXMgdGhlIGlubmVyIHRleHQgZm9yIHRoZSBlbGVtZW50IHRoYXQgaXQgcmVmZXJlbmNlc1xuXHRjb250ZW50OiB7XG5cdFx0aGVhZGVyOiBcIkNvb2tpZXMgdXRpbGl0emFkZXMgYSBsYSB3ZWIhXCIsXG5cdFx0bWVzc2FnZTogXCJVdGlsaXR6ZW0gZ2FsZXRlcyBwZXIgZGlzdGluZ2lyLXZvcyBkJ2FsdHJlcyB1c3VhcmlzIGVuIGVscyBub3N0cmVzIHdlYnMsIHBlciBtaWxsb3JhciBsYSBpbmZvcm1hY2nDsyBpIGVscyBzZXJ2ZWlzIHF1ZSB1cyBvZmVyaW0sIGkgcGVyIGZhY2lsaXRhci12b3MgbCdhY2PDqXMuIFBlciBhIG3DqXMgaW5mb3JtYWNpw7MsIGNvbnN1bHRldSBsYSBcIixcblx0XHRhbGxvdzogXCJBY2NlcHRhclwiLFxuXHRcdGRlbnk6IFwiUmVidXRqYXJcIixcblx0XHRsaW5rOiBcInBvbMOtdGljYSBkZSBnYWxldGVzXCIsXG5cdFx0aHJlZjogXCJodHRwOi8vd3d3LmljZ2MuY2F0L0wtSUNHQy9Tb2JyZS1sLUlDR0MvUG9saXRpcXVlcy9Qb2xpdGljYS1kZS1wcm90ZWNjaW8tZGUtZGFkZXMtcGVyc29uYWxzL1BvbGl0aWNhLWRlLWdhbGV0ZXMtY29va2llc1wiLFxuXHRcdGNsb3NlOiBcIiYjeDI3NGM7XCIsXG5cdH0sXG5cblx0Ly8gVGhpcyBpcyB0aGUgSFRNTCBmb3IgdGhlIGVsZW1lbnRzIGFib3ZlLiBUaGUgc3RyaW5nIHt7aGVhZGVyfX0gd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBlcXVpdmFsZW50IHRleHQgYmVsb3cuXG5cdC8vIFlvdSBjYW4gcmVtb3ZlIFwie3toZWFkZXJ9fVwiIGFuZCB3cml0ZSB0aGUgY29udGVudCBkaXJlY3RseSBpbnNpZGUgdGhlIEhUTUwgaWYgeW91IHdhbnQuXG5cdC8vXG5cdC8vICAtIEFSSUEgcnVsZXMgc3VnZ2VzdCB0byBlbnN1cmUgY29udHJvbHMgYXJlIHRhYmJhYmxlIChzbyB0aGUgYnJvd3NlciBjYW4gZmluZCB0aGUgZmlyc3QgY29udHJvbCksXG5cdC8vICAgIGFuZCB0byBzZXQgdGhlIGZvY3VzIHRvIHRoZSBmaXJzdCBpbnRlcmFjdGl2ZSBjb250cm9sIChodHRwOi8vdzNjLmdpdGh1Yi5pby9hcmlhLWluLWh0bWwvKVxuXHRlbGVtZW50czoge1xuXHRcdGhlYWRlcjogXCI8c3BhbiBjbGFzcz1cXFwiY2MtaGVhZGVyXFxcIj57e2hlYWRlcn19PC9zcGFuPiZuYnNwO1wiLFxuXHRcdG1lc3NhZ2U6IFwiPHNwYW4gaWQ9XFxcImNvb2tpZWNvbnNlbnQ6ZGVzY1xcXCIgY2xhc3M9XFxcImNjLW1lc3NhZ2VcXFwiPnt7bWVzc2FnZX19PC9zcGFuPlwiLFxuXHRcdG1lc3NhZ2VsaW5rOiBcIjxzcGFuIGlkPVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy1tZXNzYWdlXFxcIj57e21lc3NhZ2V9fSA8YSBhcmlhLWxhYmVsPVxcXCJsZWFybiBtb3JlIGFib3V0IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtbGlua1xcXCIgaHJlZj1cXFwie3tocmVmfX1cXFwiIHJlbD1cXFwibm9vcGVuZXIgbm9yZWZlcnJlciBub2ZvbGxvd1xcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPnt7bGlua319PC9hPjwvc3Bhbj5cIixcblx0XHRhbGxvdzogXCI8YSBhcmlhLWxhYmVsPVxcXCJhbGxvdyBjb29raWVzXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgIGNsYXNzPVxcXCJjYy1idG4gY2MtYWxsb3dcXFwiPnt7YWxsb3d9fTwvYT5cIixcblx0XHRkZW55OiBcIjxhIGFyaWEtbGFiZWw9XFxcImRlbnkgY29va2llc1xcXCIgcm9sZT1idXR0b24gdGFiaW5kZXg9XFxcIjBcXFwiIGNsYXNzPVxcXCJjYy1idG4gY2MtZGVueVxcXCI+e3tkZW55fX08L2E+XCIsXG5cdFx0bGluazogXCI8YSBhcmlhLWxhYmVsPVxcXCJsZWFybiBtb3JlIGFib3V0IGNvb2tpZXNcXFwiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVxcXCIwXFxcIiBjbGFzcz1cXFwiY2MtbGlua1xcXCIgaHJlZj1cXFwie3tocmVmfX1cXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj57e2xpbmt9fTwvYT5cIixcblx0XHRjbG9zZTogXCI8c3BhbiBhcmlhLWxhYmVsPVxcXCJkaXNtaXNzIGNvb2tpZSBtZXNzYWdlXFxcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cXFwiMFxcXCIgY2xhc3M9XFxcImNjLWNsb3NlXFxcIj57e2Nsb3NlfX08L3NwYW4+XCIsXG5cdH0sXG5cblx0Ly8gVGhlIHBsYWNlaG9sZGVycyB7e2NsYXNzZXN9fSBhbmQge3tjaGlsZHJlbn19IGJvdGggZ2V0IHJlcGxhY2VkIGR1cmluZyBpbml0aWFsaXNhdGlvbjpcblx0Ly8gIC0ge3tjbGFzc2VzfX0gaXMgd2hlcmUgYWRkaXRpb25hbCBjbGFzc2VzIGdldCBhZGRlZFxuXHQvLyAgLSB7e2NoaWxkcmVufX0gaXMgd2hlcmUgdGhlIEhUTUwgY2hpbGRyZW4gYXJlIHBsYWNlZFxuXHR3aW5kb3c6IFwiPGRpdiByb2xlPVxcXCJkaWFsb2dcXFwiIGFyaWEtbGl2ZT1cXFwicG9saXRlXFxcIiBhcmlhLWxhYmVsPVxcXCJjb29raWVjb25zZW50XFxcIiBhcmlhLWRlc2NyaWJlZGJ5PVxcXCJjb29raWVjb25zZW50OmRlc2NcXFwiIGNsYXNzPVxcXCJjYy13aW5kb3cge3tjbGFzc2VzfX1cXFwiPjwhLS1nb29nbGVvZmY6IGFsbC0tPnt7Y2hpbGRyZW59fTwhLS1nb29nbGVvbjogYWxsLS0+PC9kaXY+XCIsXG5cblx0Ly8gVGhpcyBpcyB0aGUgaHRtbCBmb3IgdGhlIGNvbmZpZyBidXR0b24uIFRoaXMgb25seSBzaG93cyB1cCBhZnRlciB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgdGhlaXIgbGV2ZWwgb2YgY29uc2VudFxuXHQvLyBJdCBtdXN0IGluY2x1ZGUgdGhlIGNjLWNvbmZpZyBjbGFzc1xuXHRjb25maWdCdG46IFwiPGRpdiBjbGFzcz1cXFwiY2MtY29uZmlnIHt7Y2xhc3Nlc319XFxcIj5Db25maWd1cmFyIGNvb2tpZXM8L2Rpdj5cIixcblxuXHQvLyBUaGlzIGlzIHRoZSBlbGVtZW50IHNlbGVjdG9yIHdoZXJlIHRoZSBjb25maWcgYnV0dG9uIHdpbGwgYmUgYWRkZWRcblx0Y29uZmlnQnRuU2VsZWN0b3I6IFwiXCIsXG5cblx0Ly8gZGVmaW5lIHR5cGVzIG9mICdjb21wbGlhbmNlJyBoZXJlLiAne3t2YWx1ZX19JyBzdHJpbmdzIGluIGhlcmUgYXJlIGxpbmtlZCB0byBgZWxlbWVudHNgXG5cdGNvbXBsaWFuY2U6IFwiPGRpdiBjbGFzcz1cXFwiY2MtY29tcGxpYW5jZSBjYy1oaWdobGlnaHRcXFwiPnt7ZGVueX19e3thbGxvd319PC9kaXY+XCIsXG5cblx0Ly8gZGVmaW5lIGxheW91dCBsYXlvdXRzIGhlcmVcblx0bGF5b3V0czoge1xuXHRcdC8vIHRoZSAnYmxvY2snIGxheW91dCB0ZW5kIHRvIGJlIGZvciBzcXVhcmUgZmxvYXRpbmcgcG9wdXBzXG5cdFx0XCJiYXNpY1wiOiBcInt7bWVzc2FnZWxpbmt9fXt7Y29tcGxpYW5jZX19XCIsXG5cdFx0XCJiYXNpYy1jbG9zZVwiOiBcInt7bWVzc2FnZWxpbmt9fXt7Y29tcGxpYW5jZX19e3tjbG9zZX19XCIsXG5cdFx0XCJiYXNpYy1oZWFkZXJcIjogXCJ7e2hlYWRlcn19e3ttZXNzYWdlfX17e2xpbmt9fXt7Y29tcGxpYW5jZX19XCIsXG5cdH0sXG5cblx0Ly8gZGVmYXVsdCBsYXlvdXQgKHNlZSBhYm92ZSlcblx0bGF5b3V0OiBcImJhc2ljXCIsXG5cblx0Ly8gdGhpcyByZWZlcnMgdG8gdGhlIHBvcHVwIHdpbmRvd3MgcG9zaXRpb24uIHdlIGN1cnJlbnRseSBzdXBwb3J0OlxuXHQvLyAgLSBiYW5uZXIgcG9zaXRpb25zOiB0b3AsIGJvdHRvbVxuXHQvLyAgLSBmbG9hdGluZyBwb3NpdGlvbnM6IHRvcC1sZWZ0LCB0b3AtcmlnaHQsIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHRcblx0Ly9cblx0Ly8gYWRkcyBhIGNsYXNzIGBjYy1mbG9hdGluZ2Agb3IgYGNjLWJhbm5lcmAgd2hpY2ggaGVscHMgd2hlbiBzdHlsaW5nXG5cdHBvc2l0aW9uOiBcImJvdHRvbVwiLCAvLyBkZWZhdWx0IHBvc2l0aW9uIGlzICdib3R0b20nXG5cblx0Ly8gQXZhaWxhYmxlIHN0eWxlc1xuXHQvLyAgICAtYmxvY2sgKGRlZmF1bHQsIG5vIGV4dHJhIGNsYXNzZXMpXG5cdC8vICAgIC1lZGdlbGVzc1xuXHQvLyAgICAtY2xhc3NpY1xuXHQvLyB1c2UgeW91ciBvd24gc3R5bGUgbmFtZSBhbmQgdXNlIGAuY2MtdGhlbWUtU1RZTEVOQU1FYCBjbGFzcyBpbiBDU1MgdG8gZWRpdC5cblx0Ly8gTm90ZTogc3R5bGUgXCJ3aXJlXCIgaXMgdXNlZCBmb3IgdGhlIGNvbmZpZ3VyYXRvciwgYnV0IGhhcyBubyBDU1Mgc3R5bGVzIG9mIGl0cyBvd24sIG9ubHkgcGFsZXR0ZSBpcyB1c2VkLlxuXHR0aGVtZTogXCJibG9ja1wiLFxuXG5cdC8vIGlmIHlvdSB3YW50IGN1c3RvbSBjb2xvdXJzLCBwYXNzIHRoZW0gaW4gaGVyZS4gdGhpcyBvYmplY3Qgc2hvdWxkIGxvb2sgbGlrZSB0aGlzLlxuXHQvLyBpZGVhbGx5LCBhbnkgY3VzdG9tIGNvbG91cnMvdGhlbWVzIHNob3VsZCBiZSBjcmVhdGVkIGluIGEgc2VwYXJhdGUgc3R5bGUgc2hlZXQsIGFzIHRoaXMgaXMgbW9yZSBlZmZpY2llbnQuXG5cdC8vICAge1xuXHQvLyAgICAgcG9wdXA6IHtiYWNrZ3JvdW5kOiAnIzAwMDAwMCcsIHRleHQ6ICcjZmZmJywgbGluazogJyNmZmYnfSxcblx0Ly8gICAgIGJ1dHRvbjoge2JhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnI2Y4ZTcxYyd9LFxuXHQvLyAgICAgaGlnaGxpZ2h0OiB7YmFja2dyb3VuZDogJyNmOGU3MWMnLCBib3JkZXI6ICcjZjhlNzFjJywgdGV4dDogJyMwMDAwMDAnfSxcblx0Ly8gICB9XG5cdC8vIGBoaWdobGlnaHRgIGlzIG9wdGlvbmFsIGFuZCBleHRlbmRzIGBidXR0b25gLiBpZiBpdCBleGlzdHMsIGl0IHdpbGwgYXBwbHkgdG8gdGhlIGZpcnN0IGJ1dHRvblxuXHQvLyBvbmx5IGJhY2tncm91bmQgbmVlZHMgdG8gYmUgZGVmaW5lZCBmb3IgZXZlcnkgZWxlbWVudC4gaWYgbm90IHNldCwgb3RoZXIgY29sb3JzIGNhbiBiZSBjYWxjdWxhdGVkIGZyb20gaXRcblx0cGFsZXR0ZTp7XG5cdFx0cG9wdXA6IHtiYWNrZ3JvdW5kOiBcIiMyMjIyMjJcIn0sXG5cdFx0YnV0dG9uOiB7YmFja2dyb3VuZDogXCIjMDBiMDUwXCJ9XG5cdH0sXG59O1xuIiwiLy8gICAgICBcblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCB2ZXJzaW9uICAgICAgICAgPSByZXF1aXJlKFwiLi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb247XG5jb25zdCBDb29raWVzSUNHQyA9IHJlcXVpcmUoXCIuL2Nvb2tpZXNJY2djXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dmVyc2lvbixcblx0Q29va2llc0lDR0Ncbn07XG5cbi8qKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIHByb2plY3QgaW4gdXNlIGFzIHNwZWNpZmllZCBpbiBgcGFja2FnZS5qc29uYCxcbiAqIGBDSEFOR0VMT0cubWRgLCBhbmQgdGhlIEdpdEh1YiByZWxlYXNlLlxuICpcbiAqIEB2YXIge3N0cmluZ30gdmVyc2lvblxuICovXG4iLCIvLyAgICAgIFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5jbGFzcyBQb3B1cCB7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICBcblx0ICAgICAgICAgICAgICAgICAgICAgIFxuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICwgc3RhdHVzTGlzdCAgICAgICAgKSB7XG5cblx0XHR0aGlzLnN0YXR1c0xpc3QgPSBzdGF0dXNMaXN0O1xuXHRcdHRoaXMuYWxsb3dIYW5kbGVyID0gbnVsbDtcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gbnVsbDtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnMpIHtcblxuXHRcdFx0dGhpcy5kZXN0cm95KCk7IC8vIGFscmVhZHkgcmVuZGVyZWRcblxuXHRcdH1cblxuXHRcdC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuXHRcdC8vIHRoZSBmdWxsIG1hcmt1cCBlaXRoZXIgY29udGFpbnMgdGhlIHdyYXBwZXIgb3IgaXQgZG9lcyBub3QgKGZvciBtdWx0aXBsZSBpbnN0YW5jZXMpXG5cdFx0Y29uc3QgY29va2llUG9wdXAgPSB0aGlzLm9wdGlvbnMud2luZG93LnJlcGxhY2UoXCJ7e2NsYXNzZXN9fVwiLCB0aGlzLmdldFBvcHVwQ2xhc3NlcygpLmpvaW4oXCIgXCIpKVxuXHRcdFx0LnJlcGxhY2UoXCJ7e2NoaWxkcmVufX1cIiwgdGhpcy5nZXRQb3B1cElubmVyTWFya3VwKCkpO1xuXG5cdFx0dGhpcy5lbGVtZW50ID0gdGhpcy5hcHBlbmRNYXJrdXAoY29va2llUG9wdXApO1xuXG5cdFx0dGhpcy5vcGVuKCk7XG5cblx0fVxuXG5cdGRlc3Ryb3koKSB7XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmFsbG93SGFuZGxlcik7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1kZW55XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlbnlIYW5kbGVyKTtcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IG51bGw7XG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IG51bGw7XG5cblx0XHRpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKSB7XG5cblx0XHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XG5cblx0XHR9XG5cdFx0dGhpcy5lbGVtZW50ID0gbnVsbDtcblxuXHRcdHRoaXMub3B0aW9ucyA9IG51bGw7XG5cblx0fVxuXG5cdG9wZW4oKSB7XG5cblx0XHRpZiAoIXRoaXMuZWxlbWVudCkge1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuaXNPcGVuKCkpIHtcblxuXHRcdFx0dGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuXG5cdFx0XHR1dGlsLnJlbW92ZUNsYXNzKHRoaXMuZWxlbWVudCwgXCJjYy1pbnZpc2libGVcIik7XG5cblx0XHRcdGlmICh0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4pIHtcblxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cE9wZW4oKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdGNsb3NlKCkge1xuXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaXNPcGVuKCkpIHtcblxuXHRcdFx0dGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5vblBvcHVwQ2xvc2UpIHtcblxuXHRcdFx0XHR0aGlzLm9wdGlvbnMub25Qb3B1cENsb3NlKCk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRpc09wZW4oKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSBcIlwiICYmICF1dGlsLmhhc0NsYXNzKHRoaXMuZWxlbWVudCwgXCJjYy1pbnZpc2libGVcIik7XG5cblx0fVxuXG5cdGdldFBvc2l0aW9uQ2xhc3NlcygpIHtcblxuXHRcdGNvbnN0IHBvc2l0aW9ucyA9IHRoaXMub3B0aW9ucy5wb3NpdGlvbi5zcGxpdChcIi1cIik7IC8vIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodFxuXHRcdGNvbnN0IGNsYXNzZXMgPSBbXTtcblxuXHRcdC8vIHRvcCwgbGVmdCwgcmlnaHQsIGJvdHRvbVxuXHRcdHBvc2l0aW9ucy5mb3JFYWNoKChjdXIpID0+IHtcblxuXHRcdFx0Y2xhc3Nlcy5wdXNoKGBjYy0ke2N1cn1gKTtcblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGNsYXNzZXM7XG5cblx0fVxuXG5cdGdldFBvcHVwQ2xhc3NlcygpIHtcblxuXHRcdGNvbnN0IG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cdFx0bGV0IHBvc2l0aW9uU3R5bGUgPSAob3B0cy5wb3NpdGlvbiA9PT0gXCJ0b3BcIiB8fCBvcHRzLnBvc2l0aW9uID09PSBcImJvdHRvbVwiKSA/IFwiYmFubmVyXCIgOiBcImZsb2F0aW5nXCI7XG5cblx0XHRpZiAob3B0cy5pc01vYmlsZSkge1xuXG5cdFx0XHRwb3NpdGlvblN0eWxlID0gXCJmbG9hdGluZ1wiO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtcblx0XHRcdGBjYy0ke3Bvc2l0aW9uU3R5bGV9YCwgLy8gZmxvYXRpbmcgb3IgYmFubmVyXG5cdFx0XHRcImNjLXR5cGUtb3B0LWluXCIsIC8vIGFkZCB0aGUgY29tcGxpYW5jZSB0eXBlXG5cdFx0XHRgY2MtdGhlbWUtJHtvcHRzLnRoZW1lfWAsIC8vIGFkZCB0aGUgdGhlbWVcblx0XHRdO1xuXG5cdFx0aWYgKG9wdHMuc3RhdGljKSB7XG5cblx0XHRcdGNsYXNzZXMucHVzaChcImNjLXN0YXRpY1wiKTtcblxuXHRcdH1cblxuXHRcdGNsYXNzZXMucHVzaC5hcHBseShjbGFzc2VzLCB0aGlzLmdldFBvc2l0aW9uQ2xhc3NlcygpKTtcblxuXHRcdC8vIHdlIG9ubHkgYWRkIGV4dHJhIHN0eWxlcyBpZiBgcGFsZXR0ZWAgaGFzIGJlZW4gc2V0IHRvIGEgdmFsaWQgdmFsdWVcblx0XHR0aGlzLmF0dGFjaEN1c3RvbVBhbGV0dGUodGhpcy5vcHRpb25zLnBhbGV0dGUpO1xuXG5cdFx0Ly8gaWYgd2Ugb3ZlcnJpZGUgdGhlIHBhbGV0dGUsIGFkZCB0aGUgY2xhc3MgdGhhdCBlbmFibGVzIHRoaXNcblx0XHRpZiAodGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKSB7XG5cblx0XHRcdGNsYXNzZXMucHVzaCh0aGlzLmN1c3RvbVN0eWxlU2VsZWN0b3IpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXM7XG5cblx0fVxuXG5cdGdldFBvcHVwSW5uZXJNYXJrdXAoKSB7XG5cblx0XHRjb25zdCBpbnRlcnBvbGF0ZWQgPSB7fTtcblx0XHRjb25zdCBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0T2JqZWN0LmtleXMob3B0cy5lbGVtZW50cykuZm9yRWFjaCgocHJvcCkgPT4ge1xuXG5cdFx0XHRpbnRlcnBvbGF0ZWRbcHJvcF0gPSB1dGlsLmludGVycG9sYXRlU3RyaW5nKG9wdHMuZWxlbWVudHNbcHJvcF0sIChuYW1lKSA9PiB7XG5cblx0XHRcdFx0Y29uc3Qgc3RyID0gb3B0cy5jb250ZW50W25hbWVdO1xuXHRcdFx0XHRyZXR1cm4gKG5hbWUgJiYgdHlwZW9mIHN0ciA9PSBcInN0cmluZ1wiICYmIHN0ci5sZW5ndGgpID8gc3RyIDogXCJcIjtcblxuXHRcdFx0fSk7XG5cblx0XHR9KTtcblxuXHRcdC8vIGNoZWNrcyBpZiB0aGUgdHlwZSBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gaW5mbyBpZiBpdCdzIG5vdFxuXHRcdGNvbnN0IGNvbXBsaWFuY2VUeXBlID0gb3B0cy5jb21wbGlhbmNlO1xuXG5cdFx0Ly8gYnVpbGQgdGhlIGNvbXBsaWFuY2UgdHlwZXMgZnJvbSB0aGUgYWxyZWFkeSBpbnRlcnBvbGF0ZWQgYGVsZW1lbnRzYFxuXHRcdGludGVycG9sYXRlZC5jb21wbGlhbmNlID0gdXRpbC5pbnRlcnBvbGF0ZVN0cmluZyhjb21wbGlhbmNlVHlwZSwgKG5hbWUpID0+IHtcblxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFtuYW1lXTtcblxuXHRcdH0pO1xuXG5cdFx0Ly8gY2hlY2tzIGlmIHRoZSBsYXlvdXQgaXMgdmFsaWQgYW5kIGRlZmF1bHRzIHRvIGJhc2ljIGlmIGl0J3Mgbm90XG5cdFx0bGV0IGxheW91dCA9IG9wdHMubGF5b3V0c1tvcHRzLmxheW91dF07XG5cdFx0aWYgKCFsYXlvdXQpIHtcblxuXHRcdFx0bGF5b3V0ID0gb3B0cy5sYXlvdXRzLmJhc2ljO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHV0aWwuaW50ZXJwb2xhdGVTdHJpbmcobGF5b3V0LCAobWF0Y2gpID0+IHtcblxuXHRcdFx0cmV0dXJuIGludGVycG9sYXRlZFttYXRjaF07XG5cblx0XHR9KTtcblxuXHR9XG5cblx0YXBwZW5kTWFya3VwKG1hcmt1cCkge1xuXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHRcdGNvbnN0IGNvbnQgPSAob3B0cy5jb250YWluZXIgJiYgb3B0cy5jb250YWluZXIubm9kZVR5cGUgPT09IDEpID8gb3B0cy5jb250YWluZXIgOiBkb2N1bWVudC5ib2R5O1xuXG5cdFx0ZGl2LmlubmVySFRNTCA9IG1hcmt1cDtcblxuXHRcdGNvbnN0IGVsID0gZGl2LmNoaWxkcmVuWzBdO1xuXG5cdFx0ZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG5cdFx0aWYgKHV0aWwuaGFzQ2xhc3MoZWwsIFwiY2Mtd2luZG93XCIpKSB7XG5cblx0XHRcdHV0aWwuYWRkQ2xhc3MoZWwsIFwiY2MtaW52aXNpYmxlXCIpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCFjb250LmZpcnN0Q2hpbGQpIHtcblxuXHRcdFx0Y29udC5hcHBlbmRDaGlsZChlbCk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRjb250Lmluc2VydEJlZm9yZShlbCwgY29udC5maXJzdENoaWxkKTtcblxuXHRcdH1cblxuXG5cdFx0cmV0dXJuIGVsO1xuXG5cdH1cblxuXHRzZXRBbGxvd0hhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKSB7XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmFsbG93SGFuZGxlcik7XG5cdFx0dGhpcy5hbGxvd0hhbmRsZXIgPSBjYWxsYmFjaztcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNjLWFsbG93XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0fVxuXG5cdHNldERlbnlIYW5kbGVyKGNhbGxiYWNrICAgICAgICAgICkge1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1kZW55XCIpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmRlbnlIYW5kbGVyKTtcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gY2FsbGJhY2s7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYy1kZW55XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0fVxuXG5cdC8vIEkgbWlnaHQgY2hhbmdlIHRoaXMgZnVuY3Rpb24gdG8gdXNlIGlubGluZSBzdHlsZXMuIEkgb3JpZ2luYWxseSBjaG9zZSBhIHN0eWxlc2hlZXQgYmVjYXVzZSBJIGNvdWxkIHNlbGVjdCBtYW55IGVsZW1lbnRzIHdpdGggYVxuXHQvLyBzaW5nbGUgcnVsZSAoc29tZXRoaW5nIHRoYXQgaGFwcGVuZWQgYSBsb3QpLCB0aGUgYXBwcyBoYXMgY2hhbmdlZCBzbGlnaHRseSBub3cgdGhvdWdoLCBzbyBpbmxpbmUgc3R5bGVzIG1pZ2h0IGJlIG1vcmUgYXBwbGljYWJsZS5cblx0YXR0YWNoQ3VzdG9tUGFsZXR0ZShwYWxldHRlKSB7XG5cblx0XHRjb25zdCBoYXNoID0gdXRpbC5oYXNoKEpTT04uc3RyaW5naWZ5KHBhbGV0dGUpKTtcblx0XHRjb25zdCBzZWxlY3RvciA9IGBjYy1jb2xvci1vdmVycmlkZS0ke2hhc2h9YDtcblx0XHRjb25zdCBpc1ZhbGlkID0gdXRpbC5pc1BsYWluT2JqZWN0KHBhbGV0dGUpO1xuXG5cdFx0dGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yID0gaXNWYWxpZCA/IHNlbGVjdG9yIDogbnVsbDtcblxuXHRcdGlmIChpc1ZhbGlkKSB7XG5cblx0XHRcdHRoaXMuYWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgYC4ke3NlbGVjdG9yfWApO1xuXG5cdFx0fVxuXHRcdHJldHVybiBpc1ZhbGlkO1xuXG5cdH1cblxuXHRhZGRDdXN0b21TdHlsZShoYXNoLCBwYWxldHRlLCBwcmVmaXgpIHtcblxuXHRcdGNvbnN0IGNvbG9yU3R5bGVzID0ge307XG5cdFx0Y29uc3QgcG9wdXAgPSBwYWxldHRlLnBvcHVwO1xuXHRcdGNvbnN0IGJ1dHRvbiA9IHBhbGV0dGUuYnV0dG9uO1xuXHRcdGNvbnN0IGhpZ2hsaWdodCA9IHBhbGV0dGUuaGlnaGxpZ2h0O1xuXG5cdFx0Ly8gbmVlZHMgYmFja2dyb3VuZCBjb2xvdXIsIHRleHQgYW5kIGxpbmsgd2lsbCBiZSBzZXQgdG8gYmxhY2svd2hpdGUgaWYgbm90IHNwZWNpZmllZFxuXHRcdGlmIChwb3B1cCkge1xuXG5cdFx0XHQvLyBhc3N1bWVzIHBvcHVwLmJhY2tncm91bmQgaXMgc2V0XG5cdFx0XHRwb3B1cC50ZXh0ID0gcG9wdXAudGV4dCA/IHBvcHVwLnRleHQgOiB1dGlsLmdldENvbnRyYXN0KHBvcHVwLmJhY2tncm91bmQpO1xuXHRcdFx0cG9wdXAubGluayA9IHBvcHVwLmxpbmsgPyBwb3B1cC5saW5rIDogcG9wdXAudGV4dDtcblx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0uY2Mtd2luZG93YF0gPSBbXG5cdFx0XHRcdGBjb2xvcjogJHtwb3B1cC50ZXh0fWAsXG5cdFx0XHRcdGBiYWNrZ3JvdW5kLWNvbG9yOiAke3BvcHVwLmJhY2tncm91bmR9YFxuXHRcdFx0XTtcblx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWxpbmssJHtwcmVmaXh9IC5jYy1saW5rOmFjdGl2ZSwke3ByZWZpeH0gLmNjLWxpbms6dmlzaXRlZGBdID0gW1xuXHRcdFx0XHRgY29sb3I6ICR7cG9wdXAubGlua31gXG5cdFx0XHRdO1xuXG5cdFx0XHRpZiAoYnV0dG9uKSB7XG5cblx0XHRcdFx0Ly8gYXNzdW1lcyBidXR0b24uYmFja2dyb3VuZCBpcyBzZXRcblx0XHRcdFx0YnV0dG9uLnRleHQgPSBidXR0b24udGV4dCA/IGJ1dHRvbi50ZXh0IDogdXRpbC5nZXRDb250cmFzdChidXR0b24uYmFja2dyb3VuZCk7XG5cdFx0XHRcdGJ1dHRvbi5ib3JkZXIgPSBidXR0b24uYm9yZGVyID8gYnV0dG9uLmJvcmRlciA6IFwidHJhbnNwYXJlbnRcIjtcblx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtYnRuYF0gPSBbXG5cdFx0XHRcdFx0YGNvbG9yOiAke2J1dHRvbi50ZXh0fWAsXG5cdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtidXR0b24uYm9yZGVyfWAsXG5cdFx0XHRcdFx0YGJhY2tncm91bmQtY29sb3I6ICR7YnV0dG9uLmJhY2tncm91bmR9YFxuXHRcdFx0XHRdO1xuXG5cdFx0XHRcdGlmIChidXR0b24uYmFja2dyb3VuZCAhPT0gXCJ0cmFuc3BhcmVudFwiKSB7XG5cblx0XHRcdFx0XHRjb2xvclN0eWxlc1tgJHtwcmVmaXh9IC5jYy1idG46aG92ZXIsICR7cHJlZml4fSAuY2MtYnRuOmZvY3VzYF0gPSBbXG5cdFx0XHRcdFx0XHRgYmFja2dyb3VuZC1jb2xvcjogJHt1dGlsLmdldEhvdmVyQ29sb3VyKGJ1dHRvbi5iYWNrZ3JvdW5kKX1gXG5cdFx0XHRcdFx0XTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGhpZ2hsaWdodCkge1xuXG5cdFx0XHRcdC8vYXNzdW1lcyBoaWdobGlnaHQuYmFja2dyb3VuZCBpcyBzZXRcblx0XHRcdFx0XHRoaWdobGlnaHQudGV4dCA9IGhpZ2hsaWdodC50ZXh0ID8gaGlnaGxpZ2h0LnRleHQgOiB1dGlsLmdldENvbnRyYXN0KGhpZ2hsaWdodC5iYWNrZ3JvdW5kKTtcblx0XHRcdFx0XHRoaWdobGlnaHQuYm9yZGVyID0gaGlnaGxpZ2h0LmJvcmRlciA/IGhpZ2hsaWdodC5ib3JkZXIgOiBcInRyYW5zcGFyZW50XCI7XG5cdFx0XHRcdFx0Y29sb3JTdHlsZXNbYCR7cHJlZml4fSAuY2MtaGlnaGxpZ2h0IC5jYy1idG46Zmlyc3QtY2hpbGRgXSA9IFtcblx0XHRcdFx0XHRcdGBjb2xvcjogJHtoaWdobGlnaHQudGV4dH1gLFxuXHRcdFx0XHRcdFx0YGJvcmRlci1jb2xvcjogJHtoaWdobGlnaHQuYm9yZGVyfWAsXG5cdFx0XHRcdFx0XHRgYmFja2dyb3VuZC1jb2xvcjogJHtoaWdobGlnaHQuYmFja2dyb3VuZH1gXG5cdFx0XHRcdFx0XTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIHNldHMgaGlnaGxpZ2h0IHRleHQgY29sb3IgdG8gcG9wdXAgdGV4dC4gYmFja2dyb3VuZCBhbmQgYm9yZGVyIGFyZSB0cmFuc3BhcmVudCBieSBkZWZhdWx0LlxuXHRcdFx0XHRcdGNvbG9yU3R5bGVzW2Ake3ByZWZpeH0gLmNjLWhpZ2hsaWdodCAuY2MtYnRuOmZpcnN0LWNoaWxkYF0gPSBbXG5cdFx0XHRcdFx0XHRgY29sb3I6ICR7cG9wdXAudGV4dH1gXG5cdFx0XHRcdFx0XTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vIHRoaXMgd2lsbCBiZSBpbnRlcnByZXR0ZWQgYXMgQ1NTLiB0aGUga2V5IGlzIHRoZSBzZWxlY3RvciwgYW5kIGVhY2ggYXJyYXkgZWxlbWVudCBpcyBhIHJ1bGVcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcblx0XHRsZXQgcnVsZUluZGV4ID0gLTE7XG5cdFx0Zm9yIChjb25zdCBwcm9wIGluIGNvbG9yU3R5bGVzKSB7XG5cblx0XHRcdHN0eWxlLnNoZWV0Lmluc2VydFJ1bGUoYCR7cHJvcH17JHtjb2xvclN0eWxlc1twcm9wXS5qb2luKFwiO1wiKX19YCwgKytydWxlSW5kZXgpO1xuXG5cdFx0fVxuXG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcHVwO1xuIiwiLy8gICAgICBcblwidXNlIHN0cmljdFwiO1xuXG5jbGFzcyBVdGlsIHtcblxuXHRzdGF0aWMgZXNjYXBlUmVnRXhwKHN0ciAgICAgICAgKSB7XG5cblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcblxuXHR9XG5cblx0c3RhdGljIGhhc0NsYXNzKGVsZW1lbnQgICAgICAgICwgc2VsZWN0b3IgICAgICAgICkge1xuXG5cdFx0Y29uc3QgcyA9IFwiIFwiO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuXHRcdHJldHVybiBlbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxuXHRcdFx0KHMgKyBlbGVtZW50LmNsYXNzTmFtZSArIHMpLnJlcGxhY2UoL1tcXG5cXHRdL2csIHMpLmluZGV4T2YocyArIHNlbGVjdG9yICsgcykgPj0gMDtcblxuXHR9XG5cblx0c3RhdGljIGFkZENsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcblxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lICs9IGAgJHtjbGFzc05hbWV9YDtcblxuXHR9XG5cblx0c3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcblxuXHRcdGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXFxcXGIke1V0aWwuZXNjYXBlUmVnRXhwKGNsYXNzTmFtZSl9XFxcXGJgKTtcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXG5cdH1cblxuXHRzdGF0aWMgaW50ZXJwb2xhdGVTdHJpbmcoc3RyICAgICAgICAsIGNhbGxiYWNrICAgICAgICAgICkge1xuXG5cdFx0Y29uc3QgbWFya2VyID0gL3t7KFthLXpdW2EtejAtOVxcLV9dKil9fS9pZztcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UobWFya2VyLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKGFyZ3VtZW50c1sxXSkgfHwgXCJcIjtcblxuXHRcdH0pO1xuXG5cdH1cblxuXHQvLyBvbmx5IHVzZWQgZm9yIGhhc2hpbmcganNvbiBvYmplY3RzICh1c2VkIGZvciBoYXNoIG1hcHBpbmcgcGFsZXR0ZSBvYmplY3RzLCB1c2VkIHdoZW4gY3VzdG9tIGNvbG91cnMgYXJlIHBhc3NlZCB0aHJvdWdoIEphdmFTY3JpcHQpXG5cdHN0YXRpYyBoYXNoKHN0ciAgICAgICAgKSB7XG5cblx0XHRsZXQgaGFzaCA9IDAsXG5cdFx0XHRpLCBjaHIsIGxlbjtcblx0XHRpZiAoc3RyLmxlbmd0aCA9PT0gMCkge1xuXG5cdFx0XHRyZXR1cm4gaGFzaDtcblxuXHRcdH1cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcblxuXHRcdFx0Y2hyID0gc3RyLmNoYXJDb2RlQXQoaSk7XG5cdFx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaHI7XG5cdFx0XHRoYXNoIHw9IDA7XG5cblx0XHR9XG5cdFx0cmV0dXJuIGhhc2g7XG5cblx0fVxuXG5cdHN0YXRpYyBub3JtYWxpc2VIZXgoaGV4ICAgICAgICApIHtcblxuXHRcdGlmIChoZXhbMF0gPT09IFwiI1wiKSB7XG5cblx0XHRcdGhleCA9IGhleC5zdWJzdHIoMSk7XG5cblx0XHR9XG5cdFx0aWYgKGhleC5sZW5ndGggPT09IDMpIHtcblxuXHRcdFx0aGV4ID0gaGV4WzBdICsgaGV4WzBdICsgaGV4WzFdICsgaGV4WzFdICsgaGV4WzJdICsgaGV4WzJdO1xuXG5cdFx0fVxuXHRcdHJldHVybiBoZXg7XG5cblx0fVxuXG5cdC8vIHVzZWQgdG8gZ2V0IHRleHQgY29sb3JzIGlmIG5vdCBzZXRcblx0c3RhdGljIGdldENvbnRyYXN0KGhleCAgICAgICAgKSB7XG5cblx0XHRoZXggPSBVdGlsLm5vcm1hbGlzZUhleChoZXgpO1xuXHRcdGNvbnN0IHIgPSBwYXJzZUludChoZXguc3Vic3RyKDAsIDIpLCAxNik7XG5cdFx0Y29uc3QgZyA9IHBhcnNlSW50KGhleC5zdWJzdHIoMiwgMiksIDE2KTtcblx0XHRjb25zdCBiID0gcGFyc2VJbnQoaGV4LnN1YnN0cig0LCAyKSwgMTYpO1xuXHRcdGNvbnN0IHlpcSA9ICgociAqIDI5OSkgKyAoZyAqIDU4NykgKyAoYiAqIDExNCkpIC8gMTAwMDtcblx0XHRyZXR1cm4gKHlpcSA+PSAxMjgpID8gXCIjMDAwXCIgOiBcIiNmZmZcIjtcblxuXHR9XG5cblx0Ly8gdXNlZCB0byBjaGFuZ2UgY29sb3Igb24gaGlnaGxpZ2h0XG5cdHN0YXRpYyBnZXRMdW1pbmFuY2UoaGV4ICAgICAgICApIHtcblxuXHRcdGNvbnN0IG51bSA9IHBhcnNlSW50KFV0aWwubm9ybWFsaXNlSGV4KGhleCksIDE2KSxcblx0XHRcdGFtdCA9IDM4LFxuXHRcdFx0UiA9IChudW0gPj4gMTYpICsgYW10LFxuXHRcdFx0QiA9IChudW0gPj4gOCAmIDB4MDBGRikgKyBhbXQsXG5cdFx0XHRHID0gKG51bSAmIDB4MDAwMEZGKSArIGFtdDtcblx0XHRjb25zdCBuZXdDb2xvdXIgPSAoMHgxMDAwMDAwICsgKFIgPCAyNTUgPyBSIDwgMSA/IDAgOiBSIDogMjU1KSAqIDB4MTAwMDAgKyAoQiA8IDI1NSA/IEIgPCAxID8gMCA6IEIgOiAyNTUpICogMHgxMDAgKyAoRyA8IDI1NSA/IEcgPCAxID8gMCA6IEcgOiAyNTUpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XG5cdFx0cmV0dXJuIGAjJHtuZXdDb2xvdXJ9YDtcblxuXHR9XG5cblx0c3RhdGljIGdldEhvdmVyQ29sb3VyKGhleCAgICAgICAgKSB7XG5cblx0XHRoZXggPSBVdGlsLm5vcm1hbGlzZUhleChoZXgpO1xuXHRcdC8vIGZvciBibGFjayBidXR0b25zXG5cdFx0aWYgKGhleCA9PT0gXCIwMDAwMDBcIikge1xuXG5cdFx0XHRyZXR1cm4gXCIjMjIyXCI7XG5cblx0XHR9XG5cdFx0cmV0dXJuIFV0aWwuZ2V0THVtaW5hbmNlKGhleCk7XG5cblx0fVxuXG5cdHN0YXRpYyBpc01vYmlsZSh1c2VyQWdlbnQgICAgICAgICkge1xuXG5cdFx0cmV0dXJuIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdCh1c2VyQWdlbnQpO1xuXG5cdH1cblxuXHRzdGF0aWMgaXNQbGFpbk9iamVjdChvYmogICAgICAgICkge1xuXG5cdFx0Ly8gVGhlIGNvZGUgXCJ0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGxcIiBhbGxvd3MgQXJyYXkgb2JqZWN0c1xuXHRcdHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcblxuXHR9XG5cblx0c3RhdGljIGFycmF5Q29udGFpbnNNYXRjaGVzKGFycmF5ICAgICAgICwgc2VhcmNoICAgICAgICApIHtcblxuXHRcdGZvciAobGV0IGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG5cblx0XHRcdGNvbnN0IHN0ciA9IGFycmF5W2ldO1xuXHRcdFx0Ly8gaWYgcmVnZXggbWF0Y2hlcyBvciBzdHJpbmcgaXMgZXF1YWwsIHJldHVybiB0cnVlXG5cdFx0XHRpZiAoKHN0ciBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBzdHIudGVzdChzZWFyY2gpKSB8fFxuXHRcdFx0KHR5cGVvZiBzdHIgPT0gXCJzdHJpbmdcIiAmJiBzdHIubGVuZ3RoICYmIHN0ciA9PT0gc2VhcmNoKSkge1xuXG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWw7XG4iXX0=
