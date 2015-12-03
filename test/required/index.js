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

tape('WHEN VARIABLES ARE REQUIRED:', function(s) {
	s.test('check()', function(t) {
		t.plan(5);
		spy.setup();

		reset();
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if required variables are missing');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if process.exit() is called');
		t.ok(spy.errorCount() > 0, 'should call console.error() if required variables are missing');

		reset(true);
		checkenv.check();
		t.equal(spy.exitCount(), 0, 'should not call process.exit() if required variables are set');
		t.equal(spy.errorCount(), 0, 'should not call console.error() if required variables are set');

		spy.restore();
	});

	s.test('check(false)', function(t) {
		t.plan(4);
		spy.setup();

		reset();
		t.throws(function() {
			checkenv.check(false);
		}, 'should throw an error if required variables are missing');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		reset(true);
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if required variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.restore();
	});
});