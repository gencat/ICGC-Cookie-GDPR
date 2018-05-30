// @flow
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
