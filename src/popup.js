// @flow
"use strict";

const util = require("./util");

class Popup {

	allowHandler: Function;
	denyHandler: Function;

	constructor(options: Object, statusList: Object) {

		this.statusList = statusList;
		this.allowHandler = null;
		this.denyHandler = null;

		if (this.options) {

			this.destroy(); // already rendered

		}

		// set options back to default options
		this.options = options;

		// the full markup either contains the wrapper or it does not (for multiple instances)
		const cookiePopup = this.options.window.replace("{{classes}}", this.getPopupClasses().join(" "))
			.replace("{{children}}", this.getPopupInnerMarkup());

		this.element = this.appendMarkup(cookiePopup);

		this.open();

	}

	destroy() {

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

	}

	open() {

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

	}

	close() {

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

	}

	isOpen() {

		return this.element && this.element.style.display === "" && !util.hasClass(this.element, "cc-invisible");

	}

	getPositionClasses() {

		const positions = this.options.position.split("-"); // top, bottom, left, right
		const classes = [];

		// top, left, right, bottom
		positions.forEach((cur) => {

			classes.push(`cc-${cur}`);

		});

		return classes;

	}

	getPopupClasses() {

		const opts = this.options;
		let positionStyle = (opts.position === "top" || opts.position === "bottom") ? "banner" : "floating";

		if (opts.isMobile) {

			positionStyle = "floating";

		}

		const classes = [
			`cc-${positionStyle}`, // floating or banner
			"cc-type-opt-in", // add the compliance type
			`cc-theme-${opts.theme}`, // add the theme
		];

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

	}

	getPopupInnerMarkup() {

		const interpolated = {};
		const opts = this.options;

		Object.keys(opts.elements).forEach((prop) => {

			interpolated[prop] = util.interpolateString(opts.elements[prop], (name) => {

				const str = opts.content[name];
				return (name && typeof str == "string" && str.length) ? str : "";

			});

		});

		// checks if the type is valid and defaults to info if it's not
		const complianceType = opts.compliance;

		// build the compliance types from the already interpolated `elements`
		interpolated.compliance = util.interpolateString(complianceType, (name) => {

			return interpolated[name];

		});

		// checks if the layout is valid and defaults to basic if it's not
		let layout = opts.layouts[opts.layout];
		if (!layout) {

			layout = opts.layouts.basic;

		}

		return util.interpolateString(layout, (match) => {

			return interpolated[match];

		});

	}

	appendMarkup(markup) {

		const opts = this.options;
		// eslint-disable-next-line no-undef
		const div = document.createElement("div");
		// eslint-disable-next-line no-undef
		const cont = (opts.container && opts.container.nodeType === 1) ? opts.container : document.body;

		div.innerHTML = markup;

		const el = div.children[0];

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

	}

	setAllowHandler(callback: Function) {

		// eslint-disable-next-line no-undef
		document.querySelector(".cc-allow").removeEventListener("click", this.allowHandler);
		this.allowHandler = callback;
		// eslint-disable-next-line no-undef
		document.querySelector(".cc-allow").addEventListener("click", callback);

	}

	setDenyHandler(callback: Function) {

		// eslint-disable-next-line no-undef
		document.querySelector(".cc-deny").removeEventListener("click", this.denyHandler);
		this.denyHandler = callback;
		// eslint-disable-next-line no-undef
		document.querySelector(".cc-deny").addEventListener("click", callback);

	}

	// I might change this function to use inline styles. I originally chose a stylesheet because I could select many elements with a
	// single rule (something that happened a lot), the apps has changed slightly now though, so inline styles might be more applicable.
	attachCustomPalette(palette) {

		const hash = util.hash(JSON.stringify(palette));
		const selector = `cc-color-override-${hash}`;
		const isValid = util.isPlainObject(palette);

		this.customStyleSelector = isValid ? selector : null;

		if (isValid) {

			this.addCustomStyle(hash, palette, `.${selector}`);

		}
		return isValid;

	}

	addCustomStyle(hash, palette, prefix) {

		const colorStyles = {};
		const popup = palette.popup;
		const button = palette.button;
		const highlight = palette.highlight;

		// needs background colour, text and link will be set to black/white if not specified
		if (popup) {

			// assumes popup.background is set
			popup.text = popup.text ? popup.text : util.getContrast(popup.background);
			popup.link = popup.link ? popup.link : popup.text;
			colorStyles[`${prefix}.cc-window`] = [
				`color: ${popup.text}`,
				`background-color: ${popup.background}`
			];
			colorStyles[`${prefix} .cc-link,${prefix} .cc-link:active,${prefix} .cc-link:visited`] = [
				`color: ${popup.link}`
			];

			if (button) {

				// assumes button.background is set
				button.text = button.text ? button.text : util.getContrast(button.background);
				button.border = button.border ? button.border : "transparent";
				colorStyles[`${prefix} .cc-btn`] = [
					`color: ${button.text}`,
					`border-color: ${button.border}`,
					`background-color: ${button.background}`
				];

				if (button.background !== "transparent") {

					colorStyles[`${prefix} .cc-btn:hover, ${prefix} .cc-btn:focus`] = [
						`background-color: ${util.getHoverColour(button.background)}`
					];

				}

				if (highlight) {

				//assumes highlight.background is set
					highlight.text = highlight.text ? highlight.text : util.getContrast(highlight.background);
					highlight.border = highlight.border ? highlight.border : "transparent";
					colorStyles[`${prefix} .cc-highlight .cc-btn:first-child`] = [
						`color: ${highlight.text}`,
						`border-color: ${highlight.border}`,
						`background-color: ${highlight.background}`
					];

				} else {

				// sets highlight text color to popup text. background and border are transparent by default.
					colorStyles[`${prefix} .cc-highlight .cc-btn:first-child`] = [
						`color: ${popup.text}`
					];

				}

			}

		}

		// this will be interpretted as CSS. the key is the selector, and each array element is a rule
		// eslint-disable-next-line no-undef
		const style = document.createElement("style");
		// eslint-disable-next-line no-undef
		document.head.appendChild(style);
		let ruleIndex = -1;
		for (const prop in colorStyles) {

			style.sheet.insertRule(`${prop}{${colorStyles[prop].join(";")}}`, ++ruleIndex);

		}

	}

}

module.exports = Popup;
