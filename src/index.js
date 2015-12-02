'use strict';

// Load dependencies
import { resolve, sep } from 'path';
import { accessSync, R_OK } from 'fs';
import { width } from 'window-size';
import wrap from 'wrap-ansi';
import { underline, blue, bgRed, bgYellow } from 'chalk';

// Flag for whether header has been sent
var headerSent = false;

// Cached config object
var config;

// Filename is configurable
export var filename = 'env.json';

// Scans directory tree for env.json
export function scan() {
	var current;
	var next = resolve(module.parent.filename);
	while (next !== current) {
		current = next;
		const path = resolve(current, filename);
		try {
			accessSync(path, R_OK);
			return path;
		} catch (e) {}
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
		if (!pretty) {
			throw e;
		}

		const pkg = require('../package.json');
		console.log("\n" + wrap(bgRed.white('ERROR:') + ' ' + blue(filename) + ' is missing; see ' + underline(pkg.homepage), width) + "\n");
		process.exit(1);
	}
	
	let missing = { required: [], optional: [] };

	Object.keys(config).forEach(name => {
		// Check if variable is set
		if (name in process.env) {
			return;
		}

		const opts = config[name];

		// Check if variable is set as optional
		const alternateOptional = ('object' !== typeof opts && !opts);
		const formalOptional = (!alternateOptional && ('object' === typeof opts && 'required' in opts && false === opts.required));
		if (alternateOptional || formalOptional) {
			missing.optional.push(name);
			return;
		}

		missing.required.push(name);
		if (!pretty) {
			throw new Error(`Environmental variable "${name}" must be set`);
		}
	});

	if (pretty) {
		console.log();
		if (missing.required.length) {
			header(missing.required.length, true);
			missing.required.forEach(name => {
				console.log(help(name));
			});
		}
		if (missing.optional.length) {
			if (missing.required.length) {
				console.log();
			}
			header(missing.optional.length, false);
			missing.optional.forEach(name => {
				console.log(help(name));
			});
		}
		console.log();
		process.exit(1);
	}
}

// Print header
function header(count, required = true) {
	const s = (1 === count ? '' : 's');
	const is = (1 === count ? 'is' : 'are');
	const adv = (required ? 'required' : 'missing (but optional)');
	let message = ` The following ${count} environmental variable${s} ${is} ${adv}: `;
	console.log(wrap((required ? bgRed.white(message) : bgYellow.black(message)), width));
}

// Get formatted help for variable
export function help(name)
{
	load();
	if (!name in config) {
		throw new Error(`No configuration for "${name}"`);
	}

	let help = blue(name);

	if ('object' === typeof config[name] && 'description' in config[name]) {
		help += " " + wrap(config[name].description, width);
	}

	return help;
}

