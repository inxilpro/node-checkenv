'use strict';

var tape = require('tape');	
var checkenv = require('../../' + process.argv[2] + '/index');

// Shims
var _err = console.error;
console.error = function(m) { errored++ };

var errored = 0;
function reset(pass) {
	errored = 0;

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
	t.plan(2);

	reset();
	checkenv.check();
	t.ok(errored > 0, 'should call console.error() if optional variables are missing');

	reset(true);
	checkenv.check();
	t.equal(errored, 0, 'should not call console.error() if all variables are set');
});

tape('check(false)', function(t) {
	t.plan(4);

	reset();
	t.doesNotThrow(function() {
		checkenv.check(false);
	}, 'should not throw an error if optional variables are missing');
	t.equal(errored, 0, 'and should not call console.error()');

	reset(true);
	t.doesNotThrow(function() {
		checkenv.check(false);
	}, 'should not throw an error if optional variables are set');
	t.equal(errored, 0, 'and should not call console.error()');
});