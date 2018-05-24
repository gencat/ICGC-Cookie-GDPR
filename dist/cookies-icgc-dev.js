(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.icgc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "version": "0.0.1"
}
},{}],2:[function(require,module,exports){
//      
"use strict";

var CookieManager = function CookieManager () {};

CookieManager.getCookie = function getCookie (name        ) {
	var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return v ? v[2] : null;
};
	
/**
	 * Set the cookie value
	 * @param {String} name The name of the cookie.
	 * @param {String} value The value of the cookie.
	 * @param {String} days The numbers of days to expire the cookie.
	 */
CookieManager.setCookie = function setCookie (name        , value        , days        , domain         , path         ) {
	var d = new Date;
	d.setTime(d.getTime() + 24*60*60*1000*days);
	var cookie = name + "=" + value + ";expires=" + d.toGMTString();
	if(path){
		cookie += ";path="+path;
	}else{
		cookie += ";path=/";
	}
	if(domain){
		cookie += ";domain="+domain;
	}
	document.cookie = cookie;
};
	
/**
	 * Delete the cookies
	 * @param {String} name The name of the cookie.
	 */
CookieManager.deleteCookie = function deleteCookie (name        , domain         , path         ) { 
	this.setCookie(name, '', -1, domain, path);  
};

/**
	 * Get all cookies
	 * @returns {Object}
	 */
CookieManager.getAllCookies = function getAllCookies (){
	var cookies = {};
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
    var this$1 = this;

    this.status = {
      deny: 'deny',
      allow: 'allow'
    };
    
    // set options back to default options
	this.options = defaultOptions;

	// merge in user options
	if (util.isPlainObject(options)) {
		Object.assign(this.options, options);
	}

    //TODO ver como no depender del navigator
    this.options.userAgent = navigator.userAgent;
    this.options.isMobile = util.isMobile(this.options.userAgent);

    return new Promise(function (resolve, reject) {
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
	return val == this.status.allow;
};

Cookieconsent.prototype.setStatus = function setStatus (status) {
	var c = this.options.cookie;
	var value = cookieManager.getCookie(c.name);
	var chosenBefore = Object.keys(this.status).indexOf(value) >= 0;
  
	// if `status` is valid
	if (Object.keys(this.status).indexOf(status) >= 0) {
		//TODO cambiar por el cookieManager y ver si poner lo del domain y el path
		cookieManager.setCookie(c.name, status, c.expiryDays, c.domain, c.path);
  
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

module.exports = Cookieconsent;

/*
// this function calls the `onComplete` hook and returns true (if needed) and returns false otherwise
function checkCallbackHooks() {
  var complete = this.options.onInitialise.bind(this);

  if (!window.navigator.cookieEnabled) {
    complete(cc.status.deny);
    return true;
  }

  if (window.CookiesOK || window.navigator.CookiesOK) {
    complete(cc.status.allow);
    return true;
  }

  var allowed = Object.keys(cc.status);
  var answer = this.getStatus();
  var match = allowed.indexOf(answer) >= 0;

  if (match) {
    complete(answer);
  }
  return match;
}

	revokeChoice(preventOpen) {
		this.options.enabled = true;
		this.clearStatus();
  
		this.options.onRevokeChoice.call(this);
  
		if (!preventOpen) {
		  this.autoOpen();
		}
	}

colorStyles[prefix + '.cc-revoke'] = [
			'color: ' + popup.text,
			'background-color: ' + popup.background
		  ];

if (this.revokeBtn && this.revokeBtn.parentNode) {
		this.revokeBtn.parentNode.removeChild(this.revokeBtn);
		}
		this.revokeBtn = null;

// opens the popup if no answer has been given
	autoOpen() {
		!this.hasAnswered() && this.options.enabled && this.open();
	}

	applyRevokeButton() {
		const classes = this.getPositionClasses.call(this);
		
		if (this.customStyleSelector) {
			classes.push(this.customStyleSelector)
		}
		const revokeBtn = this.options.revokeBtn.replace('{{classes}}', classes.join(' '));
		this.revokeBtn = appendMarkup.call(this, revokeBtn);

	}

	toggleRevokeButton(show) {
		if (this.revokeBtn) this.revokeBtn.style.display = show ? '' : 'none';
	}

*/
},{"./cookieManager":2,"./defaultOptions":5,"./popup":7,"./util":8}],4:[function(require,module,exports){
//      
"use strict";

var Cookieconsent = require("./cookieconsent");
var CookieManager = require("./cookieManager");
var defaultOptions = require("./defaultOptions");


var CookiesICGC = function CookiesICGC(domain        , gaIds               , options         ) {
		
	var mainOptions = Object.assign({}, defaultOptions, options);

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

};

/**
	 * Callback called when the cookie consent status has changed.
	 * Enables the cookies if needed
	 */
CookiesICGC.prototype.onChange = function onChange () {

	if (this.hasConsented()) {
		
		this.enableCookies();

	}

};

/**
	 * Callback called when the cookie consent has been revoked.
	 * Disables the cookies
	 */
CookiesICGC.prototype.onRevoke = function onRevoke () {

	this.disableCookies();

};

/**
	 * Callback called when the cookie consent popup open.
	 * Show the popup
	 */
CookiesICGC.prototype.onOpen = function onOpen () {

	this.disableCookies();

};

/**
	 * Checks if the user has consented
	 * @returns {boolean}
	 */
CookiesICGC.prototype.hasConsented = function hasConsented () {

	var type = this.cookieconsent.options.type;
	var didConsent = this.cookieconsent.hasConsented();

	return type == 'opt-in' && didConsent

};

CookiesICGC.prototype.setCookiesEnableHandler = function setCookiesEnableHandler (callback          ){
	this.cookiesEnabledHandler = callback;
};

CookiesICGC.prototype.enableCookies = function enableCookies () {
	this.areCookiesEnabled = true;
	if("true" === CookieManager.getCookie("gaEnable")){
		this.enableGA();
	}
	if(this.cookiesEnabledHandler){
		this.cookiesEnabledHandler();
	}
};

 CookiesICGC.prototype.setCookiesDisabledHandler = function setCookiesDisabledHandler (callback          ){
	this.cookiesDisabledHandler = callback;
};

CookiesICGC.prototype.disableCookies = function disableCookies () {

	var activeCookies = CookieManager.getAllCookies();
	this.disableGA();

	Object.keys(activeCookies).forEach(
		function(item) {
			CookieManager.deleteCookie(item);
		}
	);

	this.areCookiesEnabled = false;

	this.cookiesDisabledHandler();

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

	CookieManager.setCookie("gaEnable", "false", 365);

};

CookiesICGC.prototype.changeGAStatusToDisabled = function changeGAStatusToDisabled (shouldDisable         ) {
		var this$1 = this;


	this.gaIds.forEach(function (gaId) {

		window[("" + (this$1.gaDisablePrefix) + gaId)] = shouldDisable;

	});

};

module.exports = CookiesICGC;
},{"./cookieManager":2,"./cookieconsent":3,"./defaultOptions":5}],5:[function(require,module,exports){
module.exports = {

	// if false, this prevents the popup from showing (useful for giving to control to another piece of code)
	enabled: true,

	// optional (expecting a HTML element) if passed, the popup is appended to this element. default is `document.body`
	container: null,

	// defaults cookie options - it is RECOMMENDED to set these values to correspond with your server
	cookie: {
		// This is the name of this cookie - you can ignore this
		name: 'cookieconsent_status',

		// This is the url path that the cookie 'name' belongs to. The cookie can only be read at this location
		path: '/',

		// This is the domain that the cookie 'name' belongs to. The cookie can only be read on this domain.
		//  - Guide to cookie domains - http://erik.io/blog/2014/03/04/definitive-guide-to-cookie-domains/
		domain: 'file',

		// The cookies expire date, specified in days (specify -1 for no expiry)
		expiryDays: 365,
	},

	// these callback hooks are called at certain points in the program execution
	onPopupOpen: function() {},
	onPopupClose: function() {},
	onInitialise: function(status) {},
	onStatusChange: function(status, chosenBefore) {},
	onRevokeChoice: function() {},

	// each item defines the inner text for the element that it references
	content: {
		header: 'Cookies used on the website!',
	  message: "Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal",
	  allow: "Acceptar",
	  deny: "Decline",
	  link: "política de galetes",
		href: 'http://www.icgc.cat/L-ICGC/Sobre-l-ICGC/Politiques/Politica-de-proteccio-de-dades-personals/Politica-de-galetes-cookies',
		close: '&#x274c;',
	},

	// This is the HTML for the elements above. The string {{header}} will be replaced with the equivalent text below.
	// You can remove "{{header}}" and write the content directly inside the HTML if you want.
	//
	//  - ARIA rules suggest to ensure controls are tabbable (so the browser can find the first control),
	//    and to set the focus to the first interactive control (http://w3c.github.io/aria-in-html/)
	elements: {
		header: '<span class="cc-header">{{header}}</span>&nbsp;',
		message: '<span id="cookieconsent:desc" class="cc-message">{{message}}</span>',
		messagelink: '<span id="cookieconsent:desc" class="cc-message">{{message}} <a aria-label="learn more about cookies" role=button tabindex="0" class="cc-link" href="{{href}}" rel="noopener noreferrer nofollow" target="_blank">{{link}}</a></span>',
		allow: '<a aria-label="allow cookies" role=button tabindex="0"  class="cc-btn cc-allow">{{allow}}</a>',
		deny: '<a aria-label="deny cookies" role=button tabindex="0" class="cc-btn cc-deny">{{deny}}</a>',
		link: '<a aria-label="learn more about cookies" role=button tabindex="0" class="cc-link" href="{{href}}" target="_blank">{{link}}</a>',
		close: '<span aria-label="dismiss cookie message" role=button tabindex="0" class="cc-close">{{close}}</span>',
	},

	// The placeholders {{classes}} and {{children}} both get replaced during initialisation:
	//  - {{classes}} is where additional classes get added
	//  - {{children}} is where the HTML children are placed
	window: '<div role="dialog" aria-live="polite" aria-label="cookieconsent" aria-describedby="cookieconsent:desc" class="cc-window {{classes}}"><!--googleoff: all-->{{children}}<!--googleon: all--></div>',

	// This is the html for the revoke button. This only shows up after the user has selected their level of consent
	// It can be enabled of disabled using the `revokable` option
	revokeBtn: '<div class="cc-revoke {{classes}}">Revocar</div>',

	// define types of 'compliance' here. '{{value}}' strings in here are linked to `elements`
	compliance: '<div class="cc-compliance cc-highlight">{{deny}}{{allow}}</div>',
	
	// define layout layouts here
	layouts: {
		// the 'block' layout tend to be for square floating popups
		'basic': '{{messagelink}}{{compliance}}',
		'basic-close': '{{messagelink}}{{compliance}}{{close}}',
		'basic-header': '{{header}}{{message}}{{link}}{{compliance}}',

		// add a custom layout here, then add some new css with the class '.cc-layout-my-cool-layout'
		//'my-cool-layout': '<div class="my-special-layout">{{message}}{{compliance}}</div>{{close}}',
	},

	// default layout (see above)
	layout: 'basic',

	// this refers to the popup windows position. we currently support:
	//  - banner positions: top, bottom
	//  - floating positions: top-left, top-right, bottom-left, bottom-right
	//
	// adds a class `cc-floating` or `cc-banner` which helps when styling
	position: 'bottom', // default position is 'bottom'

	// Available styles
	//    -block (default, no extra classes)
	//    -edgeless
	//    -classic
	// use your own style name and use `.cc-theme-STYLENAME` class in CSS to edit.
	// Note: style "wire" is used for the configurator, but has no CSS styles of its own, only palette is used.
	theme: 'block',

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

var Popup = function Popup(options        , statusList        ){

	this.statusList = statusList;
	this.allowHandler = null;
	this.denyHandler = null;
		
	if (this.options) {
		this.destroy(); // already rendered
	}

	// set options back to default options
	this.options = options;

	// the full markup either contains the wrapper or it does not (for multiple instances)
	var cookiePopup = this.options.window.replace('{{classes}}', this.getPopupClasses.call(this).join(' '))
        .replace('{{children}}', this.getPopupInnerMarkup.call(this));

	this.element = this.appendMarkup.call(this, cookiePopup);
		
	this.open();

};

Popup.prototype.destroy = function destroy (){
	document.querySelector('.cc-allow').removeEventListener('click', this.allowHandler);
	document.querySelector('.cc-deny').removeEventListener('click', this.denyHandler);
	this.allowHandler = null;
	this.denyHandler = null;

	if (this.element && this.element.parentNode) {
		this.element.parentNode.removeChild(this.element);
	}
	this.element = null;
	
	this.options = null;
};

Popup.prototype.open = function open () {
	if (!this.element) { return; }
  
	if (!this.isOpen()) {
		  this.element.style.display = '';
		  
		  util.removeClass(this.element, 'cc-invisible');

		  this.options.onPopupOpen.call(this);
	}
  
	return this;
};

Popup.prototype.close = function close () {
	if (!this.element) { return; }
  
	if (this.isOpen()) {
		  this.element.style.display = 'none';
		  
		  this.options.onPopupClose.call(this);
	}
  
	return this;
};

Popup.prototype.isOpen = function isOpen () {
	return this.element && this.element.style.display == '' && !util.hasClass(this.element, 'cc-invisible');
};

Popup.prototype.getPositionClasses = function getPositionClasses () {
	var positions = this.options.position.split('-'); // top, bottom, left, right
	var classes = [];
  
	// top, left, right, bottom
	positions.forEach(function(cur) {
		  classes.push('cc-' + cur);
	});
  
	return classes;
};

Popup.prototype.getPopupClasses = function getPopupClasses () {
	var opts = this.options;
	var positionStyle = (opts.position == 'top' || opts.position == 'bottom') ? 'banner' : 'floating';
  
	if (opts.isMobile) {
		  positionStyle = 'floating';
	}
  
	var classes = [
		  'cc-' + positionStyle, // floating or banner
		  'cc-type-opt-in', // add the compliance type
		  'cc-theme-' + opts.theme ];
  
	if (opts.static) {
		  classes.push('cc-static');
	}
  
	classes.push.apply(classes, this.getPositionClasses.call(this));
  
	// we only add extra styles if `palette` has been set to a valid value
	var didAttach = this.attachCustomPalette.call(this, this.options.palette);
  
	// if we override the palette, add the class that enables this
	if (this.customStyleSelector) {
		  classes.push(this.customStyleSelector);
	}
  
	return classes;
};

Popup.prototype.getPopupInnerMarkup = function getPopupInnerMarkup () {
	var interpolated = {};
	var opts = this.options;
  
	Object.keys(opts.elements).forEach(function(prop) {
		  interpolated[prop] = util.interpolateString(opts.elements[prop], function(name) {
		var str = opts.content[name];
		return (name && typeof str == 'string' && str.length) ? str : '';
		  })
	});
  
	// checks if the type is valid and defaults to info if it's not
	var complianceType = opts.compliance;
		  
	// build the compliance types from the already interpolated `elements`
	interpolated.compliance = util.interpolateString(complianceType, function(name) {
		  return interpolated[name];
	});
  
	// checks if the layout is valid and defaults to basic if it's not
	var layout = opts.layouts[opts.layout];
	if (!layout) {
		  layout = opts.layouts.basic;
	}
  
	return util.interpolateString(layout, function(match) {
		  return interpolated[match];
	});
};

Popup.prototype.appendMarkup = function appendMarkup (markup) {
	var opts = this.options;
	var div = document.createElement('div');
	var cont = (opts.container && opts.container.nodeType === 1) ? opts.container : document.body;
  
	div.innerHTML = markup;
  
	var el = div.children[0];
  
	el.style.display = 'none';
  
	if (util.hasClass(el, 'cc-window')) {
		  util.addClass(el, 'cc-invisible');
	}
  
	if (!cont.firstChild) {
		cont.appendChild(el);
	} else {
		cont.insertBefore(el, cont.firstChild)
	}
  		
		
		
	return el;
};

Popup.prototype.setAllowHandler = function setAllowHandler (callback          ){
	document.querySelector('.cc-allow').removeEventListener('click', this.allowHandler);
	this.allowHandler = callback;
	document.querySelector('.cc-allow').addEventListener('click', callback);
};

Popup.prototype.setDenyHandler = function setDenyHandler (callback          ){
	document.querySelector('.cc-deny').removeEventListener('click', this.denyHandler);
	this.denyHandler = callback;
	document.querySelector('.cc-deny').addEventListener('click', callback);
};

// I might change this function to use inline styles. I originally chose a stylesheet because I could select many elements with a
    // single rule (something that happened a lot), the apps has changed slightly now though, so inline styles might be more applicable.
    Popup.prototype.attachCustomPalette = function attachCustomPalette (palette) {
	var hash = util.hash(JSON.stringify(palette));
	var selector = 'cc-color-override-' + hash;
	var isValid = util.isPlainObject(palette);
  
	this.customStyleSelector = isValid ? selector : null;
  
	if (isValid) {
		  this.addCustomStyle(hash, palette, '.' + selector);
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
		  colorStyles[prefix + '.cc-window'] = [
		'color: ' + popup.text,
		'background-color: ' + popup.background
		  ];
		  colorStyles[prefix + ' .cc-link,' + prefix + ' .cc-link:active,' + prefix + ' .cc-link:visited'] = [
		'color: ' + popup.link
		  ];
  
		  if (button) {
		// assumes button.background is set
		button.text = button.text ? button.text : util.getContrast(button.background);
		button.border = button.border ? button.border : 'transparent';
		colorStyles[prefix + ' .cc-btn'] = [
			  'color: ' + button.text,
			  'border-color: ' + button.border,
			  'background-color: ' + button.background
		];
			
		if(button.background != 'transparent') 
			  { colorStyles[prefix + ' .cc-btn:hover, ' + prefix + ' .cc-btn:focus'] = [
			'background-color: ' + util.getHoverColour(button.background)
			  ]; }
  
		if (highlight) {
			  //assumes highlight.background is set
			  highlight.text = highlight.text ? highlight.text : util.getContrast(highlight.background);
			  highlight.border = highlight.border ? highlight.border : 'transparent';
			  colorStyles[prefix + ' .cc-highlight .cc-btn:first-child'] = [
			'color: ' + highlight.text,
			'border-color: ' + highlight.border,
			'background-color: ' + highlight.background
			  ];
		} else {
			  // sets highlight text color to popup text. background and border are transparent by default.
			  colorStyles[prefix + ' .cc-highlight .cc-btn:first-child'] = [
			'color: ' + popup.text
			  ];
		}
		  }
	}
  
	// this will be interpretted as CSS. the key is the selector, and each array element is a rule
	var style = document.createElement('style');
	document.head.appendChild(style);
  	var ruleIndex = -1;
	for (var prop in colorStyles) {
		  style.sheet.insertRule(prop + '{' + colorStyles[prop].join(';') + '}', ++ruleIndex);
	}
};

module.exports = Popup;
},{"./util":8}],8:[function(require,module,exports){
//      
"use strict";

var Util = function Util () {};

Util.escapeRegExp = function escapeRegExp (str        ) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

Util.hasClass = function hasClass (element        , selector        ) {
	var s = ' ';
	return element.nodeType === Node.ELEMENT_NODE &&
		  (s + element.className + s).replace(/[\n\t]/g, s).indexOf(s + selector + s) >= 0;
};

Util.addClass = function addClass (element        , className        ) {
	element.className += ' ' + className;
};

Util.removeClass = function removeClass (element        , className        ) {
	var regex = new RegExp('\\b' + Util.escapeRegExp(className) + '\\b');
	element.className = element.className.replace(regex, '');
};

Util.interpolateString = function interpolateString (str        , callback          ) {
	var marker = /{{([a-z][a-z0-9\-_]*)}}/ig;
	return str.replace(marker, function(matches) {
		  return callback(arguments[1]) || '';
	});
};

// only used for hashing json objects (used for hash mapping palette objects, used when custom colours are passed through JavaScript)
  Util.hash = function hash (str        ) {
      var hash = 0,
        i, chr, len;
      if (str.length === 0) { return hash; }
      for (i = 0, len = str.length; i < len; ++i) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash;
};
	
Util.normaliseHex = function normaliseHex (hex        ) {
	if (hex[0] == '#') {
		  hex = hex.substr(1);
	}
	if (hex.length == 3) {
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
	return (yiq >= 128) ? '#000' : '#fff';
};

// used to change color on highlight
  Util.getLuminance = function getLuminance (hex        ) {
	var num = parseInt(Util.normaliseHex(hex), 16), 
		amt = 38,
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;
	var newColour = (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
	return '#'+newColour;
};

Util.getHoverColour = function getHoverColour (hex        ) {
	hex = Util.normaliseHex(hex);
	// for black buttons
	if (hex == '000000') {
		  return '#222';
	}
	return Util.getLuminance(hex);
};

Util.isMobile = function isMobile (userAgent        ) {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

Util.isPlainObject = function isPlainObject (obj        ) {
	// The code "typeof obj === 'object' && obj !== null" allows Array objects
	return typeof obj === 'object' && obj !== null && obj.constructor == Object;
};

Util.arrayContainsMatches = function arrayContainsMatches (array       , search        ) {
	for (var i = 0, l = array.length; i < l; ++i) {
		  var str = array[i];
		  // if regex matches or string is equal, return true
		  if ((str instanceof RegExp && str.test(search)) ||
		(typeof str == 'string' && str.length && str === search)) {
		return true;
		  }
	}
	return false;
}; 

module.exports = Util;
},{}]},{},[6])(6)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWNrYWdlLmpzb24iLCJlOi91c3VhcmlzL3cuc3pjemVyYmFuL2Nvb2tpZXNnZHByL3NyYy9jb29raWVNYW5hZ2VyLmpzIiwiZTovdXN1YXJpcy93LnN6Y3plcmJhbi9jb29raWVzZ2Rwci9zcmMvY29va2llY29uc2VudC5qcyIsImU6L3VzdWFyaXMvdy5zemN6ZXJiYW4vY29va2llc2dkcHIvc3JjL2Nvb2tpZXNJY2djLmpzIiwiZTovdXN1YXJpcy93LnN6Y3plcmJhbi9jb29raWVzZ2Rwci9zcmMvZGVmYXVsdE9wdGlvbnMuanMiLCJlOi91c3VhcmlzL3cuc3pjemVyYmFuL2Nvb2tpZXNnZHByL3NyYy9pbmRleC5qcyIsImU6L3VzdWFyaXMvdy5zemN6ZXJiYW4vY29va2llc2dkcHIvc3JjL3BvcHVwLmpzIiwiZTovdXN1YXJpcy93LnN6Y3plcmJhbi9jb29raWVzZ2Rwci9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLGFBQWE7O2NBT1gsK0JBQVMsQ0FBQyxJQUFJLFVBQVU7Q0FDL0IsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsZUFBZSxDQUFDLENBQUM7Q0FDckUsQUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7Ozs7QUFNRCxjQUFRLCtCQUFTLENBQUMsSUFBSSxVQUFVLEtBQUssVUFBVSxJQUFJLFVBQVUsTUFBTSxXQUFXLElBQUksV0FBVztDQUM1RixBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUM7Q0FDcEIsQUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDN0MsQUFBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDakUsQUFBQyxHQUFHLElBQUksQ0FBQztFQUNSLEFBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUM7Q0FDMUIsQUFBQyxDQUFDLElBQUk7RUFDTCxBQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7Q0FDdEIsQUFBQyxDQUFDO0NBQ0YsQUFBQyxHQUFHLE1BQU0sQ0FBQztFQUNWLEFBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUM7Q0FDOUIsQUFBQyxDQUFDO0NBQ0YsQUFBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMzQixBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELGNBQVEscUNBQVksQ0FBQyxJQUFJLFVBQVUsTUFBTSxXQUFXLElBQUksV0FBVztDQUNsRSxBQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxjQUFRLHVDQUFhLEVBQUU7Q0FDdEIsQUFBQyxHQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUNwQixBQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sVUFBQyxDQUFDLElBQUksQ0FBQyxBQUFFO0VBQzNDLEFBQUMsR0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2hDLEFBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQyxBQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ0osQUFBQyxPQUFPLE9BQU8sQ0FBQztBQUNqQixBQUFDLENBQUMsQ0FDRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWE7O0FDMUQ5QjtBQUNBLFlBQVksQ0FBQztBQUNiLEdBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbkQsR0FBSyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxHQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixHQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakMsSUFBTSxhQUFhLEdBR2pCLHNCQUFXLENBQUMsT0FBTyxVQUFVOztBQUFDO0lBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUc7TUFDWixJQUFJLEVBQUUsTUFBTTtNQUNaLEtBQUssRUFBRSxPQUFPO0tBQ2YsQ0FBQzs7O0NBR0wsQUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQzs7Q0FFL0IsQUFBQztDQUNELEFBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0VBQ2pDLEFBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZDLEFBQUMsQ0FBQzs7O0lBR0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztJQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBRTlELE9BQU8sSUFBSSxPQUFPLFVBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEFBQUc7TUFDdEMsR0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7TUFDdEMsS0FBSyxDQUFDLGVBQWUsVUFBQyxFQUFFLEFBQUU7UUFDeEIsTUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNmLENBQUMsQ0FBQztNQUNILEtBQUssQ0FBQyxjQUFjLFVBQUMsRUFBRSxBQUFFO1FBQ3ZCLE1BQUksQ0FBQyxTQUFTLENBQUMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZixDQUFDLENBQUM7TUFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDaEIsQ0FBQyxDQUFDO0lBQ0o7OzswQkFHRCxtQ0FBVyxHQUFHO0NBQ2YsQUFBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakUsQUFBQyxFQUFDOztBQUVGLEFBQUM7QUFDRCx3QkFBQyxxQ0FBWSxHQUFHO0NBQ2YsQUFBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztDQUM1QixBQUFDLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2xDLEFBQUMsRUFBQzs7QUFFRix3QkFBQywrQkFBUyxDQUFDLE1BQU0sRUFBRTtDQUNsQixBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDL0IsQUFBQyxHQUFLLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQy9DLEFBQUMsR0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztDQUVuRSxBQUFDO0NBQ0QsQUFBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7RUFDbkQsQUFBQztFQUNELEFBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOztJQUV2RSxBQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQ2pFLEFBQUMsQ0FBQyxNQUFNO0lBQ0wsQUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDdkIsQUFBQyxDQUFDO0FBQ0gsQUFBQyxFQUFDOztBQUVGLHdCQUFDLCtCQUFTLEdBQUc7Q0FDWixBQUFDLE9BQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRCxBQUFDLEVBQUM7O0FBRUYsd0JBQUMsbUNBQVcsR0FBRztDQUNkLEFBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDN0IsQUFBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkQsQUFBQyxDQUFDLENBQ0Q7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvRS9CO0FBQ0EsWUFBWSxDQUFDOztBQUViLEdBQUssQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsR0FBSyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxHQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzs7QUFHbkQsSUFBTSxXQUFXLEdBZ0JoQixvQkFBVyxDQUFDLE1BQU0sVUFBVSxLQUFLLGlCQUFpQixPQUFPLFdBQVc7O0NBRXBFLEFBQUMsR0FBSyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRWhFLEFBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0NBQ3BDLEFBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0NBQ3hDLEFBQUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0NBQzVDLEFBQUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0NBQzVDLEFBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztDQUV2QyxBQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7Q0FDaEMsQUFBQyxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQztDQUN0QyxBQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ3BCLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztDQUNuQyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7Q0FDcEMsQUFBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUV0RCxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLHlCQUFNLEdBQUc7O0NBRVQsQUFBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTs7RUFFekIsQUFBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O01BRWxCLE1BQU07O0tBRVAsQUFBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O01BRXRCOztBQUVOLEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMsNkJBQVEsR0FBRzs7Q0FFWCxBQUFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFOztFQUV6QixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Q0FFdkIsQUFBQyxDQUFDOztBQUVILEFBQUMsRUFBQzs7QUFFRixBQUFDOzs7O0FBSUQsc0JBQUMsNkJBQVEsR0FBRzs7Q0FFWCxBQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFeEIsQUFBQyxFQUFDOztBQUVGLEFBQUM7Ozs7QUFJRCxzQkFBQyx5QkFBTSxHQUFHOztDQUVULEFBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV4QixBQUFDLEVBQUM7O0FBRUYsQUFBQzs7OztBQUlELHNCQUFDLHFDQUFZLEdBQUc7O0NBRWYsQUFBQyxHQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztDQUM5QyxBQUFDLEdBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7Q0FFdEQsQUFBQyxPQUFPLElBQUksSUFBSSxRQUFRLElBQUksVUFBVTs7QUFFdkMsQUFBQyxFQUFDOztBQUVGLHNCQUFDLDJEQUF1QixDQUFDLFFBQVEsV0FBVztDQUMzQyxBQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUM7QUFDeEMsQUFBQyxFQUFDOztBQUVGLHNCQUFDLHVDQUFhLEdBQUc7Q0FDaEIsQUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO0NBQy9CLEFBQUMsR0FBRyxNQUFNLEtBQUssYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUNsRCxBQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztDQUNsQixBQUFDLENBQUM7Q0FDRixBQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0VBQzlCLEFBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Q0FDL0IsQUFBQyxDQUFDO0FBQ0gsQUFBQyxFQUFDOztDQUVELHNCQUFDLCtEQUF5QixDQUFDLFFBQVEsV0FBVztDQUM5QyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxRQUFRLENBQUM7QUFDekMsQUFBQyxFQUFDOztBQUVGLHNCQUFDLHlDQUFjLEdBQUc7O0NBRWpCLEFBQUMsR0FBSyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7Q0FDckQsQUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0NBRWxCLEFBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPO0VBQ2xDLEFBQUMsU0FBUyxJQUFJLEVBQUU7R0FDZixBQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDbkMsQUFBQyxDQUFDO0NBQ0gsQUFBQyxDQUFDLENBQUM7O0NBRUgsQUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDOztDQUVoQyxBQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUVoQyxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsK0NBQWlCLEdBQUc7O0NBRXBCLEFBQUMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7O0FBRWhDLEFBQUMsRUFBQzs7QUFFRixzQkFBQyw2QkFBUSxHQUFHOztDQUVYLEFBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUV0QyxBQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFbkQsQUFBQyxFQUFDOztBQUVGLHNCQUFDLCtCQUFTLEdBQUc7O0NBRVosQUFBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRXJDLEFBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUVwRCxBQUFDLEVBQUM7O0FBRUYsc0JBQUMsNkRBQXdCLENBQUMsYUFBYSxXQUFXOztBQUFDOztDQUVsRCxBQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxXQUFDLEtBQUksQ0FBQyxBQUFHOztFQUUzQixBQUFDLE1BQU0sQ0FBQyxPQUFHLE1BQUksQ0FBQyxlQUFlLElBQUcsSUFBSSxDQUFFLENBQUMsR0FBRyxhQUFhLENBQUM7O0NBRTNELEFBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRUwsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7O0FDakw3QixNQUFNLENBQUMsT0FBTyxHQUFHOzs7Q0FHaEIsT0FBTyxFQUFFLElBQUk7OztDQUdiLFNBQVMsRUFBRSxJQUFJOzs7Q0FHZixNQUFNLEVBQUU7O0VBRVAsSUFBSSxFQUFFLHNCQUFzQjs7O0VBRzVCLElBQUksRUFBRSxHQUFHOzs7O0VBSVQsTUFBTSxFQUFFLE1BQU07OztFQUdkLFVBQVUsRUFBRSxHQUFHO0VBQ2Y7OztDQUdELFdBQVcsRUFBRSxXQUFXLEVBQUU7Q0FDMUIsWUFBWSxFQUFFLFdBQVcsRUFBRTtDQUMzQixZQUFZLEVBQUUsU0FBUyxNQUFNLEVBQUUsRUFBRTtDQUNqQyxjQUFjLEVBQUUsU0FBUyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUU7Q0FDakQsY0FBYyxFQUFFLFdBQVcsRUFBRTs7O0NBRzdCLE9BQU8sRUFBRTtFQUNSLE1BQU0sRUFBRSw4QkFBOEI7R0FDckMsT0FBTyxFQUFFLHFJQUFxSTtHQUM5SSxLQUFLLEVBQUUsVUFBVTtHQUNqQixJQUFJLEVBQUUsU0FBUztHQUNmLElBQUksRUFBRSxxQkFBcUI7RUFDNUIsSUFBSSxFQUFFLHlIQUF5SDtFQUMvSCxLQUFLLEVBQUUsVUFBVTtFQUNqQjs7Ozs7OztDQU9ELFFBQVEsRUFBRTtFQUNULE1BQU0sRUFBRSxpREFBaUQ7RUFDekQsT0FBTyxFQUFFLHFFQUFxRTtFQUM5RSxXQUFXLEVBQUUsdU9BQXVPO0VBQ3BQLEtBQUssRUFBRSwrRkFBK0Y7RUFDdEcsSUFBSSxFQUFFLDJGQUEyRjtFQUNqRyxJQUFJLEVBQUUsZ0lBQWdJO0VBQ3RJLEtBQUssRUFBRSxzR0FBc0c7RUFDN0c7Ozs7O0NBS0QsTUFBTSxFQUFFLGtNQUFrTTs7OztDQUkxTSxTQUFTLEVBQUUsa0RBQWtEOzs7Q0FHN0QsVUFBVSxFQUFFLGlFQUFpRTs7O0NBRzdFLE9BQU8sRUFBRTs7RUFFUixPQUFPLEVBQUUsK0JBQStCO0VBQ3hDLGFBQWEsRUFBRSx3Q0FBd0M7RUFDdkQsY0FBYyxFQUFFLDZDQUE2Qzs7OztFQUk3RDs7O0NBR0QsTUFBTSxFQUFFLE9BQU87Ozs7Ozs7Q0FPZixRQUFRLEVBQUUsUUFBUTs7Ozs7Ozs7Q0FRbEIsS0FBSyxFQUFFLE9BQU87Ozs7Ozs7Ozs7O0NBV2QsT0FBTyxDQUFDO0dBQ04sS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztHQUM5QixNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0VBQ2hDO0NBQ0Q7O0FDL0dEO0FBQ0EsWUFBWSxDQUFDOztBQUViLEdBQUssQ0FBQyxPQUFPLFdBQVcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzNELEdBQUssQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUU3QyxNQUFNLENBQUMsT0FBTyxHQUFHO1VBQ2hCLE9BQU87Y0FDUCxXQUFXO0NBQ1gsQ0FBQzs7Ozs7Ozs7O0FDVEY7QUFDQSxZQUFZLENBQUM7O0FBRWIsR0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRS9CLElBQU0sS0FBSyxHQUlWLGNBQVcsQ0FBQyxPQUFPLFVBQVUsVUFBVSxTQUFTOztDQUVoRCxBQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0NBQzlCLEFBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Q0FDMUIsQUFBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs7Q0FFekIsQUFBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7RUFDbEIsQUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDakIsQUFBQyxDQUFDOztDQUVGLEFBQUM7Q0FDRCxBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztDQUV4QixBQUFDO0NBQ0QsQUFBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pHLEFBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Q0FFdEUsQUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQzs7Q0FFMUQsQUFBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWQsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJCQUFPLEVBQUU7Q0FDVCxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUNyRixBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0NBRXpCLEFBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO0VBQzdDLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUNwRCxBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOztDQUVyQixBQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxxQkFBSSxHQUFHO0NBQ1AsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBRSxTQUFPOztDQUUzQixBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7SUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7SUFFaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDOztJQUUvQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkMsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxJQUFJLENBQUM7QUFDZCxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMsdUJBQUssR0FBRztDQUNSLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUUsU0FBTzs7Q0FFM0IsQUFBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtJQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztJQUVwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDeEMsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxJQUFJLENBQUM7QUFDZCxBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUJBQU0sR0FBRztDQUNULEFBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDMUcsQUFBQyxFQUFDOztBQUVGLGdCQUFDLGlEQUFrQixHQUFHO0NBQ3JCLEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEQsQUFBQyxHQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Q0FFcEIsQUFBQztDQUNELEFBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRTtJQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztDQUM3QixBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVKLEFBQUMsT0FBTyxPQUFPLENBQUM7QUFDakIsQUFBQyxFQUFDOztBQUVGLGdCQUFDLDJDQUFlLEdBQUc7Q0FDbEIsQUFBQyxHQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7Q0FDM0IsQUFBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxRQUFRLEdBQUcsVUFBVSxDQUFDOztDQUVuRyxBQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtJQUNqQixhQUFhLEdBQUcsVUFBVSxDQUFDO0NBQzlCLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLEdBQUssQ0FBQyxPQUFPLEdBQUc7SUFDZCxLQUFLLEdBQUcsYUFBYTtJQUNyQixnQkFBZ0I7SUFDaEIsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQzFCLENBQUMsQ0FBQzs7Q0FFSCxBQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtJQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDN0IsQUFBQyxDQUFDOztDQUVGLEFBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Q0FFakUsQUFBQztDQUNELEFBQUMsR0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUU3RSxBQUFDO0NBQ0QsQUFBQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLEFBQUMsRUFBQzs7QUFFRixnQkFBQyxtREFBbUIsR0FBRztDQUN0QixBQUFDLEdBQUssQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0NBQ3pCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztDQUUzQixBQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksRUFBRTtJQUNoRCxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxJQUFJLEVBQUU7RUFDbEYsQUFBQyxHQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDaEMsQUFBQyxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztLQUMvRCxDQUFDO0NBQ0wsQUFBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFSixBQUFDO0NBQ0QsQUFBQyxHQUFLLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7O0NBRXhDLEFBQUM7Q0FDRCxBQUFDLFlBQVksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxTQUFTLElBQUksRUFBRTtJQUM5RSxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM3QixBQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVKLEFBQUM7Q0FDRCxBQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDeEMsQUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ1gsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0NBQy9CLEFBQUMsQ0FBQzs7Q0FFRixBQUFDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssRUFBRTtJQUNwRCxPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM5QixBQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQUFBQyxFQUFDOztBQUVGLGdCQUFDLHFDQUFZLENBQUMsTUFBTSxFQUFFO0NBQ3JCLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0NBQzNCLEFBQUMsR0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzNDLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOztDQUVqRyxBQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDOztDQUV4QixBQUFDLEdBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Q0FFNUIsQUFBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7O0NBRTNCLEFBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRTtJQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztDQUNyQyxBQUFDLENBQUM7O0NBRUYsQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtFQUN0QixBQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdkIsQUFBQyxDQUFDLE1BQU07RUFDUCxBQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7Q0FDeEMsQUFBQyxDQUFDOzs7O0NBSUYsQUFBQyxPQUFPLEVBQUUsQ0FBQztBQUNaLEFBQUMsRUFBQzs7QUFFRixnQkFBQywyQ0FBZSxDQUFDLFFBQVEsV0FBVztDQUNuQyxBQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUNyRixBQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO0NBQzlCLEFBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDMUUsQUFBQyxFQUFDOztBQUVGLGdCQUFDLHlDQUFjLENBQUMsUUFBUSxXQUFXO0NBQ2xDLEFBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ25GLEFBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7Q0FDN0IsQUFBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6RSxBQUFDLEVBQUM7O0FBRUYsQUFBQzs7b0JBRUcsbURBQW1CLENBQUMsT0FBTyxFQUFFO0NBQ2hDLEFBQUMsR0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNqRCxBQUFDLEdBQUssQ0FBQyxRQUFRLEdBQUcsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0NBQzlDLEFBQUMsR0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztDQUU3QyxBQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEQsQUFBQyxJQUFJLE9BQU8sRUFBRTtJQUNYLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUM7Q0FDdEQsQUFBQyxDQUFDO0NBQ0YsQUFBQyxPQUFPLE9BQU8sQ0FBQztBQUNqQixBQUFDLEVBQUM7O0FBRUYsZ0JBQUMseUNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTs7Q0FFdEMsQUFBQyxHQUFLLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztDQUN4QixBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztDQUM3QixBQUFDLEdBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztDQUMvQixBQUFDLEdBQUssQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQzs7Q0FFckMsQUFBQztDQUNELEFBQUMsSUFBSSxLQUFLLEVBQUU7O0lBRVQsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUUsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNsRCxXQUFXLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHO0VBQ3ZDLEFBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJO0VBQ3ZCLEFBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLFVBQVU7S0FDckMsQ0FBQztJQUNGLFdBQVcsQ0FBQyxNQUFNLEdBQUcsWUFBWSxHQUFHLE1BQU0sR0FBRyxtQkFBbUIsR0FBRyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsR0FBRztFQUNyRyxBQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSTtLQUNwQixDQUFDOztJQUVGLElBQUksTUFBTSxFQUFFO0VBQ2QsQUFBQztFQUNELEFBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDL0UsQUFBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7RUFDL0QsQUFBQyxXQUFXLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxHQUFHO0tBQ2pDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSTtLQUN2QixnQkFBZ0IsR0FBRyxNQUFNLENBQUMsTUFBTTtLQUNoQyxvQkFBb0IsR0FBRyxNQUFNLENBQUMsVUFBVTtFQUMzQyxBQUFDLENBQUMsQ0FBQzs7RUFFSCxBQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxhQUFhO09BQ25DLFdBQVcsQ0FBQyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxHQUFHLGdCQUFnQixDQUFDLEdBQUc7R0FDekUsQUFBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7TUFDM0QsR0FBQzs7RUFFTCxBQUFDLElBQUksU0FBUyxFQUFFOztLQUViLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzFGLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQztLQUN2RSxXQUFXLENBQUMsTUFBTSxHQUFHLG9DQUFvQyxDQUFDLEdBQUc7R0FDL0QsQUFBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUk7R0FDM0IsQUFBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsTUFBTTtHQUNwQyxBQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxVQUFVO01BQ3pDLENBQUM7RUFDTCxBQUFDLENBQUMsTUFBTTs7S0FFTCxXQUFXLENBQUMsTUFBTSxHQUFHLG9DQUFvQyxDQUFDLEdBQUc7R0FDL0QsQUFBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUk7TUFDcEIsQ0FBQztFQUNMLEFBQUMsQ0FBQztLQUNDO0NBQ0osQUFBQyxDQUFDOztDQUVGLEFBQUM7Q0FDRCxBQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUM3QyxBQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ2hDLEFBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN0QixBQUFDLEtBQUssSUFBSSxJQUFJLElBQUksV0FBVyxFQUFFO0lBQzVCLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztDQUN2RixBQUFDLENBQUM7QUFDSCxBQUFDLENBQUMsQ0FDRDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7QUN6UXZCO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sSUFBSTs7S0FFRixxQ0FBWSxDQUFDLEdBQUcsVUFBVTtDQUNqQyxBQUFDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwRSxBQUFDLEVBQUM7O0FBRUYsS0FBUSw2QkFBUSxDQUFDLE9BQU8sVUFBVSxRQUFRLFVBQVU7Q0FDbkQsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUNmLEFBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZO0lBQzNDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckYsQUFBQyxFQUFDOztBQUVGLEtBQVEsNkJBQVEsQ0FBQyxPQUFPLFVBQVUsU0FBUyxVQUFVO0NBQ3BELEFBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDO0FBQ3ZDLEFBQUMsRUFBQzs7QUFFRixLQUFRLG1DQUFXLENBQUMsT0FBTyxVQUFVLFNBQVMsVUFBVTtDQUN2RCxBQUFDLEdBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7Q0FDeEUsQUFBQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzRCxBQUFDLEVBQUM7O0FBRUYsS0FBUSwrQ0FBaUIsQ0FBQyxHQUFHLFVBQVUsUUFBUSxZQUFZO0NBQzFELEFBQUMsR0FBSyxDQUFDLE1BQU0sR0FBRywyQkFBMkIsQ0FBQztDQUM1QyxBQUFDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxPQUFPLEVBQUU7SUFDM0MsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3ZDLEFBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTCxBQUFDLEVBQUM7O0FBRUYsQUFBQztFQUNDLEtBQU8scUJBQUksQ0FBQyxHQUFHLFVBQVU7TUFDckIsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ1YsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7TUFDZCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFFLE9BQU8sSUFBSSxHQUFDO01BQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQzFDLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUNsQyxJQUFJLElBQUksQ0FBQyxDQUFDO09BQ1g7TUFDRCxPQUFPLElBQUksQ0FBQztBQUNsQixBQUFDLEVBQUM7O0FBRUYsS0FBUSxxQ0FBWSxDQUFDLEdBQUcsVUFBVTtDQUNqQyxBQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRTtJQUNqQixHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2QixBQUFDLENBQUM7Q0FDRixBQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFDbkIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdELEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxHQUFHLENBQUM7QUFDYixBQUFDLEVBQUM7O0FBRUYsQUFBQztFQUNDLEtBQU8sbUNBQVcsQ0FBQyxHQUFHLFVBQVU7Q0FDakMsQUFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM5QixBQUFDLEdBQUssQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQzFDLEFBQUMsR0FBSyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUMsQUFBQyxHQUFLLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxQyxBQUFDLEdBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUN4RCxBQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN4QyxBQUFDLEVBQUM7O0FBRUYsQUFBQztFQUNDLEtBQU8scUNBQVksQ0FBQyxHQUFHLFVBQVU7Q0FDbEMsQUFBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztFQUM5QyxBQUFDLEdBQUcsR0FBRyxFQUFFO0VBQ1QsQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRztFQUN0QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRztFQUM5QixBQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDN0IsQUFBQyxHQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JJLEFBQUMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDO0FBQ3ZCLEFBQUMsRUFBQzs7QUFFRixLQUFRLHlDQUFjLENBQUMsR0FBRyxVQUFVO0NBQ25DLEFBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDOUIsQUFBQztDQUNELEFBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFO0lBQ25CLE9BQU8sTUFBTSxDQUFDO0NBQ2pCLEFBQUMsQ0FBQztDQUNGLEFBQUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLEFBQUMsRUFBQzs7QUFFRixLQUFRLDZCQUFRLENBQUMsU0FBUyxVQUFVO0NBQ25DLEFBQUMsT0FBTyxnRUFBZ0UsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUYsQUFBQyxFQUFDOztBQUVGLEtBQVEsdUNBQWEsQ0FBQyxHQUFHLFVBQVU7Q0FDbEMsQUFBQztDQUNELEFBQUMsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztBQUM5RSxBQUFDLEVBQUM7O0FBRUYsS0FBUSxxREFBb0IsQ0FBQyxLQUFLLFNBQVMsTUFBTSxVQUFVO0NBQzFELEFBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtJQUM1QyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRW5CLElBQUksQ0FBQyxHQUFHLFlBQVksTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDakQsQUFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLENBQUMsRUFBRTtFQUMzRCxBQUFDLE9BQU8sSUFBSSxDQUFDO0tBQ1Y7Q0FDSixBQUFDLENBQUM7Q0FDRixBQUFDLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQUFBQyxDQUFDLENBRUQ7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwidmVyc2lvblwiOiBcIjAuMC4xXCJcbn0iLCIvLyAgICAgIFxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmNsYXNzIENvb2tpZU1hbmFnZXIge1xyXG5cclxuXHQvKipcclxuXHQgKiBnZXQgdGhlIGNvb2tpZSB2YWx1ZVxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICogQHJldHVybnMge1N0cmluZ31cclxuXHQgKi9cclxuXHRzdGF0aWMgZ2V0Q29va2llKG5hbWUgICAgICAgICkge1xyXG5cdFx0Y29uc3QgdiA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaCgnKF58OykgPycgKyBuYW1lICsgJz0oW147XSopKDt8JCknKTtcclxuXHRcdHJldHVybiB2ID8gdlsyXSA6IG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgY29va2llIHZhbHVlXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvb2tpZS5cclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBjb29raWUuXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRheXMgVGhlIG51bWJlcnMgb2YgZGF5cyB0byBleHBpcmUgdGhlIGNvb2tpZS5cclxuXHQgKi9cclxuXHRzdGF0aWMgc2V0Q29va2llKG5hbWUgICAgICAgICwgdmFsdWUgICAgICAgICwgZGF5cyAgICAgICAgLCBkb21haW4gICAgICAgICAsIHBhdGggICAgICAgICApIHtcclxuXHRcdGNvbnN0IGQgPSBuZXcgRGF0ZTtcclxuXHRcdGQuc2V0VGltZShkLmdldFRpbWUoKSArIDI0KjYwKjYwKjEwMDAqZGF5cyk7XHJcblx0XHRsZXQgY29va2llID0gbmFtZSArIFwiPVwiICsgdmFsdWUgKyBcIjtleHBpcmVzPVwiICsgZC50b0dNVFN0cmluZygpO1xyXG5cdFx0aWYocGF0aCl7XHJcblx0XHRcdGNvb2tpZSArPSBcIjtwYXRoPVwiK3BhdGg7XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Y29va2llICs9IFwiO3BhdGg9L1wiO1xyXG5cdFx0fVxyXG5cdFx0aWYoZG9tYWluKXtcclxuXHRcdFx0Y29va2llICs9IFwiO2RvbWFpbj1cIitkb21haW47XHJcblx0XHR9XHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWU7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZSB0aGUgY29va2llc1xyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjb29raWUuXHJcblx0ICovXHJcblx0c3RhdGljIGRlbGV0ZUNvb2tpZShuYW1lICAgICAgICAsIGRvbWFpbiAgICAgICAgICwgcGF0aCAgICAgICAgICkgeyBcclxuXHRcdHRoaXMuc2V0Q29va2llKG5hbWUsICcnLCAtMSwgZG9tYWluLCBwYXRoKTsgIFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGFsbCBjb29raWVzXHJcblx0ICogQHJldHVybnMge09iamVjdH1cclxuXHQgKi9cclxuXHRzdGF0aWMgZ2V0QWxsQ29va2llcygpe1xyXG5cdFx0Y29uc3QgY29va2llcyA9IHt9O1xyXG5cdFx0ZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKS5mb3JFYWNoKChpdGVtKT0+e1xyXG5cdFx0XHRjb25zdCBjb29raWUgPSBpdGVtLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0Y29va2llc1tjb29raWVbMF1dID0gY29va2llWzFdO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gY29va2llcztcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29va2llTWFuYWdlcjsiLCIvLyAgICAgIFxuXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHRPcHRpb25zXCIpO1xuY29uc3QgY29va2llTWFuYWdlciA9IHJlcXVpcmUoXCIuL2Nvb2tpZU1hbmFnZXJcIik7XG5jb25zdCB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbmNvbnN0IFBvcHVwID0gcmVxdWlyZShcIi4vcG9wdXBcIik7XG5cbmNsYXNzIENvb2tpZWNvbnNlbnQge1xuICAgICAgICAgICAgICAgIFxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICkge1xuICAgIHRoaXMuc3RhdHVzID0ge1xuICAgICAgZGVueTogJ2RlbnknLFxuICAgICAgYWxsb3c6ICdhbGxvdydcbiAgICB9O1xuICAgIFxuICAgIC8vIHNldCBvcHRpb25zIGJhY2sgdG8gZGVmYXVsdCBvcHRpb25zXG5cdFx0dGhpcy5vcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5cblx0XHQvLyBtZXJnZSBpbiB1c2VyIG9wdGlvbnNcblx0XHRpZiAodXRpbC5pc1BsYWluT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0fVxuXG4gICAgLy9UT0RPIHZlciBjb21vIG5vIGRlcGVuZGVyIGRlbCBuYXZpZ2F0b3JcbiAgICB0aGlzLm9wdGlvbnMudXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICB0aGlzLm9wdGlvbnMuaXNNb2JpbGUgPSB1dGlsLmlzTW9iaWxlKHRoaXMub3B0aW9ucy51c2VyQWdlbnQpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBvcHVwID0gbmV3IFBvcHVwKHRoaXMub3B0aW9ucyk7XG4gICAgICBwb3B1cC5zZXRBbGxvd0hhbmRsZXIoKCk9PntcbiAgICAgICAgdGhpcy5zZXRTdGF0dXModGhpcy5zdGF0dXMuYWxsb3cpO1xuICAgICAgICBwb3B1cC5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgICBwb3B1cC5zZXREZW55SGFuZGxlcigoKT0+e1xuICAgICAgICB0aGlzLnNldFN0YXR1cyh0aGlzLnN0YXR1cy5kZW55KTtcbiAgICAgICAgcG9wdXAuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgICAgcmVzb2x2ZShwb3B1cCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb2tpZSBoYXMgYSB2YWxpZCB2YWx1ZVxuICBoYXNBbnN3ZXJlZCgpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2YodGhpcy5nZXRTdGF0dXMoKSkgPj0gMDtcblx0fVxuICBcblx0Ly8gcmV0dXJucyB0cnVlIGlmIHRoZSBjb29raWUgaW5kaWNhdGVzIHRoYXQgY29uc2VudCBoYXMgYmVlbiBnaXZlblxuXHRoYXNDb25zZW50ZWQoKSB7XG5cdFx0bGV0IHZhbCA9IHRoaXMuZ2V0U3RhdHVzKCk7XG5cdFx0cmV0dXJuIHZhbCA9PSB0aGlzLnN0YXR1cy5hbGxvdztcblx0fVxuXG5cdHNldFN0YXR1cyhzdGF0dXMpIHtcblx0XHRjb25zdCBjID0gdGhpcy5vcHRpb25zLmNvb2tpZTtcblx0XHRjb25zdCB2YWx1ZSA9IGNvb2tpZU1hbmFnZXIuZ2V0Q29va2llKGMubmFtZSk7XG5cdFx0Y29uc3QgY2hvc2VuQmVmb3JlID0gT2JqZWN0LmtleXModGhpcy5zdGF0dXMpLmluZGV4T2YodmFsdWUpID49IDA7XG4gIFxuXHRcdC8vIGlmIGBzdGF0dXNgIGlzIHZhbGlkXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuc3RhdHVzKS5pbmRleE9mKHN0YXR1cykgPj0gMCkge1xuXHRcdFx0Ly9UT0RPIGNhbWJpYXIgcG9yIGVsIGNvb2tpZU1hbmFnZXIgeSB2ZXIgc2kgcG9uZXIgbG8gZGVsIGRvbWFpbiB5IGVsIHBhdGhcblx0XHRcdGNvb2tpZU1hbmFnZXIuc2V0Q29va2llKGMubmFtZSwgc3RhdHVzLCBjLmV4cGlyeURheXMsIGMuZG9tYWluLCBjLnBhdGgpO1xuICBcblx0XHQgIFx0dGhpcy5vcHRpb25zLm9uU3RhdHVzQ2hhbmdlLmNhbGwodGhpcywgc3RhdHVzLCBjaG9zZW5CZWZvcmUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0ICBcdHRoaXMuY2xlYXJTdGF0dXMoKTtcblx0XHR9XG5cdH1cblxuXHRnZXRTdGF0dXMoKSB7XG5cdFx0cmV0dXJuIGNvb2tpZU1hbmFnZXIuZ2V0Q29va2llKHRoaXMub3B0aW9ucy5jb29raWUubmFtZSk7XG5cdH1cbiAgXG5cdGNsZWFyU3RhdHVzKCkge1xuXHRcdHZhciBjID0gdGhpcy5vcHRpb25zLmNvb2tpZTtcblx0XHRjb29raWVNYW5hZ2VyLmRlbGV0ZUNvb2tpZShjLm5hbWUsIGMuZG9tYWluLCBjLnBhdGgpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29va2llY29uc2VudDtcblxuLypcbi8vIHRoaXMgZnVuY3Rpb24gY2FsbHMgdGhlIGBvbkNvbXBsZXRlYCBob29rIGFuZCByZXR1cm5zIHRydWUgKGlmIG5lZWRlZCkgYW5kIHJldHVybnMgZmFsc2Ugb3RoZXJ3aXNlXG5mdW5jdGlvbiBjaGVja0NhbGxiYWNrSG9va3MoKSB7XG4gIHZhciBjb21wbGV0ZSA9IHRoaXMub3B0aW9ucy5vbkluaXRpYWxpc2UuYmluZCh0aGlzKTtcblxuICBpZiAoIXdpbmRvdy5uYXZpZ2F0b3IuY29va2llRW5hYmxlZCkge1xuICAgIGNvbXBsZXRlKGNjLnN0YXR1cy5kZW55KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh3aW5kb3cuQ29va2llc09LIHx8IHdpbmRvdy5uYXZpZ2F0b3IuQ29va2llc09LKSB7XG4gICAgY29tcGxldGUoY2Muc3RhdHVzLmFsbG93KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBhbGxvd2VkID0gT2JqZWN0LmtleXMoY2Muc3RhdHVzKTtcbiAgdmFyIGFuc3dlciA9IHRoaXMuZ2V0U3RhdHVzKCk7XG4gIHZhciBtYXRjaCA9IGFsbG93ZWQuaW5kZXhPZihhbnN3ZXIpID49IDA7XG5cbiAgaWYgKG1hdGNoKSB7XG4gICAgY29tcGxldGUoYW5zd2VyKTtcbiAgfVxuICByZXR1cm4gbWF0Y2g7XG59XG5cblx0cmV2b2tlQ2hvaWNlKHByZXZlbnRPcGVuKSB7XG5cdFx0dGhpcy5vcHRpb25zLmVuYWJsZWQgPSB0cnVlO1xuXHRcdHRoaXMuY2xlYXJTdGF0dXMoKTtcbiAgXG5cdFx0dGhpcy5vcHRpb25zLm9uUmV2b2tlQ2hvaWNlLmNhbGwodGhpcyk7XG4gIFxuXHRcdGlmICghcHJldmVudE9wZW4pIHtcblx0XHQgIHRoaXMuYXV0b09wZW4oKTtcblx0XHR9XG5cdH1cblxuY29sb3JTdHlsZXNbcHJlZml4ICsgJy5jYy1yZXZva2UnXSA9IFtcblx0XHRcdCdjb2xvcjogJyArIHBvcHVwLnRleHQsXG5cdFx0XHQnYmFja2dyb3VuZC1jb2xvcjogJyArIHBvcHVwLmJhY2tncm91bmRcblx0XHQgIF07XG5cbmlmICh0aGlzLnJldm9rZUJ0biAmJiB0aGlzLnJldm9rZUJ0bi5wYXJlbnROb2RlKSB7XG5cdFx0dGhpcy5yZXZva2VCdG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnJldm9rZUJ0bik7XG5cdFx0fVxuXHRcdHRoaXMucmV2b2tlQnRuID0gbnVsbDtcblxuLy8gb3BlbnMgdGhlIHBvcHVwIGlmIG5vIGFuc3dlciBoYXMgYmVlbiBnaXZlblxuXHRhdXRvT3BlbigpIHtcblx0XHQhdGhpcy5oYXNBbnN3ZXJlZCgpICYmIHRoaXMub3B0aW9ucy5lbmFibGVkICYmIHRoaXMub3BlbigpO1xuXHR9XG5cblx0YXBwbHlSZXZva2VCdXR0b24oKSB7XG5cdFx0Y29uc3QgY2xhc3NlcyA9IHRoaXMuZ2V0UG9zaXRpb25DbGFzc2VzLmNhbGwodGhpcyk7XG5cdFx0XG5cdFx0aWYgKHRoaXMuY3VzdG9tU3R5bGVTZWxlY3Rvcikge1xuXHRcdFx0Y2xhc3Nlcy5wdXNoKHRoaXMuY3VzdG9tU3R5bGVTZWxlY3Rvcilcblx0XHR9XG5cdFx0Y29uc3QgcmV2b2tlQnRuID0gdGhpcy5vcHRpb25zLnJldm9rZUJ0bi5yZXBsYWNlKCd7e2NsYXNzZXN9fScsIGNsYXNzZXMuam9pbignICcpKTtcblx0XHR0aGlzLnJldm9rZUJ0biA9IGFwcGVuZE1hcmt1cC5jYWxsKHRoaXMsIHJldm9rZUJ0bik7XG5cblx0fVxuXG5cdHRvZ2dsZVJldm9rZUJ1dHRvbihzaG93KSB7XG5cdFx0aWYgKHRoaXMucmV2b2tlQnRuKSB0aGlzLnJldm9rZUJ0bi5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/ICcnIDogJ25vbmUnO1xuXHR9XG5cbiovIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBDb29raWVjb25zZW50ID0gcmVxdWlyZShcIi4vY29va2llY29uc2VudFwiKTtcclxuY29uc3QgQ29va2llTWFuYWdlciA9IHJlcXVpcmUoXCIuL2Nvb2tpZU1hbmFnZXJcIik7XHJcbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gcmVxdWlyZShcIi4vZGVmYXVsdE9wdGlvbnNcIik7XHJcblxyXG5cclxuY2xhc3MgQ29va2llc0lDR0Mge1xyXG5cdCAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0XHJcblx0LyoqXHJcblx0ICogQSBgQ29va2llc0lDR0NgIG9iamVjdCByZXByZXNlbnRzIHRoZSBvYmplY3QgdGhhdCBtYW5hZ2VzIHRoZSBjb29raWUgY29uc2VudCB1bmRlciB0aGUgRXVyb3BlYW4gR0RQUiBsYXdcclxuXHQgKiBkaXNhYmxpbmcgR29vZ2xlIEFuYWx5dGljcyBjb29raWVzIGlmIG5lZWRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIHRoYXQgc2V0cyB0aGUgY29va2llLlxyXG5cdCAqIEBwYXJhbSB7QXJyYXk8U3RyaW5nPn0gZ2FJZHMgQW4gYXJyYXkgd2l0aCB0aGUgR29vZ2xlIEFuYWx5dGljcyBpZHNcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25hbCBvcHRpb25zXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiB2YXIgY29va2llcyA9IG5ldyBDb29raWVzSUNHQyhcInd3dy5pbnN0YW1hcHMuY2F0XCIsIFtcIlVBLTEyMzQ1Njc4LTFcIl0sIHtwb3NpdGlvbjogXCJ0b3BcIiwgY29udGVudCB7IG1lc3NhZ2U6IFwiVm9scyBjb29raWVzP1wiIH19KTtcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihkb21haW4gICAgICAgICwgZ2FJZHMgICAgICAgICAgICAgICAsIG9wdGlvbnMgICAgICAgICApIHtcclxuXHRcdFxyXG5cdFx0Y29uc3QgbWFpbk9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG5cdFx0bWFpbk9wdGlvbnMuY29va2llLmRvbWFpbiA9IGRvbWFpbjtcclxuXHRcdG1haW5PcHRpb25zLm9uSW5pdGlhbGlzZSA9IHRoaXMub25Jbml0O1xyXG5cdFx0bWFpbk9wdGlvbnMub25TdGF0dXNDaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlO1xyXG5cdFx0bWFpbk9wdGlvbnMub25SZXZva2VDaG9pY2UgPSB0aGlzLm9uUmV2b2tlO1xyXG5cdFx0bWFpbk9wdGlvbnMub25Qb3B1cE9wZW4gPSB0aGlzLm9uT3BlbjtcclxuXHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmdhRGlzYWJsZVByZWZpeCA9IFwiZ2EtZGlzYWJsZS1cIjtcclxuXHRcdHRoaXMuZ2FJZHMgPSBnYUlkcztcclxuXHRcdHRoaXMuY29va2llc0VuYWJsZWRIYW5kbGVyID0gbnVsbDtcclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmNvb2tpZWNvbnNlbnQgPSBuZXcgQ29va2llY29uc2VudChtYWluT3B0aW9ucyk7XHJcblx0XHRcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBoYXMgYmVlbiBpbml0aWFsaXplZC5cclxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBjb29raWVzIGRlcGVuZGluZyBvbiBpZiB0aGUgdXNlciBoYXMgY29uc2VudGVkIG9yIG5vdFxyXG5cdCAqL1xyXG5cdG9uSW5pdCgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cdCAgICAgICAgXHJcblx0XHRcdHRoaXMuZW5hYmxlQ29va2llcygpO1xyXG5cdFx0XHRcclxuXHQgICAgfSBlbHNlIHtcclxuXHJcblx0ICAgIFx0dGhpcy5kaXNhYmxlQ29va2llcygpO1xyXG5cdFx0XHRcclxuXHQgICAgfVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBjb29raWUgY29uc2VudCBzdGF0dXMgaGFzIGNoYW5nZWQuXHJcblx0ICogRW5hYmxlcyB0aGUgY29va2llcyBpZiBuZWVkZWRcclxuXHQgKi9cclxuXHRvbkNoYW5nZSgpIHtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNDb25zZW50ZWQoKSkge1xyXG5cdFx0XHJcblx0XHRcdHRoaXMuZW5hYmxlQ29va2llcygpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbnNlbnQgaGFzIGJlZW4gcmV2b2tlZC5cclxuXHQgKiBEaXNhYmxlcyB0aGUgY29va2llc1xyXG5cdCAqL1xyXG5cdG9uUmV2b2tlKCkge1xyXG5cclxuXHRcdHRoaXMuZGlzYWJsZUNvb2tpZXMoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxsYmFjayBjYWxsZWQgd2hlbiB0aGUgY29va2llIGNvbnNlbnQgcG9wdXAgb3Blbi5cclxuXHQgKiBTaG93IHRoZSBwb3B1cFxyXG5cdCAqL1xyXG5cdG9uT3BlbigpIHtcclxuXHJcblx0XHR0aGlzLmRpc2FibGVDb29raWVzKCk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBjb25zZW50ZWRcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRoYXNDb25zZW50ZWQoKSB7XHJcblxyXG5cdFx0Y29uc3QgdHlwZSA9IHRoaXMuY29va2llY29uc2VudC5vcHRpb25zLnR5cGU7XHJcblx0XHRjb25zdCBkaWRDb25zZW50ID0gdGhpcy5jb29raWVjb25zZW50Lmhhc0NvbnNlbnRlZCgpO1xyXG5cclxuXHRcdHJldHVybiB0eXBlID09ICdvcHQtaW4nICYmIGRpZENvbnNlbnRcclxuXHJcblx0fVxyXG5cclxuXHRzZXRDb29raWVzRW5hYmxlSGFuZGxlcihjYWxsYmFjayAgICAgICAgICApe1xyXG5cdFx0dGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIgPSBjYWxsYmFjaztcclxuXHR9XHJcblxyXG5cdGVuYWJsZUNvb2tpZXMoKSB7XHJcblx0XHR0aGlzLmFyZUNvb2tpZXNFbmFibGVkID0gdHJ1ZTtcclxuXHRcdGlmKFwidHJ1ZVwiID09PSBDb29raWVNYW5hZ2VyLmdldENvb2tpZShcImdhRW5hYmxlXCIpKXtcclxuXHRcdFx0dGhpcy5lbmFibGVHQSgpO1xyXG5cdFx0fVxyXG5cdFx0aWYodGhpcy5jb29raWVzRW5hYmxlZEhhbmRsZXIpe1xyXG5cdFx0XHR0aGlzLmNvb2tpZXNFbmFibGVkSGFuZGxlcigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbiBcdHNldENvb2tpZXNEaXNhYmxlZEhhbmRsZXIoY2FsbGJhY2sgICAgICAgICAgKXtcclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cdH1cclxuXHJcblx0ZGlzYWJsZUNvb2tpZXMoKSB7XHJcblxyXG5cdFx0Y29uc3QgYWN0aXZlQ29va2llcyA9IENvb2tpZU1hbmFnZXIuZ2V0QWxsQ29va2llcygpO1xyXG5cdFx0dGhpcy5kaXNhYmxlR0EoKTtcclxuXHJcblx0XHRPYmplY3Qua2V5cyhhY3RpdmVDb29raWVzKS5mb3JFYWNoKFxyXG5cdFx0XHRmdW5jdGlvbihpdGVtKSB7XHJcblx0XHRcdFx0Q29va2llTWFuYWdlci5kZWxldGVDb29raWUoaXRlbSk7XHJcblx0XHRcdH1cclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5hcmVDb29raWVzRW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuY29va2llc0Rpc2FibGVkSGFuZGxlcigpO1xyXG5cclxuXHR9XHJcblxyXG5cdGFyZUNvb2tpZXNFbmFibGVkKCkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLmFyZUNvb2tpZXNFbmFibGVkO1xyXG5cclxuXHR9XHJcblxyXG5cdGVuYWJsZUdBKCkge1xyXG5cclxuXHRcdHRoaXMuY2hhbmdlR0FTdGF0dXNUb0Rpc2FibGVkKGZhbHNlKTtcclxuXHJcblx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwidHJ1ZVwiLCAzNjUpO1xyXG5cclxuXHR9XHJcblxyXG5cdGRpc2FibGVHQSgpIHtcclxuXHJcblx0XHR0aGlzLmNoYW5nZUdBU3RhdHVzVG9EaXNhYmxlZCh0cnVlKTtcclxuXHJcblx0XHRDb29raWVNYW5hZ2VyLnNldENvb2tpZShcImdhRW5hYmxlXCIsIFwiZmFsc2VcIiwgMzY1KTtcclxuXHJcblx0fVxyXG5cclxuXHRjaGFuZ2VHQVN0YXR1c1RvRGlzYWJsZWQoc2hvdWxkRGlzYWJsZSAgICAgICAgICkge1xyXG5cclxuXHRcdHRoaXMuZ2FJZHMuZm9yRWFjaChnYUlkID0+IHtcclxuXHJcblx0XHRcdHdpbmRvd1tgJHt0aGlzLmdhRGlzYWJsZVByZWZpeH0ke2dhSWR9YF0gPSBzaG91bGREaXNhYmxlO1xyXG5cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29va2llc0lDR0M7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuXHQvLyBpZiBmYWxzZSwgdGhpcyBwcmV2ZW50cyB0aGUgcG9wdXAgZnJvbSBzaG93aW5nICh1c2VmdWwgZm9yIGdpdmluZyB0byBjb250cm9sIHRvIGFub3RoZXIgcGllY2Ugb2YgY29kZSlcclxuXHRlbmFibGVkOiB0cnVlLFxyXG5cclxuXHQvLyBvcHRpb25hbCAoZXhwZWN0aW5nIGEgSFRNTCBlbGVtZW50KSBpZiBwYXNzZWQsIHRoZSBwb3B1cCBpcyBhcHBlbmRlZCB0byB0aGlzIGVsZW1lbnQuIGRlZmF1bHQgaXMgYGRvY3VtZW50LmJvZHlgXHJcblx0Y29udGFpbmVyOiBudWxsLFxyXG5cclxuXHQvLyBkZWZhdWx0cyBjb29raWUgb3B0aW9ucyAtIGl0IGlzIFJFQ09NTUVOREVEIHRvIHNldCB0aGVzZSB2YWx1ZXMgdG8gY29ycmVzcG9uZCB3aXRoIHlvdXIgc2VydmVyXHJcblx0Y29va2llOiB7XHJcblx0XHQvLyBUaGlzIGlzIHRoZSBuYW1lIG9mIHRoaXMgY29va2llIC0geW91IGNhbiBpZ25vcmUgdGhpc1xyXG5cdFx0bmFtZTogJ2Nvb2tpZWNvbnNlbnRfc3RhdHVzJyxcclxuXHJcblx0XHQvLyBUaGlzIGlzIHRoZSB1cmwgcGF0aCB0aGF0IHRoZSBjb29raWUgJ25hbWUnIGJlbG9uZ3MgdG8uIFRoZSBjb29raWUgY2FuIG9ubHkgYmUgcmVhZCBhdCB0aGlzIGxvY2F0aW9uXHJcblx0XHRwYXRoOiAnLycsXHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgZG9tYWluIHRoYXQgdGhlIGNvb2tpZSAnbmFtZScgYmVsb25ncyB0by4gVGhlIGNvb2tpZSBjYW4gb25seSBiZSByZWFkIG9uIHRoaXMgZG9tYWluLlxyXG5cdFx0Ly8gIC0gR3VpZGUgdG8gY29va2llIGRvbWFpbnMgLSBodHRwOi8vZXJpay5pby9ibG9nLzIwMTQvMDMvMDQvZGVmaW5pdGl2ZS1ndWlkZS10by1jb29raWUtZG9tYWlucy9cclxuXHRcdGRvbWFpbjogJ2ZpbGUnLFxyXG5cclxuXHRcdC8vIFRoZSBjb29raWVzIGV4cGlyZSBkYXRlLCBzcGVjaWZpZWQgaW4gZGF5cyAoc3BlY2lmeSAtMSBmb3Igbm8gZXhwaXJ5KVxyXG5cdFx0ZXhwaXJ5RGF5czogMzY1LFxyXG5cdH0sXHJcblxyXG5cdC8vIHRoZXNlIGNhbGxiYWNrIGhvb2tzIGFyZSBjYWxsZWQgYXQgY2VydGFpbiBwb2ludHMgaW4gdGhlIHByb2dyYW0gZXhlY3V0aW9uXHJcblx0b25Qb3B1cE9wZW46IGZ1bmN0aW9uKCkge30sXHJcblx0b25Qb3B1cENsb3NlOiBmdW5jdGlvbigpIHt9LFxyXG5cdG9uSW5pdGlhbGlzZTogZnVuY3Rpb24oc3RhdHVzKSB7fSxcclxuXHRvblN0YXR1c0NoYW5nZTogZnVuY3Rpb24oc3RhdHVzLCBjaG9zZW5CZWZvcmUpIHt9LFxyXG5cdG9uUmV2b2tlQ2hvaWNlOiBmdW5jdGlvbigpIHt9LFxyXG5cclxuXHQvLyBlYWNoIGl0ZW0gZGVmaW5lcyB0aGUgaW5uZXIgdGV4dCBmb3IgdGhlIGVsZW1lbnQgdGhhdCBpdCByZWZlcmVuY2VzXHJcblx0Y29udGVudDoge1xyXG5cdFx0aGVhZGVyOiAnQ29va2llcyB1c2VkIG9uIHRoZSB3ZWJzaXRlIScsXHJcblx0ICBtZXNzYWdlOiBcIlBlciB0YWwgZGUgZmVyIGVsIHNlZ3VpbWVudCBkZSB2aXNpdGVzIGFsIG5vc3RyZSBsbG9jIHdlYiwgdXRpbGl0emVtIGdhbGV0ZXMuIEVuIGNhcCBjYXMgZW1tYWdhdHplbWVtIGxhIHZvc3RyYSBpbmZvcm1hY2nDsyBwZXJzb25hbFwiLFxyXG5cdCAgYWxsb3c6IFwiQWNjZXB0YXJcIixcclxuXHQgIGRlbnk6IFwiRGVjbGluZVwiLFxyXG5cdCAgbGluazogXCJwb2zDrXRpY2EgZGUgZ2FsZXRlc1wiLFxyXG5cdFx0aHJlZjogJ2h0dHA6Ly93d3cuaWNnYy5jYXQvTC1JQ0dDL1NvYnJlLWwtSUNHQy9Qb2xpdGlxdWVzL1BvbGl0aWNhLWRlLXByb3RlY2Npby1kZS1kYWRlcy1wZXJzb25hbHMvUG9saXRpY2EtZGUtZ2FsZXRlcy1jb29raWVzJyxcclxuXHRcdGNsb3NlOiAnJiN4Mjc0YzsnLFxyXG5cdH0sXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIEhUTUwgZm9yIHRoZSBlbGVtZW50cyBhYm92ZS4gVGhlIHN0cmluZyB7e2hlYWRlcn19IHdpbGwgYmUgcmVwbGFjZWQgd2l0aCB0aGUgZXF1aXZhbGVudCB0ZXh0IGJlbG93LlxyXG5cdC8vIFlvdSBjYW4gcmVtb3ZlIFwie3toZWFkZXJ9fVwiIGFuZCB3cml0ZSB0aGUgY29udGVudCBkaXJlY3RseSBpbnNpZGUgdGhlIEhUTUwgaWYgeW91IHdhbnQuXHJcblx0Ly9cclxuXHQvLyAgLSBBUklBIHJ1bGVzIHN1Z2dlc3QgdG8gZW5zdXJlIGNvbnRyb2xzIGFyZSB0YWJiYWJsZSAoc28gdGhlIGJyb3dzZXIgY2FuIGZpbmQgdGhlIGZpcnN0IGNvbnRyb2wpLFxyXG5cdC8vICAgIGFuZCB0byBzZXQgdGhlIGZvY3VzIHRvIHRoZSBmaXJzdCBpbnRlcmFjdGl2ZSBjb250cm9sIChodHRwOi8vdzNjLmdpdGh1Yi5pby9hcmlhLWluLWh0bWwvKVxyXG5cdGVsZW1lbnRzOiB7XHJcblx0XHRoZWFkZXI6ICc8c3BhbiBjbGFzcz1cImNjLWhlYWRlclwiPnt7aGVhZGVyfX08L3NwYW4+Jm5ic3A7JyxcclxuXHRcdG1lc3NhZ2U6ICc8c3BhbiBpZD1cImNvb2tpZWNvbnNlbnQ6ZGVzY1wiIGNsYXNzPVwiY2MtbWVzc2FnZVwiPnt7bWVzc2FnZX19PC9zcGFuPicsXHJcblx0XHRtZXNzYWdlbGluazogJzxzcGFuIGlkPVwiY29va2llY29uc2VudDpkZXNjXCIgY2xhc3M9XCJjYy1tZXNzYWdlXCI+e3ttZXNzYWdlfX0gPGEgYXJpYS1sYWJlbD1cImxlYXJuIG1vcmUgYWJvdXQgY29va2llc1wiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVwiMFwiIGNsYXNzPVwiY2MtbGlua1wiIGhyZWY9XCJ7e2hyZWZ9fVwiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXIgbm9mb2xsb3dcIiB0YXJnZXQ9XCJfYmxhbmtcIj57e2xpbmt9fTwvYT48L3NwYW4+JyxcclxuXHRcdGFsbG93OiAnPGEgYXJpYS1sYWJlbD1cImFsbG93IGNvb2tpZXNcIiByb2xlPWJ1dHRvbiB0YWJpbmRleD1cIjBcIiAgY2xhc3M9XCJjYy1idG4gY2MtYWxsb3dcIj57e2FsbG93fX08L2E+JyxcclxuXHRcdGRlbnk6ICc8YSBhcmlhLWxhYmVsPVwiZGVueSBjb29raWVzXCIgcm9sZT1idXR0b24gdGFiaW5kZXg9XCIwXCIgY2xhc3M9XCJjYy1idG4gY2MtZGVueVwiPnt7ZGVueX19PC9hPicsXHJcblx0XHRsaW5rOiAnPGEgYXJpYS1sYWJlbD1cImxlYXJuIG1vcmUgYWJvdXQgY29va2llc1wiIHJvbGU9YnV0dG9uIHRhYmluZGV4PVwiMFwiIGNsYXNzPVwiY2MtbGlua1wiIGhyZWY9XCJ7e2hyZWZ9fVwiIHRhcmdldD1cIl9ibGFua1wiPnt7bGlua319PC9hPicsXHJcblx0XHRjbG9zZTogJzxzcGFuIGFyaWEtbGFiZWw9XCJkaXNtaXNzIGNvb2tpZSBtZXNzYWdlXCIgcm9sZT1idXR0b24gdGFiaW5kZXg9XCIwXCIgY2xhc3M9XCJjYy1jbG9zZVwiPnt7Y2xvc2V9fTwvc3Bhbj4nLFxyXG5cdH0sXHJcblxyXG5cdC8vIFRoZSBwbGFjZWhvbGRlcnMge3tjbGFzc2VzfX0gYW5kIHt7Y2hpbGRyZW59fSBib3RoIGdldCByZXBsYWNlZCBkdXJpbmcgaW5pdGlhbGlzYXRpb246XHJcblx0Ly8gIC0ge3tjbGFzc2VzfX0gaXMgd2hlcmUgYWRkaXRpb25hbCBjbGFzc2VzIGdldCBhZGRlZFxyXG5cdC8vICAtIHt7Y2hpbGRyZW59fSBpcyB3aGVyZSB0aGUgSFRNTCBjaGlsZHJlbiBhcmUgcGxhY2VkXHJcblx0d2luZG93OiAnPGRpdiByb2xlPVwiZGlhbG9nXCIgYXJpYS1saXZlPVwicG9saXRlXCIgYXJpYS1sYWJlbD1cImNvb2tpZWNvbnNlbnRcIiBhcmlhLWRlc2NyaWJlZGJ5PVwiY29va2llY29uc2VudDpkZXNjXCIgY2xhc3M9XCJjYy13aW5kb3cge3tjbGFzc2VzfX1cIj48IS0tZ29vZ2xlb2ZmOiBhbGwtLT57e2NoaWxkcmVufX08IS0tZ29vZ2xlb246IGFsbC0tPjwvZGl2PicsXHJcblxyXG5cdC8vIFRoaXMgaXMgdGhlIGh0bWwgZm9yIHRoZSByZXZva2UgYnV0dG9uLiBUaGlzIG9ubHkgc2hvd3MgdXAgYWZ0ZXIgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIHRoZWlyIGxldmVsIG9mIGNvbnNlbnRcclxuXHQvLyBJdCBjYW4gYmUgZW5hYmxlZCBvZiBkaXNhYmxlZCB1c2luZyB0aGUgYHJldm9rYWJsZWAgb3B0aW9uXHJcblx0cmV2b2tlQnRuOiAnPGRpdiBjbGFzcz1cImNjLXJldm9rZSB7e2NsYXNzZXN9fVwiPlJldm9jYXI8L2Rpdj4nLFxyXG5cclxuXHQvLyBkZWZpbmUgdHlwZXMgb2YgJ2NvbXBsaWFuY2UnIGhlcmUuICd7e3ZhbHVlfX0nIHN0cmluZ3MgaW4gaGVyZSBhcmUgbGlua2VkIHRvIGBlbGVtZW50c2BcclxuXHRjb21wbGlhbmNlOiAnPGRpdiBjbGFzcz1cImNjLWNvbXBsaWFuY2UgY2MtaGlnaGxpZ2h0XCI+e3tkZW55fX17e2FsbG93fX08L2Rpdj4nLFxyXG5cdFxyXG5cdC8vIGRlZmluZSBsYXlvdXQgbGF5b3V0cyBoZXJlXHJcblx0bGF5b3V0czoge1xyXG5cdFx0Ly8gdGhlICdibG9jaycgbGF5b3V0IHRlbmQgdG8gYmUgZm9yIHNxdWFyZSBmbG9hdGluZyBwb3B1cHNcclxuXHRcdCdiYXNpYyc6ICd7e21lc3NhZ2VsaW5rfX17e2NvbXBsaWFuY2V9fScsXHJcblx0XHQnYmFzaWMtY2xvc2UnOiAne3ttZXNzYWdlbGlua319e3tjb21wbGlhbmNlfX17e2Nsb3NlfX0nLFxyXG5cdFx0J2Jhc2ljLWhlYWRlcic6ICd7e2hlYWRlcn19e3ttZXNzYWdlfX17e2xpbmt9fXt7Y29tcGxpYW5jZX19JyxcclxuXHJcblx0XHQvLyBhZGQgYSBjdXN0b20gbGF5b3V0IGhlcmUsIHRoZW4gYWRkIHNvbWUgbmV3IGNzcyB3aXRoIHRoZSBjbGFzcyAnLmNjLWxheW91dC1teS1jb29sLWxheW91dCdcclxuXHRcdC8vJ215LWNvb2wtbGF5b3V0JzogJzxkaXYgY2xhc3M9XCJteS1zcGVjaWFsLWxheW91dFwiPnt7bWVzc2FnZX19e3tjb21wbGlhbmNlfX08L2Rpdj57e2Nsb3NlfX0nLFxyXG5cdH0sXHJcblxyXG5cdC8vIGRlZmF1bHQgbGF5b3V0IChzZWUgYWJvdmUpXHJcblx0bGF5b3V0OiAnYmFzaWMnLFxyXG5cclxuXHQvLyB0aGlzIHJlZmVycyB0byB0aGUgcG9wdXAgd2luZG93cyBwb3NpdGlvbi4gd2UgY3VycmVudGx5IHN1cHBvcnQ6XHJcblx0Ly8gIC0gYmFubmVyIHBvc2l0aW9uczogdG9wLCBib3R0b21cclxuXHQvLyAgLSBmbG9hdGluZyBwb3NpdGlvbnM6IHRvcC1sZWZ0LCB0b3AtcmlnaHQsIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHRcclxuXHQvL1xyXG5cdC8vIGFkZHMgYSBjbGFzcyBgY2MtZmxvYXRpbmdgIG9yIGBjYy1iYW5uZXJgIHdoaWNoIGhlbHBzIHdoZW4gc3R5bGluZ1xyXG5cdHBvc2l0aW9uOiAnYm90dG9tJywgLy8gZGVmYXVsdCBwb3NpdGlvbiBpcyAnYm90dG9tJ1xyXG5cclxuXHQvLyBBdmFpbGFibGUgc3R5bGVzXHJcblx0Ly8gICAgLWJsb2NrIChkZWZhdWx0LCBubyBleHRyYSBjbGFzc2VzKVxyXG5cdC8vICAgIC1lZGdlbGVzc1xyXG5cdC8vICAgIC1jbGFzc2ljXHJcblx0Ly8gdXNlIHlvdXIgb3duIHN0eWxlIG5hbWUgYW5kIHVzZSBgLmNjLXRoZW1lLVNUWUxFTkFNRWAgY2xhc3MgaW4gQ1NTIHRvIGVkaXQuXHJcblx0Ly8gTm90ZTogc3R5bGUgXCJ3aXJlXCIgaXMgdXNlZCBmb3IgdGhlIGNvbmZpZ3VyYXRvciwgYnV0IGhhcyBubyBDU1Mgc3R5bGVzIG9mIGl0cyBvd24sIG9ubHkgcGFsZXR0ZSBpcyB1c2VkLlxyXG5cdHRoZW1lOiAnYmxvY2snLFxyXG5cclxuXHQvLyBpZiB5b3Ugd2FudCBjdXN0b20gY29sb3VycywgcGFzcyB0aGVtIGluIGhlcmUuIHRoaXMgb2JqZWN0IHNob3VsZCBsb29rIGxpa2UgdGhpcy5cclxuXHQvLyBpZGVhbGx5LCBhbnkgY3VzdG9tIGNvbG91cnMvdGhlbWVzIHNob3VsZCBiZSBjcmVhdGVkIGluIGEgc2VwYXJhdGUgc3R5bGUgc2hlZXQsIGFzIHRoaXMgaXMgbW9yZSBlZmZpY2llbnQuXHJcblx0Ly8gICB7XHJcblx0Ly8gICAgIHBvcHVwOiB7YmFja2dyb3VuZDogJyMwMDAwMDAnLCB0ZXh0OiAnI2ZmZicsIGxpbms6ICcjZmZmJ30sXHJcblx0Ly8gICAgIGJ1dHRvbjoge2JhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnI2Y4ZTcxYyd9LFxyXG5cdC8vICAgICBoaWdobGlnaHQ6IHtiYWNrZ3JvdW5kOiAnI2Y4ZTcxYycsIGJvcmRlcjogJyNmOGU3MWMnLCB0ZXh0OiAnIzAwMDAwMCd9LFxyXG5cdC8vICAgfVxyXG5cdC8vIGBoaWdobGlnaHRgIGlzIG9wdGlvbmFsIGFuZCBleHRlbmRzIGBidXR0b25gLiBpZiBpdCBleGlzdHMsIGl0IHdpbGwgYXBwbHkgdG8gdGhlIGZpcnN0IGJ1dHRvblxyXG5cdC8vIG9ubHkgYmFja2dyb3VuZCBuZWVkcyB0byBiZSBkZWZpbmVkIGZvciBldmVyeSBlbGVtZW50LiBpZiBub3Qgc2V0LCBvdGhlciBjb2xvcnMgY2FuIGJlIGNhbGN1bGF0ZWQgZnJvbSBpdFxyXG5cdHBhbGV0dGU6e1xyXG5cdCAgcG9wdXA6IHtiYWNrZ3JvdW5kOiBcIiMyMjIyMjJcIn0sXHJcblx0ICBidXR0b246IHtiYWNrZ3JvdW5kOiBcIiMwMGIwNTBcIn1cclxuXHR9LFxyXG59OyIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgdmVyc2lvbiAgICAgICAgID0gcmVxdWlyZShcIi4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9uO1xyXG5jb25zdCBDb29raWVzSUNHQyA9IHJlcXVpcmUoXCIuL2Nvb2tpZXNJY2djXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0dmVyc2lvbixcclxuXHRDb29raWVzSUNHQ1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBwcm9qZWN0IGluIHVzZSBhcyBzcGVjaWZpZWQgaW4gYHBhY2thZ2UuanNvbmAsXHJcbiAqIGBDSEFOR0VMT0cubWRgLCBhbmQgdGhlIEdpdEh1YiByZWxlYXNlLlxyXG4gKlxyXG4gKiBAdmFyIHtzdHJpbmd9IHZlcnNpb25cclxuICovXHJcbiIsIi8vICAgICAgXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XHJcblxyXG5jbGFzcyBQb3B1cCB7XHJcblx0ICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgICAgICAgICwgc3RhdHVzTGlzdCAgICAgICAgKXtcclxuXHJcblx0XHR0aGlzLnN0YXR1c0xpc3QgPSBzdGF0dXNMaXN0O1xyXG5cdFx0dGhpcy5hbGxvd0hhbmRsZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IG51bGw7XHJcblx0XHRcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMpIHtcclxuXHRcdFx0dGhpcy5kZXN0cm95KCk7IC8vIGFscmVhZHkgcmVuZGVyZWRcclxuXHRcdH1cclxuXHJcblx0XHQvLyBzZXQgb3B0aW9ucyBiYWNrIHRvIGRlZmF1bHQgb3B0aW9uc1xyXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuXHJcblx0XHQvLyB0aGUgZnVsbCBtYXJrdXAgZWl0aGVyIGNvbnRhaW5zIHRoZSB3cmFwcGVyIG9yIGl0IGRvZXMgbm90IChmb3IgbXVsdGlwbGUgaW5zdGFuY2VzKVxyXG5cdFx0bGV0IGNvb2tpZVBvcHVwID0gdGhpcy5vcHRpb25zLndpbmRvdy5yZXBsYWNlKCd7e2NsYXNzZXN9fScsIHRoaXMuZ2V0UG9wdXBDbGFzc2VzLmNhbGwodGhpcykuam9pbignICcpKVxyXG4gICAgICAgIFx0LnJlcGxhY2UoJ3t7Y2hpbGRyZW59fScsIHRoaXMuZ2V0UG9wdXBJbm5lck1hcmt1cC5jYWxsKHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLmVsZW1lbnQgPSB0aGlzLmFwcGVuZE1hcmt1cC5jYWxsKHRoaXMsIGNvb2tpZVBvcHVwKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vcGVuKCk7XHJcblxyXG5cdH1cclxuXHJcblx0ZGVzdHJveSgpe1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNjLWFsbG93JykucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmFsbG93SGFuZGxlcik7XHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2MtZGVueScpLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kZW55SGFuZGxlcik7XHJcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IG51bGw7XHJcblx0XHR0aGlzLmRlbnlIYW5kbGVyID0gbnVsbDtcclxuXHJcblx0XHRpZiAodGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKSB7XHJcblx0XHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmVsZW1lbnQgPSBudWxsO1xyXG5cdFxyXG5cdFx0dGhpcy5vcHRpb25zID0gbnVsbDtcclxuXHR9XHJcblxyXG5cdG9wZW4oKSB7XHJcblx0XHRpZiAoIXRoaXMuZWxlbWVudCkgcmV0dXJuO1xyXG4gIFxyXG5cdFx0aWYgKCF0aGlzLmlzT3BlbigpKSB7XHJcblx0XHQgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJyc7XHJcblx0XHQgIFxyXG5cdFx0ICB1dGlsLnJlbW92ZUNsYXNzKHRoaXMuZWxlbWVudCwgJ2NjLWludmlzaWJsZScpO1xyXG5cclxuXHRcdCAgdGhpcy5vcHRpb25zLm9uUG9wdXBPcGVuLmNhbGwodGhpcyk7XHJcblx0XHR9XHJcbiAgXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdGNsb3NlKCkge1xyXG5cdFx0aWYgKCF0aGlzLmVsZW1lbnQpIHJldHVybjtcclxuICBcclxuXHRcdGlmICh0aGlzLmlzT3BlbigpKSB7XHJcblx0XHQgIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdFx0ICBcclxuXHRcdCAgdGhpcy5vcHRpb25zLm9uUG9wdXBDbG9zZS5jYWxsKHRoaXMpO1xyXG5cdFx0fVxyXG4gIFxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHRpc09wZW4oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09ICcnICYmICF1dGlsLmhhc0NsYXNzKHRoaXMuZWxlbWVudCwgJ2NjLWludmlzaWJsZScpO1xyXG5cdH1cclxuXHJcblx0Z2V0UG9zaXRpb25DbGFzc2VzKCkge1xyXG5cdFx0Y29uc3QgcG9zaXRpb25zID0gdGhpcy5vcHRpb25zLnBvc2l0aW9uLnNwbGl0KCctJyk7IC8vIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodFxyXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtdO1xyXG4gIFxyXG5cdFx0Ly8gdG9wLCBsZWZ0LCByaWdodCwgYm90dG9tXHJcblx0XHRwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbihjdXIpIHtcclxuXHRcdCAgY2xhc3Nlcy5wdXNoKCdjYy0nICsgY3VyKTtcclxuXHRcdH0pO1xyXG4gIFxyXG5cdFx0cmV0dXJuIGNsYXNzZXM7XHJcblx0fVxyXG5cclxuXHRnZXRQb3B1cENsYXNzZXMoKSB7XHJcblx0XHRjb25zdCBvcHRzID0gdGhpcy5vcHRpb25zO1xyXG5cdFx0bGV0IHBvc2l0aW9uU3R5bGUgPSAob3B0cy5wb3NpdGlvbiA9PSAndG9wJyB8fCBvcHRzLnBvc2l0aW9uID09ICdib3R0b20nKSA/ICdiYW5uZXInIDogJ2Zsb2F0aW5nJztcclxuICBcclxuXHRcdGlmIChvcHRzLmlzTW9iaWxlKSB7XHJcblx0XHQgIHBvc2l0aW9uU3R5bGUgPSAnZmxvYXRpbmcnO1xyXG5cdFx0fVxyXG4gIFxyXG5cdFx0Y29uc3QgY2xhc3NlcyA9IFtcclxuXHRcdCAgJ2NjLScgKyBwb3NpdGlvblN0eWxlLCAvLyBmbG9hdGluZyBvciBiYW5uZXJcclxuXHRcdCAgJ2NjLXR5cGUtb3B0LWluJywgLy8gYWRkIHRoZSBjb21wbGlhbmNlIHR5cGVcclxuXHRcdCAgJ2NjLXRoZW1lLScgKyBvcHRzLnRoZW1lLCAvLyBhZGQgdGhlIHRoZW1lXHJcblx0XHRdO1xyXG4gIFxyXG5cdFx0aWYgKG9wdHMuc3RhdGljKSB7XHJcblx0XHQgIGNsYXNzZXMucHVzaCgnY2Mtc3RhdGljJyk7XHJcblx0XHR9XHJcbiAgXHJcblx0XHRjbGFzc2VzLnB1c2guYXBwbHkoY2xhc3NlcywgdGhpcy5nZXRQb3NpdGlvbkNsYXNzZXMuY2FsbCh0aGlzKSk7XHJcbiAgXHJcblx0XHQvLyB3ZSBvbmx5IGFkZCBleHRyYSBzdHlsZXMgaWYgYHBhbGV0dGVgIGhhcyBiZWVuIHNldCB0byBhIHZhbGlkIHZhbHVlXHJcblx0XHRjb25zdCBkaWRBdHRhY2ggPSB0aGlzLmF0dGFjaEN1c3RvbVBhbGV0dGUuY2FsbCh0aGlzLCB0aGlzLm9wdGlvbnMucGFsZXR0ZSk7XHJcbiAgXHJcblx0XHQvLyBpZiB3ZSBvdmVycmlkZSB0aGUgcGFsZXR0ZSwgYWRkIHRoZSBjbGFzcyB0aGF0IGVuYWJsZXMgdGhpc1xyXG5cdFx0aWYgKHRoaXMuY3VzdG9tU3R5bGVTZWxlY3Rvcikge1xyXG5cdFx0ICBjbGFzc2VzLnB1c2godGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yKTtcclxuXHRcdH1cclxuICBcclxuXHRcdHJldHVybiBjbGFzc2VzO1xyXG5cdH1cclxuXHJcblx0Z2V0UG9wdXBJbm5lck1hcmt1cCgpIHtcclxuXHRcdGNvbnN0IGludGVycG9sYXRlZCA9IHt9O1xyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuICBcclxuXHRcdE9iamVjdC5rZXlzKG9wdHMuZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xyXG5cdFx0ICBpbnRlcnBvbGF0ZWRbcHJvcF0gPSB1dGlsLmludGVycG9sYXRlU3RyaW5nKG9wdHMuZWxlbWVudHNbcHJvcF0sIGZ1bmN0aW9uKG5hbWUpIHtcclxuXHRcdFx0Y29uc3Qgc3RyID0gb3B0cy5jb250ZW50W25hbWVdO1xyXG5cdFx0XHRyZXR1cm4gKG5hbWUgJiYgdHlwZW9mIHN0ciA9PSAnc3RyaW5nJyAmJiBzdHIubGVuZ3RoKSA/IHN0ciA6ICcnO1xyXG5cdFx0ICB9KVxyXG5cdFx0fSk7XHJcbiAgXHJcblx0XHQvLyBjaGVja3MgaWYgdGhlIHR5cGUgaXMgdmFsaWQgYW5kIGRlZmF1bHRzIHRvIGluZm8gaWYgaXQncyBub3RcclxuXHRcdGNvbnN0IGNvbXBsaWFuY2VUeXBlID0gb3B0cy5jb21wbGlhbmNlO1xyXG5cdFx0ICBcclxuXHRcdC8vIGJ1aWxkIHRoZSBjb21wbGlhbmNlIHR5cGVzIGZyb20gdGhlIGFscmVhZHkgaW50ZXJwb2xhdGVkIGBlbGVtZW50c2BcclxuXHRcdGludGVycG9sYXRlZC5jb21wbGlhbmNlID0gdXRpbC5pbnRlcnBvbGF0ZVN0cmluZyhjb21wbGlhbmNlVHlwZSwgZnVuY3Rpb24obmFtZSkge1xyXG5cdFx0ICByZXR1cm4gaW50ZXJwb2xhdGVkW25hbWVdO1xyXG5cdFx0fSk7XHJcbiAgXHJcblx0XHQvLyBjaGVja3MgaWYgdGhlIGxheW91dCBpcyB2YWxpZCBhbmQgZGVmYXVsdHMgdG8gYmFzaWMgaWYgaXQncyBub3RcclxuXHRcdGxldCBsYXlvdXQgPSBvcHRzLmxheW91dHNbb3B0cy5sYXlvdXRdO1xyXG5cdFx0aWYgKCFsYXlvdXQpIHtcclxuXHRcdCAgbGF5b3V0ID0gb3B0cy5sYXlvdXRzLmJhc2ljO1xyXG5cdFx0fVxyXG4gIFxyXG5cdFx0cmV0dXJuIHV0aWwuaW50ZXJwb2xhdGVTdHJpbmcobGF5b3V0LCBmdW5jdGlvbihtYXRjaCkge1xyXG5cdFx0ICByZXR1cm4gaW50ZXJwb2xhdGVkW21hdGNoXTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0YXBwZW5kTWFya3VwKG1hcmt1cCkge1xyXG5cdFx0Y29uc3Qgb3B0cyA9IHRoaXMub3B0aW9ucztcclxuXHRcdGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cdFx0Y29uc3QgY29udCA9IChvcHRzLmNvbnRhaW5lciAmJiBvcHRzLmNvbnRhaW5lci5ub2RlVHlwZSA9PT0gMSkgPyBvcHRzLmNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XHJcbiAgXHJcblx0XHRkaXYuaW5uZXJIVE1MID0gbWFya3VwO1xyXG4gIFxyXG5cdFx0Y29uc3QgZWwgPSBkaXYuY2hpbGRyZW5bMF07XHJcbiAgXHJcblx0XHRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIFxyXG5cdFx0aWYgKHV0aWwuaGFzQ2xhc3MoZWwsICdjYy13aW5kb3cnKSkge1xyXG5cdFx0ICB1dGlsLmFkZENsYXNzKGVsLCAnY2MtaW52aXNpYmxlJyk7XHJcblx0XHR9XHJcbiAgXHJcblx0XHRpZiAoIWNvbnQuZmlyc3RDaGlsZCkge1xyXG5cdFx0XHRjb250LmFwcGVuZENoaWxkKGVsKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnQuaW5zZXJ0QmVmb3JlKGVsLCBjb250LmZpcnN0Q2hpbGQpXHJcblx0XHR9XHJcbiAgXHRcdFxyXG5cdFx0XHJcblx0XHRcclxuXHRcdHJldHVybiBlbDtcclxuXHR9XHJcblxyXG5cdHNldEFsbG93SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApe1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNjLWFsbG93JykucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmFsbG93SGFuZGxlcik7XHJcblx0XHR0aGlzLmFsbG93SGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNjLWFsbG93JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYWxsYmFjayk7XHJcblx0fVxyXG5cclxuXHRzZXREZW55SGFuZGxlcihjYWxsYmFjayAgICAgICAgICApe1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNjLWRlbnknKS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGVueUhhbmRsZXIpO1xyXG5cdFx0dGhpcy5kZW55SGFuZGxlciA9IGNhbGxiYWNrO1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNjLWRlbnknKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKTtcclxuXHR9XHJcblxyXG5cdC8vIEkgbWlnaHQgY2hhbmdlIHRoaXMgZnVuY3Rpb24gdG8gdXNlIGlubGluZSBzdHlsZXMuIEkgb3JpZ2luYWxseSBjaG9zZSBhIHN0eWxlc2hlZXQgYmVjYXVzZSBJIGNvdWxkIHNlbGVjdCBtYW55IGVsZW1lbnRzIHdpdGggYVxyXG4gICAgLy8gc2luZ2xlIHJ1bGUgKHNvbWV0aGluZyB0aGF0IGhhcHBlbmVkIGEgbG90KSwgdGhlIGFwcHMgaGFzIGNoYW5nZWQgc2xpZ2h0bHkgbm93IHRob3VnaCwgc28gaW5saW5lIHN0eWxlcyBtaWdodCBiZSBtb3JlIGFwcGxpY2FibGUuXHJcbiAgICBhdHRhY2hDdXN0b21QYWxldHRlKHBhbGV0dGUpIHtcclxuXHRcdGNvbnN0IGhhc2ggPSB1dGlsLmhhc2goSlNPTi5zdHJpbmdpZnkocGFsZXR0ZSkpO1xyXG5cdFx0Y29uc3Qgc2VsZWN0b3IgPSAnY2MtY29sb3Itb3ZlcnJpZGUtJyArIGhhc2g7XHJcblx0XHRjb25zdCBpc1ZhbGlkID0gdXRpbC5pc1BsYWluT2JqZWN0KHBhbGV0dGUpO1xyXG4gIFxyXG5cdFx0dGhpcy5jdXN0b21TdHlsZVNlbGVjdG9yID0gaXNWYWxpZCA/IHNlbGVjdG9yIDogbnVsbDtcclxuICBcclxuXHRcdGlmIChpc1ZhbGlkKSB7XHJcblx0XHQgIHRoaXMuYWRkQ3VzdG9tU3R5bGUoaGFzaCwgcGFsZXR0ZSwgJy4nICsgc2VsZWN0b3IpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGlzVmFsaWQ7XHJcblx0fVxyXG5cclxuXHRhZGRDdXN0b21TdHlsZShoYXNoLCBwYWxldHRlLCBwcmVmaXgpIHtcclxuXHJcblx0XHRjb25zdCBjb2xvclN0eWxlcyA9IHt9O1xyXG5cdFx0Y29uc3QgcG9wdXAgPSBwYWxldHRlLnBvcHVwO1xyXG5cdFx0Y29uc3QgYnV0dG9uID0gcGFsZXR0ZS5idXR0b247XHJcblx0XHRjb25zdCBoaWdobGlnaHQgPSBwYWxldHRlLmhpZ2hsaWdodDtcclxuICBcclxuXHRcdC8vIG5lZWRzIGJhY2tncm91bmQgY29sb3VyLCB0ZXh0IGFuZCBsaW5rIHdpbGwgYmUgc2V0IHRvIGJsYWNrL3doaXRlIGlmIG5vdCBzcGVjaWZpZWRcclxuXHRcdGlmIChwb3B1cCkge1xyXG5cdFx0ICAvLyBhc3N1bWVzIHBvcHVwLmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHQgIHBvcHVwLnRleHQgPSBwb3B1cC50ZXh0ID8gcG9wdXAudGV4dCA6IHV0aWwuZ2V0Q29udHJhc3QocG9wdXAuYmFja2dyb3VuZCk7XHJcblx0XHQgIHBvcHVwLmxpbmsgPSBwb3B1cC5saW5rID8gcG9wdXAubGluayA6IHBvcHVwLnRleHQ7XHJcblx0XHQgIGNvbG9yU3R5bGVzW3ByZWZpeCArICcuY2Mtd2luZG93J10gPSBbXHJcblx0XHRcdCdjb2xvcjogJyArIHBvcHVwLnRleHQsXHJcblx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yOiAnICsgcG9wdXAuYmFja2dyb3VuZFxyXG5cdFx0ICBdO1xyXG5cdFx0ICBjb2xvclN0eWxlc1twcmVmaXggKyAnIC5jYy1saW5rLCcgKyBwcmVmaXggKyAnIC5jYy1saW5rOmFjdGl2ZSwnICsgcHJlZml4ICsgJyAuY2MtbGluazp2aXNpdGVkJ10gPSBbXHJcblx0XHRcdCdjb2xvcjogJyArIHBvcHVwLmxpbmtcclxuXHRcdCAgXTtcclxuICBcclxuXHRcdCAgaWYgKGJ1dHRvbikge1xyXG5cdFx0XHQvLyBhc3N1bWVzIGJ1dHRvbi5iYWNrZ3JvdW5kIGlzIHNldFxyXG5cdFx0XHRidXR0b24udGV4dCA9IGJ1dHRvbi50ZXh0ID8gYnV0dG9uLnRleHQgOiB1dGlsLmdldENvbnRyYXN0KGJ1dHRvbi5iYWNrZ3JvdW5kKTtcclxuXHRcdFx0YnV0dG9uLmJvcmRlciA9IGJ1dHRvbi5ib3JkZXIgPyBidXR0b24uYm9yZGVyIDogJ3RyYW5zcGFyZW50JztcclxuXHRcdFx0Y29sb3JTdHlsZXNbcHJlZml4ICsgJyAuY2MtYnRuJ10gPSBbXHJcblx0XHRcdCAgJ2NvbG9yOiAnICsgYnV0dG9uLnRleHQsXHJcblx0XHRcdCAgJ2JvcmRlci1jb2xvcjogJyArIGJ1dHRvbi5ib3JkZXIsXHJcblx0XHRcdCAgJ2JhY2tncm91bmQtY29sb3I6ICcgKyBidXR0b24uYmFja2dyb3VuZFxyXG5cdFx0XHRdO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoYnV0dG9uLmJhY2tncm91bmQgIT0gJ3RyYW5zcGFyZW50JykgXHJcblx0XHRcdCAgY29sb3JTdHlsZXNbcHJlZml4ICsgJyAuY2MtYnRuOmhvdmVyLCAnICsgcHJlZml4ICsgJyAuY2MtYnRuOmZvY3VzJ10gPSBbXHJcblx0XHRcdFx0J2JhY2tncm91bmQtY29sb3I6ICcgKyB1dGlsLmdldEhvdmVyQ29sb3VyKGJ1dHRvbi5iYWNrZ3JvdW5kKVxyXG5cdFx0XHQgIF07XHJcbiAgXHJcblx0XHRcdGlmIChoaWdobGlnaHQpIHtcclxuXHRcdFx0ICAvL2Fzc3VtZXMgaGlnaGxpZ2h0LmJhY2tncm91bmQgaXMgc2V0XHJcblx0XHRcdCAgaGlnaGxpZ2h0LnRleHQgPSBoaWdobGlnaHQudGV4dCA/IGhpZ2hsaWdodC50ZXh0IDogdXRpbC5nZXRDb250cmFzdChoaWdobGlnaHQuYmFja2dyb3VuZCk7XHJcblx0XHRcdCAgaGlnaGxpZ2h0LmJvcmRlciA9IGhpZ2hsaWdodC5ib3JkZXIgPyBoaWdobGlnaHQuYm9yZGVyIDogJ3RyYW5zcGFyZW50JztcclxuXHRcdFx0ICBjb2xvclN0eWxlc1twcmVmaXggKyAnIC5jYy1oaWdobGlnaHQgLmNjLWJ0bjpmaXJzdC1jaGlsZCddID0gW1xyXG5cdFx0XHRcdCdjb2xvcjogJyArIGhpZ2hsaWdodC50ZXh0LFxyXG5cdFx0XHRcdCdib3JkZXItY29sb3I6ICcgKyBoaWdobGlnaHQuYm9yZGVyLFxyXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWNvbG9yOiAnICsgaGlnaGxpZ2h0LmJhY2tncm91bmRcclxuXHRcdFx0ICBdO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHQgIC8vIHNldHMgaGlnaGxpZ2h0IHRleHQgY29sb3IgdG8gcG9wdXAgdGV4dC4gYmFja2dyb3VuZCBhbmQgYm9yZGVyIGFyZSB0cmFuc3BhcmVudCBieSBkZWZhdWx0LlxyXG5cdFx0XHQgIGNvbG9yU3R5bGVzW3ByZWZpeCArICcgLmNjLWhpZ2hsaWdodCAuY2MtYnRuOmZpcnN0LWNoaWxkJ10gPSBbXHJcblx0XHRcdFx0J2NvbG9yOiAnICsgcG9wdXAudGV4dFxyXG5cdFx0XHQgIF07XHJcblx0XHRcdH1cclxuXHRcdCAgfVxyXG5cdFx0fVxyXG4gIFxyXG5cdFx0Ly8gdGhpcyB3aWxsIGJlIGludGVycHJldHRlZCBhcyBDU1MuIHRoZSBrZXkgaXMgdGhlIHNlbGVjdG9yLCBhbmQgZWFjaCBhcnJheSBlbGVtZW50IGlzIGEgcnVsZVxyXG5cdFx0bGV0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gIFx0XHRsZXQgcnVsZUluZGV4ID0gLTE7XHJcblx0XHRmb3IgKHZhciBwcm9wIGluIGNvbG9yU3R5bGVzKSB7XHJcblx0XHQgIHN0eWxlLnNoZWV0Lmluc2VydFJ1bGUocHJvcCArICd7JyArIGNvbG9yU3R5bGVzW3Byb3BdLmpvaW4oJzsnKSArICd9JywgKytydWxlSW5kZXgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb3B1cDtcclxuIiwiLy8gICAgICBcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jbGFzcyBVdGlsIHtcclxuXHJcblx0c3RhdGljIGVzY2FwZVJlZ0V4cChzdHIgICAgICAgICkge1xyXG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC9bXFwtXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgJ1xcXFwkJicpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGhhc0NsYXNzKGVsZW1lbnQgICAgICAgICwgc2VsZWN0b3IgICAgICAgICkge1xyXG5cdFx0Y29uc3QgcyA9ICcgJztcclxuXHRcdHJldHVybiBlbGVtZW50Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxyXG5cdFx0ICAocyArIGVsZW1lbnQuY2xhc3NOYW1lICsgcykucmVwbGFjZSgvW1xcblxcdF0vZywgcykuaW5kZXhPZihzICsgc2VsZWN0b3IgKyBzKSA+PSAwO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGFkZENsYXNzKGVsZW1lbnQgICAgICAgICwgY2xhc3NOYW1lICAgICAgICApIHtcclxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyByZW1vdmVDbGFzcyhlbGVtZW50ICAgICAgICAsIGNsYXNzTmFtZSAgICAgICAgKSB7XHJcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1xcXFxiJyArIFV0aWwuZXNjYXBlUmVnRXhwKGNsYXNzTmFtZSkgKyAnXFxcXGInKTtcclxuXHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShyZWdleCwgJycpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGludGVycG9sYXRlU3RyaW5nKHN0ciAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICApIHtcclxuXHRcdGNvbnN0IG1hcmtlciA9IC97eyhbYS16XVthLXowLTlcXC1fXSopfX0vaWc7XHJcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UobWFya2VyLCBmdW5jdGlvbihtYXRjaGVzKSB7XHJcblx0XHQgIHJldHVybiBjYWxsYmFjayhhcmd1bWVudHNbMV0pIHx8ICcnO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyBvbmx5IHVzZWQgZm9yIGhhc2hpbmcganNvbiBvYmplY3RzICh1c2VkIGZvciBoYXNoIG1hcHBpbmcgcGFsZXR0ZSBvYmplY3RzLCB1c2VkIHdoZW4gY3VzdG9tIGNvbG91cnMgYXJlIHBhc3NlZCB0aHJvdWdoIEphdmFTY3JpcHQpXHJcbiAgc3RhdGljIGhhc2goc3RyICAgICAgICApIHtcclxuICAgICAgbGV0IGhhc2ggPSAwLFxyXG4gICAgICAgIGksIGNociwgbGVuO1xyXG4gICAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGhhc2g7XHJcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgIGNociA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNocjtcclxuICAgICAgICBoYXNoIHw9IDA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGhhc2g7XHJcblx0fVxyXG5cdFxyXG5cdHN0YXRpYyBub3JtYWxpc2VIZXgoaGV4ICAgICAgICApIHtcclxuXHRcdGlmIChoZXhbMF0gPT0gJyMnKSB7XHJcblx0XHQgIGhleCA9IGhleC5zdWJzdHIoMSk7XHJcblx0XHR9XHJcblx0XHRpZiAoaGV4Lmxlbmd0aCA9PSAzKSB7XHJcblx0XHQgIGhleCA9IGhleFswXSArIGhleFswXSArIGhleFsxXSArIGhleFsxXSArIGhleFsyXSArIGhleFsyXTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBoZXg7XHJcblx0fVxyXG5cclxuXHQvLyB1c2VkIHRvIGdldCB0ZXh0IGNvbG9ycyBpZiBub3Qgc2V0XHJcbiAgc3RhdGljIGdldENvbnRyYXN0KGhleCAgICAgICAgKSB7XHJcblx0XHRoZXggPSBVdGlsLm5vcm1hbGlzZUhleChoZXgpO1xyXG5cdFx0Y29uc3QgciA9IHBhcnNlSW50KGhleC5zdWJzdHIoMCwgMiksIDE2KTtcclxuXHRcdGNvbnN0IGcgPSBwYXJzZUludChoZXguc3Vic3RyKDIsIDIpLCAxNik7XHJcblx0XHRjb25zdCBiID0gcGFyc2VJbnQoaGV4LnN1YnN0cig0LCAyKSwgMTYpO1xyXG5cdFx0Y29uc3QgeWlxID0gKChyICogMjk5KSArIChnICogNTg3KSArIChiICogMTE0KSkgLyAxMDAwO1xyXG5cdFx0cmV0dXJuICh5aXEgPj0gMTI4KSA/ICcjMDAwJyA6ICcjZmZmJztcclxuXHR9XHJcblxyXG5cdC8vIHVzZWQgdG8gY2hhbmdlIGNvbG9yIG9uIGhpZ2hsaWdodFxyXG4gIHN0YXRpYyBnZXRMdW1pbmFuY2UoaGV4ICAgICAgICApIHtcclxuXHRcdGxldCBudW0gPSBwYXJzZUludChVdGlsLm5vcm1hbGlzZUhleChoZXgpLCAxNiksIFxyXG5cdFx0XHRhbXQgPSAzOCxcclxuXHRcdFx0UiA9IChudW0gPj4gMTYpICsgYW10LFxyXG5cdFx0XHRCID0gKG51bSA+PiA4ICYgMHgwMEZGKSArIGFtdCxcclxuXHRcdFx0RyA9IChudW0gJiAweDAwMDBGRikgKyBhbXQ7XHJcblx0XHRjb25zdCBuZXdDb2xvdXIgPSAoMHgxMDAwMDAwICsgKFI8MjU1P1I8MT8wOlI6MjU1KSoweDEwMDAwICsgKEI8MjU1P0I8MT8wOkI6MjU1KSoweDEwMCArIChHPDI1NT9HPDE/MDpHOjI1NSkpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcclxuXHRcdHJldHVybiAnIycrbmV3Q29sb3VyO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGdldEhvdmVyQ29sb3VyKGhleCAgICAgICAgKSB7XHJcblx0XHRoZXggPSBVdGlsLm5vcm1hbGlzZUhleChoZXgpO1xyXG5cdFx0Ly8gZm9yIGJsYWNrIGJ1dHRvbnNcclxuXHRcdGlmIChoZXggPT0gJzAwMDAwMCcpIHtcclxuXHRcdCAgcmV0dXJuICcjMjIyJztcclxuXHRcdH1cclxuXHRcdHJldHVybiBVdGlsLmdldEx1bWluYW5jZShoZXgpO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGlzTW9iaWxlKHVzZXJBZ2VudCAgICAgICAgKSB7XHJcblx0XHRyZXR1cm4gL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KHVzZXJBZ2VudCk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgaXNQbGFpbk9iamVjdChvYmogICAgICAgICkge1xyXG5cdFx0Ly8gVGhlIGNvZGUgXCJ0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGxcIiBhbGxvd3MgQXJyYXkgb2JqZWN0c1xyXG5cdFx0cmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgPT0gT2JqZWN0O1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGFycmF5Q29udGFpbnNNYXRjaGVzKGFycmF5ICAgICAgICwgc2VhcmNoICAgICAgICApIHtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblx0XHQgIHZhciBzdHIgPSBhcnJheVtpXTtcclxuXHRcdCAgLy8gaWYgcmVnZXggbWF0Y2hlcyBvciBzdHJpbmcgaXMgZXF1YWwsIHJldHVybiB0cnVlXHJcblx0XHQgIGlmICgoc3RyIGluc3RhbmNlb2YgUmVnRXhwICYmIHN0ci50ZXN0KHNlYXJjaCkpIHx8XHJcblx0XHRcdCh0eXBlb2Ygc3RyID09ICdzdHJpbmcnICYmIHN0ci5sZW5ndGggJiYgc3RyID09PSBzZWFyY2gpKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0ICB9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxufSBcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXRpbDtcclxuIl19
