'use strict'

// Load dependencies
;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.options = options;
exports.setFilename = setFilename;
exports.scan = scan;
exports.load = load;
exports.check = check;
exports.help = help;

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _windowSize = require('window-size');

var _wrapAnsi = require('wrap-ansi');

var _wrapAnsi2 = _interopRequireDefault(_wrapAnsi);

var _chalk = require('chalk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

// Cached config object
var config;

// Filename is configurable
var filename = 'env.json';

// Default config
var defaultOpts = {
	'required': true,
	'description': null,
	'default': null,
	'type': null,
	'regex': null,
	'enum': null
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
	load();

	if (!(name in config)) {
		throw new Error('No configuration for "' + name + '"');
	}

	// Build opts
	var userOpts = 'object' === _typeof(config[name]) ? config[name] : { 'required': false !== config[name] };
	return _extends({}, defaultOpts, userOpts);
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
function load() {
	if (!config) {
		var path = scan();
		config = require(path);
	}
	return config;
}

// Run checks
function check() {
	var pretty = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

	try {
		load();
	} catch (e) {
		if (false === pretty) {
			throw e;
		}

		var pkg = require('../package.json');
		console.error("\n" + (0, _wrapAnsi2.default)(_chalk.bgRed.white('ERROR:') + ' ' + (0, _chalk.blue)(filename) + ' is missing; see ' + (0, _chalk.underline)(pkg.homepage), _windowSize.width) + "\n");
		process.exit(1);
	}

	var required = [];
	var optional = [];

	for (var name in config) {
		debug('Checking for variable ' + name);

		// Load opts
		var opts = options(name);

		// Check if variable is set
		if (name in process.env) {
			debug('Found variable ' + name);
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
			throw new Error('Environmental variable "' + name + '" must be set');
		}
	}

	if (true === pretty && (required.length || optional.length)) {
		console.error('');
		if (required.length) {
			header(required.length, true);
			required.forEach(function (name) {
				console.error(help(name));
			});
		}
		if (optional.length) {
			if (required.length) {
				console.error('');
			}
			header(optional.length, false);
			optional.forEach(function (name) {
				console.error(help(name));
			});
		}
		console.error('');
	}

	debug('Required missing: ' + required.length);
	if (required.length) {
		process.exit(1);
	}
}

// Print header
function header(count) {
	var required = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

	var s = 1 === count ? '' : 's';
	var is = 1 === count ? 'is' : 'are';
	var adv = required ? 'required' : 'missing (but optional)';
	var message = ' The following ' + count + ' environmental variable' + s + ' ' + is + ' ' + adv + ': ';
	console.error((0, _wrapAnsi2.default)(required ? _chalk.bgRed.white(message) : _chalk.bgYellow.black(message), _windowSize.width));
}

// Get formatted help for variable
function help(name) {
	load();

	if (!(name in config)) {
		throw new Error('No configuration for "' + name + '"');
	}

	var opts = options(name);
	var help = (0, _chalk.blue)(name);

	if (opts.default) {
		help += (0, _chalk.yellow)(' (default=' + opts.default + ')');
	}

	if (opts.description) {
		help += ' ' + opts.description;
	}

	return (0, _wrapAnsi2.default)(help, _windowSize.width);
}