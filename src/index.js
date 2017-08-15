'use strict';

// Load dependencies
import { resolve, dirname, sep } from 'path';
import fs from 'fs';
import { width } from 'window-size';
import wrap from 'wrap-ansi';
import { underline, blue, yellow, bgRed, bgYellow } from 'chalk';
import validator from 'validator';

// Cached config object
var config;

// Filename is configurable
var filename = 'env.json';

// Default config
const defaultOpts = {
	'required': true,
	'description': null,
	'default': null,
	'validators': []
};

// Debugger
var debug = () => {};
if ('NODE_DEBUG' in process.env && /\bcheckenv\b/i.test(process.env.NODE_DEBUG)) {
	debug = message => console.log(yellow(`DEBUG: ${message}`));
}

// Backwards-compat file exists checker
function access(path) {
	try {
		debug(`Looking for ${path}`);
		if ('accessSync' in fs) {
			fs.accessSync(path, fs.R_OK);
		} else {
			fs.closeSync(fs.openSync(path, 'r'));
		}
		debug(`Found ${path}`);
		return true;
	} catch (e) {
		debug(e.message);
		return false;
	}
}

// Load options, including defaults, for a variable
export function options(name) {
	load(name);

	// Build opts
	const userOpts = ('object' === typeof config[name] ? config[name] : { 'required': (false !== config[name]) });
	return {
		...defaultOpts,
		...userOpts
	};
}

export function setConfig(newConfig) {
	config = newConfig;
}

export function setFilename(newFilename) {
	filename = newFilename;
}

// Scans directory tree for env.json
export function scan() {
	var current;
	var next = dirname(resolve(module.parent.filename));
	while (next !== current) {
		current = next;
		const path = resolve(current, filename);
		if (access(path)) {
			return path;
		}
		next = resolve(current, '..');
	}

	throw new Error(`${filename} not found anywhere in the current directory tree`);
}

// Loads config from found env.json
export function load(name) {
	if (!config) {
		const path = scan();
		config = require(path);
	}

	if (name && !(name in config)) {
		throw new Error(`No configuration for "${name}"`);
	}

	return config;
}

function validateOptions(name, options, expectedType = 'object') {
	const actualType = (Array.isArray(options) ? 'array' : typeof options);
	if (expectedType !== actualType) {
		throw new Error(`The "${name}" validator expects options to be passed as an ${expectedType}, ${actualType} received instead`);
	}
}

function minMaxMessage(options) {
	if (!options || 'object' !== typeof options) {
		return '';
	}

	if (options.min && options.max) {
		return ` between ${options.min} and ${options.max}`;
	} else if (options.min) {
		return ` greater than or equal to ${options.min}`;
	} else if (options.max) {
		return ` less than or equal to ${options.max}`;
	}
	return '';
}

/**
 * @see https://github.com/chriso/validator.js
 */
