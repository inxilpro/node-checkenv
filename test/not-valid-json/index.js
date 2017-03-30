'use strict';

var tape = require('tape');
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN env.json IS  NOT VALID JSON:', function(s) {
	s.test('check()', function(t) {
		t.plan(4);
		spy.setup();

		spy.reset();

		t.throws(function() {
			checkenv.check();
		}, /SyntaxError/i, 'should throw a "SyntaxError" error');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['A']);

		t.throws(function() {
			checkenv.check(false);
		}, /SyntaxError/i, 'should throw a "SyntaxError" error');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.restore();
	});
});
