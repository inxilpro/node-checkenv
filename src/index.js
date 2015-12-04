'use strict';

// Load dependencies
import { resolve, dirname, sep } from 'path';
import fs from 'fs';
import { width } from 'window-size';
import wrap from 'wrap-ansi';
import { underline, blue, yellow, bgRed, bgYellow } from 'chalk';

// Cached config object
var config;

// Filename is configurable
var filename = 'env.json';

// Default config
const defaultOpts = {
	'required': true,
	'description': null,
	'default': null,
	'type': null,
	'regex': null,
	'enum': null
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
export function load() {
	if (!config) {
		const path = scan();
		config = require(path);
	}
	return config;
}

// Run checks
export function check(pretty = true) {
	try {
		load();
	} catch (e) {
		if (false === pretty) {
			throw e;
		}

		const pkg = require('../package.json');
		console.error("\n" + wrap(bgRed.white('ERROR:') + ' ' + blue(filename) + ' is missing; see ' + underline(pkg.homepage), width) + "\n");
		process.exit(1);
	}
	
	let required = [];
	let optional = [];

	for (var name in config) {
		debug(`Checking for variable ${name}`);

		// Check if variable is set
		if (name in process.env) {
			debug(`Found variable ${name}`);
			continue;
		}

		// Build opts
		const userOpts = ('object' === typeof config[name] ? config[name] : { 'required': (false !== config[name]) });
		const opts = {
			...defaultOpts,
			...userOpts
		};

		// Check if default is set
		if (opts.default) {
			debug(`Setting ${name} to ${JSON.stringify(opts.default)}`);
			process.env[name] = opts.default;
			continue;
		}

		/*
		const defaultConfig = {
			'required': true,
			'description': null,
			'default': null,
			'type': null,
			'regex': null,
			'enum': null
		};
		*/

		// Check if variable is set as optional
		if (false === opts.required) {
			debug(`${name} is optional`);
			optional.push(name);
			continue;
		}

		debug(`${name} is required and missing`);
		required.push(name);
		if (false === pretty) {
			throw new Error(`Environmental variable "${name}" must be set`);
		}
	}

	if (true === pretty && (required.length || optional.length)) {
		console.error('');
		if (required.length) {
			header(required.length, true);
			required.forEach(name => {
				console.error(help(name));
			});
		}
		if (optional.length) {
			if (required.length) {
				console.error('');
			}
			header(optional.length, false);
			optional.forEach(name => {
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
function header(count, required = true) {
	const s = (1 === count ? '' : 's');
	const is = (1 === count ? 'is' : 'are');
	const adv = (required ? 'required' : 'missing (but optional)');
	let message = ` The following ${count} environmental variable${s} ${is} ${adv}: `;
	console.error(wrap((required ? bgRed.white(message) : bgYellow.black(message)), width));
}

// Get formatted help for variable
export function help(name)
{
	load();
	if (!(name in config)) {
		throw new Error(`No configuration for "${name}"`);
	}

	let help = blue(name);

	if ('object' === typeof config[name] && 'description' in config[name]) {
		help += " " + wrap(config[name].description, width);
	}

	return help;
}

