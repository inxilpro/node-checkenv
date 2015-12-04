'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN SOME VARIABLES ARE REQUIRED AND SOME ARE OPTIONAL:', function(s) {
	s.test('check()', function(t) {
		t.plan(15);
		spy.setup();

		spy.reset();
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if no variables are set');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if process.exit() is called');
		t.ok(spy.errorCount() > 0, 'should call console.error() if no variables are set');
		t.equal(process.env.C, 'Hello world', 'should set default when unset');

		spy.reset(['B']);
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if only optional variables are set');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if process.exit() is called');
		t.ok(spy.errorCount() > 0, 'should call console.error() if only optional variables are set');
		t.equal(process.env.C, 'Hello world', 'should set default when unset');

		spy.reset(['A']);
		checkenv.check();
		t.equal(spy.exitCount(), 0, 'should not call process.exit() if only required variables are set');
		t.ok(spy.errorCount() > 0, 'should call console.error() if optional variables are missing');
		t.equal(process.env.C, 'Hello world', 'should set default when unset');

		spy.reset(['A', 'B']);
		checkenv.check();
		t.equal(spy.exitCount(), 0, 'should not call process.exit() if all variables are set');
		t.equal(spy.errorCount(), 0, 'should call console.error() if all variables are set');
		t.equal(process.env.C, 'Hello world', 'should set default when unset');

		spy.reset(['C']);
		checkenv.check();
		t.equal(process.env.C, 'set by spy', 'should not overwrite value with default if value is set');

		spy.restore();
	});

	s.test('check(false)', function(t) {
		t.plan(8);
		spy.setup();

		spy.reset();
		t.throws(function() {
			checkenv.check(false);
		}, 'should throw an error if required variables are missing');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['B']);
		t.throws(function() {
			checkenv.check(false);
		}, 'should throw an error if only optional variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['A']);
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if required variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.reset(['A', 'B']);
		t.doesNotThrow(function() {
			checkenv.check(false);
		}, 'should not throw an error if all variables are set');
		t.equal(spy.errorCount(), 0, 'and should not call console.error()');

		spy.restore();
	});

	s.test('help()', function(t) {
		t.plan(1);

		t.throws(function() {
			var key = 'MISSING_' + (Number.MAX_VALUE * Math.random());
			checkenv.help(key);
		}, /no configuration/i, 'should throw an error when loading help for a non-configured variable');
	});
});