export function validate(name, value) {
	load(name);
	const opts = options(name);

	// Check if we have any validators
	if (!opts.validators) {
		return true;
	}

	// Force all validators into objects
	const validators = opts.validators.map(validatorConfig => {
		const t = typeof validatorConfig;

		if ('string' === t) {
			validatorConfig = {
				name: validatorConfig,
				options: null
			};
		} else if ('object' !== t || !('name' in validatorConfig)) {
			throw new Error(`Invalid validatorConfig configuration: ${JSON.stringify(validatorConfig)}`);
		}

		return validatorConfig;
	});

	// Run validators a build array of errors
	const errors = validators.reduce((errors, {name, options}) => {
		switch (name) {
			case 'contains':
				validateOptions(name, options, 'string');
				if (!validator.contains(value, options)) {
					errors.push(`Must contain the string "${options}"`);
				}
				break;

			case 'equals':
				validateOptions(name, options, 'string');
				if (!validator.equals(value, options)) {
					errors.push(`Must be set to "${options}"`);
				}
				break;

			case 'before':
			case 'after':
				validateOptions(name, options, 'string');
				if (!validator.isDate(options)) {
					throw new Error(`The "${name}" validator expects its options to be a valid date, but "${value}" supplied`);
				}

				if ('after' === name) {
					if (!validator.isAfter(value, new Date(options))) {
						errors.push(`Must be set to a date after ${options}`);
					}
				} else if ('before' === name) {
					if (!validator.isBefore(value, new Date(options))) {
						errors.push(`Must be set to a date before ${options}`);
					}
				}
				break;

			case 'alpha':
				if (!validator.isAlpha(value)) {
					errors.push('Must be alpha characters only (a-z)');
				}
				break;

			case 'alphanumeric':
				if (!validator.isAlphanumeric(value)) {
					errors.push('Must be alphanumeric characters only');
				}
				break;

			case 'ascii':
				if (!validator.isAscii(value)) {
					errors.push('Must be ASCII characters only');
				}
				break;

			case 'base64':
				if (!validator.isBase64(value)) {
					errors.push('Must be a base64-encoded string');
				}
				break;

			case 'boolean':
				if (!validator.isBoolean(value)) {
					errors.push('Must be a boolean (true, false, 1, or 0)');
				}
				break;

			case 'date':
				if (!validator.isDate(value)) {
					errors.push('Must be a date');
				}
				break;

			case 'decimal':
				if (!validator.isDecimal(value)) {
					errors.push('Must be a decimal number');
				}
				break;

			case 'fqdn':
				if (!validator.isFQDN(value, options)) {
					errors.push('Must be a fully qualified domain name');
				}
				break;

			case 'float':
				if (!validator.isFloat(value, options)) {
					errors.push('Must be a floating point number' + minMaxMessage(options));
				}
				break;

			case 'hex-color':
				if (!validator.isHexColor(value)) {
					errors.push('Must be a HEX color');
				}
				break;

			case 'hexadecimal':
				if (!validator.isHexadecimal(value)) {
					errors.push('Must be a hexadecimal number');
				}
				break;

			case 'ip4':
			case 'ip6':
			case 'ip':
				if (!options) {
					const versionMatch = name.match(/(\d)$/);
					if (versionMatch) {
						options = parseInt(versionMatch[1], 10);
					}
				}
				if (!validator.isIP(value, options)) {
					errors.push('Must be an IP address' + (options ? ` (version ${options})` : ''));
				}
				break;

			case 'iso8601':
				if (!validator.isISO8601(value)) {
					errors.push('Must be an ISO8601-formatted date');
				}
				break;

			case 'enum':
			case 'in':
				validateOptions(name, options, 'array');
				if (!validator.isIn(value, options)) {
					errors.push('Must be on of: "' + options.join('", "') + '"');
				}
				break;

			case 'int':
				if (!validator.isInt(value, options)) {
					errors.push('Must be an integer' + minMaxMessage(options));
				}
				break;

			case 'json':
				if (!validator.isJSON(value)) {
					errors.push('Must be JSON');
				}
				break;

			case 'length':
				validateOptions(name, options, 'object');
				if (!options.min && !options.max) {
					throw new Error(`The "${name}" validator requires a "min" or a "max" option`);
				}

				var min = options.min || 0;
				var max = options.max || undefined;

				if (!validator.isLength(value, min, max)) {
					errors.push('Must have a character length' + minMaxMessage(options));
				}
				break;

			case 'lowercase':
				if (!validator.isLowercase(value)) {
					errors.push('Must be lower case');
				}
				break;

			case 'mac-address':
				if (!validator.isMACAddress(value)) {
					errors.push('Must be a MAC address');
				}
				break;

			case 'numeric':
				if (!validator.isNumeric(value)) {
					errors.push('Must be numeric');
				}
				break;

			case 'url':
				if (!validator.isURL(value, options)) {
					errors.push('Must be a URL');
				}
				break;

			case 'uuid3':
			case 'uuid4':
			case 'uuid5':
			case 'uuid':
				if (!options) {
					const versionMatch = name.match(/(\d)$/);
					if (versionMatch) {
						options = parseInt(versionMatch[1], 10);
					}
				}
				if (!validator.isUUID(value, options)) {
					errors.push('Must be a UUID' + (options ? ` (version ${options})` : ''));
				}
				break;

			case 'uppercase':
				if (!validator.isUppercase(value)) {
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
					res = validator.matches(value, options[0]);
				} else if (2 === options.length) {
					res = validator.matches(value, options[0], options[1]);
				}
				if (!res) {
					errors.push(`Must match the regular expression /${options[0]}/${options[1]}`);
				}
				break;
		}

		return errors;
	}, []);

	return errors;
}

// Run checks
export function check(pretty = true) {
	try {
		load();
	} catch (e) {

		if (false === pretty || e.toString().indexOf('SyntaxError') !== -1) {
			throw e;
		}

		const pkg = require('../package.json');
		console.error("\n" + wrap(bgRed.white('ERROR:') + ' Unable to load ' + blue(filename) + '; see ' + underline(pkg.homepage), width) + "\n");
		process.exit(1);
	}

	let required = [];
	let optional = [];
	let validationErrors = [];

	for (var name in config) {
		debug(`Checking for variable ${name}`);

		// Load opts
		const opts = options(name);

		// Check if variable is set
		if (name in process.env) {
			debug(`Found variable ${name}`);
			const errors = validate(name, process.env[name]);
			if (errors.length) {
				if (false === pretty) {
					var err = new Error(`Environmental variable "${name}" did not pass validation`);
					err.validationMessages = errors;
					throw err;
				}
				validationErrors.push({ name, errors });
			}
			continue;
		}

		// Check if default is set
		if (opts.default != null) {
			debug(`Setting ${name} to ${JSON.stringify(opts.default)}`);
			process.env[name] = opts.default;
			optional.push(name);
			continue;
		}

		// Check if variable is set as optional
		if (false === opts.required) {
			debug(`${name} is optional`);
			optional.push(name);
			continue;
		}

		debug(`${name} is required and missing`);
		required.push(name);
		if (false === pretty) {
			throw new Error(`Environmental variable "${name}" must be set`); // FIXME
		}
	}

	if (true === pretty && (required.length || validationErrors.length || optional.length)) {
		console.error('');
		if (required.length) {
			header(required.length, 'required');
			required.forEach(name => {
				console.error(help(name));
			});
		}
		if (validationErrors.length) {
			header(validationErrors.length, 'invalid');
			validationErrors.forEach(({ name, errors}) => {
				console.error(help(name, errors));
			});
		}
		if (optional.length) {
			if (required.length) {
				console.error('');
			}
			header(optional.length, 'missing (but optional)');
			optional.forEach(name => {
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
	const s = (1 === count ? '' : 's');
	const is = (1 === count ? 'is' : 'are');
	let message = ` The following ${count} environmental variable${s} ${is} ${adv}: `;
	console.error(wrap((/optional/.test(adv) ? bgYellow.white(message) : bgRed.black(message)), width));
}

// Get formatted help for variable
export function help(name, errors)
{
	load(name);

	const opts = options(name);
	let help = blue(name);

	if (opts.default) {
		help += yellow(` (default=${opts.default})`);
	}

	if (opts.description) {
		help += ` ${opts.description}`;
	}

	if (errors && errors.length) {
		errors.forEach(error => {
			help += `\n  - ${error}`;
		});
	}

	return wrap(help, width);
}

