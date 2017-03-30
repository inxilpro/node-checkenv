'use strict';

// Load dependencies

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.options = options;
exports.setConfig = setConfig;
exports.setFilename = setFilename;
exports.scan = scan;
exports.load = load;
exports.validate = validate;
exports.check = check;
exports.help = help;

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _windowSize = require('window-size');

var _wrapAnsi = require('wrap-ansi');

var _wrapAnsi2 = _interopRequireDefault(_wrapAnsi);

var _chalk = require('chalk');

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Cached config object
var config;

// Filename is configurable
var filename = 'env.json';

// Default config
var defaultOpts = {
	'required': true,
	'description': null,
	'default': null,
	'validators': []
};

// Debugger
var debug = function debug() {};
if ('NODE_DEBUG' in process.env && /\bcheckenv\b/i.test(process.env.NODE_DEBUG)) {
	debug = function (message) {
		return console.log((0, _chalk.yellow)('DEBUG: ' + message));
	};
}

// Backwards-compat file exists checker
function access(path) {
	try {
		debug('Looking for ' + path);
		if ('accessSync' in _fs2.default) {
			_fs2.default.accessSync(path, _fs2.default.R_OK);
		} else {
			_fs2.default.closeSync(_fs2.default.openSync(path, 'r'));
		}
		debug('Found ' + path);
		return true;
	} catch (e) {
		debug(e.message);
		return false;
	}
}

// Load options, including defaults, for a variable
function options(name) {
	load(name);

	// Build opts
	var userOpts = 'object' === _typeof(config[name]) ? config[name] : { 'required': false !== config[name] };
	return _extends({}, defaultOpts, userOpts);
}

function setConfig(newConfig) {
	config = newConfig;
}

function setFilename(newFilename) {
	filename = newFilename;
}

// Scans directory tree for env.json
function scan() {
	var current;
	var next = (0, _path.dirname)((0, _path.resolve)(module.parent.filename));
	while (next !== current) {
		current = next;
		var path = (0, _path.resolve)(current, filename);
		if (access(path)) {
			return path;
		}
		next = (0, _path.resolve)(current, '..');
	}

	throw new Error(filename + ' not found anywhere in the current directory tree');
}

// Loads config from found env.json
function load(name) {
	if (!config) {
		var path = scan();
		config = require(path);
	}

	if (name && !(name in config)) {
		throw new Error('No configuration for "' + name + '"');
	}

	return config;
}

function validateOptions(name, options) {
	var expectedType = arguments.length <= 2 || arguments[2] === undefined ? 'object' : arguments[2];

	var actualType = Array.isArray(options) ? 'array' : typeof options === 'undefined' ? 'undefined' : _typeof(options);
	if (expectedType !== actualType) {
		throw new Error('The "' + name + '" validator expects options to be passed as an ' + expectedType + ', ' + actualType + ' received instead');
	}
}

function minMaxMessage(options) {
	if (!options || 'object' !== (typeof options === 'undefined' ? 'undefined' : _typeof(options))) {
		return '';
	}

	if (options.min && options.max) {
		return ' between ' + options.min + ' and ' + options.max;
	} else if (options.min) {
		return ' greater than or equal to ' + options.min;
	} else if (options.max) {
		return ' less than or equal to ' + options.max;
	}
	return '';
}

/**
 * @see https://github.com/chriso/validator.js
 */
