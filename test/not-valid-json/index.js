'use strict';

var tape = require('tape');
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN env.json IS  NOT VALID JSON:', function(s) {
	s.test('check()', function(t) {
		t.plan(1);
		t.throws(function() {
			checkenv.check();
		}, /SyntaxError/i, 'should throw a "SyntaxError" error');
	});
});
