'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

function reset(pass) {
	spy.reset();
	if (pass) {
		process.env.A = true;
		process.env.B = true;
	} else {
		if ('A' in process.env) {
			delete process.env.A;
		}
		if ('B' in process.env) {
			delete process.env.B;
		}
	}
}

tape('WHEN VARIABLES ARE OPTIONAL:', function(s) {
	s.test('check()', function(t) {
		t.plan(2);
		spy.setup();

		reset();
		checkenv.check();
		t.ok(spy.errorCount() > 0, 'should call console.error() if optional variables are missing');

		reset(true);
		checkenv.check();
		t.equal(spy.errorCount(), 0, 'should not call console.error() if all variables are set');

		spy.restore();
	});

	s.test('check(false)', function(t) {
		t.plan(4);
		spy.setup();

		reset();
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if optional variables are missing');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		reset(true);
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if optional variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.restore();
	});
});