function validate(name, value) {
	load(name);
	var opts = options(name);

	// Check if we have any validators
	if (!opts.validators) {
		return true;
	}

	// Force all validators into objects
	var validators = opts.validators.map(function (validatorConfig) {
		var t = typeof validatorConfig === 'undefined' ? 'undefined' : _typeof(validatorConfig);

		if ('string' === t) {
			validatorConfig = {
				name: validatorConfig,
				options: null
			};
		} else if ('object' !== t || !('name' in validatorConfig)) {
			throw new Error('Invalid validatorConfig configuration: ' + JSON.stringify(validatorConfig));
		}

		return validatorConfig;
	});

	// Run validators a build array of errors
	var errors = validators.reduce(function (errors, _ref) {
		var name = _ref.name;
		var options = _ref.options;

		switch (name) {
			case 'contains':
				validateOptions(name, options, 'string');
				if (!_validator2.default.contains(value, options)) {
					errors.push('Must contain the string "' + options + '"');
				}
				break;

			case 'equals':
				validateOptions(name, options, 'string');
				if (!_validator2.default.equals(value, options)) {
					errors.push('Must be set to "' + options + '"');
				}
				break;

			case 'before':
			case 'after':
				validateOptions(name, options, 'string');
				if (!_validator2.default.isDate(options)) {
					throw new Error('The "' + name + '" validator expects its options to be a valid date, but "' + value + '" supplied');
				}

				if ('after' === name) {
					if (!_validator2.default.isAfter(value, new Date(options))) {
						errors.push('Must be set to a date after ' + options);
					}
				} else if ('before' === name) {
					if (!_validator2.default.isBefore(value, new Date(options))) {
						errors.push('Must be set to a date before ' + options);
					}
				}
				break;

			case 'alpha':
				if (!_validator2.default.isAlpha(value)) {
					errors.push('Must be alpha characters only (a-z)');
				}
				break;

			case 'alphanumeric':
				if (!_validator2.default.isAlphanumeric(value)) {
					errors.push('Must be alphanumeric characters only');
				}
				break;

			case 'ascii':
				if (!_validator2.default.isAscii(value)) {
					errors.push('Must be ASCII characters only');
				}
				break;

			case 'base64':
				if (!_validator2.default.isBase64(value)) {
					errors.push('Must be a base64-encoded string');
				}
				break;

			case 'boolean':
				if (!_validator2.default.isBoolean(value)) {
					errors.push('Must be a boolean (true, false, 1, or 0)');
				}
				break;

			case 'date':
				if (!_validator2.default.isDate(value)) {
					errors.push('Must be a date');
				}
				break;

			case 'decimal':
				if (!_validator2.default.isDecimal(value)) {
					errors.push('Must be a decimal number');
				}
				break;

			case 'fqdn':
				if (!_validator2.default.isFQDN(value, options)) {
					errors.push('Must be a fully qualified domain name');
				}
				break;

			case 'float':
				if (!_validator2.default.isFloat(value, options)) {
					errors.push('Must be a floating point number' + minMaxMessage(options));
				}
				break;

			case 'hex-color':
				if (!_validator2.default.isHexColor(value)) {
					errors.push('Must be a HEX color');
				}
				break;

			case 'hexadecimal':
				if (!_validator2.default.isHexadecimal(value)) {
					errors.push('Must be a hexadecimal number');
				}
				break;

			case 'ip4':
			case 'ip6':
			case 'ip':
				if (!options) {
					var versionMatch = name.match(/(\d)$/);
					if (versionMatch) {
						options = parseInt(versionMatch[1], 10);
					}
				}
				if (!_validator2.default.isIP(value, options)) {
					errors.push('Must be an IP address' + (options ? ' (version ' + options + ')' : ''));
				}
				break;

			case 'iso8601':
				if (!_validator2.default.isISO8601(value)) {
					errors.push('Must be an ISO8601-formatted date');
				}
				break;

			case 'enum':
			case 'in':
				validateOptions(name, options, 'array');
				if (!_validator2.default.isIn(value, options)) {
					errors.push('Must be on of: "' + options.join('", "') + '"');
				}
				break;

			case 'int':
				if (!_validator2.default.isInt(value, options)) {
					errors.push('Must be an integer' + minMaxMessage(options));
				}
				break;

			case 'json':
				if (!_validator2.default.isJSON(value)) {
					errors.push('Must be JSON');
				}
				break;

			case 'length':
				validateOptions(name, options, 'object');
				if (!options.min && !options.max) {
					throw new Error('The "' + name + '" validator requires a "min" or a "max" option');
				}

				var min = options.min || 0;
				var max = options.max || undefined;

				if (!_validator2.default.isLength(value, min, max)) {
					errors.push('Must have a character length' + minMaxMessage(options));
				}
				break;

			case 'lowercase':
				if (!_validator2.default.isLowercase(value)) {
					errors.push('Must be lower case');
				}
				break;

			case 'mac-address':
				if (!_validator2.default.isMACAddress(value)) {
					errors.push('Must be a MAC address');
				}
				break;

			case 'numeric':
				if (!_validator2.default.isNumeric(value)) {
					errors.push('Must be numeric');
				}
				break;

			case 'url':
				if (!_validator2.default.isURL(value, options)) {
					errors.push('Must be a URL');
				}
				break;

			case 'uuid3':
			case 'uuid4':
			case 'uuid5':
			case 'uuid':
				if (!options) {
					var versionMatch = name.match(/(\d)$/);
					if (versionMatch) {
						options = parseInt(versionMatch[1], 10);
					}
				}
				if (!_validator2.default.isUUID(value, options)) {
					errors.push('Must be a UUID' + (options ? ' (version ' + options + ')' : ''));
				}
				break;

			case 'uppercase':
				if (!_validator2.default.isUppercase(value)) {
					errors.push('Must be upper case');
				}
				break;

			case 'regex':
			case 'regexp':
			case 'matches':
				if ('string' === typeof options) {
					options = [options];
				}
				validateOptions(name, options, 'array');

				var res;
				if (1 === options.length) {
					res = _validator2.default.matches(value, options[0]);
				} else if (2 === options.length) {
					res = _validator2.default.matches(value, options[0], options[1]);
				}
				if (!res) {
					errors.push('Must match the regular expression /' + options[0] + '/' + options[1]);
				}
				break;
		}

		return errors;
	}, []);

	return errors;
}

