"use strict";

require("flow-remove-types/register");
const test = require("tap").test;
const Utils = require("../../src/utils");

test("Utils", (t) => {

	t.test("#singleDeepMerge - simple object to empty", (t) => {

		const target = {};
		const source = { a: "a", b: "b"};
		const good = { a: "a", b: "b"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#singleDeepMerge - simple object to object with common property", (t) => {

		const target = { a: "a1", c: "c"};
		const source = { a: "a2", b: "b"};
		const good = { a: "a2", b: "b", c: "c"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#singleDeepMerge - array clone", (t) => {

		const target = { a: "a1", c: "c"};
		const source = { a: [1, 2, 3], b: "b"};
		const good = { a: [1, 2, 3], b: "b", c: "c"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#singleDeepMerge - array overwrite", (t) => {

		const target = { a: [2, 3, 4, 5], c: "c"};
		const source = { a: [1, 2, 3], b: "b"};
		const good = { a: [1, 2, 3], b: "b", c: "c"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#singleDeepMerge - object clone", (t) => {

		const target = { a: [2, 3, 4, 5], c: "c"};
		const source = { a: { a1: "a1", a2: "a2"}, b: "b"};
		const good = { a: { a1: "a1", a2: "a2"}, b: "b", c: "c"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#singleDeepMerge - object merge", (t) => {

		const target = { a: { a3: "a3", a4: "a4"}, c: "c"};
		const source = { a: { a1: "a1", a2: "a2"}, b: "b"};
		const good = { a: { a1: "a1", a2: "a2", a3: "a3", a4: "a4"}, b: "b", c: "c"};

		const aux = Utils.singleDeepMerge(target, source);

		t.same(aux, good);

		t.end();

	});

	t.test("#deepMerge", (t) => {

		const source1 = { a: "a", b: {b2: "b2"}};
		const source2 = { c: "c", b: {b1: "b1"}};
		const good = { a: "a", b: {b1: "b1", b2: "b2"}, c: "c"};

		const aux = Utils.deepMerge({}, source1, source2);

		t.same(aux, good);

		t.end();

	});

	t.test("#deepMerge - object in object in object", (t) => {

		const source1 = { a: "a", b: {b: { c1: "c1"}}};
		const source2 = { c: "c", b: {b: { c2: "c2"}}};
		const good = { a: "a", b: {b: {c1: "c1", c2: "c2"}}, c: "c"};

		const aux = Utils.deepMerge({}, source1, source2);

		t.same(aux, good);

		t.end();

	});

	t.end();

});
