'use strict';

var tape = require('tape');	
var checkenv = require(require('../loader')());
var spy = require('../spy.js');

tape('WHEN AN ALTERNATE FILENAME IS PROVIDED:', function(s) {
	s.test('load()', function(t) {
		t.plan(1);
		spy.setup();

		checkenv.setFilename('environment.json');
		
		spy.reset();
		t.doesNotThrow(function() {
			checkenv.load();
		}, 'should find the renamed file');

		spy.restore();
	});
});