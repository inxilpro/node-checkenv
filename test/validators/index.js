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

var validationTests = [{
	name: 'contains',
	fail: [{
		value: 'abc',
		options: 'xyz',
		regex: /contain the string \"xyz\"/i
	}],
	pass: [{
		value: 'abcdefghi',
		options: 'def'
	}]
}, {
	name: 'equals',
	fail: [{
		value: 'abcxyz',
		options: 'xyz',
		regex: /be set to \"xyz\"/i
	}],
	pass: [{
		value: 'abc',
		options: 'abc'
	}]
}, {
	name: 'before',
	fail: [{
		value: '2015-01-01',
		options: '2012-07-14',
		regex: /date before 2012-07-14/i
	}],
	pass: [{
		value: '2014-12-31',
		options: '2015-01-01'
	}]
}, {
	name: 'after',
	fail: [{
		value: '2000-01-01',
		options: '2015-01-01',
		regex: /date after 2015-01-01/i
	}],
	pass: [{
		value: '2015-01-01',
		options: '2014-08-24'
	}]
} , {
	name: 'alpha',
	fail: [{
		value: 'abc123',
		regex: /alpha/i
	}],
	pass: [{
		value: 'abcabc'
	}]
}, {
	name: 'alphanumeric',
	fail: [{
		value: 'abc123!',
		regex: /alphanumeric/i
	}],
	pass: [{
		value: 'abc123'
	}]
}, {
	name: 'ascii',
	fail: [{
		value: '👾',
		regex: /ascii/i
	}],
	pass: [{
		value: '`1234567890-=~!@#$%^&*()_+qwertyuiop[]\\QWERTYUIOP{}|;\'\:",./<>?'
	}]
}, {
	name: 'base64',
	fail: [{
		value: 'this is not base64-encoded',
		regex: /base64/i
	}],
	pass: [{
		value: 'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4='
	}]
}, {
	name: 'boolean',
	fail: [{
		value: 'abc',
		regex: /boolean/i
	}],
	pass: [
		'true',
		'false',
		'0',
		'1'
	]
}, {
	name: 'date',
	fail: [{
		value: 'this is not a date!',
		regex: /must be a date/i
	}],
	pass: [{
		value: '2015-05-18'
	}]
}, {
	name: 'decimal',
	fail: [{
		value: 'aaa',
		regex: /decimal/i
	}],
	pass: [
		'1',
		'1.2',
		'0.1'
	]
}, {
	name: 'fqdn',
	fail: [{
		value: 'abc',
		regex: /fully qualified/i
	}],
	pass: [
		'cmorrell.com',
		'cmorrell.ninja',
		'www.cmorrell.com',
		'john--snow.com',
		'xn--froschgrn-x9a.com',
		'abc.xyz'
	]
}, {
	name: 'float',
	fail: [{
		value: '--1',
		regex: /floating point/i
	}, {
		value: 'abc',
		regex: /floating point/i
	}, {
		value: '3.14',
		options: { min: 4 },
		regex: /greater than/i
	}, {
		value: '3.14',
		options: { max: 3 },
		regex: /less than/i
	}, {
		value: '99.9',
		options: { min: 50.5, max: 75.5 },
		regex: /between/i
	}],
	pass: [
		'123',
		'123.',
		'123.456',
		'-987.654',
		'0.1234'
	]
}, {
	name: 'hex-color',
	fail: [{
		value: '99999G',
		regex: /hex color/i
	}],
	pass: [
		'663399',
		'#663399',
		'dada99',
		'DADA99',
		'DBda99'
	]
}, 
{
	name: 'hexadecimal',
	fail: [{
		value: 'aaa39347937272gk',
		regex: /hexadecimal/i
	}],
	pass: [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'0',
		'1',
		'9'
	]
}, 
{
	name: 'ip4',
	fail: [{
		value: '2001:db8:0000:1:1:1:1:1',
		regex: /version 4/i
	}, {
		value: '127.0.0.256',
		regex: /version 4/i
	}],
	pass: [
		'127.0.0.1'
	]
}, {
	name: 'ip6',
	fail: [{
		value: '9999:zzz:9999:9:9:9:9:9',
		regex: /version 6/i
	}, {
		value: '127.0.0.1',
		regex: /version 6/i
	}],
	pass: [
		'2001:db8:0000:1:1:1:1:1',
	]
}, {
	name: 'ip',
	fail: [{
		value: '2001:db8:0000:1:1:1:1:1',
		options: 4,
		regex: /version 4/i
	}, {
		value: '127.0.0.256',
		options: 4,
		regex: /version 4/i
	}, {
		value: '9999:zzz:9999:9:9:9:9:9',
		options: 6,
		regex: /version 6/i
	}, {
		value: '127.0.0.1',
		options: 6,
		regex: /version 6/i
	}, {
		value: '127.0.0.299',
		regex: /ip address/i
	}, {
		value: 'abc',
		regex: /ip address/i
	}],
	pass: [
		'127.0.0.1',
		'2001:db8:0000:1:1:1:1:1'
	]
},  {
	name: 'iso8601',
	fail: [{
		value: '200905',
		regex: /iso8601/i
	}],
	pass: [
		'2009-05-19',
		'20090519'
	]
}, {
	name: 'enum',
	fail: [{
		value: 'z',
		options: ['a', 'b', 'c'],
		regex: /must be on of/i
	}],
	pass: [{
		value: 'b',
		options: ['a', 'b', 'c']
	}]
}, 
{
	name: 'in',
	fail: [{
		value: 'z',
		options: ['a', 'b', 'c'],
		regex: /must be on of/i
	}],
	pass: [{
		value: 'b',
		options: ['a', 'b', 'c']
	}]
}, 
{
	name: 'int',
	fail: [{
		value: '1.1',
		regex: /integer/i
	}, {
		value: 'abc',
		regex: /integer/i
	}, {
		value: '2',
		options: { min: 4 },
		regex: /greater than/i
	}, {
		value: '7',
		options: { max: 3 },
		regex: /less than/i
	}, {
		value: '99',
		options: { min: 50, max: 75 },
		regex: /between/i
	}],
	pass: [{
		value: '123'
	}, {
		value: '5',
		options: { min: 4 }
	}, {
		value: '3',
		options: { max: 3 }
	}, {
		value: '63',
		options: { min: 50, max: 75 }
	}]
}, {
	name: 'json',
	fail: [{
		value: 'this: is not json',
		regex: /json/i
	}],
	pass: [
		'{ "hello": "world" }'
	]
}, {
	name: 'length',
	fail: [{
		value: 'abc',
		options: { min: 4 },
		regex: /greater than/i
	}, {
		value: 'abcdefg',
		options: { max: 4 },
		regex: /less than/i
	}, {
		value: 'abc',
		options: { min: 4, max: 10 },
		regex: /between/i
	}],
	pass: [{
		value: 'abcd',
		options: { min: 4 }
	}, {
		value: 'abcd',
		options: { max: 4 }
	}, {
		value: 'abcdef',
		options: { min: 4, max: 10 }
	}]
}, {
	name: 'lowercase',
	fail: [{
		value: 'ABC',
		regex: /lower/i
	}],
	pass: [{
		value: 'abc'
	}]
}, {
	name: 'mac-address',
	fail: [{
		value: '01:02:03:04:05',
		regex: /mac address/i
	}],
	pass: [
		'01:02:03:04:05:ab'
	]
}, {
	name: 'numeric',
	fail: [{
		value: '123.123',
		regex: /numeric/i
	}],
	pass: [
		'123',
		'+123',
		'-123'
	]
}, {
	name: 'url',
	fail: [{
		value: 'not a URL',
		regex: /url/i
	}],
	pass: [
		'http://www.cmorrell.com'
	]
}, 
{
	name: 'uuid3',
	fail: [{
		value: '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1',
		regex: /version 3/i
	}, {
		value: '987FBC97-4BED-5078-AF07-9141BA07C9F3',
		regex: /version 3/i
	}],
	pass: [{
		value: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3'
	}]
}, 
{
	name: 'uuid4',
	fail: [{
		value: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
		regex: /version 4/i
	}, {
		value: '987FBC97-4BED-5078-AF07-9141BA07C9F3',
		regex: /version 4/i
	}],
	pass: [{
		value: '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1'
	}]
}, 
{
	name: 'uuid5',
	fail: [{
		value: '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1',
		regex: /version 5/i
	}, {
		value: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
		regex: /version 5/i
	}],
	pass: [{
		value: '987FBC97-4BED-5078-AF07-9141BA07C9F3'
	}]
}, 
{
	name: 'uuid',
	fail: [{
		value: '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1',
		options: 3,
		regex: /version 3/i
	}, {
		value: '987FBC97-4BED-5078-AF07-9141BA07C9F3',
		options: 3,
		regex: /version 3/i
	}, {
		value: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
		options: 4, 
		regex: /version 4/i
	}, {
		value: '987FBC97-4BED-5078-AF07-9141BA07C9F3',
		options: 4,
		regex: /version 4/i
	}, {
		value: '713ae7e3-cb32-45f9-adcb-7c4fa86b90c1',
		options: 5,
		regex: /version 5/i
	}, {
		value: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
		options: 5,
		regex: /version 5/i
	}, {
		value: 'Not a UUID',
		regex: /uuid/i
	}],
	pass: [
		'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
		'713ae7e3-cb32-45f9-adcb-7c4fa86b90c1',
		'987FBC97-4BED-5078-AF07-9141BA07C9F3'
	]
}, {
	name: 'uppercase',
	fail: [{
		value: 'abc',
		regex: /upper/i
	}],
	pass: [{
		value: 'ABC'
	}]
}, {
	name: 'matches',
	fail: [{
		value: 'abc',
		options: 'ABC',
		regex: /regular expression/i
	}, {
		value: 'def',
		options: ['abc', 'i'],
		regex: /regular expression/i
	}],
	pass: [{
		value: 'ABC',
		options: 'ABC'
	}, {
		value: 'ABC',
		options: ['abc', 'i']
	}]
}];

