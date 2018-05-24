// @flow
"use strict";

class CookieManager {

	/**
	 * get the cookie value
	 * @param {String} name The name of the cookie.
	 * @returns {String}
	 */
	static getCookie(name: String) {
		const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
		return v ? v[2] : null;
	}
	
	/**
	 * Set the cookie value
	 * @param {String} name The name of the cookie.
	 * @param {String} value The value of the cookie.
	 * @param {String} days The numbers of days to expire the cookie.
	 */
	static setCookie(name: String, value: String, days: number, domain: ?String, path: ?String) {
		const d = new Date;
		d.setTime(d.getTime() + 24*60*60*1000*days);
		let cookie = name + "=" + value + ";expires=" + d.toGMTString();
		if(path){
			cookie += ";path="+path;
		}else{
			cookie += ";path=/";
		}
		if(domain){
			cookie += ";domain="+domain;
		}
		document.cookie = cookie;
	}
	
	/**
	 * Delete the cookies
	 * @param {String} name The name of the cookie.
	 */
	static deleteCookie(name: String, domain: ?String, path: ?String) { 
		this.setCookie(name, '', -1, domain, path);  
	}

	/**
	 * Get all cookies
	 * @returns {Object}
	 */
	static getAllCookies(){
		const cookies = {};
		document.cookie.split(";").forEach((item)=>{
			const cookie = item.split("=");
			cookies[cookie[0]] = cookie[1];
		});
		return cookies;
	}
}

module.exports = CookieManager;