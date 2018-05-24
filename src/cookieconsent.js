// @flow
"use strict";
const defaultOptions = require("./defaultOptions");
const cookieManager = require("./cookieManager");
const util = require("./util");
const Popup = require("./popup");

class Cookieconsent {
  status: Object

  constructor(options: Object) {
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

    return new Promise((resolve, reject) => {
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
		let val = this.getStatus();
		return val == this.status.allow;
	}

	setStatus(status) {
		const c = this.options.cookie;
		const value = cookieManager.getCookie(c.name);
		const chosenBefore = Object.keys(this.status).indexOf(value) >= 0;
  
		// if `status` is valid
		if (Object.keys(this.status).indexOf(status) >= 0) {
			//TODO cambiar por el cookieManager y ver si poner lo del domain y el path
			cookieManager.setCookie(c.name, status, c.expiryDays, c.domain, c.path);
  
		  	this.options.onStatusChange.call(this, status, chosenBefore);
		} else {
		  	this.clearStatus();
		}
	}

	getStatus() {
		return cookieManager.getCookie(this.options.cookie.name);
	}
  
	clearStatus() {
		var c = this.options.cookie;
		cookieManager.deleteCookie(c.name, c.domain, c.path);
	}
}

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