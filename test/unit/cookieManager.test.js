"use strict";

require("flow-remove-types/register");
const test = require("tap").test;
const MockBrowser = require("mock-browser").mocks.MockBrowser;
global.window = new MockBrowser().getWindow();
global.document = new MockBrowser().getDocument();
const CookieManager = require("../../src/cookieManager");

test("CookieManager", (t) => {

	t.test("#getCookie", (t) => {

		t.notOk(CookieManager.getCookie("test"), "cookie no existe");

		// eslint-disable-next-line no-undef
		document.cookie = "test=value";

		t.ok(CookieManager.getCookie("test"), "cookie existe");

		t.equal(CookieManager.getCookie("test"), "value");

		t.end();

	});

	t.test("#setCookie", (t) => {

		CookieManager.setCookie("test", "vall", 1);

		t.ok(CookieManager.getCookie("test"), "cookie existe");

		t.equal(CookieManager.getCookie("test"), "vall");

		t.end();

	});

	t.test("#deleteCookie", (t) => {

		CookieManager.setCookie("test", "vall", 1);

		CookieManager.deleteCookie("test");

		t.notOk(CookieManager.getCookie("test"), "cookie no existe");

		t.end();

	});

	t.test("#getAllCookies", (t) => {

		CookieManager.setCookie("test", "vall", 1);

		t.same(CookieManager.getAllCookies(), {"test": "vall"});

		t.end();

	});

	t.end();

});
