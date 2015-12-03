'use strict';

var tape = require('tape');	
var checkenv = require('../../' + process.argv[2] + '/index');

// Shims
var _exit = process.exit;
var _err = console.error;
process.exit = function(code) { exited = true; lastcode = code; };
console.error = function(m) { errored++ };

var exited = false;
var errored = 0;
var lastcode;

function reset(pass) {
	exited = false;
	errored = 0;
	lastcode = null;

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

tape('check()', function(t) {
	t.plan(5);

	reset();
	checkenv.check();
	t.equal(exited, true, 'should call process.exit() if required variables are missing');
	t.ok(lastcode > 0, 'should exit with a non-zero exit code if process.exit() is called');
	t.ok(errored > 0, 'should call console.error() if required variables are missing');

	reset(true);
	checkenv.check();
	t.equal(exited, false, 'should not call process.exit() if required variables are set');
	t.equal(errored, 0, 'should not call console.error() if required variables are set');
});

tape('check(false)', function(t) {
	t.plan(4);

	reset();
	t.throws(function() {
		checkenv.check(false);
	}, 'should throw an error if required variables are missing');
	t.equal(errored, 0, 'and should not call console.error()');

	reset(true);
	t.doesNotThrow(function() {
		checkenv.check(false);
	}, 'should not throw an error if required variables are set');
	t.equal(errored, 0, 'and should not call console.error()');
});