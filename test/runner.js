'use strict';

var glob = require('glob');
var child_process = require('child_process');
var code = 0;

var command = 'node';
var srcdir = 'dist';
if (process.env.TEST_SRC) {
	command = 'babel-node';
	srcdir = 'src';
}

glob(__dirname + '/*/*.js', function(err, files) {
	files.forEach(function(file) {
		console.log('# Running ' + file);
		var res = child_process.spawnSync(command, [file, srcdir], {
			stdio: [0, 1, 2]
		});
		if (res.status > 0) {
			code = 1;
			console.log('not ok - Error running ' + file);
		}
	});
	process.exit(code);
});