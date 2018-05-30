// @flow
"use strict";
const defaultOptions = require("./defaultOptions");
const cookieManager = require("./cookieManager");
const Utils = require("./utils");
const Popup = require("./popup");

class Cookieconsent {

	status: Object

	constructor(options: Object) {

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

	}

	createPopup() {

		return new Promise((resolve) => {

			const popup = new Popup(this.options);
			popup.setAllowHandler(()=>{

				this.setStatus(this.status.allow);
				popup.close();

			});

			popup.setDenyHandler(()=>{

				this.setStatus(this.status.deny);
				popup.close();

			});

			resolve(popup);

		});

	}

	// returns true if the cookie has a valid value
	hasAnswered() {

		return Object.keys(this.status).indexOf(this.getStatus()) >= 0;

	}

	// returns true if the cookie indicates that consent has been given
	hasConsented() {

		const val = this.getStatus();
		return val === this.status.allow;

	}

	setStatus(status) {

		const c = this.options.cookie;
		const value = cookieManager.getCookie(c.name);
		const chosenBefore = Object.keys(this.status).indexOf(value) >= 0;

		// if `status` is valid
		if (Object.keys(this.status).indexOf(status) >= 0) {

			cookieManager.setCookie(c.name, status, c.expiryDays, c.domain, c.path);

			this.createConfigButton();
			this.options.onStatusChange.call(this, status, chosenBefore);

		} else {

			this.clearStatus();

		}

	}

	getStatus() {

		return cookieManager.getCookie(this.options.cookie.name);

	}

	clearStatus() {

		const c = this.options.cookie;
		cookieManager.deleteCookie(c.name, c.domain, c.path);

	}

	onInit() {

		if (this.hasAnswered()) {

			this.createConfigButton();

		}

	}

	createConfigButton() {

		const id = this.options.configBtnSelector;
		let buttonHTML = this.options.configBtn;
		// eslint-disable-next-line no-undef
		let parent = document.body;
		let btnClass = "config-popup";

		if (id.trim() !== "") {

			// eslint-disable-next-line no-undef
			parent = document.querySelector(id);
			btnClass = "";

		}

		buttonHTML = buttonHTML.replace("{{config-text}}", this.options.content.config);
		buttonHTML = buttonHTML.replace("{{config-class}}", btnClass);
		// eslint-disable-next-line no-undef
		const elem = document.createElement("div");
		elem.innerHTML = buttonHTML;
		parent.appendChild(elem);

		// eslint-disable-next-line no-undef
		document.querySelector(".cc-config").addEventListener("click", () => this.onResetConfig());

	}

	removeConfigButton() {

		// eslint-disable-next-line no-undef
		const btn = document.querySelector(".cc-config");

		if (btn) {

			btn.parentNode.remove();

		}

	}

	onResetConfig() {

		this.removeConfigButton();
		this.options.onResetConfig();

	}

}

module.exports = Cookieconsent;
