'use strict';

var originalExit = process.exit;
var originalError = console.error;

var exitCount = 0;
var lastExitCode = null;
var errorCount = 0;
var errorMessages = [];

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

exports.reset = function() {
	exitCount = 0;
	lastExitCode = null;
	errorCount = 0;
	errorMessages = [];
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
