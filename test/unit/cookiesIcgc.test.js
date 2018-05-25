"use strict";

require("flow-remove-types/register");
const test = require("tap").test;
const MockBrowser = require("mock-browser").mocks.MockBrowser;
global.window = new MockBrowser().getWindow();
global.document = new MockBrowser().getDocument();
global.location = new MockBrowser().getLocation();
global.navigator = new MockBrowser().getNavigator();
//const CookiesIcgc = require("../../src/cookiesIcgc");

test("CookiesIcgc", (t) => {

	/*
	t.test("#constructor", (t) => {

		const cookiesIcgc = new CookiesIcgc('localhost',['123213', '7567567']);

		t.equal(cookiesIcgc.options.cookie.domain, 'localhost');

		t.end();

	});
	*/

	t.end();

});
