'use strict';

module.exports = function() {
	// Figure out what to load
	var dir = (process.env.TEST_SRC ? 'src' : 'dist');
	var path = __dirname + '/../' + dir + '/index'; 

	if (process.env.TEST_SRC) {
		require("babel-register");
	}

	// Purge cache if necessary
	var key = require.resolve(path);
	if (key in require.cache) {
		delete require.cache[key];
	}

	return key;
}