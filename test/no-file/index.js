'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN env.json IS MISSING:', function(s) {
	s.test('check()', function(t) {
		t.plan(3);
		spy.setup();
		
		spy.reset();
		checkenv.check();
		t.equal(spy.exitCount(), 1, 'should call process.exit() if env.json is missing');
		t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if env.json is missing');
		t.ok(spy.errorCount() > 0, 'should call console.error() if env.json is missing');

		spy.restore();
	});

	s.test('check(false)', function(t) {
		t.plan(1);
		
		t.throws(function() {
			checkenv.check(false);
		}, /not found/i, 'should throw a "not found" error');
	});
});