tape('VALIDATORS:', function(s) {
	validationTests.forEach(function(v) {
		s.test('"' + v.name + '" validator', function(t) {
			var expectedFailures = 7;
			var expectedPasses = 3;

			t.plan((v.fail.length * expectedFailures) + (v.pass.length * expectedPasses));
			spy.setup();

			// Failures
			v.fail.forEach(function(f) {
				// Pretty
				config(v.name, f.value, f.options);
				checkenv.check();
				t.equal(spy.exitCount(), 1, 'should call process.exit() if validation fails');
				t.ok(spy.lastExitCode() > 0, 'should exit with a non-zero exit code if validation fails');
				t.ok(spy.errorCount() > 0, 'should call console.error() if validation fails');
				t.ok(f.regex.test(spy.errorMessages().join(' ')), 'stderr should match ' + f.regex);

				// Throws
				config(v.name, f.value, f.options);
				t.throws(function() {
					checkenv.check(false);
				}, /did not pass/i, 'should throw an error if validation fails and pretty === false');

				try {
					checkenv.check(false);
				} catch (e) {
					t.ok(e.validationMessages, 'error should have a validationMessages property');
					var messages = (e.validationMessages ? e.validationMessages.join(' ') : '');
					t.ok(f.regex.test(messages), 'validationMessages should match ' + f.regex);
				}
			});

			// Passes
			v.pass.forEach(function(p) {
				if ('string' === typeof p) {
					p = {
						value: p,
						options: null
					};
				}
				config(v.name, p.value, p.options);

				t.equal(spy.exitCount(), 0, 'should not call process.exit() if validation passes');
				t.equal(spy.errorCount(), 0, 'should not call console.error() if validation passes');

				config(v.name, p.value, p.options);
				t.doesNotThrow(function() {
					checkenv.check(false);
				}, 'should not throw an error if validation passes and pretty === false');
			});

			spy.restore();
		});
	});
});