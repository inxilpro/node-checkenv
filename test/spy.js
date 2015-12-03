'use strict';

var originalExit = process.exit;
var originalError = console.error;

var exitCount = 0;
var lastExitCode = null;
var errorCount = 0;
var errorMessages = [];
var managedVars = [];

exports.setup = function() {
	process.exit = function(code) {
		exitCount++;
		lastExitCode = code;
	};

	console.error = function(message) {
		errorCount++;
		errorMessages.push(message);
	}
};

exports.reset = function(vars) {
	exitCount = 0;
	lastExitCode = null;
	errorCount = 0;
	errorMessages = [];

	// Handle setting and unsetting variables
	var key;

	// Delete any existing managed keys
	managedVars.forEach(function(key, idx) {
		if (key in process.env) {
			delete process.env[key];
		}
	});
	managedVars = [];

	if (Array.isArray(vars)) {
		vars.forEach(function(key) {
			managedVars.push(key);
			process.env[key] = true;
		});
	}
};

exports.restore = function() {
	process.exit = originalExit;
	exports.reset();
};

exports.exitCount = function() {
	return exitCount;
};

exports.lastExitCode = function() {
	return lastExitCode;
};

exports.errorCount = function() {
	return errorCount;
};

exports.errorMessages = function() {
	return errorMessages;
};