// Run checks
function check() {
	var pretty = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

	try {
		load();
	} catch (e) {

		if (false === pretty || e.toString().indexOf('SyntaxError') !== -1) {
			throw e;
		}

		var pkg = require('../package.json');
		console.error("\n" + (0, _wrapAnsi2.default)(_chalk.bgRed.white('ERROR:') + ' Unable to load ' + (0, _chalk.blue)(filename) + '; see ' + (0, _chalk.underline)(pkg.homepage), _windowSize.width) + "\n");
		process.exit(1);
	}

	var required = [];
	var optional = [];
	var validationErrors = [];

	for (var name in config) {
		debug('Checking for variable ' + name);

		// Load opts
		var opts = options(name);

		// Check if variable is set
		if (name in process.env) {
			debug('Found variable ' + name);
			var errors = validate(name, process.env[name]);
			if (errors.length) {
				if (false === pretty) {
					var err = new Error('Environmental variable "' + name + '" did not pass validation');
					err.validationMessages = errors;
					throw err;
				}
				validationErrors.push({ name: name, errors: errors });
			}
			continue;
		}

		// Check if default is set
		if (opts.default) {
			debug('Setting ' + name + ' to ' + JSON.stringify(opts.default));
			process.env[name] = opts.default;
			optional.push(name);
			continue;
		}

		// Check if variable is set as optional
		if (false === opts.required) {
			debug(name + ' is optional');
			optional.push(name);
			continue;
		}

		debug(name + ' is required and missing');
		required.push(name);
		if (false === pretty) {
			throw new Error('Environmental variable "' + name + '" must be set'); // FIXME
		}
	}

	if (true === pretty && (required.length || validationErrors.length || optional.length)) {
		console.error('');
		if (required.length) {
			header(required.length, 'required');
			required.forEach(function (name) {
				console.error(help(name));
			});
		}
		if (validationErrors.length) {
			header(validationErrors.length, 'invalid');
			validationErrors.forEach(function (_ref2) {
				var name = _ref2.name;
				var errors = _ref2.errors;

				console.error(help(name, errors));
			});
		}
		if (optional.length) {
			if (required.length) {
				console.error('');
			}
			header(optional.length, 'missing (but optional)');
			optional.forEach(function (name) {
				console.error(help(name));
			});
		}
		console.error('');
	}

	debug('Required missing: ' + required.length);
	if (required.length || validationErrors.length) {
		process.exit(1);
	}
}

// Print header
function header(count, adv) {
	var s = 1 === count ? '' : 's';
	var is = 1 === count ? 'is' : 'are';
	var message = ' The following ' + count + ' environmental variable' + s + ' ' + is + ' ' + adv + ': ';
	console.error((0, _wrapAnsi2.default)(/optional/.test(adv) ? _chalk.bgYellow.white(message) : _chalk.bgRed.black(message), _windowSize.width));
}

// Get formatted help for variable
function help(name, errors) {
	load(name);

	var opts = options(name);
	var help = (0, _chalk.blue)(name);

	if (opts.default) {
		help += (0, _chalk.yellow)(' (default=' + opts.default + ')');
	}

	if (opts.description) {
		help += ' ' + opts.description;
	}

	if (errors && errors.length) {
		errors.forEach(function (error) {
			help += '\n  - ' + error;
		});
	}

	return (0, _wrapAnsi2.default)(help, _windowSize.width);
}