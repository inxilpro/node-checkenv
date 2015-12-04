'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

function e(name, value) {
	if (!value && name in process.env) {
		delete process.env[name]
	} else if (value) {
		process.env[name] = value;
	}
}

function config(name, value, options) {
	spy.reset();
	e('VALIDATOR_TEST', value);
	checkenv.setConfig({
		VALIDATOR_TEST: {
			validators: [{
				name: name,
				options: options
			}]
		}
	});
}

function assertFailed(t) {
	checkenv.check();
	t.equal(spy.exitCount(), 1, 'should call process.exit() if validation fails');
	t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if validation fails');
	t.ok(spy.errorCount() > 0, 'should call console.error() if validation fails');

	spy.reset();
	t.throws(function() {
		checkenv.check(false);
	}, 'should throw an error if validation fails and pretty === false');
}

function assertPassed(t) {
	t.equal(spy.exitCount(), 0, 'should not call process.exit() if validation passes');
	t.equal(spy.errorCount(), 0, 'should not call console.error() if validation passes');

	spy.reset();
	t.doesNotThrow(function() {
		checkenv.check(false);
	}, 'should not throw an error if validation passes and pretty === false');
}

tape('VALIDATORS:', function(s) {
	s.test('"contains" validator', function(t) {
		t.plan(7);
		spy.setup();

		config('contains', 'abxyz', 'abc');
		assertFailed(t);

		config('contains', 'abcdef', 'abc');
		assertPassed(t);

		spy.restore();
	});

	s.test('"equals" validator', function(t) {
		t.plan(11);
		spy.setup();

		config('equals', 'xyz', 'abc');
		assertFailed(t);

		config('equals', 'abcxyz', 'abc');
		assertFailed(t);

		config('equals', 'abc', 'abc');
		assertPassed(t);

		spy.restore();
	});

	/*
	config('before');
	config('after');
	config('alpha');
	config('alphanumeric');
	config('ascii');
	config('base64');
	config('boolean');
	config('date');
	config('decimal');
	config('fqdn');
	config('float');
	config('hex-color');
	config('hexadecimal');
	config('ip4');
	config('ip6');
	config('ip');
	config('iso8601');
	config('enum');
	config('in');
	config('int');
	config('json');
	config('length');
	config('lowercase');
	config('mac-address');
	config('numeric');
	config('url');
	config('uuid3');
	config('uuid4');
	config('uuid5');
	config('uuid');
	config('uppercase');
	config('regex');
	config('regexp');
	config('matches');
	*/
});