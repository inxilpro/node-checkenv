'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN VARIABLES ARE REQUIRED:', function(s) {
	s.test('check()', function(t) {
		t.plan(8);
		spy.setup();

		spy.reset();
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if required variables are missing');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if process.exit() is called');
		t.ok(spy.errorCount() > 0, 'should call console.error() if required variables are missing');

		spy.reset(['A']);
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if some required variables are missing');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if process.exit() is called');
		t.ok(spy.errorCount() > 0, 'should call console.error() if some required variables are missing');

		spy.reset(['A', 'B']);
		checkenv.check();
		t.equal(spy.exitCount(), 0, 'should not call process.exit() if required variables are set');
		t.equal(spy.errorCount(), 0, 'should not call console.error() if required variables are set');

		spy.restore();
	});

	s.test('check(false)', function(t) {
		t.plan(6);
		spy.setup();

		spy.reset();
		t.throws(function() {
			checkenv.check(false);
		}, 'should throw an error if required variables are missing');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['A']);
		t.throws(function() {
			checkenv.check(false);
		}, 'should throw an error if some required variables are missing');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['A', 'B']);
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if required variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.restore();
	});
});